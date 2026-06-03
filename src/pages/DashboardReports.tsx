import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText, Download, Calendar, AlertTriangle,
  FileSpreadsheet, TrendingUp, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { toast } from 'sonner';
import { useCityHall } from '@/contexts/CityHallContext';
import { usePoles } from '@/contexts/PolesContext';
import { api } from '@/lib/api';
import { Complaint, Pole } from '@/types';

const PAGE_SIZE = 5;
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface ReportRecord {
  id: string;
  poleId: string;
  address: string;
  openedAt: Date;
  closedAt: Date | null;
  resolutionDays: number | null;
  technicianName: string | null;
  status: 'aberto' | 'resolvido';
  description: string;
}

const formatDateBR = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

const daysBetween = (start: Date, end: Date) =>
  Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 0);

const findPole = (poles: Pole[], poleId?: string) =>
  poleId ? poles.find((pole) => pole.id === poleId) : undefined;

const downloadBlob = (fileName: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export default function DashboardReports() {
  const { activeCityHall } = useCityHall();
  const { poles } = usePoles();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => monthKey(new Date()));
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTecnico, setFilterTecnico] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

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

  const cityPoles = useMemo(
    () => poles.filter((pole) => pole.cityHallId === activeCityHall.id),
    [poles, activeCityHall.id],
  );

  const records = useMemo<ReportRecord[]>(() => {
    const complaintPoleIds = new Set(complaints.map((complaint) => complaint.poleId).filter(Boolean));
    const complaintRecords = complaints.map((complaint) => {
      const pole = findPole(cityPoles, complaint.poleId);
      const closedAt = complaint.status !== 'PENDENTE' ? complaint.updatedAt : null;

      return {
        id: complaint.id,
        poleId: complaint.poleId || 'Sem poste',
        address: pole?.address || pole?.neighborhood || 'Local informado pelo cidadao',
        openedAt: complaint.createdAt,
        closedAt,
        resolutionDays: closedAt ? daysBetween(complaint.createdAt, closedAt) : null,
        technicianName: null,
        status: closedAt ? 'resolvido' : 'aberto',
        description: complaint.description,
      } satisfies ReportRecord;
    });

    const burnedPoleRecords = cityPoles
      .filter((pole) => pole.status === 'QUEIMADO' && !complaintPoleIds.has(pole.id))
      .map((pole) => ({
        id: `pole:${pole.id}`,
        poleId: pole.id,
        address: pole.address || pole.neighborhood || 'Poste sem endereco',
        openedAt: pole.updatedAt,
        closedAt: null,
        resolutionDays: null,
        technicianName: null,
        status: 'aberto',
        description: 'Poste marcado como queimado no cadastro.',
      } satisfies ReportRecord));

    return [...complaintRecords, ...burnedPoleRecords].sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime());
  }, [complaints, cityPoles]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>([monthKey(new Date())]);
    records.forEach((record) => {
      months.add(monthKey(record.openedAt));
      if (record.closedAt) months.add(monthKey(record.closedAt));
    });
    return Array.from(months).sort().reverse();
  }, [records]);

  const tecnicos = useMemo(
    () => Array.from(new Set(records.map((record) => record.technicianName).filter(Boolean))),
    [records],
  );

  const monthStats = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);
    const opened = records.filter((record) => record.openedAt >= monthStart && record.openedAt <= monthEnd);
    const closed = records.filter((record) => record.closedAt && record.closedAt >= monthStart && record.closedAt <= monthEnd);
    const withTime = closed.filter((record) => record.resolutionDays !== null);
    const average = withTime.length > 0
      ? (withTime.reduce((total, record) => total + (record.resolutionDays || 0), 0) / withTime.length).toFixed(1)
      : '-';

    return { queimados: opened.length, consertados: closed.length, tempoMedio: average };
  }, [selectedMonth, records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (dateStart && record.openedAt < new Date(dateStart)) return false;
      if (dateEnd && record.openedAt > new Date(`${dateEnd}T23:59:59`)) return false;
      if (filterStatus === 'queimado' && record.status !== 'aberto') return false;
      if (filterStatus === 'consertado' && record.status !== 'resolvido') return false;
      if (filterTecnico !== 'all' && record.technicianName !== filterTecnico) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesPole = record.poleId.toLowerCase().includes(term);
        const matchesAddress = record.address.toLowerCase().includes(term);
        const matchesDescription = record.description.toLowerCase().includes(term);
        if (!matchesPole && !matchesAddress && !matchesDescription) return false;
      }
      return true;
    });
  }, [records, dateStart, dateEnd, filterStatus, filterTecnico, searchTerm]);

  const totalOcorrencias = filteredRecords.length;
  const totalQueimados = filteredRecords.filter((record) => record.status === 'aberto').length;
  const totalConsertados = filteredRecords.filter((record) => record.status === 'resolvido').length;
  const resolved = filteredRecords.filter((record) => record.resolutionDays !== null);
  const tempoMedio = resolved.length > 0
    ? (resolved.reduce((total, record) => total + (record.resolutionDays || 0), 0) / resolved.length).toFixed(1)
    : '-';

  const poleCounts = filteredRecords.reduce<Record<string, number>>((acc, record) => {
    acc[record.poleId] = (acc[record.poleId] || 0) + 1;
    return acc;
  }, {});
  const topPole = Object.entries(poleCounts).sort((a, b) => b[1] - a[1])[0];
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const pagedHistory = filteredRecords.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const monthlyData = useMemo(() => {
    const keys = availableMonths.slice().reverse();
    return keys.map((key) => {
      const [year, month] = key.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);

      return {
        name: `${MONTH_LABELS[month - 1]}/${String(year).slice(2)}`,
        queimados: records.filter((record) => record.openedAt >= monthStart && record.openedAt <= monthEnd).length,
        consertados: records.filter((record) => record.closedAt && record.closedAt >= monthStart && record.closedAt <= monthEnd).length,
      };
    });
  }, [availableMonths, records]);

  const topRecurrent = useMemo(() => {
    return Object.entries(poleCounts)
      .map(([poleId, count]) => ({
        poleId,
        count,
        address: records.find((record) => record.poleId === poleId)?.address || '',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [poleCounts, records]);

  const statusPieData = [
    { name: 'Funcionando', value: cityPoles.filter((pole) => pole.status === 'FUNCIONANDO').length, color: 'hsl(142, 72%, 35%)' },
    { name: 'Queimados', value: cityPoles.filter((pole) => pole.status === 'QUEIMADO').length, color: 'hsl(0, 72%, 51%)' },
  ].filter((entry) => entry.value > 0);

  const recurrenceAlerts = topRecurrent.filter((item) =>
    item.count > 1 || cityPoles.some((pole) => pole.id === item.poleId && pole.status === 'QUEIMADO')
  );

  const exportRows = filteredRecords.map((record) => ({
    poste: record.poleId,
    endereco: record.address,
    abertura: formatDateBR(record.openedAt),
    encerramento: record.closedAt ? formatDateBR(record.closedAt) : '',
    tempo_dias: record.resolutionDays ?? '',
    status: record.status,
    descricao: record.description,
  }));

  const handleExport = async (format: string) => {
    if (format === 'pdf') {
      window.print();
      toast.success('Relatorio enviado para impressao', { description: 'Escolha salvar como PDF na janela de impressao.' });
      return;
    }

    if (format === 'csv') {
      const header = Object.keys(exportRows[0] ?? { poste: '', endereco: '', abertura: '', encerramento: '', tempo_dias: '', status: '', descricao: '' });
      const rows = exportRows.map((row) =>
        header.map((key) => `"${String(row[key as keyof typeof row] ?? '').replace(/"/g, '""')}"`).join(',')
      );
      downloadBlob(`relatorio-iluminacao-${selectedMonth}.csv`, new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' }));
      toast.success('CSV gerado com sucesso');
      return;
    }

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorio');
    XLSX.writeFile(workbook, `relatorio-iluminacao-${selectedMonth}.xlsx`);
    toast.success('XLSX gerado com sucesso');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Relatorios</h1>
            <p className="text-muted-foreground">Indicadores operacionais de iluminacao com dados do banco.</p>
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

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Resumo mensal</p>
                  <p className="text-xs text-muted-foreground">Selecione o mes para ver os indicadores</p>
                </div>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>{monthLabel(month)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 mt-4">
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-3xl font-bold text-destructive">{monthStats.queimados}</p>
                <p className="text-xs text-muted-foreground mt-1">Abertos no mes</p>
              </div>
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-3xl font-bold text-success">{monthStats.consertados}</p>
                <p className="text-xs text-muted-foreground mt-1">Resolvidos no mes</p>
              </div>
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-3xl font-bold text-primary">{monthStats.tempoMedio}</p>
                <p className="text-xs text-muted-foreground mt-1">Tempo medio (dias)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filtros avancados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1">
                <Label className="text-xs">Data inicial</Label>
                <Input type="date" value={dateStart} onChange={(event) => { setDateStart(event.target.value); setPage(0); }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data final</Label>
                <Input type="date" value={dateEnd} onChange={(event) => { setDateEnd(event.target.value); setPage(0); }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); setPage(0); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="queimado">Em aberto</SelectItem>
                    <SelectItem value="consertado">Resolvido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tecnico</Label>
                <Select value={filterTecnico} onValueChange={(value) => { setFilterTecnico(value); setPage(0); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {tecnicos.map((tecnico) => <SelectItem key={tecnico} value={tecnico!}>{tecnico}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Busca</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input placeholder="Poste ou rua..." value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(0); }} className="pl-7 h-9" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{totalOcorrencias}</p><p className="text-xs text-muted-foreground">Ocorrencias</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-destructive">{totalQueimados}</p><p className="text-xs text-muted-foreground">Em aberto</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-success">{totalConsertados}</p><p className="text-xs text-muted-foreground">Resolvidos</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{tempoMedio}</p><p className="text-xs text-muted-foreground">Tempo medio (dias)</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-primary">{topPole ? topPole[0] : '-'}</p><p className="text-xs text-muted-foreground">Mais recorrente ({topPole ? topPole[1] : 0}x)</p></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ocorrencias por mes</CardTitle>
              <CardDescription>Abertos vs resolvidos ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="queimados" name="Abertos" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="consertados" name="Resolvidos" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status atual dos postes</CardTitle>
              <CardDescription>Distribuicao do parque de iluminacao</CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top 10 postes recorrentes
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
                  <Bar dataKey="count" name="Ocorrencias" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tabela de ocorrencias</CardTitle>
            <CardDescription>{filteredRecords.length} registros - Pagina {page + 1} de {totalPages || 1}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Poste</TableHead>
                    <TableHead>Endereco</TableHead>
                    <TableHead>Aberto em</TableHead>
                    <TableHead>Resolvido em</TableHead>
                    <TableHead>Resolucao</TableHead>
                    <TableHead>Tecnico</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.poleId}</TableCell>
                      <TableCell>{record.address}</TableCell>
                      <TableCell>{formatDateBR(record.openedAt)}</TableCell>
                      <TableCell>{record.closedAt ? formatDateBR(record.closedAt) : '-'}</TableCell>
                      <TableCell>{record.resolutionDays !== null ? `${record.resolutionDays} dias` : '-'}</TableCell>
                      <TableCell>{record.technicianName || '-'}</TableCell>
                      <TableCell>
                        <Badge className={record.status === 'resolvido' ? 'status-badge-working' : 'status-badge-broken'}>
                          {record.status === 'resolvido' ? 'Resolvido' : 'Em aberto'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filteredRecords.length)} de {filteredRecords.length}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Alertas de recorrencia
            </CardTitle>
            <CardDescription>Postes com queima atual ou mais de uma ocorrencia registrada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recurrenceAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum alerta de recorrencia no periodo.</p>
            ) : (
              recurrenceAlerts.map((item) => {
                const pole = cityPoles.find((candidate) => candidate.id === item.poleId);
                const isCritical = pole?.status === 'QUEIMADO' && item.count > 1;
                return (
                  <div key={item.poleId} className="rounded-lg border bg-background p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.poleId} - {item.address || 'Endereco nao informado'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.count} ocorrencia(s) registradas</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={isCritical ? 'bg-destructive text-destructive-foreground' : 'bg-warning text-warning-foreground'}>
                          {isCritical ? 'CRITICO' : 'ATENCAO'}
                        </Badge>
                        {pole?.status === 'QUEIMADO' && <Badge variant="outline">Queimado</Badge>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
