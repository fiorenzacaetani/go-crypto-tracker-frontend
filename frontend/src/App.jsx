import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:8080';

function App() {
  const [history, setHistory] = useState([]);
  const [average, setAverage] = useState(0);
  const [priceDirection, setPriceDirection] = useState('neutral');// 'up', 'down', 'neutral'

  const fetchData = async () => {
    try {
      const avgRes = await axios.get(`${API_BASE_URL}/average`);
      const newAverage = avgRes.data["average price"];

      // Usiamo direttamente lo stato 'average' per il confronto
    setPriceDirection(() => {
      if (average === 0) return 'neutral'; // Evitiamo il primo salto dal nulla
      if (newAverage > average) return 'up';
      if (newAverage < average) return 'down';
      return 'neutral';
    });

      setAverage(newAverage);

      const histRes = await axios.get(`${API_BASE_URL}/history?limit=90`);
      // Recharts ha bisogno di dati dal più vecchio al più nuovo
      const sortedData = [...histRes.data.history].reverse().map(item => ({
        ...item,
        price: Number(item.price) // Assicuriamoci che sia un numero
      }));
      setHistory(sortedData);
    } catch (err) {
      console.error("Errore nel recupero dati:", err);
    }
  };

  // Funzione per decidere il colore in base alla direzione
  const getStatusColor = () => {
    if (priceDirection === 'up') return '#22c55e'; // Verde
    if (priceDirection === 'down') return '#ef4444'; // Rosso
    return '#94a3b8'; // Grigio (neutrale)
  };

  const getArrow = () => {
    if (priceDirection === 'up') return '▲';
    if (priceDirection === 'down') return '▼';
    return '•';
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    // Risoluzione Punto 1 & 2: Sfondo scuro professionale e centratura
    <div style={{ 
      padding: '40px 20px', 
      fontFamily: 'Inter, system-ui, sans-serif', 
      backgroundColor: '#0f172a', // Sfondo Slate scuro
      color: '#f8fafc',           // Testo quasi bianco per contrasto
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center' 
    }}>
      
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#38bdf8' }}>
        <span style={{ 
  display: 'inline-block', 
  transform: 'scaleX(-1)', // specchoiatura
  color: '#f7931a' // Il classico arancione Bitcoin
}}>
  &#8383;
</span><span style={{ 
  display: 'inline-block', 
  color: '#f7931a' // Il classico arancione Bitcoin
}}>
  &#8383;
</span> Bitcoin Tracker Real-Time 
        </h1>

        {/* Card Media con Indicatore Dinamico */}
        <div style={{ 
                  backgroundColor: '#1e293b', 
                  padding: '25px', 
                  borderRadius: '12px', 
                  marginBottom: '20px', 
                  border: `2px solid ${getStatusColor()}`, // Il bordo cambia colore!
                  textAlign: 'center',
                  transition: 'all 0.5s ease', // Transizione fluida del colore
                  width: '100%'
                }}>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#94a3b8' }}>
                    Media Corrente {getArrow()}
                  </h2>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: 'bold', 
                    color: getStatusColor(), // Anche il testo cambia colore
                    marginTop: '10px' 
                  }}>
                    ${average.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>



        {/* Card Grafico - Risoluzione Punto 3: Altezza fissa esplicita */}
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '25px', 
          borderRadius: '12px', 
          border: '1px solid #334155',
          height: '450px', // Altezza definita per permettere al ResponsiveContainer di funzionare
          width: '100%'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#94a3b8' }}>Trend Prezzi (ultimi 90 rilevamenti)</h3>
          
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="created_at" 
                hide={true} 
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#05293b', border: 'solid 1px #f8fafc', color: '#f8fafc' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#38bdf8" 
                strokeWidth={3} 
                dot={false} 
                isAnimationActive={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;