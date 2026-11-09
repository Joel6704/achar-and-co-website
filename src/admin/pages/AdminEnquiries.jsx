import React, { useState, useEffect } from 'react';
import { fetchEnquiries, updateEnquiryStatus, updateEnquiryNotes, deleteEnquiry } from '../../lib/api';
import { 
  Inbox, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  MessageSquare, 
  Phone, 
  Save, 
  Check, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Selected enquiry for modal/drawer
  const [selected, setSelected] = useState(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    loadEnquiries();
  }, [statusFilter, sortBy]);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const data = await fetchEnquiries({
        status: statusFilter,
        search: searchTerm,
        sortBy
      });
      setEnquiries(data);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEnquiries();
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateEnquiryStatus(id, newStatus);
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    if (selected && selected.id === id) {
      setSelected(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    await updateEnquiryNotes(selected.id, adminNotesInput);
    setEnquiries(prev => prev.map(e => e.id === selected.id ? { ...e, admin_notes: adminNotesInput } : e));
    setSelected(prev => ({ ...prev, admin_notes: adminNotesInput }));
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Permanently delete enquiry record from "${name}"? This action cannot be undone.`)) {
      await deleteEnquiry(id);
      setEnquiries(prev => prev.filter(e => e.id !== id));
      if (selected && selected.id === id) setSelected(null);
    }
  };

  const exportCSV = () => {
    if (enquiries.length === 0) {
      alert('No enquiries to export.');
      return;
    }
    const headers = ['ID', 'Full Name', 'Phone', 'Email', 'Subject', 'Status', 'Date', 'Admin Notes', 'Message'];
    const rows = enquiries.map(e => [
      e.id,
      `"${(e.full_name || '').replace(/"/g, '""')}"`,
      `"${(e.phone || '').replace(/"/g, '""')}"`,
      `"${(e.email || '').replace(/"/g, '""')}"`,
      `"${(e.subject || '').replace(/"/g, '""')}"`,
      e.status,
      new Date(e.created_at).toLocaleString(),
      `"${(e.admin_notes || '').replace(/"/g, '""')}"`,
      `"${(e.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `achar_enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEnquiryModal = (enq) => {
    setSelected(enq);
    setAdminNotesInput(enq.admin_notes || '');
    setNotesSaved(false);
  };

  return (
    <div>
      {/* Top Controls Bar */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flexGrow: 1, maxWidth: '420px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="search"
                className="form-control"
                style={{ paddingLeft: '34px', fontSize: '13px' }}
                placeholder="Search by name, phone, email, message..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#8e8273' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>

          {/* Filter & Sort & Export */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: '#8e8273' }} />
              <select
                className="form-control"
                style={{ width: 'auto', padding: '8px 12px', fontSize: '12px' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <select
              className="form-control"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '12px' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>

            <button type="button" onClick={exportCSV} className="btn btn-outline btn-sm">
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #ede8dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b style={{ fontSize: '13px', color: '#12281a' }}>
            Showing {enquiries.length} Customer Enquir{enquiries.length === 1 ? 'y' : 'ies'}
          </b>
          {statusFilter !== 'All' && (
            <span style={{ fontSize: '12px', color: '#8e8273' }}>
              Filtered by: <strong>{statusFilter}</strong>
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#645a4e' }}>
            Loading enquiries...
          </div>
        ) : enquiries.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#8e8273' }}>
            <Inbox size={36} style={{ margin: '0 auto 12px', color: '#c78d1f' }} />
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#12281a', marginBottom: '4px' }}>
              No Enquiries Found
            </h3>
            <p style={{ fontSize: '13px' }}>Try clearing your search query or adjusting status filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Customer Information</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map(enq => (
                  <tr key={enq.id}>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#12281a', display: 'block' }}>
                        {new Date(enq.created_at).toLocaleDateString()}
                      </span>
                      <small style={{ color: '#8e8273', fontSize: '10px' }}>
                        {new Date(enq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </td>

                    <td>
                      <b style={{ color: '#12281a', fontSize: '13px', display: 'block' }}>{enq.full_name}</b>
                      <div style={{ fontSize: '11px', color: '#645a4e', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span>📞 {enq.phone}</span>
                        {enq.email && <span>✉️ {enq.email}</span>}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#12281a', display: 'block' }}>
                        {enq.subject || 'General Enquiry'}
                      </span>
                      <p style={{
                        fontSize: '11px',
                        color: '#645a4e',
                        margin: 0,
                        maxWidth: '280px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {enq.message}
                      </p>
                    </td>

                    <td>
                      <select
                        className={`status-pill ${enq.status.toLowerCase().replace(' ', '')}`}
                        style={{ border: 0, cursor: 'pointer', outline: 'none' }}
                        value={enq.status}
                        onChange={e => handleStatusChange(enq.id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    <td>
                      {enq.admin_notes ? (
                        <span 
                          style={{ fontSize: '11px', color: '#12281a', background: '#fef7ea', padding: '2px 8px', borderRadius: '4px', border: '1px solid #f2b545' }}
                          title={enq.admin_notes}
                        >
                          📝 Note Added
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#8e8273' }}>&mdash;</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          onClick={() => openEnquiryModal(enq)}
                          title="View complete information"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ color: '#a32a2a' }}
                          onClick={() => handleDelete(enq.id, enq.full_name)}
                          title="Delete enquiry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enquiry Detail Modal / Drawer */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
            
            <div style={{ borderBottom: '1px solid #ede8dc', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <span className={`status-pill ${selected.status.toLowerCase().replace(' ', '')}`}>
                  {selected.status}
                </span>
                <small style={{ color: '#8e8273' }}>ID: {selected.id}</small>
              </div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: '#12281a' }}>
                {selected.full_name}
              </h3>
              <small style={{ color: '#8e8273' }}>
                Submitted on {new Date(selected.created_at).toLocaleString()}
              </small>
            </div>

            {/* Quick Contacts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div style={{ background: '#f8f6f0', padding: '12px 14px', borderRadius: '6px' }}>
                <small style={{ color: '#8e8273', textTransform: 'uppercase', fontSize: '10px', fontWeight: 700 }}>Phone / WhatsApp</small>
                <div style={{ fontWeight: 600, color: '#12281a', marginTop: '2px', fontSize: '14px' }}>
                  {selected.phone}
                </div>
              </div>
              <div style={{ background: '#f8f6f0', padding: '12px 14px', borderRadius: '6px' }}>
                <small style={{ color: '#8e8273', textTransform: 'uppercase', fontSize: '10px', fontWeight: 700 }}>Email Address</small>
                <div style={{ fontWeight: 600, color: '#12281a', marginTop: '2px', fontSize: '14px' }}>
                  {selected.email || 'None provided'}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '16px' }}>
              <small style={{ color: '#8e8273', textTransform: 'uppercase', fontSize: '10px', fontWeight: 700 }}>Subject or Service Requested</small>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#12281a', marginTop: '2px' }}>
                {selected.subject}
              </div>
            </div>

            {/* Message Body */}
            <div style={{ marginBottom: '22px' }}>
              <small style={{ color: '#8e8273', textTransform: 'uppercase', fontSize: '10px', fontWeight: 700 }}>Customer Message</small>
              <div style={{
                background: '#faf8f5',
                border: '1px solid #ede8dc',
                borderRadius: '6px',
                padding: '14px',
                fontSize: '13px',
                color: '#1d1a16',
                lineHeight: 1.6,
                marginTop: '4px',
                whiteSpace: 'pre-wrap'
              }}>
                {selected.message}
              </div>
            </div>

            {/* Admin Notes Box */}
            <div style={{ marginBottom: '22px', background: '#fcfbf7', border: '1px solid #e6dfd1', padding: '16px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: '#12281a' }}>
                  Internal Admin Notes
                </label>
                {notesSaved && (
                  <span style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                    <Check size={13} /> Saved
                  </span>
                )}
              </div>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Add private kitchen notes (e.g. quote given, packaging requirements, follow-up date)..."
                value={adminNotesInput}
                onChange={e => setAdminNotesInput(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginTop: '8px' }}
                onClick={handleSaveNotes}
              >
                <Save size={13} />
                <span>Save Notes</span>
              </button>
            </div>

            {/* Status change dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderTop: '1px solid #ede8dc', paddingTop: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#12281a', whiteSpace: 'nowrap' }}>
                Pipeline Status:
              </label>
              <select 
                className="form-control" 
                style={{ width: 'auto', flexGrow: 1 }}
                value={selected.status}
                onChange={e => handleStatusChange(selected.id, e.target.value)}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`https://wa.me/${selected.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Namaskaram ${selected.full_name}, thank you for contacting Achar & Co.! We received your enquiry regarding: ${selected.subject}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-gold btn-sm"
                >
                  <MessageSquare size={14} />
                  <span>Reply on WhatsApp</span>
                </a>
                <a
                  href={`tel:${selected.phone}`}
                  className="btn btn-outline btn-sm"
                >
                  <Phone size={14} />
                  <span>Call Customer</span>
                </a>
              </div>

              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

