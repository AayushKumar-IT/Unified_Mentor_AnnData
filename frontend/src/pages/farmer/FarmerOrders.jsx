import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../../components/common/Sidebar.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getFarmerOrders, updateOrderStatus } from '../../services/orderService.js';
import { currency, dateLabel, getErrorMessage } from '../../utils/helpers.js';

export default function FarmerOrders() {
  const [orders, setOrders] = useState(null);
  const [busy, setBusy] = useState('');
  const [loadError, setLoadError] = useState('');
  const loadOrders = () => {
    setLoadError('');
    getFarmerOrders().then(setOrders).catch((error) => setLoadError(getErrorMessage(error)));
  };
  useEffect(() => { loadOrders(); }, []);
  const changeStatus = async (order, status) => {
    setBusy(order._id);
    try { const changed = await updateOrderStatus(order._id, status); setOrders((list) => list.map((item) => item._id === order._id ? { ...item, ...changed } : item)); toast.success('Order status updated'); }
    catch (error) { toast.error(getErrorMessage(error)); }
    finally { setBusy(''); }
  };
  if (!orders && !loadError) return <LoadingSpinner />;
  const options = { pending: ['confirmed', 'cancelled'], confirmed: ['dispatched', 'cancelled'], dispatched: ['delivered'], delivered: [], cancelled: [] };
  if (loadError) return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar /><section className="rounded-2xl border border-red-200 bg-red-50 p-7"><h1 className="text-2xl font-extrabold text-red-900">We couldn’t load your orders.</h1><p className="mt-2 text-red-800">{loadError}</p><button onClick={loadOrders} className="mt-5 rounded-xl bg-red-800 px-4 py-2.5 font-bold text-white hover:bg-red-900">Try again</button></section></main>;
  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar /><section><h1 className="text-3xl font-extrabold">Incoming orders</h1><p className="mt-2 text-stone-600">Confirm orders and keep your customers updated.</p><div className="mt-6 overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-stone-100 text-stone-600"><tr>{['Order', 'Customer', 'Items', 'Delivery', 'Total', 'Status', 'Update'].map((text) => <th className="px-4 py-3" key={text}>{text}</th>)}</tr></thead><tbody className="divide-y">{orders.map((order) => <tr key={order._id}><td className="px-4 py-4 font-semibold">#{order._id.slice(-7).toUpperCase()}<span className="block font-normal text-stone-500">{dateLabel(order.createdAt)}</span></td><td className="px-4 py-4">{order.consumerId?.name || 'Customer'}</td><td className="px-4 py-4">{order.items.map((item) => `${item.productId?.name || 'Item'} ×${item.quantity}`).join(', ')}</td><td className="px-4 py-4">{dateLabel(order.deliverySlot)}</td><td className="px-4 py-4">{currency(order.totalAmount)}</td><td className="px-4 py-4 capitalize">{order.status}</td><td className="px-4 py-4"><select disabled={busy === order._id || !options[order.status].length} value="" onChange={(event) => changeStatus(order, event.target.value)} className="rounded-lg border p-2 disabled:bg-stone-100"><option value="">Change…</option>{options[order.status].map((status) => <option value={status} key={status}>{status}</option>)}</select>{busy === order._id && <span className="ml-2">Saving…</span>}</td></tr>)}</tbody></table>{!orders.length && <p className="p-8 text-center text-stone-600">No orders received yet.</p>}</div></section></main>;
}
