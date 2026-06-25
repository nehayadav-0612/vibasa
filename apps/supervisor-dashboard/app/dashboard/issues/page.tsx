'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getIssues, resolveIssue } from '@/lib/api';

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchIssues();
  }, [filter]);

  async function fetchIssues() {
    setLoading(true);
    try {
      const resolved = filter === 'all' ? undefined : filter === 'resolved';
      const data = await getIssues(resolved);
      setIssues(data.issues);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolveIssue(issueId: string) {
    try {
      await resolveIssue(issueId);
      await fetchIssues();
    } catch (error) {
      console.error('Failed to resolve issue:', error);
    }
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', color: '#1a1a1a' }}>
          Issues
        </h1>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === 'all' ? '#1E7F5C' : '#f5f5f5',
              color: filter === 'all' ? '#fff' : '#666',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: filter === 'all' ? '600' : '500',
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === 'pending' ? '#F39C12' : '#f5f5f5',
              color: filter === 'pending' ? '#fff' : '#666',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: filter === 'pending' ? '600' : '500',
            }}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('resolved')}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === 'resolved' ? '#2ECC71' : '#f5f5f5',
              color: filter === 'resolved' ? '#fff' : '#666',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: filter === 'resolved' ? '600' : '500',
            }}
          >
            Resolved
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : issues.length === 0 ? (
          <p style={{ color: '#999' }}>No issues found</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {issues.map((issue: any) => (
              <div
                key={issue._id}
                style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeftWidth: '4px',
                  borderLeftColor: issue.resolved ? '#2ECC71' : '#F39C12',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                      Property: {issue.prop_uid}
                    </p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      Reported by: {issue.reported_by_role}
                    </p>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: issue.resolved ? '#E8F5E9' : '#FFF3CD',
                      color: issue.resolved ? '#1B5E20' : '#856404',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {issue.resolved ? 'Resolved' : 'Pending'}
                  </span>
                </div>

                <p style={{ fontSize: '14px', color: '#333', marginBottom: '12px', lineHeight: '1.5' }}>
                  {issue.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    Created: {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                  {!issue.resolved && (
                    <button
                      onClick={() => handleResolveIssue(issue._id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2ECC71',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
