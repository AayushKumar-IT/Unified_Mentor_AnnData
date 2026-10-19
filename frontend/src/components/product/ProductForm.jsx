import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ProductForm({ initial = {}, categories, onSubmit, loading, submitLabel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    description: initial.description || '',
    category: initial.category?._id || initial.category || '',
    price: initial.price ?? '',
    unit: initial.unit || 'kg',
    quantityAvailable: initial.quantityAvailable ?? '',
    harvestDate: initial.harvestDate ? new Date(initial.harvestDate).toISOString().slice(0, 10) : '',
    isOrganic: Boolean(initial.isOrganic),
    images: null
  });
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || form.description.trim().length < 10 || !form.category || Number(form.price) <= 0 || !form.unit.trim() || Number(form.quantityAvailable) < 0 || !form.harvestDate) {
      toast.error('Complete all required fields with a valid price, quantity and description');
      return;
    }
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'images') [...(value || [])].forEach((file) => data.append('images', file));
      else if (key !== 'images' && value !== null && value !== '') data.append(key, String(value));
    });
    onSubmit(data);
  };
  const field = 'mt-1 w-full rounded-xl border border-stone-300 bg-white p-3';
  return <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-white p-6 md:grid-cols-2">
    <label className="text-sm font-semibold">Product name<input required maxLength="120" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={field} /></label>
    <label className="text-sm font-semibold">Category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={field}><option value="">Choose a category</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
    <label className="text-sm font-semibold">Price (₹)<input required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={field} /></label>
    <label className="text-sm font-semibold">Unit (e.g. kg, bunch)<input required maxLength="20" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} className={field} /></label>
    <label className="text-sm font-semibold">Quantity available<input required type="number" min="0" step="1" value={form.quantityAvailable} onChange={(event) => setForm({ ...form, quantityAvailable: event.target.value })} className={field} /></label>
    <label className="text-sm font-semibold">Harvest date<input required type="date" value={form.harvestDate} onChange={(event) => setForm({ ...form, harvestDate: event.target.value })} className={field} /></label>
    <label className="text-sm font-semibold md:col-span-2">Description<textarea required minLength="10" maxLength="3000" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={field} /></label>
    <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isOrganic} onChange={(event) => setForm({ ...form, isOrganic: event.target.checked })} className="h-4 w-4 accent-green-700" />Grown organically</label>
    <label className="text-sm font-semibold">Product photos<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setForm({ ...form, images: event.target.files })} className="mt-2 block w-full text-sm" /><span className="font-normal text-stone-500">Up to 5 images, 5 MB each.</span></label>
    <button disabled={loading || !categories.length} className="rounded-xl bg-leaf-700 p-3 font-bold text-white hover:bg-leaf-800 disabled:opacity-60 md:col-span-2">{loading ? 'Saving…' : submitLabel}</button>
  </form>;
}
