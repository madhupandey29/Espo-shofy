'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLoggedOut } from "@/redux/features/auth/authSlice";

function ProfileSetting({ active, handleActive }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(userLoggedOut());
    router.push('/');
  };

  return (
    <div className="tp-header-top-menu-item tp-header-setting" style={{ position: 'relative', overflow: 'visible' }}>
      <button
        type="button"
        onClick={() => handleActive('setting')}
        className="tp-header-setting-toggle"
        id="tp-header-setting-toggle"
        title="Setting"
      >
        Setting
      </button>

      <ul className={active === 'setting' ? "tp-setting-list-open" : ""} style={{ zIndex: 10000 }}>
        <li>
          <Link href="/profile" title="My Profile">My Profile</Link>
        </li>
        <li>
          <Link href="/wishlist" title="Wishlist">Wishlist</Link>
        </li>
        <li>
          <Link href="/cart" title="Cart">Cart</Link>
        </li>
        <li>
          {!user?.name ? (
            <Link href="/login" className="cursor-pointer" title="Login">Login</Link>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer"
              style={{ background: "transparent", border: 0, padding: 0 }}
              title="Logout"
            >
              Logout
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}

const HeaderTopRight = () => {
  const [active, setIsActive] = useState('');

  const handleActive = (type) => {
    setIsActive(type === active ? '' : type);
  };

  return (
    <div className="tp-header-top-menu d-flex align-items-center justify-content-end" style={{ overflow: 'visible' }}>
      <ProfileSetting active={active} handleActive={handleActive} />
    </div>
  );
};

export default HeaderTopRight;
