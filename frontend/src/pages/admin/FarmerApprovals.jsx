import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../../components/common/Sidebar.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getAdminFarmers, reviewFarmer } from '../../services/farmerService.js';
import { dateLabel, getErrorMessage } from '../../utils/helpers.js';

function FarmerCard({ farmer, busy, onReview }) {
  const account = farmer.userId || {};
  return <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-extrabold text-stone-900">{farmer.farmName}</h3>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${farmer.isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
            {farmer.isVerified ? 'Verified' : 'Pending verification'}
          </span>
        </div>
        <p className="mt-1 text-sm text-stone-600">{farmer.farmLocation} · {farmer.farmingMethod}</p>
      </div>
      {!farmer.isVerified && <div className="flex shrink-0 gap-2">
        <button disabled={busy} onClick={() => onReview(farmer, false)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50">{busy ? 'Saving…' : 'Reject'}</button>
        <button disabled={busy} onClick={() => onReview(farmer, true)} className="rounded-lg bg-leaf-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Approve'}</button>
      </div>}
    </div>
    <dl className="mt-4 grid gap-x-5 gap-y-3 border-t border-stone-100 pt-4 text-sm sm:grid-cols-2">
      <div><dt className="font-semibold text-stone-500">Farmer account</dt><dd className="mt-0.5 text-stone-800">{account.name || '—'}</dd></div>
      <div><dt className="font-semibold text-stone-500">Email</dt><dd className="mt-0.5 break-all text-stone-800">{account.email || '—'}</dd></div>
      <div><dt className="font-semibold text-stone-500">Crops grown</dt><dd className="mt-0.5 text-stone-800">{farmer.cropTypes?.join(', ') || 'Not provided'}</dd></div>
      <div><dt className="font-semibold text-stone-500">Profile submitted</dt><dd className="mt-0.5 text-stone-800">{dateLabel(farmer.createdAt)}</dd></div>
      <div className="sm:col-span-2"><dt className="font-semibold text-stone-500">About the farm</dt><dd className="mt-0.5 whitespace-pre-wrap text-stone-800">{farmer.bio || 'No farm description provided.'}</dd></div>
      <div className="sm:col-span-2"><dt className="font-semibold text-stone-500">Verification document</dt><dd className="mt-0.5">{farmer.verificationDocs ? <a className="font-bold text-leaf-700 underline" href={farmer.verificationDocs} target="_blank" rel="noreferrer">View document ↗</a> : <span className="text-stone-500">Not provided</span>}</dd></div>
    </dl>
  </article>;
}

export default function FarmerApprovals() {
  const [farmers, setFarmers] = useState(null);
  const [busy, setBusy] = useState('');
  const [loadError, setLoadError] = useState('');

  const refresh = () => {
    setFarmers(null);
    setLoadError('');
    getAdminFarmers()
      .then(setFarmers)
      .catch((error) => setLoadError(getErrorMessage(error)));
  };

  useEffect(() => { refresh(); }, []);

  const decide = async (farmer, approved) => {
    setBusy(farmer._id);
    try {
      await reviewFarmer(farmer._id, approved);
      if (approved) {
        setFarmers((current) => current.map((item) => item._id === farmer._id ? { ...item, isVerified: true } : item));
      } else {
        setFarmers((current) => current.filter((item) => item._id !== farmer._id));
      }
      toast.success(approved ? 'Farmer approved and moved to verified farmers' : 'Application rejected');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy('');
    }
  };

  if (!farmers && !loadError) return <LoadingSpinner />;

  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr] sm:px-6">
    <Sidebar type="admin" />
    <section className="min-w-0">
      <p className="font-bold text-leaf-700">FARMER DIRECTORY</p>
      <h1 className="mt-1 text-3xl font-extrabold">Farmers</h1>
      <p className="mt-2 text-stone-600">Review new applications and browse all verified farm profiles.</p>

      {loadError ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-extrabold text-red-900">We couldn’t load farmers.</h2>
        <p className="mt-2 text-red-800">{loadError}</p>
        <button onClick={refresh} className="mt-4 rounded-lg bg-red-800 px-4 py-2 font-bold text-white">Try again</button>
      </div> : <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
        <section aria-labelledby="pending-farmers-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="pending-farmers-heading" className="text-xl font-extrabold">Not verified</h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">{farmers.filter((farmer) => !farmer.isVerified).length} pending</span>
          </div>
          <div className="grid gap-4">
            {farmers.filter((farmer) => !farmer.isVerified).map((farmer) => <FarmerCard key={farmer._id} farmer={farmer} busy={busy === farmer._id} onReview={decide} />)}
            {!farmers.some((farmer) => !farmer.isVerified) && <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-sm text-stone-600">No farmer applications are waiting for review.</p>}
          </div>
        </section>
        <section aria-labelledby="verified-farmers-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="verified-farmers-heading" className="text-xl font-extrabold">Verified farmers</h2>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">{farmers.filter((farmer) => farmer.isVerified).length} verified</span>
          </div>
          <div className="grid gap-4">
            {farmers.filter((farmer) => farmer.isVerified).map((farmer) => <FarmerCard key={farmer._id} farmer={farmer} busy={false} onReview={decide} />)}
            {!farmers.some((farmer) => farmer.isVerified) && <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-sm text-stone-600">Approved farms will appear here.</p>}
          </div>
        </section>
      </div>}
    </section>
  </main>;
}
