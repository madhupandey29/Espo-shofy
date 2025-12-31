'use client';
import React from 'react';
import ContactForm from '../forms/contact-form';
import { useGetOfficeInformationQuery } from '@/redux/features/officeInformationApi';

import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaPinterestP } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function ContactArea() {
  const { data: officeInfo, isLoading, error } = useGetOfficeInformationQuery();

  // Fallback data in case API fails
  const fallbackData = {
    email: 'info@amritafashions.com',
    phone: '+91 99251 55141',
    phone2: null,
    officeAddress:
      '404, 4th Floor, Safal Prelude, Behind YMCA Club, Corporate Road, Prahlad Nagar, Ahmedabad, Gujarat, India — 380015',
    factoryAddress: '1, Mohan Estate, Ramol Road, Ahmedabad, Gujarat, India — 382449',
    warehouseAddress:
      'Nr. Ambuja Synthetics, B/H Old Narol Court, Narol, Ahmedabad, Gujarat, India — 382405',
    uaeOfficeAddress: 'GSK Worldwide FZE, Ajman Free Zone, UAE',
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    pinterest: '',
  };

  // Map API response to expected format
  const apiData = officeInfo?.data?.[0];
  const contactData = apiData
    ? {
        email: apiData.companyEmail || fallbackData.email,
        phone: apiData.companyPhone1 || fallbackData.phone,
        phone2: apiData.companyPhone2 || fallbackData.phone2,
        officeAddress: apiData.companyAddress || fallbackData.officeAddress,
        factoryAddress: apiData.factoryAddress || fallbackData.factoryAddress,
        warehouseAddress: apiData.warehouseAddress || fallbackData.warehouseAddress,
        uaeOfficeAddress: apiData.uaeOfficeAddress || fallbackData.uaeOfficeAddress,
        facebook: apiData.facebook || '',
        instagram: apiData.instagram || '',
        linkedin: apiData.linkedin || '',
        twitter: apiData.twitter || '',
        youtube: apiData.youtube || '',
        pinterest: apiData.pinterest || '',
      }
    : fallbackData;

  // ✅ Social icons list (values from API)
  const socials = React.useMemo(() => {
    const list = [
      { key: 'facebook', label: 'Facebook', url: contactData.facebook, color: '#1877F2', icon: <FaFacebookF size={18} /> },
      { key: 'instagram', label: 'Instagram', url: contactData.instagram, color: '#E4405F', icon: <FaInstagram size={18} /> },
      { key: 'linkedin', label: 'LinkedIn', url: contactData.linkedin, color: '#0A66C2', icon: <FaLinkedinIn size={18} /> },
      { key: 'twitter', label: 'X', url: contactData.twitter, color: '#111827', icon: <FaXTwitter size={18} /> },
      { key: 'youtube', label: 'YouTube', url: contactData.youtube, color: '#FF0000', icon: <FaYoutube size={20} /> },
      { key: 'pinterest', label: 'Pinterest', url: contactData.pinterest, color: '#E60023', icon: <FaPinterestP size={18} /> },
    ].filter((x) => !!x.url);

    return list;
  }, [
    contactData.facebook,
    contactData.instagram,
    contactData.linkedin,
    contactData.twitter,
    contactData.youtube,
    contactData.pinterest,
  ]);

  const containerStyle = {
    backgroundColor: '#F7F9FC',
    padding: '60px 0',
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  };

  const wrapperStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  };

  const gridStyle = {
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
  };

  const infoSideStyle = {
    flex: '1',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 24px rgba(15,34,53,.08)',
    border: '2px solid #2C4C97',
  };

  const formSideStyle = {
    flex: '1',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 24px rgba(15,34,53,.08)',
    border: '1px solid #E6ECF2',
    position: 'relative',
  };

  const headingStyle = {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0F2235',
    margin: '0 0 14px',
    position: 'relative',
  };

  const subtitleStyle = {
    color: '#475569',
    margin: '16px 0 24px',
    lineHeight: '1.6',
    fontSize: '16px',
  };

  const infoLineStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6ECF2',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '12px',
    boxShadow: '0 4px 12px rgba(15,34,53,.06)',
    transition: 'all 0.3s ease',
  };

  const iconStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #2C4C97, #1f3f80)',
    color: '#fff',
    flexShrink: '0',
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    fontSize: '12px',
    color: '#142A42',
    marginBottom: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  };

  const valueStyle = {
    color: '#475569',
    fontSize: '14px',
    lineHeight: '1.4',
  };

  const linkStyle = {
    color: '#2C4C97',
    textDecoration: 'none',
  };

  return (
    <section style={containerStyle}>
      <div style={wrapperStyle}>
        {/* ✅ className needed for responsive CSS */}
        <div className="contact-grid" style={gridStyle}>
          {/* Left: Contact Info */}
          <div style={infoSideStyle}>
            <div style={{ position: 'relative', marginBottom: '6px' }}>
              <h2 style={headingStyle}>Get in Touch</h2>
              <div
                style={{
                  width: '64px',
                  height: '4px',
                  borderRadius: '2px',
                  background: '#D6A74B',
                }}
              />
            </div>

            <p style={subtitleStyle}>
              We&apos;d love to hear from you. Reach out to us through any of the following channels.
            </p>

            {contactData.email && (
              <div style={infoLineStyle}>
                <div style={iconStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="22,6 12,13 2,6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: '1' }}>
                  <span style={labelStyle}>Email</span>
                  <a href={`mailto:${contactData.email}`} style={{ ...valueStyle, ...linkStyle }}>
                    {contactData.email}
                  </a>
                </div>
              </div>
            )}

            {contactData.phone && (
              <div style={infoLineStyle}>
                <div style={iconStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 16.92V19.92C22 20.52 21.39 21 20.92 21C9.11 21 1 12.89 1 1.08C1 0.61 1.48 0 2.08 0H5.08C5.68 0 6.08 0.4 6.08 0.92C6.08 3.29 6.56 5.54 7.47 7.57C7.61 7.89 7.51 8.27 7.22 8.49L5.9 9.52C7.07 11.57 8.43 12.93 10.48 14.1L11.51 12.78C11.73 12.49 12.11 12.39 12.43 12.53C14.46 13.44 16.71 13.92 19.08 13.92C19.6 13.92 20 14.32 20 14.92V16.92H22Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div style={{ flex: '1' }}>
                  <span style={labelStyle}>Phone</span>
                  <div>
                    <a href={`tel:${contactData.phone}`} style={{ ...valueStyle, ...linkStyle, display: 'block' }}>
                      {contactData.phone}
                    </a>
                    {contactData.phone2 && contactData.phone2 !== contactData.phone && (
                      <a
                        href={`tel:${contactData.phone2}`}
                        style={{ ...valueStyle, ...linkStyle, display: 'block', fontSize: '13px', opacity: '0.8' }}
                      >
                        {contactData.phone2}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {contactData.officeAddress && (
              <div style={infoLineStyle}>
                <div style={iconStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="10"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: '1' }}>
                  <span style={{ ...labelStyle, color: '#D6A74B' }}>Office Address</span>
                  <span style={valueStyle}>{contactData.officeAddress}</span>
                </div>
              </div>
            )}

            {contactData.factoryAddress && (
              <div style={infoLineStyle}>
                <div style={iconStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 20H22V22H2V20Z" fill="currentColor" />
                    <path
                      d="M3 20V9L8 6V4H10V6L15 9V20H3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 9L20 6V20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: '1' }}>
                  <span style={{ ...labelStyle, color: '#D6A74B' }}>Factory Address</span>
                  <span style={valueStyle}>{contactData.factoryAddress}</span>
                </div>
              </div>
            )}

            {contactData.warehouseAddress && (
              <div style={infoLineStyle}>
                <div style={iconStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 8.35L12 2L2 8.35L12 14.7L22 8.35Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 10.1V16.5L12 20L18 16.5V10.1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: '1' }}>
                  <span style={{ ...labelStyle, color: '#D6A74B' }}>Warehouse Address</span>
                  <span style={valueStyle}>{contactData.warehouseAddress}</span>
                </div>
              </div>
            )}

            {/* ✅ FOLLOW US (icons, mobile-friendly) */}
            {socials.length > 0 && (
              <div style={infoLineStyle}>
                <div style={{ ...iconStyle, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 2H6C3.79 2 2 3.79 2 6V18C2 20.21 3.79 22 6 22H18C20.21 22 22 20.21 22 18V6C22 3.79 20.21 2 18 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 12L12 7L17 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div style={{ flex: '1' }}>
                  <span style={labelStyle}>Follow Us</span>

                  <div className="social-icons" aria-label="Social media links">
                    {socials.map((s) => (
                      <a
                        key={s.key}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon-btn"
                        aria-label={s.label}
                        title={s.label}
                        style={{
                          borderColor: `${s.color}55`,
                          background: `${s.color}14`,
                          color: s.color,
                        }}
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#475569' }}>
                Loading contact information...
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#dc2626',
                  textAlign: 'center',
                }}
              >
                Unable to load contact information. Please try again later.
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div style={formSideStyle}>
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '4px',
                background: 'linear-gradient(90deg, #D6A74B, #2C4C97, #D6A74B)',
                borderRadius: '16px 16px 0 0',
              }}
            />
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#0F2235', fontSize: '22px', fontWeight: '700', margin: '0 0 6px' }}>
                Send us a Message
              </h3>
              <p style={{ color: '#475569', margin: '0', fontSize: '14px', lineHeight: '1.5' }}>
                Fill out the form below and we&apos;ll get back to you shortly.
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .contact-grid {
            flex-direction: column !important;
            gap: 24px !important;
          }
        }

        /* ✅ Icon row: looks clean on mobile */
        .social-icons {
          display: flex;
          flex-wrap: wrap; /* wraps nicely on mobile */
          gap: 10px;
          margin-top: 8px;
        }

        .social-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(15, 34, 53, 0.12);
          text-decoration: none;
          transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
          box-shadow: 0 6px 16px rgba(15, 34, 53, 0.08);
        }

        .social-icon-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(15, 34, 53, 0.14);
        }

        @media (max-width: 420px) {
          .social-icons {
            gap: 8px;
          }
          .social-icon-btn {
            width: 40px;
            height: 40px;
            border-radius: 11px;
            box-shadow: 0 4px 12px rgba(15, 34, 53, 0.08);
          }
        }
      `}</style>
    </section>
  );
}
