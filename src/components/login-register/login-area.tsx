'use client';
import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiEye, FiPackage } from 'react-icons/fi';
import { TbBadge } from 'react-icons/tb';
import LoginForm from '../forms/login-form';
import styles from '../../components/auth/AuthArea.module.css';

type Props = {
  onClose?: () => void;
  onSwitchToRegister?: () => void;
};

const LoginArea: React.FC<Props> = ({ onClose, onSwitchToRegister }) => {
  const router = useRouter();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleClose = useCallback(() => {
    if (onClose) { onClose(); return; }
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/');
  }, [onClose, router]);

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
        data-auth="login"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <div className={styles.modalGrid}>
          <button className={styles.modalClose} aria-label="Close" onClick={handleClose}>✕</button>

          {/* Left hero – unchanged */}
          <div className={styles.leftPanel}>
            <div className={styles.leftContent}>
              <img src="/assets/img/login/login-shape-1.png" alt="AGE" className={styles.logo} />
              <h2 className={styles.heading}>Everything you need to source fabric at scale</h2>
              <ul className={styles.features}>
                <li><FiSearch className={styles.icon} /> 20k+ SKUs from audited mills</li>
                <li><TbBadge className={styles.icon} /> Free hangers & swatches on demand</li>
                <li><FiEye className={styles.icon} /> Live stock, price & lead-time visibility</li>
                <li><FiPackage className={styles.icon} /> Low MOQs • Faster repeat ordering</li>
              </ul>
            </div>
          </div>

          {/* Right form – unchanged, but copy mentions OTP */}
          <div className={styles.rightPanel}>
            <div className={styles.header}>
              <h3 id="auth-title" className={styles.title}>Login</h3>
              <p className={styles.subtitle}>
                {/* Old text kept same; signup flow untouched */}
                Don’t have an account?{' '}
                {onSwitchToRegister ? (
                  <button type="button" className={styles.linkBtn} onClick={onSwitchToRegister}>
                    Signup
                  </button>
                ) : (
                  <Link href="/register" className={styles.linkBtn}>Signup</Link>
                )}
              </p>

              {/* ⛔ If you had any “or login with password” link in this header, keep it commented out.
              <p className={styles.subtitleSmall}>or sign in with password</p>
              */}
            </div>

            <div className={styles.formWrapper}>
              {/* OTP-only logic lives inside LoginForm now */}
              <LoginForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginArea;
