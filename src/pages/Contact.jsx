import React, { useEffect, useState } from 'react';
import './Contact.css';
import AOS from 'aos';
import { apiUrl } from '../api';

export default function Contact() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    AOS.init({ offset: 100, duration: 600, easing: "ease-in-sine" });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setStatusMsg('Xatolik: Telefon raqamini +998XXXXXXXXX formatida kiriting.');
      return;
    }

    try {
      const res = await fetch(apiUrl('/api/contact/messages/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, text: message })
      });
      if (res.ok) {
        setStatusMsg('Xabaringiz yuborildi! Tez orada aloqaga chiqamiz.');
        setName(''); setPhone(''); setMessage('');
      } else {
        setStatusMsg('Xatolik yuz berdi.');
      }
    } catch(err) {
      setStatusMsg('Server bilan ulanishda xatolik.');
    }
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Biz bilan <span>Aloqa</span></h1>
          <p className="page-subtitle">Savollaringiz bo'lsa bizga yozing!</p>
        </div>
      </div>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div data-aos="fade-right" className="contact-info">
              <h2>Bog'lanish ma'lumotlari</h2>
              <p>Biz doimo aloqadamiz. Savollar, takliflar yoki buyurtmalar bo'yicha bizga murojaat qiling.</p>
              
              <div className="info-list">
                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div>
                    <h3>Manzil</h3>
                    <p>Toshkent shahri, Yunusobod tumani, 12-daha</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">📞</div>
                  <div>
                    <h3>Telefon</h3>
                    <p>+998 (90) 123-45-67</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">✉️</div>
                  <div>
                    <h3>Email</h3>
                    <p>info@pitsamaster.uz</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">⏰</div>
                  <div>
                    <h3>Ish vaqti</h3>
                    <p>Har kuni 10:00 - 23:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div data-aos="fade-left" className="contact-form-wrapper">
              <form className="contact-form" onSubmit={handleSubmit}>
                <h3>Xabar yuborish</h3>
                {statusMsg && <p style={{color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center'}}>{statusMsg}</p>}
                
                <div className="form-group">
                  <label htmlFor="name">Ismingiz</label>
                  <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ismingizni kiriting" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Telefon raqamingiz</label>
                  <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Xabar</label>
                  <textarea id="message" rows="5" value={message} onChange={e => setMessage(e.target.value)} placeholder="Xabaringizni yozing" required></textarea>
                </div>
                
                <button type="submit" className="submit-button">Yuborish</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
