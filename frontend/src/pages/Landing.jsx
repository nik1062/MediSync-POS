import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, CheckCircle, Database, Check, Activity, Zap, Users, FileText, Smartphone, Clock, Stethoscope, Briefcase, ChevronRight, BarChart3, ScanLine, Pill } from 'lucide-react';
import { RaceSimulator } from '../components/RaceSimulator';
import { AuditLogTerminal } from '../components/AuditLogTerminal';

export function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page" style={{ background: 'var(--color-bg)', minHeight: '100vh', overflowX: 'hidden', color: 'var(--color-text)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(13, 148, 136, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-glow {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150vw;
          height: 100vh;
          background: radial-gradient(ellipse at center, rgba(13,148,136,0.15) 0%, rgba(248,250,252,0) 70%);
          z-index: 0;
          pointer-events: none;
        }
        .glass-nav {
          background: ${scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent'};
          backdrop-filter: ${scrolled ? 'blur(12px)' : 'none'};
          border-bottom: ${scrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent'};
          transition: all 0.3s ease;
        }
        .feature-img-container {
          position: relative;
          z-index: 1;
          background: var(--color-white);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 20px;
          padding: 12px;
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05);
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease;
          backdrop-filter: blur(10px);
        }
        .feature-img-container:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 40px 80px -20px rgba(13, 148, 136, 0.2), 0 0 0 1px rgba(13, 148, 136, 0.1);
        }
        .floating-badge {
          position: absolute;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0,0,0,0.05);
          padding: 12px 20px;
          border-radius: 100px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text);
          animation: float 6s ease-in-out infinite;
          z-index: 10;
        }
        .hover-card {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .hover-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
        }
        .hover-card:hover::before {
          transform: scaleX(1);
        }
        .stat-block {
          text-align: center;
          padding: 30px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
        }
        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          color: var(--color-primary);
          margin-bottom: 8px;
          letter-spacing: -1px;
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--color-text) 0%, var(--color-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Navigation */}
      <header className="landing-nav glass-nav" style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, width: '100%', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--color-primary), #0f766e)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '22px', boxShadow: '0 4px 10px rgba(13,148,136,0.3)' }}>
            +
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>MediSync</span>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '24px', marginRight: '24px', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '15px' }}>
            <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
            <a href="#telehealth" style={{ color: 'inherit', textDecoration: 'none' }}>Telehealth</a>
            <a href="#pos" style={{ color: 'inherit', textDecoration: 'none' }}>Pharmacy POS</a>
          </div>
          <button className="btn btn-ghost" style={{ fontWeight: 600, fontSize: '15px' }} onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" style={{ padding: '12px 28px', fontWeight: 600, borderRadius: '10px', fontSize: '15px', animation: 'pulse-glow 2s infinite' }} onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero" style={{ padding: '180px 48px 120px 48px', maxWidth: '1400px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div className="hero-glow"></div>
        <div style={{ position: 'relative', zIndex: 1, animation: 'slide-up 0.8s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 24px', background: 'rgba(13,148,136,0.1)', color: 'var(--color-primary)', borderRadius: '100px', fontSize: '14px', fontWeight: '700', marginBottom: '32px', border: '1px solid rgba(13,148,136,0.2)' }}>
            <Zap size={16} fill="currentColor" />
            <span>The Complete Healthcare Operating System</span>
          </div>

          <h1 style={{ fontSize: '6rem', lineHeight: '1.05', fontWeight: '800', letterSpacing: '-0.04em', color: 'var(--color-text)', marginBottom: '32px' }}>
            Healthcare infrastructure,<br /><span className="gradient-text">built for operational reality.</span>
          </h1>
          
          <p style={{ margin: '0 auto 48px auto', fontSize: '22px', color: 'var(--color-text-secondary)', maxWidth: '850px', lineHeight: '1.6', fontWeight: '400' }}>
            Unify your entire clinic. From patient discovery and AI-powered telehealth, to an enterprise-grade pharmacy POS with FEFO inventory and controlled-substance gating.
          </p>
          
          <div className="landing-cta-group" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '100px' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 40px', borderRadius: '12px', fontWeight: '700', fontSize: '18px', boxShadow: '0 10px 25px -5px rgba(13,148,136,0.4)' }} onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>
              <span>Launch Your Clinic</span>
              <ArrowRight size={20} />
            </button>
            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 40px', borderRadius: '12px', fontWeight: '700', fontSize: '18px', background: 'white' }} onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              <span>Explore Features</span>
            </button>
          </div>

          {/* Real Product Screenshot */}
          <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="floating-badge" style={{ top: '-20px', left: '-30px', animationDelay: '0s' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-success)' }}></div>
              Live WhatsApp Sync
            </div>
            <div className="floating-badge" style={{ bottom: '40px', right: '-40px', animationDelay: '2s' }}>
              <ScanLine size={18} color="var(--color-primary)" />
              Barcode POS Ready
            </div>
            <div className="floating-badge" style={{ top: '40%', right: '-20px', animationDelay: '4s' }}>
              <Activity size={18} color="var(--color-danger)" />
              AI SOAP Notes
            </div>
            <div className="feature-img-container">
              <img src="/images/hero_dashboard_pos.jpg" alt="MediSync POS and Dashboard Interface" style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ background: 'var(--color-white)', padding: '60px 48px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <div className="stat-block">
            <div className="stat-number">3x</div>
            <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Faster Consultations</div>
          </div>
          <div className="stat-block">
            <div className="stat-number">100%</div>
            <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>H1/X Drug Compliance</div>
          </div>
          <div className="stat-block">
            <div className="stat-number">0</div>
            <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Double Bookings</div>
          </div>
          <div className="stat-block">
            <div className="stat-number">FEFO</div>
            <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Automated Inventory</div>
          </div>
        </div>
      </section>

      {/* Feature Pillar 1: Discovery & Booking (Patient View) */}
      <section id="features" style={{ padding: '160px 48px', maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '100px' }}>
        <div style={{ flex: '1 1 45%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '100px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px' }}>
            <Users size={16} /> 01 / Patient Experience
          </div>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.03em' }}>
            The Modern Way to <br />Manage Family Health.
          </h2>
          <p style={{ fontSize: '20px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '40px' }}>
            Give your patients a world-class app experience. They can discover clinics via geolocation, book appointments for dependents, and access a secure Digital Health Locker.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '50%', padding: '6px', marginTop: '4px' }}><Check size={20} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--color-text)', marginBottom: '6px' }}>Family Profiles & Dependents</strong>
                <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.5, display: 'block' }}>Manage children and elderly parents under one unified wallet and booking system.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '50%', padding: '6px', marginTop: '4px' }}><Check size={20} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--color-text)', marginBottom: '6px' }}>Medication Adherence Reminders</strong>
                <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.5, display: 'block' }}>Patients automatically receive WhatsApp ping reminders to take their prescribed medicines.</span>
              </div>
            </li>
          </ul>
        </div>
        <div style={{ flex: '1 1 55%' }}>
          <div className="feature-img-container" style={{ padding: '16px' }}>
            <img src="/images/booking_ui.jpg" alt="Patient Discovery and Booking UI" style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block' }} />
          </div>
          <RaceSimulator />
        </div>
      </section>

      {/* Feature Pillar 2: Telehealth & Clinical Workflow (Doctor View) */}
      <section id="telehealth" style={{ padding: '160px 48px', background: 'linear-gradient(to bottom, var(--color-white), var(--color-bg))', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '100px', flexDirection: 'row-reverse' }}>
          <div style={{ flex: '1 1 45%' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '100px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px' }}>
              <Stethoscope size={16} /> 02 / Clinical Excellence
            </div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.03em' }}>
              AI-Structured SOAP &<br />Telehealth Built-In.
            </h2>
            <p style={{ fontSize: '20px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '40px' }}>
              Doctors can launch WebRTC video consults with one click. Transcribe notes with your voice and let our AI automatically structure them into formal SOAP documentation.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '50%', padding: '6px', marginTop: '4px' }}><Check size={20} /></div>
                <div>
                  <strong style={{ display: 'block', fontSize: '18px', color: 'var(--color-text)', marginBottom: '6px' }}>Web Speech Dictation</strong>
                  <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.5, display: 'block' }}>Stop typing. Dictate patient symptoms and let the browser accurately transcribe it in real-time.</span>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '50%', padding: '6px', marginTop: '4px' }}><Check size={20} /></div>
                <div>
                  <strong style={{ display: 'block', fontSize: '18px', color: 'var(--color-text)', marginBottom: '6px' }}>Direct Prescription Bridging</strong>
                  <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.5, display: 'block' }}>Prescriptions signed during the call are instantly transmitted to the pharmacy POS cart.</span>
                </div>
              </li>
            </ul>
          </div>
          <div style={{ flex: '1 1 55%' }} className="feature-img-container">
            <img src="/images/telehealth_soap_ui.jpg" alt="Telehealth Video and SOAP Notes UI" style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* Feature Pillar 3: POS & Inventory (Pharmacist View) */}
      <section id="pos" style={{ padding: '160px 48px', maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '100px' }}>
        <div style={{ flex: '1 1 45%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', borderRadius: '100px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px' }}>
            <Briefcase size={16} /> 03 / Pharmacy Operations
          </div>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.03em' }}>
            Enterprise POS with<br />FEFO Inventory Logic.
          </h2>
          <p style={{ fontSize: '20px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '40px' }}>
            A lightning-fast checkout terminal built for high-volume pharmacies. Includes physical HID barcode scanner support, Shift Drawer tracking, and Split Payments.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', borderRadius: '50%', padding: '6px', marginTop: '4px' }}><Check size={20} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--color-text)', marginBottom: '6px' }}>FEFO Auto-Deduction</strong>
                <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.5, display: 'block' }}>First-Expiring, First-Out routing ensures drugs nearest to expiry are deducted from the database first, reducing waste.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', borderRadius: '50%', padding: '6px', marginTop: '4px' }}><Check size={20} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--color-text)', marginBottom: '6px' }}>End-of-Day Shift Reconciliations</strong>
                <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.5, display: 'block' }}>Cashiers open and close their tills. The system tallies Cash vs Card vs UPI and highlights discrepancies in a printable Z-Report.</span>
              </div>
            </li>
          </ul>
        </div>
        <div style={{ flex: '1 1 55%' }}>
          <div className="feature-img-container" style={{ padding: '16px' }}>
            <img src="/images/pharmacy_pos_ui.jpg" alt="Pharmacy POS and Inventory Management UI" style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block' }} />
          </div>
          <div style={{ marginTop: '40px' }}>
            <AuditLogTerminal />
          </div>
        </div>
      </section>

      {/* Pricing Section - Step 1 of Sign Up */}
      <section id="pricing" className="landing-section" style={{ padding: '140px 48px', background: 'linear-gradient(180deg, var(--color-white) 0%, var(--color-bg) 100%)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '16px', letterSpacing: '-0.02em' }}>Select your POS Subscription</h2>
          <p style={{ fontSize: '20px', maxWidth: '650px', margin: '0 auto 80px auto', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            Choose a plan to create your clinic workspace. All plans include full POS integration, telehealth, and controlled-substance gating.
          </p>
        </div>

        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="hover-card" style={{ background: 'var(--color-white)', padding: '48px 40px', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: '800', color: 'var(--color-text-secondary)', marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Developer Sandbox</div>
            <div style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '16px', letterSpacing: '-2px' }}>$0<span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', letterSpacing: '0' }}>/mo</span></div>
            <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '32px', minHeight: '48px', lineHeight: '1.5' }}>Perfect for testing the workspace environment locally.</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '16px', color: 'var(--color-text)' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span style={{ fontWeight: 500 }}>1 Active Doctor Profile</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span style={{ fontWeight: 500 }}>SQLite Database Synced</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span style={{ fontWeight: 500 }}>Basic Live Chat Messages</span></li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700, borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)', borderRadius: '12px' }} onClick={() => navigate('/onboarding?plan=professional')}>Start Free Trial</button>
          </div>

          <div className="hover-card" style={{ background: 'var(--color-primary)', padding: '48px 40px', borderRadius: '24px', position: 'relative', color: 'white', boxShadow: '0 25px 50px -12px rgba(13, 148, 136, 0.4)' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#0f766e', color: 'white', padding: '8px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>Most Popular</div>
            <div style={{ fontWeight: '800', color: 'rgba(255,255,255,0.8)', marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Professional Clinic</div>
            <div style={{ fontSize: '4rem', fontWeight: '800', color: 'white', marginBottom: '16px', letterSpacing: '-2px' }}>$49<span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0' }}>/mo</span></div>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '32px', minHeight: '48px', lineHeight: '1.5' }}>Built for independent clinics and practitioners.</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '16px', color: 'white' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-success-light)" /> <span style={{ fontWeight: 500 }}>Unlimited Consultations</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-success-light)" /> <span style={{ fontWeight: 500 }}>Full Pharmacy POS Sync</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-success-light)" /> <span style={{ fontWeight: 500 }}>Dynamic Booking Engine</span></li>
            </ul>
            <button className="btn" style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700, borderRadius: '12px', background: 'white', color: 'var(--color-primary)' }} onClick={() => navigate('/onboarding?plan=professional')}>Select Plan &amp; Register</button>
          </div>

          <div className="hover-card" style={{ background: 'var(--color-white)', padding: '48px 40px', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: '800', color: 'var(--color-text-secondary)', marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Medical Group</div>
            <div style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '16px', letterSpacing: '-2px' }}>$129<span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', letterSpacing: '0' }}>/mo</span></div>
            <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '32px', minHeight: '48px', lineHeight: '1.5' }}>Designed for group clinics with multiple practitioners.</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '16px', color: 'var(--color-text)' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span style={{ fontWeight: 500 }}>Up to 10 Doctor Staff</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span style={{ fontWeight: 500 }}>PostgreSQL Database Core</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span style={{ fontWeight: 500 }}>Immutable Audit Exporting</span></li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700, borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)', borderRadius: '12px' }} onClick={() => navigate('/onboarding?plan=professional')}>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Expanded FAQ Section */}
      <section style={{ padding: '120px 48px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '20px', letterSpacing: '-0.02em' }}>Architecture &amp; Security FAQ</h2>
          <p style={{ fontSize: '20px', color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto' }}>Deep dive into our operational architecture and compliance standards.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '50px' }}>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '16px' }}>How does the POS enforce Schedule H1 restrictions?</h4>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.7', margin: 0 }}>
              The Product model utilizes a scheduleClass field. When checkout is initiated via payInvoice, the backend halts the transaction if the item is classified as H1 or X unless it is explicitly linked to a valid prescriptionItemId authored by an authorized doctor.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '16px' }}>Are telehealth sessions peer-to-peer or relayed?</h4>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.7', margin: 0 }}>
              Sessions leverage WebRTC for direct, encrypted P2P media streams. Websockets are used strictly as a signaling layer and for transmitting structured clinical vitals in real-time.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '16px' }}>How is stock overselling prevented?</h4>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.7', margin: 0 }}>
              Our ORM utilizes Sequelize transaction wrapper alongside t.LOCK.UPDATE. This acquires a row-level lock on the specific Product record during checkout, ensuring consecutive requests queue sequentially at the database level.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '16px' }}>What happens if a transaction rolls back?</h4>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.7', margin: 0 }}>
              Due to atomic operations, if an invoice payment fails due to insufficient stock or failed H1 compliance, the entire transaction rolls back — meaning no false audit logs are created and no stock is erroneously deducted.
            </p>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer style={{ padding: '80px 48px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-secondary)', fontSize: '15px', background: 'var(--color-white)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--color-text)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            +
          </div>
          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>&copy; {new Date().getFullYear()} MediSync Clinical Technologies Inc.</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', fontWeight: 500 }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={e => e.target.style.color='var(--color-primary)'} onMouseOut={e => e.target.style.color='var(--color-text-secondary)'}>Privacy Policy</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={e => e.target.style.color='var(--color-primary)'} onMouseOut={e => e.target.style.color='var(--color-text-secondary)'}>Terms of Service</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={e => e.target.style.color='var(--color-primary)'} onMouseOut={e => e.target.style.color='var(--color-text-secondary)'}>Security Architecture</span>
        </div>
      </footer>
    </div>
  );
}
