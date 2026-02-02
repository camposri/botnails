import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import TimeSavingsSection from "@/components/landing/TimeSavingsSection";
import TutorialSection from "@/components/landing/TutorialSection";
import ContactForm from "@/components/landing/ContactForm";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <TimeSavingsSection />
      <TutorialSection />
      <Testimonials />
      <ContactForm />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;

