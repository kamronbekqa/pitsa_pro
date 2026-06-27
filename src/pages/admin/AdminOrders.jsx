import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
} from 'lucide-react';
import { apiUrl } from '../../api';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import './AdminOrders.css';

const statusConfig = {
  accepted:  { label: 'Pending',    color: 'warning', icon: Clock },
  approved:  { label: 'Approved',   color: 'success', icon: CheckCircle },
  delivering:{ label: 'Delivering', color: 'info',    icon: Package },
  completed: { label: 'Completed',  color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelled',  color: 'danger',  icon: AlertCircle },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const searchTimerRef = useRef(null);

  const itemsPerPage = 10;

  const fetchOrders = useCallback(async (search, status) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await fetch(
        `${apiUrl('/api/admin/orders/')}?${params.toString()}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.results || data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and status filter change
  useEffect(() => {
    fetchOrders(searchQuery, statusFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchOrders(value, statusFilter);
    }, 400);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(searchTimerRef.current);
  }, []);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOpen) handleCloseModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-orders-page">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <p className="page-description">Manage and track all customer orders</p>
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="filter-input"
            aria-label="Search orders"
          />
        </div>

        <div className="status-filter">
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading orders…</div>
      ) : error ? (
        <div className="error-state">Error: {error}</div>
      ) : paginatedOrders.length > 0 ? (
        <>
          <div className="orders-table-shell">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => {
                  const statusInfo = statusConfig[order.status] || statusConfig.accepted;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={order.id}>
                      <td data-label="Order">
                        <span className="order-number">#{order.id}</span>
                      </td>
                      <td data-label="Customer">
                        <div className="customer-cell">
                          <span className="customer-name">{order.customer_name}</span>
                          <span className="customer-address">{order.delivery_address || 'No address'}</span>
                        </div>
                      </td>
                      <td data-label="Phone">{order.customer_phone}</td>
                      <td data-label="Items">{order.items?.length || 0} items</td>
                      <td data-label="Total">
                        <span className="order-total">${order.total_price.toFixed(2)}</span>
                      </td>
                      <td data-label="Status">
                        <span className={`status-badge status-${statusInfo.color}`}>
                          <StatusIcon size={13} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td data-label="Date">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td data-label="Action">
                        <button
                          className="table-action-btn"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>

              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>No orders found matching your filters</p>
        </div>
      )}

      {modalOpen && selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default AdminOrders;
