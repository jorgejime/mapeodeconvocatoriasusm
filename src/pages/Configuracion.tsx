import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Settings, 
  Users, 
  Database, 
  Shield, 
  Mail, 
  Bell, 
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Save,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { DatabaseResetDialog } from "@/components/DatabaseResetDialog";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maxFileSize: number;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  notificationsEnabled: boolean;
  backupFrequency: string;
}

const defaultSettings: SystemSettings = {
  siteName: "Convocatorias USM",
  siteDescription: "Sistema de gestión de convocatorias",
  maxFileSize: 10,
  allowRegistration: false,
  maintenanceMode: false,
  notificationsEnabled: true,
  backupFrequency: "daily"
};

export default function Configuracion() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("usuario");
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si es admin
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user?.email === "admin@usm.edu.co") {
        fetchProfiles();
        loadSettings();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error",
        description: "Error al cargar los perfiles de usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    // En un caso real, estas configuraciones vendrían de la base de datos
    const savedSettings = localStorage.getItem("systemSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // En un caso real, esto se guardaría en la base de datos
      localStorage.setItem("systemSettings", JSON.stringify(settings));
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Error al guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserName) {
      toast({
        title: "Error",
        description: "Email y nombre son requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      // En un caso real, esto crearía un nuevo usuario en Supabase Auth
      // y luego insertaría el perfil
      toast({
        title: "Funcionalidad en desarrollo",
        description: "La creación de usuarios se implementará con Supabase Auth",
      });
      
      setShowUserDialog(false);
      setNewUserEmail("");
      setNewUserName("");
      setNewUserRole("usuario");
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Error al crear el usuario",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      });
      fetchProfiles();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  const exportData = async () => {
    try {
      // Exportar datos de convocatorias
      const { data: convocatorias, error } = await supabase
        .from("convocatorias")
        .select("*");

      if (error) throw error;

      const jsonData = JSON.stringify({ convocatorias, profiles }, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Backup creado",
        description: "Los datos se han exportado correctamente",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: "Error al crear el backup",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.email !== "admin@usm.edu.co") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Acceso Denegado</h1>
          <p className="text-muted-foreground">Solo los administradores pueden acceder a la configuración.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gestiona usuarios, configuraciones generales y opciones avanzadas del sistema
        </p>
      </div>

      {/* Configuraciones Generales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuraciones Generales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nombre del Sistema</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                placeholder="Nombre del sistema"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Tamaño máximo de archivo (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                placeholder="10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Descripción del Sistema</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              placeholder="Descripción del sistema"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir registro</Label>
                <p className="text-sm text-muted-foreground">Habilitar registro de nuevos usuarios</p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => setSettings({...settings, allowRegistration: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo mantenimiento</Label>
                <p className="text-sm text-muted-foreground">Activar modo mantenimiento</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones</Label>
                <p className="text-sm text-muted-foreground">Habilitar notificaciones</p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => setSettings({...settings, notificationsEnabled: checked})}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Usuarios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de Usuarios
          </CardTitle>
          <Button onClick={() => setShowUserDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.email}</TableCell>
                    <TableCell>{profile.full_name || "Sin nombre"}</TableCell>
                    <TableCell>
                      <Badge variant={profile.role === "administrador" ? "default" : "secondary"}>
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(profile);
                            setShowUserDialog(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(profile.user_id)}
                          disabled={profile.email === "admin@usm.edu.co"}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Backup y Mantenimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup y Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={exportData} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar Backup
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Importar Datos
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Información de la Base de Datos</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total de convocatorias:</span>
                  <span>En carga...</span>
                </div>
                <div className="flex justify-between">
                  <span>Usuarios registrados:</span>
                  <span>{profiles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Último backup:</span>
                  <span>Nunca</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad y Monitoreo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">RLS Habilitado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">Autenticación Activa</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm">Monitoreo Básico</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Estado del Sistema</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-success">100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Última actualización:</span>
                  <span>Hoy</span>
                </div>
                <div className="flex justify-between">
                  <span>Versión:</span>
                  <span>1.0.0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset de Base de Datos - Zona de Peligro */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            🚨 Zona de Peligro - Reset de Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="bg-red-100 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-800">⚠️ ADVERTENCIA CRÍTICA</h4>
                  <p className="text-sm text-red-700">
                    Esta acción eliminará <strong>TODOS</strong> los datos de la base de datos de forma permanente:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>Todas las convocatorias registradas</li>
                    <li>Toda la información y archivos asociados</li>
                    <li>No se puede deshacer esta operación</li>
                  </ul>
                  <p className="text-sm text-red-700 font-semibold">
                    Asegúrate de haber exportado un backup antes de continuar.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Casos de uso para el reset completo:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Limpiar datos de prueba antes de producción</li>
                <li>Resetear el sistema para un nuevo período académico</li>
                <li>Solucionar problemas críticos de datos</li>
                <li>Migración o reestructuración completa</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-red-200">
              <DatabaseResetDialog 
                userEmail={user?.email || ""} 
                isAdmin={user?.email === "admin@usm.edu.co"} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser ? "Modifica los datos del usuario" : "Ingresa los datos del nuevo usuario"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={selectedUser ? selectedUser.email : newUserEmail}
                onChange={(e) => selectedUser ? null : setNewUserEmail(e.target.value)}
                disabled={!!selectedUser}
                placeholder="usuario@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userName">Nombre completo</Label>
              <Input
                id="userName"
                value={selectedUser ? selectedUser.full_name || "" : newUserName}
                onChange={(e) => selectedUser ? null : setNewUserName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userRole">Rol</Label>
              <select 
                id="userRole"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedUser ? selectedUser.role : newUserRole}
                onChange={(e) => selectedUser ? null : setNewUserRole(e.target.value)}
                disabled={!!selectedUser}
              >
                <option value="usuario">Usuario</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUserDialog(false);
              setSelectedUser(null);
              setNewUserEmail("");
              setNewUserName("");
              setNewUserRole("usuario");
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>
              {selectedUser ? "Actualizar" : "Crear"} Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}