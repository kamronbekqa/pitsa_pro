import React, { useState } from 'react';
import { X, Reply, Trash2 } from 'lucide-react';
import './MessageDetailModal.css';

const MessageDetailModal = ({ message, onClose, onDelete }) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    // TODO: integrate email reply functionality
    alert(`Reply functionality not yet integrated.\n\nDraft:\n${replyText}`);
    setReplyText('');
    setReplyOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Message Details</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="message-meta">
            <div className="meta-item">
              <span className="meta-label">From</span>
              <span className="meta-value">{message.name}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Email</span>
              <a href={`mailto:${message.email}`} className="meta-link">{message.email}</a>
            </div>
            <div className="meta-item">
              <span className="meta-label">Subject</span>
              <span className="meta-value">{message.subject || 'No subject'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Received</span>
              <span className="meta-value">{new Date(message.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="message-body">
            <h3 className="message-body-label">Message</h3>
            <p className="message-text">{message.message}</p>
          </div>

          {replyOpen && (
            <form className="reply-form" onSubmit={handleReplySubmit}>
              <label className="form-label">Reply to {message.name}</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={5}
                className="reply-textarea"
                autoFocus
              />
              <div className="reply-actions">
                <button type="button" className="btn-secondary" onClick={() => setReplyOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Reply
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-danger-outline" onClick={() => { onDelete(message.id); onClose(); }}>
            <Trash2 size={16} />
            Delete
          </button>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            {!replyOpen && (
              <button className="btn-primary" onClick={() => setReplyOpen(true)}>
                <Reply size={16} />
                Reply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetailModal;
