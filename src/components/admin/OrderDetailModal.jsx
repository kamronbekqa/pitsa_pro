import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { apiUrl } from '../../api';
import './OrderDetailModal.css';

const OrderDetailModal = ({ order, onClose }) => {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(apiUrl(`/api/admin/orders/${order.id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update order');
      setStatus(newStatus);
    } catch (err) {
      alert('Error updating order: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const statusColors = {
    accepted: 'warning',
    approved: 'success',
    delivering: 'info',
    completed: 'success',
    cancelled: 'danger',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Order Details #{order.id}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Customer Info */}
          <section className="modal-section">
            <h3 className="section-title">Customer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">Name</label>
                <p className="info-value">{order.customer_name}</p>
              </div>
              <div className="info-item">
                <label className="info-label">Phone</label>
                <p className="info-value">{order.customer_phone}</p>
              </div>
              <div className="info-item">
                <label className="info-label">Address</label>
                <p className="info-value">{order.delivery_address || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label className="info-label">Email</label>
                <p className="info-value">{order.customer?.email || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Order Items */}
          <section className="modal-section">
            <h3 className="section-title">Order Items</h3>
            <div className="items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="order-item">
                  <div className="item-details">
                    <p className="item-name">{item.product?.name || 'Product'}</p>
                    <p className="item-price">
                      {item.quantity} × ${item.product?.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="item-total">${(item.quantity * item.product?.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Order Summary */}
          <section className="modal-section">
            <h3 className="section-title">Order Summary</h3>
            <div className="summary-lines">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>${(order.total_price * 0.95).toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Delivery Fee</span>
                <span>$0.00</span>
              </div>
              <div className="summary-line total">
                <span>Total</span>
                <span>${order.total_price.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Status */}
          <section className="modal-section">
            <h3 className="section-title">Order Status</h3>
            <div className="status-controls">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="status-select"
              >
                <option value="accepted">Pending</option>
                <option value="approved">Approved</option>
                <option value="delivering">Delivering</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className={`status-badge status-${statusColors[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </section>

          {/* Dates */}
          <section className="modal-section">
            <h3 className="section-title">Dates</h3>
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">Created</label>
                <p className="info-value">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="info-item">
                <label className="info-label">Updated</label>
                <p className="info-value">{new Date(order.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
