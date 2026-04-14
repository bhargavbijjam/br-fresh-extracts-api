import { Leaf, Pencil, Plus, Save, ShieldCheck, Sprout, Trash2, Truck, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';

const iconOptions = [
  { value: 'leaf',   label: 'Leaf',   Icon: Leaf },
  { value: 'sprout', label: 'Sprout', Icon: Sprout },
  { value: 'shield', label: 'Shield', Icon: ShieldCheck },
  { value: 'truck',  label: 'Truck',  Icon: Truck },
  { value: 'zap',    label: 'Zap',    Icon: Zap },
];

const iconMap = { leaf: Leaf, sprout: Sprout, shield: ShieldCheck, truck: Truck, zap: Zap };

const empty = { title: '', description: '', icon: 'leaf' };

export default function AdminWhyUs() {
  const { store, addWhyUs, updateWhyUs, deleteWhyUs } = useStore();
  const [form, setForm]       = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd  = () => { setForm(empty); setEditing(null); setShowForm(true); };
  const openEdit = (w) => { setForm({ title: w.title, description: w.description, icon: w.icon }); setEditing(w.id); setShowForm(true); };
  const cancel   = () => { setShowForm(false); setEditing(null); };

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) updateWhyUs(editing, form);
    else addWhyUs(form);
    cancel();
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) deleteWhyUs(id);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-forest-700">Why Choose Us</h1>
          <p className="text-sm text-warm-brown/60 mt-1">{store.whyUs.length} feature points</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Plus size={16} /> Add Point
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-card mb-6 border-terra-100 bg-terra-50/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-forest-700">{editing ? 'Edit Point' : 'New Point'}</h2>
            <button onClick={cancel} className="p-1.5 rounded-lg hover:bg-sand-200 text-warm-brown/50"><X size={16} /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input type="text" required className="input-field" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. No Artificial Flavours" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={2} required className="input-field resize-none" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div>
              <label className="label">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {iconOptions.map(({ value, label, Icon }) => (
                  <button key={value} type="button" onClick={() => set('icon', value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                      form.icon === value
                        ? 'bg-terra-50 border-terra-300 text-terra-600'
                        : 'border-sand-200 text-warm-brown/60 hover:border-terra-200'
                    }`}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2 text-sm py-2.5">
                <Save size={14} /> {editing ? 'Update' : 'Add Point'}
              </button>
              <button type="button" onClick={cancel} className="btn-secondary text-sm py-2.5">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {store.whyUs.map(w => {
          const Icon = iconMap[w.icon] || Leaf;
          return (
            <div key={w.id} className="admin-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-terra-50 border border-terra-100 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-terra-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-forest-700 text-sm">{w.title}</p>
                <p className="text-xs text-warm-brown/55 truncate mt-0.5">{w.description}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => openEdit(w)} className="p-2 rounded-lg hover:bg-forest-50 text-warm-brown/50 hover:text-forest-600 transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(w.id, w.title)} className="p-2 rounded-lg hover:bg-red-50 text-warm-brown/50 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
