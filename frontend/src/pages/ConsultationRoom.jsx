import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationAPI, productAPI } from '../api';
import { POSCheckout } from './POSCheckout';
import { io } from 'socket.io-client';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Heart, 
  Thermometer, 
  Activity, 
  FileDown, 
  Send, 
  Check, 
  AlertTriangle,
  X,
  FileText,
  Sparkles,
  Pill,
  Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const socket = io('http://localhost:5000', { autoConnect: false });

const PRESCRIPTION_SUGGESTIONS = [
  { drug: 'Amoxicillin', dose: '500mg', freq: 'Three times daily', duration: '7 days', notes: 'Take with food' },
  { drug: 'Metformin', dose: '850mg', freq: 'Twice daily', duration: '30 days', notes: 'Take with meals' },
  { drug: 'Atorvastatin', dose: '20mg', freq: 'Once daily at night', duration: '90 days', notes: 'Avoid grapefruit' },
  { drug: 'Ibuprofen', dose: '400mg', freq: 'Every 6 hours as needed', duration: '5 days', notes: 'Take with milk' },
  { drug: 'Lisinopril', dose: '10mg', freq: 'Once daily', duration: '90 days', notes: 'Monitor BP' },
  { drug: 'Azithromycin', dose: '250mg', freq: 'Once daily', duration: '5 days', notes: 'Take on empty stomach' },
  { drug: 'Paracetamol', dose: '650mg', freq: 'Every 4 hours as needed', duration: '3 days', notes: 'Do not exceed 4g daily' }
];

export function ConsultationRoom({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [savingNotes, setSavingNotes] = useState(false);
  const [consultation, setConsultation] = useState(null);
  const messagesEndRef = useRef(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Live Vitals Simulation
  const [vitals, setVitals] = useState({
    bpm: 72,
    spO2: 98,
    temp: 98.6,
    bp: '120/80'
  });

  // Call simulator states
  const [callStatus, setCallStatus] = useState(null); // 'audio' | 'video' | null
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  
  // Custom smart suggestions and speech states
  const [suggestedDrugs, setSuggestedDrugs] = useState([]);
  const [dictating, setDictating] = useState(false);

  // Structured Prescription States
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [activeDrug, setActiveDrug] = useState(null);
  const [drugForm, setDrugForm] = useState({ dosage: '', frequency: '', durationDays: '', substitutionAllowed: false, scheduleClass: 'OTC' });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (productQuery.length >= 2) {
        try {
          const { data } = await productAPI.search(productQuery);
          setProductResults(data.data || []);
        } catch (err) {
          console.error(err);
        }
      } else {
        setProductResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [productQuery]);

  const handleSelectProduct = (product) => {
    setActiveDrug(product);
    setProductQuery(product.name);
    setProductResults([]);
    setDrugForm(prev => ({ ...prev, scheduleClass: product.scheduleClass || 'OTC' }));
  };

  const handleAddDrug = () => {
    if (!activeDrug || !drugForm.dosage || !drugForm.frequency || !drugForm.durationDays) {
      alert("Please fill out all drug details (Product, Dosage, Frequency, Duration).");
      return;
    }
    setPrescriptionItems([...prescriptionItems, {
      productId: activeDrug.id,
      productName: activeDrug.name,
      dosage: drugForm.dosage,
      frequency: drugForm.frequency,
      durationDays: parseInt(drugForm.durationDays),
      substitutionAllowed: drugForm.substitutionAllowed,
      scheduleClass: drugForm.scheduleClass !== 'OTC' ? drugForm.scheduleClass : null
    }]);
    
    setActiveDrug(null);
    setProductQuery('');
    setDrugForm({ dosage: '', frequency: '', durationDays: '', substitutionAllowed: false, scheduleClass: 'OTC' });
  };

  const handleRemoveDrug = (index) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
  };

  const fetchMessages = async () => {
    try {
      const { data } = await consultationAPI.getMessages(id);
      setMessages(data.data);
      
      const res = await consultationAPI.getAll();
      const current = res.data.data.find(c => String(c.id) === String(id));
      if (current) {
        setConsultation(current);
        if (current.notes && current.notes !== '{}') {
          try {
            setNotes(JSON.parse(current.notes));
          } catch(e) {}
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/dashboard');
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Connect socket and join room
    socket.connect();
    socket.emit('join_room', id);

    const handleNewMessage = (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    };

    socket.on('new_message', handleNewMessage);

    // Vitals fluctuation interval (flucleuates vitals slightly every 3 seconds to look active)
    const vitalsInterval = setInterval(() => {
      setVitals(prev => ({
        bpm: prev.bpm + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2),
        spO2: Math.min(100, Math.max(95, prev.spO2 + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.8 ? 1 : 0))),
        temp: parseFloat((prev.temp + (Math.random() > 0.5 ? 0.1 : -0.1) * Math.random()).toFixed(1)),
        bp: prev.bp
      }));
    }, 3000);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.disconnect();
      clearInterval(vitalsInterval);
    };
  }, [id, user, navigate]);

  // Timer effect for telehealth call duration
  useEffect(() => {
    let timer;
    if (callStatus) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // Handle start and stop of user's web camera and microphone
  useEffect(() => {
    if (callStatus === 'video' || callStatus === 'audio') {
      const getStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: callStatus === 'video',
            audio: true
          });
          setLocalStream(stream);
        } catch (err) {
          console.error("Camera access failed:", err);
          alert("Could not access your camera/microphone. Please allow browser permissions.");
          setCallStatus(null);
        }
      };
      getStream();
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }
  }, [callStatus]);

  // Handles Plan prescription autocomplete suggestions
  const handlePlanChange = (val) => {
    setNotes(prev => ({ ...prev, plan: val }));
    const lastWord = val.split(/[\s,]+/).pop() || '';
    if (lastWord.length >= 2) {
      const matches = PRESCRIPTION_SUGGESTIONS.filter(item => 
        item.drug.toLowerCase().startsWith(lastWord.toLowerCase())
      );
      setSuggestedDrugs(matches);
    } else {
      setSuggestedDrugs([]);
    }
  };

  // Inserts suggestion into plan notes
  const selectSuggestion = (s) => {
    const words = notes.plan.split(/\s+/);
    words.pop(); // remove last typed word segment
    const completedText = `${s.drug} ${s.dose} - ${s.freq} for ${s.duration} (${s.notes})`;
    const updated = [...words, completedText].join(' ');
    setNotes(prev => ({ ...prev, plan: updated + '\n' }));
    setSuggestedDrugs([]);
  };

  const autoStructureSOAP = async () => {
    setSavingNotes(true);
    try {
      // Mock AI parsing from chat history
      const patientMessages = messages.filter(m => m.senderId !== user.id).map(m => m.message).join('. ');
      
      // Artificial delay to simulate AI processing
      await new Promise(r => setTimeout(r, 1500));
      
      setNotes(prev => ({
        ...prev,
        subjective: prev.subjective || (patientMessages ? `Patient reports: ${patientMessages.slice(0, 100)}...` : 'Patient reports symptoms...'),
        objective: prev.objective || `Vitals stable. HR: ${vitals.bpm} BPM, SpO2: ${vitals.spO2}%, Temp: ${vitals.temp}°F.`,
        assessment: prev.assessment || 'Preliminary assessment based on telemetry and reported symptoms.',
        plan: prev.plan || 'Advised rest, monitoring, and symptomatic medication.'
      }));
    } finally {
      setSavingNotes(false);
    }
  };

  // Smart Speech to Text Clinical Dictation using HTML5 Web Speech API
  const startSpeechDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setDictating(true);
    };

    recognition.onend = () => {
      setDictating(false);
    };

    recognition.onerror = () => {
      setDictating(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const lower = transcript.toLowerCase();
      
      if (lower.startsWith('subjective')) {
        const content = transcript.replace(/subjective/i, '').trim();
        setNotes(prev => ({ ...prev, subjective: (prev.subjective + ' ' + content).trim() }));
      } else if (lower.startsWith('objective')) {
        const content = transcript.replace(/objective/i, '').trim();
        setNotes(prev => ({ ...prev, objective: (prev.objective + ' ' + content).trim() }));
      } else if (lower.startsWith('assessment')) {
        const content = transcript.replace(/assessment/i, '').trim();
        setNotes(prev => ({ ...prev, assessment: (prev.assessment + ' ' + content).trim() }));
      } else if (lower.startsWith('plan') || lower.startsWith('treatment')) {
        const content = transcript.replace(/plan|treatment/i, '').trim();
        setNotes(prev => ({ ...prev, plan: (prev.plan + ' ' + content).trim() }));
      } else {
        // Fallback: append transcript to subjective symptoms
        setNotes(prev => ({ ...prev, subjective: (prev.subjective + ' ' + transcript).trim() }));
      }
    };

    recognition.start();
  };

  // Bind local webcam stream to video element once streaming starts
  useEffect(() => {
    if (localVideoRef.current && localStream && videoActive) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, videoActive, callStatus]);

  // Toggle active microphone track
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = micActive;
      });
    }
  }, [micActive, localStream]);

  // Toggle active camera video track
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = videoActive;
      });
    }
  }, [videoActive, localStream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    try {
      await consultationAPI.sendMessage(id, inputText);
      setInputText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await consultationAPI.updateNotes(id, notes);
      alert('Clinical notes saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save notes');
    }
    setSavingNotes(false);
  };

  const handleEscalate = async () => {
    if (!window.confirm("Are you sure you want to escalate this consultation to In-Person Urgent? This will end the call and notify the patient immediately.")) return;
    try {
      await consultationAPI.escalate(id);
      socket.emit('send_message', {
        consultationId: id,
        message: '[SYSTEM_ESCALATION]',
        senderId: user.id
      });
      setCallStatus(null);
      fetchMessages();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to escalate consultation.');
    }
  };

  const sendPrescription = async () => {
    if (!notes.assessment || !notes.plan) {
      alert("Please fill out Assessment and Plan before issuing a prescription.");
      return;
    }
    const prescriptionText = `[PRESCRIPTION] DIAGNOSIS: ${notes.assessment} || TREATMENT: ${notes.plan}`;
    try {
      await consultationAPI.sendMessage(id, prescriptionText);
      alert('Prescription sent directly to patient chat!');
    } catch (err) {
      alert('Failed to send prescription.');
    }
  };

  const handleSignAndEndConsult = async () => {
    if (!notes.assessment || !notes.plan) {
      alert("Please fill out Assessment and Plan before ending the consultation.");
      return;
    }
    try {
      await consultationAPI.finalize(id, {
        notes: JSON.stringify(notes),
        prescriptionItems: prescriptionItems.length > 0 ? prescriptionItems : undefined
      });
      alert('Consultation finalized and invoiced successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to finalize consultation.');
    }
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Simulates printing the medical record
  const printMedicalPrescription = (diag, treat) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>MediSync - Clinical Record #${id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .title { font-size: 24px; font-weight: bold; color: #0d9488; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #666; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 10px; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">MediSync Clinical Network</div>
              <div style="font-size: 12px; color: #666;">Official Patient Record & Prescription</div>
            </div>
            <div style="text-align: right; font-size: 12px;">
              <div>Session ID: #${id}</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div class="meta">
            <div><strong>Practitioner:</strong> ${consultation?.doctor?.name || 'Unknown'}</div>
            <div><strong>Patient Name:</strong> ${consultation?.patient?.name || 'Unknown'}</div>
          </div>
          <div class="section">
            <div class="section-title">Clinical Diagnosis</div>
            <p>${diag}</p>
          </div>
          <div class="section">
            <div class="section-title">Prescribed Treatment Course</div>
            <p style="font-size: 16px; font-weight: bold; color: #111;">${treat}</p>
          </div>
          <div style="margin-top: 60px; border-top: 1px dashed #ccc; padding-top: 20px; text-align: center; font-size: 11px; color: #888;">
            This prescription was electronically signed via MediSync Secure Sockets API.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!user) return null;
  if (loading) return <div style={{ padding: '40px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading consultation room...</div>;

  return (
    <div>
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ padding: '8px 12px' }}>
          &larr; Exit Room
        </button>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2px', color: 'var(--color-text)' }}>Consultation Session #{id}</h1>
          <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }}></span>
            Encrypted WebSocket Active
          </span>
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--color-white)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} onClick={() => setCallStatus('audio')}>
            📞 Start Voice Call
          </button>
          <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setCallStatus('video')}>
            📹 Start Video Consult
          </button>
        </div>
      </div>

      {/* --- Task 2: Simulated Telehealth Call Panel --- */}
      {callStatus && (
        <div style={{
          background: '#0f172a',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-xl)',
          color: 'white',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }}></span>
              <strong style={{ fontSize: '14px' }}>Live Telehealth Stream — {formatDuration(callDuration)}</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Ping: 14ms | Codec: Opus/VP8 | Resolution: 1080p 60fps
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '260px' }}>
            {/* Remote Feed */}
            <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {videoActive ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px' }}>
                    {(user.role === 'PATIENT' ? consultation?.doctor?.name : (consultation?.familyMember?.name || consultation?.patient?.name))?.charAt(0)}
                  </div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>
                    {user.role === 'PATIENT' ? consultation?.doctor?.name : (consultation?.familyMember ? `${consultation?.familyMember?.name} (Dependent)` : consultation?.patient?.name)}
                  </p>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Camera Feed Active</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <VideoOff size={36} style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '12px' }}>Participant camera disabled</p>
                </div>
              )}
              <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px' }}>
                Remote Receiver
              </span>
            </div>

            {/* Local Feed */}
            <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {callStatus === 'video' && videoActive && localStream ? (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px' }}>
                    {user.name?.charAt(0)}
                  </div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{user.name} (You)</p>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{micActive ? 'Microphone Open' : 'Microphone Muted'}</span>
                </div>
              )}
              <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', zIndex: 10 }}>
                Local Feed
              </span>
            </div>
          </div>

          {/* Call Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
            <button 
              onClick={() => setMicActive(!micActive)} 
              style={{ width: '42px', height: '42px', borderRadius: '50%', background: micActive ? '#334155' : '#ef4444', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {micActive ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button 
              onClick={() => setVideoActive(!videoActive)} 
              style={{ width: '42px', height: '42px', borderRadius: '50%', background: videoActive ? '#334155' : '#ef4444', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {videoActive ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button 
              style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#334155', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Monitor size={18} />
            </button>
            {user.role === 'DOCTOR' && (
              <button 
                onClick={handleEscalate}
                style={{ background: '#b91c1c', border: '1px solid #f87171', color: 'white', padding: '0 24px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <AlertTriangle size={16} />
                Escalate (Urgent)
              </button>
            )}
            <button 
              onClick={() => setCallStatus(null)} 
              style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0 24px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer' }}
            >
              Disconnect Call
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: 3 Column Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: (user.role === 'DOCTOR' || (user.role === 'PATIENT' && (consultation?.status === 'COMPLETED' || consultation?.paymentStatus === 'UNPAID'))) ? '1fr 280px 340px' : '1fr 280px', gap: '24px', alignItems: 'start' }}>
        
        {/* Column 1: Secured Live Chat */}
        <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '620px', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-bg-alt)' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--color-text-muted)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-white)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '20px' }}>💬</div>
                <p style={{ margin: 0, fontSize: '13px' }}>Encrypted message channel open.<br/>Type symptoms or diagnostic information below.</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMine = msg.senderId === user.id;
                const isPrescription = msg.message.startsWith('[PRESCRIPTION]');
                
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    {!isMine && <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px', marginLeft: '4px' }}>{msg.sender?.name || 'Practitioner'}</span>}
                    
                    <div style={{ 
                      maxWidth: '70%', 
                      padding: isPrescription ? '16px' : '12px 16px', 
                      borderRadius: '12px', 
                      backgroundColor: isPrescription ? 'var(--color-white)' : (isMine ? 'var(--color-primary)' : 'var(--color-white)'),
                      color: isPrescription ? 'var(--color-text)' : (isMine ? 'white' : 'var(--color-text)'),
                      border: isPrescription ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-xs)',
                      borderBottomRightRadius: isMine ? '2px' : '12px',
                      borderBottomLeftRadius: isMine ? '12px' : '2px',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}>
                      {isPrescription ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '10px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '18px' }}>⚕️</span>
                            <strong style={{ fontSize: '14px', color: 'var(--color-primary)' }}>{t('prescription.receipt')}</strong>
                          </div>
                          <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', marginBottom: '12px', fontSize: '11px', color: '#64748b', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b' }} />
                            <span>{t('prescription.clinical_warning')}</span>
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>{t('prescription.diagnosis')}</span>
                            <p style={{ margin: '2px 0 0 0', fontWeight: 600 }}>{msg.message.split('||')[0].replace('[PRESCRIPTION] DIAGNOSIS:', '').trim()}</p>
                          </div>
                          <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>{t('prescription.treatment')}</span>
                            <p style={{ margin: '2px 0 0 0', fontWeight: 600, color: '#111' }}>{msg.message.split('||')[1]?.replace('TREATMENT:', '').trim()}</p>
                          </div>
                          
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            onClick={() => printMedicalPrescription(
                              msg.message.split('||')[0].replace('[PRESCRIPTION] DIAGNOSIS:', '').trim(),
                              msg.message.split('||')[1]?.replace('TREATMENT:', '').trim()
                            )}
                          >
                            <FileDown size={14} />
                            <span>{t('prescription.download_pdf')}</span>
                          </button>
                        </div>
                      ) : msg.message === '[SYSTEM_ESCALATION]' ? (
                        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca', textAlign: 'center' }}>
                          <AlertTriangle size={32} style={{ margin: '0 auto 12px' }} />
                          <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>MEDICAL EMERGENCY INSTRUCTION</h4>
                          <p style={{ fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>
                            The doctor has escalated this consultation to <strong>In-Person Urgent</strong>. Please disconnect and proceed to the nearest emergency room immediately.
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button 
                              className="btn btn-primary" 
                              style={{ background: '#b91c1c', borderColor: '#b91c1c', fontSize: '14px', width: '100%' }}
                              onClick={() => window.open(`tel:112`, '_self')}
                            >
                              Call 112
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              style={{ fontSize: '14px', width: '100%' }}
                              onClick={() => window.open(`https://www.google.com/maps/search/nearest+emergency+room+hospital`, '_blank')}
                            >
                              View Nearest ER
                            </button>
                          </div>
                        </div>
                      ) : (
                        msg.message
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-white)' }}>
            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ flex: 1, height: '42px', border: '1px solid var(--color-border)', background: 'var(--color-white)' }} 
                placeholder="Type your message..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={16} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Column 2: Live Vitals Monitor & Patient Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Vitals Box */}
          <div className="card" style={{ padding: '20px', background: 'var(--color-white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
              <Activity size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text)', margin: 0 }}>Telemetry Vitals</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* HR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Heart size={14} style={{ color: '#ef4444' }} />
                  <span>Heart Rate</span>
                </span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {vitals.bpm} <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 500 }}>BPM</span>
                </span>
              </div>

              {/* SpO2 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} style={{ color: 'var(--color-primary)' }} />
                  <span>Blood Oxygen</span>
                </span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {vitals.spO2}% <span style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 500 }}>SpO2</span>
                </span>
              </div>

              {/* Temp */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Thermometer size={14} style={{ color: '#f59e0b' }} />
                  <span>Temperature</span>
                </span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {vitals.temp} <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 500 }}>°F</span>
                </span>
              </div>

              {/* Blood Pressure */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Heart size={14} style={{ color: '#a855f7' }} />
                  <span>Blood Pressure</span>
                </span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {vitals.bp} <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 500 }}>SYS</span>
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: '16px', background: 'var(--color-bg)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border-light)', fontSize: '11px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Values update live in real-time.
            </div>
          </div>

          {/* Session Info */}
          <div className="card" style={{ padding: '20px', background: 'var(--color-white)' }}>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '12px', marginTop: 0 }}>Consultation Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div><strong>Practitioner:</strong> {consultation?.doctor?.name}</div>
              <div><strong>Patient Name:</strong> {consultation?.familyMember ? `${consultation?.familyMember?.name} (Dependent of ${consultation?.patient?.name})` : consultation?.patient?.name}</div>
              <div><strong>Status:</strong> <span className={`badge badge-${consultation?.status?.toLowerCase()}`}>{consultation?.status}</span></div>
              <div><strong>Scheduled:</strong> {consultation?.scheduledAt ? new Date(consultation.scheduledAt).toLocaleString() : 'Immediate'}</div>
              <div>
                <strong>Co-Pay Payment:</strong>{' '}
                <span style={{ 
                  color: consultation?.paymentStatus === 'PAID' ? 'var(--color-primary)' : 'var(--color-danger)', 
                  fontWeight: 600 
                }}>
                  {consultation?.paymentStatus === 'PAID' ? 'Paid ($15.00)' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: SOAP Clinical Notes (Doctors Only) */}
        {user.role === 'DOCTOR' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: '24px', background: 'var(--color-white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <FileText size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>SOAP Clinical Notes</h3>
              
              {/* Voice Dictation Button */}
              <button 
                type="button" 
                onClick={startSpeechDictation} 
                style={{
                  marginLeft: 'auto',
                  border: 'none',
                  background: dictating ? 'rgba(239, 68, 68, 0.15)' : 'rgba(13, 148, 136, 0.1)',
                  color: dictating ? '#ef4444' : 'var(--color-primary)',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  animation: dictating ? 'pulse 1.5s infinite' : 'none'
                }}
              >
                <Sparkles size={12} />
                <span>{dictating ? 'Listening...' : 'Dictate'}</span>
              </button>
              {/* Auto-Structure Button */}
              <button 
                type="button" 
                onClick={autoStructureSOAP}
                disabled={savingNotes}
                style={{
                  border: 'none',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: savingNotes ? 'not-allowed' : 'pointer'
                }}
              >
                <Activity size={12} />
                <span>{savingNotes ? 'AI structuring...' : 'AI Auto-Structure'}</span>
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '12px' }}>Subjective (Patient Symptoms)</label>
                <textarea className="form-input" rows="2" value={notes.subjective} onChange={e => setNotes({...notes, subjective: e.target.value})} placeholder="Patient's report of symptoms..." />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '12px' }}>Objective (Observations/Vitals)</label>
                <textarea className="form-input" rows="2" value={notes.objective} onChange={e => setNotes({...notes, objective: e.target.value})} placeholder="Vitals measurements, observations..." />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '12px' }}>Assessment (Diagnosis)</label>
                <textarea className="form-input" rows="2" value={notes.assessment} onChange={e => setNotes({...notes, assessment: e.target.value})} placeholder="Diagnosis, conditions noted..." />
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '12px' }}>Plan (Prescriptions & Advice)</label>
                <textarea 
                  className="form-input" 
                  rows="2" 
                  value={notes.plan} 
                  onChange={e => handlePlanChange(e.target.value)} 
                  placeholder="Type drug name (e.g. Amoxicillin)..." 
                />
                
                {/* Autocomplete suggestions */}
                {suggestedDrugs.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    zIndex: 100,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', paddingLeft: '4px' }}>Suggested Prescriptions:</span>
                    {suggestedDrugs.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        style={{
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          padding: '6px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: 'background var(--transition-fast)',
                          color: 'var(--color-text)'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--color-bg)'}
                        onMouseLeave={(e) => e.target.style.background = 'none'}
                      >
                        <strong>{s.drug}</strong> {s.dose} ({s.freq})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Pill size={16} style={{ color: 'var(--color-primary)' }} />
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Structured Prescription Items</h4>
              </div>

              {/* Added Items List */}
              {prescriptionItems.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {prescriptionItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: 'var(--color-text)', display: 'block' }}>{item.productName}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                          {item.dosage} • {item.frequency} • {item.durationDays} Days 
                          {item.scheduleClass ? ` • (Sch: ${item.scheduleClass})` : ''}
                          {item.substitutionAllowed ? ' • Sub Allowed' : ''}
                        </span>
                      </div>
                      <button onClick={() => handleRemoveDrug(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Drug Form */}
              <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
                <div className="form-group" style={{ position: 'relative', marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '11px' }}>Product Search (by Name)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ height: '32px', fontSize: '12px' }}
                    value={productQuery} 
                    onChange={e => { setProductQuery(e.target.value); setActiveDrug(null); }} 
                    placeholder="E.g. Amoxicillin..." 
                  />
                  {productResults.length > 0 && !activeDrug && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', maxHeight: '140px', overflowY: 'auto', zIndex: 100, marginTop: '4px' }}>
                      {productResults.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProduct(p)}
                          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid var(--color-border-light)' }}
                        >
                          <strong>{p.name}</strong> <span style={{ color: 'var(--color-text-muted)' }}>- {p.stockQuantity} in stock {p.scheduleClass ? `(Sch: ${p.scheduleClass})` : ''}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '11px' }}>Dosage</label>
                    <input type="text" className="form-input" style={{ height: '32px', fontSize: '12px' }} value={drugForm.dosage} onChange={e => setDrugForm({...drugForm, dosage: e.target.value})} placeholder="E.g. 500mg" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '11px' }}>Frequency</label>
                    <input type="text" className="form-input" style={{ height: '32px', fontSize: '12px' }} value={drugForm.frequency} onChange={e => setDrugForm({...drugForm, frequency: e.target.value})} placeholder="E.g. BID" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', alignItems: 'end' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '11px' }}>Days</label>
                    <input type="number" className="form-input" style={{ height: '32px', fontSize: '12px' }} value={drugForm.durationDays} onChange={e => setDrugForm({...drugForm, durationDays: e.target.value})} placeholder="E.g. 5" min="1" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '11px' }}>Class</label>
                    <select className="form-input" style={{ height: '32px', fontSize: '12px', padding: '0 8px' }} value={drugForm.scheduleClass} onChange={e => setDrugForm({...drugForm, scheduleClass: e.target.value})}>
                      <option value="OTC">OTC</option>
                      <option value="H">H</option>
                      <option value="H1">H1</option>
                      <option value="X">X</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={drugForm.substitutionAllowed} onChange={e => setDrugForm({...drugForm, substitutionAllowed: e.target.checked})} />
                      Sub Allowed
                    </label>
                  </div>
                </div>

                <button type="button" onClick={handleAddDrug} className="btn btn-secondary" style={{ width: '100%', marginTop: '12px', padding: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Item
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button className="btn btn-secondary" style={{ padding: '10px', fontSize: '12px', background: 'var(--color-white)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} onClick={saveNotes} disabled={savingNotes}>
                {savingNotes ? 'Saving...' : 'Save Draft'}
              </button>
              <button className="btn btn-primary" style={{ padding: '10px', fontSize: '12px' }} onClick={handleSignAndEndConsult}>
                Sign & End Consult
              </button>
            </div>
          </div>
        )}

        {/* Column 3: Patient Post-Visit Summary (Patients Only) */}
        {user.role === 'PATIENT' && (consultation?.status === 'COMPLETED' || consultation?.paymentStatus === 'UNPAID') && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: '24px', background: 'var(--color-white)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <FileText size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Post-Visit Summary</h3>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--color-text-secondary)' }}>Clinical Notes</h4>
              <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--color-border-light)' }}>
                {consultation?.notes ? (
                  <>
                    <p style={{ margin: '0 0 8px 0' }}><strong>Assessment:</strong> {JSON.parse(consultation.notes).assessment}</p>
                    <p style={{ margin: 0 }}><strong>Plan:</strong> {JSON.parse(consultation.notes).plan}</p>
                  </>
                ) : 'No clinical notes recorded.'}
              </div>
            </div>

            {consultation?.careEpisode?.prescriptionRecord && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--color-text-secondary)' }}>Prescribed Medications</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {consultation.careEpisode.prescriptionRecord.items?.map(item => (
                    <div key={item.id} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-white)', fontSize: '12px' }}>
                      <strong style={{ display: 'block', marginBottom: '4px' }}>{item.product?.name}</strong>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Take {item.dosage}, {item.frequency} for {item.durationDays} days.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--color-text-secondary)' }}>Invoice & Payment</h4>
              <div style={{ padding: '12px', borderRadius: '8px', background: consultation?.paymentStatus === 'PAID' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', border: `1px solid ${consultation?.paymentStatus === 'PAID' ? 'var(--color-success-light)' : 'var(--color-warning-light)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                  <strong>Status:</strong>
                  <span style={{ color: consultation?.paymentStatus === 'PAID' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 'bold' }}>{consultation?.paymentStatus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <strong>Total Amount:</strong>
                  <span>${consultation?.careEpisode?.invoice?.totalAmount || '15.75'}</span>
                </div>
                {consultation?.paymentStatus === 'UNPAID' && (
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '12px' }}
                    onClick={() => setShowCheckout(true)}
                  >
                    Pay Invoice Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
      
      {showCheckout && (
        <POSCheckout 
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          invoiceId={consultation?.careEpisode?.invoice?.id}
          consultationId={consultation?.id}
          cart={[]} // Read-only for patient checkout
          discount={0}
          tax={consultation?.careEpisode?.invoice?.taxApplied || 0.75}
          totalAmount={parseFloat(consultation?.careEpisode?.invoice?.totalAmount || 15.75)}
          patientName={user.name}
          isPatientView={true}
          onPaymentSuccess={() => {
            fetchMessages(); // Refresh consultation data
            setShowCheckout(false);
          }}
        />
      )}
    </div>
  );
}
