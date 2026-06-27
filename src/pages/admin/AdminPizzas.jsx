import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, ImageIcon } from 'lucide-react';
import { apiUrl, mediaUrl } from '../../api';
import PizzaFormModal from '../../components/admin/PizzaFormModal';
import './AdminPizzas.css';

const AdminPizzas = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const searchTimerRef = useRef(null);

  const fetchPizzas = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(
        `${apiUrl('/api/admin/products/')}?${params.toString()}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch pizzas');
      const data = await response.json();
      setPizzas(data.results || data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPizzas();
  }, [fetchPizzas]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchPizzas(value);
    }, 400);
  };

  useEffect(() => () => clearTimeout(searchTimerRef.current), []);

  const handleOpenModal = (pizza = null) => {
    setEditingPizza(pizza);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPizza(null);
  };

  const handleSavePizza = async () => {
    await fetchPizzas(searchQuery);
    handleCloseModal();
  };

  const handleDeletePizza = async (id) => {
    try {
      setDeleting(true);
      const response = await fetch(apiUrl(`/api/admin/products/${id}/`), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete pizza');
      setPizzas((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Escape key
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

  return (
    <div className="admin-pizzas-page">
      <div className="page-header">
        <h1 className="page-title">Pizza Menu</h1>
        <p className="page-description">Manage your pizza menu items and pricing</p>
      </div>

      <div className="pizzas-toolbar">
        <div className="search-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search pizzas…"
            value={searchQuery}
            onChange={handleSearchChange}
            className="filter-input"
            aria-label="Search pizzas"
          />
        </div>

        <button className="add-pizza-btn" onClick={() => handleOpenModal()}>
          <Plus size={17} />
          Add Pizza
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading pizzas…</div>
      ) : error ? (
        <div className="error-state">Error: {error}</div>
      ) : pizzas.length > 0 ? (
        <div className="pizzas-grid">
          {pizzas.map((pizza) => (
            <div key={pizza.id} className="pizza-card">
              <div className="pizza-image-wrapper">
                {pizza.image ? (
                  <img
                    src={mediaUrl(pizza.image)}
                    alt={pizza.name}
                    className="pizza-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="pizza-image-placeholder">
                    <ImageIcon size={36} />
                  </div>
                )}
              </div>

              <div className="pizza-card-content">
                <h3 className="pizza-name">{pizza.name}</h3>
                {pizza.description && (
                  <p className="pizza-description">{pizza.description}</p>
                )}

                <div className="pizza-info">
                  <div className="info-row">
                    <span className="info-label">Price</span>
                    <span className="info-value">${parseFloat(pizza.price).toFixed(2)}</span>
                  </div>
                  {pizza.category && (
                    <div className="info-row">
                      <span className="info-label">Category</span>
                      <span className="info-value">{pizza.category}</span>
                    </div>
                  )}
                </div>

                <div className="pizza-actions">
                  <button
                    className="pizza-action-btn edit-btn"
                    onClick={() => handleOpenModal(pizza)}
                  >
                    <Edit2 size={15} />
                    Edit
                  </button>
                  <button
                    className="pizza-action-btn delete-btn"
                    onClick={() => setDeleteConfirm(pizza.id)}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No pizzas found</p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Delete Pizza?</h2>
            <p className="modal-message">
              Are you sure you want to delete this pizza? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="btn-danger"
                disabled={deleting}
                onClick={() => handleDeletePizza(deleteConfirm)}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <PizzaFormModal pizza={editingPizza} onClose={handleCloseModal} onSave={handleSavePizza} />
      )}
    </div>
  );
};

export default AdminPizzas;
