import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Problems from '@/components/Problems';
import WhyUs from '@/components/WhyUs';
import Services from '@/components/Services';
import Deliverables from '@/components/Deliverables';
import Portfolio from '@/components/Portfolio';
import Testimonials from '@/components/Testimonials';
import LogoMarquee from '@/components/LogoMarquee';
import Packages from '@/components/Packages';
import About from '@/components/About';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import TrustSection from '@/components/TrustSection';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <Problems />
      <WhyUs />
      <Services />
      <Deliverables />
      <Portfolio />
      <Testimonials />
      <TrustSection />
      <LogoMarquee />
      <Packages />
      <About />
      <FAQ />
      <Contact />
      <Footer />
      <BackToTop />
    </main>
  );
}
