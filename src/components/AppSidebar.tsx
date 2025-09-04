import { useLocation, NavLink } from "react-router-dom";
import { Home, FileText, BarChart3, Settings, LogOut, User, BookOpen } from "lucide-react";
import logoUsm from "@/assets/logo-usm.png";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Convocatorias", url: "/convocatorias", icon: FileText },
  { title: "Manual de Uso", url: "/manual", icon: BookOpen },
];

const adminMenuItems = [
  { title: "Estadísticas", url: "/estadisticas", icon: BarChart3 },
  { title: "Configuración", url: "/configuracion", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user?.email === "admin@usm.edu.co") {
        setIsAdmin(true);
        setRole("administrador");
      } else if (user?.email === "rectoria@usm.edu.co") {
        setIsAdmin(false);
        setRole("centro de información");
      } else {
        setIsAdmin(false);
        setRole("usuario");
      }
    });
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

  return (
    <Sidebar className={collapsed ? "w-14" : "w-48 sm:w-60"} collapsible="icon">
      <SidebarHeader>
        <div className="px-2 sm:px-4 py-4 space-y-3">
          <div className="flex flex-col items-center gap-2">
            <div className={collapsed ? "w-8 h-8 sm:w-10 sm:h-10" : "w-full max-w-[180px] sm:max-w-[200px]"}>
              <img 
                src={logoUsm} 
                alt="Logo USM" 
                className={`w-full h-auto object-contain ${collapsed ? "max-h-8 sm:max-h-10" : "max-h-12 sm:max-h-16"}`}
              />
            </div>
            {!collapsed && (
              <div className="text-center w-full px-1">
                <h2 className="text-xs sm:text-sm font-bold text-foreground leading-tight break-words">
                  MAPEO DE CONVOCATORIAS USM
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground break-words">
                  Institución Universitaria de Santa Marta
                </p>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-medium truncate">{user?.email}</span>
                <Badge variant={isAdmin ? "default" : "secondary"} className="w-fit text-[10px] sm:text-xs">
                  {role}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm">Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      {!collapsed && <span className="text-xs sm:text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isAdmin || user?.email === "rectoria@usm.edu.co") && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs sm:text-sm">
              {isAdmin ? "Administrador" : "Centro de Información"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        {!collapsed && <span className="text-xs sm:text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-xs sm:text-sm"
              size="sm"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              {!collapsed && <span className="ml-2">Cerrar Sesión</span>}
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}