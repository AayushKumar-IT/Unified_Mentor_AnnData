import { useState } from 'react';
import { currency, dateLabel } from '../../utils/helpers.js';

export default function OrderCard({ order, children }) {
  const [expanded, setExpanded] = useState(false);
  return <article className="rounded-2xl border border-stone-200 bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold">Order #{order._id.slice(-7).toUpperCase()}</p><p className="text-sm text-stone-500">{dateLabel(order.createdAt)} · {order.farmerId?.farmName || 'Farm'}</p></div><span className="rounded-full bg-leaf-50 px-3 py-1 text-sm font-semibold capitalize text-leaf-800">{order.status}</span><strong>{currency(order.totalAmount)}</strong></div>
    <button className="mt-3 text-sm font-semibold text-leaf-700" onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide items' : 'View items'}</button>
    {expanded && <div className="mt-3 divide-y">{order.items.map((item) => <div className="flex justify-between py-2 text-sm" key={item._id || item.productId?._id}><span>{item.productId?.name || 'Product'} × {item.quantity}</span><span>{currency(item.price * item.quantity)}</span></div>)}</div>}
    {children}
  </article>;
}
