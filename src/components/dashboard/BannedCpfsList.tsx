import { useState } from 'react';
import { Ban, Search, ShieldOff, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface BannedCpfEntry {
  cpf: string;
  name: string;
  bannedAt: Date;
  reason?: string;
  complaintsCount: number;
}

interface BannedCpfsListProps {
  bannedEntries: BannedCpfEntry[];
  onUnban: (cpf: string) => void;
}

export function BannedCpfsList({ bannedEntries, onUnban }: BannedCpfsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [unbanTarget, setUnbanTarget] = useState<BannedCpfEntry | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filtered = bannedEntries.filter(entry => {
    const q = searchQuery.toLowerCase();
    return (
      entry.cpf.toLowerCase().includes(q) ||
      entry.name.toLowerCase().includes(q)
    );
  });

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

  const handleUnbanClick = (entry: BannedCpfEntry) => {
    setUnbanTarget(entry);
    setConfirmOpen(true);
  };

  const confirmUnban = () => {
    if (unbanTarget) {
      onUnban(unbanTarget.cpf);
      toast.success(`CPF ${unbanTarget.cpf} desbanido com sucesso`);
      setConfirmOpen(false);
      setUnbanTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por CPF ou nome..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {bannedEntries.length} registro(s)
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Ban className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {bannedEntries.length === 0
              ? 'Nenhum CPF banido'
              : 'Nenhum resultado encontrado'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {bannedEntries.length === 0
              ? 'CPFs banidos na aba de denúncias aparecerão aqui'
              : 'Tente buscar por outro termo'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => (
            <div
              key={entry.cpf}
              className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="destructive" className="gap-1">
                      <Ban className="h-3 w-3" />
                      Banido
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {entry.cpf}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{entry.name}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Banido em: {formatDate(entry.bannedAt)}
                    </span>
                    <span>
                      Denúncias: {entry.complaintsCount}
                    </span>
                  </div>

                  {entry.reason && (
                    <p className="text-xs text-muted-foreground">
                      Motivo: {entry.reason}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleUnbanClick(entry)}
                >
                  <ShieldOff className="h-4 w-4" />
                  Desbanir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unban confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5" />
              Desbanir CPF
            </DialogTitle>
            <DialogDescription>
              Este CPF poderá voltar a enviar denúncias normalmente.
            </DialogDescription>
          </DialogHeader>

          {unbanTarget && (
            <div className="space-y-2 text-sm rounded-lg bg-muted p-3">
              <p><strong>Nome:</strong> {unbanTarget.name}</p>
              <p><strong>CPF:</strong> {unbanTarget.cpf}</p>
              <p><strong>Banido em:</strong> {formatDate(unbanTarget.bannedAt)}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmUnban}>
              Confirmar Desbanimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
