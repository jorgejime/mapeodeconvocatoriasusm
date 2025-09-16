import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SecurityNotification } from "@/components/SecurityNotification";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40 flex items-center px-4 sm:px-6">
            <SidebarTrigger className="mr-2 sm:mr-4" />
            <div className="flex-1">
              <h1 className="text-sm sm:text-base font-medium text-foreground">Convocatorias USM</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      <SecurityNotification />
    </SidebarProvider>
  );
};