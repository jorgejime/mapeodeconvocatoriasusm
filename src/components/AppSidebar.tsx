import { useLocation, NavLink } from "react-router-dom";
import { Home, FileText, BarChart3, Settings, LogOut, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, adminOnly: false },
  { title: "Convocatorias", url: "/convocatorias", icon: FileText, adminOnly: false },
  { title: "Estadísticas", url: "/estadisticas", icon: BarChart3, adminOnly: false },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { isAdmin, canManage } = useUserRole(user);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getUserBadge = () => {
    if (isAdmin) {
      return <Badge className="bg-primary text-primary-foreground">Admin</Badge>;
    } else {
      return <Badge variant="outline">Usuario</Badge>;
    }
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <div className="px-4 py-2">
          {!collapsed && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Convocatorias USM
              </h2>
              {user?.email && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground truncate">
                    {user.email.split('@')[0]}
                  </span>
                  {getUserBadge()}
                </div>
              )}
            </div>
          )}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {!collapsed && canManage && (
          <div className="px-4 py-2">
            <div className="p-2 bg-primary/5 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Permisos de Administrador:</strong> Crear, editar y eliminar convocatorias
              </p>
            </div>
          </div>
        )}
        
        {!collapsed && !canManage && (
          <div className="px-4 py-2">
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Usuario de Consulta:</strong> Solo visualización y filtros
              </p>
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Cerrar Sesión</span>}
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}