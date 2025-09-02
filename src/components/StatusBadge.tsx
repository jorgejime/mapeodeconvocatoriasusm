import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "verde" | "amarillo" | "rojo";
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge = ({ status, children, className }: StatusBadgeProps) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "verde":
        return "bg-success text-success-foreground hover:bg-success/80";
      case "amarillo":
        return "bg-warning text-warning-foreground hover:bg-warning/80";
      case "rojo":
        return "bg-danger text-danger-foreground hover:bg-danger/80";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Badge className={cn(getStatusStyle(status), className)}>
      {children}
    </Badge>
  );
};