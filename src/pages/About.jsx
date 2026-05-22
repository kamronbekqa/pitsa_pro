import React, { useEffect } from 'react';
import './About.css';
import AOS from 'aos';

export default function About() {
  useEffect(() => {
    AOS.init({ offset: 100, duration: 600, easing: "ease-in-sine" });
  }, []);

  return (
    <div className="about-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Biz <span>haqimizda</span></h1>
          <p className="page-subtitle">Sifat, ishonch va betakror ta'm</p>
        </div>
      </div>

      <section className="about-content-section">
        <div className="container">
          <div className="about-grid">
            <div data-aos="fade-right" className="about-text-content">
              <h2>PitsaMaster tarixi</h2>
              <p>
                PitsaMaster 2025-yilda haqiqiy italiyan pitsasini har bir xonadonga yetkazish maqsadi bilan tashkil etilgan. Bizning asosiy missiyamiz — sifatli mahsulotlardan foydalanib, an'anaviy Napoli uslubida pitsa tayyorlashdir.
              </p>
              <p>
                Har bir pitsamiz 24 soat davomida maxsus fermentatsiya qilingan xamirdan tayyorlanadi. Biz faqat Italiyadan keltirilgan asl Mozzarella pishlog'i va yangi terilgan pomidorlardan foydalanamiz.
              </p>
              
              <div className="stats-container">
                <div className="stat-item">
                  <span className="stat-number">5k+</span>
                  <span className="stat-label">Baxtli mijozlar</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">10+</span>
                  <span className="stat-label">Pitsa turlari</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">30m</span>
                  <span className="stat-label">Tez yetkazish</span>
                </div>
              </div>
            </div>
            
            <div data-aos="fade-left" className="about-image-wrapper">
              <img src="/6.jpg" alt="Pitsa tayyorlash jarayoni" className="about-image" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
