/**
 * Assistant IA réglementaire — drawer chat global accessible depuis toutes les pages.
 * Connecté à l'edge function ai-assistant (streaming SSE).
 * Contexte : page courante + établissement actif + alertes cockpit principales.
 */
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, X, Loader2, MessageCircleQuestion, Trash2 } from 'lucide-react';
import { useAuditParams } from '@/hooks/useAuditStore';
import { getSelectedEtablissement } from '@/lib/types';
import { aggregateCockpit } from '@/lib/cockpit-aggregator';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://mpexzicaotykelgogdwv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZXh6aWNhb3R5a2VsZ29nZHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODM5MDAsImV4cCI6MjA4ODY1OTkwMH0.-CF0-oJ-jMtt6Hc5-Jh3YvWSNMKKGaH4qfYY1v_-eoc';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  "Quels sont les 5 motifs de suspension de paiement ?",
  "Plafond d'une régie d'avances en restauration ?",
  "Date limite du vote du compte financier ?",
  "Quelles pièces justificatives pour un voyage scolaire ?",
  "Comment justifier le compte 472 ?",
];

const STORAGE_KEY = 'ai_chat_history_v1';

export function AssistantIA() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const location = useLocation();
  const { params } = useAuditParams();
  const etab = getSelectedEtablissement(params);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist (session only — privacy first)
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); }
    catch { /* ignore quota */ }
  }, [messages]);

  // Raccourci clavier : ⌘+J / Ctrl+J
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    setError(null);
    const userMsg: Msg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Contexte applicatif
    const cockpit = aggregateCockpit();
    const context = {
      page: location.pathname,
      etablissement: etab ? `${etab.nom} (${etab.uai})` : undefined,
      anomalies: cockpit.topActions.map(a => `${a.titre} [${a.severity}]`),
    };

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const url = `${SUPABASE_URL}/functions/v1/ai-assistant`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          apikey: SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          context,
        }),
        signal: ac.signal,
      });

      if (resp.status === 429) {
        setError('Quota momentanément dépassé. Réessayez dans quelques instants.');
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        setError('Crédits IA épuisés. Rechargez votre espace de travail.');
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        setError('Erreur de communication avec l\'assistant.');
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantSoFar = '';
      let streamDone = false;

      // Add placeholder assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantSoFar += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return prev;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      console.error('AI error', e);
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="fixed bottom-20 md:bottom-6 right-6 z-40 group rounded-full bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-elevated hover:shadow-card-hover transition-all duration-300 hover:scale-105 px-4 py-3 flex items-center gap-2 no-print"
          aria-label="Assistant IA"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold hidden sm:inline">Assistant IA</span>
          <kbd className="hidden md:inline-flex text-[9px] bg-primary-foreground/20 px-1 rounded border border-primary-foreground/30 ml-1">⌘J</kbd>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-[480px] flex flex-col p-0 gap-0">
        <SheetHeader className="px-4 py-3 border-b shrink-0 bg-gradient-to-r from-primary/10 to-accent/10">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            Assistant réglementaire EPLE
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Expert M9-6 · GBCP · Code éducation · CCP. Sources citées dans chaque réponse.
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1" ref={scrollRef as any}>
          <div className="p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium text-foreground mb-1">👋 Bonjour</p>
                  <p className="text-muted-foreground text-xs">
                    Posez une question sur la réglementation comptable des EPLE. Je connais le GBCP, M9-6, le Code de l'éducation, le CCP, les régies, le RGP…
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suggestions</p>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      className="w-full text-left text-xs px-3 py-2 rounded-md bg-card border border-border hover:bg-muted hover:border-primary/40 transition-colors flex items-start gap-2"
                    >
                      <MessageCircleQuestion className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg p-3 text-sm whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'bg-primary/10 border border-primary/20 ml-6'
                    : 'bg-muted/50 mr-6'
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4">
                    {m.role === 'user' ? 'Vous' : '🤖 Assistant'}
                  </Badge>
                </div>
                <div className="text-foreground/90 leading-relaxed">
                  {m.content || (isLoading && i === messages.length - 1 && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin inline" />
                  ))}
                </div>
              </div>
            ))}

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
                ⚠ {error}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-card p-3 shrink-0 space-y-2">
          {messages.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearChat}
                className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Nouvelle conversation
              </button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Posez votre question…"
              className="resize-none text-sm min-h-[44px] max-h-[120px]"
              rows={1}
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={() => send()}
              disabled={isLoading || !input.trim()}
              className="shrink-0 h-11 w-11"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground text-center">
            L'IA peut commettre des erreurs. Vérifiez toujours auprès des textes officiels.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
