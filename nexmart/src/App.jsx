import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import CartDrawer from './components/Cart/CartDrawer';
import Toasts from './components/ui/Toasts';
import ScrollToTop from './components/ui/ScrollToTop';
import ScrollProgressBar from './components/ui/ScrollProgressBar';
import InstallBanner from './components/ui/InstallBanner';
import Router from './Router';
import CompareBar from './components/CompareBar';
import StoreIntro from './components/StoreIntro';

function AppShell() {
  const [cartOpen, setCartOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // PWA install prompt (shows after 3rd visit)
  useEffect(() => {
    const visits = parseInt(localStorage.getItem('nexmart_visits') || '0', 10) + 1;
    localStorage.setItem('nexmart_visits', String(visits));
    const dismissed = localStorage.getItem('nexmart_install_dismissed');

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (visits >= 3 && !dismissed) setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('nexmart_install_dismissed', 'true');
  };

  return (
    <>
      {/* Skip to content link (accessibility) */}
      <a href="#main-content" className="skip-to-content"
        onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}>
        Skip to main content
      </a>

      {/* Scroll progress bar */}
      <ScrollProgressBar progress={scrollProgress} />

      <StoreIntro />
      <div className="min-h-screen dm-bg font-body flex flex-col">
        <Header onCartOpen={() => setCartOpen(true)} />
        <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}
          className="flex-1 pb-14 lg:pb-0">
          <Router />
        </main>
        <Footer />
        <MobileNav />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <Toasts />
        <ScrollToTop progress={scrollProgress} />
        <AuthModal />
        <CompareBar />
        <InstallBanner
          show={showInstallBanner}
          onInstall={handleInstall}
          onDismiss={dismissBanner}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AppProvider>
  );
}
