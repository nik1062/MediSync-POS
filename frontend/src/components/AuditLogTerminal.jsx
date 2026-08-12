import React, { useState, useEffect, useRef } from 'react';

const LOG_ROTATIONS = [
  "[10:28:14] SECURE_LOG: Doctor ID #042 signed PrescriptionItem for Amoxicillin 500mg. Auth Token Verified.",
  "[10:29:02] WARN_GATE: Cashier attempted checkout of Schedule H1 Drug without linked Rx. POS block enforced.",
  "[10:29:03] AUDIT_TRAIL: Immutable log appended to ledger for Tenant ID #009 (Midtown Branch).",
  "[10:30:11] SECURE_LOG: Broadcasted real-time WebSocket vital relay for Consultation Room #102.",
  "[10:31:45] DB_ENGINE: Released row lock on Product ID #889 (Saline Solution). Inventory decremented."
];

export function AuditLogTerminal() {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    let currentIndex = 0;
    
    // Add first log immediately
    setLogs([LOG_ROTATIONS[0]]);
    currentIndex++;

    const addLog = () => {
      setLogs(prev => {
        const newLogs = [...prev, LOG_ROTATIONS[currentIndex % LOG_ROTATIONS.length]];
        // Keep only last 20 logs to prevent memory leaks
        return newLogs.slice(-20);
      });
      currentIndex++;

      // Schedule next log at random interval between 1.5s and 3s
      const nextInterval = Math.random() * 1500 + 1500;
      timeoutId = setTimeout(addLog, nextInterval);
    };

    let timeoutId = setTimeout(addLog, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (bottomRef.current && bottomRef.current.parentElement) {
      const container = bottomRef.current.parentElement;
      container.scrollTop = container.scrollHeight;
    }
  }, [logs]);

  return (
    <div style={{
      background: '#020617', // slate-950
      borderRadius: '12px',
      border: '1px solid #1e293b', // slate-800
      overflow: 'hidden',
      marginTop: '32px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      fontFamily: '"Fira Code", "Courier New", Courier, monospace',
      display: 'flex',
      flexDirection: 'column',
      height: '240px'
    }}>
      {/* Terminal Header */}
      <div style={{
        background: '#0f172a', // slate-900
        padding: '12px 16px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#94a3b8' // slate-400
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          <span style={{ fontWeight: 600, letterSpacing: '1px' }}>● LEDGER STREAM ACTIVE</span>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: .5; }
            }
          `}</style>
        </div>
        <div style={{ fontFamily: 'monospace' }}>[Block: #74921-A]</div>
      </div>

      {/* Terminal Body */}
      <div style={{
        padding: '16px',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {logs.map((log, i) => {
          // Syntax highlighting logic
          const timeMatch = log.match(/^\[(.*?)\]/);
          const typeMatch = log.match(/\] (.*?):/);
          
          let logColor = '#e2e8f0'; // default slate-200
          if (log.includes('WARN_GATE')) logColor = '#f59e0b'; // amber-500
          if (log.includes('AUDIT_TRAIL')) logColor = '#10b981'; // emerald-500
          if (log.includes('DB_ENGINE')) logColor = '#3b82f6'; // blue-500

          return (
            <div key={i} style={{ fontSize: '13px', lineHeight: '1.5', color: '#94a3b8' }}>
              <span style={{ color: '#64748b' }}>{timeMatch ? `[${timeMatch[1]}]` : ''}</span>{' '}
              <span style={{ color: logColor, fontWeight: 700 }}>{typeMatch ? typeMatch[1] + ':' : ''}</span>{' '}
              <span style={{ color: '#cbd5e1' }}>{log.split(': ').slice(1).join(': ')}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
