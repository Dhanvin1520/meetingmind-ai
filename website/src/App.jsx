import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LogoBar from './components/LogoBar';
import HowItWorks from './components/HowItWorks';
import ArchitectureScene from './components/ArchitectureScene';
import Features from './components/Features';
import Download from './components/Download';
import Footer from './components/Footer';
export default function App() {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Navbar />
      <Hero />
      <LogoBar />
      <HowItWorks />
      <ArchitectureScene />
      <Features />
      <Download />
      <Footer />
    </div>
  );
}
