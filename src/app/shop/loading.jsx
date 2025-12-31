"use client";
export default function Loading() {
  return (
    <div className="container" style={{minHeight:'50vh',padding:'60px 0'}}>
      <div className="skeleton-grid">
        {Array.from({length:12}).map((_,i)=>(<div key={i} className="card-skel" />))}
      </div>
      <style jsx>{`
        .skeleton-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
        .card-skel{height:220px;background:linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);background-size:400% 100%;animation:shimmer 1.2s linear infinite}
        @media(max-width:1024px){.skeleton-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:768px){.skeleton-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:480px){.skeleton-grid{grid-template-columns:repeat(1,1fr)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </div>
  );
}

