import { Pencil, Plus, Save, Star, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';

const empty = { name: '', location: '', rating: 5, review: '', avatar: '' };

function StarSelector({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={20} className={n <= value ? 'text-terra-400 fill-terra-400' : 'text-sand-300'} />
        </button>
      ))}
    </div>
  );
}

export default function AdminTestimonials() {
  const { store, addTestimonial, updateTestimonial, deleteTestimonial } = useStore();
  const [form, setForm]       = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd  = () => { setForm(empty); setEditing(null); setShowForm(true); };
  const openEdit = (t) => { setForm({ name: t.name, location: t.location, rating: t.rating, review: t.review, avatar: t.avatar }); setEditing(t.id); setShowForm(true); };
  const cancel   = () => { setShowForm(false); setEditing(null); };

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) updateTestimonial(editing, form);
    else addTestimonial(form);
    cancel();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete testimonial from "${name}"?`)) deleteTestimonial(id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-forest-700">Testimonials</h1>
          <p className="text-sm text-warm-brown/60 mt-1">{store.testimonials.length} reviews</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Plus size={16} /> Add Review
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-card mb-6 border-terra-100 bg-terra-50/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-forest-700">{editing ? 'Edit Review' : 'New Review'}</h2>
            <button onClick={cancel} className="p-1.5 rounded-lg hover:bg-sand-200 text-warm-brown/50"><X size={16} /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Customer Name</label>
              <input type="text" required className="input-field" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Location</label>
              <input type="text" className="input-field" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Mumbai" />
            </div>
            <div>
              <label className="label">Avatar Initials (e.g. PS)</label>
              <input type="text" maxLength={2} className="input-field" value={form.avatar} onChange={e => set('avatar', e.target.value.toUpperCase())} placeholder="PS" />
            </div>
            <div>
              <label className="label">Rating</label>
              <StarSelector value={form.rating} onChange={v => set('rating', v)} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Review</label>
              <textarea rows={3} required className="input-field resize-none" value={form.review} onChange={e => set('review', e.target.value)} placeholder="Customer's honest review..." />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2 text-sm py-2.5">
                <Save size={14} /> {editing ? 'Update' : 'Add Review'}
              </button>
              <button type="button" onClick={cancel} className="btn-secondary text-sm py-2.5">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {store.testimonials.map(t => (
          <div key={t.id} className="admin-card flex gap-4">
            <div className="w-10 h-10 rounded-full bg-terra-100 flex items-center justify-center text-terra-600 font-serif font-semibold text-sm shrink-0">
              {t.avatar || t.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-forest-700 text-sm">{t.name}</p>
                  <p className="text-xs text-warm-brown/50">{t.location}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-forest-50 text-warm-brown/50 hover:text-forest-600 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(t.id, t.name)} className="p-2 rounded-lg hover:bg-red-50 text-warm-brown/50 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="flex gap-0.5 my-1.5">
                {[1,2,3,4,5].map(n => <Star key={n} size={12} className={n <= t.rating ? 'text-terra-400 fill-terra-400' : 'text-sand-300'} />)}
              </div>
              <p className="text-sm text-warm-brown/70 italic leading-relaxed">"{t.review}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
