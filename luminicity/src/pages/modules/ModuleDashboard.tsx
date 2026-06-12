import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ModuleSelector } from '@/components/modules/ModuleSelector';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useModules } from '@/contexts/ModulesContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { MODULE_CONFIGS, STATUS_LABELS, STATUS_COLORS, OccurrenceStatus } from '@/types/modules';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock, MapPin, LayoutDashboard } from 'lucide-react';

const formatDateBR = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

export default function ModuleDashboard() {
  const { currentModule, getModuleOccurrences } = useModules();
  const { activeCityHall } = useCityHall();
  const config = MODULE_CONFIGS[currentModule];
  const Icon = config.icon;

  // Skip ILUMINACAO — it uses the original dashboard
  if (currentModule === 'ILUMINACAO') {
    return null; // handled by existing Dashboard
  }

  const occurrences = getModuleOccurrences(currentModule, activeCityHall.id);

  const abertas = occurrences.filter(o => o.status === 'ABERTA').length;
  const emAndamento = occurrences.filter(o => o.status === 'EM_ANDAMENTO').length;
  const resolvidas = occurrences.filter(o => o.status === 'RESOLVIDA').length;
  const total = occurrences.length;

  const resolvedOcc = occurrences.filter(o => o.resolvedAt);
  const tempoMedio = resolvedOcc.length > 0
    ? Math.round(resolvedOcc.reduce((acc, o) => {
        const diff = (o.resolvedAt!.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return acc + diff;
      }, 0) / resolvedOcc.length)
    : 0;

  const statusPie = [
    { name: 'Abertas', value: abertas, color: 'hsl(0, 72%, 51%)' },
    { name: 'Em Andamento', value: emAndamento, color: 'hsl(38, 92%, 50%)' },
    { name: 'Resolvidas', value: resolvidas, color: 'hsl(142, 72%, 35%)' },
  ].filter(d => d.value > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ModuleSelector />

        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <Icon className={`h-7 w-7 ${config.color}`} />
            {config.name}
          </h1>
          <p className="text-muted-foreground">{config.description} — {activeCityHall.city}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Ocorrências"
            value={String(total)}
            description="Registradas no sistema"
            icon={<LayoutDashboard className="h-6 w-6" />}
            variant="default"
          />
          <StatsCard
            title="Abertas"
            value={String(abertas)}
            description="Aguardando atendimento"
            icon={<AlertTriangle className="h-6 w-6" />}
            variant="destructive"
          />
          <StatsCard
            title="Em Andamento"
            value={String(emAndamento)}
            description="Sendo atendidas"
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />
          <StatsCard
            title="Resolvidas"
            value={String(resolvidas)}
            description={`Tempo médio: ${tempoMedio} dias`}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
          />
        </div>

        {/* Chart */}
        {statusPie.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>Ocorrências de {config.shortName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Occurrences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${config.color}`} />
              Últimas Ocorrências
            </CardTitle>
            <CardDescription>{occurrences.length} ocorrências registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {occurrences.length === 0 ? (
              <div className="text-center py-12">
                <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma ocorrência registrada</p>
                <p className="text-muted-foreground">As ocorrências de {config.shortName.toLowerCase()} aparecerão aqui.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {occurrences.slice(0, 10).map(occ => (
                      <TableRow key={occ.id}>
                        <TableCell className="font-medium">{occ.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{occ.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {occ.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[occ.status]}>
                            {STATUS_LABELS[occ.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{occ.priority === 'alta' ? 'Alta' : occ.priority === 'media' ? 'Média' : 'Baixa'}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDateBR(occ.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
