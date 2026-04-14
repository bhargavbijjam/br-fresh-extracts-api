import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedSection from '../components/ui/AnimatedSection';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-sand-200 card-hover flex flex-col min-w-[240px] max-w-[280px]">
      <div className="relative overflow-hidden h-52">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80'; }}
        />
        <span className="absolute top-3 left-3 bg-terra-500 text-cream text-xs px-2.5 py-1 rounded-full font-medium">
          {product.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg text-forest-700 mb-1 leading-tight">{product.name}</h3>
        <p className="text-xs text-warm-brown/60 mb-3 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-serif text-xl text-terra-500 font-semibold">₹{product.price}</span>
            <span className="text-warm-brown/50 text-xs ml-1">/ {product.weight}</span>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 bg-forest-600 hover:bg-terra-500 text-cream text-xs font-medium px-3.5 py-2 rounded-full transition-colors duration-200"
          >
            <ShoppingCart size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const { store } = useStore();
  const featured = store.products.filter(p => p.featured);

  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-terra-500 tracking-[0.25em] text-xs uppercase font-sans mb-3">Bestsellers</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link to="/shop" className="btn-ghost flex items-center gap-1.5 shrink-0">
            View All <ArrowRight size={15} />
          </Link>
        </AnimatedSection>

        {/* Horizontal scroll */}
        <div className="flex gap-6 overflow-x-auto scroll-hide pb-4 -mx-2 px-2">
          {featured.map((p, i) => (
            <AnimatedSection key={p.id} delay={i * 80} className="shrink-0">
              <ProductCard product={p} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
