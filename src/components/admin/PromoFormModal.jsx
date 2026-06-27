import React, { useState } from 'react';
import { X } from 'lucide-react';
import { apiUrl } from '../../api';
import './FormModal.css';

const PromoFormModal = ({ promo, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    promo || {
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      max_usage: '',
      expiration_date: '',
      is_active: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const method = promo ? 'PATCH' : 'POST';
      const url = promo ? apiUrl(`/api/admin/promocodes/${promo.id}/`) : apiUrl('/api/admin/promocodes/');

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save promo code');
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{promo ? 'Edit Promo Code' : 'Create Promo Code'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="form-content" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Promo Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., SAVE20"
              required
              className="form-input"
              disabled={!!promo}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Discount Type *</label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="form-select"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Discount Value *</label>
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                min="0"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Max Usage (leave empty for unlimited)</label>
            <input
              type="number"
              name="max_usage"
              value={formData.max_usage}
              onChange={handleChange}
              placeholder="e.g., 100"
              min="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expiration Date</label>
            <input
              type="date"
              name="expiration_date"
              value={formData.expiration_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Active</span>
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoFormModal;
