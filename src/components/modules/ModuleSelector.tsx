import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_MODULES, MODULE_CONFIGS, ModuleType } from '@/types/modules';
import { useModules } from '@/contexts/ModulesContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ModuleSelector() {
  const { currentModule, setCurrentModule, isModuleActive } = useModules();
  const { activeCityHall } = useCityHall();
  const { hasPermission, canAccessModule } = useAuth();
  const [lockedDialogOpen, setLockedDialogOpen] = useState(false);

  const isAdmin = hasPermission(['ADMIN']);

  return (
    <>
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {ALL_MODULES.map(moduleId => {
          const config = MODULE_CONFIGS[moduleId];
          const Icon = config.icon;
          const isActive = isModuleActive(activeCityHall.id, moduleId);
          const hasModuleAccess = canAccessModule(moduleId);
          const isCurrent = currentModule === moduleId;

          if ((!isActive || !hasModuleAccess) && !isAdmin) return null;

          return (
            <TooltipProvider key={moduleId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (!isActive || !hasModuleAccess) {
                        setLockedDialogOpen(true);
                        return;
                      }
                      setCurrentModule(moduleId);
                    }}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
                      isCurrent && isActive && hasModuleAccess
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : isActive && hasModuleAccess
                          ? 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          : 'text-muted-foreground/50 cursor-not-allowed opacity-60'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{config.shortName}</span>
                    {(!isActive || !hasModuleAccess) && <Lock className="h-3 w-3 ml-1" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isActive ? config.name : `${config.name} — Módulo não ativado`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      <Dialog open={lockedDialogOpen} onOpenChange={setLockedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              Módulo Não Disponível
            </DialogTitle>
            <DialogDescription className="pt-2">
              Sua prefeitura não tem acesso a este módulo. Converse com nossa equipe para ativação.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setLockedDialogOpen(false)}>
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
