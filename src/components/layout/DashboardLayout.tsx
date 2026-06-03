import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  Wrench,
  FileText,
  ChevronRight,
  Cloud,
  Boxes,
  Lock,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { useModules } from '@/contexts/ModulesContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { roleLabels } from '@/lib/permissions';
import { ALL_MODULES, MODULE_CONFIGS, ModuleType } from '@/types/modules';
import radgovLogo from '@/assets/radgov-logo.png';

type NavPermission =
  | 'approveComplaints'
  | 'manageMaintenance'
  | 'manageUsers'
  | 'manageCityHalls'
  | 'viewReports';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  module?: ModuleType | 'current';
  permission?: NavPermission;
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    user,
    logout,
    canAccessModule,
    canApproveComplaints,
    canManageMaintenance,
    canManageUsers,
    canManageCityHalls,
    canViewReports,
  } = useAuth();
  const { activeCityHall } = useCityHall();
  const { currentModule, setCurrentModule, isModuleActive } = useModules();
  const location = useLocation();
  const navigate = useNavigate();

  const isOnModulePage = location.pathname.startsWith('/dashboard/modulo');
  const isIluminacao = currentModule === 'ILUMINACAO';

  const iluminacaoNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, module: 'ILUMINACAO' },
    { label: 'Mapa de Postes', href: '/dashboard/mapa', icon: <MapPin className="h-5 w-5" />, module: 'ILUMINACAO' },
    { label: 'Denuncias', href: '/dashboard/denuncias', icon: <AlertTriangle className="h-5 w-5" />, module: 'ILUMINACAO', permission: 'approveComplaints' },
    { label: 'Manutencao', href: '/dashboard/manutencao', icon: <Wrench className="h-5 w-5" />, module: 'ILUMINACAO', permission: 'manageMaintenance' },
    { label: 'Postes', href: '/dashboard/postes', icon: <Lightbulb className="h-5 w-5" />, module: 'ILUMINACAO' },
    { label: 'Relatorios', href: '/dashboard/relatorios', icon: <FileText className="h-5 w-5" />, module: 'ILUMINACAO', permission: 'viewReports' },
  ];

  const moduleNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard/modulo', icon: <LayoutDashboard className="h-5 w-5" />, module: 'current' },
    { label: 'Mapa', href: '/dashboard/modulo/mapa', icon: <MapPin className="h-5 w-5" />, module: 'current' },
    { label: 'Denuncias', href: '/dashboard/modulo/denuncias', icon: <AlertTriangle className="h-5 w-5" />, module: 'current', permission: 'approveComplaints' },
    { label: 'Manutencao', href: '/dashboard/modulo/atendimentos', icon: <Wrench className="h-5 w-5" />, module: 'current', permission: 'manageMaintenance' },
    { label: 'Ocorrencias', href: '/dashboard/modulo/ocorrencias', icon: <AlertTriangle className="h-5 w-5" />, module: 'current' },
    { label: 'Relatorios', href: '/dashboard/modulo/relatorios', icon: <FileText className="h-5 w-5" />, module: 'current', permission: 'viewReports' },
  ];

  const systemNavItems: NavItem[] = [
    { label: 'Usuarios', href: '/dashboard/usuarios', icon: <Users className="h-5 w-5" />, permission: 'manageUsers' },
    { label: 'Prefeituras', href: '/dashboard/prefeituras', icon: <Building2 className="h-5 w-5" />, permission: 'manageCityHalls' },
    { label: 'Relatorio Geral', href: '/dashboard/relatorio-geral', icon: <BarChart3 className="h-5 w-5" />, permission: 'viewReports' },
  ];

  const hasNavPermission = (permission?: NavPermission) => {
    if (!permission) return true;
    if (permission === 'approveComplaints') return canApproveComplaints();
    if (permission === 'manageMaintenance') return canManageMaintenance();
    if (permission === 'manageUsers') return canManageUsers();
    if (permission === 'manageCityHalls') return canManageCityHalls();
    if (permission === 'viewReports') return canViewReports();
    return false;
  };

  const canShowItem = (item: NavItem) => {
    const moduleId = item.module === 'current' ? currentModule : item.module;
    if (moduleId && !canAccessModule(moduleId)) return false;
    return hasNavPermission(item.permission);
  };

  const currentNavItems = isOnModulePage && !isIluminacao ? moduleNavItems : iluminacaoNavItems;
  const filteredNavItems = currentNavItems.filter(canShowItem);
  const filteredSystemItems = systemNavItems.filter(canShowItem);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleModuleClick = (moduleId: ModuleType) => {
    if (!isModuleActive(activeCityHall.id, moduleId) || !canAccessModule(moduleId)) return;
    setCurrentModule(moduleId);
    navigate(moduleId === 'ILUMINACAO' ? '/dashboard' : '/dashboard/modulo');
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-card/95 backdrop-blur-xl px-4 lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img src={radgovLogo} alt="RAD GOV" className="h-12 w-auto object-contain" />
          <span className="font-bold text-foreground text-sm">RAD GOV</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-[272px] transform border-r border-border/30 bg-sidebar transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            <div className="hidden lg:flex flex-col items-center justify-center px-5 pt-6 pb-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-primary/8 blur-2xl" />
                </div>
                <div className="relative p-4">
                  <img src={radgovLogo} alt="RAD GOV - Plataforma GovTech" className="h-24 w-auto object-contain drop-shadow-[0_0_30px_hsl(var(--primary)/0.3)]" />
                </div>
              </div>
            </div>

            <div className="border-y border-sidebar-border/50 px-5 py-4 mt-16 lg:mt-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/20">
                  <span className="text-sm font-semibold text-primary">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user ? roleLabels[user.role] : ''}</p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-sidebar-border/30">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                <Boxes className="h-3 w-3 inline mr-1" />
                Modulos
              </p>
              <div className="grid grid-cols-3 gap-1">
                {ALL_MODULES.map(moduleId => {
                  const config = MODULE_CONFIGS[moduleId];
                  const Icon = config.icon;
                  const isTenantActive = isModuleActive(activeCityHall.id, moduleId);
                  const hasUserAccess = canAccessModule(moduleId);
                  const canOpen = isTenantActive && hasUserAccess;
                  const isCurrent = currentModule === moduleId;

                  return (
                    <button
                      key={moduleId}
                      onClick={() => handleModuleClick(moduleId)}
                      title={canOpen ? config.shortName : `${config.shortName} - Sem acesso`}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition-all duration-200',
                        isCurrent && canOpen
                          ? 'bg-primary/15 text-primary'
                          : canOpen
                            ? 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                            : 'text-muted-foreground/40 cursor-not-allowed'
                      )}
                    >
                      {canOpen ? <Icon className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                      <span className="truncate w-full text-center leading-tight">{config.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-3">
                {isOnModulePage && !isIluminacao ? MODULE_CONFIGS[currentModule].shortName : 'Iluminacao'}
              </p>
              <ul className="space-y-1">
                {filteredNavItems.map(item => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary/15 text-primary shadow-sm'
                            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <span className={cn('transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground')}>
                          {item.icon}
                        </span>
                        {item.label}
                        {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary/60" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {filteredSystemItems.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 mt-6 px-3">Sistema</p>
                  <ul className="space-y-1">
                    {filteredSystemItems.map(item => {
                      const isActive = location.pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                              isActive
                                ? 'bg-primary/15 text-primary shadow-sm'
                                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                            )}
                          >
                            <span className={cn('transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground')}>
                              {item.icon}
                            </span>
                            {item.label}
                            {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary/60" />}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </nav>

            <div className="border-t border-sidebar-border/50 p-4 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
              >
                <Lightbulb className="h-5 w-5" />
                Pagina Inicial
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </div>

            <div className="px-5 py-4 border-t border-sidebar-border/30">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                <Cloud className="h-3 w-3" />
                <span>Infraestrutura em nuvem AWS</span>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto min-h-screen flex flex-col">
          <div className="container py-6 lg:py-8 space-y-4 flex-1 animate-fade-in">
            {children}
          </div>

          <footer className="border-t border-border/30 px-6 py-4">
            <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/60">
              <p>RAD GOV © {new Date().getFullYear()} · Plataforma de Gestao Urbana Inteligente</p>
              <div className="flex items-center gap-1.5">
                <Cloud className="h-3 w-3" />
                <span>Infraestrutura em nuvem AWS</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
