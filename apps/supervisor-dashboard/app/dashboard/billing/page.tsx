'use client';

import React, { useMemo, useState } from "react";
import DashboardLayout from '@/components/DashboardLayout';
import { generateMonthlyCharges, getBillingOverview } from '@/lib/api';

export default function BillingPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [charges, setCharges] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingCharges, setGeneratingCharges] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  async function handleLoadCharges() {
    setLoading(true);
    try {
      const data = await getBillingOverview(selectedMonth);
      setCharges(data || []);
    } catch (error: any) {
      console.error('Failed to load charges:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateCharges() {
    setGeneratingCharges(true);
    try {
      await generateMonthlyCharges(selectedMonth);
      await handleLoadCharges();
    } catch (error) {
      console.error('Failed to generate charges:', error);
    } finally {
      setGeneratingCharges(false);
    }
  }

  // ✅ Filter directly from API data
  const filteredResidents = useMemo(() => {
    if (!searchQuery.trim()) return charges?.charges || [];
    const q = searchQuery.toLowerCase();

    return (charges?.charges || []).filter((r: any) =>
      r.prop_uid?.toLowerCase().includes(q) ||
      r.owner_name?.toLowerCase().includes(q) ||
      r.mobile?.toLowerCase().includes(q)
    );
  }, [charges, searchQuery]);

  return (
    <DashboardLayout>
      <div style={{ padding: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', color: '#1a1a1a' }}>Billing & Charges</h1>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Select Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
            <button
              onClick={handleLoadCharges}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1E7F5C',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              {loading ? 'Loading...' : 'Load Charges'}
            </button>
            <button
              onClick={handleGenerateCharges}
              disabled={generatingCharges || !charges}
              style={{
                padding: '8px 16px',
                backgroundColor: generatingCharges ? '#ccc' : '#F39C12',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: generatingCharges ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              {generatingCharges ? 'Generating...' : 'Generate Charges'}
            </button>
          </div>
        </div>

        {charges && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>Total Charges</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1E7F5C' }}>₹{charges.total_due}</p>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>Total Paid</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ECC71' }}>₹{charges.total_paid}</p>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>Pending</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#F39C12' }}>₹{charges.total_due - charges.total_paid}</p>
              </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Search Property ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '15px',
                    width: '320px',
                    background: '#fafafa',
                  }}
                />
                <span style={{ color: '#666', fontSize: '14px' }}>Showing {filteredResidents.length} of {charges?.charges?.length || 0}
                </span>
              </div>
            </div>

            <div style={{backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto', maxHeight: '50vh' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#53ceb3', borderBottom: '1px solid #494747',position: 'sticky', top: 0, zIndex: 3, }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Property ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Owner Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Mobile</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Collections</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Missed</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Amount Due</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResidents.map((charge: any) => (
                    <tr key={charge._id}
                    onMouseEnter={() => setHoveredRowId(charge.prop_uid)}
                    onMouseLeave={() => setHoveredRowId(null)}
                     style={{ borderBottom: '1px solid #e0e0e0',
                      backgroundColor: hoveredRowId === charge.prop_uid ? '#c6c9c7' : 'transparent',
                     }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{charge.prop_uid}</td>
                      <td style={{ padding: '12px', fontSize: '14px', maxWidth: 250, whiteSpace: 'wrap', }}>{charge.owner_name}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{charge.mobile}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{charge.total_collections}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{charge.missed_collections}</td>
                      <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', fontWeight: '600' }}>₹{charge.amount_due}</td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            backgroundColor: charge.paid ? '#E8F5E9' : '#FFF3CD',
                            color: charge.paid ? '#1B5E20' : '#856404',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {charge.paid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
