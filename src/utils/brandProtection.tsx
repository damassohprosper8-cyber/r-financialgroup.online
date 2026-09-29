import React from 'react';

export const BRAND_REGEX = /(ROHR Financial|ROHR FINANCIAL|R-Financial group|R-Financial Group|R-Financial|ROHR|contact@r-financialgroup\.online|r-financialgroup@outlook\.fr)/g;

/**
 * Empêche la traduction automatique du nom de l'entreprise par Google Translate
 * en injectant les attributs officiels class="notranslate" et translate="no".
 */
export function protectBrand(text: string): React.ReactNode {
  if (!text || typeof text !== 'string') return text;

  const parts = text.split(BRAND_REGEX);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (part.match(BRAND_REGEX)) {
      return (
        <span key={index} className="notranslate" translate="no">
          {part}
        </span>
      );
    }
    return part;
  });
}
