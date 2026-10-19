import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { useContext } from 'react';
import { CartContext } from '../../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useContext(CartContext);
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate('/'); };
  return <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
      <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-leaf-800"><span className="text-2xl">🌱</span>AnnDaata</Link>
      <div className="flex items-center gap-3 text-sm font-semibold sm:gap-6">
        <NavLink to="/products" className="text-stone-700 hover:text-leaf-700">Shop</NavLink>
        {user?.role === 'consumer' && <NavLink to="/my-orders" className="hidden text-stone-700 hover:text-leaf-700 sm:block">My orders</NavLink>}
        {user?.role === 'farmer' && <NavLink to="/farmer/dashboard" className="text-stone-700 hover:text-leaf-700">Farm</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin" className="text-stone-700 hover:text-leaf-700">Admin</NavLink>}
        {user?.role === 'consumer' && <Link to="/checkout" className="rounded-lg bg-leaf-50 px-3 py-2 text-leaf-800">Cart ({items.reduce((n, item) => n + item.quantity, 0)})</Link>}
        {user ? <button onClick={signOut} className="rounded-lg border px-3 py-2 text-stone-700 hover:bg-stone-50">Sign out</button> : <><Link to="/login" className="text-stone-700">Log in</Link><Link to="/register" className="rounded-lg bg-leaf-700 px-3 py-2 text-white hover:bg-leaf-800">Join us</Link></>}
      </div>
    </nav>
  </header>;
}
