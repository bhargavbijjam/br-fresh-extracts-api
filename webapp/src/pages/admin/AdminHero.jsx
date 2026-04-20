import { Eye, Save } from 'lucide-react';
import { useState } from 'react';
import ImageUpload from '../../components/ui/ImageUpload';
import { useStore } from '../../contexts/StoreContext';

export default function AdminHero() {
  const { store, updateHero } = useStore();
  const [form, setForm] = useState({ ...store.hero });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    updateHero(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-forest-700">Hero Section</h1>
          <p className="text-sm text-warm-brown/60 mt-1">Edit the full-screen banner on the homepage.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-warm-brown/60 hover:text-terra-500 transition-colors">
          <Eye size={14} /> Preview
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="admin-card space-y-5">
          <div>
            <label className="label">Title</label>
            <textarea rows={2} className="input-field resize-none"
              value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Pure from Nature,\nCrafted for You" />
            <p className="text-xs text-warm-brown/40 mt-1">Use \n for a line break in the display</p>
          </div>
          <div>
            <label className="label">Subtitle / Description</label>
            <textarea rows={3} className="input-field resize-none"
              value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
          </div>
          <div>
            <label className="label">CTA Button Text</label>
            <input type="text" className="input-field"
              value={form.ctaText} onChange={e => set('ctaText', e.target.value)} />
          </div>
          <div>
            <label className="label">"View All Products" Link Text</label>
            <input type="text" className="input-field"
              value={form.viewAllText || ''} onChange={e => set('viewAllText', e.target.value)}
              placeholder="View All Products" />
          </div>
        </div>

        <div className="admin-card space-y-5">
          <h2 className="font-serif text-lg text-forest-700">Top Tagline</h2>
          <div>
            <label className="label">Tagline Text</label>
            <input type="text" className="input-field"
              value={form.tagline || ''} onChange={e => set('tagline', e.target.value)}
              placeholder="100% Organic · Farm to Table · Hyderabad" />
            <p className="text-xs text-warm-brown/40 mt-1">Shown above the main title in small caps.</p>
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-serif text-lg text-forest-700">Trust Badges</h2>
          <p className="text-xs text-warm-brown/50 -mt-1">The three badges at the bottom of the hero section.</p>
          {[['trustBadge1', 'Badge 1', 'FSSAI Certified'], ['trustBadge2', 'Badge 2', 'Farm Fresh'], ['trustBadge3', 'Badge 3', 'Pan India Delivery']].map(([key, label, placeholder]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type="text" className="input-field"
                value={form[key] || ''} onChange={e => set(key, e.target.value)}
                placeholder={placeholder} />
            </div>
          ))}
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-serif text-lg text-forest-700">Background Image</h2>
          <div>
            <label className="label">Background Image</label>
            <ImageUpload value={form.backgroundImage} onChange={v => set('backgroundImage', v)} previewClass="h-44 w-full object-cover" />
          </div>
        </div>

        <button type="submit"
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
            saved ? 'bg-forest-600 text-cream' : 'bg-terra-500 hover:bg-terra-600 text-cream'
          }`}>
          <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
