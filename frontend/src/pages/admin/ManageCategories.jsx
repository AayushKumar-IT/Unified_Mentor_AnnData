import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api.js';
import { getCategories } from '../../services/productService.js';
import Sidebar from '../../components/common/Sidebar.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getErrorMessage } from '../../utils/helpers.js';

export default function ManageCategories() {
  const [categories, setCategories] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '🌱' });
  const [busy, setBusy] = useState(false);
  const refresh = () => getCategories().then(setCategories).catch((error) => toast.error(getErrorMessage(error)));
  useEffect(() => { refresh(); }, []);
  const add = async (event) => {
    event.preventDefault();
    if (form.name.trim().length < 2) return toast.error('Category name must have at least 2 characters');
    setBusy(true);
    try { await api.post('/admin/categories', { ...form, name: form.name.trim() }); setForm({ name: '', icon: '🌱' }); await refresh(); toast.success('Category created'); }
    catch (error) { toast.error(getErrorMessage(error)); }
    finally { setBusy(false); }
  };
  const remove = async (category) => {
    setBusy(true);
    try { await api.delete(`/admin/categories/${category._id}`); setCategories((list) => list.filter((item) => item._id !== category._id)); toast.success('Category deleted'); }
    catch (error) { toast.error(getErrorMessage(error)); }
    finally { setBusy(false); }
  };
  if (!categories) return <LoadingSpinner />;
  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar type="admin" /><section><h1 className="text-3xl font-extrabold">Manage categories</h1><form onSubmit={add} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-5"><label className="min-w-48 flex-1 text-sm font-semibold">Category name<input required minLength="2" maxLength="80" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label className="w-28 text-sm font-semibold">Icon<input maxLength="10" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><button disabled={busy} className="rounded-xl bg-leaf-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Working…' : 'Add category'}</button></form><div className="mt-5 grid gap-3 sm:grid-cols-2">{categories.map((category) => <div key={category._id} className="flex items-center justify-between rounded-2xl border bg-white p-5"><span className="flex items-center gap-3"><span className="text-3xl">{category.icon}</span><span><strong className="block">{category.name}</strong><span className="text-sm text-stone-500">{category.slug}</span></span></span><button disabled={busy} onClick={() => remove(category)} className="rounded-lg border px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Delete</button></div>)}</div>{!categories.length && <p className="mt-4 text-stone-600">No categories configured.</p>}</section></main>;
}
