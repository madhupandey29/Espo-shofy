"use client";
export default function Loading() {
  return (
    <div className="container" style={{minHeight:'50vh',padding:'40px 0'}}>
      <div className="skel" style={{height:48, marginBottom:12}} />
      <div className="skel" style={{height:140, marginBottom:12}} />
      <div className="skel" style={{height:60}} />
      <style jsx>{`
        .skel{width:100%;background:linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);background-size:400% 100%;animation:shimmer 1.2s linear infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </div>
  );
}

