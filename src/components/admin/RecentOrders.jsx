import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import './RecentOrders.css';

const statusConfig = {
  accepted: { icon: Clock, label: 'Pending', color: 'warning' },
  approved: { icon: CheckCircle, label: 'Approved', color: 'success' },
  delivering: { icon: CheckCircle, label: 'Delivering', color: 'info' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'success' },
  cancelled: { icon: AlertCircle, label: 'Cancelled', color: 'danger' },
};

const RecentOrders = ({ orders }) => {
  return (
    <div className="recent-orders-card">
      <div className="card-header">
        <h2 className="card-title">Recent Orders</h2>
        <Link to="/admin/orders" className="view-all-link">
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      {orders && orders.length > 0 ? (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = statusConfig[order.status] || statusConfig.accepted;
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={order.id}>
                    <td>
                      <span className="order-id">#{order.id}</span>
                    </td>
                    <td>
                      <span className="customer-name">{order.customer_name}</span>
                    </td>
                    <td>
                      <span className="order-total">${order.total_price.toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${statusInfo.color}`}>
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <span className="order-date">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No orders yet</p>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
