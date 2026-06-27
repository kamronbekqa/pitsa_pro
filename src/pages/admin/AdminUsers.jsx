import React, { useState, useEffect, useCallback } from 'react';
import { Search, Shield, ShieldOff, UserX } from 'lucide-react';
import { apiUrl } from '../../api';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchUsers = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(
        `${apiUrl('/api/admin/users/')}?${params.toString()}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.results || data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchUsers(val);
  };

  const handleToggleStaff = async (user) => {
    try {
      setUpdating(user.id);
      const response = await fetch(apiUrl(`/api/admin/users/${user.id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_staff: !user.is_staff }),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updated = await response.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      setUpdating(user.id);
      const response = await fetch(apiUrl(`/api/admin/users/${user.id}/`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updated = await response.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-description">Manage user accounts and permissions</p>
      </div>

      <div className="users-toolbar">
        <div className="search-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search users…"
            value={searchQuery}
            onChange={handleSearchChange}
            className="filter-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading users…</div>
      ) : error ? (
        <div className="error-state">Error: {error}</div>
      ) : users.length > 0 ? (
        <div className="users-table-shell">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="User">
                    <div className="user-cell">
                      <div className="user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
                      <span className="username">{user.username}</span>
                    </div>
                  </td>
                  <td data-label="Email">{user.email || '—'}</td>
                  <td data-label="Joined">{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td data-label="Role">
                    <span className={`role-badge ${user.is_staff ? 'role-admin' : 'role-user'}`}>
                      {user.is_staff ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`status-badge status-${user.is_active ? 'success' : 'danger'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <button
                        className="table-action-btn"
                        onClick={() => handleToggleStaff(user)}
                        disabled={updating === user.id}
                        title={user.is_staff ? 'Remove admin role' : 'Make admin'}
                      >
                        {user.is_staff ? <ShieldOff size={14} /> : <Shield size={14} />}
                        {user.is_staff ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        className="table-action-btn danger"
                        onClick={() => handleToggleActive(user)}
                        disabled={updating === user.id}
                        title={user.is_active ? 'Deactivate user' : 'Activate user'}
                      >
                        <UserX size={14} />
                        {user.is_active ? 'Deactivate' : 'Activate'}
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
          <p>No users found</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
