export default function ProductFilter({ categories, filters, onChange }) {
  return <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5">
    <h2 className="mb-4 font-bold">Filter produce</h2>
    <label className="mb-4 block text-sm font-medium text-stone-700">Category<select value={filters.category} onChange={(event) => onChange({ ...filters, category: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2.5"><option value="">All categories</option>{categories.map((category) => <option value={category._id} key={category._id}>{category.name}</option>)}</select></label>
    <label className="mb-4 block text-sm font-medium text-stone-700">Farming method<select value={filters.isOrganic} onChange={(event) => onChange({ ...filters, isOrganic: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2.5"><option value="">All methods</option><option value="true">Organic</option><option value="false">Conventional</option></select></label>
    <label className="block text-sm font-medium text-stone-700">Farm location<input value={filters.location} onChange={(event) => onChange({ ...filters, location: event.target.value })} placeholder="Search a town or region" className="mt-1 w-full rounded-lg border border-stone-300 p-2.5" /></label>
  </aside>;
}
