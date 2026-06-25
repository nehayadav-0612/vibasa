'use client';

import React from "react"

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getCollectors, createCollector, assignWards, getResidents } from '@/lib/api';

export default function CollectorsPage() {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '', ward: '' });
  const [wards, setWards] = useState<any[]>([]);

  function handleCancel() {
    setShowForm(false);
    setFormData({ email: '', password: '', name: '', phone: '', ward: '' });
  }

  useEffect(() => {
    fetchCollectors();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchWards() {
      try {
        const data = await getResidents();
        const list = data?.residents || data || [];
        // Remove duplicates by ID
      const uniqueList = Array.from(
        new Map(list.map(item => [item.ward_no, item])).values()
      );
        if (mounted) setWards(uniqueList);
      //  if (mounted) setWards(list);
      } catch (err) {
        console.error('Failed to fetch wards:', err);
      }
    }
    fetchWards();
    return () => { mounted = false; };
  }, []);

  // Close modal when Escape key is pressed
  useEffect(() => {
    if (!showForm) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showForm]);

  async function fetchCollectors() {
    try {
      const data = await getCollectors();
      setCollectors(data.collectors);
    } catch (error) {
      console.error('Failed to fetch collectors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCollector(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await createCollector(formData.email, formData.password, formData.name, formData.phone);
      // try to extract created collector id from response
      const collectorId = res?.collector?._id || res?._id || res?.id;

      // if ward provided and collectorId is available, assign the ward
      if (collectorId && formData.ward) {
        try {
          await assignWards(collectorId, [formData.ward]);
        } catch (err) {
          console.error('Failed to assign ward to collector:', err);
        }
      }

      setFormData({ email: '', password: '', name: '', phone: '', ward: '' });
      setShowForm(false);
      await fetchCollectors();
    } catch (error) {
      console.error('Failed to create collector:', error);
    }
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>Manage Collectors</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '12px 20px',
              backgroundColor: '#1E7F5C',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            {showForm ? 'Cancel' : 'Add Collector'}
          </button>
        </div>

        {showForm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={handleCancel}
          >
            <div
              style={{
                backgroundColor: '#fff',
                padding: '24px',
                borderRadius: '8px',
                width: 'min(700px, 100%)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Add Collector</h2>
                <button onClick={handleCancel} aria-label="Close" title="Close" style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleCreateCollector}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                      Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                      Ward
                    </label>
                    <select
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        background: '#fff',
                      }}
                    >
                      <option value="">-- Select Ward --</option>
                      {wards.map((r: any, idx: number) => (
                        <option key={r.ward_no || idx} value={r.ward_no || r.id || `${r.ward_name}`}>{r.ward_no ? `${r.ward_no} - ${r.ward_name}` : r.ward_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#1E7F5C',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Create Collector
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ccc',
                      color: '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#43e481', borderBottom: '1px solid #e0e0e0'}}>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', borderRight: '2px solid #ffffff' }}>
                    Name
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', borderRight: '2px solid #ffffff' }}>
                    Email
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', borderRight: '2px solid #ffffff' }}>
                    Phone
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', borderRight: '2px solid #ffffff' }}>
                    Assigned Wards
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', borderRight: '2px solid #ffffff' }}>
                    Status
                  </th>{/*}
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                    Actions
                  </th>*/}
                </tr>
              </thead>
              <tbody>
                {collectors.map((collector: any) => (
                  <tr key={collector._id} style={{ borderBottom: '1px solid #e0e0e0', textAlign:'center' }}>
                    <td style={{ padding: '12px', fontSize: '14px' , borderRight: '1px solid #6d6c6c'}}>{collector.name}</td>
                    <td style={{ padding: '12px', fontSize: '14px' , borderRight: '1px solid #6d6c6c'}}>{collector.email}</td>
                    <td style={{ padding: '12px', fontSize: '14px' , borderRight: '1px solid #6d6c6c'}}>{collector.phone}</td>
                    <td style={{ padding: '12px', fontSize: '14px' , borderRight: '1px solid #6d6c6c'}}>{collector.assigned_wards}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: collector.active ? '#E8F5E9' : '#F5F5F5',
                          color: collector.active ? '#1B5E20' : '#999',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        {collector.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/*
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                      }}
                    >
                      <button
                        onClick={() => handleEdit(resident)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3498db',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resident.prop_uid)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e74c3c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        Delete
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
