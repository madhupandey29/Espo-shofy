'use client';

import { useState, useEffect } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');

const fetchJson = async (url) => {
  try {
    const res = await fetch(url, { 
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' 
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const useGroupCodeData = (groupcodeId) => {
  const [groupCodeData, setGroupCodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchGroupCodeData = async () => {
      console.log('Fetching group code data for ID:', groupcodeId);
      console.log('API Base:', API_BASE);
      
      if (!groupcodeId || !API_BASE) {
        console.log('Missing groupcodeId or API_BASE');
        if (!cancelled) {
          setGroupCodeData(null);
          setLoading(false);
          setError(null);
        }
        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        // Try specific endpoint first, fallback to list endpoint
        let json = await fetchJson(`${API_BASE}/groupcode/view/${groupcodeId}`);
        let data = json?.data || null;
        
        // If specific endpoint fails, try the list endpoint and find matching ID
        if (!data) {
          console.log('Specific endpoint failed, trying list endpoint');
          json = await fetchJson(`${API_BASE}/groupcode`);
          console.log('Group code list response:', json);
          
          // Handle both old and new API structures
          const groupcodes = json?.data || json?.groupcodes || [];
          if (Array.isArray(groupcodes)) {
            // Find the matching groupcode by ID (handle both _id and id)
            data = groupcodes.find(item => 
              item._id === groupcodeId || item.id === groupcodeId
            ) || null;
            console.log('Found matching groupcode:', data);
          }
        }
        
        console.log('Final group code data:', data);

        if (!cancelled) {
          setGroupCodeData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching group code data:', err);
        if (!cancelled) {
          setError(err.message || 'Failed to fetch group code data');
          setLoading(false);
        }
      }
    };

    fetchGroupCodeData();

    return () => {
      cancelled = true;
    };
  }, [groupcodeId]);

  return { groupCodeData, loading, error };
};

export default useGroupCodeData;