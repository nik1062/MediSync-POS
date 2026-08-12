import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, consultationAPI, availabilityAPI, authAPI, prescriptionsAPI } from '../api';
import { MessageSquare, Activity, Clock, ArrowRight, Calendar, X, AlertTriangle, Check, Sliders, Settings } from 'lucide-react';

export function Dashboard({ user }) {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  
  // Booking Modal States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Doctor Schedule Settings States
  const [scheduleDays, setScheduleDays] = useState({
    1: true, // Mon
    2: false, // Tue
    3: true, // Wed
    4: false, // Thu
    5: true, // Fri
    6: false, // Sat
    0: false, // Sun
  });
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState(10);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(false);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);

  useEffect(() => {
    fetchData();
    if (user && user.role === 'DOCTOR') {
      fetchDoctorAvailability();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [consRes, docsRes] = await Promise.all([
        consultationAPI.getAll(),
        user.role === 'PATIENT' ? doctorAPI.getAll() : Promise.resolve({ data: { data: [] } })
      ]);
      setConsultations(consRes.data.data);
      if (user.role === 'PATIENT') {
        setDoctors(docsRes.data.data);
        const presRes = await prescriptionsAPI.getMyPrescriptions();
        setPrescriptions(presRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctorAvailability = async () => {
    try {
      const { data } = await availabilityAPI.getMyAvailability();
      if (Array.isArray(data.data) && data.data.length > 0) {
        // Populate form based on first rule found
        const firstRule = data.data[0];
        setStartTime(firstRule.startTime);
        setEndTime(firstRule.endTime);
        setSlotDuration(firstRule.slotDuration);
        setBufferTime(firstRule.bufferTime);
        
        // Map days
        const daysMap = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
        data.data.forEach(rule => {
          daysMap[rule.dayOfWeek] = true;
        });
        setScheduleDays(daysMap);
      }
    } catch (err) {
      console.error('Failed to load availability:', err);
    }
  };

  const saveDoctorSchedule = async (e) => {
    e.preventDefault();
    setSavingSchedule(true);
    setScheduleSuccess(false);
    try {
      const activeDays = Object.keys(scheduleDays)
        .filter(day => scheduleDays[day])
        .map(day => parseInt(day));

      if (activeDays.length === 0) {
        alert('Please select at least one day for your shift.');
        setSavingSchedule(false);
        return;
      }

      const availabilities = activeDays.map(dayOfWeek => ({
        dayOfWeek,
        startTime,
        endTime,
        slotDuration: parseInt(slotDuration),
        bufferTime: parseInt(bufferTime)
      }));

      await availabilityAPI.setAvailability(availabilities);
      setScheduleSuccess(true);
      setTimeout(() => setScheduleSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update schedule');
    } finally {
      setSavingSchedule(false);
    }
  };

  const loadSlots = async (doctorId, dateStr) => {
    if (!doctorId || !dateStr) return;
    setLoadingSlots(true);
    setBookingError('');
    setSelectedSlot(null);
    try {
      const { data } = await availabilityAPI.getSlots(doctorId, dateStr);
      setSlots(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to fetch slots');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setBookingDate(newDate);
    if (selectedDoctor) {
      loadSlots(selectedDoctor.id, newDate);
    }
  };

  const handleOpenBooking = (doc) => {
    setSelectedDoctor(doc);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setBookingDate(dateStr);
    setBookingSuccess(false);
    setBookingError('');
    setSlots([]);
    setSelectedSlot(null);
    loadSlots(doc.id, dateStr);
  };

  const handleCloseBooking = () => {
    setSelectedDoctor(null);
    setBookingDate('');
    setSlots([]);
    setSelectedSlot(null);
    setCheckoutStep(false);
  };

  const downloadCalendarInvite = (bookingDoctor, bookingDate, bookingSlot) => {
    if (!bookingDoctor || !bookingDate || !bookingSlot) return;
    const formattedDate = bookingDate.replace(/-/g, '');
    const startTimeStr = bookingSlot.time.replace(/:/g, '') + '00';
    
    // 30 min duration
    const endTimeObj = new Date(`${bookingDate}T${bookingSlot.time}:00Z`);
    endTimeObj.setMinutes(endTimeObj.getMinutes() + 30);
    const endTimeStr = endTimeObj.toISOString().split('T')[1].slice(0, 5).replace(/:/g, '') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `URL:${window.location.origin}`,
      `DTSTART:${formattedDate}T${startTimeStr}Z`,
      `DTEND:${formattedDate}T${endTimeStr}Z`,
      `SUMMARY:MediSync Consultation with ${bookingDoctor.name}`,
      `DESCRIPTION:Join your telehealth virtual workspace session at ${window.location.origin}`,
      'LOCATION:MediSync Telehealth Suite',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `medisync-consultation-${bookingDoctor.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setBookingError('');
    try {
      // Passes PAID status and $15.00 co-pay fee automatically on successful card transaction
      await consultationAPI.create(selectedDoctor.id, selectedSlot.datetime, 'PAID', 15.00);
      setBookingSuccess(true);
      setTimeout(() => {
        handleCloseBooking();
        fetchData();
      }, 1500);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book slot');
    }
  };

  const cancelConsultation = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this consultation?")) return;
    try {
      setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: 'CANCELLED' } : c));
      await consultationAPI.updateStatus(id, 'CANCELLED');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel consultation');
      fetchData();
    }
  };

  if (!user) return null;

  // Filter consultations into Upcoming (Pending/Active) vs History (Completed/Cancelled)
  const upcomingConsultations = consultations
    .filter(c => c.status === 'PENDING' || c.status === 'ACTIVE')
    .sort((a, b) => {
      if (a.urgencyLevel === 'URGENT' && b.urgencyLevel !== 'URGENT') return -1;
      if (b.urgencyLevel === 'URGENT' && a.urgencyLevel !== 'URGENT') return 1;
      return new Date(a.scheduledAt || a.createdAt) - new Date(b.scheduledAt || b.createdAt);
    });
  const pastConsultations = consultations.filter(c => c.status === 'COMPLETED' || c.status === 'CANCELLED' || c.status === 'IN_PERSON_URGENT');

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '8px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>Workspace Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Welcome back, {user.name}. Here is your clinical summary.</p>
        </div>
        
        {user.role === 'DOCTOR' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-white)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Presence Status</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{isOnline ? 'Online (Accepting Instant)' : 'Offline'}</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isOnline}
                onChange={async () => {
                  try {
                    const res = await authAPI.toggleOnline();
                    setIsOnline(res.data.data.isOnline);
                  } catch (err) {
                    console.error("Failed to toggle status", err);
                  }
                }}
                style={{ display: 'none' }}
              />
              <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: isOnline ? '#10b981' : '#cbd5e1', position: 'relative', transition: 'background 0.3s' }}>
                <div style={{ position: 'absolute', top: '2px', left: isOnline ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
              </div>
            </label>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon primary">
            <MessageSquare size={22} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-label">Total Sessions</span>
            <span className="stat-card-value">{consultations.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon success">
            <Activity size={22} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-label">Active Consultations</span>
            <span className="stat-card-value">{consultations.filter(c => c.status === 'ACTIVE').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon warning">
            <Clock size={22} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-label">Upcoming Scheduled</span>
            <span className="stat-card-value">{upcomingConsultations.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: user.role === 'PATIENT' ? '2fr 1fr' : '1.8fr 1.2fr', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Scheduled Appointments & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {user.role === 'PATIENT' && (
            <div className="data-table-wrapper" style={{ borderTop: '4px solid #10b981' }}>
              <div className="data-table-header" style={{ background: '#ecfdf5', borderBottom: '1px solid #d1fae5' }}>
                <h2 className="data-table-title" style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} />
                  <span>Medication Schedule</span>
                </h2>
              </div>
              <div style={{ padding: '16px' }}>
                {prescriptions.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>No active medications.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {prescriptions.flatMap(p => p.items).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '14px' }}>{item.product?.name || 'Unknown Drug'}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {item.dosage} &middot; {item.frequency}
                          </span>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#10b981' }}>
                          <input type="checkbox" style={{ accentColor: '#10b981', width: '16px', height: '16px' }} />
                          Taken Today
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Scheduled Sessions */}
          <div className="data-table-wrapper">
            <div className="data-table-header" style={{ background: 'var(--color-primary-50)', borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="data-table-title" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} />
                <span>Scheduled Consultations</span>
              </h2>
              <span className="badge badge-active">{upcomingConsultations.length} Active</span>
            </div>
            
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{user.role === 'PATIENT' ? 'Doctor' : 'Patient'}</th>
                    <th>Date & Time</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingConsultations.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No upcoming sessions scheduled. Book a session to start.
                      </td>
                    </tr>
                  )}
                  {upcomingConsultations.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>#{String(c.id).slice(0, 6)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                            {(user.role === 'PATIENT' ? c.doctor?.name : c.patient?.name)?.charAt(0)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{user.role === 'PATIENT' ? c.doctor?.name : c.patient?.name}</span>
                            {c.urgencyLevel === 'URGENT' && (
                              <span style={{ fontSize: '10px', color: '#b45309', fontWeight: 600, background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', marginTop: '2px' }}>URGENT</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {c.scheduledAt ? (
                          <div>
                            <strong>{new Date(c.scheduledAt).toLocaleDateString()}</strong>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : 'Immediate'}
                      </td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          background: c.paymentStatus === 'PAID' ? 'rgba(13, 148, 136, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                          color: c.paymentStatus === 'PAID' ? 'var(--color-primary)' : 'var(--color-danger)',
                          whiteSpace: 'nowrap'
                        }}>
                          {c.paymentStatus === 'PAID' ? 'Paid ($15)' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/consultation/${c.id}`)}>Join Room</button>
                          <button className="btn btn-sm" style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: 'var(--color-danger)', border: 'none' }} onClick={() => cancelConsultation(c.id)}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Session History */}
          <div className="data-table-wrapper">
            <div className="data-table-header">
              <h2 className="data-table-title">Session History</h2>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{pastConsultations.length} records</span>
            </div>
            
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{user.role === 'PATIENT' ? 'Doctor' : 'Patient'}</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pastConsultations.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No historical records.
                      </td>
                    </tr>
                  )}
                  {pastConsultations.map(c => (
                    <tr key={c.id}>
                      <td>#{String(c.id).slice(0, 6)}</td>
                      <td>{user.role === 'PATIENT' ? c.doctor?.name : c.patient?.name}</td>
                      <td>{c.scheduledAt ? new Date(c.scheduledAt).toLocaleDateString() : new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/consultation/${c.id}`)}>View Log</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Manage Availability Schedule (Doctors Only) OR Doctors List (Patients Only) */}
        {user.role === 'DOCTOR' ? (
          <div className="card" style={{ padding: '24px', background: 'var(--color-white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <Settings size={20} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Clinical Availability Settings</h3>
            </div>

            {scheduleSuccess && (
              <div style={{ display: 'flex', gap: '8px', padding: '10px 14px', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-light)', borderRadius: '8px', marginBottom: '16px', color: 'var(--color-success)', fontSize: '13px' }}>
                <Check size={16} />
                <span>Working shift schedule updated!</span>
              </div>
            )}

            <form onSubmit={saveDoctorSchedule}>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Shift Weekdays</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[['1', 'Mon'], ['2', 'Tue'], ['3', 'Wed'], ['4', 'Thu'], ['5', 'Fri'], ['6', 'Sat'], ['0', 'Sun']].map(([val, label]) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', background: 'var(--color-bg)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border-light)' }}>
                      <input 
                        type="checkbox" 
                        checked={scheduleDays[val]} 
                        onChange={(e) => setScheduleDays({ ...scheduleDays, [val]: e.target.checked })} 
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Shift Start</label>
                  <input type="time" className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Shift End</label>
                  <input type="time" className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Consultation (Mins)</label>
                  <select className="form-input" value={slotDuration} onChange={e => setSlotDuration(e.target.value)}>
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Buffer Break (Mins)</label>
                  <select className="form-input" value={bufferTime} onChange={e => setBufferTime(e.target.value)}>
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={savingSchedule}>
                {savingSchedule ? 'Saving Config...' : 'Update Clinic Shifts'}
              </button>
            </form>
          </div>
        ) : (
          /* Patients: Book consultations list */
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-white)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Available Doctors</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {doctors.map(doc => (
                <div 
                  key={doc.id} 
                  style={{ 
                    padding: '20px 24px', 
                    borderBottom: '1px solid var(--color-border-light)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '14px',
                    background: 'var(--color-white)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '50%', 
                      backgroundColor: 'var(--color-primary-light)', 
                      color: 'var(--color-primary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold',
                      boxShadow: 'inset 0 0 0 1px rgba(13, 148, 136, 0.1)'
                    }}>
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)', margin: 0 }}>{doc.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                        {doc.doctorProfile?.specialization} • {doc.doctorProfile?.yearsOfExperience} yrs
                      </p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-outline" 
                    style={{ 
                      width: '100%', 
                      fontSize: '13px', 
                      padding: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px',
                      color: 'var(--color-primary)',
                      borderColor: 'var(--color-primary)'
                    }} 
                    onClick={() => handleOpenBooking(doc)}
                  >
                    <span>Book Session</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Home Lab Test (Patient only) */}
        {user.role === 'PATIENT' && (
          <div className="card" style={{ padding: '24px', background: 'var(--color-white)', marginTop: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Home Services</h3>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
              <Activity size={24} style={{ color: '#10b981', margin: '0 auto 8px auto' }} />
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>Home Lab Collection</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Book a phlebotomist to collect your lab samples from home.</p>
              <select className="form-input" style={{ marginBottom: '12px', fontSize: '12px' }} defaultValue="">
                <option value="" disabled>Select Lab Test...</option>
                <option value="cbc">Complete Blood Count (CBC)</option>
                <option value="lipid">Lipid Profile</option>
                <option value="thyroid">Thyroid Panel (T3, T4, TSH)</option>
                <option value="sugar">Fasting Blood Sugar</option>
              </select>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ width: '100%' }}
                onClick={() => alert('Mock: Phlebotomist booked for home collection!')}
              >
                Request Collection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Booking Availability Slot Modal --- */}
      {selectedDoctor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: 'var(--color-white)',
            boxShadow: 'var(--shadow-xl)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            animation: 'scaleIn 0.3s ease-out'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-bg-alt)'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>Book Consultation</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>with {selectedDoctor.name}</p>
              </div>
              <button 
                onClick={handleCloseBooking} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {bookingSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Check size={28} />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Appointment Scheduled & Paid!</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Invoice: $15.00 co-pay processed via Stripe Sandbox.</p>
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => downloadCalendarInvite(selectedDoctor, bookingDate, selectedSlot)}
                    style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Calendar size={14} />
                    <span>Download Calendar Invite (.ics)</span>
                  </button>
                </div>
              ) : checkoutStep ? (
                // --- Step 2: Dedicated Payment Checkout Page ---
                <div>
                  {bookingError && (
                    <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-light)', borderRadius: '8px', marginBottom: '20px', color: 'var(--color-danger)', fontSize: '13px' }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: '12px',
                    padding: '18px',
                    marginBottom: '20px'
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>Invoice Summary</span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Service:</span>
                        <strong style={{ color: 'var(--color-text)' }}>Telehealth consultation</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Provider:</span>
                        <strong style={{ color: 'var(--color-text)' }}>{selectedDoctor.name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Schedule:</span>
                        <strong style={{ color: 'var(--color-text)' }}>{bookingDate} at {selectedSlot?.time}</strong>
                      </div>
                      
                      <div style={{ height: '1px', borderBottom: '1px dashed var(--color-border)', margin: '8px 0' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Base Co-Pay Fee:</span>
                        <strong style={{ color: 'var(--color-text)' }}>$15.00</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', marginTop: '4px' }}>
                        <span style={{ color: 'var(--color-text)' }}>Total Due:</span>
                        <strong style={{ color: 'var(--color-primary)' }}>$15.00</strong>
                      </div>
                    </div>
                  </div>

                  {/* Stripe Card Terminal Visual Inputs */}
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', background: 'var(--color-white)', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💳 Secure Card Payment</span>
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 600, background: 'rgba(13, 148, 136, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        SSL Encrypted
                      </span>
                    </div>

                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Cardholder Name</label>
                      <input type="text" className="form-input" placeholder="Full name on card" defaultValue={user.name} style={{ height: '38px', fontSize: '13px' }} required />
                    </div>

                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Card Number</label>
                      <input type="text" className="form-input" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" style={{ height: '38px', fontSize: '13px' }} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Expiry Date</label>
                        <input type="text" className="form-input" placeholder="MM/YY" defaultValue="12/28" style={{ height: '38px', fontSize: '13px', textAlign: 'center' }} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>CVC / CVV</label>
                        <input type="password" className="form-input" placeholder="123" defaultValue="123" style={{ height: '38px', fontSize: '13px', textAlign: 'center' }} required />
                      </div>
                    </div>

                    <p style={{ margin: '12px 0 0 0', fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      By clicking Pay, you authorize a sandbox charge of $15.00 via Stripe processing.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '12px' }} 
                      onClick={() => setCheckoutStep(false)}
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ flex: 2, padding: '12px' }} 
                      onClick={confirmBooking}
                    >
                      Pay & Confirm
                    </button>
                  </div>
                </div>
              ) : (
                // --- Step 1: Slot Date & Time Selection ---
                <>
                  {bookingError && (
                    <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-light)', borderRadius: '8px', marginBottom: '20px', color: 'var(--color-danger)', fontSize: '13px' }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Select Consultation Date</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        <Calendar size={16} />
                      </span>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={bookingDate} 
                        onChange={handleDateChange}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ paddingLeft: '38px', height: '42px' }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px' }}>
                      Select a date to check availability.
                    </span>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '12px', display: 'block' }}>Available Slots</label>
                    {loadingSlots ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        Loading clinical availability...
                      </div>
                    ) : slots.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 16px', border: '1px dashed var(--color-border)', borderRadius: '12px', background: 'var(--color-bg)' }}>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>
                          No clinical slots open on this date. Please choose another weekday.
                        </p>
                      </div>
                    ) : (
                      <div className="slots-grid">
                        {slots.map(s => {
                          const isSelected = selectedSlot?.time === s.time;
                          return (
                            <button
                              key={s.time}
                              type="button"
                              onClick={() => setSelectedSlot(s)}
                              className={`slot-btn ${isSelected ? 'selected' : 'available'}`}
                            >
                              {s.time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '12px' }} 
                      onClick={handleCloseBooking}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ flex: 2, padding: '12px' }} 
                      disabled={!selectedSlot}
                      onClick={() => setCheckoutStep(true)}
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
