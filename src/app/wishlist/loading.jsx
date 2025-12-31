"use client";
export default function Loading() {
  return (
    <div style={{display:'grid',placeItems:'center',minHeight:'50vh'}}>
      <div className="tp-spinner" aria-label="Loading wishlist..." />
      <style jsx>{`
        .tp-spinner{width:36px;height:36px;border:3px solid rgba(0,0,0,.1);border-top-color:var(--tp-theme-primary, #6c5ce7);border-radius:50%;animation:spin 0.8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

