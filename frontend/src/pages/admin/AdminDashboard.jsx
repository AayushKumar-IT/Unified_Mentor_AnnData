import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/common/Sidebar.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  getAdminConsumers,
  getAdminFarmers,
  getAdminOrders,
  getAnalytics,
  reviewFarmer
} from '../../services/farmerService.js';
import { currency, dateLabel, getErrorMessage } from '../../utils/helpers.js';

const overviewCards = [
  { key: 'farmers', label: 'Verified farmers', detail: 'View verified and pending farmer profiles', tone: 'green' },
  { key: 'consumers', label: 'Consumers', detail: 'View registered consumer accounts', tone: 'stone' },
  { key: 'orders', label: 'Orders', detail: 'View marketplace orders and their status', tone: 'stone' },
  { key: 'revenue', label: 'Revenue', detail: 'View monthly revenue and top performers', tone: 'stone' }
];

function FarmerCard({ farmer, busy, onReview }) {
  const account = farmer.userId || {};
  return <article className="rounded-xl border border-stone-200 bg-white p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h4 className="font-extrabold text-stone-900">{farmer.farmName}</h4>
        <p className="mt-1 text-sm text-stone-600">{farmer.farmLocation} · {farmer.farmingMethod}</p>
      </div>
      {farmer.isVerified
        ? <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">Verified</span>
        : <div className="flex gap-2">
          <button disabled={busy} onClick={() => onReview(farmer, false)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-bold text-red-700 disabled:opacity-50">{busy ? 'Saving…' : 'Reject'}</button>
          <button disabled={busy} onClick={() => onReview(farmer, true)} className="rounded-lg bg-leaf-700 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Approve'}</button>
        </div>}
    </div>
    <dl className="mt-3 grid gap-x-4 gap-y-2 border-t border-stone-100 pt-3 text-sm sm:grid-cols-2">
      <div><dt className="font-semibold text-stone-500">Farmer</dt><dd>{account.name || '—'}</dd></div>
      <div><dt className="font-semibold text-stone-500">Email</dt><dd className="break-all">{account.email || '—'}</dd></div>
      <div><dt className="font-semibold text-stone-500">Crops</dt><dd>{farmer.cropTypes?.join(', ') || 'Not provided'}</dd></div>
      <div><dt className="font-semibold text-stone-500">Submitted</dt><dd>{dateLabel(farmer.createdAt)}</dd></div>
      <div className="sm:col-span-2"><dt className="font-semibold text-stone-500">About</dt><dd className="whitespace-pre-wrap">{farmer.bio || 'No description provided.'}</dd></div>
      <div className="sm:col-span-2"><dt className="font-semibold text-stone-500">Verification document</dt><dd>{farmer.verificationDocs ? <a className="font-bold text-leaf-700 underline" href={farmer.verificationDocs} target="_blank" rel="noreferrer">View document ↗</a> : 'Not provided'}</dd></div>
    </dl>
  </article>;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [farmers, setFarmers] = useState(null);
  const [consumers, setConsumers] = useState(null);
  const [orders, setOrders] = useState(null);
  const [busyFarmer, setBusyFarmer] = useState('');

  const loadDashboard = () => {
    setLoadError('');
    getAnalytics().then(setData).catch((error) => setLoadError(getErrorMessage(error)));
  };

  useEffect(() => { loadDashboard(); }, []);

  const loadSection = async (section) => {
    setSelectedSection(section);
    setDetailError('');
    const alreadyLoaded = (section === 'farmers' && farmers) || (section === 'consumers' && consumers) || (section === 'orders' && orders) || section === 'revenue';
    if (alreadyLoaded) return;
    setDetailLoading(true);
    try {
      if (section === 'farmers') setFarmers(await getAdminFarmers());
      if (section === 'consumers') setConsumers(await getAdminConsumers());
      if (section === 'orders') setOrders(await getAdminOrders());
    } catch (error) {
      setDetailError(getErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const selectSection = (section) => {
    if (selectedSection === section) {
      setSelectedSection('');
      setDetailError('');
      return;
    }
    loadSection(section);
  };

  const decideFarmer = async (farmer, approved) => {
    setBusyFarmer(farmer._id);
    try {
      await reviewFarmer(farmer._id, approved);
      if (approved) {
        setFarmers((current) => current.map((item) => item._id === farmer._id ? { ...item, isVerified: true } : item));
        setData((current) => current ? { ...current, farmers: current.farmers + 1, pendingFarmers: Math.max(0, current.pendingFarmers - 1) } : current);
        toast.success('Farmer approved and moved to verified farmers');
      } else {
        setFarmers((current) => current.filter((item) => item._id !== farmer._id));
        setData((current) => current ? { ...current, pendingFarmers: Math.max(0, current.pendingFarmers - 1) } : current);
        toast.success('Application rejected');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyFarmer('');
    }
  };

  if (!data && !loadError) return <LoadingSpinner />;
  if (loadError) return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar type="admin" /><section className="rounded-2xl border border-red-200 bg-red-50 p-7"><h1 className="text-2xl font-extrabold text-red-900">We couldn’t load the admin overview.</h1><p className="mt-2 text-red-800">{loadError}</p><button onClick={loadDashboard} className="mt-5 rounded-xl bg-red-800 px-4 py-2.5 font-bold text-white">Try again</button></section></main>;

  const cardValues = {
    farmers: data.farmers,
    consumers: data.consumers,
    orders: data.orders,
    revenue: currency(data.revenue)
  };
  const pendingFarmers = farmers?.filter((farmer) => !farmer.isVerified) || [];
  const verifiedFarmers = farmers?.filter((farmer) => farmer.isVerified) || [];

  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6">
    <Sidebar type="admin" />
    <section className="min-w-0">
      <p className="font-bold text-leaf-700">PLATFORM ADMIN</p>
      <h1 className="mt-1 text-3xl font-extrabold">Marketplace overview</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {overviewCards.map((card) => {
          const selected = selectedSection === card.key;
          const green = card.tone === 'green';
          return <button
            key={card.key}
            type="button"
            aria-expanded={selected}
            aria-controls="overview-details"
            onClick={() => selectSection(card.key)}
            className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-leaf-600 ${green ? 'border-green-200 bg-green-50 hover:border-green-400' : 'border-stone-200 bg-white hover:border-leaf-300'} ${selected ? 'ring-2 ring-leaf-600' : ''}`}
          >
            <span className={`block text-sm font-semibold ${green ? 'text-green-800' : 'text-stone-500'}`}>{card.label} <span aria-hidden="true">{selected ? '▾' : '↗'}</span></span>
            <span className={`mt-2 block text-2xl font-extrabold ${green ? 'text-green-950' : 'text-stone-900'}`}>{cardValues[card.key]}</span>
            <span className={`mt-2 block text-xs font-semibold ${green ? 'text-green-800' : 'text-stone-500'}`}>{card.detail}</span>
          </button>;
        })}
      </div>

      <Link to="/admin/farmers" className="mt-5 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:border-amber-400 hover:shadow-sm">
        <span><strong className="block">Farmer applications</strong><span className="text-sm text-stone-600">Open the farmer directory to review pending applications</span></span>
        <span className="rounded-full bg-amber-200 px-3 py-1 font-bold">{data.pendingFarmers} pending →</span>
      </Link>

      {selectedSection && <section id="overview-details" aria-live="polite" className="mt-6 scroll-mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-leaf-700">Overview details</p>
            <h2 className="mt-1 text-2xl font-extrabold">
              {selectedSection === 'farmers' ? 'Farmer profiles' : selectedSection === 'consumers' ? 'Consumers' : selectedSection === 'orders' ? 'Marketplace orders' : 'Revenue details'}
            </h2>
          </div>
          <button onClick={() => setSelectedSection('')} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-stone-700 hover:bg-stone-100">Close</button>
        </div>

        {detailLoading ? <div className="py-8"><LoadingSpinner label="Loading overview details…" /></div>
          : detailError ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-800">{detailError}</p><button onClick={() => loadSection(selectedSection)} className="mt-3 rounded-lg bg-red-800 px-3 py-2 text-sm font-bold text-white">Try again</button></div>
            : selectedSection === 'farmers' ? <div className="mt-5 grid items-start gap-5 xl:grid-cols-2">
              <section aria-labelledby="overview-pending-heading">
                <div className="mb-3 flex items-center justify-between"><h3 id="overview-pending-heading" className="text-lg font-extrabold">Not verified</h3><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">{pendingFarmers.length} pending</span></div>
                <div className="grid gap-3">{pendingFarmers.map((farmer) => <FarmerCard key={farmer._id} farmer={farmer} busy={busyFarmer === farmer._id} onReview={decideFarmer} />)}{!pendingFarmers.length && <p className="rounded-xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">No farmer applications are waiting for review.</p>}</div>
              </section>
              <section aria-labelledby="overview-verified-heading">
                <div className="mb-3 flex items-center justify-between"><h3 id="overview-verified-heading" className="text-lg font-extrabold">Verified farmers</h3><span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">{verifiedFarmers.length} verified</span></div>
                <div className="grid gap-3">{verifiedFarmers.map((farmer) => <FarmerCard key={farmer._id} farmer={farmer} busy={false} onReview={decideFarmer} />)}{!verifiedFarmers.length && <p className="rounded-xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">Approved farms will appear here.</p>}</div>
              </section>
            </div>
              : selectedSection === 'consumers' ? <div className="mt-5">
                <p className="mb-3 text-sm text-stone-600">{consumers.length} registered consumer account{consumers.length === 1 ? '' : 's'}</p>
                <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-stone-100 text-stone-600"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Joined</th></tr></thead><tbody className="divide-y divide-stone-100">{consumers.map((consumer) => <tr key={consumer._id}><td className="px-4 py-3 font-semibold">{consumer.name}</td><td className="px-4 py-3">{consumer.email}</td><td className="px-4 py-3">{dateLabel(consumer.createdAt)}</td></tr>)}</tbody></table>{!consumers.length && <p className="p-6 text-center text-sm text-stone-600">No consumer accounts yet.</p>}</div>
              </div>
                : selectedSection === 'orders' ? <div className="mt-5">
                  <p className="mb-3 text-sm text-stone-600">{orders.length} marketplace order{orders.length === 1 ? '' : 's'}</p>
                  <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-stone-100 text-stone-600"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Farm</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Placed</th></tr></thead><tbody className="divide-y divide-stone-100">{orders.map((order) => <tr key={order._id}><td className="px-4 py-3 font-bold">#{order._id.slice(-7).toUpperCase()}</td><td className="px-4 py-3">{order.consumerId?.name || '—'}</td><td className="px-4 py-3">{order.farmerId?.farmName || '—'}</td><td className="max-w-64 px-4 py-3">{order.items?.map((item) => `${item.productId?.name || 'Item'} ×${item.quantity}`).join(', ') || '—'}</td><td className="px-4 py-3 capitalize">{order.status}</td><td className="px-4 py-3">{currency(order.totalAmount)}</td><td className="px-4 py-3">{dateLabel(order.createdAt)}</td></tr>)}</tbody></table>{!orders.length && <p className="p-6 text-center text-sm text-stone-600">No orders yet.</p>}</div>
                </div>
                  : <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <section className="rounded-xl border border-stone-200 bg-white p-4"><h3 className="font-extrabold">Monthly revenue</h3><p className="mt-1 text-xs text-stone-500">Cancelled orders are excluded from revenue.</p>{data.ordersByMonth.length ? <div className="mt-3 divide-y">{data.ordersByMonth.map((row) => <div key={row._id} className="flex justify-between gap-3 py-2 text-sm"><span>{row._id} · {row.count} orders</span><strong>{currency(row.revenue)}</strong></div>)}</div> : <p className="mt-3 text-sm text-stone-500">Monthly revenue will appear after orders are placed.</p>}</section>
                    <section className="rounded-xl border border-stone-200 bg-white p-4"><h3 className="font-extrabold">Top farms by revenue</h3>{data.topFarmers.length ? <div className="mt-3 divide-y">{data.topFarmers.map((farmer) => <div key={farmer._id} className="flex justify-between gap-3 py-2 text-sm"><span>{farmer.farmName}</span><strong>{currency(farmer.revenue)}</strong></div>)}</div> : <p className="mt-3 text-sm text-stone-500">Farm sales will appear here after orders are completed.</p>}</section>
                    <section className="rounded-xl border border-stone-200 bg-white p-4 lg:col-span-2"><h3 className="font-extrabold">Top-rated products</h3>{data.topProducts.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{data.topProducts.map((product) => <article key={product._id} className="rounded-lg bg-stone-50 p-3"><p className="font-bold">{product.name}</p><p className="mt-1 text-sm text-stone-600">★ {Number(product.ratings).toFixed(1)} · {currency(product.price)}</p></article>)}</div> : <p className="mt-3 text-sm text-stone-500">No product data yet.</p>}</section>
                  </div>}
      </section>}

      <div className="mt-7 rounded-2xl border border-stone-200 bg-white p-6"><div className="flex justify-between"><h2 className="font-bold">Orders over time</h2><Link to="/admin/analytics" className="font-semibold text-leaf-700">View analytics →</Link></div>{data.ordersByMonth.length ? <div className="mt-4 grid gap-2">{data.ordersByMonth.slice(-6).map((row) => <div key={row._id} className="flex justify-between border-b py-2 text-sm"><span>{row._id}</span><span>{row.count} orders · {currency(row.revenue)}</span></div>)}</div> : <p className="mt-4 text-sm text-stone-500">Order trends will appear when customers place orders.</p>}</div>
    </section>
  </main>;
}
