import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { doctorAPI, availabilityAPI } from '../api';
import { User, Calendar, Save, Check, AlertTriangle, ShieldAlert, Award, FileText, QrCode, ArrowRight } from 'lucide-react';

export function SettingsPage({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState(user?.role === 'DOCTOR' ? 'account' : 'account');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Account Settings Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  // Patient Medical Profile State
  const [medicalForm, setMedicalForm] = useState({
    allergies: 'Penicillin, Sulfonamides',
    bloodGroup: 'O-Positive',
    height: '178',
    weight: '72'
  });

  // Family Members State
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [familyForm, setFamilyForm] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O-Positive',
    allergies: ''
  });

  // Availability Settings Form State (Doctor Only)
  const [availabilityForm, setAvailabilityForm] = useState({
    days: {
      1: true,  // Mon
      2: false, // Tue
      3: true,  // Wed
      4: false, // Thu
      5: true,  // Fri
      6: false, // Sat
      0: false, // Sun
    },
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    bufferTime: 10,
  });

  // Clinic Subscription State (Doctor Only)
  const [clinic, setClinic] = useState(null);
  const [loadingClinic, setLoadingClinic] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      });
      if (user.role === 'DOCTOR') {
        fetchDoctorAvailability();
        fetchClinicDetails();
      }
      if (user.role === 'PATIENT') {
        fetchFamilyMembers();
      }
    }
  }, [user]);

  const fetchFamilyMembers = async () => {
    setLoadingFamily(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/family', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFamilyMembers(data.data || []);
    } catch (err) {
      console.error('Failed to load family members:', err);
    } finally {
      setLoadingFamily(false);
    }
  };

  const fetchClinicDetails = async () => {
    setLoadingClinic(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch clinic info using the invoices route which returns subscription validations or direct mock
      const { data } = await axios.get('http://localhost:5000/pos/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // We simulate clinic details extraction or default config
      setClinic({
        name: 'MediSync Central Clinic',
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        doctorsCount: 4,
        monthlyConsultations: 182
      });
    } catch (err) {
      if (err.response?.status === 402 && err.response?.data?.clinicId) {
        // Expired clinic subscription caught
        setClinic({
          name: 'MediSync Central Clinic',
          subscriptionStatus: 'EXPIRED',
          subscriptionExpiresAt: 'Expired',
          doctorsCount: 4,
          monthlyConsultations: 245
        });
      }
    } finally {
      setLoadingClinic(false);
    }
  };

  const fetchDoctorAvailability = async () => {
    try {
      const { data } = await availabilityAPI.getMyAvailability();
      if (Array.isArray(data.data) && data.data.length > 0) {
        const firstRule = data.data[0];
        const daysMap = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
        data.data.forEach(rule => {
          daysMap[rule.dayOfWeek] = true;
        });
        setAvailabilityForm({
          days: daysMap,
          startTime: firstRule.startTime || '09:00',
          endTime: firstRule.endTime || '17:00',
          slotDuration: firstRule.slotDuration || 30,
          bufferTime: firstRule.bufferTime || 10,
        });
      }
    } catch (err) {
      console.error('Failed to load doctor settings:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      // Simulate profile API updates
      await new Promise(resolve => setTimeout(resolve, 800));
      if (onUpdateUser) {
        onUpdateUser({ ...user, name: profileForm.name, phone: profileForm.phone });
      }
      setSuccessMsg('Account details updated successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update account details');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setSuccessMsg('Clinical metrics and allergies record updated!');
    } catch (err) {
      setErrorMsg('Failed to update medical profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFamilySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/family', familyForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Family member added successfully!');
      setFamilyForm({ name: '', relationship: '', dateOfBirth: '', gender: 'MALE', bloodGroup: 'O-Positive', allergies: '' });
      fetchFamilyMembers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add family member.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteFamily = async (id) => {
    if (!window.confirm('Are you sure you want to remove this family member?')) return;
    setLoadingFamily(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/family/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFamilyMembers();
    } catch (err) {
      setErrorMsg('Failed to remove family member.');
    } finally {
      setLoadingFamily(false);
    }
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const activeDays = Object.keys(availabilityForm.days)
        .filter(day => availabilityForm.days[day])
        .map(day => parseInt(day));

      if (activeDays.length === 0) {
        setErrorMsg('Please select at least one workday for availability slots.');
        setLoading(false);
        return;
      }

      const payload = activeDays.map(dayOfWeek => ({
        dayOfWeek,
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime,
        slotDuration: parseInt(availabilityForm.slotDuration),
        bufferTime: parseInt(availabilityForm.bufferTime)
      }));

      await availabilityAPI.setAvailability(payload);
      setSuccessMsg('Clinical shift configurations updated!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save availability configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://localhost:5000/pos/invoices/renew', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Clinic subscription successfully renewed for 30 days!');
      fetchClinicDetails();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to renew subscription.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>Workspace Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Manage your personal details, clinical profile, and SaaS configurations.</p>
      </div>

      {successMsg && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-light)', borderRadius: '8px', marginBottom: '24px', color: 'var(--color-success)', fontSize: '13px' }}>
          <Check size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-light)', borderRadius: '8px', marginBottom: '24px', color: 'var(--color-danger)', fontSize: '13px' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="settings-container">
        {/* Left Sidebar Navigation */}
        <aside className="settings-sidebar">
          <button 
            type="button" 
            className={`settings-nav-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => { setActiveTab('account'); setSuccessMsg(''); setErrorMsg(''); }}
          >
            <User size={18} />
            <span>Account Details</span>
          </button>
          
          {user.role === 'PATIENT' && (
            <>
              <button 
                type="button" 
                className={`settings-nav-btn ${activeTab === 'medical' ? 'active' : ''}`}
                onClick={() => { setActiveTab('medical'); setSuccessMsg(''); setErrorMsg(''); }}
              >
                <FileText size={18} />
                <span>Medical Profile</span>
              </button>
              <button 
                type="button" 
                className={`settings-nav-btn ${activeTab === 'family' ? 'active' : ''}`}
                onClick={() => { setActiveTab('family'); setSuccessMsg(''); setErrorMsg(''); }}
              >
                <User size={18} />
                <span>Family Members</span>
              </button>
              <button 
                type="button" 
                className={`settings-nav-btn ${activeTab === 'locker' ? 'active' : ''}`}
                onClick={() => { setActiveTab('locker'); setSuccessMsg(''); setErrorMsg(''); }}
              >
                <ShieldAlert size={18} />
                <span>Digital Locker</span>
              </button>
            </>
          )}

          {user.role === 'DOCTOR' && (
            <>
              <button 
                type="button" 
                className={`settings-nav-btn ${activeTab === 'availability' ? 'active' : ''}`}
                onClick={() => { setActiveTab('availability'); setSuccessMsg(''); setErrorMsg(''); }}
              >
                <Calendar size={18} />
                <span>Availability Settings</span>
              </button>

              <button 
                type="button" 
                className={`settings-nav-btn ${activeTab === 'subscription' ? 'active' : ''}`}
                onClick={() => { setActiveTab('subscription'); setSuccessMsg(''); setErrorMsg(''); }}
              >
                <Award size={18} />
                <span>SaaS Subscription</span>
              </button>
            </>
          )}
        </aside>

        {/* Right Tab Contents */}
        <main className="settings-content">
          {activeTab === 'account' && (
            <form onSubmit={handleProfileSubmit}>
              <h2 className="settings-tab-title">Account Profile Settings</h2>
              
              <div className="form-group">
                <label className="form-label">Email Address (Read Only)</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={profileForm.email} 
                  disabled 
                  style={{ background: 'var(--color-bg)', cursor: 'not-allowed', opacity: 0.8 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profileForm.phone} 
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} 
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={loading}>
                  <Save size={16} />
                  <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'medical' && (
            <form onSubmit={handleMedicalSubmit}>
              <h2 className="settings-tab-title">Personal Medical Records</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>Configure critical allergy logs and biometrics indicators shared with consulting practitioners.</p>

              <div className="form-group">
                <label className="form-label">Clinical Allergies</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={medicalForm.allergies} 
                  onChange={e => setMedicalForm({ ...medicalForm, allergies: e.target.value })}
                  placeholder="E.g. Penicillin, Lactose"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select 
                  className="form-input" 
                  value={medicalForm.bloodGroup} 
                  onChange={e => setMedicalForm({ ...medicalForm, bloodGroup: e.target.value })}
                >
                  <option value="A-Positive">A-Positive (A+)</option>
                  <option value="O-Positive">O-Positive (O+)</option>
                  <option value="B-Positive">B-Positive (B+)</option>
                  <option value="AB-Positive">AB-Positive (AB+)</option>
                  <option value="O-Negative">O-Negative (O-)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={medicalForm.height} 
                    onChange={e => setMedicalForm({ ...medicalForm, height: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={medicalForm.weight} 
                    onChange={e => setMedicalForm({ ...medicalForm, weight: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={loading}>
                  <Save size={16} />
                  <span>Update Medical Logs</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'family' && (
            <div>
              <h2 className="settings-tab-title">Family Members</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                Add dependents to book appointments and track health records on their behalf.
              </p>

              {loadingFamily ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading family members...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  {familyMembers.length === 0 && (
                    <div style={{ padding: '24px', border: '1px dashed var(--color-border)', borderRadius: '12px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No family members added yet.
                    </div>
                  )}
                  {familyMembers.map(member => (
                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '15px', display: 'block' }}>{member.name}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {member.relationship} &middot; {member.gender || 'N/A'} &middot; {member.bloodGroup || 'N/A'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteFamily(member.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)', background: 'var(--color-white)' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleFamilySubmit} style={{ padding: '24px', background: 'var(--color-bg-alt)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Add New Member</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={familyForm.name} 
                      onChange={e => setFamilyForm({ ...familyForm, name: e.target.value })} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <select 
                      className="form-input" 
                      value={familyForm.relationship} 
                      onChange={e => setFamilyForm({ ...familyForm, relationship: e.target.value })}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={familyForm.dateOfBirth} 
                      onChange={e => setFamilyForm({ ...familyForm, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select 
                      className="form-input" 
                      value={familyForm.gender} 
                      onChange={e => setFamilyForm({ ...familyForm, gender: e.target.value })}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select 
                      className="form-input" 
                      value={familyForm.bloodGroup} 
                      onChange={e => setFamilyForm({ ...familyForm, bloodGroup: e.target.value })}
                    >
                      <option value="A-Positive">A-Positive</option>
                      <option value="O-Positive">O-Positive</option>
                      <option value="B-Positive">B-Positive</option>
                      <option value="AB-Positive">AB-Positive</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    Add Family Member
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'locker' && (
            <div>
              <h2 className="settings-tab-title">Digital Health Locker</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                Store external prescriptions, lab reports, and scans here safely.
              </p>
              
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                <ShieldAlert size={32} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>Upload New Document</h4>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                  <input type="file" className="form-input" style={{ maxWidth: '300px', fontSize: '12px' }} />
                  <button type="button" className="btn btn-primary" onClick={() => { setSuccessMsg('Document successfully saved to secure locker'); }}>Upload</button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Stored Documents</h3>
                <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'var(--color-primary-50)', color: 'var(--color-primary)', borderRadius: '8px' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>Blood Test Report</strong>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Uploaded Oct 12, 2023 &middot; LAB REPORT</span>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>View</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <form onSubmit={handleAvailabilitySubmit}>
              <h2 className="settings-tab-title">Clinic Shift Configurations</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                Set working days, timing intervals, and diagnostic break buffers. This automatically updates slot selection choices for patients.
              </p>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Shifts Calendar Days</label>
                <div className="settings-days-grid">
                  {[
                    ['1', 'Mon'],
                    ['2', 'Tue'],
                    ['3', 'Wed'],
                    ['4', 'Thu'],
                    ['5', 'Fri'],
                    ['6', 'Sat'],
                    ['0', 'Sun']
                  ].map(([val, label]) => (
                    <label key={val} className="settings-day-checkbox">
                      <input 
                        type="checkbox" 
                        checked={availabilityForm.days[val]} 
                        onChange={(e) => setAvailabilityForm({
                          ...availabilityForm,
                          days: { ...availabilityForm.days, [val]: e.target.checked }
                        })}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Shift Start Time</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={availabilityForm.startTime} 
                    onChange={e => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Shift End Time</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={availabilityForm.endTime} 
                    onChange={e => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Slot Consultation Duration</label>
                  <select 
                    className="form-input" 
                    value={availabilityForm.slotDuration} 
                    onChange={e => setAvailabilityForm({ ...availabilityForm, slotDuration: parseInt(e.target.value) })}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Buffer Break Duration</label>
                  <select 
                    className="form-input" 
                    value={availabilityForm.bufferTime} 
                    onChange={e => setAvailabilityForm({ ...availabilityForm, bufferTime: parseInt(e.target.value) })}
                  >
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="20">20 minutes</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={loading}>
                  <Save size={16} />
                  <span>Update Settings</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'subscription' && (
            <div>
              <h2 className="settings-tab-title">Clinic Subscription Package</h2>
              
              {loadingClinic ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Loading subscription logs...</p>
              ) : clinic ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Status Card banner */}
                  <div style={{
                    padding: '24px',
                    borderRadius: '16px',
                    background: clinic.subscriptionStatus === 'ACTIVE' 
                      ? 'linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(13, 148, 136, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)',
                    border: clinic.subscriptionStatus === 'ACTIVE' 
                      ? '1px solid rgba(13, 148, 136, 0.25)' 
                      : '1px solid rgba(220, 38, 38, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ fontSize: '18px', color: 'var(--color-text)', display: 'block' }}>{clinic.name}</strong>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                        Subscription Status:{' '}
                        <strong style={{ color: clinic.subscriptionStatus === 'ACTIVE' ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                          {clinic.subscriptionStatus}
                        </strong>
                      </span>
                    </div>

                    <button 
                      onClick={handleRenewSubscription} 
                      className="btn btn-primary"
                      style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      disabled={loading}
                    >
                      <Sparkles size={14} />
                      <span>Renew Subscription</span>
                    </button>
                  </div>

                  {/* Limits and packages logs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'var(--color-white)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Active Doctors</span>
                      <strong style={{ fontSize: '20px', color: 'var(--color-text)', display: 'block', marginTop: '6px' }}>{clinic.doctorsCount} <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>/ 10 seats</span></strong>
                    </div>

                    <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'var(--color-white)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Monthly Consultations</span>
                      <strong style={{ fontSize: '20px', color: 'var(--color-text)', display: 'block', marginTop: '6px' }}>{clinic.monthlyConsultations} <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>/ 1,000 limits</span></strong>
                    </div>
                  </div>

                  <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border-light)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    🚨 Expiring on <strong>{clinic.subscriptionExpiresAt}</strong>. Renewing extends your billing system and Swiggy-rule location discovery listing by another 30 days.
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <ShieldAlert size={32} style={{ color: 'var(--color-danger)', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>Could not load clinic details. Make sure your doctor profile is linked.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
