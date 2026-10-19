import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/common/Sidebar.jsx';
import ProductForm from '../../components/product/ProductForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getCategories, getMyProduct, updateProduct } from '../../services/productService.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function ProductEdit() {
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();
  const loadProduct = () => {
    setLoadError('');
    setInitial(null);
    Promise.all([getMyProduct(id), getCategories()])
      .then(([product, list]) => { setInitial(product); setCategories(list); })
      .catch((error) => setLoadError(getErrorMessage(error)));
  };
  useEffect(() => { loadProduct(); }, [id]);
  const submit = async (data) => {
    setLoading(true);
    try { await updateProduct(id, data); toast.success('Product updated'); navigate('/farmer/dashboard'); }
    catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  };
  if (!initial && !loadError) return <LoadingSpinner />;
  if (loadError) return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar /><section className="rounded-2xl border border-red-200 bg-red-50 p-7"><h1 className="text-2xl font-extrabold text-red-900">We couldn’t load this product.</h1><p className="mt-2 text-red-800">{loadError}</p><button onClick={loadProduct} className="mt-5 rounded-xl bg-red-800 px-4 py-2.5 font-bold text-white hover:bg-red-900">Try again</button></section></main>;
  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar /><section><h1 className="mb-5 text-3xl font-extrabold">Edit product</h1><ProductForm initial={initial} categories={categories} onSubmit={submit} loading={loading} submitLabel="Save changes" /></section></main>;
}
