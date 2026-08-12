import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Coins, 
  CreditCard, 
  QrCode, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { posAPI, consultationAPI } from '../api';

export function POSCheckout({ 
  isOpen, 
  onClose, 
  cart, 
  discount, 
  tax, 
  totalAmount, 
  patientName,
  consultationId,
  invoiceId,
  isPatientView,
  onPaymentSuccess 
}) {
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH' | 'CARD' | 'UPI' | 'MIXED'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Split payment state
  const [insuranceAmount, setInsuranceAmount] = useState(0);

  if (!isOpen) return null;

  const processPayment = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let targetInvoiceId = invoiceId;
      
      // If we don't have an active invoice, generate a fresh walk-in invoice
      if (!targetInvoiceId) {
        const generateRes = await posAPI.generate({
          consultationId: consultationId || null,
          patientName,
          items: cart.filter(c => !c.isPrescription).map(item => ({ itemName: item.name, price: item.price })),
          discount
        });
        targetInvoiceId = generateRes.data.data.id;
      }

      // Map cart items for the pay endpoint so backend knows what stock to deduct
      const payItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        prescriptionItemId: item.prescriptionItemId
      })).filter(i => i.productId); // only send product items to deduct stock

      // 2. Perform checkout payment transaction update
      let payRes;
      if (isPatientView) {
        payRes = await consultationAPI.payPatientInvoice(consultationId, {
          paymentMethod,
          items: payItems,
          ...(paymentMethod === 'MIXED' && {
            insuranceClaimAmount: parseFloat(insuranceAmount || 0),
            patientPayableAmount: Math.max(0, totalAmount - parseFloat(insuranceAmount || 0))
          })
        });
      } else {
        payRes = await posAPI.pay(targetInvoiceId, {
          paymentMethod,
          items: payItems,
          ...(paymentMethod === 'MIXED' && {
            insuranceClaimAmount: parseFloat(insuranceAmount || 0),
            patientPayableAmount: Math.max(0, totalAmount - parseFloat(insuranceAmount || 0))
          })
        });
      }

      // Complete checkout workflow
      onPaymentSuccess(payRes.data.data);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'POS Payment transaction failed. Check subscription status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--color-white)',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        animation: 'scaleIn 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-bg-alt)'
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>POS Checkout Terminal</h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>Patient: {patientName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {errorMsg && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-light)', borderRadius: '8px', marginBottom: '20px', color: 'var(--color-danger)', fontSize: '13px' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pricing Box */}
          <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border-light)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal:</span>
                <strong>${(totalAmount - tax + discount).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Discount:</span>
                <strong style={{ color: 'var(--color-danger)' }}>-${discount.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Tax (5%):</span>
                <strong>${tax.toFixed(2)}</strong>
              </div>
              <div style={{ height: '1px', borderBottom: '1px dashed var(--color-border-light)', margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--color-text)' }}>Final Amount Due:</span>
                <strong style={{ color: 'var(--color-primary)' }}>${totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Selection tabs */}
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '12px', letterSpacing: '0.05em' }}>Choose payment mode</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
            {/* Cash button */}
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              style={{
                padding: '12px 6px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: paymentMethod === 'CASH' ? 'rgba(13, 148, 136, 0.1)' : 'white',
                borderColor: paymentMethod === 'CASH' ? 'var(--color-primary)' : 'var(--color-border)',
                color: paymentMethod === 'CASH' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Coins size={18} />
              <span>Cash</span>
            </button>

            {/* Card button */}
            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              style={{
                padding: '12px 6px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: paymentMethod === 'CARD' ? 'rgba(13, 148, 136, 0.1)' : 'white',
                borderColor: paymentMethod === 'CARD' ? 'var(--color-primary)' : 'var(--color-border)',
                color: paymentMethod === 'CARD' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <CreditCard size={18} />
              <span>Card</span>
            </button>

            {/* UPI QR button */}
            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              style={{
                padding: '12px 6px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: paymentMethod === 'UPI' ? 'rgba(13, 148, 136, 0.1)' : 'white',
                borderColor: paymentMethod === 'UPI' ? 'var(--color-primary)' : 'var(--color-border)',
                color: paymentMethod === 'UPI' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <QrCode size={18} />
              <span>UPI QR</span>
            </button>

            {/* Split button */}
            <button
              type="button"
              onClick={() => setPaymentMethod('MIXED')}
              style={{
                padding: '12px 6px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: paymentMethod === 'MIXED' ? 'rgba(13, 148, 136, 0.1)' : 'white',
                borderColor: paymentMethod === 'MIXED' ? 'var(--color-primary)' : 'var(--color-border)',
                color: paymentMethod === 'MIXED' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '2px' }}>
                <Coins size={14} />
                <CreditCard size={14} />
              </div>
              <span>Split / Ins.</span>
            </button>
          </div>

          {/* Contextual Checkout Content */}
          {paymentMethod === 'UPI' && (
            <div style={{ textAlign: 'center', padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'white', padding: '10px', display: 'inline-block', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '8px' }}>
                {/* Simulated QR block */}
                <div style={{ width: '120px', height: '120px', background: '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                  [SCAN DYNAMIC QR]
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Scan with GPay, PhonePe, or PayTM</p>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Amount: ${totalAmount.toFixed(2)}</span>
            </div>
          )}

          {paymentMethod === 'CARD' && (
            <div style={{ padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', fontWeight: 600 }}>
                💳 Terminal connection ready. Please insert or tap card.
              </p>
            </div>
          )}

          {paymentMethod === 'CASH' && (
            <div style={{ padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', fontWeight: 600 }}>
                💵 Collect cash at the checkout counter and click Confirm below.
              </p>
            </div>
          )}

          {paymentMethod === 'MIXED' && (
            <div style={{ padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--color-text)', fontWeight: 600 }}>
                Insurance Adjudication / Split Payment
              </p>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '11px' }}>Amount Covered by Insurance ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-input" 
                  style={{ fontSize: '14px', padding: '8px' }}
                  value={insuranceAmount}
                  onChange={e => setInsuranceAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--color-border)', paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Patient Co-Pay Due:</span>
                <strong style={{ fontSize: '16px', color: 'var(--color-danger)' }}>
                  ${Math.max(0, totalAmount - parseFloat(insuranceAmount || 0)).toFixed(2)}
                </strong>
              </div>
            </div>
          )}

          {/* Loading spinner layout */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '10px 0' }}>
              <Loader2 className="animate-spin" size={24} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Processing POS billing transaction...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--color-border-light)', paddingTop: '20px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '12px' }} 
                onClick={onClose}
              >
                Cancel
              </button>
              
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 2, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} 
                onClick={processPayment}
              >
                <Check size={16} />
                <span>Confirm Payment</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
