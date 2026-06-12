import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText, Download, Calendar, BarChart3, AlertTriangle,
  Lightbulb, MapPin, Clock, FileSpreadsheet, TrendingUp, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { toast } from 'sonner';
import { MOCK_POLES, MOCK_POLE_HISTORY, getPoleStats, getRecurrenceLevel, formatDateBR } from '@/data/mockData';

// ========================
// Generate report data from mock data
// ========================
const buildOccurrencesByMonth = () => {
  const months: Record<string, { queimados: number; consertados: number }> = {};
  MOCK_POLE_HISTORY.forEach(h => {
    const key = `${h.dateQueimado.getFullYear()}-${String(h.dateQueimado.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { queimados: 0, consertados: 0 };
    months[key].queimados++;
    if (h.dateConsertado) months[key].consertados++;
  });
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const [y, m] = key.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return { name: `${monthNames[parseInt(m) - 1]}/${y.slice(2)}`, ...val };
    });
};

const buildTopRecurrent = () => {
  const poleCounts: Record<string, number> = {};
  MOCK_POLE_HISTORY.forEach(h => {
    poleCounts[h.poleId] = (poleCounts[h.poleId] || 0) + 1;
  });
  return Object.entries(poleCounts)
    .map(([poleId, count]) => {
      const pole = MOCK_POLES.find(p => p.id === poleId);
      return { poleId, count, address: pole?.address || '' };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

const statusPieData = [
  { name: 'Funcionando', value: MOCK_POLES.filter(p => p.status === 'FUNCIONANDO').length, color: 'hsl(142, 72%, 35%)' },
  { name: 'Queimados', value: MOCK_POLES.filter(p => p.status === 'QUEIMADO').length, color: 'hsl(0, 72%, 51%)' },
];

const PAGE_SIZE = 5;

export default function DashboardReports() {
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTecnico, setFilterTecnico] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  // Available months from data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    MOCK_POLE_HISTORY.forEach(h => {
      months.add(`${h.dateQueimado.getFullYear()}-${String(h.dateQueimado.getMonth() + 1).padStart(2, '0')}`);
      if (h.dateConsertado) {
        months.add(`${h.dateConsertado.getFullYear()}-${String(h.dateConsertado.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    return Array.from(months).sort().reverse();
  }, []);

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-');
    const names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${names[parseInt(m) - 1]} ${y}`;
  };

  const tecnicos = [...new Set(MOCK_POLE_HISTORY.map(h => h.tecnicoName).filter(Boolean))];

  // Filtered history
  // Month-based stats
  const monthStats = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0, 23, 59, 59);

    const queimadosNoMes = MOCK_POLE_HISTORY.filter(h => h.dateQueimado >= monthStart && h.dateQueimado <= monthEnd);
    const consertadosNoMes = MOCK_POLE_HISTORY.filter(h => h.dateConsertado && h.dateConsertado >= monthStart && h.dateConsertado <= monthEnd);
    const resolvedNoMes = consertadosNoMes.filter(h => h.tempoResolucaoDias !== null);
    const tempoMedioMes = resolvedNoMes.length > 0 
      ? (resolvedNoMes.reduce((a, h) => a + (h.tempoResolucaoDias || 0), 0) / resolvedNoMes.length).toFixed(1) 
      : '—';

    return { queimados: queimadosNoMes.length, consertados: consertadosNoMes.length, tempoMedio: tempoMedioMes };
  }, [selectedMonth]);

  const filteredHistory = useMemo(() => {
    return MOCK_POLE_HISTORY.filter(h => {
      const pole = MOCK_POLES.find(p => p.id === h.poleId);
      if (dateStart && h.dateQueimado < new Date(dateStart)) return false;
      if (dateEnd && h.dateQueimado > new Date(dateEnd + 'T23:59:59')) return false;
      if (filterStatus === 'queimado' && h.dateConsertado !== null) return false;
      if (filterStatus === 'consertado' && h.dateConsertado === null) return false;
      if (filterTecnico !== 'all' && h.tecnicoName !== filterTecnico) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!h.poleId.toLowerCase().includes(term) && !pole?.address?.toLowerCase().includes(term)) return false;
      }
      return true;
    }).sort((a, b) => b.dateQueimado.getTime() - a.dateQueimado.getTime());
  }, [dateStart, dateEnd, filterStatus, filterTecnico, searchTerm]);

  // Summary
  const totalOcorrencias = filteredHistory.length;
  const totalQueimados = filteredHistory.filter(h => h.dateConsertado === null).length;
  const totalConsertados = filteredHistory.filter(h => h.dateConsertado !== null).length;
  const resolved = filteredHistory.filter(h => h.tempoResolucaoDias !== null);
  const tempoMedio = resolved.length > 0 ? (resolved.reduce((a, h) => a + (h.tempoResolucaoDias || 0), 0) / resolved.length).toFixed(1) : '—';

  // Most recurrent pole
  const poleCounts: Record<string, number> = {};
  filteredHistory.forEach(h => { poleCounts[h.poleId] = (poleCounts[h.poleId] || 0) + 1; });
  const topPole = Object.entries(poleCounts).sort((a, b) => b[1] - a[1])[0];


  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / PAGE_SIZE);
  const pagedHistory = filteredHistory.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const monthlyData = buildOccurrencesByMonth();
  const topRecurrent = buildTopRecurrent();

  const handleExport = (format: string) => {
    toast.success(`Exportação ${format.toUpperCase()} iniciada!`, { description: `${filteredHistory.length} registros com filtros aplicados.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Indicadores operacionais e estratégicos com filtros dinâmicos.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-1" />CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
              <FileSpreadsheet className="h-4 w-4 mr-1" />XLSX
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
                <p className="text-3xl font-bold text-destructive">{monthStats.queimados}</p>
                <p className="text-xs text-muted-foreground mt-1">Queimados no mês</p>
              </div>
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-3xl font-bold text-success">{monthStats.consertados}</p>
                <p className="text-xs text-muted-foreground mt-1">Consertados no mês</p>
              </div>
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-3xl font-bold text-primary">{monthStats.tempoMedio}</p>
                <p className="text-xs text-muted-foreground mt-1">Tempo médio (dias)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1">
                <Label className="text-xs">Data Inicial</Label>
                <Input type="date" value={dateStart} onChange={e => { setDateStart(e.target.value); setPage(0); }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data Final</Label>
                <Input type="date" value={dateEnd} onChange={e => { setDateEnd(e.target.value); setPage(0); }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(0); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="queimado">Em aberto</SelectItem>
                    <SelectItem value="consertado">Resolvido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Técnico</Label>
                <Select value={filterTecnico} onValueChange={v => { setFilterTecnico(v); setPage(0); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {tecnicos.map(t => <SelectItem key={t!} value={t!}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Busca</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input placeholder="Poste ou rua..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0); }} className="pl-7 h-9" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{totalOcorrencias}</p><p className="text-xs text-muted-foreground">Ocorrências (total)</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-destructive">{totalQueimados}</p><p className="text-xs text-muted-foreground">Em aberto</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-success">{totalConsertados}</p><p className="text-xs text-muted-foreground">Resolvidos</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{tempoMedio}</p><p className="text-xs text-muted-foreground">Tempo médio (dias)</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-primary">{topPole ? topPole[0] : '—'}</p><p className="text-xs text-muted-foreground">Mais recorrente ({topPole ? topPole[1] : 0}x)</p></CardContent></Card>
        </div>

        {/* Charts row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ocorrências por Mês</CardTitle>
              <CardDescription>Queimados vs Consertados ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="queimados" name="Queimados" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="consertados" name="Consertados" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Atual dos Postes</CardTitle>
              <CardDescription>Distribuição do parque de iluminação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusPieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top 10 Postes Recorrentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRecurrent}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="poleId" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" name="Ocorrências" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tabela de Ocorrências</CardTitle>
            <CardDescription>{filteredHistory.length} registros — Página {page + 1} de {totalPages || 1}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Poste</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Queimado em</TableHead>
                    <TableHead>Consertado em</TableHead>
                    <TableHead>Resolução</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedHistory.map(h => {
                    const pole = MOCK_POLES.find(p => p.id === h.poleId);
                    return (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium">{h.poleId}</TableCell>
                        <TableCell>{pole?.address || '—'}</TableCell>
                        <TableCell>{formatDateBR(h.dateQueimado)}</TableCell>
                        <TableCell>{h.dateConsertado ? formatDateBR(h.dateConsertado) : '—'}</TableCell>
                        <TableCell>{h.tempoResolucaoDias !== null ? `${h.tempoResolucaoDias} dias` : '—'}</TableCell>
                        <TableCell>{h.tecnicoName || '—'}</TableCell>
                        <TableCell>
                          <Badge className={h.dateConsertado ? 'status-badge-working' : 'status-badge-broken'}>
                            {h.dateConsertado ? 'Resolvido' : 'Em aberto'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pagedHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum registro encontrado com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredHistory.length)} de {filteredHistory.length}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recurrence alerts */}
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Recorrência
            </CardTitle>
            <CardDescription>Postes com frequência de queima acima do normal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_POLES.map(pole => {
              const recurrence = getRecurrenceLevel(pole.id);
              if (!recurrence) return null;
              const stats = getPoleStats(pole.id);
              return (
                <div key={pole.id} className="rounded-lg border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{pole.id} • {pole.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">Tempo médio: {stats.avgResolution.toFixed(1)} dias</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={
                        recurrence.level === 'CRITICO' ? 'bg-destructive text-destructive-foreground' :
                        recurrence.level === 'MEDIO' ? 'bg-warning text-warning-foreground' :
                        'bg-muted text-muted-foreground'
                      }>
                        {recurrence.level}
                      </Badge>
                      <Badge variant="outline">{recurrence.totalOcorrencias} total</Badge>
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
