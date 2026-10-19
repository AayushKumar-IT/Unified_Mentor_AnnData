import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService.js';

export default function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const key = JSON.stringify(params);
  useEffect(() => {
    let active = true;
    setLoading(true);
    getProducts(JSON.parse(key)).then((data) => { if (active) setProducts(data); })
      .catch((err) => { if (active) setError(err.response?.data?.message || err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [key]);
  return { products, loading, error, setProducts };
}
