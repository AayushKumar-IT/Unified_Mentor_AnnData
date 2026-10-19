import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getProducts } from '../../services/productService.js';
import { getFarmers } from '../../services/farmerService.js';
import ProductCard from '../../components/product/ProductCard.jsx';
import { getErrorMessage } from '../../utils/helpers.js';

const categoryFallbacks = [
  { name: 'Vegetables', icon: '🥬', description: 'Picked fresh, every day', slug: 'vegetables' },
  { name: 'Fruits', icon: '🍊', description: 'Seasonal orchard favourites', slug: 'fruits' },
  { name: 'Dairy', icon: '🥛', description: 'Wholesome farm goodness', slug: 'dairy' },
  { name: 'Grains', icon: '🌾', description: 'Naturally nourishing staples', slug: 'grains' }
];

const benefits = [
  { icon: '🌱', title: 'Grown with care', text: 'Know how your food is grown and who grew it.' },
  { icon: '🤝', title: 'Fair for farmers', text: 'Your purchase goes directly to the people behind the harvest.' },
  { icon: '🧺', title: 'Fresh to your table', text: 'Shop seasonal produce harvested close to home.' }
];

export default function Home() {
  const [data, setData] = useState({ categories: [], farmers: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMarket = useCallback(async () => {
    setLoading(true);
    setError('');
    const results = await Promise.allSettled([getCategories(), getFarmers(), getProducts()]);
    const [categoryResult, farmerResult, productResult] = results;
    setData({
      categories: categoryResult.status === 'fulfilled' ? categoryResult.value : [],
      farmers: farmerResult.status === 'fulfilled' ? farmerResult.value : [],
      products: productResult.status === 'fulfilled' ? productResult.value.slice(0, 4) : []
    });
    const failed = results.find((result) => result.status === 'rejected');
    if (failed?.status === 'rejected') setError(getErrorMessage(failed.reason));
    setLoading(false);
  }, []);

  useEffect(() => { loadMarket(); }, [loadMarket]);

  const categories = data.categories.length ? data.categories.slice(0, 4) : categoryFallbacks;

  return <main className="overflow-hidden">
    <section className="relative isolate bg-[#173f2b] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_38%,rgba(105,153,76,0.4),transparent_45%),linear-gradient(120deg,#123b29_0%,#1f5638_55%,#315b32_100%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-green-50"><span className="h-2 w-2 rounded-full bg-lime-300" /> A better kind of local market</span>
          <h1 className="mt-7 text-5xl font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">Know your food.<br /><span className="text-lime-300">Meet your farmer.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-green-50/85 sm:text-xl">Shop honest, seasonal produce directly from independent farms. Fresh harvests, fair prices, and a shorter journey from soil to supper.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/products" className="rounded-xl bg-lime-300 px-6 py-3.5 font-extrabold text-green-950 shadow-lg shadow-black/10 transition hover:bg-lime-200">Explore the market <span aria-hidden="true">→</span></Link><Link to="/register" className="rounded-xl border border-white/30 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">Grow with us</Link></div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-green-50/80"><span>✓ From real local farms</span><span>✓ Seasonal and traceable</span><span>✓ Fair to growers</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-5 top-10 h-24 w-24 rounded-full bg-lime-300/20 blur-2xl sm:h-36 sm:w-36" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#345c38] p-3 shadow-2xl shadow-black/30">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1100&q=85" alt="A colourful market selection of fresh vegetables" className="h-[320px] w-full rounded-[1.5rem] object-cover sm:h-[410px]" />
            <div className="absolute inset-x-7 bottom-7 rounded-2xl border border-white/30 bg-white/90 p-4 text-stone-900 shadow-lg backdrop-blur sm:inset-x-9 sm:bottom-9 sm:p-5">
              <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Good things grow locally</p><p className="mt-1 text-lg font-extrabold sm:text-xl">A little closer to the source.</p></div><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-leaf-50 text-2xl">🌿</span></div>
            </div>
          </div>
          <div className="absolute -right-2 -top-4 rounded-2xl bg-white px-4 py-3 text-stone-900 shadow-xl sm:-right-5 sm:top-8"><span className="text-xl">🥕</span><span className="ml-2 text-sm font-bold">Fresh from nearby farms</span></div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-black/10"><div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 text-center sm:grid-cols-3 sm:px-8"><p><span className="font-extrabold text-lime-200">A fairer market</span><span className="ml-2 text-sm text-green-50/75">Better connections, beyond the supermarket</span></p><p><span className="font-extrabold text-lime-200">A shorter journey</span><span className="ml-2 text-sm text-green-50/75">From the farm to your kitchen</span></p><p><span className="font-extrabold text-lime-200">A fresher choice</span><span className="ml-2 text-sm text-green-50/75">Shop what’s in season now</span></p></div></div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-leaf-700">Find your favourites</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">A good place to start.</h2></div><Link to="/products" className="font-bold text-leaf-700 hover:text-leaf-800">Browse all produce <span aria-hidden="true">→</span></Link></div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{categories.map((category) => <Link key={category._id || category.slug} to={category._id ? `/products?category=${category._id}` : `/products`} className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-leaf-600/40 hover:shadow-lg sm:p-7"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf-50 text-3xl transition group-hover:scale-105">{category.icon}</span><h3 className="mt-5 text-lg font-extrabold">{category.name}</h3><p className="mt-1 text-sm text-stone-500">{category.description || 'Goodness from local farms'}</p><span className="mt-4 inline-block text-sm font-bold text-leaf-700">Explore <span aria-hidden="true">→</span></span></Link>)}</div>
    </section>

    <section className="bg-[#f4f6ef]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-leaf-700">Picked with care</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Meet this week’s harvest.</h2><p className="mt-3 max-w-xl text-stone-600">Discover what local growers are bringing to the market right now.</p></div><Link to="/products" className="font-bold text-leaf-700 hover:text-leaf-800">Shop the market <span aria-hidden="true">→</span></Link></div>
        {error && <div role="status" className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"><p>{error}</p><button onClick={loadMarket} className="font-bold underline underline-offset-2">Try again</button></div>}
        {loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading market listings">{[1, 2, 3, 4].map((item) => <div key={item} className="animate-pulse overflow-hidden rounded-2xl bg-white"><div className="h-48 bg-stone-200" /><div className="space-y-3 p-4"><div className="h-4 w-2/3 rounded bg-stone-200" /><div className="h-3 w-1/2 rounded bg-stone-100" /><div className="h-8 rounded bg-stone-100" /></div></div>)}</div> : data.products.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{data.products.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center"><span className="text-4xl">🧺</span><h3 className="mt-3 text-xl font-extrabold">{error ? 'The market is taking a little break.' : 'The next harvest is on its way.'}</h3><p className="mx-auto mt-2 max-w-md text-stone-600">{error ? 'You can still explore the market while we reconnect. Featured listings will appear here as soon as the marketplace is online.' : 'Take a look around and check back soon for fresh listings from local farms.'}</p><Link to="/products" className="mt-5 inline-block rounded-xl bg-leaf-700 px-5 py-3 font-bold text-white hover:bg-leaf-800">Browse the market</Link></div>}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-leaf-700">A better way to shop</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Good for your table.<br />Good for the people who grow it.</h2><p className="mt-4 leading-7 text-stone-600">AnnDaata brings farmers and their communities a little closer. Find out where your food comes from, support independent growers, and enjoy the simple goodness of seasonal produce.</p><Link to="/products" className="mt-6 inline-flex rounded-xl bg-leaf-700 px-5 py-3 font-bold text-white hover:bg-leaf-800">Start shopping <span className="ml-2" aria-hidden="true">→</span></Link></div>
        <div className="grid gap-4 sm:grid-cols-3">{benefits.map((benefit) => <article key={benefit.title} className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><span className="grid h-12 w-12 place-items-center rounded-xl bg-leaf-50 text-2xl">{benefit.icon}</span><h3 className="mt-4 font-extrabold">{benefit.title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{benefit.text}</p></article>)}</div>
      </div>
    </section>

    <section className="bg-[#173f2b] text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:py-16"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-300">For the growers</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Your harvest deserves a good market.</h2><p className="mt-3 max-w-2xl text-green-50/80">Meet customers directly, share your story, and bring your farm-fresh produce to the people who appreciate it.</p></div><Link to="/register" className="w-fit rounded-xl bg-lime-300 px-6 py-3.5 font-extrabold text-green-950 transition hover:bg-lime-200">Join as a farmer <span aria-hidden="true">→</span></Link></div>
    </section>
  </main>;
}
