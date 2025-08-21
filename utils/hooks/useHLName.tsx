import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useHLName(address: string | null) {
  const [hlName, setHLName] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setHLName(null);
      return;
    }

    const cacheKey = `hlname_${address.toLowerCase()}`;
    const cachedName = localStorage.getItem(cacheKey);
    if (cachedName) {
      setHLName(cachedName);
      return;
    }

    async function fetchHLName() {
      try {
        const response = await axios.get(`/api/hlname/${address.toLowerCase()}`);
        if (response.data?.name) {
          setHLName(response.data.name);
          localStorage.setItem(cacheKey, response.data.name);
        } else {
          setHLName(null);
          localStorage.removeItem(cacheKey);
        }
      } catch (err) {
        console.error('Error fetching HL name:', err);
        setHLName(null);
      }
    }

    fetchHLName();

  }, [address]);

  return hlName;
}
