'use client';
import React from 'react';

const ContactBreadcrumb = () => {
  return (
    <section className="contact-breadcrumb brand-dark">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@700;800&display=swap"
        rel="stylesheet"
      />

      <div className="container">
        <div className="inner">
          <div className="title-section">
            <h2 className="title">Keep In Touch with Us</h2>
            <div className="title-decoration">
              <div className="decoration-line" />
              <div className="decoration-dot" />
              <div className="decoration-line" />
            </div>
          </div>

          <nav className="trail" aria-label="Breadcrumb">
            <a href="/" className="trail-link">Home</a>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="trail-current">Contact</span>
          </nav>
        </div>
      </div>

      <style jsx>{`
        /* ===== Brand tokens — identical to footer ===== */
        .brand-dark{
          --navy:    #0F2235;   /* footer/header deep */
          --ink:     #142A42;   /* slightly lighter navy */
          --accent:  #2C4C97;   /* royal blue */
          --gold:    #D6A74B;   /* highlight */
          --white:   #FFFFFF;
          --text:    rgba(255,255,255,.92);
          --text-soft: rgba(255,255,255,.78);
          --chip-bg: rgba(20,42,66,.55);
          --chip-bd: rgba(255,255,255,.16);
          --shadow:  0 18px 60px rgba(0,0,0,.35);
        }

        /* Section: deep like footer, but with soft gradient + vignette */
        .contact-breadcrumb{
          position:relative; isolation:isolate; overflow:hidden;
          min-height: clamp(240px, 36vh, 380px);
          display:flex; align-items:center; justify-content:center;
          padding: clamp(48px, 6vw, 80px) 0;
          color: var(--text);
          background:
            radial-gradient(1200px 520px at 18% -10%, rgba(255,255,255,.06), transparent 60%),
            linear-gradient(180deg, var(--navy) 0%, #0B1A2A 100%);
          box-shadow: inset 0 -120px 120px -110px rgba(0,0,0,.35);
        }

        .container{ max-width:1160px; margin:0 auto; padding:0 24px; width:100%; }
        .inner{ text-align:center; animation: rise .6s ease-out both; }

        .title-section{ margin-bottom: 26px; }

        /* Title: white, subtle glow, footer-gold underline */
        .title{
          margin:0 0 16px;
          font-family:'Outfit', Inter, system-ui, sans-serif;
          font-weight:800; letter-spacing:.2px; line-height:1.08;
          font-size: clamp(32px, 5.2vw, 64px);
          color:#F7FBFF;
          text-shadow: 0 1px 0 rgba(0,0,0,.25), 0 18px 55px rgba(0,0,0,.28);
        }
        .title-decoration{
          display:flex; align-items:center; justify-content:center; gap:12px; margin:0 auto; max-width:200px;
        }
        .decoration-line{ height:3px; flex:1; border-radius:2px; background: var(--gold); }
        .decoration-dot{ width:7px; height:7px; border-radius:50%; background: var(--gold); box-shadow:0 0 0 4px rgba(214,167,75,.18); }

        /* Breadcrumb chip: dark glass to match footer, blue hover */
        .trail{
          display:inline-flex; align-items:center; gap:10px;
          padding:10px 16px; border-radius:999px;
          background: var(--chip-bg);
          border:1px solid var(--chip-bd);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 12px 30px rgba(0,0,0,.22);
          font-size:14.5px; font-weight:700; color: var(--text-soft);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }
        .trail:hover{
          transform: translateY(-2px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 18px 40px rgba(0,0,0,.28);
          border-color: rgba(44,76,151,.35);
        }

        .trail-link{
          color:#EAF2FF; text-decoration:none; border-bottom:1px dotted transparent;
          transition: color .15s ease, border-color .15s ease, transform .08s ease, opacity .15s ease;
        }
        .trail-link:hover{ color:var(--accent); border-bottom-color: currentColor; transform: translateY(-1px); }

        .trail-current{ color:#ffffff; }
        .trail svg{ color: var(--gold); opacity:.95; }

        @keyframes rise{ from{ transform:translateY(10px); opacity:0 } to{ transform:translateY(0); opacity:1 } }

        @media (max-width:768px){
          .contact-breadcrumb{ min-height: clamp(200px, 32vh, 320px); }
        }
      `}</style>
    </section>
  );
};

export default ContactBreadcrumb;
