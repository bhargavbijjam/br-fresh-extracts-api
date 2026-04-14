import CategoriesSection from '../sections/CategoriesSection';
import FeaturedProducts from '../sections/FeaturedProducts';
import HeroSection from '../sections/HeroSection';
import Newsletter from '../sections/Newsletter';
import Testimonials from '../sections/Testimonials';
import WhyChooseUs from '../sections/WhyChooseUs';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </>
  );
}
