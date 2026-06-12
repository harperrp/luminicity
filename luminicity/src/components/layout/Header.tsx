import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import radgovLogo from '@/assets/radgov-logo.png';
import { roleLabels } from '@/lib/permissions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={radgovLogo} alt="RAD GOV - Plataforma GovTech" className="h-12 w-auto object-contain" />
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-foreground">IluminaCity</span>
            <span className="block text-[11px] text-muted-foreground">Gestão Inteligente de Iluminação Pública</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-secondary transition-all duration-200">
            Início
          </Link>
          <Link to="/denuncia" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-secondary transition-all duration-200">
            Fazer Denúncia
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-secondary transition-all duration-200">
              Painel
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-secondary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user ? roleLabels[user.role] : ''}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    Painel de Controle
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm" className="glow-primary">
                Entrar
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/30 bg-card/95 backdrop-blur-xl animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            <Link
              to="/"
              className="px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-secondary transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/denuncia"
              className="px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-secondary transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fazer Denúncia
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-secondary transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Painel de Controle
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
