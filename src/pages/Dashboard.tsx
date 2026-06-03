import { useEffect, useMemo, useState } from 'react';
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
import { usePoles } from '@/contexts/PolesContext';
import { api } from '@/lib/api';
import { Complaint } from '@/types';
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

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function Dashboard() {
  const { canApproveComplaints, canViewReports } = useAuth();
  const { activeCityHall } = useCityHall();
  const { currentModule } = useModules();
  const { poles } = usePoles();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    let mounted = true;

    api.getComplaints({ cityHallId: activeCityHall.id, moduleId: 'ILUMINACAO' })
      .then((items) => {
        if (mounted) setComplaints(items);
      })
      .catch(() => {
        if (mounted) setComplaints([]);
      });

    return () => {
      mounted = false;
    };
  }, [activeCityHall.id]);

  const monthlyData = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
      const monthComplaints = complaints.filter((complaint) =>
        complaint.createdAt.getMonth() === month && complaint.createdAt.getFullYear() === year
      );

      return {
        month: MONTH_LABELS[month],
        denuncias: monthComplaints.length,
        resolvidas: monthComplaints.filter((complaint) => complaint.status !== 'PENDENTE').length,
      };
    });
  }, [complaints]);

  const answeredComplaints = complaints.filter((complaint) => complaint.status !== 'PENDENTE');
  const averageResponseHours = answeredComplaints.length > 0
    ? Math.round(answeredComplaints.reduce((total, complaint) => {
        const diff = complaint.updatedAt.getTime() - complaint.createdAt.getTime();
        return total + Math.max(diff / (1000 * 60 * 60), 0);
      }, 0) / answeredComplaints.length)
    : 0;
  const averageResponseLabel = averageResponseHours >= 24
    ? `${Math.round(averageResponseHours / 24)}d`
    : `${averageResponseHours}h`;
  
  // If not on iluminação, redirect to module dashboard
  if (currentModule !== 'ILUMINACAO') {
    return <Navigate to="/dashboard/modulo" replace />;
  }

  const canViewComplaints = canApproveComplaints();
  const canViewFullStats = canViewReports();
  const cityPoles = poles.filter((pole) => pole.cityHallId === activeCityHall.id);
  const workingPoles = cityPoles.filter((pole) => pole.status === 'FUNCIONANDO').length;
  const brokenPoles = cityPoles.filter((pole) => pole.status === 'QUEIMADO').length;
  const totalPoles = cityPoles.length;
  const workingPercent = totalPoles > 0 ? ((workingPoles / totalPoles) * 100).toFixed(1) : '0.0';
  const statusData = [
    { name: 'Funcionando', value: workingPoles, color: 'hsl(142, 72%, 35%)' },
    { name: 'Queimados', value: brokenPoles, color: 'hsl(0, 72%, 51%)' },
  ].filter((entry) => entry.value > 0);

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
            value={String(totalPoles)}
            description="Cadastrados no sistema"
            icon={<Lightbulb className="h-6 w-6" />}
            variant="default"
          />
          <StatsCard
            title="Postes Funcionando"
            value={String(workingPoles)}
            description={`${workingPercent}% do total`}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
          />
          <StatsCard
            title="Postes Queimados"
            value={String(brokenPoles)}
            description="Aguardando manutenção"
            icon={<AlertTriangle className="h-6 w-6" />}
            variant="destructive"
          />
          <StatsCard
            title="Tempo Médio"
            value={averageResponseLabel}
            description="Para resolução"
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
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
            <PoleMap poles={cityPoles} center={[activeCityHall.latitude, activeCityHall.longitude]} />
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
