import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

function AnimatedCounter({ value }: { value: string | number }) {
  const [displayed, setDisplayed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span className={cn(
      'inline-block transition-all duration-700',
      displayed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'
    )}>
      {value}
    </span>
  );
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const iconColorClasses = {
    default: 'bg-primary/15 text-primary ring-1 ring-primary/20',
    success: 'bg-success/15 text-success ring-1 ring-success/20',
    warning: 'bg-warning/15 text-warning ring-1 ring-warning/20',
    destructive: 'bg-destructive/15 text-destructive ring-1 ring-destructive/20',
  };

  const glowClasses = {
    default: 'hover:shadow-[0_0_30px_-8px_hsl(217_91%_60%_/_0.2)]',
    success: 'hover:shadow-[0_0_30px_-8px_hsl(142_72%_40%_/_0.2)]',
    warning: 'hover:shadow-[0_0_30px_-8px_hsl(38_92%_50%_/_0.2)]',
    destructive: 'hover:shadow-[0_0_30px_-8px_hsl(0_72%_51%_/_0.2)]',
  };

  return (
    <div className={cn(
      'group relative rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 shadow-sm',
      'hover:shadow-lg hover:border-border/80 transition-all duration-300 hover:-translate-y-0.5',
      glowClasses[variant]
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">
            <AnimatedCounter value={value} />
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs font-medium flex items-center gap-1',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-current/10">
                {trend.isPositive ? '↑' : '↓'}
              </span>
              {Math.abs(trend.value)}% em relação ao mês anterior
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            iconColorClasses[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
