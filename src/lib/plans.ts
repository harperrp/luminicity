import type { SubscriptionPlanId } from '@/types';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  label: string;
  poleLimit: number;
  description: string;
}

export const DEFAULT_PLAN_ID: SubscriptionPlanId = 'STARTER';

export const PLAN_CONFIGS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  STARTER: {
    id: 'STARTER',
    label: 'Essencial',
    poleLimit: 500,
    description: 'Para municipios pequenos iniciando o cadastro.',
  },
  PRO: {
    id: 'PRO',
    label: 'Pro',
    poleLimit: 2000,
    description: 'Para operacao municipal completa.',
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    label: 'Escala',
    poleLimit: 10000,
    description: 'Para cidades maiores e operacoes regionais.',
  },
};

export const PLAN_OPTIONS = Object.values(PLAN_CONFIGS);

export function getPlanConfig(planId?: SubscriptionPlanId): SubscriptionPlan {
  return PLAN_CONFIGS[planId ?? DEFAULT_PLAN_ID];
}

export function getDefaultPoleLimit(planId?: SubscriptionPlanId): number {
  return getPlanConfig(planId).poleLimit;
}

export function resolvePoleLimit(planId?: SubscriptionPlanId, customLimit?: number): number {
  return customLimit && customLimit > 0 ? customLimit : getDefaultPoleLimit(planId);
}

export function formatPoleLimit(limit: number): string {
  return limit.toLocaleString('pt-BR');
}

export function getPoleUsage(currentCount: number, poleLimit: number) {
  const remaining = Math.max(poleLimit - currentCount, 0);
  const percent = poleLimit > 0 ? Math.min(Math.round((currentCount / poleLimit) * 100), 100) : 100;

  return {
    remaining,
    percent,
    isAtLimit: remaining === 0,
    isNearLimit: percent >= 90,
  };
}
