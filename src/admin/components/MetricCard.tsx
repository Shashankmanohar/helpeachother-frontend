import { LucideIcon } from "lucide-react";
import { formatCurrency, formatNumber } from "@admin/lib/formatters";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  isCurrency?: boolean;
  trend?: { value: number; label: string };
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const iconBgStyles = {
  default: "bg-muted",
  primary: "bg-primary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  destructive: "bg-destructive/10",
};

export function MetricCard({ title, value, icon: Icon, isCurrency, trend, variant = "default" }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">{title}</p>
          <p className={`mt-1.5 text-lg font-bold sm:mt-2 sm:text-2xl ${variantStyles[variant]}`}>
            {isCurrency ? formatCurrency(value) : formatNumber(value)}
          </p>
          {trend && (
            <p className={`mt-0.5 text-[10px] sm:mt-1 sm:text-xs ${trend.value >= 0 ? "text-success" : "text-destructive"}`}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`ml-2 flex-shrink-0 rounded-xl p-2 sm:rounded-lg sm:p-2.5 ${iconBgStyles[variant]}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${variantStyles[variant]}`} />
        </div>
      </div>
    </div>
  );
}
