import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import { apiUrl } from '../api';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username.trim() || !formData.password) {
      setError('Login va parolni kiriting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(apiUrl('/api/users/login/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.error || "Login yoki parol noto'g'ri.");
      }
    } catch (err) {
      setError('Server bilan ulanishda xatolik.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Xush kelibsiz!</h1>
          <p className="auth-subtitle">Tizimga kirish uchun ma'lumotlaringizni kiriting</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error-msg">{error}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="username">Login</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Login"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Parol</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Parolingiz"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>

        <div className="auth-footer">
          Hisobingiz yo'qmi?
          <Link to="/register" className="auth-link">Ro'yxatdan o'tish</Link>
        </div>
      </div>
    </div>
  );
}
