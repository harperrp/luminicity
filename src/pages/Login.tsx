import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
import radgovLogo from '@/assets/radgov-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const demoAccounts = [
  { email: 'admin@sistema.gov.br', password: 'admin123', role: 'Administrador Geral', description: 'Acesso total ao sistema', color: 'bg-primary' },
  { email: 'prefeitura@cidade.gov.br', password: 'prefeitura123', role: 'Admin. Prefeitura', description: 'Gestão municipal', color: 'bg-primary/70' },
  { email: 'secretario@cidade.gov.br', password: 'secretario123', role: 'Secretário', description: 'Validar denúncias', color: 'bg-accent' },
  { email: 'tecnico@cidade.gov.br', password: 'tecnico123', role: 'Técnico', description: 'Executa manutenções', color: 'bg-success' },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    const success = await login(data.email, data.password);
    
    setIsLoading(false);
    
    if (success) {
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } else {
      toast.error('Credenciais inválidas', {
        description: 'Verifique seu e-mail e senha.',
      });
    }
  };

  const handleDemoSelect = (account: typeof demoAccounts[0]) => {
    setSelectedDemo(account.email);
    setValue('email', account.email);
    setValue('password', account.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <img src={radgovLogo} alt="RAD GOV - Plataforma GovTech" className="h-16 w-auto object-contain" />
              <div className="text-left">
                <span className="text-xl font-bold block">IluminaCity</span>
              </div>
            </Link>
            
            <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
            <p className="text-muted-foreground mt-2">
              Acesse o sistema de gestão de iluminação pública
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.gov.br"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full glow-primary" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Acesso Rápido para Demonstração
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleDemoSelect(account)}
                className={`relative text-left p-3 rounded-xl border transition-all duration-200 ${
                  selectedDemo === account.email 
                    ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-sm' 
                    : 'border-border/50 bg-card hover:bg-secondary hover:border-border'
                }`}
              >
                {selectedDemo === account.email && (
                  <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
                <div className={`w-2 h-2 rounded-full ${account.color} mb-2`} />
                <p className="text-sm font-medium">{account.role}</p>
                <p className="text-xs text-muted-foreground">{account.description}</p>
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            É cidadão?{' '}
            <Link to="/denuncia" className="text-primary hover:underline font-medium">
              Faça uma denúncia
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative max-w-lg text-primary-foreground text-center space-y-6">
          <div className="flex items-center justify-center mb-8">
            <img src={radgovLogo} alt="RAD GOV - Plataforma GovTech" className="h-24 w-auto object-contain" />
          </div>

          <div className="h-20 w-20 mx-auto rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-primary/30">
            <Lightbulb className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold">
            Gestão Inteligente de Iluminação Pública
          </h2>
          <p className="text-lg text-foreground/60">
            Transforme a forma como sua prefeitura gerencia a iluminação pública. 
            Reduza custos, melhore o tempo de resposta e aumente a satisfação dos cidadãos.
          </p>
          
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="p-4 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/10">
              <p className="text-3xl font-bold">60%</p>
              <p className="text-sm text-foreground/50">Mais rápido</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/10">
              <p className="text-3xl font-bold">95%</p>
              <p className="text-sm text-foreground/50">Resolução</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/10">
              <p className="text-3xl font-bold">40%</p>
              <p className="text-sm text-foreground/50">Economia</p>
            </div>
          </div>

          <div className="pt-6 text-sm text-foreground/40">
            <p>✓ LGPD Compliance &nbsp; ✓ Multi-tenant &nbsp; ✓ Suporte 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
