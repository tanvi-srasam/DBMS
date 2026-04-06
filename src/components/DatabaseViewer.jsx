import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DatabaseViewer = () => {
  const [activeTable, setActiveTable] = useState('patients');
  const [data, setData] = useState({
    patients: [],
    doctors: [],
    appointments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        supabase.from('patients').select('*'),
        supabase.from('doctors').select('*'),
        supabase.from('appointments').select('*')
      ]);

      if (patientsRes.error || doctorsRes.error || appointmentsRes.error) {
        throw new Error('Failed to fetch data from one or more tables.');
      }

      setData({
        patients: patientsRes.data || [],
        doctors: doctorsRes.data || [],
        appointments: appointmentsRes.data || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTable = () => {
    const tableData = data[activeTable];

    if (!tableData || tableData.length === 0) {
      return (
        <div className="empty-state">
          <p>No records found in the {activeTable} table.</p>
        </div>
      );
    }

    const columns = Object.keys(tableData[0]);

    return (
      <div className="table-container" style={{ overflowX: 'auto', marginTop: '1rem', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
              {columns.map(col => (
                <th key={col} style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {col.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                {columns.map(col => (
                  <td key={col} style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="database-viewer" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Database Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View raw table records from the SQLite database.</p>
        </div>
        <button 
          onClick={fetchData} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: '600', 
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={e => e.target.style.backgroundColor = 'var(--primary-dark)'}
          onMouseOut={e => e.target.style.backgroundColor = 'var(--primary)'}
        >
          Refresh Data
        </button>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {['patients', 'doctors', 'appointments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTable(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTable === tab ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
              color: activeTable === tab ? 'var(--primary)' : 'var(--text-secondary)',
              border: activeTable === tab ? '1px solid var(--primary)' : '1px solid transparent',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab} Table ({data[tab]?.length || 0})
          </button>
        ))}
      </div>

      <div className="content">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Loading tables...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>Error: {error}</p>
        ) : (
          renderTable()
        )}
      </div>
    </div>
  );
};

export default DatabaseViewer;
