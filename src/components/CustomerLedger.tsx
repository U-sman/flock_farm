import React, { useState } from 'react';
import { Users, Plus, Trash2, Pencil } from 'lucide-react';
import { Customer, CustomerSale, Lang } from '../types';
import { t } from '../i18n';
import { customerBalance } from '../utils/calculations';

interface CustomerLedgerProps {
  lang: Lang;
  customers: Customer[];
  sales: CustomerSale[];
  defaultPricePerEgg: number;
  onAddCustomer: (c: Omit<Customer, 'id'>) => void;
  onUpdateCustomer: (id: number, c: Customer) => void;
  onDeleteCustomer: (id: number) => void;
  onAddSale: (s: Omit<CustomerSale, 'id'>) => void;
  onUpdateSale: (id: number, s: CustomerSale) => void;
  onDeleteSale: (id: number) => void;
  canDelete: boolean;
}

export default function CustomerLedger({
  lang,
  customers,
  sales,
  defaultPricePerEgg,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddSale,
  onUpdateSale,
  onDeleteSale,
  canDelete,
}: CustomerLedgerProps) {
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [editCustId, setEditCustId] = useState<number | null>(null);

  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [saleCustomerId, setSaleCustomerId] = useState('');
  const [saleEggs, setSaleEggs] = useState('');
  const [salePrice, setSalePrice] = useState(String(defaultPricePerEgg));
  const [salePaid, setSalePaid] = useState('');
  const [editSaleId, setEditSaleId] = useState<number | null>(null);

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;
    const data = {
      name: custName.trim(),
      phone: custPhone.trim() || undefined,
      email: custEmail.trim() || undefined,
    };
    if (editCustId) {
      onUpdateCustomer(editCustId, { id: editCustId, ...data });
      setEditCustId(null);
    } else {
      onAddCustomer(data);
    }
    setCustName('');
    setCustPhone('');
    setCustEmail('');
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cid = parseInt(saleCustomerId);
    const qty = parseInt(saleEggs);
    const price = parseFloat(salePrice);
    const paid = parseFloat(salePaid) || 0;
    if (!cid || !qty || qty <= 0 || !price) return alert('Fill all sale fields');

    const data = {
      customerId: cid,
      date: saleDate,
      eggsQty: qty,
      pricePerEgg: price,
      amountPaid: paid,
    };
    if (editSaleId) {
      onUpdateSale(editSaleId, { id: editSaleId, ...data });
      setEditSaleId(null);
    } else {
      onAddSale(data);
    }
    setSaleEggs('');
    setSalePaid('');
  };

  const getCustomerSales = (id: number) => sales.filter((s) => s.customerId === id);
  const balance = (id: number) => customerBalance(getCustomerSales(id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5" /> {t(lang, 'customers')}
        </h2>
        <p className="text-xs text-slate-500">Track buyers, egg sales, and outstanding balances.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleCustomerSubmit} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border space-y-3 text-xs">
          <h3 className="font-bold">{editCustId ? t(lang, 'edit') : t(lang, 'add')} Customer</h3>
          <input required placeholder="Name" value={custName} onChange={(e) => setCustName(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
          <input placeholder="Phone" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
          <input placeholder="Email" value={custEmail} onChange={(e) => setCustEmail(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold">{t(lang, 'save')}</button>
        </form>

        <form onSubmit={handleSaleSubmit} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border space-y-3 text-xs">
          <h3 className="font-bold">Log Sale</h3>
          <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
          <select required value={saleCustomerId} onChange={(e) => setSaleCustomerId(e.target.value)} className="w-full px-3 py-2 border rounded-xl">
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" min="1" placeholder="Eggs" value={saleEggs} onChange={(e) => setSaleEggs(e.target.value)} className="px-2 py-2 border rounded-xl" />
            <input type="number" step="0.1" placeholder="Rs/egg" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="px-2 py-2 border rounded-xl" />
            <input type="number" placeholder="Paid" value={salePaid} onChange={(e) => setSalePaid(e.target.value)} className="px-2 py-2 border rounded-xl" />
          </div>
          <button type="submit" className="w-full py-2 bg-green-700 text-white rounded-xl font-semibold">{t(lang, 'save')}</button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 text-3xs uppercase text-slate-500">
              <th className="p-3">Customer</th>
              <th className="p-3">Contact</th>
              <th className="p-3 text-right">Balance Due</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {customers.map((c) => {
              const bal = balance(c.id);
              return (
                <tr key={c.id}>
                  <td className="p-3 font-semibold">{c.name}</td>
                  <td className="p-3 text-slate-500">{c.phone || c.email || '—'}</td>
                  <td className={`p-3 text-right font-mono font-bold ${bal > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    Rs {bal.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => { setEditCustId(c.id); setCustName(c.name); setCustPhone(c.phone ?? ''); setCustEmail(c.email ?? ''); }} className="p-1 text-slate-400 hover:text-indigo-600"><Pencil className="w-4 h-4" /></button>
                    {canDelete && (
                      <button type="button" onClick={() => { if (confirm('Delete customer?')) onDeleteCustomer(c.id); }} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {sales.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden">
          <h4 className="p-3 font-bold text-sm border-b">Recent Sales</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-3xs uppercase text-slate-500">
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Eggs</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map((s) => {
                const cust = customers.find((c) => c.id === s.customerId);
                return (
                  <tr key={s.id}>
                    <td className="p-3 font-mono">{s.date}</td>
                    <td className="p-3">{cust?.name ?? '—'}</td>
                    <td className="p-3">{s.eggsQty}</td>
                    <td className="p-3 text-right font-mono">Rs {(s.eggsQty * s.pricePerEgg).toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">Rs {s.amountPaid.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      {canDelete && (
                        <button type="button" onClick={() => { if (confirm('Delete sale?')) onDeleteSale(s.id); }} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
