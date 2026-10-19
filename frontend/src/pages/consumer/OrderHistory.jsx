import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import OrderCard from '../../components/order/OrderCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getMyOrders } from '../../services/orderService.js';
import { createReview } from '../../services/productService.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function OrderHistory() {
  const [orders, setOrders] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [form, setForm] = useState({ productId: '', rating: '5', comment: '' });
  const [loading, setLoading] = useState(false);
  useEffect(() => { getMyOrders().then(setOrders).catch((error) => toast.error(getErrorMessage(error))); }, []);
  const submitReview = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await createReview({ ...form, orderId: reviewing._id, rating: Number(form.rating) });
      toast.success('Thank you for your review');
      setReviewing(null);
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  };
  if (!orders) return <LoadingSpinner />;
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-extrabold">Your orders</h1><p className="mt-2 text-stone-600">Track each order from the farm to your door.</p><div className="mt-7 grid gap-4">{orders.length ? orders.map((order) => <OrderCard order={order} key={order._id}>{order.status === 'delivered' && <div className="mt-3 flex flex-wrap gap-2">{order.items.map((item) => <button key={item._id || item.productId?._id} onClick={() => { setReviewing(order); setForm({ productId: item.productId?._id, rating: '5', comment: '' }); }} className="text-sm font-bold text-leaf-700">Write a review: {item.productId?.name}</button>)}</div>}</OrderCard>) : <p className="rounded-2xl bg-white p-8 text-stone-600">Your first farm-fresh order is waiting.</p>}</div>
    {reviewing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={submitReview} className="w-full max-w-md rounded-2xl bg-white p-6"><h2 className="text-xl font-bold">Share your experience</h2><label className="mt-4 block text-sm font-semibold">Rating<select value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} className="mt-1 w-full rounded-lg border p-3">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select></label><label className="mt-4 block text-sm font-semibold">Comment<textarea maxLength="1500" value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} className="mt-1 w-full rounded-lg border p-3" rows="3" /></label><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setReviewing(null)} className="rounded-lg border px-4 py-2">Cancel</button><button disabled={loading} className="rounded-lg bg-leaf-700 px-4 py-2 font-bold text-white">{loading ? 'Submitting…' : 'Submit review'}</button></div></form></div>}
  </main>;
}
