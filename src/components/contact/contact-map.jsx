'use client';
import React from 'react';

const ContactMap = () => {
  const gmapSrc =
    'https://www.google.com/maps?q=4TH+FLOOR,+Safal+Prelude,+404,+Corporate+Rd,+near+YMCA+CLUB,+Prahlad+Nagar,+Ahmedabad,+Gujarat+380015&output=embed';

  const directionsLink =
    'https://www.google.com/maps/dir/?api=1&destination=4TH+FLOOR,+Safal+Prelude,+404,+Corporate+Rd,+near+YMCA+CLUB,+Prahlad+Nagar,+Ahmedabad,+Gujarat+380015';

  const viewLink =
    'https://www.google.com/maps/place/4TH+FLOOR,+Safal+Prelude,+404,+Corporate+Rd,+near+YMCA+CLUB,+Prahlad+Nagar,+Ahmedabad,+Gujarat+380015';

  return (
    <section className="map-block">
      <div className="wrap">
        {/* Map */}
        <div className="frame" role="region" aria-label="Office location on Google Maps">
          <iframe
            src={gmapSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            title="Amrita Global – Safal Prelude"
          />
        </div>

        {/* Info-window style card */}
        <aside className="info-window" aria-label="Office address">
          <h4 className="iw-title">Amrita Global Enterprises</h4>
          <p className="iw-address">
            404, 4th Floor, Safal Prelude,<br />
            Behind YMCA Club, Corporate Road,<br />
            Prahlad Nagar, Ahmedabad, Gujarat 380015
          </p>

          <div className="iw-links">
            <a href={directionsLink} target="_blank" rel="noopener noreferrer" className="iw-link">
              Directions
            </a>
            <a href={viewLink} target="_blank" rel="noopener noreferrer" className="iw-link">
              View larger map
            </a>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .map-block {
          padding: 24px 0 80px;
          background: #f7f9fc; /* light page bg so it contrasts with the footer */
        }
        .wrap {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
        }
        .frame {
          height: 420px;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 10px 30px rgba(15, 34, 53, 0.12);
        }

        /* --- Info window (Google style) --- */
        .info-window {
          position: absolute;
          top: 24px;
          left: 40px;
          width: 320px;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.15),
            0 1px 0 rgba(255, 255, 255, 0.6) inset;
          padding: 10px 12px;
          color: #202124; /* google-ish neutral */
          font-family: Roboto, Arial, sans-serif;
        }
        .iw-title {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 700;
          color: #202124;
          line-height: 1.2;
        }
        .iw-address {
          margin: 0 0 10px;
          font-size: 13px;
          line-height: 1.45;
          color: #5f6368; /* grey text like maps */
        }
        .iw-links {
          display: flex;
          gap: 14px;
          align-items: center;
          flex-wrap: wrap;
        }
        .iw-link {
          font-size: 13px;
          color: #1a73e8; /* google blue */
          text-decoration: none;
        }
        .iw-link:hover {
          text-decoration: underline;
        }

        /* responsive */
        @media (max-width: 768px) {
          .frame { height: 360px; }
          .info-window {
            top: 16px;
            left: 16px;
            width: calc(100% - 32px);
          }
        }
        @media (max-width: 480px) {
          .frame { height: 320px; }
          .info-window {
            position: relative;
            top: auto; left: auto;
            width: 100%;
            margin-top: 12px;
          }
        }
      `}</style>
    </section>
  );
};

export default ContactMap;
