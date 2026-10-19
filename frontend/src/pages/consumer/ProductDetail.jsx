import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CartContext } from '../../context/CartContext.jsx';
import { getProduct, getProductReviews } from '../../services/productService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { currency, dateLabel, getErrorMessage, imageUrl } from '../../utils/helpers.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([getProduct(id), getProductReviews(id)]).then(([item, list]) => { setProduct(item); setReviews(list); }).catch((err) => setError(getErrorMessage(err)));
  }, [id]);
  if (error) return <p className="mx-auto max-w-7xl px-5 py-12 text-red-700">{error}</p>;
  if (!product) return <LoadingSpinner />;
  const farmer = product.farmerId;
  const add = () => { try { addToCart(product); toast.success('Added to your cart'); } catch (error) { toast.error(error.message); } };
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="grid gap-10 md:grid-cols-2">{product.images?.[0] ? <img src={imageUrl(product.images[0])} alt={product.name} className="h-96 w-full rounded-3xl object-cover" /> : <div className="flex h-96 items-center justify-center rounded-3xl bg-leaf-50 text-9xl">🥬</div>}<section className="self-center"><span className="rounded-full bg-leaf-50 px-3 py-1 text-sm font-bold text-leaf-800">{product.isOrganic ? 'Certified organic' : product.category?.name}</span><h1 className="mt-4 text-4xl font-extrabold">{product.name}</h1><p className="mt-3 text-lg text-stone-600">{product.description}</p><p className="mt-5 text-3xl font-black text-leaf-800">{currency(product.price)} <span className="text-base font-medium text-stone-500">/ {product.unit}</span></p><p className="mt-2 text-sm text-stone-600">{product.quantityAvailable} {product.unit} available · Harvested {dateLabel(product.harvestDate)}</p><Link to={`/farmer/${farmer?._id}`} className="mt-5 inline-flex items-center gap-3 rounded-xl border bg-white p-3"><span className="text-2xl">👩🏽‍🌾</span><span><strong className="block">{farmer?.farmName}</strong><span className="text-sm text-stone-500">{farmer?.farmLocation}</span></span></Link><button onClick={add} disabled={!product.quantityAvailable} className="mt-6 block w-full rounded-xl bg-leaf-700 p-3 font-bold text-white hover:bg-leaf-800 disabled:bg-stone-300">Add to cart</button></section></div>
    <section className="mt-12"><h2 className="text-2xl font-extrabold">Customer reviews <span className="text-amber-500">★ {Number(product.ratings).toFixed(1)}</span></h2>{reviews.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{reviews.map((review) => <article key={review._id} className="rounded-2xl border bg-white p-5"><p className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p><p className="mt-2">{review.comment || 'A fresh and lovely harvest.'}</p><p className="mt-3 text-sm text-stone-500">{review.consumerId?.name} · {dateLabel(review.createdAt)}</p></article>)}</div> : <p className="mt-4 text-stone-600">No reviews yet. Be the first to share your experience.</p>}</section>
  </main>;
}
