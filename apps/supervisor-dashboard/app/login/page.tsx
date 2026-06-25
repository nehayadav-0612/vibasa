'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginSupervisor, bootstrapSupervisor } from '@/lib/api';
import { setAuthToken } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBootstrap, setIsBootstrap] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = isBootstrap
        ? await bootstrapSupervisor(email, password)
        : await loginSupervisor(email, password);

      setAuthToken(result.token);
      router.push('/dashboard');
        }
    catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
      if (err.response?.status === 400 && err.response?.data?.error?.includes('already exists')) {
        setIsBootstrap(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)', animation: 'gradient 15s ease infinite', }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
        <div style={{ backgroundColor: '#1E7F5C', padding: '40px 20px', borderRadius: '10px', marginBottom: '0px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Smart Waste Management</h1>
          <p style={{ fontSize: '14px', color: '#e0e0e0' }}>Supervisor Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', display: 'block', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="supervisor@municipality.gov"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderWidth: '1px',
                borderColor: '#e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#1a1a1a',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderWidth: '1px',
                borderColor: '#e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#1a1a1a',
              }}
            />
          </div>

          {error && (
            <div style={{ backgroundColor: '#ffebee', padding: '12px', borderRadius: '8px', marginBottom: '16px', borderLeftWidth: '4px', borderLeftColor: '#e74c3c' }}>
              <p style={{ color: '#c62828', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#ccc' : '#1E7F5C',
              color: '#fff',
              fontWeight: '600',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Logging in...' : isBootstrap ? 'Create Supervisor' : 'Login'}
          </button>
        </form>
        {/*
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', marginTop: '16px', borderLeftWidth: '4px', borderLeftColor: '#1E7F5C' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
            {isBootstrap
              ? 'Already have an account? Click below to login.'
              : 'No supervisor account exists yet? Click below to create one.'}
          </p>
          <button
            type="button"
            onClick={() => setIsBootstrap(!isBootstrap)}
            style={{
              color: '#1E7F5C',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isBootstrap ? 'Back to login' : 'Create supervisor account'}
          </button>
        </div>
        */}
      </div>
    </div>
  );
}
