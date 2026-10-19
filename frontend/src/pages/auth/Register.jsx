import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register as registerRequest } from '../../services/authService.js';
import useAuth from '../../hooks/useAuth.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'consumer' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault();
    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email) || form.password.length < 8) return toast.error('Enter a name, valid email and password of at least 8 characters');
    setLoading(true);
    try {
      const data = await registerRequest({ ...form, name: form.name.trim() });
      login(data);
      toast.success('Your account is ready!');
      navigate(form.role === 'farmer' ? '/farmer/profile' : '/');
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setLoading(false); }
  };
  return <main className="mx-auto grid min-h-[75vh] max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-2"><div><p className="font-bold uppercase tracking-widest text-leaf-700">Join our community</p><h1 className="mt-3 text-4xl font-extrabold">Grow together. Eat better.</h1><p className="mt-4 text-stone-600">Create an account to shop local or bring your harvest directly to your community.</p></div>
    <form onSubmit={submit} className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm"><h2 className="mb-6 text-2xl font-bold">Create account</h2><label className="mb-4 block text-sm font-semibold">Full name<input required minLength="2" maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label className="mb-4 block text-sm font-semibold">Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label className="mb-4 block text-sm font-semibold">Password<input type="password" required minLength="8" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1 w-full rounded-xl border p-3" /><span className="mt-1 block text-xs font-normal text-stone-500">Use at least 8 characters.</span></label><label className="mb-6 block text-sm font-semibold">I am joining as<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-1 w-full rounded-xl border p-3"><option value="consumer">A customer</option><option value="farmer">A farmer</option></select></label><button disabled={loading} className="w-full rounded-xl bg-leaf-700 p-3 font-bold text-white disabled:opacity-60">{loading ? 'Creating account…' : 'Create account'}</button><p className="mt-5 text-center text-sm text-stone-600">Already registered? <Link to="/login" className="font-bold text-leaf-700">Log in</Link></p></form>
  </main>;
}
