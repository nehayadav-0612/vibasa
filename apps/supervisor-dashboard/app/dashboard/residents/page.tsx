'use client';


import React, { useMemo } from "react"

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getResidents, createResident, updateResident, deleteResident, uploadCSVPreview, confirmCSVImport } from '@/lib/api';

interface Resident {
  prop_uid: string;
  owner_name: string;
  zone_no: string;
  ward_no: string;
  ward_name: string;
  address: string;
  mobile: string;
  lat: string;
  lng: string;
}

interface FormData {
  prop_uid: string;
  owner_name: string;
  zone_no: string;
  ward_no: string;
  ward_name: string;
  address: string;
  mobile: string;
  lat: string;
  lng: string;
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'manage' | 'import'>('manage');
  const [formData, setFormData] = useState<FormData>({
    prop_uid: '',
    owner_name: '',
    zone_no: '',
    ward_no: '',
    ward_name: '',
    address: '',
    mobile: '',
    lat: '',
    lng: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // CSV Import State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState('');
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  // Close resident form modal when Escape key is pressed
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

  async function fetchResidents() {
    try {
      setLoading(true);
      setError('');
      const data = await getResidents();
      setResidents(data.residents || []);
    } catch (error: any) {
      console.error('Failed to fetch residents:', error);
      
      let errorMessage = 'Failed to load residents. Please check your connection and try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'The residents endpoint was not found (404). Please ensure the server API is running and the endpoint exists.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error (500). Please contact support or try again later.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setResidents([]);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await updateResident({
            prop_uid: editingId, residentData: {
              owner_name: formData.owner_name,
              zone_no: formData.zone_no,
              ward_no: formData.ward_no,
              ward_name: formData.ward_name,
              address: formData.address,
              mobile: formData.mobile,
              lat: formData.lat ? parseFloat(formData.lat.toString()) : null,
              lng: formData.lng ? parseFloat(formData.lng.toString()) : null,
            }
          });
        setSuccess('Resident updated successfully');
      } else {
        await createResident({ residentData: formData });
        setSuccess('Resident created successfully');
      }

      setFormData({
        prop_uid: '',
        owner_name: '',
        zone_no: '',
        ward_no: '',
        ward_name: '',
        address: '',
        mobile: '',
        lat: '',
        lng: '',
      });
      setShowForm(false);
      setEditingId(null);
      await fetchResidents();
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred');
    }
  }

  function handleEdit(resident: Resident) {
    setFormData(resident);
    setEditingId(resident.prop_uid);
    setShowForm(true);
  }

  async function handleDelete(prop_uid: string) {
    if (window.confirm('Are you sure you want to delete this resident?')) {
      try {
        setError('');
        setSuccess('');
        await deleteResident(prop_uid);
        setSuccess('Resident deleted successfully');
        await fetchResidents();
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to delete resident');
      }
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      prop_uid: '',
      owner_name: '',
      zone_no: '',
      ward_no: '',
      ward_name: '',
      address: '',
      mobile: '',
      lat: '',
      lng: '',
    });
    setError('');
  }

  // CSV Import Functions
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setCsvError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setCsvError('');
    setPreview(null);
  }

  async function handlePreview() {
    if (!file) {
      setCsvError('Please select a file');
      return;
    }

    setCsvLoading(true);
    setCsvError('');

    try {
      const result = await uploadCSVPreview(file);
      setPreview(result);
    } catch (err: any) {
      setCsvError(err.response?.data?.error || 'Preview failed');
    } finally {
      setCsvLoading(false);
    }
  }

  async function handleConfirmImport() {
    if (!file) {
      setCsvError('Please select a file');
      return;
    }

    setCsvLoading(true);
    setCsvError('');

    try {
      const result = await confirmCSVImport(file);
      setImportResult(result);
      setFile(null);
      setPreview(null);
      await fetchResidents();
    } catch (err: any) {
      setCsvError(err.response?.data?.error || 'Import failed');
    } finally {
      setCsvLoading(false);
    }
  }

  // Filter residents based on search query
  const filteredResidents = useMemo(() => {
    if (!searchQuery.trim()) return residents;
    const q = searchQuery.toLowerCase();
    return residents.filter(r =>
      r.prop_uid.toLowerCase().includes(q) ||
      r.owner_name.toLowerCase().includes(q) ||
      r.zone_no.toLowerCase().includes(q) ||
      r.ward_no.toLowerCase().includes(q) ||
      r.ward_name.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q) ||
      r.mobile.toLowerCase().includes(q) ||
      (r.lat || '').toString().toLowerCase().includes(q) ||
      (r.lng || '').toString().toLowerCase().includes(q)
    );
  }, [residents, searchQuery]);

  // Compute unique ward count (by ward_no + ward_name)
  const wardCount = useMemo(() => {
    const set = new Set<string>();
    residents.forEach(r => set.add(`${r.ward_no}||${r.ward_name}`));
    return set.size;
  }, [residents]);

  return (
    <DashboardLayout>
      <div style={{ padding: '30px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>
            Manage Residents
          </h1>
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e0e0e0' }}>
            <button
              onClick={() => {
                setActiveTab('manage');
                handleCancel();
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === 'manage' ? '#1E7F5C' : 'transparent',
                color: activeTab === 'manage' ? '#fff' : '#666',
                border: 'none',
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Manage Residents
            </button>
            <button
              onClick={() => {
                setActiveTab('import');
                setError('');
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === 'import' ? '#1E7F5C' : 'transparent',
                color: activeTab === 'import' ? '#fff' : '#666',
                border: 'none',
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Import from CSV
            </button>
          </div>
        </div>

        {activeTab === 'manage' && (
          <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search Residents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 14px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '15px',
                width: '320px',
                background: '#fafafa',
              }}
            />
            <span style={{ color: '#666', fontSize: '14px' }}>
              Showing {filteredResidents.length} of {residents.length}
            </span>
          </div>
          <button
            onClick={() => {
              if (showForm && !editingId) {
                handleCancel();
              } else {
                setShowForm(!showForm);
                setEditingId(null);
              }
            }}
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
            {showForm && !editingId ? 'Cancel' : 'Add Resident'}
          </button>
        </div>

        

        {error && (
          <div
            style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '20px',
              borderLeftWidth: '4px',
              borderLeftColor: '#c62828',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '20px',
              borderLeftWidth: '4px',
              borderLeftColor: '#2e7d32',
            }}
          >
            {success}
          </div>
        )}

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
                width: 'min(900px, 100%)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{editingId ? 'Edit Resident' : 'Add New Resident'}</h2>
                <button onClick={handleCancel} aria-label="Close" title="Close" style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {!editingId && (
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        Property UID
                      </label>
                      <input
                        type="text"
                        name="prop_uid"
                        value={formData.prop_uid}
                        onChange={handleInputChange}
                        required
                        disabled={!!editingId}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          backgroundColor: editingId ? '#f5f5f5' : '#fff',
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                      Owner Name
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleInputChange}
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
                      Zone No
                    </label>
                    <input
                      type="text"
                      name="zone_no"
                      value={formData.zone_no}
                      onChange={handleInputChange}
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
                      Ward No
                    </label>
                    <input
                      type="text"
                      name="ward_no"
                      value={formData.ward_no}
                      onChange={handleInputChange}
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
                      Ward Name
                    </label>
                    <input
                      type="text"
                      name="ward_name"
                      value={formData.ward_name}
                      onChange={handleInputChange}
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
                      Mobile
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
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
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="lat"
                      value={formData.lat}
                      onChange={handleInputChange}
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
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="lng"
                      value={formData.lng}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                      minHeight: '80px',
                    }}
                  />
                </div>
                  
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
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
                    {editingId ? 'Update Resident' : 'Create Resident'}
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
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '16px', color: '#666' }}>Loading residents...</p>
          </div>
        ) : error && residents.length === 0 ? (
          <div style={{ backgroundColor: '#ffebee', padding: '24px', borderRadius: '8px', textAlign: 'left', borderLeftWidth: '4px', borderLeftColor: '#c62828' }}>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#c62828', marginBottom: '16px' }}>
              ⚠️ Error Loading Residents
            </p>
            <p style={{ fontSize: '14px', color: '#c62828', marginBottom: '16px', lineHeight: '1.6' }}>
              {error}
            </p>
            {error.includes('404') && (
              <p style={{ fontSize: '12px', color: '#d32f2f', marginBottom: '16px', backgroundColor: '#ffcdd2', padding: '12px', borderRadius: '4px', fontFamily: 'monospace' }}>
                <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={fetchResidents}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#c62828',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Retry Loading
              </button>
              {error.includes('404') && (
                <button
                  onClick={() => {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                    window.open(`${apiUrl}/supervisor/residents`, '_blank');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  Test API Endpoint
                </button>
              )}
            </div>
          </div>
        ) : residents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '16px', color: '#999' }}>No residents found</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto', maxHeight: '60vh' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#4bd38f', borderBottom: '2px solid #e0e0e0' }}>
                    Property UID
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', width: '180px', position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#4bd38f', borderBottom: '2px solid #e0e0e0' }}>
                    Owner Name
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#4bd38f', borderBottom: '2px solid #e0e0e0' }}>
                    Zone
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#4bd38f', borderBottom: '2px solid #e0e0e0' }}>
                    Ward
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#4bd38f', borderBottom: '2px solid #e0e0e0' }}>
                    Address
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#4bd38f', borderBottom: '2px solid #e0e0e0' }}>
                    Mobile
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#4bd38f', borderBottom: '2px solid #e0e0e0' }}>
                    Latitude
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#4bd38f', borderBottom: '2px solid #e0e0e0' }}>
                    Longitude
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#4bd38f', borderBottom: '2px solid #e0e0e0' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                        {filteredResidents.map((resident) => (
                  <tr
                    key={resident.prop_uid}
                    onMouseEnter={() => setHoveredRowId(resident.prop_uid)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#e0e0e0',
                      backgroundColor: hoveredRowId === resident.prop_uid ? '#c6c9c7' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1a1a1a' }}>
                      {resident.prop_uid}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1a1a1a', maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {resident.owner_name}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>
                      {resident.zone_no}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>
                      {resident.ward_no} - {resident.ward_name}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>
                      {resident.address}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'center', color: '#666' }}>
                      {resident.mobile}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'center', color: '#666' }}>
                      {resident.lat ?? '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'center', color: '#666' }}>
                      {resident.lng ?? '-'}
                    </td>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </>
        )}

        {activeTab === 'import' && (
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1a1a1a' }}>Import Residents from CSV</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '12px' }}>
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={csvLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                }}
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                CSV must have columns: prop_uid, owner_name, zone_no, ward_no, ward_name, address, mobile
              </p>
            </div>

            {csvError && (
              <div style={{ backgroundColor: '#ffebee', padding: '12px', borderRadius: '8px', marginBottom: '16px', borderLeftWidth: '4px', borderLeftColor: '#e74c3c' }}>
                <p style={{ color: '#c62828', fontSize: '14px' }}>{csvError}</p>
              </div>
            )}

            {!preview && !importResult && (
              <button
                onClick={handlePreview}
                disabled={!file || csvLoading}
                style={{
                  padding: '12px 20px',
                  backgroundColor: !file ? '#ccc' : '#1E7F5C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !file ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                }}
              >
                {csvLoading ? 'Preview...' : 'Preview'}
              </button>
            )}

            {preview && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Preview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                    <p style={{ fontSize: '12px', color: '#999' }}>Total Rows</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E7F5C' }}>{preview.total_rows}</p>
                  </div>
                  <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                    <p style={{ fontSize: '12px', color: '#999' }}>Valid</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ECC71' }}>{preview.valid_rows}</p>
                  </div>
                  <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                    <p style={{ fontSize: '12px', color: '#999' }}>Errors</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#E74C3C' }}>{preview.error_rows}</p>
                  </div>
                </div>

                {preview.errors && preview.errors.length > 0 && (
                  <div style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '4px', marginBottom: '20px', borderLeftWidth: '4px', borderLeftColor: '#f39c12' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Errors (first 10):</p>
                    {preview.errors.map((err: string, idx: number) => (
                      <p key={idx} style={{ fontSize: '12px', color: '#856404', marginBottom: '4px' }}>
                        • {err}
                      </p>
                    ))}
                  </div>
                )}

                {preview.valid_rows > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Sample Data (first 5 rows):</h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Property ID</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Owner</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Zone</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Ward</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Address</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Mobile</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.preview.map((row: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                              <td style={{ padding: '8px' }}>{row.prop_uid}</td>
                              <td style={{ padding: '8px' }}>{row.owner_name}</td>
                              <td style={{ padding: '8px' }}>{row.zone_no}</td>
                              <td style={{ padding: '8px' }}>{row.ward_name}</td>
                              <td style={{ padding: '8px' }}>{row.address}</td>
                              <td style={{ padding: '8px' }}>{row.mobile}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleConfirmImport}
                    disabled={csvLoading || preview.error_rows > 0}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: preview.error_rows > 0 ? '#ccc' : '#2ECC71',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: preview.error_rows > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    {csvLoading ? 'Importing...' : 'Confirm Import'}
                  </button>
                  <button
                    onClick={() => {
                      setPreview(null);
                      setFile(null);
                    }}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#e0e0e0',
                      color: '#666',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {importResult && (
              <div style={{ marginTop: '20px', backgroundColor: '#E8F5E9', padding: '16px', borderRadius: '8px', borderLeftWidth: '4px', borderLeftColor: '#2ECC71' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1B5E20', marginBottom: '12px' }}>Import Completed</h3>
                <p style={{ color: '#1B5E20', marginBottom: '8px' }}>Imported: {importResult.imported}</p>
                <p style={{ color: '#1B5E20', marginBottom: '8px' }}>Skipped: {importResult.skipped}</p>
                <p style={{ color: '#1B5E20', marginBottom: '16px' }}>Errors: {importResult.errors}</p>
                <button
                  onClick={() => {
                    setImportResult(null);
                    setFile(null);
                    setPreview(null);
                    setCsvError('');
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#1E7F5C',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
