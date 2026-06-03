import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Clock, Wrench, AlertTriangle, CheckCircle, Calendar,
  RotateCcw, TrendingUp, Timer, ShieldAlert, MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { getPoleStats, getRecurrenceLevel, formatDateBR, daysSince, PoleHistoryRecord } from '@/data/mockData';
import { Pole } from '@/types';

interface PoleHistoryDrawerProps {
  pole: Pole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const recurrenceConfig = {
  BAIXO: { label: 'Baixo', color: 'bg-[hsl(var(--chart-2))]', textColor: 'text-[hsl(var(--chart-2))]', bgLight: 'bg-[hsl(var(--chart-2)/0.1)]' },
  MEDIO: { label: 'Médio', color: 'bg-[hsl(var(--warning))]', textColor: 'text-[hsl(var(--warning))]', bgLight: 'bg-[hsl(var(--warning)/0.1)]' },
  CRITICO: { label: 'Crítico', color: 'bg-destructive', textColor: 'text-destructive', bgLight: 'bg-destructive/10' },
};

function KPISkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-xl" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, value, label, colorClass, delay }: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  colorClass: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={`rounded-xl border bg-card p-4 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${colorClass}`}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function OccurrenceChart({ history }: { history: PoleHistoryRecord[] }) {
  const monthlyData = history
    .filter(h => h.dateQueimado)
    .reduce<Record<string, number>>((acc, h) => {
      const key = `${h.dateQueimado.getFullYear()}-${String(h.dateQueimado.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const chartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: month.split('-').reverse().join('/'),
      ocorrencias: count,
    }));

  if (chartData.length < 2) return null;

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Tendência de Ocorrências
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData}>
          <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={20} />
          <RechartsTooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="ocorrencias"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TimelineEvent({ record, index, total }: { record: PoleHistoryRecord; index: number; total: number }) {
  const isOpen = record.dateConsertado === null;
  const isLast = index === total - 1;

  return (
    <div className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
      )}

      {/* Dot */}
      <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 shadow-sm ${
        isOpen
          ? 'border-destructive bg-destructive/10'
          : 'border-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)]'
      }`}>
        {isOpen ? (
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        ) : (
          <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
        )}
      </div>

      {/* Content card */}
      <div className="flex-1 rounded-xl border bg-card p-4 mb-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-semibold text-sm">Ocorrência #{total - index}</span>
          {isOpen ? (
            <Badge variant="destructive" className="text-xs font-medium">Em aberto</Badge>
          ) : (
            <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] text-xs font-medium">Resolvido</Badge>
          )}
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Queimado: <span className="text-foreground font-medium">{formatDateBR(record.dateQueimado)}</span></span>
          </div>

          {record.dateConsertado && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--success))]" />
              <span>Consertado: <span className="text-foreground font-medium">{formatDateBR(record.dateConsertado)}</span></span>
            </div>
          )}

          {record.tempoResolucaoDias !== null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Resolução: <span className="text-foreground font-medium">{record.tempoResolucaoDias} dias</span></span>
            </div>
          )}

          {record.tecnicoName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wrench className="h-3.5 w-3.5 shrink-0" />
              <span>Técnico: <span className="text-foreground font-medium">{record.tecnicoName}</span></span>
            </div>
          )}

          {isOpen && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              Queimado há {daysSince(record.dateQueimado)} dias
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PoleHistoryDrawer({ pole, open, onOpenChange }: PoleHistoryDrawerProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [open, pole?.id]);

  if (!pole) return null;

  const stats = getPoleStats(pole.id);
  const recurrence = getRecurrenceLevel(pole.id);
  const recConfig = recurrence ? recurrenceConfig[recurrence.level] : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[480px] lg:w-[520px] sm:max-w-[520px] p-0 border-l-0 shadow-2xl z-[1100]">
        {loading ? (
          <KPISkeleton />
        ) : (
          <ScrollArea className="h-full">
            {/* Header */}
            <div className="gradient-primary p-6 text-white">
              <SheetHeader className="text-left space-y-1">
                <SheetTitle className="text-white text-xl font-bold tracking-tight">
                  Poste {pole.id}
                </SheetTitle>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  {pole.address}
                </div>
              </SheetHeader>
              <div className="mt-3">
                <Badge className={`${
                  pole.status === 'FUNCIONANDO'
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-destructive text-white border-destructive'
                } border`}>
                  {pole.status === 'FUNCIONANDO' ? '● Funcionando' : '● Queimado'}
                </Badge>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-3">
                <KPICard icon={RotateCcw} value={stats.total} label="Total de ocorrências" colorClass="bg-primary" delay={100} />
                <KPICard icon={Calendar} value={stats.last30} label="Últimos 30 dias" colorClass="bg-[hsl(var(--chart-2))]" delay={200} />
                <KPICard icon={Timer} value={stats.avgResolution > 0 ? `${stats.avgResolution.toFixed(1)}d` : '—'} label="Tempo médio resolução" colorClass="bg-[hsl(var(--warning))]" delay={300} />
                <KPICard
                  icon={ShieldAlert}
                  value={recConfig ? recConfig.label : 'Normal'}
                  label="Nível de recorrência"
                  colorClass={recConfig ? recConfig.color : 'bg-muted-foreground'}
                  delay={400}
                />
              </div>

              {/* Chart */}
              <OccurrenceChart history={stats.history} />

              {/* Recurrence warning */}
              {recurrence && recurrence.level === 'CRITICO' && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3 animate-fade-in">
                  <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Atenção — Padrão Recorrente</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Este poste apresenta padrão recorrente de falhas e pode exigir manutenção estrutural ou substituição do equipamento.
                    </p>
                  </div>
                </div>
              )}

              {/* Current status */}
              {pole.status === 'QUEIMADO' && stats.openRecord && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-destructive animate-pulse-soft shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Queimado atualmente</p>
                    <p className="text-xs text-muted-foreground">
                      Desde {formatDateBR(stats.openRecord.dateQueimado)} — há {daysSince(stats.openRecord.dateQueimado)} dias
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Linha do Tempo
                  <Badge variant="outline" className="ml-auto text-xs">{stats.total} registros</Badge>
                </h4>
                <div>
                  {stats.history.map((record, index) => (
                    <TimelineEvent key={record.id} record={record} index={index} total={stats.history.length} />
                  ))}
                  {stats.history.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-12">Nenhuma ocorrência registrada.</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
