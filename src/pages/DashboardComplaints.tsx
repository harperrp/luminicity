import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ComplaintsList } from '@/components/dashboard/ComplaintsList';
import { BannedCpfsList, BannedCpfEntry } from '@/components/dashboard/BannedCpfsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Ban, Filter, Copy, ExternalLink } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export default function DashboardComplaints() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [bannedEntries, setBannedEntries] = useState<BannedCpfEntry[]>([]);

  const bannedCpfs = new Set(bannedEntries.map(e => e.cpf));

  const handleBanCpf = useCallback((cpf: string, name: string) => {
    setBannedEntries(prev => {
      if (prev.some(e => e.cpf === cpf)) return prev;
      return [
        ...prev,
        {
          cpf,
          name,
          bannedAt: new Date(),
          complaintsCount: 1,
        },
      ];
    });
    toast.success(`CPF ${cpf} banido com sucesso`, {
      description: `Denúncias de ${name} serão bloqueadas.`,
    });
  }, []);

  const handleUnbanCpf = useCallback((cpf: string) => {
    setBannedEntries(prev => prev.filter(e => e.cpf !== cpf));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Denúncias</h1>
            <p className="text-muted-foreground">
              Gerencie as denúncias recebidas dos cidadãos
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
                toast.success('Link copiado!', {
                  description: 'Envie este link para os cidadãos fazerem denúncias.',
                });
              }}
            >
              <Copy className="h-4 w-4" />
              Copiar Link de Denúncia
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => window.open('/denuncia', '_blank')}
            >
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
                      Aprove ou rejeite denúncias de postes com problemas
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
                <ComplaintsList
                  bannedCpfs={bannedCpfs}
                  onBanCpf={handleBanCpf}
                  onUnbanCpf={handleUnbanCpf}
                />
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
                <CardDescription>
                  Gerencie CPFs bloqueados para controle de spam
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BannedCpfsList
                  bannedEntries={bannedEntries}
                  onUnban={handleUnbanCpf}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
