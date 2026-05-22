import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Offers.css';
import AOS from 'aos';

export default function Offers() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ offset: 100, duration: 600, easing: "ease-in-sine" });
  }, []);

  const usePromo = (code) => {
    localStorage.setItem('pendingPromoCode', code);
    navigate('/cart');
  };

  const goToMenu = () => {
    navigate('/menu');
  };

  return (
    <div className="offers-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Maxsus <span>Chegirmalar</span></h1>
          <p className="page-subtitle">Ajoyib takliflar faqat siz uchun</p>
        </div>
      </div>

      <section className="offers-section">
        <div className="container">
          <div className="offers-grid">
            <div data-aos="fade-up" className="offer-card primary-offer">
              <div className="offer-content">
                <span className="offer-badge">Yangi Mijozlar Uchun</span>
                <h2>2 ta pitsa oling, 3-chisi bepul!</h2>
                <p>Ushbu taklif faqat bugun amal qiladi. Istalgan 2 ta pitsa buyurtma qiling va o'rtacha pitsani mutlaqo bepul qo'lga kiriting.</p>
                <button type="button" className="offer-button" onClick={() => usePromo('FREEPIZZA')}>
                  Promo-kodni ishlatish
                </button>
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="100" className="offer-card secondary-offer">
              <div className="offer-content">
                <span className="offer-badge">Tug'ilgan kun</span>
                <h2>-20% Barcha menyuga</h2>
                <p>Tug'ilgan kuningizda bizning pitsalardan bahramand bo'ling va barcha buyurtmalaringizga 20% chegirma oling.</p>
                <button type="button" className="offer-button" onClick={goToMenu}>
                  Menyudan tanlash
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
