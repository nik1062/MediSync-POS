import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  Search, 
  User, 
  Clock, 
  Activity, 
  Check, 
  AlertTriangle,
  Building,
  Star,
  ArrowRight,
  Shield,
  CreditCard,
  X,
  Map,
  List,
  Mic
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { consultationAPI } from '../api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in leaflet with webpack/react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

export function Discovery({ user }) {
  const { t } = useTranslation();
  const [lat, setLat] = useState('12.9716'); // Default coordinates
  const [lng, setLng] = useState('77.5946');
  const [radius, setRadius] = useState('15');
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Slot booking states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStep, setBookingStep] = useState(''); // 'triage' | 'slots' | 'checkout' | 'emergency-stop'
  const [urgencyLevel, setUrgencyLevel] = useState('ROUTINE');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [isDictatingReason, setIsDictatingReason] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(false);
  
  // Family Members
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState('');

  // View Mode
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Fetch clinics based on location coordinates
  const fetchClinics = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/discovery/search?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (data && Array.isArray(data.data)) {
        setClinics(data.data);
      } else {
        setClinics([]);
      }
    } catch (err) {
      console.error(err);
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [radius]); // Auto re-fetch when radius slider changes

  useEffect(() => {
    // Fetch family members
    const fetchFamily = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/family', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFamilyMembers(data.data || []);
      } catch (err) {
        console.error('Failed to fetch family members', err);
      }
    };
    if (user && user.role === 'PATIENT') {
      fetchFamily();
    }
  }, [user]);

  // Browser Geolocation Detector
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
          fetchClinics();
        },
        (err) => {
          alert('Could not detect location. Using default center coordinates.');
        }
      );
    }
  };

  // Fetch slots for selected doctor
  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setBookingStep('triage');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setBookingDate(dateStr);
    loadSlots(doc.id, dateStr);
  };

  const loadSlots = async (docId, dateStr) => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/availability/${docId}/slots?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlots(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (e) => {
    setBookingDate(e.target.value);
    if (selectedDoctor) {
      loadSlots(selectedDoctor.id, e.target.value);
    }
  };

  const confirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setBookingError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/appointments/book', {
        doctorId: selectedDoctor.id,
        scheduledAt: selectedSlot.datetime,
        paymentStatus: 'PAID',
        fee: 15.00,
        familyMemberId: selectedFamilyMemberId || null,
        urgencyLevel: urgencyLevel,
        reasonForVisit: reasonForVisit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookingSuccess(true);
      setTimeout(() => {
        handleCloseBooking();
        fetchClinics();
      }, 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Double-booking race condition blocked!');
    }
  };

  const handleCloseBooking = () => {
    setSelectedDoctor(null);
    setBookingDate('');
    setSlots([]);
    setSelectedSlot(null);
    setCheckoutStep(false);
    setBookingStep('');
    setBookingSuccess(false);
    setBookingError('');
    setSelectedFamilyMemberId('');
    setUrgencyLevel('ROUTINE');
    setReasonForVisit('');
    setIsDictatingReason(false);
  };

  const startReasonDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsDictatingReason(true);
    recognition.onend = () => setIsDictatingReason(false);
    recognition.onerror = () => setIsDictatingReason(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setReasonForVisit(prev => (prev + ' ' + transcript).trim());
    };

    recognition.start();
  };

  // Filter clinics by search query
  const filteredClinics = Array.isArray(clinics)
    ? clinics.filter(c => 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Search Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #0f766e 100%)', borderRadius: '24px', padding: '40px', color: 'white', marginBottom: '32px', boxShadow: 'var(--shadow-lg)' }}>
        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Find Nearby Clinics</h1>
        <p style={{ opacity: 0.9, fontSize: '14px', marginBottom: '24px' }}>Locate verified clinics, discover active practitioners, and schedule instant consult rooms.</p>
        
        {/* Geolocation Filter bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(8px)' }}>
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', borderRadius: '10px', padding: '0 12px' }}>
            <MapPin size={18} style={{ color: 'var(--color-primary)' }} />
            <input 
              type="text" 
              placeholder="Latitude" 
              value={lat} 
              onChange={e => setLat(e.target.value)} 
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--color-text)', height: '40px' }}
            />
          </div>
          
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', borderRadius: '10px', padding: '0 12px' }}>
            <MapPin size={18} style={{ color: 'var(--color-primary)' }} />
            <input 
              type="text" 
              placeholder="Longitude" 
              value={lng} 
              onChange={e => setLng(e.target.value)} 
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--color-text)', height: '40px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', borderRadius: '10px', padding: '0 16px', color: 'var(--color-text)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Radius: {radius}km</span>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={radius} 
              onChange={e => setRadius(e.target.value)}
              style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
          </div>

          <button 
            onClick={detectLocation}
            style={{ padding: '0 20px', background: 'var(--color-white)', color: 'var(--color-primary)', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Detect GPS
          </button>
          
          <button 
            onClick={fetchClinics}
            style={{ padding: '0 24px', background: '#111827', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Main Discover Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Text filter input */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0 16px' }}>
            <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search clinics by name or address..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', height: '46px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '4px' }}>
            <button 
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setViewMode('list')}
            >
              <List size={16} /> List
            </button>
            <button 
              className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setViewMode('map')}
            >
              <Map size={16} /> Map
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading nearby clinics...</div>
        ) : filteredClinics.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'var(--color-white)', border: '1px dashed var(--color-border)', borderRadius: '16px' }}>
            <Building size={36} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
            <h4>No Nearby Clinics Found</h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Try increasing the search radius slider or coordinate grids.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {filteredClinics.map(clinic => (
              <div key={clinic.id} className="card" style={{ padding: '24px', background: 'var(--color-white)', display: 'flex', flexDirection: 'column', gap: '16px', border: selectedClinicId === clinic.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', position: 'relative' }}>
                {clinic.photoUrl && (
                  <img src={clinic.photoUrl} alt={clinic.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '-8px' }} />
                )}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>{clinic.name}</h3>
                    <p style={{ margin: '0 0 4px 0', color: 'var(--color-text-muted)', fontSize: '12px' }}>{clinic.address}</p>
                    {clinic.operatingHours && <p style={{ margin: '0 0 4px 0', color: 'var(--color-text-secondary)', fontSize: '12px' }}><strong>Hours:</strong> {clinic.operatingHours}</p>}
                    
                    {clinic.distance !== undefined && (
                      <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                        {clinic.distance.toFixed(2)} km away &middot; ~{Math.ceil((clinic.distance / 40) * 60)} mins driving
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, background: 'rgba(13, 148, 136, 0.08)', padding: '4px 10px', borderRadius: '100px', width: 'fit-content' }}>
                  <Star size={12} fill="var(--color-success)" />
                  <span>Open for Bookings</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '12px' }}
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`, '_blank')}
                  >
                    Get Directions
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '12px' }}
                    onClick={() => window.open(`tel:${clinic.contactPhone || '+1234567890'}`, '_self')}
                  >
                    Call Clinic
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '16px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Available Doctors:</span>
                  
                  {Array.isArray(clinic.doctors) && clinic.doctors.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>No doctors currently available.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {clinic.doctors?.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                              {doc.name?.charAt(0)}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                                {doc.name} {doc.isOnline && <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', marginLeft: '4px' }} title="Online Now"></span>}
                              </span>
                            </div>
                          </div>
                          
                          <button 
                            className="btn btn-primary btn-sm" 
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                            onClick={() => handleSelectDoctor(doc)}
                          >
                            Book Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <MapContainer center={[parseFloat(lat), parseFloat(lng)]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[parseFloat(lat), parseFloat(lng)]}>
                <Popup>
                  <strong>Your Location</strong>
                </Popup>
              </Marker>
              {filteredClinics.map(clinic => (
                <Marker key={clinic.id} position={[parseFloat(clinic.latitude), parseFloat(clinic.longitude)]}>
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{clinic.name}</h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>{clinic.address}</p>
                      {clinic.distance !== undefined && (
                        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                          {clinic.distance.toFixed(2)} km &middot; ~{Math.ceil((clinic.distance / 40) * 60)} mins
                        </p>
                      )}
                      
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', marginBottom: '8px', fontSize: '11px' }}
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`, '_blank')}
                      >
                        Get Directions
                      </button>

                      <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                        <strong style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Doctors:</strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {clinic.doctors?.slice(0, 3).map(doc => (
                            <button 
                              key={doc.id}
                              style={{ textAlign: 'left', background: 'none', border: 'none', padding: '4px 0', fontSize: '12px', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleSelectDoctor(doc)}
                            >
                              {doc.name} {doc.isOnline && <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }} title="Online Now"></span>} &rarr;
                            </button>
                          ))}
                          {clinic.doctors?.length > 3 && <span style={{ fontSize: '11px', color: '#999' }}>+{clinic.doctors.length - 3} more</span>}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {/* --- Booking / Checkout Wizard Modal --- */}
      {selectedDoctor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', backgroundColor: 'var(--color-white)', boxShadow: 'var(--shadow-xl)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-border)', animation: 'scaleIn 0.3s ease-out' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-bg-alt)' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Checkout Booking</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>with {selectedDoctor.name}</p>
              </div>
              <button onClick={handleCloseBooking} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}>
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
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Redirecting to dashboard...</p>
                </div>
              ) : bookingStep === 'triage' ? (
                // Step 0: Urgency Screening
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>{t('booking.triage_title')}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                    Are you experiencing any of the following?
                  </p>
                  <ul style={{ fontSize: '13px', color: 'var(--color-text)', paddingLeft: '20px', marginBottom: '24px', lineHeight: '1.6' }}>
                    <li>{t('booking.emergency_desc')}</li>
                    <li>Severe chest pain or pressure</li>
                    <li>Loss of consciousness or sudden confusion</li>
                  </ul>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '12px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }} 
                      onClick={() => setBookingStep('emergency-stop')}
                    >
                      Yes, experiencing this
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: '12px' }} 
                      onClick={() => setBookingStep('slots')}
                    >
                      No, none of these
                    </button>
                  </div>
                </div>
              ) : bookingStep === 'emergency-stop' ? (
                // Emergency Stop Screen
                <div style={{ textAlign: 'center', padding: '16px 0', animation: 'scaleIn 0.3s ease-out' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <AlertTriangle size={32} />
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#b91c1c', marginBottom: '12px' }}>MEDICAL EMERGENCY</h4>
                  <p style={{ color: 'var(--color-text)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5', fontWeight: 500 }}>
                    This may be a medical emergency. Do not wait for a consultation. <br/><br/>
                    <strong>Call 112 immediately</strong> or go to the nearest emergency room now.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ padding: '14px', background: '#b91c1c', borderColor: '#b91c1c', fontSize: '16px', fontWeight: 700 }}
                      onClick={() => window.open(`tel:112`, '_self')}
                    >
                      Call 112 (Emergency)
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ padding: '14px' }}
                      onClick={() => window.open(`https://www.google.com/maps/search/nearest+emergency+room+hospital/@${lat},${lng},14z`, '_blank')}
                    >
                      View Nearest ER on Map
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ padding: '14px', background: 'transparent', color: 'var(--color-text-secondary)', border: 'none' }}
                      onClick={handleCloseBooking}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : bookingStep === 'checkout' ? (
                // Step 2: Checkout payment page
                <div>
                  {bookingError && (
                    <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-light)', borderRadius: '8px', marginBottom: '20px', color: 'var(--color-danger)', fontSize: '13px' }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Invoice Summary</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Provider:</span>
                        <strong>{selectedDoctor.name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Schedule:</span>
                        <strong>{bookingDate} at {selectedSlot?.time}</strong>
                      </div>
                      <div style={{ height: '1px', borderBottom: '1px dashed var(--color-border)', margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold' }}>
                        <span>Total Due:</span>
                        <strong style={{ color: 'var(--color-primary)' }}>$15.00</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', background: 'var(--color-white)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>💳 Checkout Card Terminal</span>
                    <input type="text" className="form-input" placeholder="Card Number" defaultValue="4242 4242 4242 4242" style={{ marginBottom: '10px', height: '38px', fontSize: '13px' }} required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="text" className="form-input" placeholder="MM/YY" defaultValue="12/28" style={{ height: '38px', fontSize: '13px', textAlign: 'center' }} required />
                      <input type="password" className="form-input" placeholder="CVC" defaultValue="123" style={{ height: '38px', fontSize: '13px', textAlign: 'center' }} required />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setBookingStep('slots')}>Back</button>
                    <button type="button" className="btn btn-primary" style={{ flex: 2, padding: '12px' }} onClick={confirmBooking}>Pay & Book</button>
                  </div>
                </div>
              ) : bookingStep === 'slots' ? (
                // Step 1: Slots Calendar Date/Time Selector
                <>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Select Consultation Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={bookingDate} 
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ height: '42px' }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Who is this appointment for?</label>
                    <select 
                      className="form-input" 
                      value={selectedFamilyMemberId} 
                      onChange={(e) => setSelectedFamilyMemberId(e.target.value)}
                      style={{ height: '42px' }}
                    >
                      <option value="">Myself ({user?.name})</option>
                      {familyMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.relationship})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Reason for Visit / Symptoms</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <textarea 
                        className="form-input" 
                        value={reasonForVisit} 
                        onChange={(e) => setReasonForVisit(e.target.value)}
                        placeholder="E.g. Fever and headache since 2 days..."
                        style={{ flex: 1, minHeight: '60px', resize: 'vertical' }}
                      />
                      <button 
                        type="button" 
                        className={`btn ${isDictatingReason ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={startReasonDictation}
                        title="Voice Dictation"
                        style={{ height: '60px', width: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      >
                        <Mic size={24} className={isDictatingReason ? 'pulse' : ''} />
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Priority Level (Optional)</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', background: urgencyLevel === 'ROUTINE' ? 'var(--color-primary-50)' : 'var(--color-white)', borderColor: urgencyLevel === 'ROUTINE' ? 'var(--color-primary)' : 'var(--color-border)' }}>
                        <input 
                          type="radio" 
                          name="urgency"
                          value="ROUTINE"
                          checked={urgencyLevel === 'ROUTINE'}
                          onChange={(e) => setUrgencyLevel(e.target.value)}
                          style={{ margin: 0 }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>{t('booking.routine')}</span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{t('booking.routine_desc')}</span>
                        </div>
                      </label>
                      
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', background: urgencyLevel === 'URGENT' ? '#fffbeb' : 'var(--color-white)', borderColor: urgencyLevel === 'URGENT' ? '#d97706' : 'var(--color-border)' }}>
                        <input 
                          type="radio" 
                          name="urgency"
                          value="URGENT"
                          checked={urgencyLevel === 'URGENT'}
                          onChange={(e) => setUrgencyLevel(e.target.value)}
                          style={{ margin: 0 }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#b45309' }}>{t('booking.urgent')}</span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{t('booking.urgent_desc')}</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '12px', display: 'block' }}>Available Slots</label>
                    {loadingSlots ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>Loading slots...</div>
                    ) : slots.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 16px', border: '1px dashed var(--color-border)', borderRadius: '12px', background: 'var(--color-bg)' }}>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>No slots open on this date.</p>
                      </div>
                    ) : (
                      <div className="slots-grid">
                        {slots.map(s => (
                          <button
                            key={s.time}
                            type="button"
                            onClick={() => setSelectedSlot(s)}
                            className={`slot-btn ${selectedSlot?.time === s.time ? 'selected' : 'available'}`}
                          >
                            {s.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={handleCloseBooking}>Cancel</button>
                    <button type="button" className="btn btn-primary" style={{ flex: 2, padding: '12px' }} disabled={!selectedSlot} onClick={() => setBookingStep('checkout')}>Proceed to Pay</button>
                  </div>
                </>
              ) : null}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
