'use client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { FaEdit, FaTrash } from 'react-icons/fa';
import dayjs from 'dayjs';
import {
  pdf as pdfRenderer,
  Document as PDFDocument,
  Page as PDFPage,
  Text as PDFText,
  View as PDFView,
  StyleSheet as PDFStyleSheet,
  Image as PDFImage,
} from '@react-pdf/renderer';

import {
  useGetSessionInfoQuery,
  useUpdateProfileMutation,
  useLogoutUserMutation,
} from '@/redux/features/auth/authApi';

import { notifyError, notifySuccess } from '@/utils/toast';
import styles from './UserProfile.module.css';

/* ---------------- helpers ---------------- */
const pickInitialUser = (reduxUser) => {
  if (reduxUser) return reduxUser;
  const cookie = Cookies.get('userInfo');
  if (!cookie) return null;
  try { return JSON.parse(cookie)?.user || null; } catch { return null; }
};

const readUserInfoCookie = () => {
  try { return JSON.parse(Cookies.get('userInfo') || '{}'); } catch { return {}; }
};
const writeUserInfoCookiePreserving = (updatedUser) => {
  const prev = readUserInfoCookie();
  Cookies.set('userInfo', JSON.stringify({ ...prev, user: updatedUser }), { expires: 0.5 });
};

const initials = (name = '') =>
  name.split(' ').filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join('') || 'U';

const onlyDigits = (s = '') => (s || '').replace(/\D+/g, '');
const normalizeDial = (s = '') => (s ? (s.startsWith('+') ? s : `+${s}`) : '');

const cleanString = (v) => (typeof v === 'string' ? v.trim() : v);

const diffPayload = (next, base, allowEmptyKeys = new Set()) => {
  const out = {};
  Object.keys(next).forEach((k) => {
    const nv = next[k];
    const bv = base?.[k];
    const same = (cleanString(nv) === cleanString(bv));
    if (same) return;
    if (nv === undefined) return;
    if (nv === '' && !allowEmptyKeys.has(k)) return;
    out[k] = nv;
  });
  return out;
};

const isInlineSrc = (src) =>
  typeof src === 'string' && (src.startsWith('data:') || src.startsWith('blob:'));

/**
 * Avatar renderer:
 * - data:/blob: => <img> (but WITH width/height/title/loading so SEO tools are happy)
 * - http(s) => next/image WITH width/height/title
 */
function AvatarImg({ src, size = 80, alt = 'Profile', title = 'Profile', priority = false, className }) {
  if (!src) return null;

  if (isInlineSrc(src)) {
    return (
      <img
        src={src}
        alt={alt}
        title={title}
        width={size}
        height={size}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      title={title}
      width={size}
      height={size}
      sizes={`${size}px`}
      priority={priority}
      className={className}
    />
  );
}

/* Validation */
const editSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  organisation: Yup.string().nullable(),
  phone: Yup.string().nullable(),
  address: Yup.string().nullable(),
  city: Yup.string().nullable(),
  state: Yup.string().nullable(),
  country: Yup.string().nullable(),
  pincode: Yup.string().nullable(),
});

/* ---------------- session helpers (client) ---------------- */
const getClientSessionId = () => {
  const fromCookie = Cookies.get('sessionId');
  if (fromCookie) return fromCookie;
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionId') || '';
    }
  } catch { /* noop */ }
  return '';
};

const redirectToLogin = () => {
  try {
    const redirect = typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : '/profile';
    window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
  } catch {
    window.location.href = '/login';
  }
};

/* ---------------- PDF styles (react-pdf) ---------------- */
const pdfStyles = PDFStyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 28, paddingHorizontal: 36, fontSize: 10, color: '#1F2A44' },
  tiny: { fontSize: 8, color: '#6B7280' },
  h1: { fontSize: 14, textAlign: 'center', marginBottom: 12, fontWeight: 700 },
  bar: { height: 2, backgroundColor: '#D6A74B', marginVertical: 8 },
  sectionCard: { border: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 10 },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  label: { fontSize: 8, color: '#6B7280', marginBottom: 2 },
  value: { fontSize: 10, color: '#111827' },
  badgeTitle: { textAlign: 'center', fontSize: 12, fontWeight: 700, marginVertical: 8 },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  metaItem: { flex: 1, border: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 8 },
  table: { marginTop: 12, borderRadius: 6, border: 1, borderColor: '#E5E7EB' },
  thead: { backgroundColor: '#F3F4F6', flexDirection: 'row' },
  th: { flex: 1, padding: 8, fontWeight: 700, fontSize: 9 },
  tdRow: { flexDirection: 'row', borderTop: 1, borderColor: '#E5E7EB' },
  td: { flex: 1, padding: 8, fontSize: 9 },
  totalsBox: { marginTop: 12, width: 240, alignSelf: 'flex-end', border: 1, borderColor: '#E5E7EB', borderRadius: 6 },
  totalsRow: { flexDirection: 'row', borderTop: 1, borderColor: '#E5E7EB' },
  totalsCellL: { flex: 1, padding: 6, fontSize: 9 },
  totalsCellR: { width: 80, padding: 6, fontSize: 9, textAlign: 'right' },
  totalsHead: { backgroundColor: '#EEF2FF', fontWeight: 700 },
  footer: { marginTop: 22, textAlign: 'center', fontSize: 8, color: '#6B7280' },
});

/* =============================== Component =============================== */
export default function UserProfile() {
  /* Guard: if no session, redirect */
  useEffect(() => {
    const sid = getClientSessionId();
    if (!sid) redirectToLogin();
  }, []);

  const authUser = useSelector((s) => s?.auth?.user);
  const cookieUser = useMemo(() => pickInitialUser(authUser), [authUser]);
  const derivedUserId = (authUser?._id || cookieUser?._id);

  useEffect(() => {
    if (derivedUserId) localStorage.setItem('userId', String(derivedUserId));
  }, [derivedUserId]);

  const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userId = derivedUserId || storedUserId || null;

  const { data: sessionData, refetch: refetchSession } =
    useGetSessionInfoQuery({ userId }, {
      skip: !userId,
      refetchOnFocus: true,
      refetchOnReconnect: true
    });

  // optimistic local user
  const [localUser, setLocalUser] = useState(null);
  const user = useMemo(() => {
    const merged = {
      ...(sessionData?.session?.user || {}),
      ...(cookieUser || {}),
      ...(authUser || {}),
      ...(localUser || {}),
    };
    // derive avatar field
    merged.avatar = merged.userImage || merged.avatarUrl || merged.avatar || null;
    return merged;
  }, [sessionData, cookieUser, authUser, localUser]);

  const [logoutUser] = useLogoutUserMutation();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  const [active, setActive] = useState('profile');
  const [avatarPreview, setAvatarPreview] = useState(null);

  /* Countries + dial codes */
  const [countries, setCountries] = useState([]);
  const [dialSelected, setDialSelected] = useState(''); // +91
  const [phoneLocal, setPhoneLocal] = useState('');     // digits only

  /* Dependent state/city */
  const [countryName, setCountryName] = useState('');
  const [states, setStates] = useState([]);
  const [stateName, setStateName] = useState('');
  const [cities, setCities] = useState([]);
  const [cityName, setCityName] = useState('');

  /* -------------------- Orders (My Orders tab) -------------------- */
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersErr, setOrdersErr] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      setOrdersLoading(true);
      setOrdersErr(null);
      try {
        const res = await fetch(`https://test.amrita-fashions.com/shopy/orders/user/${userId}`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        const json = await res.json();
        const list = json?.data?.orders || json?.orders || [];
        setOrders(Array.isArray(list) ? list : []);
      } catch (e) {
        setOrdersErr('Failed to load orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    if (active === 'booking') fetchOrders();
  }, [active, userId]);

  /* -------------------- react-hook-form -------------------- */
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(editSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      organisation: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
    }
  });

  /* --- normalize server user response for /shopy/users/:id --- */
  const normalizeUserPayload = (raw) => {
    const u = raw?.data?.user || raw?.user || raw || {};
    const firstName = u.firstName ?? (u.name ? String(u.name).split(' ')[0] : '');
    const lastName = u.lastName ?? (u.name ? String(u.name).split(' ').slice(1).join(' ').trim() : '');
    return {
      ...u,
      firstName,
      lastName,
      name: u.name ?? `${firstName} ${lastName}`.trim(),
      userImage: u.userImage || u.avatarUrl || u.avatar || null,
      avatar: u.userImage || u.avatarUrl || u.avatar || null,
    };
  };

  // Fetch user data when component mounts or userId changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`https://test.amrita-fashions.com/shopy/users/${userId}`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const raw = await response.json();
        const nu = normalizeUserPayload(raw);
        setLocalUser(prev => ({ ...(prev || {}), ...nu }));
        // also refresh cookie so the header/avatar elsewhere stays in sync
        writeUserInfoCookiePreserving(nu);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [userId]);

  /* Initialize form when user changes */
  useEffect(() => {
    if (!user) return;

    const firstName = user.firstName || (user.name ? user.name.split(' ')[0] : '');
    const lastName = user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ').trim() : '');

    reset({
      firstName,
      lastName,
      email: user.email || '',
      organisation: user.organisation || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || '',
      pincode: user.pincode || '',
    });

    setCountryName(user.country || '');
    setStateName(user.state || '');
    setCityName(user.city || '');

    const img = user.userImage || user.avatarUrl || user.avatar || null;
    setAvatarPreview(img);
  }, [user, reset]);

  /* countries list */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2,flags');
        const raw = await res.json();
        const list = (raw || [])
          .map((r) => {
            const root = r?.idd?.root || '';
            const suffixes = r?.idd?.suffixes || [];
            const dial = root && suffixes && suffixes.length ? `${root}${suffixes[0]}` : root || '';
            return {
              cca2: r?.cca2 || '',
              name: r?.name?.common || '',
              dial: dial || '',
              flagPng: r?.flags?.png || '',
            };
          })
          .filter((x) => x.cca2 && x.name && x.dial && x.flagPng)
          .sort((a, b) => a.name.localeCompare(b.name));
        if (mounted) setCountries(list);
      } catch {
        setCountries([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /* derive dial + local from current phone once countries are ready */
  useEffect(() => {
    if (!countries.length) return;
    const raw = String(user?.phone || '').trim();
    if (!raw) { setDialSelected(''); setPhoneLocal(''); return; }
    if (raw.startsWith('+')) {
      const match = countries
        .filter(c => raw.startsWith(c.dial))
        .sort((a, b) => b.dial.length - a.dial.length)[0];
      if (match) {
        setDialSelected(match.dial);
        setPhoneLocal(raw.slice(match.dial.length));
      } else {
        setDialSelected('');
        setPhoneLocal(onlyDigits(raw));
      }
    } else {
      setDialSelected('');
      setPhoneLocal(onlyDigits(raw));
    }
  }, [countries.length, user?.phone]);

  /* keep hidden phone value updated */
  useEffect(() => {
    const composed = (dialSelected && phoneLocal)
      ? `${normalizeDial(dialSelected)}${onlyDigits(phoneLocal)}`
      : (user?.phone || '');
    setValue('phone', composed, { shouldValidate: false, shouldDirty: true });
  }, [dialSelected, phoneLocal, setValue, user?.phone]);

  /* dependent states */
  useEffect(() => {
    let abort = false;
    (async () => {
      if (!countryName) { setStates([]); setStateName(''); setCities([]); setCityName(''); setValue('country', ''); return; }
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: countryName }),
        });
        const json = await res.json();
        const list = json?.data?.states || [];
        if (!abort) {
          setStates(list);
          setValue('country', countryName, { shouldDirty: true });
          if (!list.find((s) => s.name === stateName)) {
            setStateName(''); setValue('state', '', { shouldDirty: true });
            setCities([]); setCityName(''); setValue('city', '', { shouldDirty: true });
          }
        }
      } catch {
        if (!abort) {
          setStates([]); setStateName(''); setCities([]); setCityName('');
          setValue('state', ''); setValue('city', '');
        }
      }
    })();
    return () => { abort = true; };
  }, [countryName, stateName, setValue]);

  useEffect(() => {
    let abort = false;
    (async () => {
      if (!countryName || !stateName) { setCities([]); setCityName(''); setValue('city', ''); return; }
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: countryName, state: stateName }),
        });
        const json = await res.json();
        const list = json?.data || [];
        if (!abort) {
          setCities(list);
          if (!list.includes(cityName)) { setCityName(''); setValue('city', '', { shouldDirty: true }); }
        }
      } catch {
        if (!abort) { setCities([]); setCityName(''); setValue('city', ''); }
      }
    })();
    return () => { abort = true; };
  }, [countryName, stateName, setValue]);

  /* ---------------- Avatar pick ---------------- */
  const [selectedFile, setSelectedFile] = useState(null);

  const onPickAvatar = (file) => {
    if (!file) return;
    if (!file.type.match('image.*')) {
      notifyError('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notifyError('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result || null;
      setAvatarPreview(result);
    };
    reader.onerror = () => notifyError('Failed to read the image file');
    reader.readAsDataURL(file);
  };

  /* ---------------- Save profile ---------------- */
  const onSubmit = async (data) => {
    if (!userId) { notifyError('Cannot update profile: user not identified.'); return; }

    const composedPhone = (dialSelected && phoneLocal)
      ? `${normalizeDial(dialSelected)}${onlyDigits(phoneLocal)}`
      : (data.phone || '');

    const firstName = cleanString(data.firstName ?? '');
    const lastName = cleanString(data.lastName ?? '');
    const updateData = {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email: cleanString(data.email ?? ''),
      organisation: cleanString(data.organisation ?? ''),
      phone: cleanString(composedPhone || user?.phone || ''),
      address: cleanString(data.address ?? ''),
      city: cleanString(cityName || data.city || user?.city || ''),
      state: cleanString(stateName || data.state || user?.state || ''),
      country: cleanString(countryName || data.country || user?.country || ''),
      pincode: cleanString(data.pincode ?? '')
    };

    let fileToUpload = null;
    if (selectedFile) {
      fileToUpload = selectedFile;
    } else if (avatarPreview && String(avatarPreview).startsWith('data:')) {
      updateData.avatar = user?.avatar || user?.userImage || '';
    }

    const changed = diffPayload(
      updateData,
      user,
      new Set(['organisation', 'address', 'city', 'state', 'country', 'pincode'])
    );

    if (!Object.keys(changed).length && !fileToUpload) {
      notifySuccess('Nothing to update');
      setActive('profile');
      return;
    }

    let updatedResp = null;
    try {
      if (fileToUpload) {
        const formData = new FormData();
        formData.append('userImage', fileToUpload);

        Object.keys(changed).forEach(key => {
          if (changed[key] !== undefined && changed[key] !== null) {
            formData.append(key, changed[key]);
          }
        });

        const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
        const apiUrl = `${baseUrl}/users/${userId}`.replace(/([^:])(\/\/)/g, '$1/');

        const response = await fetch(apiUrl, {
          method: 'PUT',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update profile');
        }

        updatedResp = await response.json();
      } else {
        updatedResp = await updateProfile({ id: userId, ...changed }).unwrap();
      }
    } catch (error) {
      console.error('Update error:', error);
      notifyError(error.message || 'Failed to update profile');
      return;
    }

    const respUser = normalizeUserPayload(updatedResp);
    const updatedUser = {
      ...user,
      ...respUser,
      firstName: respUser.firstName ?? user.firstName,
      lastName: respUser.lastName ?? user.lastName,
      userImage: respUser.userImage ?? avatarPreview ?? user.userImage,
      avatar: respUser.userImage ?? respUser.avatar ?? avatarPreview ?? user.avatar,
    };

    setSelectedFile(null);

    writeUserInfoCookiePreserving(updatedUser);
    setLocalUser(updatedUser);
    setAvatarPreview(updatedUser.avatar || null);

    reset({
      firstName: updatedUser?.firstName || '',
      lastName: updatedUser?.lastName || '',
      email: updatedUser?.email || '',
      organisation: updatedUser?.organisation || '',
      phone: updatedUser?.phone || '',
      address: updatedUser?.address || '',
      city: updatedUser?.city || '',
      state: updatedUser?.state || '',
      country: updatedUser?.country || '',
      pincode: updatedUser?.pincode || '',
    });

    try { await refetchSession?.(); } catch { }

    notifySuccess('Profile updated');
    setActive('profile');
  };

  const handleLogout = async () => {
    try {
      await logoutUser({ userId }).unwrap();
      Cookies.remove('userInfo');
      try { localStorage.removeItem('sessionId'); } catch { }
      window.location.href = '/login';
    } catch (err) {
      notifyError(err?.data?.message || 'Logout failed');
    }
  };

  /* ---- Derived values for read-only display ---- */
  const derivedPrettyPhone = (() => {
    const raw = String(user?.phone || '').trim();
    if (!raw) return '—';
    if (raw.startsWith('+')) return raw;
    if (dialSelected && phoneLocal) return `${normalizeDial(dialSelected)}${onlyDigits(phoneLocal)}`;
    return raw;
  })();

  const derivedReadOnlyFlagPng = (() => {
    const raw = String(user?.phone || '').trim();
    if (!raw || !raw.startsWith('+') || !countries.length) return '';
    const match = countries
      .filter(c => raw.startsWith(c.dial))
      .sort((a, b) => b.dial.length - a.dial.length)[0];
    return match?.flagPng || '';
  })();

  /* country change handler */
  const handleCountryChange = (e) => {
    const val = e.target.value;
    setCountryName(val);
    setValue('country', val, { shouldDirty: true });
    setStateName('');
    setValue('state', '', { shouldDirty: true });
    setCityName('');
    setValue('city', '', { shouldDirty: true });
  };

  /* ---------------- PDF generator (your implementation kept) ---------------- */
  const generateInvoicePdf = async (order) => {
    const LOGO_URL = '/assets/img/logo/my_logo.png';
    const fmtINR = (n) => {
      const val = Number(n || 0);
      return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const sum = (xs) => xs.reduce((a, b) => a + (Number(b) || 0), 0);

    const lines = (order?.productId || []).map((p, idx) => {
      const qty = Array.isArray(order.quantity) ? (Number(order.quantity[idx]) || 0) : 0;
      const price = Array.isArray(order.price) ? (Number(order.price[idx]) || 0) : 0;
      const amount = qty * price;
      return {
        name: p?.name || '—',
        qty,
        price,
        amount,
        _id: p?._id || String(idx),
      };
    });

    const calcSubtotal = sum(lines.map(l => l.amount));
    const shipping = Number(order?.shippingCost || 0);
    const discount = Number(order?.discount || 0);
    const grandTotal = calcSubtotal + shipping - discount;

    const company = {
      name: 'AMRITA GLOBAL ENTERPRISES',
      tagline: 'Textiles & Fabrics • B2B',
      addr1: '4th Floor, Safal Prelude, 404 Corporate Road, Near YMCA Club,',
      addr2: 'Prahlad Nagar, Ahmedabad, Gujarat, India - 380015',
      email: 'info@amritafashions.com',
      phone: '+91 98240 03484'
    };

    const billTo = {
      name: `${order?.firstName || ''} ${order?.lastName || ''}`.trim() || order?.userId?.name || '',
      phone: order?.phone || order?.userId?.phone || '',
      email: order?.email || order?.userId?.email || '',
      address: order?.streetAddress || order?.userId?.address || '',
      city: order?.city || order?.userId?.city || '',
      postcode: order?.postcode || order?.userId?.pincode || '',
      country: order?.country || order?.userId?.country || ''
    };

    const created = dayjs(order?.createdAt).format('MMMM DD, YYYY');
    const orderNo = String(order?._id || '');

    const BLUE = '#2C4C97';
    const GOLD = '#D6A74B';
    const TEXT = '#1F2A44';
    const MUTED = '#6B7280';
    const BORDER = '#E5E7EB';

    const HEADER_H = 70;
    const FOOTER_H = 70;

    const S = PDFStyleSheet.create({
      page: { paddingTop: HEADER_H + 12, paddingBottom: FOOTER_H + 8, paddingHorizontal: 36, fontSize: 10, color: TEXT },
      headerWrap: { position: 'absolute', left: 0, right: 0, top: 0, height: HEADER_H, paddingHorizontal: 36 },
      headerCanvas: { position: 'absolute', left: 0, right: 0, top: 8, height: 2 },
      headerGoldLine: { position: 'absolute', left: 0, right: 0, top: 8, height: 2, backgroundColor: GOLD },
      headerRow: { position: 'absolute', top: 16, left: 36, right: 36, height: 44, flexDirection: 'row', alignItems: 'center' },
      logoBox: { width: 140, height: 44, borderRadius: 6, overflow: 'hidden', backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
      logoContain: { width: 'auto', height: 'auto', maxWidth: 140, maxHeight: 44, objectFit: 'contain' },
      brandTextWrap: { marginLeft: 12 },
      headerBrand: { fontSize: 16, fontWeight: 700, color: BLUE },
      headerTag: { fontSize: 9, color: MUTED, marginTop: 2 },
      title: { textAlign: 'center', fontSize: 20, fontWeight: 700, color: BLUE, marginBottom: 10 },
      row: { flexDirection: 'row', gap: 10 },
      col: { flex: 1 },
      card: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1, borderColor: BORDER, borderStyle: 'solid',
        borderRadius: 8, padding: 10
      },
      label: { fontSize: 8, color: MUTED, marginBottom: 2, letterSpacing: 0.2 },
      value: { fontSize: 10, color: TEXT, lineHeight: 1.25 },
      metaItem: {
        flex: 1, backgroundColor: '#F8FAFC',
        borderWidth: 1, borderColor: BORDER, borderStyle: 'solid',
        borderRadius: 8, padding: 8
      },
      metaVal: { fontSize: 10, fontWeight: 700, color: TEXT },
      tableWrap: {
        marginTop: 12,
        borderWidth: 1, borderColor: BORDER, borderStyle: 'solid',
        borderRadius: 8, overflow: 'hidden'
      },
      thead: { backgroundColor: '#F3F4F6', flexDirection: 'row' },
      th: { padding: 8, fontSize: 9, fontWeight: 700 },
      cellNum: { width: 24, textAlign: 'left' },
      cellName: { flex: 1 },
      cellQty: { width: 50, textAlign: 'right' },
      cellPrice: { width: 70, textAlign: 'right' },
      cellAmt: { width: 80, textAlign: 'right' },
      tr: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER, borderTopStyle: 'solid', backgroundColor: '#FFFFFF' },
      td: { padding: 8, fontSize: 9 },
      nameText: { fontSize: 9, lineHeight: 1.2 },
      footerWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, height: FOOTER_H, paddingHorizontal: 36 },
      footerGold: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, backgroundColor: GOLD },
      footerText: { position: 'absolute', left: 36, right: 36, bottom: 10, textAlign: 'center', fontSize: 8, color: MUTED, lineHeight: 1.3 },
    });

    const doc = (
      <PDFDocument>
        <PDFPage size="A4" style={S.page}>
          <PDFView style={S.headerWrap} fixed>
            <PDFView style={S.headerCanvas}>
              <PDFView style={S.headerGoldLine} />
            </PDFView>
            <PDFView style={S.headerRow}>
              <PDFView style={S.logoBox}>
                <PDFImage src={LOGO_URL} style={S.logoContain} />
              </PDFView>
              <PDFView style={S.brandTextWrap}>
                <PDFText style={S.headerBrand}>{company.name}</PDFText>
                <PDFText style={S.headerTag}>{company.tagline}</PDFText>
              </PDFView>
            </PDFView>
          </PDFView>

          <PDFText style={S.title}>INVOICE</PDFText>

          {/* ... your PDF remains unchanged ... */}
          <PDFView style={S.footerWrap} fixed>
            <PDFView style={S.footerGold} />
            <PDFText style={S.footerText}>
              404, Safal Prelude, Corporate Rd, Prahlad Nagar, Ahmedabad, Gujarat 380015 • {company.email} • amrita-fashions.com • {company.phone}
            </PDFText>
          </PDFView>
        </PDFPage>
      </PDFDocument>
    );

    const blob = await pdfRenderer(doc).toBlob();
    const fname = `AGE-Invoice-${orderNo}.pdf`;
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className={`${styles.scope} ${styles.page}`}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.bigAvatar}>
            {avatarPreview ? (
              <AvatarImg
                src={avatarPreview}
                size={80}
                alt="Profile"
                title="Profile"
                priority
                className={styles.bigAvatarImg}
              />
            ) : (
              <div className={styles.bigAvatarFallback}>
                {initials(user?.firstName || user?.name || 'U')}
              </div>
            )}
          </div>

          <div className={styles.titleBlock}>
            <h1 className={styles.h1}>
              {user?.firstName || user?.lastName
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : (user?.name || 'Guest User')}
            </h1>
            <div className={styles.subRow}>
              {user?.email ? <span className={styles.email}>{user.email}</span> : null}
            </div>
          </div>
        </div>
      </div>

      {/* LAYOUT */}
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <SideTab id="profile" label="My Profile" active={active} setActive={setActive} />
          <SideTab id="edit" label="Edit Profile" active={active} setActive={(id) => { if (userId) localStorage.setItem('userId', String(userId)); setActive(id); }} />
          <SideTab id="booking" label="My Orders" active={active} setActive={setActive} />
          <button type="button" className={styles.sideTab} onClick={handleLogout}>Logout</button>
        </aside>

        <main className={styles.main}>
          {/* My Profile */}
          {active === 'profile' && (
            <div className={styles.form}>
              <AlignedRead
                label="Name"
                value={user?.firstName || user?.lastName
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : user?.name || '—'}
              />
              <AlignedRead label="Email" value={user?.email || '—'} />
              <AlignedRead label="Organisation" value={user?.organisation || '—'} />

              <AlignedCustom label="Phone">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {derivedReadOnlyFlagPng ? (
                    <img
                      src={derivedReadOnlyFlagPng}
                      alt="Country flag"
                      title="Country flag"
                      width={20}
                      height={14}
                      loading="lazy"
                      decoding="async"
                      style={{ display: 'block', borderRadius: 2, objectFit: 'cover' }}
                    />
                  ) : null}
                  <span>{derivedPrettyPhone === '—' ? '—' : derivedPrettyPhone}</span>
                </div>
              </AlignedCustom>

              <AlignedRead label="Address" value={user?.address} />

              <div className={styles.row}>
                <AlignedRead label="Country" value={user?.country} />
                <AlignedRead label="State" value={user?.state} />
              </div>

              <div className={styles.row}>
                <AlignedRead label="City" value={user?.city} />
                <AlignedRead label="Pincode" value={user?.pincode} />
              </div>
            </div>
          )}

          {/* Edit */}
          {active === 'edit' && (
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.avatarEditor}>
                <div className={styles.bigAvatar}>
                  {avatarPreview ? (
                    <AvatarImg
                      src={avatarPreview}
                      size={80}
                      alt="Profile"
                      title="Profile"
                      className={styles.bigAvatarImg}
                    />
                  ) : (
                    <div className={styles.bigAvatarFallback}>
                      {initials(user?.firstName || user?.name)}
                    </div>
                  )}
                </div>
                <div className={styles.avatarControls}>
                  <label className={styles.fileBtn}>
                    <FaEdit style={{ marginRight: 6 }} />
                    Edit Photo
                    <input type="file" accept="image/*" onChange={(e) => onPickAvatar(e.target.files?.[0])} hidden />
                  </label>

                  {avatarPreview && (
                    <button type="button" className={styles.linkBtn} onClick={() => setAvatarPreview(null)}>
                      <FaTrash style={{ marginRight: 6 }} />
                      Remove Profile Photo
                    </button>
                  )}
                </div>
              </div>

              <AlignedField id="firstName" label="First Name" registerFn={register} error={errors.firstName?.message} />
              <AlignedField id="lastName" label="Last Name" registerFn={register} error={errors.lastName?.message} />
              <AlignedField id="email" label="Email" type="email" registerFn={register} disabled note="Email can't be changed" />
              <AlignedField id="organisation" label="Organisation" registerFn={register} />

              {/* Phone with Country Dial */}
              <AlignedCustom label="Phone">
                <div className={styles.row} style={{ gap: 12, width: '100%' }}>
                  <div
                    className={styles.input}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      paddingRight: 36,
                      overflow: 'hidden',
                      width: '40%',
                      minWidth: 220
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        pointerEvents: 'none'
                      }}
                    >
                      {countries.find(c => c.dial === dialSelected)?.flagPng ? (
                        <img
                          src={countries.find(c => c.dial === dialSelected)?.flagPng}
                          alt="Country flag"
                          title="Country flag"
                          width={20}
                          height={14}
                          loading="lazy"
                          decoding="async"
                          style={{ display: 'block', borderRadius: 2, objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ width: 20, height: 14 }} />
                      )}
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {countries.find(c => c.dial === dialSelected)
                          ? `${countries.find(c => c.dial === dialSelected)?.name} (${dialSelected})`
                          : 'Select country code'}
                      </span>
                    </div>

                    <select
                      aria-label="Country dial code"
                      value={dialSelected}
                      onChange={(e) => setDialSelected(e.target.value)}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    >
                      <option value="">Select code</option>
                      {countries.map(c => (
                        <option key={`${c.cca2}-${c.dial}`} value={c.dial}>
                          {c.name} ({c.dial})
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    className={styles.input}
                    type="tel"
                    placeholder="Local phone number"
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal(e.target.value)}
                    inputMode="numeric"
                    style={{ width: '60%' }}
                  />
                </div>

                <input type="hidden" {...register('phone')} />
                {errors?.phone?.message ? <p className={styles.err}>{errors.phone.message}</p> : null}
              </AlignedCustom>

              {/* Country/State/City */}
              <AlignedCustom label="Country">
                <select
                  className={styles.input}
                  value={countryName}
                  onChange={handleCountryChange}
                >
                  <option value="">Select country</option>
                  {countries.map(c => (
                    <option key={c.cca2} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </AlignedCustom>

              <AlignedCustom label="State">
                <select
                  className={styles.input}
                  value={stateName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStateName(val);
                    setValue('state', val, { shouldDirty: true });
                    setCityName('');
                    setValue('city', '', { shouldDirty: true });
                  }}
                >
                  <option value="">{countryName ? 'Select state' : 'Select country first'}</option>
                  {states.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </AlignedCustom>

              <AlignedCustom label="City">
                <select
                  className={styles.input}
                  value={cityName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCityName(val);
                    setValue('city', val, { shouldDirty: true });
                  }}
                >
                  <option value="">{stateName ? 'Select city' : 'Select state first'}</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </AlignedCustom>

              <AlignedField id="address" label="Address" registerFn={register} />
              <AlignedField id="pincode" label="Pincode" registerFn={register} />

              <div className={styles.formCta}>
                <button type="button" className={styles.btn} onClick={() => setActive('profile')}>Cancel</button>
                <button type="submit" className={styles.btn} disabled={saving || !userId}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          )}

          {/* My Orders */}
          {active === 'booking' && (
            <div className={styles.bookingWrap}>
              {ordersLoading && (<div className={styles.bookingEmpty}><p>Loading orders…</p></div>)}
              {ordersErr && (<div className={styles.bookingEmpty}><p style={{ color: 'red' }}>{ordersErr}</p></div>)}

              {!ordersLoading && !ordersErr && (!orders || orders.length === 0) && (
                <div className={styles.bookingEmpty}>
                  <div className={styles.bookingIcon}>🧾</div>
                  <h3 className={styles.bookingTitle}>No orders yet</h3>
                  <p className={styles.bookingText}>Go to the shop page and start shopping.</p>
                  <a href="/shop" className={styles.btn}>Go to Shop</a>
                </div>
              )}

              {!ordersLoading && !ordersErr && orders && orders.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      borderSpacing: 0,
                      background: 'white',
                      borderRadius: 8,
                      overflow: 'hidden'
                    }}
                  >
                    <thead style={{ background: '#F3F4F6' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 600 }}>Invoice Number</th>
                        <th style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 600 }}>Invoice Date</th>
                        <th style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 600 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o._id} style={{ borderTop: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <a
                              href="#"
                              onClick={(e) => { e.preventDefault(); generateInvoicePdf(o); }}
                              style={{ color: '#2C4C97', textDecoration: 'underline' }}
                              title="Open & download PDF"
                            >
                              {o._id}
                            </a>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {dayjs(o.createdAt).format('MMMM DD, YYYY')}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <button
                              type="button"
                              onClick={() => generateInvoicePdf(o)}
                              title="Download PDF"
                              className={styles.btn}
                              style={{ padding: '6px 12px' }}
                            >
                              📄 PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------------- aligned building blocks ---------------- */
const LABEL_COL_STYLE = { width: 160, minWidth: 160, flex: '0 0 160px' };
const VALUE_COL_STYLE = { flex: 1, minWidth: 0 };

function AlignedRow({ label, children }) {
  return (
    <div className={styles.field} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div className={styles.fieldLabel} style={LABEL_COL_STYLE}>{label}</div>
      <div style={VALUE_COL_STYLE}>{children}</div>
    </div>
  );
}

function AlignedRead({ label, value }) {
  return (
    <AlignedRow label={label}>
      <div className={styles.readInput}>{value || '—'}</div>
    </AlignedRow>
  );
}

function AlignedCustom({ label, children }) {
  return (
    <AlignedRow label={label}>
      <div>{children}</div>
    </AlignedRow>
  );
}

function AlignedField({ id, label, type = 'text', registerFn, error, disabled, note, required }) {
  return (
    <AlignedRow label={<>{label}{required && <span className={styles.required}>*</span>}</>}>
      <div>
        <input id={id} type={type} className={styles.input} disabled={disabled} {...registerFn(id)} />
        {note && <p className={styles.note}>{note}</p>}
        {error && <p className={styles.err}>{error}</p>}
      </div>
    </AlignedRow>
  );
}

/* ---------------- sidebar tab ---------------- */
function SideTab({ id, label, active, setActive }) {
  const is = active === id;
  return (
    <button
      type="button"
      className={`${styles.sideTab} ${is ? styles.sideTabActive : ''}`}
      onClick={() => setActive(id)}
    >
      {label}
    </button>
  );
}
