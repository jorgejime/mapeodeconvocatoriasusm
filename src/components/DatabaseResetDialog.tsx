import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DatabaseResetDialogProps {
  userEmail: string;
  isAdmin: boolean;
}

export function DatabaseResetDialog({ userEmail, isAdmin }: DatabaseResetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [adminEmailConfirmation, setAdminEmailConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const REQUIRED_PHRASE = "BORRAR TODO DEFINITIVAMENTE";

  // No mostrar si no es admin
  if (!isAdmin) {
    return null;
  }

  const handleFirstConfirmation = () => {
    setIsOpen(false);
    setShowFinalConfirmation(true);
  };

  const handleReset = async () => {
    if (confirmationPhrase !== REQUIRED_PHRASE) {
      toast({
        title: "Error de confirmación",
        description: `Debes escribir exactamente: "${REQUIRED_PHRASE}"`,
        variant: "destructive",
      });
      return;
    }

    if (adminEmailConfirmation !== userEmail) {
      toast({
        title: "Error de confirmación",
        description: "El email no coincide con tu email de administrador",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the current session to send the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('reset-database', {
        body: {
          confirmationPhrase: confirmationPhrase,
          adminEmail: adminEmailConfirmation,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error calling reset function:', error);
        throw new Error(error.message || 'Error al ejecutar el reset');
      }

      if (data?.success) {
        toast({
          title: "✅ Base de datos reseteada",
          description: `Se eliminaron ${data.deletedCount} registros exitosamente`,
          duration: 5000,
        });
        
        // Reset form
        setConfirmationPhrase("");
        setAdminEmailConfirmation("");
        setShowFinalConfirmation(false);
        
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(data?.error || 'Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: "❌ Error al resetear",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setConfirmationPhrase("");
    setAdminEmailConfirmation("");
    setShowFinalConfirmation(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón principal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="destructive" 
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Resetear Base de Datos
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              ⚠️ PELIGRO - Confirmación Requerida
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p className="font-semibold text-red-700">
                Esta acción es IRREVERSIBLE y eliminará TODOS los datos:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Todas las convocatorias registradas</li>
                <li>Toda la información asociada</li>
                <li>No se puede deshacer esta operación</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>ADVERTENCIA FINAL:</strong> Todos los datos se perderán permanentemente.
              Asegúrate de haber exportado cualquier información importante.
            </AlertDescription>
          </Alert>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleFirstConfirmation}
              className="bg-red-600 hover:bg-red-700"
            >
              Entiendo, continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación final */}
      <AlertDialog open={showFinalConfirmation} onOpenChange={setShowFinalConfirmation}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              🚨 CONFIRMACIÓN FINAL
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="font-semibold">
                  Para confirmar que realmente deseas eliminar TODOS los datos, 
                  completa los siguientes campos:
                </p>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="phrase" className="text-sm font-medium">
                      Escribe exactamente: <span className="font-mono bg-gray-100 px-1 rounded">
                        {REQUIRED_PHRASE}
                      </span>
                    </Label>
                    <Input
                      id="phrase"
                      value={confirmationPhrase}
                      onChange={(e) => setConfirmationPhrase(e.target.value)}
                      placeholder="Escribe la frase exacta aquí..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Confirma tu email de administrador:
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={adminEmailConfirmation}
                      onChange={(e) => setAdminEmailConfirmation(e.target.value)}
                      placeholder={userEmail}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">
                    Una vez ejecutada, esta acción no se puede deshacer. 
                    Todos los datos serán eliminados permanentemente.
                  </AlertDescription>
                </Alert>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={resetForm}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={
                isLoading || 
                confirmationPhrase !== REQUIRED_PHRASE || 
                adminEmailConfirmation !== userEmail
              }
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  ELIMINAR TODO
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}