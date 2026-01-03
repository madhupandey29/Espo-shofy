import React from 'react';
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";

export default function TestSearchPage() {
  return (
    <Wrapper>
      <HeaderTwo />
      <main>
        <div className="container" style={{ padding: '40px 0' }}>
          <div className="row">
            <div className="col-12">
              <h1>Test Search Functionality</h1>
              <p>Go to the <a href="/shop">Shop page</a> and try searching for "cotton" or any fabric-related term in the search bar.</p>
              
              <div style={{ marginTop: '20px' }}>
                <h3>Test the API directly:</h3>
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('https://espobackend.vercel.app/api/product/search/cotton');
                      const data = await response.json();
                      console.log('Direct API Response:', data);
                      alert(`Direct API call successful! Found ${data.total} results.`);
                    } catch (error) {
                      console.error('API Error:', error);
                      alert('API call failed. Check console for details.');
                    }
                  }}
                  style={{
                    background: 'var(--tp-theme-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Test Direct API Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </Wrapper>
  );
}