import { useState } from 'react';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, Eye, Ban } from 'lucide-react';
import { Complaint, ComplaintStatus, REJECTION_REASONS } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Mock data
const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: '1',
    latitude: -23.5505,
    longitude: -46.6333,
    description: 'Poste apagado há mais de uma semana na Rua das Flores',
    status: 'PENDENTE',
    citizenCpf: '123.456.789-00',
    citizenName: 'José da Silva',
    citizenPhone: '(11) 98765-4321',
    cityHallId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    latitude: -23.5520,
    longitude: -46.6350,
    description: 'Lâmpada piscando intermitentemente',
    status: 'APROVADA',
    citizenCpf: '987.654.321-00',
    citizenName: 'Maria Santos',
    cityHallId: '1',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    latitude: -23.5490,
    longitude: -46.6310,
    description: 'Poste com fiação exposta',
    status: 'REJEITADA',
    rejectionReason: 'Poste não pertence ao município',
    citizenCpf: '456.789.123-00',
    citizenName: 'Carlos Oliveira',
    cityHallId: '1',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-14'),
  },
];

const statusConfig: Record<ComplaintStatus, { label: string; className: string; icon: typeof AlertCircle }> = {
  PENDENTE: { label: 'Pendente', className: 'status-badge-pending', icon: AlertCircle },
  APROVADA: { label: 'Aprovada', className: 'status-badge-approved', icon: CheckCircle },
  REJEITADA: { label: 'Rejeitada', className: 'status-badge-rejected', icon: XCircle },
};

interface ComplaintsListProps {
  bannedCpfs?: Set<string>;
  onBanCpf?: (cpf: string, name: string) => void;
  onUnbanCpf?: (cpf: string) => void;
}

const EMPTY_SET = new Set<string>();

export function ComplaintsList({ bannedCpfs = EMPTY_SET, onBanCpf = () => {}, onUnbanCpf = () => {} }: ComplaintsListProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [action, setAction] = useState<'view' | 'approve' | 'reject'>('view');
  const [rejectionReason, setRejectionReason] = useState('');
  const [observations, setObservations] = useState('');

  const handleAction = (complaint: Complaint, actionType: 'view' | 'approve' | 'reject') => {
    setSelectedComplaint(complaint);
    setAction(actionType);
    setDialogOpen(true);
    setRejectionReason('');
    setObservations('');
  };

  const handleApprove = () => {
    if (selectedComplaint) {
      setComplaints(prev =>
        prev.map(c =>
          c.id === selectedComplaint.id
            ? { ...c, status: 'APROVADA' as ComplaintStatus, secretaryObservations: observations, updatedAt: new Date() }
            : c
        )
      );
      setDialogOpen(false);
    }
  };

  const handleReject = () => {
    if (selectedComplaint && rejectionReason) {
      setComplaints(prev =>
        prev.map(c =>
          c.id === selectedComplaint.id
            ? {
                ...c,
                status: 'REJEITADA' as ComplaintStatus,
                rejectionReason,
                secretaryObservations: observations,
                updatedAt: new Date(),
              }
            : c
        )
      );
      setDialogOpen(false);
    }
  };

  const handleBanCpf = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setBanDialogOpen(true);
  };

  const confirmBan = () => {
    if (selectedComplaint) {
      onBanCpf(selectedComplaint.citizenCpf, selectedComplaint.citizenName);
      setBanDialogOpen(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {complaints.filter(c => !bannedCpfs.has(c.citizenCpf) && c.status === 'PENDENTE').map(complaint => {
        const status = statusConfig[complaint.status];
        const StatusIcon = status.icon;

        return (
          <div
            key={complaint.id}
            className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn('gap-1', status.className)}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">#{complaint.id}</span>
                  {bannedCpfs.has(complaint.citizenCpf) && (
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                      <Ban className="h-3 w-3" /> CPF Banido
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm">{complaint.description}</p>
                
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(complaint.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Denunciante: {complaint.citizenName}
                </p>

                {complaint.rejectionReason && (
                  <p className="text-xs text-destructive">
                    Motivo: {complaint.rejectionReason}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(complaint, 'view')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {!bannedCpfs.has(complaint.citizenCpf) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleBanCpf(complaint)}
                    title="Banir CPF"
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                )}
                {complaint.status === 'PENDENTE' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleAction(complaint, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(complaint, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === 'view' && 'Detalhes da Denúncia'}
              {action === 'approve' && 'Aprovar Denúncia'}
              {action === 'reject' && 'Rejeitar Denúncia'}
            </DialogTitle>
            <DialogDescription>
              {action === 'view' && 'Informações completas da denúncia'}
              {action === 'approve' && 'Confirme a aprovação desta denúncia'}
              {action === 'reject' && 'Selecione o motivo da rejeição'}
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <p><strong>Descrição:</strong> {selectedComplaint.description}</p>
                <p><strong>Denunciante:</strong> {selectedComplaint.citizenName}</p>
                <p><strong>CPF:</strong> {selectedComplaint.citizenCpf}</p>
                {selectedComplaint.citizenPhone && (
                  <p><strong>Telefone:</strong> {selectedComplaint.citizenPhone}</p>
                )}
                <p><strong>Data:</strong> {formatDate(selectedComplaint.createdAt)}</p>
              </div>

              {action === 'reject' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Motivo da Rejeição *</label>
                  <Select value={rejectionReason} onValueChange={setRejectionReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {REJECTION_REASONS.map(reason => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(action === 'approve' || action === 'reject') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <Textarea
                    value={observations}
                    onChange={e => setObservations(e.target.value)}
                    placeholder="Observações adicionais..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {action === 'view' ? 'Fechar' : 'Cancelar'}
            </Button>
            {action === 'approve' && (
              <Button variant="success" onClick={handleApprove}>
                Confirmar Aprovação
              </Button>
            )}
            {action === 'reject' && (
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason}
              >
                Confirmar Rejeição
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban confirmation dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Banir CPF
            </DialogTitle>
            <DialogDescription>
              Esta ação impedirá que este CPF envie novas denúncias.
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-2 text-sm rounded-lg bg-muted p-3">
              <p><strong>Nome:</strong> {selectedComplaint.citizenName}</p>
              <p><strong>CPF:</strong> {selectedComplaint.citizenCpf}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmBan}>
              <Ban className="h-4 w-4 mr-1" />
              Confirmar Banimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
