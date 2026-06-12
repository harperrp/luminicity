import { ALL_MODULES, MODULE_CONFIGS, ModuleType } from '@/types/modules';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ModuleActivationCheckboxesProps {
  activeModules: ModuleType[];
  onChange: (modules: ModuleType[]) => void;
}

export function ModuleActivationCheckboxes({ activeModules, onChange }: ModuleActivationCheckboxesProps) {
  const toggleModule = (moduleId: ModuleType) => {
    if (activeModules.includes(moduleId)) {
      // Don't allow removing the last module
      if (activeModules.length === 1) return;
      onChange(activeModules.filter(m => m !== moduleId));
    } else {
      onChange([...activeModules, moduleId]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Módulos Ativos</Label>
      <p className="text-xs text-muted-foreground">Selecione os módulos que esta prefeitura terá acesso</p>
      <div className="grid grid-cols-2 gap-3">
        {ALL_MODULES.map(moduleId => {
          const config = MODULE_CONFIGS[moduleId];
          const Icon = config.icon;
          const isChecked = activeModules.includes(moduleId);

          return (
            <label
              key={moduleId}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                isChecked ? 'border-primary/30 bg-primary/5' : 'border-border hover:bg-secondary'
              }`}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggleModule(moduleId)}
              />
              <Icon className={`h-4 w-4 ${config.color}`} />
              <span className="text-sm font-medium">{config.shortName}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
