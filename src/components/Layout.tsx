import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import logoUsm from "@/assets/logo-usm.png";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-4">
            <SidebarTrigger />
            <div className="ml-4 flex items-center gap-3">
              <img src={logoUsm} alt="Logo USM" className="h-8 w-auto" />
              <div>
                <h1 className="font-semibold text-lg">MAPEO DE CONVOCATORIAS USM</h1>
                <p className="text-xs text-muted-foreground">Institución Universitaria de Santa Marta</p>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          <footer className="border-t bg-card/30 px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground">
              Desarrollada por <span className="font-semibold text-foreground">JORGE JIMÉNEZ</span> - Líder IA
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};