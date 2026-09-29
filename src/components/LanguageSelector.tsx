import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check, Sparkles } from 'lucide-react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isPriority?: boolean;
}

export const LANGUAGES: Language[] = [
  // 1. PRIORITÉ ABSOLUE : Bulgare
  {
    code: 'bg',
    name: 'Bulgare',
    nativeName: 'Български',
    flag: '🇧🇬',
    isPriority: true,
  },
  // 2. Langue source : Français
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  // 3. Autres langues spécifiées obligatoires
  {
    code: 'en',
    name: 'Anglais',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'es',
    name: 'Espagnol',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  {
    code: 'de',
    name: 'Allemand',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  {
    code: 'nl',
    name: 'Néerlandais',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
  },
  {
    code: 'hu',
    name: 'Hongrois',
    nativeName: 'Magyar',
    flag: '🇭🇺',
  },
  // 4. Langues européennes complémentaires courantes
  {
    code: 'it',
    name: 'Italien',
    nativeName: 'Italiano',
    flag: '🇮🇹',
  },
  {
    code: 'pt',
    name: 'Portugais',
    nativeName: 'Português',
    flag: '🇵🇹',
  },
  {
    code: 'pl',
    name: 'Polonais',
    nativeName: 'Polski',
    flag: '🇵🇱',
  },
  {
    code: 'ro',
    name: 'Roumain',
    nativeName: 'Română',
    flag: '🇷🇴',
  },
];

// Helper to clear all googtrans cookies across all domains and paths
export function clearAllGoogTransCookies() {
  if (typeof document === 'undefined') return;

  const host = window.location.hostname;
  const hostParts = host ? host.split('.') : [];

  const domains: (string | null)[] = [null, '', host, `.${host}`];

  for (let i = 0; i < hostParts.length - 1; i++) {
    const parent = hostParts.slice(i).join('.');
    domains.push(parent);
    domains.push(`.${parent}`);
  }

  const paths = ['/', window.location.pathname];

  domains.forEach((dom) => {
    paths.forEach((pth) => {
      const d = dom ? `; domain=${dom}` : '';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=${pth}${d};`;
    });
  });

  // Second pass to ensure no lingering cookie remains
  const currentCookies = document.cookie.split(';');
  for (const c of currentCookies) {
    const name = c.split('=')[0]?.trim();
    if (name === 'googtrans') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/;';
    }
  }
}

// Helper to get active language from localStorage (source of truth) or cookie
export function getActiveLanguage(): string {
  if (typeof window === 'undefined') return 'fr';

  // 1. Check localStorage first (priority source of truth)
  const saved = localStorage.getItem('rohr_preferred_lang');
  if (saved) {
    const normalized = saved.toLowerCase().trim();
    if (normalized.length >= 2) return normalized;
  }

  // 2. Fallback to googtrans cookie
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (match && match[1]) {
    const parts = decodeURIComponent(match[1]).split('/');
    const lang = parts[parts.length - 1]?.toLowerCase().trim();
    if (lang && lang.length >= 2 && lang !== 'fr') {
      return lang;
    }
  }

  return 'fr';
}

export function applyLanguageTranslation(targetLang: string) {
  const normalizedLang = targetLang.toLowerCase().trim();

  // 1. Enregistre immédiatement la nouvelle langue dans localStorage
  localStorage.setItem('rohr_preferred_lang', normalizedLang);

  // 2. Nettoie méticuleusement tous les anciens cookies de traduction existants
  clearAllGoogTransCookies();

  // 3. Si la langue cible n'est PAS le français (original), définit le nouveau cookie
  if (normalizedLang !== 'fr') {
    const cookieValue = `/fr/${normalizedLang}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;

    const host = window.location.hostname;
    if (host && host !== 'localhost' && !host.includes('127.0.0.1')) {
      document.cookie = `googtrans=${cookieValue}; path=/; domain=.${host};`;
    }
  }

  // 4. Déclenche immédiatement l'élément select de Google Translate si présent dans le DOM
  const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (combo) {
    combo.value = normalizedLang === 'fr' ? '' : normalizedLang;
    combo.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 5. Recharge la page pour que la nouvelle langue s'applique de manière propre et intégrale
  setTimeout(() => {
    window.location.reload();
  }, 120);
}

interface LanguageSelectorProps {
  className?: string;
  variant?: 'light' | 'dark';
  direction?: 'down' | 'up';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'light',
  direction = 'down',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLangCode, setCurrentLangCode] = useState('fr');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentLangCode(getActiveLanguage());

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentLanguage =
    LANGUAGES.find((l) => l.code === currentLangCode) ||
    LANGUAGES.find((l) => l.code === 'fr') ||
    LANGUAGES[0];

  const handleSelectLanguage = (lang: Language) => {
    setIsOpen(false);
    if (lang.code === currentLangCode) return;
    setCurrentLangCode(lang.code);
    applyLanguageTranslation(lang.code);
  };

  const isDark = variant === 'dark';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button: matches existing header/footer button styles perfectly */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Sélectionner la langue de traduction"
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 ${
          isDark
            ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 focus:ring-slate-500/30'
            : 'text-slate-700 hover:text-blue-700 bg-slate-100/90 hover:bg-slate-200/80 hover:-translate-y-0.5 focus:ring-blue-600/30'
        }`}
        title="Traduire le site / Translate website"
      >
        <Globe className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-700'}`} />
        <span className="text-sm leading-none">{currentLanguage.flag}</span>
        <span className={`uppercase tracking-wider font-bold text-[11px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {currentLanguage.code}
        </span>
        {currentLanguage.isPriority && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300/40" />
        )}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${direction === 'up' ? 'bottom-full mb-2 origin-bottom-right' : 'mt-2 origin-top-right'} right-0 w-64 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 border border-slate-100 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header info */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Traduire le site (i18n)
            </span>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Automatique
            </span>
          </div>

          <div className="py-1 max-h-80 overflow-y-auto space-y-0.5">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLangCode;

              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectLanguage(lang)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50 text-blue-800 font-bold'
                      : lang.isPriority
                      ? 'bg-amber-50/70 hover:bg-amber-100/70 text-slate-800 font-semibold'
                      : 'hover:bg-slate-100/80 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{lang.nativeName}</span>
                        {lang.isPriority && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded tracking-tight">
                            <Sparkles className="w-2.5 h-2.5" />
                            Priorité
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {lang.name} ({lang.code.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-700 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick info note */}
          <div className="mt-1 pt-2 border-t border-slate-100 px-2.5 pb-1 text-[10px] text-slate-400 leading-tight">
            Traduction intégrale en temps réel propulsée par Google Translate.
          </div>
        </div>
      )}
    </div>
  );
};
