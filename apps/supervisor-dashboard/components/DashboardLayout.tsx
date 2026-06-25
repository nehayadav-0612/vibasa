'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeAuthToken, getAuthToken } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const STORAGE_KEY = 'supervisor-dashboard:sidebarCollapsed';
  const [collapsed, setCollapsed] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (!getAuthToken()) {
      router.push('/login');
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  function handleLogout() {
    removeAuthToken();
    router.push('/login');
  }

  function toggleCollapsed() {
    setCollapsed((s) => {
      const next = !s;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch (e) {}
      return next;
    });
  }

  // keep in sync if another tab/window changes the value
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        try {
          setCollapsed(e.newValue === 'true');
        } catch (err) {}
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ensure value persisted if code changes collapsed elsewhere
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch (e) {}
  }, [collapsed]);

  if (!authenticated) {
    return <div>Loading...</div>;
  }

  const sidebarStyle: React.CSSProperties = {
    width: collapsed ? '64px' : '250px',
    backgroundColor: '#1E7F5C',
    color: '#fff',
    padding: '20px',
    transition: 'width 160ms ease',
    boxSizing: 'border-box',
  };

  const linkBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    fontSize: '14px',
    color: '#fff',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={sidebarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: '18px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{collapsed ? '' : 'Smart Waste'}</h1>
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              marginLeft: '0px',
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>☰</span>
          </button>
        </div>

        <nav style={{ marginBottom: '24px' }}>
          <Link href="/dashboard" style={linkBaseStyle}>
            <span aria-hidden style={{ width: '20px', textAlign: 'center' }}>📊</span>
            <span style={{ display: collapsed ? 'none' : 'inline' }}>KPI Dashboard</span>
          </Link>
          <Link href="/dashboard/collectors" style={linkBaseStyle}>
            <span aria-hidden style={{ width: '20px', textAlign: 'center' }}>👥</span>
            <span style={{ display: collapsed ? 'none' : 'inline' }}>Manage Collectors</span>
          </Link>
          <Link href="/dashboard/residents" style={linkBaseStyle}>
            <span aria-hidden style={{ width: '20px', textAlign: 'center' }}>🏘️</span>
            <span style={{ display: collapsed ? 'none' : 'inline' }}>Manage Residents</span>
          </Link>
          <Link href="/dashboard/issues" style={linkBaseStyle}>
            <span aria-hidden style={{ width: '20px', textAlign: 'center' }}>⚠️</span>
            <span style={{ display: collapsed ? 'none' : 'inline' }}>Issues</span>
          </Link>
          <Link href="/dashboard/billing" style={linkBaseStyle}>
            <span aria-hidden style={{ width: '20px', textAlign: 'center' }}>💳</span>
            <span style={{ display: collapsed ? 'none' : 'inline' }}>Billing</span>
          </Link>
        </nav>

        {!collapsed && (
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Logout
          </button>
        )}
      </aside>

      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  );
}
