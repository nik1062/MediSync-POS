import React, { useState, useEffect, useRef } from 'react';
import { POSCheckout } from './POSCheckout';
import { posAPI, productAPI } from '../api';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Coins, 
  ShieldAlert,
  Clock,
  Search,
  UserCheck
} from 'lucide-react';

const POS_SERVICES = [
  { id: 'srv_1', name: 'General Practitioner Consultation', price: 15.00, category: 'Consult' },
  { id: 'srv_2', name: 'Specialist Consultation', price: 50.00, category: 'Consult' },
  { id: 'srv_3', name: 'Complete Blood Count (CBC) Panel', price: 35.00, category: 'Labs' },
  { id: 'srv_4', name: 'Rapid COVID/Flu Swab Test', price: 25.00, category: 'Labs' },
  { id: 'srv_5', name: '12-Lead Electrocardiogram (ECG)', price: 45.00, category: 'Diagnostics' },
  { id: 'srv_6', name: 'X-Ray Imaging & Report', price: 75.00, category: 'Diagnostics' },
  { id: 'srv_7', name: 'Therapeutic Joint Injection', price: 60.00, category: 'Procedures' },
  { id: 'srv_8', name: 'Physical Therapy Session', price: 55.00, category: 'Procedures' },
];

export function POSTerminal({ user }) {
  const [cart, setCart] = useState([]);
  const [patientName, setPatientName] = useState('Walk-in Patient');
  const [discount, setDiscount] = useState(0);
  const [taxRate] = useState(0.05); // 5% flat healthcare tax
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null); // The invoice we are currently paying

  // Patient Lookup State
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [patientResults, setPatientResults] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const { data } = await posAPI.searchPatients(searchQuery);
          setPatientResults(data.data || []);
        } catch (err) {
          console.error(err);
        }
      } else {
        setPatientResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Controlled Substance Confirmation Modal
  const [showControlledModal, setShowControlledModal] = useState(false);

  // Shift Management State
  const [shift, setShift] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [shiftAction, setShiftAction] = useState('OPEN'); // 'OPEN' or 'CLOSE'

  const fetchShiftStatus = async () => {
    try {
      const { data } = await posAPI.getShift();
      if (data.data) {
        setShift(data.data);
      } else {
        setShift(null);
        setShiftAction('OPEN');
        setShowShiftModal(true);
      }
    } catch (err) {
      console.error('Failed to load shift status:', err);
    }
  };

  const fetchRecentInvoices = async () => {
    try {
      const { data } = await posAPI.getInvoices();
      setRecentInvoices(data.data);
    } catch (err) {
      console.error('Failed to load recent invoices:', err);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'DOCTOR' || user.role === 'PHARMACIST')) {
      fetchShiftStatus();
      fetchRecentInvoices();
    }
  }, [user]);

  const handleOpenShift = async (e) => {
    e.preventDefault();
    try {
      const { data } = await posAPI.openShift({ openingBalance: parseFloat(openingBalance || 0) });
      setShift(data.data);
      setShowShiftModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open shift');
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    try {
      const { data } = await posAPI.closeShift({ expectedClosingBalance: parseFloat(closingBalance || 0) });
      
      // Print Z-Report
      const closedShift = data.data;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Z-Report: Shift #${closedShift.id}</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 320px; font-size: 13px; line-height: 1.4; color: #111; }
              .text-center { text-align: center; }
              .divider { border-bottom: 1px dashed #333; margin: 12px 0; }
              .item-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
              .title { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
            </style>
          </head>
          <body onload="window.print()">
            <div class="text-center">
              <div class="title">MEDISYNC Z-REPORT</div>
              <div>End of Shift Reconciliation</div>
            </div>
            <div class="divider"></div>
            <div>Opened: ${new Date(closedShift.openedAt).toLocaleString()}</div>
            <div>Closed: ${new Date(closedShift.closedAt).toLocaleString()}</div>
            <div>Cashier ID: ${closedShift.userId.substring(0,8)}</div>
            <div class="divider"></div>
            <div class="item-row">
              <div>Opening Balance:</div>
              <div>$${parseFloat(closedShift.openingBalance).toFixed(2)}</div>
            </div>
            <div class="item-row">
              <div>Total Cash Sales:</div>
              <div>$${parseFloat(closedShift.totalCashSales).toFixed(2)}</div>
            </div>
            <div class="item-row">
              <div>Total Card Sales:</div>
              <div>$${parseFloat(closedShift.totalCardSales).toFixed(2)}</div>
            </div>
            <div class="item-row">
              <div>Total UPI Sales:</div>
              <div>$${parseFloat(closedShift.totalUpiSales).toFixed(2)}</div>
            </div>
            <div class="divider"></div>
            <div class="item-row" style="font-weight: bold; font-size: 15px;">
              <div>Expected Cash:</div>
              <div>$${parseFloat(closedShift.closingBalance).toFixed(2)}</div>
            </div>
            <div class="item-row" style="font-weight: bold;">
              <div>Actual Declared:</div>
              <div>$${parseFloat(closedShift.expectedClosingBalance).toFixed(2)}</div>
            </div>
            <div class="divider"></div>
            <div class="text-center" style="font-size: 11px;">
              <div>Difference: $${(parseFloat(closedShift.expectedClosingBalance) - parseFloat(closedShift.closingBalance)).toFixed(2)}</div>
              <div style="margin-top: 8px;">Signature: ________________</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();

      setShift(null);
      setShiftAction('OPEN');
      setOpeningBalance('');
      setClosingBalance('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close shift');
    }
  };

  // Barcode Scanner Listener
  const barcodeBufferRef = useRef('');
  const barcodeTimeoutRef = useRef(null);

  const handleBarcodeScan = async (barcode) => {
    try {
      const { data } = await productAPI.search(barcode);
      if (data.data && data.data.length > 0) {
        // Find exact SKU match if possible, otherwise first result
        const product = data.data.find(p => p.sku === barcode) || data.data[0];
        addToCart(product);
      } else {
        alert(`No product found for barcode: ${barcode}`);
      }
    } catch (err) {
      console.error('Barcode scan failed:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length >= 3) {
          handleBarcodeScan(barcodeBufferRef.current);
        }
        barcodeBufferRef.current = '';
        if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
        return;
      }

      if (e.key.length === 1 && /[a-zA-Z0-9\-]/.test(e.key)) {
        barcodeBufferRef.current += e.key;
        
        if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
        barcodeTimeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = '';
        }, 50); // 50ms threshold for physical barcode scanners
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
    };
  }, []);

  // Not deriving from recentInvoices anymore because we are using global search
  const handleSelectPatient = async (patient) => {
    setSearchQuery(patient.name);
    setPatientName(patient.name);
    setShowDropdown(false);

    try {
      const { data } = await posAPI.lookup(patient.id, null);
      const episode = data.data;
      
      const newCart = [];
      setActiveInvoiceId(episode.invoice?.id || null);
      
      // Add consultation fee if invoice has it but it's not paid yet
      if (episode.invoice && episode.invoice.paymentStatus === 'UNPAID' && episode.invoice.items) {
         episode.invoice.items.forEach(invItem => {
           newCart.push({
             id: `invItem_${invItem.id}`,
             name: invItem.itemName,
             price: parseFloat(invItem.price),
             quantity: 1,
             isExistingInvoiceItem: true,
           });
         });
      }

        // Auto-load prescribed medications
        if (episode.prescriptionRecord && episode.prescriptionRecord.items) {
          episode.prescriptionRecord.items.forEach(pItem => {
            const qtyRemaining = pItem.quantityPrescribed - pItem.quantityDispensed;
            if (qtyRemaining > 0 && pItem.product) {
              newCart.push({
                id: pItem.product.id,
                productId: pItem.product.id,
                prescriptionItemId: pItem.id,
                name: pItem.product.name,
                price: parseFloat(pItem.product.price),
                quantity: qtyRemaining,
                scheduleClass: pItem.scheduleClass,
                isPrescription: true,
              });
            }
          });
        }
        
        setCart(newCart);
      } catch (err) {
        if (err.response?.status === 404) {
          alert('No active care episode found for this patient.');
        } else {
          console.error('Failed to lookup care episode for patient', err);
          alert('Failed to load patient prescription cart.');
        }
      }
  };

  // Cart operations
  const addToCart = (service) => {
    const existing = cart.find(item => item.id === service.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...service, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const finalTotal = parseFloat((subtotal + tax - parseFloat(discount || 0)).toFixed(2));

  // Check for controlled substances
  const hasControlledSubstances = cart.some(item => ['H1', 'X'].includes(item.scheduleClass));

  // Open checkout modal
  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Please add at least one medical service or product to the invoice.');
      return;
    }

    if (hasControlledSubstances) {
      setShowControlledModal(true);
    } else {
      setCheckoutOpen(true);
    }
  };

  const confirmControlledCheckout = () => {
    setShowControlledModal(false);
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = (invoice) => {
    printReceipt(invoice);
    setCart([]);
    setPatientName('Walk-in Patient');
    setSearchQuery('');
    setActiveInvoiceId(null);
    setDiscount(0);
    fetchRecentInvoices();
  };

  const printReceipt = (inv) => {
    const printWindow = window.open('', '_blank');
    const itemsList = inv.items || JSON.parse(inv.items || '[]');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>MediSync POS Invoice #${inv.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 320px; font-size: 13px; line-height: 1.4; color: #111; }
            .text-center { text-align: center; }
            .divider { border-bottom: 1px dashed #333; margin: 12px 0; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .title { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
            .total { font-weight: bold; font-size: 15px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="text-center">
            <div class="title">MEDISYNC CLINIC POS</div>
            <div>Official Checkout Terminal</div>
          </div>
          <div class="divider"></div>
          <div>Date: ${new Date(inv.createdAt).toLocaleString()}</div>
          <div>Invoice ID: #${inv.id}</div>
          <div>Patient: ${inv.patientName || 'Walk-in'}</div>
          <div class="divider"></div>
          
          <div style="font-weight: bold; margin-bottom: 8px;">SERVICES & DRUGS</div>
          ${itemsList.map(item => `
            <div class="item-row">
              <div>${item.itemName || item.name}</div>
              <div>$${parseFloat(item.price).toFixed(2)}</div>
            </div>
          `).join('')}
          
          <div class="divider"></div>
          <div class="item-row total">
            <div>TOTAL PAID:</div>
            <div>$${parseFloat(inv.totalAmount).toFixed(2)}</div>
          </div>
          <div class="divider"></div>
          <div class="text-center" style="font-size: 11px;">
            <div>Payment: ${inv.paymentMethod} (${inv.paymentStatus})</div>
            <div style="margin-top: 8px; font-weight: bold;">THANK YOU FOR YOUR TRUST</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const categories = ['All', 'Consult', 'Labs', 'Diagnostics', 'Procedures'];
  const filteredServices = activeCategory === 'All' 
    ? POS_SERVICES 
    : POS_SERVICES.filter(s => s.category === activeCategory);

  if (!user || (user.role !== 'DOCTOR' && user.role !== 'PHARMACIST')) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <ShieldAlert size={48} style={{ color: 'var(--color-danger)', marginBottom: '16px', margin: '0 auto' }} />
        <h3>Access Restricted</h3>
        <p>The POS Billing Terminal is exclusively accessible to authorized Doctor or Pharmacist roles.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ marginBottom: '6px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>Clinical POS Terminal</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Issue quick walk-in billing tickets, collect payments, and dispense prescriptions.</p>
        </div>
        {shift && (
          <button 
            type="button" 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            onClick={() => { setShiftAction('CLOSE'); setShowShiftModal(true); }}
          >
            <Trash2 size={16} /> Close Register Shift
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: Quick Services Catalog Grid */}
        <div>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '100px',
                  border: '1px solid var(--color-border)',
                  background: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-white)',
                  color: activeCategory === cat ? 'white' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {filteredServices.map(srv => (
              <button
                key={srv.id}
                type="button"
                onClick={() => addToCart(srv)}
                className="card hover-target"
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{srv.category}</span>
                <strong style={{ fontSize: '13px', color: 'var(--color-text)', display: 'block', minHeight: '36px', lineHeight: '1.4' }}>{srv.name}</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto', borderTop: '1px dashed var(--color-border-light)', paddingTop: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text)' }}>${srv.price.toFixed(2)}</span>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>+</span>
                </div>
              </button>
            ))}
          </div>

          {/* Recent Invoices History Section */}
          <div className="card" style={{ marginTop: '28px', padding: '20px', background: 'var(--color-white)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
              <Clock size={16} />
              <span>Today's Receipts Register</span>
            </h3>
            
            {recentInvoices.filter(i => i.paymentStatus === 'PAID').length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>No paid transactions recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {recentInvoices.filter(i => i.paymentStatus === 'PAID').map(inv => (
                  <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: '8px', fontSize: '12px' }}>
                    <div>
                      <strong style={{ color: 'var(--color-text)' }}>{inv.patientName}</strong>
                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Method: {inv.paymentMethod}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <strong style={{ fontSize: '13px' }}>${parseFloat(inv.totalAmount).toFixed(2)}</strong>
                      <button 
                        onClick={() => printReceipt(inv)} 
                        style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '4px' }}
                        title="Print Receipt"
                      >
                        <Printer size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Cart Calculator */}
        <div className="card" style={{ padding: '24px', background: 'var(--color-white)', position: 'sticky', top: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Coins size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Active Checkout Cart</span>
          </h2>

          <div style={{ padding: '12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '8px', borderRadius: '6px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
            </div>
            <div>
              <strong style={{ fontSize: '12px', color: 'var(--color-text)', display: 'block' }}>Barcode Scanner Ready</strong>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Point HID scanner and scan SKU</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px', position: 'relative' }}>
            <label className="form-label">Patient Lookup (Auto-load Cart)</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '34px' }}
                value={searchQuery} 
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setPatientName(e.target.value);
                  setShowDropdown(true);
                  if (e.target.value === '') {
                    setActiveInvoiceId(null);
                    setCart([]);
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search patient name to load prescriptions..."
              />
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchQuery && patientResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', zIndex: 10, marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                {patientResults.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => handleSelectPatient(p)}
                    style={{ padding: '12px', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px', color: 'var(--color-text)' }}>{p.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{p.phone || p.email}</span>
                    </div>
                    <UserCheck size={16} style={{ color: 'var(--color-primary)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart items list */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px', background: 'var(--color-bg)', minHeight: '160px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '130px', color: 'var(--color-text-muted)' }}>
                <span style={{ fontSize: '24px', marginBottom: '8px' }}>🛒</span>
                <p style={{ margin: 0, fontSize: '12px' }}>Checkout cart is empty.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-white)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                    <div style={{ maxWidth: '60%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '12px', color: 'var(--color-text)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</strong>
                        {['H1', 'X'].includes(item.scheduleClass) && (
                          <span style={{ fontSize: '9px', fontWeight: 'bold', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '2px 4px', borderRadius: '4px' }}>{item.scheduleClass}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {item.isPrescription ? 'Rx Item' : 'Service'} • ${item.price.toFixed(2)} each
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg)', borderRadius: '6px', padding: '2px 4px' }}>
                        <button type="button" onClick={() => updateQuantity(item.id, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} disabled={item.isExistingInvoiceItem}><Minus size={12} /></button>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '14px', textAlign: 'center' }}>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} disabled={item.isExistingInvoiceItem}><Plus size={12} /></button>
                      </div>
                      {!item.isExistingInvoiceItem && (
                        <button type="button" onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing breakdown */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal:</span>
              <strong style={{ color: 'var(--color-text)' }}>${subtotal.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Discount ($):</span>
              <input 
                type="number" 
                className="form-input" 
                style={{ width: '80px', height: '28px', padding: '4px 8px', fontSize: '12px', textAlign: 'right' }} 
                value={discount} 
                onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Healthcare Tax (5%):</span>
              <strong style={{ color: 'var(--color-text)' }}>${tax.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-border)', paddingTop: '12px', marginTop: '4px', fontSize: '16px' }}>
              <strong style={{ color: 'var(--color-text)' }}>Final Total:</strong>
              <strong style={{ color: 'var(--color-primary)', fontSize: '18px' }}>${finalTotal.toFixed(2)}</strong>
            </div>
          </div>

          {/* Checkout controls */}
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              <Printer size={16} />
              <span>Checkout & Print Receipt</span>
            </button>
          </div>
        </div>

      </div>

      {/* Controlled Substance Warning Modal */}
      {showControlledModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ background: 'var(--color-warning-bg)', padding: '16px', borderRadius: '50%', color: 'var(--color-warning)' }}>
                <ShieldAlert size={48} />
              </div>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', marginBottom: '16px', color: 'var(--color-text)' }}>Controlled Substance Verification</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '24px', lineHeight: '1.6' }}>
              This cart contains a <strong>Schedule H1 or X</strong> controlled substance. You are required by law to verify the patient's valid prescription and government ID before dispensing. 
            </p>
            <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '32px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text)', display: 'flex', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                <span>This action will be permanently recorded in the immutable audit trail under your operator ID.</span>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '12px' }} 
                onClick={() => setShowControlledModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '12px', background: 'var(--color-warning)', borderColor: 'var(--color-warning)' }} 
                onClick={confirmControlledCheckout}
              >
                Verify & Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Management Modal */}
      {showShiftModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', color: 'var(--color-text)', textAlign: 'center' }}>
              {shiftAction === 'OPEN' ? 'Open Register Shift' : 'Close Register Shift (Z-Report)'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
              {shiftAction === 'OPEN' ? 'Enter the starting cash float in the drawer.' : 'Enter the actual cash currently in the drawer.'}
            </p>
            
            <form onSubmit={shiftAction === 'OPEN' ? handleOpenShift : handleCloseShift}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">{shiftAction === 'OPEN' ? 'Opening Balance ($)' : 'Actual Cash in Drawer ($)'}</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-input" 
                  style={{ fontSize: '18px', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}
                  value={shiftAction === 'OPEN' ? openingBalance : closingBalance}
                  onChange={e => shiftAction === 'OPEN' ? setOpeningBalance(e.target.value) : setClosingBalance(e.target.value)}
                  placeholder="0.00"
                  required
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px', fontSize: '16px', background: shiftAction === 'CLOSE' ? 'var(--color-danger)' : 'var(--color-primary)', borderColor: shiftAction === 'CLOSE' ? 'var(--color-danger)' : 'var(--color-primary)' }}
              >
                {shiftAction === 'OPEN' ? 'Open Shift' : 'Print Z-Report & Close Shift'}
              </button>
            </form>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <POSCheckout 
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          invoiceId={activeInvoiceId} // Pass active invoice if we are paying an existing one
          cart={cart}
          discount={parseFloat(discount || 0)}
          tax={tax}
          totalAmount={finalTotal}
          patientName={patientName}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
