import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../../components/common/Sidebar.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getAnalytics } from '../../services/farmerService.js';
import { currency, getErrorMessage } from '../../utils/helpers.js';

export default function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => { getAnalytics().then(setData).catch((error) => toast.error(getErrorMessage(error))); }, []);
  if (!data) return <LoadingSpinner />;
  const maxRevenue = Math.max(1, ...data.topFarmers.map((farmer) => farmer.revenue));
  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar type="admin" /><section><h1 className="text-3xl font-extrabold">Marketplace analytics</h1><p className="mt-2 text-stone-600">Platform activity and performance at a glance.</p><div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border bg-white p-6"><h2 className="text-lg font-bold">Orders over time</h2>{data.ordersByMonth.length ? <div className="mt-4 divide-y">{data.ordersByMonth.map((row) => <div key={row._id} className="flex justify-between py-3"><span>{row._id}</span><span>{row.count} orders</span><strong>{currency(row.revenue)}</strong></div>)}</div> : <p className="mt-4 text-stone-500">No order data to display yet.</p>}</section><section className="rounded-2xl border bg-white p-6"><h2 className="text-lg font-bold">Top farmers by revenue</h2>{data.topFarmers.length ? <div className="mt-4 space-y-4">{data.topFarmers.map((farmer) => <div key={farmer._id}><div className="flex justify-between gap-3 text-sm"><strong>{farmer.farmName}</strong><span>{currency(farmer.revenue)}</span></div><progress className="mt-1 h-3 w-full accent-green-700" max={maxRevenue} value={farmer.revenue}>{farmer.revenue}</progress></div>)}</div> : <p className="mt-4 text-stone-500">No farmer sales data yet.</p>}</section><section className="rounded-2xl border bg-white p-6 lg:col-span-2"><h2 className="text-lg font-bold">Top-rated products</h2>{data.topProducts.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{data.topProducts.map((product) => <div key={product._id} className="rounded-xl bg-stone-50 p-4"><p className="font-bold">{product.name}</p><p className="mt-2 text-sm text-amber-600">★ {Number(product.ratings).toFixed(1)}</p><p className="text-sm text-stone-500">{currency(product.price)}</p></div>)}</div> : <p className="mt-4 text-stone-500">No products available yet.</p>}</section></div></section></main>;
}
