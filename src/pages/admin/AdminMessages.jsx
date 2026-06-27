import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Mail, MailOpen, RefreshCw } from 'lucide-react';
import { apiUrl } from '../../api';
import MessageDetailModal from '../../components/admin/MessageDetailModal';
import './AdminMessages.css';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchMessages = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(
        `${apiUrl('/api/admin/contact/')}?${params.toString()}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.results || data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleOpenModal = (msg) => {
    setSelectedMessage(msg);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMessage(null);
  };

  const handleDeleteMessage = async (id) => {
    try {
      setDeleting(id);
      const response = await fetch(apiUrl(`/api/admin/contact/${id}/`), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete message');
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOpen) handleCloseModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  return (
    <div className="admin-messages-page">
      <div className="page-header">
        <h1 className="page-title">Contact Messages</h1>
        <p className="page-description">View and manage messages from your customers</p>
      </div>

      <div className="messages-toolbar">
        <div className="search-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search messages…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input"
          />
        </div>

        <button
          className="refresh-btn"
          onClick={() => fetchMessages(searchQuery)}
          title="Refresh messages"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading messages…</div>
      ) : error ? (
        <div className="error-state">Error: {error}</div>
      ) : filteredMessages.length > 0 ? (
        <div className="messages-list">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="message-card">
              <div className="message-icon">
                <Mail size={20} />
              </div>

              <div className="message-content" onClick={() => handleOpenModal(msg)}>
                <div className="message-header">
                  <span className="sender-name">{msg.name}</span>
                  <span className="sender-email">{msg.email}</span>
                  <span className="message-date">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                {msg.subject && <div className="message-subject">{msg.subject}</div>}
                <p className="message-preview">{msg.message}</p>
              </div>

              <div className="message-actions">
                <button
                  className="view-message-btn"
                  onClick={() => handleOpenModal(msg)}
                >
                  <MailOpen size={15} />
                  View
                </button>
                <button
                  className="delete-message-btn"
                  onClick={() => handleDeleteMessage(msg.id)}
                  disabled={deleting === msg.id}
                >
                  <Trash2 size={15} />
                  {deleting === msg.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No messages found</p>
        </div>
      )}

      {modalOpen && selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={handleCloseModal}
          onDelete={handleDeleteMessage}
        />
      )}
    </div>
  );
};

export default AdminMessages;
