import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard.jsx';
import ProductFilter from '../../components/product/ProductFilter.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getCategories } from '../../services/productService.js';
import useProducts from '../../hooks/useProducts.js';

export default function ProductList() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: searchParams.get('category') || '', isOrganic: '', location: '', search: '' });
  const [query, setQuery] = useState(filters);
  const { products, loading, error } = useProducts(Object.fromEntries(Object.entries(query).filter(([, value]) => value)));
  useEffect(() => { getCategories().then(setCategories).catch(() => setCategories([])); }, []);
  useEffect(() => { const timer = setTimeout(() => setQuery(filters), 250); return () => clearTimeout(timer); }, [filters]);
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="mb-8"><p className="font-bold text-leaf-700">THE MARKET</p><h1 className="mt-1 text-4xl font-extrabold">Fresh from local farms</h1><p className="mt-2 text-stone-600">Find seasonal produce, grown with care and delivered directly.</p></div><div className="mb-6"><label className="sr-only" htmlFor="search">Search produce</label><input id="search" type="search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search by product name…" className="w-full rounded-xl border border-stone-300 bg-white p-3.5 shadow-sm" /></div>
    <div className="grid items-start gap-6 md:grid-cols-[260px_1fr]"><ProductFilter categories={categories} filters={filters} onChange={setFilters} /><section>{loading ? <LoadingSpinner /> : error ? <p className="rounded-xl bg-red-50 p-5 text-red-700">{error}</p> : products.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard product={product} key={product._id} />)}</div> : <div className="rounded-2xl bg-white p-10 text-center text-stone-600">No products match those filters yet.</div>}</section></div>
  </main>;
}
