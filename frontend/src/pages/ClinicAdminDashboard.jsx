import React, { useState, useEffect } from 'react';
import { clinicAdminAPI } from '../api';
import { Users, DollarSign, Calendar, Activity, CheckCircle, Shield } from 'lucide-react';

export function ClinicAdminDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, staffRes, subRes] = await Promise.all([
          clinicAdminAPI.getDashboard(),
          clinicAdminAPI.getStaff(),
          clinicAdminAPI.getSubscription(),
        ]);
        setDashboardData(dashRes.data.data);
        setStaffList(staffRes.data.data);
        setSubscription(subRes.data.data);
      } catch (error) {
        console.error('Failed to load clinic admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '24px', color: 'var(--color-text-secondary)' }}>Loading Dashboard...</div>;
  if (!dashboardData) return <div style={{ padding: '24px', color: 'red' }}>Error loading data.</div>;

  const stats = [
    { label: "Today's Appointments", value: dashboardData.today?.visits || 0, icon: <Calendar size={20} />, color: 'var(--color-primary)' },
    { label: "Revenue (Today)", value: `$${dashboardData.today?.revenue || 0}`, icon: <DollarSign size={20} />, color: '#10b981' },
    { label: "Total Patients", value: dashboardData.totalPatients || 0, icon: <Users size={20} />, color: '#8b5cf6' },
    { label: "Staff On Duty", value: dashboardData.staffOnDuty || 0, icon: <Activity size={20} />, color: '#f59e0b' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Clinic Admin Dashboard</h2>
        <div style={{ padding: '8px 16px', borderRadius: '100px', background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <Shield size={16} color="var(--color-primary)" />
          <span style={{ fontWeight: 500 }}>{subscription?.license?.plan || 'Unknown'} Plan</span>
          <span style={{ color: subscription?.license?.status === 'ACTIVE' ? '#10b981' : '#f59e0b' }}>
            ({subscription?.license?.status || 'Unknown'})
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '4px' }}>{stat.label}</p>
              <h3 style={{ fontSize: '24px', margin: 0 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Staff List</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {staffList.map(staff => (
              <div key={staff.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--color-background)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{staff.name}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{staff.role}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: staff.isActive ? '#10b981' : 'var(--color-text-secondary)' }}>
                  {staff.isActive && <CheckCircle size={14} />}
                  {staff.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Enabled Features</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {subscription?.features?.length > 0 ? subscription.features.map(feat => (
              <span key={feat} style={{ padding: '6px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '100px', fontSize: '12px', fontWeight: 500 }}>
                {feat}
              </span>
            )) : <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No features enabled on this plan.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
