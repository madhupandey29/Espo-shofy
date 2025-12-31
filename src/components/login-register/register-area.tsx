'use client';
import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiEye, FiPackage } from 'react-icons/fi';
import { TbBadge } from 'react-icons/tb';
import RegisterForm from '../forms/register-form';
import styles from '../../components/auth/AuthArea.module.css';

type Props = {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
};

const RegisterArea: React.FC<Props> = ({ onClose, onSwitchToLogin }) => {
  const router = useRouter();

  // Lock page scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/');
  }, [onClose, router]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  return (
    <>
      <div className={styles.modalOverlay} onClick={handleClose} />

      <section
        className={styles.modalCard}
        data-auth="register"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <div className={styles.modalGrid}>
          {/* ✕ inside the card */}
          <button className={styles.modalClose} onClick={handleClose} aria-label="Close">✕</button>

          {/* Left hero */}
            <div className={styles.leftPanel}>
  <div className={styles.leftContent}>
    <img
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJM0g6DS-JDkn7VvBDb6KfRzbS8ZiZfnuHJQ&s"
      alt="Logo"
      className={styles.logo}
    />
    <h2 className={styles.heading}>Everything you need to source fabric at scale</h2>
    <ul className={styles.features}>
      <li><FiSearch className={styles.icon} /> 20k+ SKUs from audited mills</li>
      <li><TbBadge className={styles.icon} /> Free hangers & swatches on demand</li>
      <li><FiEye className={styles.icon} /> Live stock, price & lead-time visibility</li>
      <li><FiPackage className={styles.icon} /> Low MOQs • Faster repeat ordering</li>
    </ul>
  </div>
</div>


          {/* Right form (scrolls on small screens) */}
          <div className={styles.rightPanel}>
            <div className={styles.header}>
              <h3 id="auth-title" className={styles.title}>Signup</h3>
              <p className={styles.subtitle}>
                Already a member?{' '}
                {onSwitchToLogin ? (
                  <button type="button" className={styles.linkBtn} onClick={onSwitchToLogin}>
                    Login
                  </button>
                ) : (
                  <Link href="/login" className={styles.linkBtn}>Login</Link>
                )}
              </p>
            </div>

            <div className={`${styles.formWrapper} ${styles.isRegister}`}>
              <RegisterForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegisterArea;
