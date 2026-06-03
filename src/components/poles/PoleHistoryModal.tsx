import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, Wrench, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { getPoleStats, getRecurrenceLevel, formatDateBR, daysSince, PoleHistoryRecord } from '@/data/mockData';
import { Pole } from '@/types';

interface PoleHistoryModalProps {
  pole: Pole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const recurrenceBadge = {
  BAIXO: { label: 'Baixo', className: 'bg-muted text-muted-foreground' },
  MEDIO: { label: 'Médio', className: 'bg-warning text-warning-foreground' },
  CRITICO: { label: 'Crítico', className: 'bg-destructive text-destructive-foreground' },
};

export function PoleHistoryModal({ pole, open, onOpenChange }: PoleHistoryModalProps) {
  if (!pole) return null;

  const stats = getPoleStats(pole.id);
  const recurrence = getRecurrenceLevel(pole.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico — Poste {pole.id}
          </DialogTitle>
          <DialogDescription>
            {pole.address}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total de ocorrências</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">{stats.avgResolution.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Tempo médio (dias)</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">{stats.last30}</p>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">{stats.last90}</p>
              <p className="text-xs text-muted-foreground">Últimos 90 dias</p>
            </div>
          </div>

          {/* Recurrence alert */}
          {recurrence && (
            <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <span className="text-sm">
                Alerta de recorrência:
              </span>
              <Badge className={recurrenceBadge[recurrence.level].className}>
                {recurrenceBadge[recurrence.level].label}
              </Badge>
            </div>
          )}

          {/* Current status */}
          <div className="rounded-lg border p-3">
            {pole.status === 'QUEIMADO' && stats.openRecord ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive animate-pulse-soft" />
                  <span className="font-medium text-destructive">Queimado atualmente</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Queimado em {formatDateBR(stats.openRecord.dateQueimado)} — Há {daysSince(stats.openRecord.dateQueimado)} dias
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="font-medium text-success">Funcionando</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Linha do tempo</h4>
            <ScrollArea className="h-[250px] pr-3">
              <div className="space-y-4">
                {stats.history.map((record, index) => (
                  <TimelineItem key={record.id} record={record} index={index} isLast={index === stats.history.length - 1} />
                ))}
                {stats.history.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma ocorrência registrada.</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TimelineItem({ record, index, isLast }: { record: PoleHistoryRecord; index: number; isLast: boolean }) {
  const isOpen = record.dateConsertado === null;

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
      )}

      {/* Dot */}
      <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
        isOpen ? 'border-destructive bg-destructive/10' : 'border-success bg-success/10'
      }`}>
        {isOpen ? (
          <AlertTriangle className="h-3 w-3 text-destructive" />
        ) : (
          <CheckCircle className="h-3 w-3 text-success" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 rounded-lg border bg-card p-3 text-sm space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">Ocorrência #{index + 1}</span>
          {isOpen ? (
            <Badge variant="destructive" className="text-xs">Em aberto</Badge>
          ) : (
            <Badge className="bg-success text-success-foreground text-xs">Resolvido</Badge>
          )}
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Queimado: {formatDateBR(record.dateQueimado)}</span>
        </div>

        {record.dateConsertado && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle className="h-3 w-3" />
            <span>Consertado: {formatDateBR(record.dateConsertado)}</span>
          </div>
        )}

        {record.tempoResolucaoDias !== null && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Resolução: {record.tempoResolucaoDias} dias</span>
          </div>
        )}

        {record.tecnicoName && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Wrench className="h-3 w-3" />
            <span>Técnico: {record.tecnicoName}</span>
          </div>
        )}

        {isOpen && (
          <p className="text-xs text-destructive font-medium">
            Queimado há {daysSince(record.dateQueimado)} dias
          </p>
        )}
      </div>
    </div>
  );
}
