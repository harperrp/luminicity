import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ModuleSelector } from '@/components/modules/ModuleSelector';
import { useModules } from '@/contexts/ModulesContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { MODULE_CONFIGS } from '@/types/modules';
import { BannedCpfsList, BannedCpfEntry } from '@/components/dashboard/BannedCpfsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, Ban, Filter, Copy, ExternalLink, MapPin, Clock,
  CheckCircle, XCircle, AlertCircle, Eye,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ComplaintStatus, REJECTION_REASONS } from '@/types';
import { api } from '@/lib/api';

interface ModuleComplaint {
  id: string;
  description: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  citizenCpf: string;
  citizenName: string;
  citizenPhone?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const statusConfig: Record<ComplaintStatus, { label: string; className: string; icon: typeof AlertCircle }> = {
  PENDENTE: { label: 'Pendente', className: 'status-badge-pending', icon: AlertCircle },
  APROVADA: { label: 'Aprovada', className: 'status-badge-approved', icon: CheckCircle },
  REJEITADA: { label: 'Rejeitada', className: 'status-badge-rejected', icon: XCircle },
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);

export default function ModuleComplaints() {
  const { currentModule } = useModules();
  const { activeCityHall } = useCityHall();
  const config = MODULE_CONFIGS[currentModule];
  const Icon = config.icon;

  const [statusFilter, setStatusFilter] = useState('all');
  const [bannedEntries, setBannedEntries] = useState<BannedCpfEntry[]>([]);
  const bannedCpfs = new Set(bannedEntries.map(e => e.cpf));

  // Mock complaints for this module
  const [complaints, setComplaints] = useState<ModuleComplaint[]>(() => {
    const types = config.occurrenceTypes;
    return [
      {
        id: `DEN-${currentModule.slice(0, 3)}-001`,
        description: `${types[0]} na região central da cidade`,
        latitude: -15.3989,
        longitude: -42.3091,
        status: 'PENDENTE',
        citizenCpf: '123.456.789-00',
        citizenName: 'José da Silva',
        citizenPhone: '(11) 98765-4321',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: `DEN-${currentModule.slice(0, 3)}-002`,
        description: `${types[1] || types[0]} reportado por cidadão`,
        latitude: -15.3970,
        longitude: -42.3080,
        status: 'PENDENTE',
        citizenCpf: '987.654.321-00',
        citizenName: 'Maria Santos',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
      },
      {
        id: `DEN-${currentModule.slice(0, 3)}-003`,
        description: `${types[2] || types[0]} identificado na via pública`,
        latitude: -15.4005,
        longitude: -42.3115,
        status: 'APROVADA',
        citizenCpf: '456.789.123-00',
        citizenName: 'Carlos Oliveira',
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-14'),
      },
    ];
  });

  const [selectedComplaint, setSelectedComplaint] = useState<ModuleComplaint | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [action, setAction] = useState<'view' | 'approve' | 'reject'>('view');
  const [rejectionReason, setRejectionReason] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    api.getComplaints({ cityHallId: activeCityHall.id, moduleId: currentModule })
      .then(items => setComplaints(items))
      .catch(() => undefined);

    api.getBannedCpfs(activeCityHall.id)
      .then(setBannedEntries)
      .catch(() => undefined);
  }, [activeCityHall.id, currentModule]);

  const handleBanCpf = useCallback((cpf: string, name: string) => {
    setBannedEntries(prev => {
      if (prev.some(e => e.cpf === cpf)) return prev;
      return [...prev, { cpf, name, bannedAt: new Date(), complaintsCount: 1 }];
    });
    api.banCpf(activeCityHall.id, cpf, name).catch(() => {
      toast.error('CPF bloqueado apenas localmente', { description: 'Verifique a conexao com a API.' });
    });
    toast.success(`CPF ${cpf} banido com sucesso`, { description: `Denúncias de ${name} serão bloqueadas.` });
  }, [activeCityHall.id]);

  const handleUnbanCpf = useCallback((cpf: string) => {
    setBannedEntries(prev => prev.filter(e => e.cpf !== cpf));
    api.unbanCpf(activeCityHall.id, cpf).catch(() => {
      toast.error('Desbloqueio aplicado apenas localmente', { description: 'Verifique a conexao com a API.' });
    });
  }, [activeCityHall.id]);

  const handleAction = (complaint: ModuleComplaint, actionType: 'view' | 'approve' | 'reject') => {
    setSelectedComplaint(complaint);
    setAction(actionType);
    setDialogOpen(true);
    setRejectionReason('');
    setObservations('');
  };

  const handleApprove = async () => {
    if (!selectedComplaint) return;
    try {
      const saved = await api.approveComplaint(selectedComplaint.id, observations);
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? saved : c));
      toast.success('Denuncia aprovada!');
    } catch {
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, status: 'APROVADA' as ComplaintStatus, updatedAt: new Date() } : c));
      toast.error('Denuncia atualizada apenas localmente', { description: 'Verifique a conexao com a API.' });
    }
    setDialogOpen(false);
  };

  const handleReject = async () => {
    if (!selectedComplaint || !rejectionReason) return;
    try {
      const saved = await api.rejectComplaint(selectedComplaint.id, rejectionReason, observations);
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? saved : c));
      toast.success('Denuncia rejeitada.');
    } catch {
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, status: 'REJEITADA' as ComplaintStatus, rejectionReason, updatedAt: new Date() } : c));
      toast.error('Denuncia atualizada apenas localmente', { description: 'Verifique a conexao com a API.' });
    }
    setDialogOpen(false);
  };

  const confirmBan = () => {
    if (selectedComplaint) {
      handleBanCpf(selectedComplaint.citizenCpf, selectedComplaint.citizenName);
      setBanDialogOpen(false);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (bannedCpfs.has(c.citizenCpf)) return false;
    if (statusFilter === 'pending') return c.status === 'PENDENTE';
    if (statusFilter === 'approved') return c.status === 'APROVADA';
    if (statusFilter === 'rejected') return c.status === 'REJEITADA';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ModuleSelector />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
              <Icon className={`h-7 w-7 ${config.color}`} />
              Denúncias — {config.shortName}
            </h1>
            <p className="text-muted-foreground">
              Gerencie as denúncias de {config.shortName.toLowerCase()} em {activeCityHall.city}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                const url = `${window.location.origin}/denuncia`;
                navigator.clipboard.writeText(url);
                toast.success('Link copiado!', { description: 'Envie este link para os cidadãos fazerem denúncias.' });
              }}
            >
              <Copy className="h-4 w-4" />
              Copiar Link
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.open('/denuncia', '_blank')}>
              <ExternalLink className="h-4 w-4" />
              Visualizar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="complaints" className="space-y-4">
          <TabsList>
            <TabsTrigger value="complaints" className="gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Denúncias
            </TabsTrigger>
            <TabsTrigger value="banned" className="gap-1.5">
              <Ban className="h-4 w-4" />
              CPFs Banidos
              {bannedEntries.length > 0 && (
                <span className="ml-1 rounded-full bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 font-bold">
                  {bannedEntries.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="complaints">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Lista de Denúncias
                    </CardTitle>
                    <CardDescription>
                      Aprove ou rejeite denúncias de {config.shortName.toLowerCase()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="approved">Aprovadas</SelectItem>
                        <SelectItem value="rejected">Rejeitadas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredComplaints.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                      <p className="text-lg font-medium">Nenhuma denúncia encontrada</p>
                      <p className="text-muted-foreground">Não há denúncias com o filtro selecionado.</p>
                    </div>
                  ) : (
                    filteredComplaints.map(complaint => {
                      const status = statusConfig[complaint.status];
                      const StatusIcon = status.icon;
                      return (
                        <div key={complaint.id} className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
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
                              <p className="text-xs text-muted-foreground">Denunciante: {complaint.citizenName}</p>
                              {complaint.rejectionReason && (
                                <p className="text-xs text-destructive">Motivo: {complaint.rejectionReason}</p>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button variant="ghost" size="sm" onClick={() => handleAction(complaint, 'view')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!bannedCpfs.has(complaint.citizenCpf) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => { setSelectedComplaint(complaint); setBanDialogOpen(true); }}
                                  title="Banir CPF"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              )}
                              {complaint.status === 'PENDENTE' && (
                                <>
                                  <Button variant="success" size="sm" onClick={() => handleAction(complaint, 'approve')}>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleAction(complaint, 'reject')}>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Rejeitar
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banned">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  CPFs Banidos
                </CardTitle>
                <CardDescription>Gerencie CPFs bloqueados para controle de spam</CardDescription>
              </CardHeader>
              <CardContent>
                <BannedCpfsList bannedEntries={bannedEntries} onUnban={handleUnbanCpf} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
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
                  {selectedComplaint.citizenPhone && <p><strong>Telefone:</strong> {selectedComplaint.citizenPhone}</p>}
                  <p><strong>Data:</strong> {formatDate(selectedComplaint.createdAt)}</p>
                </div>
                {action === 'reject' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Motivo da Rejeição *</label>
                    <Select value={rejectionReason} onValueChange={setRejectionReason}>
                      <SelectTrigger><SelectValue placeholder="Selecione um motivo" /></SelectTrigger>
                      <SelectContent>
                        {REJECTION_REASONS.map(reason => (
                          <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {(action === 'approve' || action === 'reject') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Observações</label>
                    <Textarea value={observations} onChange={e => setObservations(e.target.value)} placeholder="Observações adicionais..." rows={3} />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {action === 'view' ? 'Fechar' : 'Cancelar'}
              </Button>
              {action === 'approve' && <Button variant="success" onClick={handleApprove}>Confirmar Aprovação</Button>}
              {action === 'reject' && <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>Confirmar Rejeição</Button>}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban Dialog */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Ban className="h-5 w-5" />
                Banir CPF
              </DialogTitle>
              <DialogDescription>Esta ação impedirá que este CPF envie novas denúncias.</DialogDescription>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-2 text-sm rounded-lg bg-muted p-3">
                <p><strong>Nome:</strong> {selectedComplaint.citizenName}</p>
                <p><strong>CPF:</strong> {selectedComplaint.citizenCpf}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmBan}>
                <Ban className="h-4 w-4 mr-1" />
                Confirmar Banimento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
