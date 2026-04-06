import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { Shield, X } from 'lucide-react';

const CONSENT_KEY = 'cic_expert_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = (level: 'all' | 'essential') => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ level, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl shadow-lg p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-foreground">Protection de vos données</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ce site utilise des cookies essentiels au fonctionnement de l'application (session, préférences).
              Aucune donnée n'est partagée avec des tiers à des fins publicitaires.
              Consultez notre{' '}
              <NavLink to="/politique-confidentialite" className="text-primary hover:underline">
                politique de confidentialité
              </NavLink>{' '}
              pour plus d'informations.
            </p>
          </div>
          <button onClick={() => accept('essential')} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => accept('essential')} className="text-xs">
            Cookies essentiels uniquement
          </Button>
          <Button size="sm" onClick={() => accept('all')} className="text-xs">
            Tout accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
