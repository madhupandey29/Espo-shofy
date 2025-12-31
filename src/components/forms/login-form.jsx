'use client';

import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter, useSearchParams } from 'next/navigation';
import ErrorMsg from '../common/error-msg';
import { notifyError, notifySuccess } from '@/utils/toast';

/* ---------------- helpers ---------------- */
const isEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v || '').trim());
const isPhone = (v) => /^[0-9]{8,15}$/.test(String(v || '').trim());
const emailOrPhoneMsg = 'Enter a valid email or mobile number';

/* single input validation: accepts email or phone */
const otpRequestSchema = Yup.object().shape({
  identifier: Yup.string()
    .required(emailOrPhoneMsg)
    .test('email-or-phone', emailOrPhoneMsg, (v) => isEmail(v) || isPhone(v)),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [savedIdentifier, setSavedIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [showVerify, setShowVerify] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register: regOtp,
    handleSubmit: onOtpReqSubmit,
    formState: { errors: otpErrReq },
    reset: resetOtpReq,
  } = useForm({ resolver: yupResolver(otpRequestSchema) });

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const KEY = process.env.NEXT_PUBLIC_API_KEY;

  // Explicit verify URL (as requested)
  const VERIFY_URL = 'https://test.amrita-fashions.com/shopy/users/verify-login-otp';

  /* =============== OTP REQUEST (step 1) =============== */
  const handleOtpRequest = async (data) => {
    try {
      setLoading(true);
      const identifier = data.identifier?.trim();
      setSavedIdentifier(identifier);

      const payload = isEmail(identifier)
        ? { email: identifier }
        : { phone: identifier };

      const res = await fetch(`${API}/users/request-login-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(KEY ? { 'x-api-key': KEY } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || 'OTP send failed');

      notifySuccess(json?.message || 'OTP sent successfully');
      resetOtpReq();
      setShowVerify(true);
    } catch (err) {
      notifyError(err?.message || 'OTP request failed');
    } finally {
      setLoading(false);
    }
  };

  /* =============== OTP VERIFY (step 2) =============== */
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = isEmail(savedIdentifier)
        ? { email: savedIdentifier, otp }
        : { phone: savedIdentifier, otp };

      const res = await fetch(VERIFY_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      // Expected:
      // { success, message, user: {...}, session: { id, userId } }
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Invalid OTP');
      }

      const sessionId = json?.session?.id;
      const userId = json?.session?.userId || json?.user?._id;

      // ====== Persist Session in localStorage (as requested) ======
      if (typeof window !== 'undefined') {
        if (sessionId) localStorage.setItem('sessionId', sessionId);
        if (userId) localStorage.setItem('userId', userId);
      }

      // Optional: also mirror in a cookie (useful for SSR/middleware)
      if (sessionId) {
        Cookies.set('sessionId', sessionId, {
          expires: 7,
          sameSite: 'lax',
          path: '/',
          // secure: true, // enable on HTTPS
        });
      }
      Cookies.set('userInfo', JSON.stringify({ user: json.user }), {
        expires: 0.5, // ~12h
        sameSite: 'lax',
        path: '/',
        // secure: true,
      });

      notifySuccess(json?.message || 'Logged in successfully');
      setOtp('');

      const dest = redirect || '/';
      router.push(dest);
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ====================== UI ====================== */
  return (
    <div>
      {/* STEP 1 — Request OTP */}
      {!showVerify && (
        <form onSubmit={onOtpReqSubmit(handleOtpRequest)} className="space-y-4 mb-6">
          <div className="tp-input-box">
            <label className="tp-label" htmlFor="lo-identifier">Enter Email/Mobile number</label>
            <input
              id="lo-identifier"
              autoFocus
              {...regOtp('identifier')}
              type="text"
              placeholder="you@example.com or 9876543210"
              className="tp-input"
              inputMode="email"
            />
            <ErrorMsg msg={otpErrReq?.identifier?.message} />
          </div>

          <div className="tp-actions">
            <button type="submit" className="tp-btn tp-btn-black" disabled={loading}>
              {loading ? 'Sending…' : 'Request OTP'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2 — Verify OTP */}
      {showVerify && (
        <form onSubmit={handleOtpVerify} className="space-y-4 mb-6">
          <div className="tp-input-box">
            <label className="tp-label" htmlFor="lv-otp">OTP</label>
            <input
              id="lv-otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="tp-input"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              autoFocus
            />
          </div>

          {error ? <ErrorMsg msg={error} /> : null}

          <div className="tp-actions">
            <button type="submit" disabled={loading} className="tp-btn tp-btn-black">
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
          </div>

          <div className="tp-divider">
            <button
              type="button"
              className="tp-link"
              onClick={() => { setShowVerify(false); setOtp(''); }}
            >
              edit email / mobile
            </button>
          </div>
        </form>
      )}

      <style jsx>{`
        .tp-input-box { display:flex; flex-direction:column; gap:6px; }
        .tp-label { font-weight:600; color:#0f172a; }
        .tp-input {
          width:100%;
          padding:12px 14px;
          border:1px solid #d6dae1;
          border-radius:0;
          background:#fff;
          color:#0f172a;
          outline:none;
          transition:border-color .15s ease, box-shadow .15s ease;
        }
        .tp-input:focus { border-color:#0f172a; box-shadow:0 0 0 2px rgba(15,23,42,.15); }
        .tp-actions { margin-top:8px; }
        .tp-btn { width:100%; padding:12px 18px; border:1px solid transparent; border-radius:0; font-weight:700; cursor:pointer; transition:all .18s ease; }
        .tp-btn-black { background:#000; color:#fff; border-color:#000; }
        .tp-btn-black:hover { background:#fff; color:#000; border-color:#000; }
        .tp-divider { text-align:center; margin:18px 0; }
        .tp-link { background:none; border:0; color:#475569; text-decoration:underline; cursor:pointer; }
      `}</style>
    </div>
  );
}
