import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useModules } from '@/contexts/ModulesContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { MODULE_CONFIGS, ALL_MODULES } from '@/types/modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { FileText, Download, Calendar, Building2, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_POLE_HISTORY } from '@/data/mockData';

export default function CityReport() {
  const { occurrences, getActiveModules, isModuleActive } = useModules();
  const { activeCityHall } = useCityHall();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const activeModules = getActiveModules(activeCityHall.id);

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-');
    const names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${names[parseInt(m) - 1]} ${y}`;
  };

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    occurrences.forEach(o => {
      months.add(`${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`);
    });
    MOCK_POLE_HISTORY.forEach(h => {
      months.add(`${h.dateQueimado.getFullYear()}-${String(h.dateQueimado.getMonth() + 1).padStart(2, '0')}`);
    });
    const now = new Date();
    months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    return Array.from(months).sort().reverse();
  }, [occurrences]);

  const report = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0, 23, 59, 59);

    // Module occurrences
    const cityOccurrences = occurrences.filter(o => o.cityHallId === activeCityHall.id);
    const inMonth = cityOccurrences.filter(o => o.createdAt >= monthStart && o.createdAt <= monthEnd);
    const resolvedInMonth = cityOccurrences.filter(o => o.resolvedAt && o.resolvedAt >= monthStart && o.resolvedAt <= monthEnd);

    // Iluminação from pole history
    const ilumQueimados = MOCK_POLE_HISTORY.filter(h => h.dateQueimado >= monthStart && h.dateQueimado <= monthEnd).length;
    const ilumConsertados = MOCK_POLE_HISTORY.filter(h => h.dateConsertado && h.dateConsertado >= monthStart && h.dateConsertado <= monthEnd).length;

    // By module
    const byModule = activeModules
      .filter(mod => mod !== 'ILUMINACAO')
      .map(mod => {
        const config = MODULE_CONFIGS[mod];
        const modOccs = inMonth.filter(o => o.moduleType === mod);
        const modResolved = resolvedInMonth.filter(o => o.moduleType === mod);
        return {
          module: config.shortName,
          icon: config.icon,
          color: config.hslColor,
          total: modOccs.length,
          resolvidas: modResolved.length,
        };
      });

    // Add iluminação
    if (isModuleActive(activeCityHall.id, 'ILUMINACAO')) {
      byModule.unshift({
        module: 'Iluminação',
        icon: MODULE_CONFIGS.ILUMINACAO.icon,
        color: MODULE_CONFIGS.ILUMINACAO.hslColor,
        total: ilumQueimados,
        resolvidas: ilumConsertados,
      });
    }

    const totalGeral = byModule.reduce((a, b) => a + b.total, 0);
    const totalResolvido = byModule.reduce((a, b) => a + b.resolvidas, 0);

    // Bairros
    const bairros: Record<string, number> = {};
    inMonth.forEach(o => {
      const b = o.neighborhood || 'Não informado';
      bairros[b] = (bairros[b] || 0) + 1;
    });

    // Tempo médio geral
    const resolvedWithTime = resolvedInMonth.filter(o => o.resolvedAt);
    const tempoMedio = resolvedWithTime.length > 0
      ? (resolvedWithTime.reduce((a, o) => a + ((o.resolvedAt!.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24)), 0) / resolvedWithTime.length).toFixed(1)
      : '—';

    return {
      totalGeral,
      totalResolvido,
      tempoMedio,
      byModule,
      bairros: Object.entries(bairros).sort((a, b) => b[1] - a[1]).slice(0, 10),
    };
  }, [selectedMonth, occurrences, activeCityHall.id, activeModules, isModuleActive]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-7 w-7" />
              Relatório Geral — {activeCityHall.city}
            </h1>
            <p className="text-muted-foreground">Visão consolidada de todos os módulos ativos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success('Exportação CSV iniciada!')}>
              <Download className="h-4 w-4 mr-1" />CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success('Exportação PDF iniciada!')}>
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
                  <p className="font-semibold text-sm">Competência</p>
                  <p className="text-xs text-muted-foreground">Selecione o mês de referência</p>
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
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-primary">{report.totalGeral}</p>
              <p className="text-xs text-muted-foreground mt-1">Total de Ocorrências</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-success">{report.totalResolvido}</p>
              <p className="text-xs text-muted-foreground mt-1">Resolvidas no Mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{report.tempoMedio}</p>
              <p className="text-xs text-muted-foreground mt-1">Tempo Médio (dias)</p>
            </CardContent>
          </Card>
        </div>

        {/* By Module Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ocorrências por Módulo</CardTitle>
            <CardDescription>{monthLabel(selectedMonth)} — Comparativo entre módulos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.byModule}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="module" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="total" name="Total" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolvidas" name="Resolvidas" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* By Module Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhamento por Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Resolvidas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.byModule.map(item => (
                    <TableRow key={item.module}>
                      <TableCell className="font-medium">{item.module}</TableCell>
                      <TableCell className="text-center">{item.total}</TableCell>
                      <TableCell className="text-center text-success">{item.resolvidas}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell>Total Geral</TableCell>
                    <TableCell className="text-center">{report.totalGeral}</TableCell>
                    <TableCell className="text-center text-success">{report.totalResolvido}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Ranking Bairros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ranking de Bairros
              </CardTitle>
              <CardDescription>Bairros com mais ocorrências no mês</CardDescription>
            </CardHeader>
            <CardContent>
              {report.bairros.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados para o período</p>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.bairros.map(([name, count]) => ({ name, count }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={120} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="count" name="Ocorrências" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
