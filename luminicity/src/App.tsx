import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PolesProvider } from "@/contexts/PolesContext";
import { CityHallProvider } from "@/contexts/CityHallContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { useModules } from "@/contexts/ModulesContext";
import { ModuleType } from "@/types/modules";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Complaint from "./pages/Complaint";
import Dashboard from "./pages/Dashboard";
import DashboardMap from "./pages/DashboardMap";
import DashboardComplaints from "./pages/DashboardComplaints";
import DashboardMaintenance from "./pages/DashboardMaintenance";
import DashboardPoles from "./pages/DashboardPoles";
import DashboardUsers from "./pages/DashboardUsers";
import DashboardCityHalls from "./pages/DashboardCityHalls";
import DashboardReports from "./pages/DashboardReports";
import ModuleDashboard from "./pages/modules/ModuleDashboard";
import ModuleMap from "./pages/modules/ModuleMap";
import ModuleOccurrences from "./pages/modules/ModuleOccurrences";
import ModuleMaintenance from "./pages/modules/ModuleMaintenance";
import ModuleComplaints from "./pages/modules/ModuleComplaints";
import ModuleReports from "./pages/modules/ModuleReports";
import CityReport from "./pages/modules/CityReport";
import NotFound from "./pages/NotFound";
import { ReactNode } from "react";

const queryClient = new QueryClient();

type ProtectedPermission =
  | 'approveComplaints'
  | 'manageMaintenance'
  | 'manageUsers'
  | 'manageCityHalls'
  | 'viewReports';

function ProtectedRoute({
  children,
  module,
  useCurrentModule = false,
  permission,
}: {
  children: ReactNode;
  module?: ModuleType;
  useCurrentModule?: boolean;
  permission?: ProtectedPermission;
}) {
  const {
    isAuthenticated,
    canAccessModule,
    canApproveComplaints,
    canManageMaintenance,
    canManageUsers,
    canManageCityHalls,
    canViewReports,
  } = useAuth();
  const { currentModule } = useModules();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const moduleToCheck = useCurrentModule ? currentModule : module;
  if (moduleToCheck && !canAccessModule(moduleToCheck)) {
    return <Navigate to="/dashboard" replace />;
  }

  const hasRequiredPermission =
    !permission ||
    (permission === 'approveComplaints' && canApproveComplaints()) ||
    (permission === 'manageMaintenance' && canManageMaintenance()) ||
    (permission === 'manageUsers' && canManageUsers()) ||
    (permission === 'manageCityHalls' && canManageCityHalls()) ||
    (permission === 'viewReports' && canViewReports());

  if (!hasRequiredPermission) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/denuncia" element={<Complaint />} />
      
      {/* Protected Dashboard Routes — Iluminação (existing) */}
      <Route path="/dashboard" element={<ProtectedRoute module="ILUMINACAO"><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/mapa" element={<ProtectedRoute module="ILUMINACAO"><DashboardMap /></ProtectedRoute>} />
      <Route path="/dashboard/denuncias" element={<ProtectedRoute module="ILUMINACAO" permission="approveComplaints"><DashboardComplaints /></ProtectedRoute>} />
      <Route path="/dashboard/manutencao" element={<ProtectedRoute module="ILUMINACAO" permission="manageMaintenance"><DashboardMaintenance /></ProtectedRoute>} />
      <Route path="/dashboard/postes" element={<ProtectedRoute module="ILUMINACAO"><DashboardPoles /></ProtectedRoute>} />
      <Route path="/dashboard/usuarios" element={<ProtectedRoute permission="manageUsers"><DashboardUsers /></ProtectedRoute>} />
      <Route path="/dashboard/prefeituras" element={<ProtectedRoute permission="manageCityHalls"><DashboardCityHalls /></ProtectedRoute>} />
      <Route path="/dashboard/relatorios" element={<ProtectedRoute module="ILUMINACAO" permission="viewReports"><DashboardReports /></ProtectedRoute>} />
      
      {/* Module Routes */}
      <Route path="/dashboard/modulo" element={<ProtectedRoute useCurrentModule><ModuleDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/modulo/mapa" element={<ProtectedRoute useCurrentModule><ModuleMap /></ProtectedRoute>} />
      <Route path="/dashboard/modulo/denuncias" element={<ProtectedRoute useCurrentModule permission="approveComplaints"><ModuleComplaints /></ProtectedRoute>} />
      <Route path="/dashboard/modulo/ocorrencias" element={<ProtectedRoute useCurrentModule><ModuleOccurrences /></ProtectedRoute>} />
      <Route path="/dashboard/modulo/atendimentos" element={<ProtectedRoute useCurrentModule permission="manageMaintenance"><ModuleMaintenance /></ProtectedRoute>} />
      <Route path="/dashboard/modulo/relatorios" element={<ProtectedRoute useCurrentModule permission="viewReports"><ModuleReports /></ProtectedRoute>} />
      <Route path="/dashboard/relatorio-geral" element={<ProtectedRoute permission="viewReports"><CityReport /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CityHallProvider>
        <ModulesProvider>
          <PolesProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </PolesProvider>
        </ModulesProvider>
      </CityHallProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
