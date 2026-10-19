import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFarmer } from '../../services/farmerService.js';
import { getFarmerProducts } from '../../services/productService.js';
import ProductCard from '../../components/product/ProductCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getErrorMessage } from '../../utils/helpers.js';

export default function FarmerPage() {
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([getFarmer(id), getFarmerProducts(id)]).then(([profile, items]) => { setFarmer(profile); setProducts(items); }).catch((err) => setError(getErrorMessage(err)));
  }, [id]);
  if (error) return <p className="mx-auto max-w-7xl px-5 py-12 text-red-700">{error}</p>;
  if (!farmer) return <LoadingSpinner />;
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><section className="rounded-3xl bg-gradient-to-r from-leaf-800 to-emerald-600 p-8 text-white sm:p-12"><p className="text-6xl">👩🏽‍🌾</p><p className="mt-5 font-bold uppercase tracking-widest text-green-100">{farmer.isVerified ? 'Verified grower' : 'Local grower'}</p><h1 className="mt-2 text-4xl font-extrabold">{farmer.farmName}</h1><p className="mt-2 text-lg">{farmer.farmLocation} · {farmer.farmingMethod} farming</p><p className="mt-5 max-w-2xl leading-relaxed">{farmer.bio || 'Growing fresh produce for the community.'}</p><div className="mt-5 flex flex-wrap gap-2">{farmer.cropTypes.map((crop) => <span key={crop} className="rounded-full bg-white/15 px-3 py-1 text-sm">{crop}</span>)}</div></section><div className="mb-5 mt-12"><h2 className="text-3xl font-extrabold">Available from this farm</h2><p className="mt-1 text-stone-600">Freshly picked, straight to your table.</p></div>{products.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <p className="rounded-xl bg-white p-6 text-stone-600">No available products right now. <Link className="text-leaf-700" to="/products">Browse other farms.</Link></p>}</main>;
}
