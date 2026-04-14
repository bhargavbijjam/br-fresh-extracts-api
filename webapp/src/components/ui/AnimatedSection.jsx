import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function AnimatedSection({ children, className = '', delay = 0, direction = 'up' }) {
  const [ref, visible] = useScrollAnimation();

  const baseHidden = {
    up:    'opacity-0 translate-y-8',
    down:  'opacity-0 -translate-y-8',
    left:  'opacity-0 translate-x-8',
    right: 'opacity-0 -translate-x-8',
  }[direction] ?? 'opacity-0 translate-y-8';

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-x-0 translate-y-0' : baseHidden} ${className}`}
    >
      {children}
    </div>
  );
}
