"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { Email, Location } from "@/svg";
import {
  FaYoutube,
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaPinterestP,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { toast } from "react-toastify";

import { useGetOfficeInformationQuery } from "@/redux/features/officeInformationApi";
import { useAddContactMutation } from "@/redux/features/contactsApi";

/* ---- brand palette ---- */
const BG_TOP = "#112338";
const BG_BOTTOM = "#142a42";
const BRAND_BLUE = "#2C4C97";
const BRAND_GOLD = "#D6A74B";
const TEXT_MAIN = "#E9F1FA";
const TEXT_SOFT = "rgba(233,241,250,.78)";
const BORDER_SOFT = "rgba(255,255,255,.12)";

/* Trusted badges (served from /public) */
const trustedLogos = [
  { src: "/assets/img/logo/BCI.png", alt: "BCI Better Cotton Initiative" },
  { src: "/assets/img/logo/confidence_Textiles.png", alt: "OEKO-TEX Standard" },
  { src: "/assets/img/logo/ecovero.png", alt: "Lenzing EcoVero" },
  { src: "/assets/img/logo/global.png", alt: "Global Recycled Standard" },
  { src: "/assets/img/logo/organic.png", alt: "Organic 100 Content Standard" },
  { src: "/assets/img/logo/gold.png", alt: "Organic 100 Content Standard" },
];

const PhoneIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.84 19.84 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.15 12.8 19.84 19.84 0 0 1 .08 4.18 2 2 0 0 1 2.06 2h2a2 2 0 0 1 2 1.72c.12.86.34 1.7.66 2.5a2 2 0 0 1-.45 2.11L5.4 9.91a16 16 0 0 0 8.69 8.69l1.58-1.87a2 2 0 0 1 2.11-.45c.8.32 1.64.54 2.5.66A2 2 0 0 1 22 16.92z" />
  </svg>
);

/* ---------- helpers ---------- */
const cleanStr = (s) =>
  String(s || "")
    .trim()
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "");

const digitsOnly = (s) => cleanStr(s).replace(/[^\d]/g, "");

const mapLink = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const gmailCompose = (to) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

const splitLines = (address) => {
  const raw = cleanStr(address);
  if (!raw) return [];
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return [raw];

  const lines = [];
  let buf = "";
  for (const p of parts) {
    const next = buf ? `${buf}, ${p}` : p;
    if (next.length > 42 && buf) {
      lines.push(buf);
      buf = p;
    } else {
      buf = next;
    }
  }
  if (buf) lines.push(buf);
  return lines.slice(0, 4);
};

const Footer = () => {
  const { data } = useGetOfficeInformationQuery();
  const [addContact, { isLoading: isSubscribing }] = useAddContactMutation();

  const [newsletterEmail, setNewsletterEmail] = React.useState("");

  const office =
    data?.success && Array.isArray(data?.data) && data.data.length ? data.data[0] : null;

  const officeAddress =
    cleanStr(office?.companyAddress) ||
    "404, Safal Prelude, Corporate Rd, Prahlad Nagar, Ahmedabad, Gujarat 380020";

  const phone1Raw = cleanStr(office?.companyPhone1);
  const phone2Raw = cleanStr(office?.companyPhone2);

  const phone1Digits = digitsOnly(phone1Raw);
  const phone2Digits = digitsOnly(phone2Raw);

  const email = cleanStr(office?.companyEmail) || "info@amrita-fashions.com";

  const addresses = [
    { title: "Office Address", address: officeAddress },
    {
      title: "Factory Address",
      address: "1, Mohan Estate, Ramol Road, Ahmedabad, Gujarat, India – 382449",
    },
    {
      title: "Warehouse Address",
      address:
        "Nr. Ambuja Synthetics, B/H Old Narol Court, Narol, Ahmedabad, Gujarat, India – 382405",
    },
    { title: "UAE Office Address", address: "GSK Worldwide FZE, Ajman Free Zone, UAE" },
  ];

  const socials = React.useMemo(() => {
    const items = [
      { key: "facebook", url: office?.facebook, label: "Facebook", icon: <FaFacebookF size={18} /> },
      { key: "instagram", url: office?.instagram, label: "Instagram", icon: <FaInstagram size={18} /> },
      { key: "linkedin", url: office?.linkedin, label: "LinkedIn", icon: <FaLinkedinIn size={18} /> },
      { key: "twitter", url: office?.twitter, label: "X", icon: <FaXTwitter size={18} /> },
      { key: "youtube", url: office?.youtube, label: "YouTube", icon: <FaYoutube size={20} /> },
      { key: "pinterest", url: office?.pinterest, label: "Pinterest", icon: <FaPinterestP size={18} /> },
    ].filter((x) => Boolean(x.url));

    return items.slice(0, 6);
  }, [office]);

  const onSubscribe = async (e) => {
    e.preventDefault();

    const em = newsletterEmail.trim();
    if (!isValidEmail(em)) {
      toast.error("Please enter a valid email.");
      return;
    }

    try {
      await addContact({
        companyName: office?.companyName || "Amrita Global Enterprises",
        contactPerson: "Newsletter Subscriber",
        email: em,
        phoneNumber: "",
        businessType: "newsletter",
        annualFabricVolume: "",
        primaryMarkets: "",
        fabricTypesOfInterest: [],
        specificationsRequirements: "",
        timeline: "",
        additionalMessage: "Subscribed from footer newsletter",
      }).unwrap();

      setNewsletterEmail("");
      toast.success("Subscribed! 🎉 We’ll keep you updated.");
    } catch (err) {
      console.error("Subscribe error:", err);
      const msg =
        err?.data?.message ||
        err?.error ||
        "Could not subscribe right now. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <footer aria-label="Site Footer" className="age-footer">
      <div className="age-footer__gradient">
        <div className="age-footer__top">
          <div className="age-container">
            <div className="age-grid" role="list">
              <div className="age-col" role="listitem">
                <div>
                  <div className="age-addressBoard" aria-label="Company addresses">
                    {addresses.map((a, idx) => {
                      const lines = splitLines(a.address);
                      const noSep = idx === addresses.length - 1;

                      return (
                        <a
                          key={a.title}
                          href={mapLink(a.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`age-addressSection ${noSep ? "age--noSep" : ""} age-addressLink`}
                          aria-label={`${a.title} (Open in Google Maps)`}
                          title="Open in Google Maps"
                        >
                          <div className="age-addressTitle">{a.title}</div>
                          <div className="age-addressLines">
                            {lines.map((l, i) => (
                              <div key={i}>{l}</div>
                            ))}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="age-col" role="listitem">
                <div className="age-widget">
                  <h4 className="age-title">My Account</h4>
                  <ul className="age-list">
                    <li><Link href="#" className="age-link">Track Orders</Link></li>
                    <li><Link href="#" className="age-link">Shipping</Link></li>
                    <li><Link href="#" className="age-link">Wishlist</Link></li>
                    <li><Link href="#" className="age-link">My Account</Link></li>
                    <li><Link href="#" className="age-link">Order History</Link></li>
                    <li><Link href="#" className="age-link">Returns</Link></li>
                  </ul>
                </div>
              </div>

              <div className="age-col" role="listitem">
                <div className="age-widget">
                  <h4 className="age-title">Information</h4>
                  <ul className="age-list">
                    <li><Link href="#" className="age-link">Our Story</Link></li>
                    <li><Link href="#" className="age-link">Careers</Link></li>
                    <li><Link href="#" className="age-link">Privacy Policy</Link></li>
                    <li><Link href="#" className="age-link">Terms &amp; Conditions</Link></li>
                    <li><Link href="#" className="age-link">Latest News</Link></li>
                    <li><Link href="#" className="age-link">Contact Us</Link></li>
                  </ul>
                </div>
              </div>

              <div className="age-col" role="listitem">
                <div className="age-widget">
                  <h4 className="age-title">Talk To Us</h4>

                  <div className="age-newsMini">
                    <p className="age-newsDesc">
                      Subscribe to our newsletter to get the latest news and offers.
                    </p>

                    <form className="age-pill" onSubmit={onSubscribe}>
                      <input
                        type="email"
                        required
                        placeholder="Subscribe with us"
                        aria-label="Email address"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                      />
                      <button
                        type="submit"
                        aria-label="Subscribe"
                        className="age-pillBtn"
                        disabled={isSubscribing}
                        title={isSubscribing ? "Submitting..." : "Subscribe"}
                      >
                        <span className="age-arrow">›</span>
                      </button>
                    </form>
                  </div>

                  <div className="age-talk">
                    {!!phone1Digits && (
                      <div className="age-talkRow">
                        <span className="age-talkIcon"><PhoneIcon /></span>
                        <a className="age-talkLink" href={`tel:+${phone1Digits}`}>
                          {phone1Raw || `+${phone1Digits}`}
                        </a>
                      </div>
                    )}

                    {!!phone2Digits && (
                      <div className="age-talkRow">
                        <span className="age-talkIcon"><PhoneIcon /></span>
                        <a className="age-talkLink" href={`tel:+${phone2Digits}`}>
                          {phone2Raw || `+${phone2Digits}`}
                        </a>
                      </div>
                    )}

                    <div className="age-talkRow">
                      <span className="age-talkIcon"><Email /></span>
                      <a
                        className="age-talkLink"
                        href={gmailCompose(email)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Compose in Gmail"
                      >
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="age-talkAddress">
                    <a
                      className="age-addrRow age-addrLink"
                      href={mapLink(officeAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open office address in Google Maps"
                    >
                      <span className="age-addrPin"><Location /></span>
                      <div className="age-addrLines">
                        {splitLines(officeAddress).slice(0, 4).map((l, i) => (
                          <div key={i}>{l}</div>
                        ))}
                      </div>
                    </a>
                  </div>

                  <div className="age-social" role="group" aria-label="Social links">
                    {socials.map((s) => (
                      <a
                        key={s.key}
                        href={String(s.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        title={s.label}
                        className="age-socialBtn"
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="age-footer__bottom">
          <div className="age-container">
            <div className="age-bottomWrap">
              <div className="age-topbar" />
              <p className="age-copy">
                <strong>© {new Date().getFullYear()}Amrita Global Enterprises. All rights reserved under applicable laws.</strong>
              </p>

              <div className="age-trust">
                {trustedLogos.map((l, i) => (
                  <div key={i} className="age-trustCard" title={l.alt}>
                    <Image
                      src={l.src}
                      alt={l.alt}
                      width={60}
                      height={60}
                      style={{ width: "36px", height: "auto", maxHeight: 36 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Poppins:wght@600;700;800&display=swap');

        .age-footer { font-family:'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif; color:${TEXT_MAIN}; }
        .age-footer__gradient{ background:linear-gradient(180deg,${BG_TOP},${BG_BOTTOM}); border-top:1px solid ${BORDER_SOFT}; }

        .age-container{ max-width:1200px; margin:0 auto; padding:0 16px; }

        .age-grid{ display:grid; grid-template-columns: 1.2fr .8fr .9fr .9fr; gap:28px; }
        @media (max-width: 1100px){ .age-grid{ grid-template-columns: 1fr 1fr; gap:24px; } }
        @media (max-width: 640px){ .age-grid{ grid-template-columns: 1fr; gap:20px; } }

        .age-col{ min-width:0; }

        .age-footer__top{ padding:48px 0 26px; }
        .age-footer__bottom{ background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,0)); border-top:1px solid ${BORDER_SOFT}; padding:14px 0 20px; }

        .age-title{
          font-family:'Poppins','Plus Jakarta Sans',system-ui,-apple-system,sans-serif;
          color:${TEXT_MAIN}; font-weight:800; font-size:20px; letter-spacing:.2px; margin:0 0 18px; position:relative;
        }
        .age-title::after{ content:''; position:absolute; left:0; bottom:-8px; width:36px; height:3px; border-radius:3px; background:linear-gradient(90deg,${BRAND_GOLD},${BRAND_BLUE}); opacity:.95; }

        .age-list{ list-style:none; margin:0; padding:0; }
        .age-list li{ margin:0 0 10px; }

        .age-footer :global(a.age-link){
          display:inline-block; font-weight:600; font-size:15px; text-decoration:none;
          color:${TEXT_MAIN} !important;
          border-bottom:1px dashed rgba(255,255,255,.25) !important;
          transition:color .22s ease, transform .15s ease, border-bottom-color .22s ease;
        }
        .age-footer :global(a.age-link:hover){
          color:${BRAND_GOLD} !important;
          border-bottom-color:${BRAND_GOLD} !important;
          transform:translateX(3px);
        }

        .age-addressBoard{
          background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03));
          border:1px solid ${BORDER_SOFT}; border-radius:16px; padding:16px 16px 8px;
        }
        .age-addressLink{ display:block; text-decoration:none; color:inherit; }
        .age-addressSection{ position:relative; padding:10px 0 12px; }
        .age-addressSection:not(.age--noSep)::after{ content:''; position:absolute; left:0; right:0; bottom:0; height:1px; background:${BORDER_SOFT}; }
        .age-addressTitle{
          font-family:'Poppins','Plus Jakarta Sans',system-ui; font-weight:800; letter-spacing:.2px; margin:0 0 6px; color:${TEXT_MAIN};
          display:flex; align-items:center; gap:8px;
        }
        .age-addressTitle::before{ content:''; width:8px; height:8px; border-radius:50%; background:linear-gradient(90deg,${BRAND_GOLD},${BRAND_BLUE}); box-shadow:0 0 0 3px rgba(255,255,255,.06); }
        .age-addressLines{ color:${TEXT_SOFT}; line-height:1.65; }
        .age-addressLink:hover .age-addressLines{ color: rgba(233,241,250,.9); }

        .age-newsMini{ margin:6px 0 12px; }
        .age-newsDesc{ color:${TEXT_SOFT}; margin:0 0 10px; font-size:18px; line-height:1.65; }

        .age-pill{ position:relative; display:flex; align-items:center; background:#fff; border:1px solid rgba(0,0,0,.04); border-radius:9999px; height:52px; padding:6px; box-shadow:0 10px 26px rgba(0,0,0,.18); }
        .age-pill input{ flex:1; height:100%; background:transparent; border:none; color:#0b1220; padding:0 18px; outline:none; font-size:15px; }
        .age-pill input::placeholder{ color:#6b7280; }
        .age-pillBtn{ width:40px; height:40px; border-radius:9999px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; background:${BRAND_GOLD}; color:#fff; box-shadow:0 10px 22px rgba(214,167,75,.35); }
        .age-pillBtn:disabled{ opacity:.7; cursor:not-allowed; }
        .age-arrow{ font-size:24px; line-height:1; transform:translateY(-1px); }

        .age-talk{ margin:12px 0 6px; }
        .age-talkRow{ display:flex; gap:10px; align-items:center; margin:6px 0; }
        .age-talkIcon{ color:${BRAND_GOLD}; display:inline-flex; align-items:center; justify-content:center; }
        .age-talkLink{ color:${TEXT_MAIN}; text-decoration:none; border-bottom:1px dashed rgba(255,255,255,.25); transition:color .22s ease, border-bottom-color .22s ease; }
        .age-talkLink:hover{ color:${BRAND_GOLD}; border-bottom-color:${BRAND_GOLD}; }

        .age-talkAddress{ margin-top:6px; }
        .age-addrRow{ display:flex; gap:10px; align-items:flex-start; text-decoration:none; color:inherit; }
        .age-addrPin{ color:${BRAND_GOLD}; display:inline-flex; align-items:center; justify-content:center; }
        .age-addrPin :global(svg){ width:18px; height:18px; stroke-width:1.8; }
        .age-addrLines{ line-height:1.65; color:${TEXT_SOFT}; }
        .age-addrRow:hover .age-addrLines{ color: rgba(233,241,250,.9); }

        .age-social{
          display:flex;
          align-items:center;
          margin-top:14px;
          width:100%;
          max-width:100%;
          flex-wrap:nowrap;
          overflow:hidden;
          gap:10px;
        }
        .age-socialBtn{
          flex:0 0 auto;
          width:40px;
          height:40px;
          border-radius:11px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          color:${TEXT_MAIN};
          border:1px solid ${BORDER_SOFT};
          background:rgba(255,255,255,.06);
          transition:transform .15s ease, box-shadow .2s ease, background .2s;
        }
        .age-socialBtn:hover{
          transform:translateY(-3px);
          background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,.08));
          box-shadow:0 10px 24px rgba(0,0,0,.35);
        }

        @media (min-width: 1101px){
          .age-social{ gap:6px; }
          .age-socialBtn{ width:36px; height:36px; border-radius:10px; }
        }

        @media (max-width: 420px){
          .age-social{ gap:9px; }
          .age-socialBtn{ width:38px; height:38px; border-radius:10px; }
        }

        .age-bottomWrap{ display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px; }
        .age-topbar{ width:72px; height:3px; border-radius:3px; background:linear-gradient(90deg,${BRAND_BLUE},${BRAND_GOLD}); opacity:.9; }
        .age-copy{ margin:0; color:${TEXT_SOFT}; font-size:14.5px; letter-spacing:.25px; }
        .age-copy strong{ color:${TEXT_MAIN}; font-weight:800; }
        .age-dot{ margin:0 10px; color:rgba(255,255,255,.45); }

        .age-trust{ display:flex; gap:10px; margin-top:2px; flex-wrap:wrap; justify-content:center; }
        .age-trustCard{
          width:52px; height:52px; border-radius:12px; background:#fff;
          border:1px solid rgba(16,24,40,.08);
          box-shadow:0 6px 16px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.7);
          display:flex; align-items:center; justify-content:center;
          transition:transform .16s ease, box-shadow .16s ease, filter .16s ease;
        }
        .age-trustCard:hover{ transform:translateY(-2px); box-shadow:0 10px 22px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.85); }
        .age-trustCard :global(img){ max-height:36px; filter:grayscale(.05) saturate(.95) contrast(1.05); }
        .age-trustCard:hover :global(img){ filter:grayscale(0) saturate(1.2) contrast(1.1); }

        @media (max-width:991px){
          .age-title{ font-size:18px; }
          .age-footer__top{ padding:40px 0 22px; }
        }

        /* ✅ MOBILE: better padding + center menus + center socials */
        @media (max-width:640px){
          .age-container{ padding: 0 20px; } /* more left/right */
          .age-widget{ padding: 5px 18px; }
          .age-title::after{ left:8%; transform:translateX(-50%); } /* underline centered */

          .age-list li{ margin: 0 0 12px; }
          .age-addressBoard{ padding:16px 14px 10px; }
          .age-addressTitle{ justify-content:flex-start; }
          .age-talkRow{ justify-content:flex-start; }
          .age-addrRow{justify-content:flex-start; text-align:left; }
          .age-social{ justify-content:center; } /* ✅ socials centered */
        }

        @media (max-width:575px){
          .age-copy{ font-size:13.6px; }
          .age-trustCard{ width:42px; height:42px; border-radius:10px; }
          .age-trustCard :global(img){ max-height:30px; }
        }

        :global(.Toastify__toast){
          border-radius: 14px !important;
          background: linear-gradient(180deg, rgba(17,35,56,.98), rgba(20,42,66,.98)) !important;
          color: ${TEXT_MAIN} !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          box-shadow: 0 14px 36px rgba(0,0,0,.35) !important;
          backdrop-filter: blur(8px);
        }
        :global(.Toastify__toast-body){
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif !important;
          font-weight: 700;
          letter-spacing: .15px;
        }
        :global(.Toastify__progress-bar){
          background: linear-gradient(90deg, ${BRAND_GOLD}, ${BRAND_BLUE}) !important;
        }
        :global(.Toastify__close-button){
          color: ${TEXT_MAIN} !important;
          opacity: .85;
        }
        :global(.Toastify__close-button:hover){ opacity: 1; }
      `}</style>
    </footer>
  );
};

export default Footer;
