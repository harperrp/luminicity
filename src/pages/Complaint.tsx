import { ComplaintForm } from '@/components/forms/ComplaintForm';
import { AlertTriangle, Shield, Clock, CheckCircle, Zap, Wifi } from 'lucide-react';
import radgovLogo from '@/assets/radgov-logo.png';

const steps = [
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: 'Selecione o tipo',
    description: 'Escolha sua cidade e o tipo de problema que deseja reportar.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Preencha seus dados',
    description: 'Informe seus dados para validação da denúncia.',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: 'Aguarde análise',
    description: 'A secretaria irá analisar sua denúncia em até 48 horas.',
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: 'Problema resolvido',
    description: 'Técnicos serão enviados para resolver o problema.',
  },
];

export default function Complaint() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Global animated background grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-orb-drift" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-orb-drift" style={{ animationDelay: '-3s' }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-primary/3 blur-3xl animate-orb-drift" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Header + Hero */}
      <section className="relative z-10 border-b border-border/20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/6 via-background/80 to-background" />
        
        <div className="container relative py-12 lg:py-16">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo with glow ring */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border border-primary/10 animate-pulse-ring" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-52 h-52 rounded-full border border-primary/5 animate-pulse-ring" style={{ animationDelay: '-1.2s' }} />
              </div>
              
              <div className="relative p-6">
                <img 
                  src={radgovLogo} 
                  alt="RAD GOV" 
                  className="h-24 lg:h-28 w-auto object-contain drop-shadow-[0_0_40px_hsl(var(--primary)/0.35)]" 
                />
              </div>
            </div>

            {/* Brand name */}
            <div>
              <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.4em] uppercase text-primary/60">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/40" />
                <Zap className="h-3 w-3 text-primary" />
                <span>RAD GOV</span>
                <Zap className="h-3 w-3 text-primary" />
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/40" />
              </div>
            </div>

            {/* Title */}
            <div className="max-w-xl space-y-4">
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
                Reporte um{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                    Problema Urbano
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
                  </span>
                </span>
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base leading-relaxed max-w-md mx-auto">
                Ajude a manter sua cidade melhor. Informe problemas urbanos 
                e acompanhe a resolução em tempo real.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="relative z-10 py-8 border-b border-border/20 bg-card/20">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="group relative flex items-start gap-3 p-4 rounded-xl bg-card/40 border border-border/20 hover:border-primary/30 hover:bg-card/60 transition-all duration-300"
              >
                <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)] transition-all duration-300">
                  {step.icon}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="relative z-10 flex-1 py-12 lg:py-16">
        <div className="container max-w-3xl">
          <div className="relative rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm p-6 lg:p-8 shadow-2xl shadow-primary/5">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />
            
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <h2 className="text-xl font-semibold text-foreground">Formulário de Denúncia</h2>
            </div>
            <ComplaintForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/20 bg-card/30 py-10">
        <div className="container flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
            </div>
            <img src={radgovLogo} alt="RAD GOV" className="relative h-20 lg:h-24 w-auto object-contain drop-shadow-[0_0_30px_hsl(var(--primary)/0.25)]" />
          </div>
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-primary/30" />
            <Wifi className="h-3.5 w-3.5 text-primary/40" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-primary/30" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm text-muted-foreground">
              Plataforma desenvolvida por <span className="text-primary font-semibold">RAD Tecnologia</span>
            </p>
            <p className="text-[11px] text-muted-foreground/40 tracking-wide">
              Infraestrutura AWS · Todos os direitos reservados · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
