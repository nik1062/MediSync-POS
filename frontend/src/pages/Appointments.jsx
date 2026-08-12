import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../api';
import { Calendar, Clock, Video, MapPin, User, CheckCircle, XCircle } from 'lucide-react';

export function Appointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await appointmentAPI.getAll();
      setAppointments(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.cancel(id);
        fetchAppointments(); // Refresh the list
      } catch (err) {
        alert('Failed to cancel appointment. It may have already been processed.');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await appointmentAPI.updateStatus(id, newStatus);
      fetchAppointments();
    } catch (err) {
      alert(`Failed to update status to ${newStatus}.`);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'BOOKED': return 'badge-primary';
      case 'CONFIRMED': return 'badge-success';
      case 'CHECKED_IN': return 'badge-warning';
      case 'WAITING': return 'badge-warning';
      case 'IN_CONSULTATION': return 'badge-primary';
      case 'COMPLETED': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      case 'NO_SHOW': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--color-danger)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Appointments</h2>
          <button className="btn btn-primary" onClick={fetchAppointments}>
            Refresh
          </button>
        </div>

        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            <Calendar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>No upcoming scheduled appointments found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 8px' }}>Date & Time</th>
                  <th style={{ padding: '12px 8px' }}>{user?.role === 'DOCTOR' ? 'Patient' : 'Doctor'}</th>
                  <th style={{ padding: '12px 8px' }}>Type</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                  <th style={{ padding: '12px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => {
                  const aptDate = new Date(apt.scheduledAt);
                  const isPast = aptDate < new Date();
                  
                  return (
                    <tr key={apt.id} style={{ borderBottom: '1px solid var(--color-border)', opacity: (apt.status === 'CANCELLED' || apt.status === 'COMPLETED') ? 0.6 : 1 }}>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={16} color="var(--color-text-secondary)" />
                          <span style={{ fontWeight: 500 }}>
                            {aptDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                            {aptDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} color="var(--color-text-secondary)" />
                          {user?.role === 'DOCTOR' ? apt.patient?.name : apt.doctor?.name}
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {apt.type === 'ONLINE' ? <Video size={14} /> : <MapPin size={14} />}
                          <span style={{ fontSize: '13px' }}>{apt.type || 'CLINIC'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span className={`badge ${getStatusBadgeClass(apt.status)}`} style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          {apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {apt.status === 'BOOKED' && user?.role === 'RECEPTIONIST' && (
                            <button className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(apt.id, 'CHECKED_IN')}>
                              Check In
                            </button>
                          )}
                          {apt.status === 'CHECKED_IN' && user?.role === 'DOCTOR' && (
                            <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(apt.id, 'IN_CONSULTATION')}>
                              Call Patient
                            </button>
                          )}
                          {['BOOKED', 'CONFIRMED'].includes(apt.status) && (
                            <button className="btn btn-sm" style={{ color: 'var(--color-danger)', border: '1px solid var(--color-danger)', background: 'transparent' }} onClick={() => handleCancel(apt.id)}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
