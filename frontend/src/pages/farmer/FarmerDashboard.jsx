import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/common/Sidebar.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getSalesSummary, getMyFarmerProfile } from '../../services/farmerService.js';
import { deleteProduct, getMyProducts, setProductAvailability } from '../../services/productService.js';
import { getFarmerOrders, updateOrderStatus } from '../../services/orderService.js';
import { currency, dateLabel, getErrorMessage, imageUrl } from '../../utils/helpers.js';

const orderActions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: []
};

const statusStyles = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  confirmed: 'bg-blue-50 text-blue-800 ring-blue-200',
  dispatched: 'bg-violet-50 text-violet-800 ring-violet-200',
  delivered: 'bg-green-50 text-green-800 ring-green-200',
  cancelled: 'bg-stone-100 text-stone-600 ring-stone-200'
};

function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ${statusStyles[status] || statusStyles.pending}`}>{status}</span>;
}

function MetricCard({ icon, label, value, note, tone }) {
  return <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-stone-500">{label}</p><p className="mt-2 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">{value}</p></div><span className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${tone}`}>{icon}</span></div>
    <p className="mt-3 text-xs text-stone-500">{note}</p>
  </article>;
}

export default function FarmerDashboard() {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pageState, setPageState] = useState('loading');
  const [pageError, setPageError] = useState('');
  const [busyOrder, setBusyOrder] = useState('');
  const [busyProduct, setBusyProduct] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setPageState('loading');
    setPageError('');
    try {
      let farmerProfile;
      try {
        farmerProfile = await getMyFarmerProfile();
      } catch (error) {
        if (error.response?.status === 404) {
          setPageState('needs-profile');
          return;
        }
        throw error;
      }
      setProfile(farmerProfile);
      const [sales, inventory, incomingOrders] = await Promise.all([
        getSalesSummary(),
        getMyProducts(),
        getFarmerOrders()
      ]);
      setSummary(sales);
      setProducts(inventory);
      setOrders(incomingOrders);
      setPageState('ready');
    } catch (error) {
      setPageError(getErrorMessage(error));
      setPageState('error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const filteredProducts = useMemo(() => {
    if (filter === 'available') return products.filter((product) => product.isAvailable && product.quantityAvailable > 0);
    if (filter === 'low-stock') return products.filter((product) => product.quantityAvailable > 0 && product.quantityAvailable <= 5);
    if (filter === 'out-of-stock') return products.filter((product) => product.quantityAvailable === 0 || !product.isAvailable);
    return products;
  }, [filter, products]);
  const visibleProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, 6);

  const changeOrderStatus = async (order, status) => {
    setBusyOrder(order._id);
    try {
      const changed = await updateOrderStatus(order._id, status);
      setOrders((current) => current.map((item) => item._id === order._id ? { ...item, ...changed } : item));
      setSummary((current) => current ? {
        ...current,
        pendingOrders: Math.max(0, (current.pendingOrders || 0) + (order.status === 'pending' ? -1 : 0) + (status === 'pending' ? 1 : 0)),
        revenue: status === 'cancelled' ? Math.max(0, Number(current.revenue || 0) - Number(order.totalAmount || 0)) : current.revenue
      } : current);
      if (status === 'cancelled') {
        setProducts((current) => current.map((product) => {
          const restocked = changed.items
            .filter((item) => item.productRef === product.id)
            .reduce((quantity, item) => quantity + item.quantity, 0);
          return restocked ? { ...product, quantityAvailable: product.quantityAvailable + restocked } : product;
        }));
      }
      toast.success(status === 'cancelled' ? 'Order cancelled and stock returned to inventory' : `Order ${status}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyOrder('');
    }
  };

  const toggleListing = async (product) => {
    if (!product.isAvailable && product.quantityAvailable <= 0) {
      toast.error('Add stock before publishing this product');
      return;
    }
    setBusyProduct(product._id);
    try {
      const updated = await setProductAvailability(product._id, !product.isAvailable);
      setProducts((current) => current.map((item) => item._id === product._id ? { ...item, ...updated } : item));
      toast.success(updated.isAvailable ? 'Product published to the market' : 'Product unlisted from the market');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyProduct('');
    }
  };

  const removeProduct = async () => {
    if (!deleteTarget) return;
    setBusyProduct(deleteTarget._id);
    try {
      await deleteProduct(deleteTarget._id);
      setProducts((current) => current.map((product) => product._id === deleteTarget._id ? { ...product, isAvailable: false } : product));
      setDeleteTarget(null);
      toast.success('Product unlisted and kept in your inventory. You can publish it again whenever you’re ready.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyProduct('');
    }
  };

  if (pageState === 'loading') return <LoadingSpinner label="Opening your farm dashboard…" />;

  if (pageState === 'needs-profile') {
    return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6">
      <Sidebar />
      <section className="overflow-hidden rounded-3xl border border-leaf-100 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-[#173f2b] to-[#34734b] px-6 py-10 text-white sm:px-10 sm:py-14">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">Welcome to AnnDaata</span>
          <h1 className="mt-5 max-w-2xl text-3xl font-black sm:text-5xl">Let’s get your farm ready for the market.</h1>
          <p className="mt-4 max-w-xl leading-7 text-green-50/85">Create your farm profile to introduce your produce, share your story, and start the verification process.</p>
          <Link to="/farmer/profile" className="mt-7 inline-flex rounded-xl bg-lime-300 px-5 py-3 font-extrabold text-green-950 hover:bg-lime-200">Create farm profile <span className="ml-2" aria-hidden="true">→</span></Link>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">{[['01', 'Tell your story', 'Add your farm name, location and what you grow.'], ['02', 'Get verified', 'Our team reviews your farm profile.'], ['03', 'List your harvest', 'Once approved, publish products for customers.']].map(([number, title, text]) => <article key={number} className="rounded-2xl bg-stone-50 p-5"><p className="text-sm font-black text-leaf-700">STEP {number}</p><h2 className="mt-2 font-extrabold">{title}</h2><p className="mt-1 text-sm leading-6 text-stone-600">{text}</p></article>)}</div>
    </section></main>;
  }

  if (pageState === 'error') {
    return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar /><section className="rounded-2xl border border-red-200 bg-red-50 p-7"><h1 className="text-2xl font-extrabold text-red-900">We couldn’t load your farm dashboard.</h1><p className="mt-2 text-red-800">{pageError}</p><button onClick={() => loadDashboard()} className="mt-5 rounded-xl bg-red-800 px-4 py-2.5 font-bold text-white hover:bg-red-900">Try again</button></section></main>;
  }

  const activeProducts = products.filter((product) => product.isAvailable && product.quantityAvailable > 0).length;
  const lowStockCount = products.filter((product) => product.quantityAvailable > 0 && product.quantityAvailable <= 5).length;
  const pendingQueue = orders.filter((order) => order.status === 'pending').length;

  return <main className="min-h-[calc(100vh-64px)] bg-[#f7f8f4]">
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:py-9">
      <Sidebar />
      <section className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-leaf-700">Farmer workspace</p><h1 className="mt-1 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">Good day{profile?.farmName ? `, ${profile.farmName}` : ''}.</h1><p className="mt-2 text-stone-600">Here’s what’s happening on your farm today.</p></div>
          <div className="flex items-center gap-2"><button onClick={() => loadDashboard(true)} disabled={refreshing} className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-50">{refreshing ? 'Refreshing…' : '↻ Refresh'}</button><Link to="/farmer/products/add" className="rounded-xl bg-leaf-700 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-leaf-800">＋ Add product</Link></div>
        </header>

        <div className={`mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 sm:px-5 ${profile?.isVerified ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex items-start gap-3"><span className="mt-0.5 text-xl">{profile?.isVerified ? '✓' : '◷'}</span><div><p className={`font-extrabold ${profile?.isVerified ? 'text-green-900' : 'text-amber-950'}`}>{profile?.isVerified ? 'Your farm is verified' : 'Your farm profile is under review'}</p><p className={`mt-0.5 text-sm ${profile?.isVerified ? 'text-green-800' : 'text-amber-900'}`}>{profile?.isVerified ? 'Your farm and products are visible to customers.' : 'You can manage your profile and prepare listings while our team reviews your application.'}</p></div></div>
          <Link to="/farmer/profile" className={`text-sm font-extrabold underline underline-offset-4 ${profile?.isVerified ? 'text-green-800' : 'text-amber-900'}`}>View farm profile</Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
          <MetricCard icon="🥬" label="Listed products" value={summary?.totalProducts ?? products.length} note={`${activeProducts} currently available`} tone="bg-leaf-50" />
          <MetricCard icon="🧾" label="Total orders" value={summary?.totalOrders ?? orders.length} note={`${pendingQueue} need your attention`} tone="bg-blue-50" />
          <MetricCard icon="₹" label="Sales revenue" value={currency(summary?.revenue || 0)} note="Excludes cancelled orders" tone="bg-amber-50" />
          <MetricCard icon="📦" label="Pending orders" value={summary?.pendingOrders ?? pendingQueue} note="Confirm orders to get them moving" tone="bg-violet-50" />
        </div>

        {!profile?.isVerified && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4"><div><p className="font-extrabold">While your farm is being reviewed</p><p className="mt-1 text-sm text-stone-600">Complete your farm details and prepare product listings for your first market day.</p></div><Link to="/farmer/profile" className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold hover:bg-stone-50">Complete profile</Link></div>}

        <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(290px,0.65fr)]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-extrabold">Your products</h2><p className="mt-0.5 text-sm text-stone-500">{products.length} listing{products.length === 1 ? '' : 's'} in your farm inventory</p></div><div className="flex items-center gap-2"><label className="sr-only" htmlFor="product-filter">Filter products</label><select id="product-filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold"><option value="all">All products</option><option value="available">Available</option><option value="low-stock">Low stock</option><option value="out-of-stock">Unavailable</option></select><Link to="/farmer/products/add" aria-label="Add a product" className="grid h-9 w-9 place-items-center rounded-lg bg-leaf-700 text-xl font-bold text-white hover:bg-leaf-800">+</Link></div></div>
            {filteredProducts.length ? <div className="divide-y divide-stone-100">{visibleProducts.map((product) => <article key={product._id} className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-6"><div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-leaf-50 text-2xl">{product.images?.[0] ? <img src={imageUrl(product.images[0])} alt="" className="h-full w-full object-cover" /> : product.category?.icon || '🥬'}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-extrabold text-stone-900">{product.name}</h3>{product.isOrganic && <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-800">Organic</span>}{!product.isAvailable && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-600">Unlisted</span>}</div><p className="mt-1 text-sm text-stone-500">{product.category?.name || 'Produce'} · {currency(product.price)}/{product.unit}</p></div><div className="hidden text-right sm:block"><p className={`text-sm font-bold ${product.quantityAvailable <= 5 ? 'text-amber-700' : 'text-stone-700'}`}>{product.quantityAvailable} {product.unit}</p><p className="text-xs text-stone-500">{product.quantityAvailable === 0 ? 'Out of stock' : product.quantityAvailable <= 5 ? 'Low stock' : 'In stock'}</p></div><div className="flex shrink-0 items-center gap-1"><Link to={`/farmer/products/edit/${product._id}`} title={`Edit ${product.name}`} className="rounded-lg px-2.5 py-2 text-sm font-bold text-leaf-800 hover:bg-leaf-50">Edit</Link><button onClick={() => product.isAvailable ? setDeleteTarget(product) : toggleListing(product)} disabled={busyProduct === product._id} title={product.isAvailable ? `Unlist ${product.name}` : `Publish ${product.name}`} className={`rounded-lg px-2.5 py-2 text-sm font-bold ${product.isAvailable ? 'text-red-700 hover:bg-red-50' : 'text-leaf-800 hover:bg-leaf-50'}`}>{busyProduct === product._id ? 'Saving…' : product.isAvailable ? 'Unlist' : 'Publish'}</button></div></article>)}</div> : <div className="px-6 py-10 text-center"><span className="text-4xl">🧺</span><p className="mt-3 font-extrabold">{products.length ? 'No products in this filter' : 'Your product shelf is empty'}</p><p className="mt-1 text-sm text-stone-500">{products.length ? 'Choose a different filter to see more listings.' : 'Add your first harvest to start building your marketplace.'}</p>{!products.length && <Link to="/farmer/products/add" className="mt-4 inline-flex rounded-lg bg-leaf-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-leaf-800">Add your first product</Link>}</div>}
            {filteredProducts.length > 6 && <div className="border-t border-stone-100 px-5 py-3 text-center"><button onClick={() => setShowAllProducts((current) => !current)} className="text-xs font-bold text-leaf-700 hover:text-leaf-800">{showAllProducts ? 'Show fewer products' : `Show all ${filteredProducts.length} products`}</button></div>}
          </section>

          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4"><div><h2 className="text-lg font-extrabold">Order activity</h2><p className="mt-0.5 text-sm text-stone-500">Your latest customer orders</p></div><Link to="/farmer/orders" className="text-sm font-extrabold text-leaf-700 hover:text-leaf-800">All orders →</Link></div>
            {orders.length ? <div className="divide-y divide-stone-100">{orders.slice(0, 4).map((order) => <article key={order._id} className="px-5 py-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold">{order.consumerId?.name || 'Customer'}</p><p className="mt-0.5 text-xs text-stone-500">#{order._id.slice(-7).toUpperCase()} · {dateLabel(order.createdAt)}</p></div><StatusBadge status={order.status} /></div><div className="mt-2 flex items-center justify-between gap-2"><p className="truncate text-sm text-stone-600">{order.items.map((item) => `${item.productId?.name || 'Product'} ×${item.quantity}`).join(', ')}</p><span className="shrink-0 text-sm font-extrabold">{currency(order.totalAmount)}</span></div>{orderActions[order.status]?.length > 0 && <div className="mt-3 flex gap-2">{orderActions[order.status].map((status) => <button key={status} disabled={busyOrder === order._id} onClick={() => changeOrderStatus(order, status)} className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize disabled:opacity-50 ${status === 'cancelled' ? 'border border-stone-300 text-stone-600 hover:bg-stone-50' : 'bg-leaf-50 text-leaf-800 hover:bg-leaf-100'}`}>{busyOrder === order._id ? 'Saving…' : status === 'confirmed' ? 'Accept order' : status === 'dispatched' ? 'Mark dispatched' : status === 'delivered' ? 'Mark delivered' : 'Cancel'}</button>)}</div>}</article>)}</div> : <div className="px-5 py-10 text-center"><span className="text-4xl">📬</span><p className="mt-3 font-extrabold">No orders just yet</p><p className="mt-1 text-sm text-stone-500">{profile?.isVerified ? 'Orders from customers will show up here.' : 'Orders can arrive once your farm is verified and products are listed.'}</p></div>}
            <div className="border-t border-stone-100 bg-stone-50/70 px-5 py-3"><Link to="/farmer/orders" className="text-sm font-bold text-leaf-700">Manage incoming orders <span aria-hidden="true">→</span></Link></div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-leaf-700">Farm health</p><h2 className="mt-1 text-lg font-extrabold">A few things to keep an eye on</h2></div><Link to="/farmer/profile" className="text-sm font-bold text-leaf-700">Edit farm profile →</Link></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="flex items-start gap-3 rounded-xl bg-stone-50 p-4"><span className="text-lg">{profile?.isVerified ? '✅' : '🕒'}</span><div><p className="text-sm font-bold">Farm verification</p><p className="mt-1 text-xs leading-5 text-stone-500">{profile?.isVerified ? 'Your customers can discover your farm.' : 'Your profile is awaiting admin review.'}</p></div></div><div className="flex items-start gap-3 rounded-xl bg-stone-50 p-4"><span className="text-lg">{lowStockCount ? '⚠️' : '📦'}</span><div><p className="text-sm font-bold">Inventory levels</p><p className="mt-1 text-xs leading-5 text-stone-500">{lowStockCount ? `${lowStockCount} product${lowStockCount === 1 ? '' : 's'} running low. Consider updating stock.` : 'Your low-stock products will be highlighted here.'}</p></div></div><div className="flex items-start gap-3 rounded-xl bg-stone-50 p-4"><span className="text-lg">{pendingQueue ? '🔔' : '🌤️'}</span><div><p className="text-sm font-bold">Order queue</p><p className="mt-1 text-xs leading-5 text-stone-500">{pendingQueue ? `${pendingQueue} order${pendingQueue === 1 ? '' : 's'} need confirmation.` : 'You are up to date on new orders.'}</p></div></div></div></section>
      </section>
    </div>
    {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4" role="presentation"><section role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-2xl">📦</div><h2 id="delete-product-title" className="mt-4 text-xl font-extrabold">Unlist this product?</h2><p className="mt-2 text-sm leading-6 text-stone-600"><strong>{deleteTarget.name}</strong> will no longer appear in the public market. Your existing order history will be preserved, and you can publish it again later.</p><div className="mt-6 flex justify-end gap-3"><button disabled={Boolean(busyProduct)} onClick={() => setDeleteTarget(null)} className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50">Keep listed</button><button disabled={Boolean(busyProduct)} onClick={removeProduct} className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-800 disabled:opacity-60">{busyProduct ? 'Unlisting…' : 'Unlist product'}</button></div></section></div>}
  </main>;
}
