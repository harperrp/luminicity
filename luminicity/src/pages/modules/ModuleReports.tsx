import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ModuleSelector } from '@/components/modules/ModuleSelector';
import { useModules } from '@/contexts/ModulesContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { MODULE_CONFIGS, STATUS_LABELS } from '@/types/modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { FileText, Download, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const formatDateBR = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

export default function ModuleReports() {
  const { currentModule, getModuleOccurrences } = useModules();
  const { activeCityHall } = useCityHall();
  const config = MODULE_CONFIGS[currentModule];
  const Icon = config.icon;

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const occurrences = getModuleOccurrences(currentModule, activeCityHall.id);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    occurrences.forEach(o => {
      months.add(`${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`);
    });
    // Add current month
    const now = new Date();
    months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    return Array.from(months).sort().reverse();
  }, [occurrences]);

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-');
    const names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${names[parseInt(m) - 1]} ${y}`;
  };

  const monthStats = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0, 23, 59, 59);

    const inMonth = occurrences.filter(o => o.createdAt >= monthStart && o.createdAt <= monthEnd);
    const resolvedInMonth = occurrences.filter(o => o.resolvedAt && o.resolvedAt >= monthStart && o.resolvedAt <= monthEnd);
    
    const resolvedWithTime = resolvedInMonth.filter(o => o.resolvedAt);
    const tempoMedio = resolvedWithTime.length > 0
      ? (resolvedWithTime.reduce((a, o) => a + ((o.resolvedAt!.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24)), 0) / resolvedWithTime.length).toFixed(1)
      : '—';

    // By neighborhood
    const bairros: Record<string, number> = {};
    inMonth.forEach(o => {
      const b = o.neighborhood || 'Não informado';
      bairros[b] = (bairros[b] || 0) + 1;
    });

    return {
      total: inMonth.length,
      resolvidas: resolvedInMonth.length,
      tempoMedio,
      bairros: Object.entries(bairros).sort((a, b) => b[1] - a[1]),
    };
  }, [selectedMonth, occurrences]);

  const statusPie = useMemo(() => {
    const abertas = occurrences.filter(o => o.status === 'ABERTA').length;
    const emAndamento = occurrences.filter(o => o.status === 'EM_ANDAMENTO').length;
    const resolvidas = occurrences.filter(o => o.status === 'RESOLVIDA').length;
    return [
      { name: 'Abertas', value: abertas, color: 'hsl(0, 72%, 51%)' },
      { name: 'Em Andamento', value: emAndamento, color: 'hsl(38, 92%, 50%)' },
      { name: 'Resolvidas', value: resolvidas, color: 'hsl(142, 72%, 35%)' },
    ].filter(d => d.value > 0);
  }, [occurrences]);

  const handleExport = (format: string) => {
    toast.success(`Exportação ${format.toUpperCase()} iniciada!`, { description: `Relatório de ${config.shortName}` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ModuleSelector />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
              <FileText className="h-7 w-7" />
              Relatórios — {config.shortName}
            </h1>
            <p className="text-muted-foreground">Indicadores operacionais de {config.shortName.toLowerCase()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-1" />CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <FileText className="h-4 w-4 mr-1" />PDF
            </Button>
          </div>
        </div>

        {/* Month Selector */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Resumo Mensal</p>
                  <p className="text-xs text-muted-foreground">Selecione o mês para ver os indicadores</p>
                </div>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableMonths.map(m => (
                    <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 mt-4">
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-3xl font-bold text-primary">{monthStats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Ocorrências no mês</p>
              </div>
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-3xl font-bold text-success">{monthStats.resolvidas}</p>
                <p className="text-xs text-muted-foreground mt-1">Resolvidas no mês</p>
              </div>
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-3xl font-bold text-primary">{monthStats.tempoMedio}</p>
                <p className="text-xs text-muted-foreground mt-1">Tempo médio (dias)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status Chart */}
          {statusPie.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição por Status</CardTitle>
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

          {/* By Neighborhood */}
          {monthStats.bairros.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ocorrências por Bairro
                </CardTitle>
                <CardDescription>{monthLabel(selectedMonth)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthStats.bairros.map(([name, count]) => ({ name, count }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="count" name="Ocorrências" fill={config.hslColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
