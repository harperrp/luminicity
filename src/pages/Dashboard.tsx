import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ModuleSelector } from '@/components/modules/ModuleSelector';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PoleMap } from '@/components/map/PoleMap';
import { ComplaintsList } from '@/components/dashboard/ComplaintsList';
import { useAuth } from '@/contexts/AuthContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { useModules } from '@/contexts/ModulesContext';
import { Navigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const statusData = [
  { name: 'Funcionando', value: 142, color: 'hsl(142, 72%, 35%)' },
  { name: 'Queimados', value: 34, color: 'hsl(0, 72%, 51%)' },
];

const monthlyData = [
  { month: 'Jan', denuncias: 45, resolvidas: 42 },
  { month: 'Fev', denuncias: 52, resolvidas: 48 },
  { month: 'Mar', denuncias: 38, resolvidas: 35 },
  { month: 'Abr', denuncias: 65, resolvidas: 58 },
  { month: 'Mai', denuncias: 48, resolvidas: 45 },
  { month: 'Jun', denuncias: 55, resolvidas: 52 },
];

export default function Dashboard() {
  const { canApproveComplaints, canViewReports } = useAuth();
  const { activeCityHall } = useCityHall();
  const { currentModule } = useModules();
  
  // If not on iluminação, redirect to module dashboard
  if (currentModule !== 'ILUMINACAO') {
    return <Navigate to="/dashboard/modulo" replace />;
  }

  const canViewComplaints = canApproveComplaints();
  const canViewFullStats = canViewReports();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <ModuleSelector />
        
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Dashboard — Iluminação</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de iluminação pública
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Postes"
            value="176"
            description="Cadastrados no sistema"
            icon={<Lightbulb className="h-6 w-6" />}
            variant="default"
          />
          <StatsCard
            title="Postes Funcionando"
            value="142"
            description="80.7% do total"
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Postes Queimados"
            value="34"
            description="Aguardando manutenção"
            icon={<AlertTriangle className="h-6 w-6" />}
            variant="destructive"
            trend={{ value: 12, isPositive: false }}
          />
          <StatsCard
            title="Tempo Médio"
            value="18h"
            description="Para resolução"
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Charts Row */}
        {canViewFullStats && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Postes</CardTitle>
                <CardDescription>Distribuição atual por status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Denúncias por Mês</CardTitle>
                <CardDescription>Comparativo de denúncias recebidas e resolvidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="denuncias" name="Denúncias" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolvidas" name="Resolvidas" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}


        {/* Map Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de Postes
            </CardTitle>
            <CardDescription>Visualização geográfica dos postes por status</CardDescription>
          </CardHeader>
          <CardContent>
            <PoleMap center={[activeCityHall.latitude, activeCityHall.longitude]} />
          </CardContent>
        </Card>

        {/* Recent Complaints */}
        {canViewComplaints && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Denúncias Recentes
              </CardTitle>
              <CardDescription>Últimas denúncias recebidas dos cidadãos</CardDescription>
            </CardHeader>
            <CardContent>
              <ComplaintsList bannedCpfs={new Set()} onBanCpf={() => {}} onUnbanCpf={() => {}} />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
