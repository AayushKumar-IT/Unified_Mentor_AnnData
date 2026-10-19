import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login as loginRequest } from '../../services/authService.js';
import useAuth from '../../hooks/useAuth.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const submit = async (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(form.email) || !form.password) return toast.error('Enter a valid email and password');
    setLoading(true);
    try {
      const data = await loginRequest(form);
      login(data);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || (data.user.role === 'farmer' ? '/farmer/dashboard' : data.user.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  };
  return <main className="mx-auto grid min-h-[75vh] max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-2"><div><p className="font-bold uppercase tracking-widest text-leaf-700">Welcome back</p><h1 className="mt-3 text-4xl font-extrabold">Good food starts with good farms.</h1><p className="mt-4 text-stone-600">Sign in to discover your local growers and freshly harvested produce.</p></div>
    <form onSubmit={submit} className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm"><h2 className="mb-6 text-2xl font-bold">Log in</h2><label className="mb-4 block text-sm font-semibold">Email<input type="email" required autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label className="mb-6 block text-sm font-semibold">Password<input type="password" required autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><button disabled={loading} className="w-full rounded-xl bg-leaf-700 p-3 font-bold text-white disabled:opacity-60">{loading ? 'Signing in…' : 'Log in'}</button><p className="mt-5 text-center text-sm text-stone-600">New to AnnDaata? <Link to="/register" className="font-bold text-leaf-700">Create an account</Link></p></form>
  </main>;
}
