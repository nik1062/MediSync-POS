import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultationAPI } from '../api';

export function ConsultationsList({ user }) {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const { data } = await consultationAPI.getAll();
      const sorted = data.data.sort((a, b) => {
        if (a.urgencyLevel === 'URGENT' && b.urgencyLevel !== 'URGENT') return -1;
        if (b.urgencyLevel === 'URGENT' && a.urgencyLevel !== 'URGENT') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setConsultations(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await consultationAPI.updateStatus(id, status);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const submitRating = async (consultationId, doctorId) => {
    const ratingStr = prompt('Rate this doctor from 1 to 5:');
    if (!ratingStr) return;
    const rating = parseInt(ratingStr);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      alert('Invalid rating.');
      return;
    }
    const comment = prompt('Optional comment:');
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ doctorId, careEpisodeId: consultationId, rating, comment })
      });
      alert('Review submitted successfully!');
    } catch (err) {
      alert('Failed to submit review.');
    }
  };

  if (!user) return null;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>My Consultations</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>A complete history of all your medical consultation sessions.</p>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h2 className="data-table-title" style={{ color: 'var(--color-text)' }}>Consultation History</h2>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {consultations.length} entries
          </span>
        </div>
        
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Consultation ID</th>
                <th>{user.role === 'PATIENT' ? 'Provider Name' : 'Patient Name'}</th>
                {user.role === 'PATIENT' && <th>For</th>}
                <th>Creation Date</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length === 0 && (
                <tr>
                  <td colSpan={user.role === 'PATIENT' ? "6" : "5"} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No consultation records found.
                  </td>
                </tr>
              )}
              {consultations.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>#{String(c.id).padStart(6, '0')}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--color-primary-light)', 
                        color: 'var(--color-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}>
                        {(user.role === 'PATIENT' ? c.doctor?.name : c.patient?.name)?.charAt(0) || '?'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>
                          {user.role === 'PATIENT' ? c.doctor?.name || 'Unknown' : (c.familyMember ? `${c.familyMember.name} (Dependent of ${c.patient?.name})` : c.patient?.name || 'Unknown')}
                        </span>
                        {c.urgencyLevel === 'URGENT' && (
                          <span style={{ fontSize: '10px', color: '#b45309', fontWeight: 600, background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', marginTop: '2px' }}>URGENT</span>
                        )}
                      </div>
                    </div>
                  </td>
                  {user.role === 'PATIENT' && (
                    <td style={{ color: 'var(--color-text-secondary)' }}>
                      {c.familyMember ? c.familyMember.name : 'Myself'}
                    </td>
                  )}
                  <td style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td>
                    <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => navigate(`/consultation/${c.id}`)}
                      >
                        {c.status === 'COMPLETED' ? 'View Record' : 'Join Room'}
                      </button>
                      {user.role === 'PATIENT' && c.status === 'COMPLETED' && (
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '6px 12px' }} 
                          onClick={() => submitRating(c.id, c.doctorId)}
                        >
                          Rate Doctor
                        </button>
                      )}
                      {user.role === 'DOCTOR' && c.status !== 'COMPLETED' && (
                        <select 
                          style={{ 
                            padding: '6px 10px', 
                            borderRadius: '6px', 
                            border: '1px solid var(--color-border)', 
                            fontSize: '12px', 
                            background: 'var(--color-white)', 
                            color: 'var(--color-text)',
                            cursor: 'pointer' 
                          }}
                          value={c.status} 
                          onChange={(e) => updateStatus(c.id, e.target.value)}
                        >
                          <option value="PENDING">Mark Pending</option>
                          <option value="ACTIVE">Mark Active</option>
                          <option value="COMPLETED">Mark Completed</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
