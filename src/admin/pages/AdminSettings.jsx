import React, { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../../lib/supabase';
import { useAuth } from '../AdminApp';
import { 
  ShieldCheck, 
  Database, 
  Key, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink 
} from 'lucide-react';

export default function AdminSettings() {
  const { adminUser } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const startTime = performance.now();
    try {
      if (!isConfigured) {
        setTestResult({
          connected: false,
          mode: 'Offline / LocalStorage Fallback',
          message: 'Supabase credentials are placeholder values in .env. The dashboard is running in resilient local demo mode.',
          latency: 0
        });
        setTesting(false);
        return;
      }

      // Test connection by querying product categories or enquiries head
      const { data, error, count } = await supabase
        .from('product_categories')
        .select('*', { count: 'exact', head: false });

      const elapsed = Math.round(performance.now() - startTime);

      if (error) throw error;

      setTestResult({
        connected: true,
        mode: 'Live Supabase Cloud',
        message: `Successfully connected to PostgreSQL database. Fetched ${data?.length || 0} categories.`,
        latency: elapsed
      });
    } catch (err) {
      setTestResult({
        connected: false,
        mode: 'Connection Failed',
        message: err.message || 'Unable to connect to Supabase database. Check your RLS policies or project URL.',
        latency: 0
      });
    } finally {
      setTesting(false);
    }
  };

  const copySqlSnippet = () => {
    const sql = `-- Run this in your Supabase SQL Editor to create an administrator user:
-- Or simply invite the user under Authentication -> Users -> Add User in the Supabase Dashboard!`;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Connection Status Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} style={{ color: '#c78d1f' }} />
            <div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#12281a', margin: 0 }}>
                Supabase Backend Connection
              </h3>
              <p style={{ fontSize: '12px', color: '#645a4e', margin: 0 }}>
                PostgreSQL Database, Auth &amp; Storage Health
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={testSupabaseConnection}
            disabled={testing}
          >
            <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </div>

        {testResult && (
          <div style={{
            background: testResult.connected ? '#dcfce7' : '#fef9c3',
            border: `1px solid ${testResult.connected ? '#86efac' : '#fde047'}`,
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {testResult.connected ? (
                <CheckCircle2 size={18} style={{ color: '#166534' }} />
              ) : (
                <AlertTriangle size={18} style={{ color: '#854d0e' }} />
              )}
              <b style={{ color: testResult.connected ? '#166534' : '#854d0e', fontSize: '14px' }}>
                Status: {testResult.mode}
              </b>
              {testResult.latency > 0 && (
                <span style={{ fontSize: '11px', background: '#fff', padding: '1px 6px', borderRadius: '4px', color: '#166534' }}>
                  {testResult.latency} ms
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: testResult.connected ? '#14532d' : '#713f12', margin: 0 }}>
              {testResult.message}
            </p>
          </div>
        )}

        <div style={{ background: '#f8f6f0', padding: '16px', borderRadius: '6px', fontSize: '12px', color: '#1d1a16' }}>
          <b style={{ display: 'block', color: '#12281a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Environment Configuration
          </b>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#8e8273' }}>VITE_SUPABASE_URL:</span>
            <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
              {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
            </code>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px' }}>
            <span style={{ color: '#8e8273' }}>VITE_SUPABASE_ANON_KEY:</span>
            <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? '••••••••••••••••' + import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-6) : 'Not set'}
            </code>
          </div>
        </div>
      </div>

      {/* Security & RLS Policies Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <ShieldCheck size={22} style={{ color: '#16a34a' }} />
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#12281a', margin: 0 }}>
              Security &amp; Row Level Security (RLS)
            </h3>
            <p style={{ fontSize: '12px', color: '#645a4e', margin: 0 }}>
              Database-level authorization rules protecting Achar &amp; Co. customer data
            </p>
          </div>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#1d1a16' }}>
          <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
            <div>
              <strong>Public Enquiry Submission (Insert-Only):</strong> Visitors on the public website can insert new enquiry records, but RLS blocks public read/update/delete requests. Public visitors can never see other customers' contact details.
            </div>
          </li>
          <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
            <div>
              <strong>Authenticated Admin Privilege:</strong> Only sessions authenticated with Supabase Auth can read, update status, add notes, or delete customer enquiries.
            </div>
          </li>
          <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
            <div>
              <strong>Public Blog Visibility:</strong> Public visitors can only query blogs with <code>status = 'Published'</code>. Drafts and unpublished stories are strictly inaccessible without admin login.
            </div>
          </li>
          <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
            <div>
              <strong>Service Role Safety:</strong> Frontend code uses only the public anon key. Service-role master keys and database passwords are never exposed.
            </div>
          </li>
        </ul>
      </div>

      {/* Admin Account & Instructions Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Key size={22} style={{ color: '#c78d1f' }} />
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#12281a', margin: 0 }}>
              Admin Account Provisioning
            </h3>
            <p style={{ fontSize: '12px', color: '#645a4e', margin: 0 }}>
              Creating and managing administrator access
            </p>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#645a4e', lineHeight: 1.6, marginBottom: '14px' }}>
          To ensure security, public user registration is permanently disabled. When deploying to Supabase, create your administrator user in one of two secure ways:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8f6f0', padding: '16px', borderRadius: '6px', border: '1px solid #ede8dc' }}>
            <b style={{ color: '#12281a', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
              Method 1: Supabase Dashboard
            </b>
            <p style={{ fontSize: '12px', color: '#645a4e', margin: 0, lineHeight: 1.5 }}>
              1. Open your project on <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: '#c78d1f', textDecoration: 'underline' }}>supabase.com</a><br />
              2. Go to <strong>Authentication &rarr; Users</strong><br />
              3. Click <strong>Add User &rarr; Create User</strong><br />
              4. Enter your email and a strong password.
            </p>
          </div>

          <div style={{ background: '#f8f6f0', padding: '16px', borderRadius: '6px', border: '1px solid #ede8dc' }}>
            <b style={{ color: '#12281a', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
              Method 2: SQL Migration File
            </b>
            <p style={{ fontSize: '12px', color: '#645a4e', margin: 0, lineHeight: 1.5 }}>
              All database tables, RLS policies, and triggers are pre-written in:
              <code style={{ display: 'block', background: '#fff', padding: '4px 8px', marginTop: '6px', borderRadius: '4px', fontSize: '11px' }}>
                supabase/schema.sql
              </code>
              Paste it into your Supabase SQL Editor and run with one click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

