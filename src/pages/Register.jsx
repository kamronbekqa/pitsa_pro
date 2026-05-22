import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if (formData.username.trim().length < 3) {
      setError("Login kamida 3 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmadi!');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password
        }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : 'Xatolik yuz berdi.');
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
          <h1 className="auth-title">Ro'yxatdan o'tish</h1>
          <p className="auth-subtitle">Buyurtma statuslarini notification orqali kuzating</p>
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
              placeholder="Ali123"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
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
              placeholder="Kamida 8 ta belgi"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Parolni tasdiqlang</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              placeholder="Parolni qayta kiriting"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Yaratilmoqda...' : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <div className="auth-footer">
          Hisobingiz bormi?
          <Link to="/login" className="auth-link">Kirish</Link>
        </div>
      </div>
    </div>
  );
}
