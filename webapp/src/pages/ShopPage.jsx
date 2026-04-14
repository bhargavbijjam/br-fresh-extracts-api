import { Search, ShoppingCart, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnimatedSection from '../components/ui/AnimatedSection';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const variants = (product.variants && product.variants.length) ? product.variants : [{ size: product.weight, price: product.price }];
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    addToCart({ ...product, price: selectedVariant.price, weight: selectedVariant.size, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-sand-200 card-hover flex flex-col">
      <div className="relative overflow-hidden h-52">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80'; }}
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-terra-500 text-cream text-xs px-2.5 py-1 rounded-full font-medium">
            Bestseller
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-terra-500 font-medium mb-1 tracking-wide">{product.category}</p>
        <h3 className="font-serif text-lg text-forest-700 mb-1 leading-tight">{product.name}</h3>
        <p className="text-xs text-warm-brown/60 mb-3 line-clamp-2">{product.description}</p>

        {/* Variant & Qty selectors */}
        <div className="flex gap-2 mb-2">
          <select
            value={selectedVariant.size}
            onChange={e => setSelectedVariant(variants.find(v => v.size === e.target.value))}
            className="flex-1 text-xs border border-sand-300 rounded-lg px-2 py-1.5 bg-white text-warm-brown focus:outline-none focus:border-terra-400"
          >
            {variants.map(v => (
              <option key={v.size} value={v.size}>{v.size}</option>
            ))}
          </select>
          <select
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            className="w-16 text-xs border border-sand-300 rounded-lg px-2 py-1.5 bg-white text-warm-brown focus:outline-none focus:border-terra-400"
          >
            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <p className="text-xs text-warm-brown/50 mb-3">
          Total: <span className="text-terra-500 font-semibold">₹{(selectedVariant.price * qty).toLocaleString()}</span>
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-serif text-xl text-terra-500 font-semibold">₹{selectedVariant.price}</span>
            <span className="text-warm-brown/50 text-xs ml-1">/ {selectedVariant.size}</span>
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 ${
              added
                ? 'bg-forest-600 text-cream'
                : 'bg-terra-500 hover:bg-terra-600 text-cream'
            }`}
          >
            <ShoppingCart size={13} />
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { store } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = searchParams.get('cat') || 'All';

  const setCategory = (cat) => {
    if (cat === 'All') searchParams.delete('cat');
    else searchParams.set('cat', cat);
    setSearchParams(searchParams);
  };

  const categories = ['All', ...store.categories.map(c => c.name)];

  const filtered = useMemo(() => {
    return store.products.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [store.products, activeCategory, search]);

  return (
    <div className="pt-20 min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-ivory py-14 px-6 text-center border-b border-sand-200">
        <p className="text-terra-500 tracking-[0.25em] text-xs uppercase font-sans mb-2">All Products</p>
        <h1 className="font-serif text-4xl md:text-5xl text-forest-700">Our Store</h1>
        <p className="text-warm-brown/60 mt-3 text-sm max-w-md mx-auto">Pure, organic goodness — straight from nature to your doorstep.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Search & Filters row */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-brown/40" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-brown/40 hover:text-warm-brown">
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 text-sm text-warm-brown border border-sand-300 px-4 py-2.5 rounded-lg">
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {/* Category tabs */}
        <div className={`flex flex-wrap gap-2 mb-10 ${!showFilters ? 'hidden md:flex' : 'flex'}`}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-terra-500 text-cream shadow-sm'
                  : 'bg-white text-warm-brown border border-sand-300 hover:border-terra-300 hover:text-terra-500'
              }`}
            >{cat}</button>
          ))}
        </div>

        {/* Results info */}
        <p className="text-xs text-warm-brown/50 mb-6 font-sans">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Product grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
              <AnimatedSection key={p.id} delay={i * 50}>
                <ProductCard product={p} />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-forest-600 mb-2">No products found</p>
            <p className="text-warm-brown/50 text-sm">Try a different search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
