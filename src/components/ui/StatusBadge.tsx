import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  isActive: boolean;
};

const StatusBadge = ({ isActive }: StatusBadgeProps) => {
  const baseClasses = "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-white";
  const activeClasses = "bg-success-green";
  const inactiveClasses = "bg-danger-red";

  return (
    <div className={cn(baseClasses, isActive ? activeClasses : inactiveClasses)}>
      {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      <span>{isActive ? "Aktywny" : "Nieaktywny"}</span>
    </div>
  );
};

export default StatusBadge;