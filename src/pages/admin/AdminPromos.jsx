import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { apiUrl } from '../../api';
import PromoFormModal from '../../components/admin/PromoFormModal';
import './AdminPromos.css';

const AdminPromos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/admin/promocodes/'), {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch promo codes');
      const data = await response.json();
      setPromos(data.results || data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleOpenModal = (promo = null) => {
    setEditingPromo(promo);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPromo(null);
  };

  const handleSavePromo = async () => {
    await fetchPromos();
    handleCloseModal();
  };

  const handleDeletePromo = async (id) => {
    try {
      setDeleting(true);
      const response = await fetch(apiUrl(`/api/admin/promocodes/${id}/`), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete promo code');
      setPromos((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (modalOpen) handleCloseModal();
        if (deleteConfirm) setDeleteConfirm(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, deleteConfirm]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="admin-promos-page">
      <div className="page-header">
        <h1 className="page-title">Promo Codes</h1>
        <p className="page-description">Create and manage discount codes for your customers</p>
      </div>

      <div className="promos-toolbar">
        <button className="add-promo-btn" onClick={() => handleOpenModal()}>
          <Plus size={17} />
          Create Promo Code
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading promo codes…</div>
      ) : error ? (
        <div className="error-state">Error: {error}</div>
      ) : promos.length > 0 ? (
        <div className="promos-table-shell">
          <table className="promos-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id}>
                  <td data-label="Code">
                    <span className="promo-code">{promo.code}</span>
                  </td>
                  <td data-label="Discount">
                    {promo.discount_type === 'percentage'
                      ? `${promo.discount_value}%`
                      : `$${promo.discount_value}`}
                  </td>
                  <td data-label="Usage">
                    <span className="usage-count">
                      {promo.current_usage || 0}
                      {promo.max_usage ? ` / ${promo.max_usage}` : ' / ∞'}
                    </span>
                  </td>
                  <td data-label="Expires">{formatDate(promo.expiration_date)}</td>
                  <td data-label="Status">
                    <span className={`status-badge status-${promo.is_active ? 'success' : 'danger'}`}>
                      {promo.is_active ? (
                        <>
                          <Check size={13} /> Active
                        </>
                      ) : (
                        <>
                          <X size={13} /> Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <button
                        className="table-action-btn"
                        onClick={() => handleOpenModal(promo)}
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        className="table-action-btn danger"
                        onClick={() => setDeleteConfirm(promo.id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No promo codes yet. Create your first one!</p>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Delete Promo Code?</h2>
            <p className="modal-message">
              Are you sure you want to delete this promo code? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="btn-danger"
                disabled={deleting}
                onClick={() => handleDeletePromo(deleteConfirm)}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <PromoFormModal promo={editingPromo} onClose={handleCloseModal} onSave={handleSavePromo} />
      )}
    </div>
  );
};

export default AdminPromos;
