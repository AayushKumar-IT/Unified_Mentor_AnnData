import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/common/Sidebar.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getMyFarmerProfile, saveFarmerProfile } from '../../services/farmerService.js';
import { getErrorMessage } from '../../utils/helpers.js';

const initialForm = { farmName: '', farmLocation: '', cropTypes: [], farmingMethod: 'organic', bio: '' };
const crops = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs', 'Pulses'];

export default function FarmerProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [exists, setExists] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const loadProfile = () => {
    setLoading(true);
    setLoadError('');
    getMyFarmerProfile()
      .then((profile) => { setExists(true); setVerified(profile.isVerified); setForm({ farmName: profile.farmName, farmLocation: profile.farmLocation, cropTypes: profile.cropTypes || [], farmingMethod: profile.farmingMethod, bio: profile.bio || '' }); })
      .catch((error) => {
        if (error.response?.status === 404) {
          setExists(false);
          setForm(initialForm);
        } else {
          setLoadError(getErrorMessage(error));
        }
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadProfile(); }, []);
  const toggleCrop = (crop) => setForm((current) => ({ ...current, cropTypes: current.cropTypes.includes(crop) ? current.cropTypes.filter((item) => item !== crop) : [...current.cropTypes, crop] }));
  const submit = async (event) => {
    event.preventDefault();
    if (form.farmName.trim().length < 2 || form.farmLocation.trim().length < 2 || !form.cropTypes.length) return toast.error('Add your farm name, location and at least one crop type');
    setSaving(true);
    try {
      const profile = await saveFarmerProfile({ ...form, farmName: form.farmName.trim(), farmLocation: form.farmLocation.trim() }, exists);
      setExists(true); setVerified(profile.isVerified);
      toast.success(exists ? 'Farm profile updated' : 'Farm profile created and submitted for verification');
      navigate('/farmer/dashboard');
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setSaving(false); }
  };
  if (loading) return <LoadingSpinner />;
  if (loadError) return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar /><section className="rounded-2xl border border-red-200 bg-red-50 p-7"><h1 className="text-2xl font-extrabold text-red-900">We couldn’t load your farm profile.</h1><p className="mt-2 text-red-800">{loadError}</p><button onClick={loadProfile} className="mt-5 rounded-xl bg-red-800 px-4 py-2.5 font-bold text-white hover:bg-red-900">Try again</button></section></main>;
  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6"><Sidebar /><section><p className="font-bold text-leaf-700">YOUR FARM</p><h1 className="mt-1 text-3xl font-extrabold">Farm profile</h1><p className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-bold ${verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{verified ? '✓ Verified farmer' : 'Pending verification'}</p><form onSubmit={submit} className="mt-5 grid gap-4 rounded-2xl border bg-white p-6 md:grid-cols-2"><label className="text-sm font-semibold">Farm name<input required value={form.farmName} onChange={(event) => setForm({ ...form, farmName: event.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold">Farm location<input required value={form.farmLocation} onChange={(event) => setForm({ ...form, farmLocation: event.target.value })} className="mt-1 w-full rounded-xl border p-3" placeholder="Town, district" /></label><label className="text-sm font-semibold">Farming method<select value={form.farmingMethod} onChange={(event) => setForm({ ...form, farmingMethod: event.target.value })} className="mt-1 w-full rounded-xl border p-3"><option value="organic">Organic</option><option value="conventional">Conventional</option></select></label><fieldset><legend className="text-sm font-semibold">What do you grow?</legend><div className="mt-2 flex flex-wrap gap-2">{crops.map((crop) => <label key={crop} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${form.cropTypes.includes(crop) ? 'border-leaf-700 bg-leaf-50 text-leaf-800' : ''}`}><input type="checkbox" checked={form.cropTypes.includes(crop)} onChange={() => toggleCrop(crop)} className="sr-only" />{crop}</label>)}</div></fieldset><label className="text-sm font-semibold md:col-span-2">About your farm<textarea maxLength="2000" rows="5" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} className="mt-1 w-full rounded-xl border p-3" placeholder="Tell customers about how you farm…" /></label><button disabled={saving} className="rounded-xl bg-leaf-700 p-3 font-bold text-white disabled:opacity-60 md:col-span-2">{saving ? 'Saving…' : exists ? 'Save profile' : 'Create farm profile'}</button></form></section></main>;
}
