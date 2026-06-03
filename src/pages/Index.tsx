import { Link } from 'react-router-dom';
import { 
  Lightbulb, 
  MapPin, 
  AlertTriangle, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Building2,
  Clock,
  BarChart3,
  Shield,
  Zap,
  Phone,
  Mail,
  Star,
  TrendingDown,
  Timer,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Mapa Interativo',
    description: 'Visualize todos os postes da cidade em um mapa real com status em tempo real e geolocalização precisa.',
  },
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: 'Denúncias Simplificadas',
    description: 'Cidadãos podem reportar problemas de iluminação com apenas alguns cliques, direto do celular.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Gestão de Equipes',
    description: 'Controle técnicos, secretários e administradores com 5 níveis de acesso hierárquico.',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Resposta Rápida',
    description: 'Fluxo otimizado para aprovação e manutenção de postes defeituosos em tempo recorde.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Relatórios Completos',
    description: 'Dashboard com métricas detalhadas e exportação de relatórios em PDF e Excel.',
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: 'Multi-Prefeitura',
    description: 'Suporte a múltiplos municípios com isolamento total e seguro de dados.',
  },
];

const stats = [
  { value: '60%', label: 'Redução no tempo de atendimento', icon: <Timer className="h-5 w-5" /> },
  { value: '95%', label: 'Taxa de resolução de denúncias', icon: <Target className="h-5 w-5" /> },
  { value: '40%', label: 'Economia em custos operacionais', icon: <TrendingDown className="h-5 w-5" /> },
  { value: '24h', label: 'Tempo médio de manutenção', icon: <Zap className="h-5 w-5" /> },
];

const benefits = [
  'Redução de 60% no tempo de atendimento',
  'Controle total dos postes por geolocalização',
  'Histórico completo de manutenções',
  'Transparência para a população',
  'Relatórios gerenciais automáticos',
  'Proteção contra denúncias falsas',
];

const steps = [
  {
    number: '01',
    title: 'Cidadão Reporta',
    description: 'O cidadão identifica um poste com problema e faz a denúncia pelo app com foto e localização automática.',
  },
  {
    number: '02',
    title: 'Secretário Valida',
    description: 'O secretário municipal recebe a denúncia, analisa e aprova ou rejeita com justificativa.',
  },
  {
    number: '03',
    title: 'Técnico Executa',
    description: 'A equipe técnica visualiza no mapa, realiza o reparo e atualiza o status no sistema.',
  },
  {
    number: '04',
    title: 'Dados Consolidados',
    description: 'Gestores acompanham métricas em tempo real e geram relatórios para prestação de contas.',
  },
];

const testimonials = [
  {
    quote: 'Com o IluminaCity, conseguimos reduzir o tempo de resposta às denúncias de 5 dias para apenas 18 horas. A população percebeu a diferença.',
    author: 'Maria Silva',
    role: 'Secretária de Infraestrutura',
    city: 'Prefeitura de São José dos Campos',
  },
  {
    quote: 'O sistema nos deu visibilidade total sobre a situação da iluminação pública. Agora tomamos decisões baseadas em dados reais.',
    author: 'Carlos Santos',
    role: 'Prefeito Municipal',
    city: 'Prefeitura de Ribeirão Preto',
  },
  {
    quote: 'A ferramenta é intuitiva e nossos técnicos de campo adoraram. O mapa interativo facilita muito o trabalho diário.',
    author: 'Ana Costa',
    role: 'Coordenadora de Manutenção',
    city: 'Prefeitura de Campinas',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="container relative py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Lightbulb className="h-3 w-3 mr-1" />
              Sistema de Gestão de Iluminação Pública
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Iluminando o caminho para uma cidade mais segura
            </h1>
            
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Plataforma completa para prefeituras gerenciarem postes de iluminação pública, 
              atenderem denúncias de cidadãos e coordenarem equipes técnicas com eficiência.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="xl" variant="hero" className="w-full sm:w-auto shadow-lg">
                  Acessar Demonstração
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/denuncia">
                <Button size="xl" variant="heroOutline" className="w-full sm:w-auto">
                  Ver como Cidadão
                </Button>
              </Link>
            </div>

            <p className="text-sm text-white/60">
              ✓ Teste gratuito &nbsp; ✓ Sem cartão de crédito &nbsp; ✓ Suporte dedicado
            </p>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-6 relative z-10">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-3 text-primary">
                  {stat.icon}
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Funcionalidades</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Tudo que sua prefeitura precisa
            </h2>
            <p className="text-lg text-muted-foreground">
              Uma solução completa para gerenciar a iluminação pública de forma eficiente e transparente.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Como Funciona</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Fluxo simples e eficiente
            </h2>
            <p className="text-lg text-muted-foreground">
              Do registro da denúncia à conclusão do reparo, tudo integrado e rastreável.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 transform translate-x-1/2">
                    <ArrowRight className="h-6 w-6 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Benefícios</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Transforme a gestão de iluminação do seu município
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Com o IluminaCity, sua prefeitura terá controle total sobre os postes de iluminação, 
                desde o cadastro até a manutenção, com total transparência para a população.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <span className="font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link to="/login">
                  <Button size="lg">
                    Experimentar Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border shadow-2xl overflow-hidden">
                <div className="absolute inset-4 rounded-lg bg-card border shadow-lg overflow-hidden">
                  <div className="h-8 bg-muted border-b flex items-center gap-2 px-3">
                    <div className="w-3 h-3 rounded-full bg-destructive/50" />
                    <div className="w-3 h-3 rounded-full bg-warning/50" />
                    <div className="w-3 h-3 rounded-full bg-success/50" />
                    <span className="text-xs text-muted-foreground ml-2">IluminaCity - Dashboard</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 rounded bg-muted animate-pulse" />
                      ))}
                    </div>
                    <div className="h-32 rounded bg-muted animate-pulse" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-24 rounded bg-muted animate-pulse" />
                      <div className="h-24 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-card rounded-lg shadow-lg border p-4 max-w-[200px]">
                <div className="flex items-center gap-2 text-success mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Manutenção concluída</span>
                </div>
                <p className="text-xs text-muted-foreground">Poste #1234 - Centro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Depoimentos</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              O que dizem nossos clientes
            </h2>
            <p className="text-lg text-muted-foreground">
              Prefeituras que já transformaram sua gestão de iluminação pública.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t pt-4">
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-sm text-primary">{testimonial.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-card border">
                  <Shield className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">LGPD Compliance</h4>
                  <p className="text-sm text-muted-foreground">Totalmente adequado à Lei Geral de Proteção de Dados</p>
                </div>
                <div className="p-6 rounded-xl bg-card border">
                  <Building2 className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">Multi-tenant</h4>
                  <p className="text-sm text-muted-foreground">Isolamento total de dados entre prefeituras</p>
                </div>
                <div className="p-6 rounded-xl bg-card border">
                  <Users className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">Controle de Acesso</h4>
                  <p className="text-sm text-muted-foreground">5 níveis hierárquicos de permissão</p>
                </div>
                <div className="p-6 rounded-xl bg-card border">
                  <BarChart3 className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">Auditoria</h4>
                  <p className="text-sm text-muted-foreground">Logs completos de todas as ações</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge variant="outline" className="mb-4">Segurança & Conformidade</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Seus dados protegidos com os mais altos padrões
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                O IluminaCity foi desenvolvido com foco em segurança desde o início. 
                Cada prefeitura tem seus dados completamente isolados e protegidos.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Criptografia de ponta a ponta
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Backups automáticos diários
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Hospedagem em servidores brasileiros
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="rounded-2xl gradient-primary p-8 lg:p-12 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative">
              <h2 className="text-2xl lg:text-4xl font-bold mb-4">
                Pronto para transformar a iluminação da sua cidade?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Agende uma demonstração personalizada e veja como o IluminaCity pode 
                revolucionar a gestão de iluminação pública do seu município.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto shadow-lg">
                    Acessar Demonstração
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="heroOutline" className="w-full sm:w-auto" asChild>
                  <a href="mailto:contato@iluminacity.com.br">
                    <Mail className="mr-2 h-4 w-4" />
                    Falar com Consultor
                  </a>
                </Button>
              </div>
              <p className="text-sm text-white/60 mt-6">
                <Phone className="inline h-4 w-4 mr-1" />
                Ou ligue: (11) 99999-9999
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
