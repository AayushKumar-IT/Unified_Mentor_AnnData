import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import { CartContext } from '../../context/CartContext.jsx';
import { currency, imageUrl } from '../../utils/helpers.js';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const farmer = product.farmerId;
  const add = () => {
    try { addToCart(product); toast.success(`${product.name} added to cart`); }
    catch (error) { toast.error(error.message); }
  };
  return <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <Link to={`/products/${product._id}`} className="block">
      {product.images?.[0] ? <img src={imageUrl(product.images[0])} alt={product.name} className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-leaf-50 text-6xl">🥬</div>}
      <div className="p-4"><div className="mb-2 flex justify-between gap-2"><span className="rounded-full bg-leaf-50 px-2.5 py-1 text-xs font-bold text-leaf-800">{product.isOrganic ? 'Organic' : product.category?.name || 'Farm fresh'}</span><span className="text-sm text-amber-600">★ {Number(product.ratings || 0).toFixed(1)}</span></div>
        <h3 className="truncate font-bold text-stone-900">{product.name}</h3><p className="mt-1 text-sm text-stone-500">{farmer?.farmName || 'Local farm'} · {farmer?.farmLocation || 'Nearby'}</p>
        <p className="mt-3 text-lg font-extrabold text-leaf-800">{currency(product.price)}<span className="text-sm font-medium text-stone-500"> / {product.unit}</span></p></div>
    </Link>
    <div className="px-4 pb-4"><button onClick={add} disabled={!product.quantityAvailable} className="w-full rounded-xl bg-leaf-700 py-2.5 font-semibold text-white hover:bg-leaf-800 disabled:cursor-not-allowed disabled:bg-stone-300">{product.quantityAvailable ? 'Add to cart' : 'Sold out'}</button></div>
  </article>;
}
