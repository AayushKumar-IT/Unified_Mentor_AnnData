import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/common/Sidebar.jsx';
import ProductForm from '../../components/product/ProductForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { createProduct, getCategories } from '../../services/productService.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function ProductAdd() {
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();
  const loadCategories = () => {
    setLoadError('');
    setCategories(null);
    getCategories().then(setCategories).catch((error) => setLoadError(getErrorMessage(error)));
  };
  useEffect(() => { loadCategories(); }, []);
  const submit = async (data) => {
    setLoading(true);
    try { await createProduct(data); toast.success('Product listed successfully'); navigate('/farmer/dashboard'); }
    catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  };
  if (!categories && !loadError) return <LoadingSpinner />;
  if (loadError) return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar /><section className="rounded-2xl border border-red-200 bg-red-50 p-7"><h1 className="text-2xl font-extrabold text-red-900">We couldn’t load product categories.</h1><p className="mt-2 text-red-800">{loadError}</p><button onClick={loadCategories} className="mt-5 rounded-xl bg-red-800 px-4 py-2.5 font-bold text-white hover:bg-red-900">Try again</button></section></main>;
  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar /><section><h1 className="mb-5 text-3xl font-extrabold">Add a product</h1><ProductForm categories={categories} onSubmit={submit} loading={loading} submitLabel="Publish product" /></section></main>;
}
