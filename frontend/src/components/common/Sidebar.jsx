import { NavLink } from 'react-router-dom';

const farmerLinks = [['Dashboard', '/farmer/dashboard'], ['Farm profile', '/farmer/profile'], ['Add product', '/farmer/products/add'], ['Orders', '/farmer/orders']];
const adminLinks = [['Overview', '/admin'], ['Farmers', '/admin/farmers'], ['Categories', '/admin/categories'], ['Analytics', '/admin/analytics']];

export default function Sidebar({ type = 'farmer' }) {
  const links = type === 'admin' ? adminLinks : farmerLinks;
  return <aside className="rounded-2xl border border-stone-200 bg-white p-4">
    <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-stone-400">{type} workspace</p>
    <div className="grid gap-1">{links.map(([label, to]) => <NavLink key={to} to={to} end className={({ isActive }) => `rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-leaf-50 text-leaf-800' : 'text-stone-600 hover:bg-stone-50'}`}>{label}</NavLink>)}</div>
  </aside>;
}
