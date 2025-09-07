import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";

export const SecurityNotification = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show security notification only once per session
    const hasSeenNotification = sessionStorage.getItem('security-notification-seen');
    if (!hasSeenNotification) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('security-notification-seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-blue-200 bg-blue-50 text-blue-800">
        <Shield className="h-4 w-4" />
        <AlertDescription className="pr-8">
          <div className="space-y-2">
            <p className="font-medium">🛡️ Seguridad Reforzada</p>
            <p className="text-sm">
              Se han implementado mejoras de seguridad en el sistema. 
              Recuerda usar credenciales seguras y cerrar sesión al finalizar.
            </p>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-blue-100"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </Alert>
    </div>
  );
};