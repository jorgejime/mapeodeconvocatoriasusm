import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 sm:h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-2 sm:px-4">
            <SidebarTrigger className="mr-2" />
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-base font-medium truncate">Sistema de Mapeo de Convocatorias</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            {children}
          </main>
          <footer className="border-t bg-card/30 px-2 sm:px-4 py-2 sm:py-3">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Desarrollada por <span className="font-semibold text-foreground">JORGE JIMÉNEZ CALVANO</span>
              <span className="hidden sm:inline"> - Líder IA | jorge@centroeidea.com</span>
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};