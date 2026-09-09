import React, { useState, useEffect } from 'react';
import { ProjectType } from './types';
import { LegalBanner } from './components/LegalBanner';
import { Header } from './components/Header';
import { HeroSimulator } from './components/HeroSimulator';
import { ReassuranceBand } from './components/ReassuranceBand';
import { LoanTypesGrid } from './components/LoanTypesGrid';
import { HowItWorks } from './components/HowItWorks';
import { CustomerReviews } from './components/CustomerReviews';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { ApplicationModal } from './components/ApplicationModal';
import { BackOfficeModal } from './components/BackOfficeModal';
import { ConfirmationPage } from './components/ConfirmationPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname;
  });

  const [selectedProject, setSelectedProject] = useState<ProjectType>('auto');
  const [isAppModalOpen, setIsAppModalOpen] = useState<boolean>(false);
  const [isBackOfficeOpen, setIsBackOfficeOpen] = useState<boolean>(false);

  const [isLegalBannerVisible, setIsLegalBannerVisible] = useState(true);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (url: string) => {
    window.history.pushState({}, '', url);
    const pathOnly = url.split('?')[0];
    setCurrentPath(pathOnly);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLegalBannerVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const [modalParams, setModalParams] = useState({
    project: 'auto' as ProjectType,
    amount: 25000,
    months: 48,
    withInsurance: false,
  });

  // Secret Back-Office Trigger Listener (Keyboard shortcut & Secret Hash/URL query)
  useEffect(() => {
    // 1. Check if URL contains #admin or ?admin=true
    const checkSecretUrl = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#admin' || params.get('admin') === 'true') {
        setIsBackOfficeOpen(true);
        // Clean hash from URL bar to remain discreet
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    checkSecretUrl();
    window.addEventListener('hashchange', checkSecretUrl);

    // 2. Secret Keyboard Shortcut: Ctrl + Shift + A / Cmd + Shift + A OR Alt + Shift + B
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsBackOfficeOpen((prev) => !prev);
      } else if (e.altKey && e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        e.preventDefault();
        setIsBackOfficeOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkSecretUrl);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleStartApplication = (
    project: ProjectType,
    amount: number,
    months: number,
    withInsurance: boolean
  ) => {
    setModalParams({ project, amount, months, withInsurance });
    setIsAppModalOpen(true);
  };

  const handleSelectAndSimulate = (project: ProjectType) => {
    setSelectedProject(project);
    if (currentPath !== '/') {
      navigateTo('/');
      setTimeout(() => {
        const simulatorEl = document.getElementById('simulateur');
        if (simulatorEl) {
          simulatorEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const simulatorEl = document.getElementById('simulateur');
      if (simulatorEl) {
        simulatorEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleOpenSimulator = () => {
    if (currentPath !== '/') {
      navigateTo('/');
      setTimeout(() => {
        const simulatorEl = document.getElementById('simulateur');
        if (simulatorEl) {
          simulatorEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const simulatorEl = document.getElementById('simulateur');
      if (simulatorEl) {
        simulatorEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Bandeau légal réglementaire supérieur */}
      <LegalBanner isVisible={isLegalBannerVisible} />

      {/* 2. Header & Navigation */}
      <Header
        isBannerVisible={isLegalBannerVisible}
        onOpenSimulator={handleOpenSimulator}
        onSecretAdminTrigger={() => setIsBackOfficeOpen(true)}
      />

      {/* Main Content: Confirmation page OR Standard landing & simulator */}
      {currentPath === '/confirmation' ? (
        <ConfirmationPage onNavigateHome={() => navigateTo('/')} />
      ) : (
        <main className="flex-1">
          {/* 3. Hero Section & Interactive Loan Simulator */}
          <HeroSimulator
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onStartApplication={handleStartApplication}
          />

          {/* 4. Bandeau de réassurance / Trust Pillars */}
          <ReassuranceBand />

          {/* 5. Grille des types de projets et offres de crédits */}
          <LoanTypesGrid onSelectAndSimulate={handleSelectAndSimulate} />

          {/* 6. Explication du fonctionnement en 3 étapes */}
          <HowItWorks onStartSimulation={handleOpenSimulator} />

          {/* 7. Témoignages clients vérifiés */}
          <CustomerReviews />

          {/* 8. FAQ & Engagements de Sécurité */}
          <FaqSection />
        </main>
      )}

      {/* 9. Footer Légal (Discreet secret admin trigger on copyright) */}
      <Footer onSecretAdminTrigger={() => setIsBackOfficeOpen(true)} />

      {/* 10. Modale Tunnel de souscription en ligne (Accord de principe en 3 min) */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        project={modalParams.project}
        amount={modalParams.amount}
        months={modalParams.months}
        withInsurance={modalParams.withInsurance}
        onRedirectToConfirmation={(reference) => {
          setIsAppModalOpen(false);
          navigateTo(`/confirmation?ref=${encodeURIComponent(reference)}`);
        }}
      />

      {/* 11. Modale Back-Office & Administration (Confidentielle & Protégée par code PIN) */}
      <BackOfficeModal
        isOpen={isBackOfficeOpen}
        onClose={() => setIsBackOfficeOpen(false)}
      />
    </div>
  );
}
