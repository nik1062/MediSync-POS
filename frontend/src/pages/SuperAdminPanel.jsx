import React, { useState, useEffect } from 'react';
import { superAdminAPI } from '../api';
import { Building2, Activity, Shield, TrendingUp, CheckCircle, Search } from 'lucide-react';

export function SuperAdminPanel({ user }) {
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          superAdminAPI.getStats(),
          superAdminAPI.listTenants()
        ]);
        setStats(statsRes.data.data);
        setTenants(tenantsRes.data.data.tenants);
      } catch (error) {
        console.error('Failed to load super admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '24px', color: 'var(--color-text-secondary)' }}>Loading Platform Data...</div>;
  if (!stats) return <div style={{ padding: '24px', color: 'red' }}>Error loading platform data.</div>;

  const statCards = [
    { label: "Total Clinics", value: stats.totalTenants || 0, icon: <Building2 size={20} />, color: 'var(--color-primary)' },
    { label: "Active Clinics", value: stats.activeTenants || 0, icon: <Activity size={20} />, color: '#10b981' },
    { label: "Trial Accounts", value: stats.trialTenants || 0, icon: <TrendingUp size={20} />, color: '#3b82f6' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Platform Super Admin</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>Manage all clinics, subscriptions, and platform settings.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {statCards.map((stat, i) => (
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

      <div style={{ background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', margin: 0 }}>Registered Clinics</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-background)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <Search size={16} color="var(--color-text-secondary)" />
            <input type="text" placeholder="Search clinics..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px' }} />
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'var(--color-background)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '16px 24px', fontWeight: 500 }}>Clinic Name</th>
                <th style={{ padding: '16px 24px', fontWeight: 500 }}>Plan</th>
                <th style={{ padding: '16px 24px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: 500 }}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{tenant.name}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ background: 'var(--color-background)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                      {tenant.license?.plan || 'FREE'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: tenant.license?.status === 'ACTIVE' ? '#10b981' : 'var(--color-text-secondary)' }}>
                      <CheckCircle size={14} />
                      {tenant.license?.status || 'UNKNOWN'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tenants.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No clinics found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
