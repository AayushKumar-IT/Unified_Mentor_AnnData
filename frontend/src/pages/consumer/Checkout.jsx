import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CartContext } from '../../context/CartContext.jsx';
import { getSavedAddresses } from '../../services/addressService.js';
import { placeOrder } from '../../services/orderService.js';
import { currency, getErrorMessage } from '../../utils/helpers.js';

const initialForm = {
  street: '',
  addressLine2: '',
  city: '',
  region: '',
  postalCode: '',
  deliverySlot: ''
};

const fieldClass = 'mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-leaf-600 focus:ring-2 focus:ring-leaf-100';

function localDateTimeValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default function Checkout() {
  const { items, cartTotal, removeFromCart, clearCart } = useContext(CartContext);
  const [form, setForm] = useState(initialForm);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSavedAddresses()
      .then((addresses) => {
        setSavedAddresses(addresses);
        if (addresses.length) setSelectedAddressId(addresses[0].id);
      })
      .catch((error) => toast.error(`Could not load saved addresses: ${getErrorMessage(error)}`))
      .finally(() => setLoadingAddresses(false));
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const deliveryAddress = [
    form.street,
    form.addressLine2,
    form.city,
    form.region,
    form.postalCode
  ].map((part) => part.trim()).filter(Boolean).join(', ');

  const submit = async (event) => {
    event.preventDefault();
    if (!items.length) return;
    if (selectedAddressId !== 'new' && !savedAddresses.some((address) => address.id === selectedAddressId)) {
      toast.error('Select a saved address or enter a new one');
      return;
    }
    if (selectedAddressId === 'new' && (!form.street.trim() || !form.city.trim() || !form.region.trim() || !form.postalCode.trim())) {
      toast.error('Complete all required delivery address fields');
      return;
    }
    if (!form.deliverySlot || new Date(form.deliverySlot) <= new Date()) {
      toast.error('Choose a delivery time in the future');
      return;
    }

    setLoading(true);
    try {
      await placeOrder({
        items: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
        ...(selectedAddressId === 'new' ? { deliveryAddress } : { savedAddressId: selectedAddressId }),
        deliverySlot: form.deliverySlot
      });
      clearCart();
      toast.success('Order placed successfully');
      navigate('/my-orders');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const minDate = localDateTimeValue(new Date(Date.now() + 60 * 60 * 1000));

  if (!items.length) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl font-extrabold">Checkout</h1>
        <div className="mt-8 rounded-2xl bg-white p-8 text-center">
          Your cart is empty.{' '}
          <Link to="/products" className="font-bold text-leaf-700">Browse the market</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-extrabold">Checkout</h1>
      <p className="mt-2 text-stone-600">Check your basket and tell the farmer where and when to deliver.</p>

      <div className="mt-8 grid items-start gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-bold">Your basket</h2>
          <div className="mt-3 divide-y divide-stone-100">
            {items.map((item) => (
              <div key={item._id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold">{item.name} × {item.quantity} {item.unit}</p>
                  <p className="mt-1 text-sm text-stone-500">{currency(item.price * item.quantity)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item._id)}
                  className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 flex justify-between border-t border-stone-200 pt-4 text-lg font-extrabold">
            <span>Order total</span><span>{currency(cartTotal)}</span>
          </p>
          <p className="mt-2 text-xs text-stone-500">Each order can include products from one farm.</p>
        </section>

        <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-bold">Delivery details</h2>
          <p className="mt-1 text-sm text-stone-600">Choose an address you have used before or enter a new one.</p>

          <div className="mt-5 space-y-3">
            {loadingAddresses && <p className="text-sm text-stone-500">Loading your saved addresses…</p>}
            {savedAddresses.map((address) => (
              <label
                key={address.id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                  selectedAddressId === address.id
                    ? 'border-leaf-700 bg-leaf-50 ring-1 ring-leaf-700'
                    : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryAddressChoice"
                  value={address.id}
                  checked={selectedAddressId === address.id}
                  onChange={() => setSelectedAddressId(address.id)}
                  className="mt-1 accent-leaf-700"
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-stone-900">{address.label}</span>
                  <span className="mt-1 block break-words text-sm font-normal text-stone-600">{address.address}</span>
                </span>
              </label>
            ))}

            <button
              type="button"
              onClick={() => setSelectedAddressId('new')}
              className={`w-full rounded-xl border p-3 text-left font-semibold transition ${
                selectedAddressId === 'new'
                  ? 'border-leaf-700 bg-leaf-50 text-leaf-900 ring-1 ring-leaf-700'
                  : 'border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              + Deliver to a new address
            </button>
          </div>

          {selectedAddressId === 'new' && (
            <div className="mt-4 space-y-4 rounded-xl bg-stone-50 p-4">
              <p className="text-sm text-stone-600">Your address will be saved to your account after the order is placed.</p>
              <label className="block text-sm font-semibold text-stone-800">
                House / building and street <span className="text-red-600">*</span>
                <input
                  required
                  maxLength={200}
                  autoComplete="address-line1"
                  name="street"
                  value={form.street}
                  onChange={updateField}
                  className={fieldClass}
                  placeholder="e.g. 12 Green Street"
                />
              </label>

              <label className="block text-sm font-semibold text-stone-800">
                Apartment, floor, or landmark <span className="font-normal text-stone-500">(optional)</span>
                <input
                  maxLength={200}
                  autoComplete="address-line2"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={updateField}
                  className={fieldClass}
                  placeholder="e.g. Apartment 4B, near the library"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-stone-800">
                  City / town <span className="text-red-600">*</span>
                  <input
                    required
                    maxLength={100}
                    autoComplete="address-level2"
                    name="city"
                    value={form.city}
                    onChange={updateField}
                    className={fieldClass}
                    placeholder="City or town"
                  />
                </label>
                <label className="block text-sm font-semibold text-stone-800">
                  State / region <span className="text-red-600">*</span>
                  <input
                    required
                    maxLength={100}
                    autoComplete="address-level1"
                    name="region"
                    value={form.region}
                    onChange={updateField}
                    className={fieldClass}
                    placeholder="State or region"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-stone-800">
                Postal / ZIP code <span className="text-red-600">*</span>
                <input
                  required
                  maxLength={20}
                  autoComplete="postal-code"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={updateField}
                  className={fieldClass}
                  placeholder="Postal or ZIP code"
                />
              </label>
            </div>
          )}

          <label className="mt-5 block text-sm font-semibold text-stone-800">
            Preferred delivery date and time <span className="text-red-600">*</span>
            <input
              required
              type="datetime-local"
              min={minDate}
              name="deliverySlot"
              value={form.deliverySlot}
              onChange={updateField}
              className={fieldClass}
            />
          </label>

          <button
            type="submit"
            disabled={loading || loadingAddresses}
            className="mt-6 w-full rounded-xl bg-leaf-700 p-3 font-bold text-white transition hover:bg-leaf-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Placing order…' : `Place order · ${currency(cartTotal)}`}
          </button>
        </form>
      </div>
    </main>
  );
}
