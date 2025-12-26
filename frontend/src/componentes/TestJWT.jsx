// src/components/TestJWT.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function TestJWT() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(message);
  };

  const getProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      addLog('📤 Enviando petición a /auth/profile...');
      
      const response = await api.get('/auth/profile');
      
      addLog('✅ Petición exitosa!');
      setProfile(response.data.user);
      
    } catch (err) {
      addLog(`❌ Error: ${err.message}`);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const simulateTokenExpiration = () => {
    // Eliminar solo el accessToken, dejar refreshToken
    localStorage.removeItem('accessToken');
    addLog('🧪 AccessToken eliminado manualmente');
    addLog(`🔄 RefreshToken todavía existe: ${localStorage.getItem('refreshToken') ? 'SÍ' : 'NO'}`);
  };

  const clearTokens = () => {
    localStorage.clear();
    addLog('🧹 Todos los tokens eliminados');
  };

  const showCurrentTokens = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    addLog('📋 Tokens actuales:');
    addLog(`  - AccessToken: ${accessToken ? 'PRESENTE' : 'AUSENTE'}`);
    addLog(`  - RefreshToken: ${refreshToken ? 'PRESENTE' : 'AUSENTE'}`);
    
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        addLog(`    Expira: ${new Date(payload.exp * 1000).toLocaleTimeString()}`);
      } catch (e) {
        addLog('    No se pudo decodificar');
      }
    }
  };

  const testRefreshEndpoint = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      addLog('❌ No hay refresh token disponible');
      return;
    }

    try {
      addLog('🔄 Probando endpoint /auth/refresh directamente...');
      const response = await api.post('/auth/refresh', { refreshToken });
      
      addLog('✅ Refresh exitoso!');
      addLog(`   Nuevo accessToken recibido: ${response.data.accessToken ? 'SÍ' : 'NO'}`);
      
      // Actualizar localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
    } catch (err) {
      addLog(`❌ Error en refresh: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔐 Prueba de Sistema JWT</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={getProfile} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          {loading ? 'Cargando...' : 'Obtener Perfil'}
        </button>
        
        <button 
          onClick={simulateTokenExpiration}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: '#ffcc00' }}
        >
          🧪 Simular Token Expirado
        </button>
        
        <button 
          onClick={testRefreshEndpoint}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: '#4CAF50' }}
        >
          🔄 Probar Refresh Directo
        </button>
        
        <button 
          onClick={showCurrentTokens}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          📋 Ver Tokens
        </button>
        
        <button 
          onClick={clearTokens}
          style={{ padding: '10px', backgroundColor: '#f44336', color: 'white' }}
        >
          🧹 Limpiar Todo
        </button>
      </div>

      {profile && (
        <div style={{ 
          background: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3>✅ Perfil Obtenido:</h3>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#ffebee', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px',
          color: '#c62828'
        }}>
          <h3>❌ Error:</h3>
          <p>{error}</p>
        </div>
      )}

      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <h3>📜 Logs:</h3>
        {logs.map((log, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '5px 0',
              borderBottom: '1px solid #ddd',
              fontSize: '12px'
            }}
          >
            {log}
          </div>
        ))}
        {logs.length === 0 && <p>No hay logs aún...</p>}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <h4>📋 Instrucciones de Prueba:</h4>
        <ol>
          <li>Primero inicia sesión normalmente desde la página de login</li>
          <li>Vuelve a esta página para probar</li>
          <li>Presiona "Obtener Perfil" - debería funcionar</li>
          <li>Presiona "Simular Token Expirado" para borrar el accessToken</li>
          <li>Presiona "Obtener Perfil" nuevamente - Debería:
            <ul>
              <li>Detectar error 401</li>
              <li>Llamar automáticamente a /auth/refresh</li>
              <li>Obtener nuevo accessToken</li>
              <li>Reintentar la petición original</li>
              <li>Mostrar el perfil exitosamente</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default TestJWT;