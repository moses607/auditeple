import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { checkRateLimit, getRateLimitRemainingSeconds, emailSchema, passwordSchema, displayNameSchema } from '@/lib/security';

export default function Auth() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) errs.email = emailResult.error.errors[0].message;

    if (mode !== 'forgot') {
      const pwResult = passwordSchema.safeParse(password);
      if (!pwResult.success) errs.password = pwResult.error.errors[0].message;
    }

    if (mode === 'signup') {
      const nameResult = displayNameSchema.safeParse(displayName);
      if (!nameResult.success) errs.displayName = nameResult.error.errors[0].message;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const rateLimitKey = `auth_${mode}_${email}`;
    if (!checkRateLimit(rateLimitKey, 5, 60_000)) {
      const remaining = getRateLimitRemainingSeconds(rateLimitKey);
      toast({ title: 'Trop de tentatives', description: `Réessayez dans ${remaining} secondes.`, variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.' });
        setMode('login');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: displayName.trim() },
          },
        });
        if (error) throw error;
        toast({ title: 'Compte créé', description: 'Vérifiez votre email pour confirmer votre inscription.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      // Generic error to prevent user enumeration
      const safeMessage = mode === 'login'
        ? 'Email ou mot de passe incorrect.'
        : err.message;
      toast({ title: 'Erreur', description: safeMessage, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!checkRateLimit('google_signin', 5, 60_000)) {
      toast({ title: 'Trop de tentatives', description: 'Réessayez dans quelques instants.', variant: 'destructive' });
      return;
    }
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: 'Erreur', description: (error as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CIC Expert Pro
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {mode === 'login' && 'Connectez-vous à votre espace'}
            {mode === 'signup' && 'Créez votre compte'}
            {mode === 'forgot' && 'Réinitialisez votre mot de passe'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode !== 'forgot' && (
            <Button
              variant="outline"
              className="w-full h-11 gap-2 text-sm font-medium"
              onClick={handleGoogleSignIn}
              type="button"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </Button>
          )}

          {mode !== 'forgot' && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3" noValidate>
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" placeholder="Jean Dupont" value={displayName} onChange={e => setDisplayName(e.target.value)} className="pl-9" required autoComplete="name" maxLength={100} />
                </div>
                {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="vous@exemple.fr" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" required autoComplete="email" maxLength={255} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-9 pr-9" required minLength={6} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
            )}

            {mode === 'login' && (
              <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">
                Mot de passe oublié ?
              </button>
            )}

            <Button type="submit" className="w-full h-10" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === 'login' && 'Se connecter'}
              {mode === 'signup' && "Créer mon compte"}
              {mode === 'forgot' && 'Envoyer le lien'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {mode === 'login' ? (
              <>Pas encore de compte ?{' '}<button onClick={() => setMode('signup')} className="text-primary hover:underline font-medium">S'inscrire</button></>
            ) : (
              <>Déjà un compte ?{' '}<button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">Se connecter</button></>
            )}
          </p>
          <p className="text-center text-[10px] text-muted-foreground/70 mt-2">
            En vous connectant, vous acceptez notre{' '}
            <Link to="/politique-confidentialite" className="text-primary/70 hover:underline">politique de confidentialité</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
