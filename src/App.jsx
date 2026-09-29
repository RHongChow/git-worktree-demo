import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SocialProof from './components/SocialProof';
import Features from './components/Features';
import UseCases from './components/UseCases';
import Pricing from './components/Pricing';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <div className="app">
                <Navbar />
                <main>
                    <Hero />
                    <SocialProof />
                    <Features />
                    <UseCases />
                    <Pricing />
                    <CallToAction />
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
}

export default App;
