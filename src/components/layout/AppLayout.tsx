import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1" />
          </header>
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
          <footer className="border-t border-border py-4 px-6 text-center text-sm text-muted-foreground bg-card/30">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Idea by:</span> Arunangshu Roy • 
                <span className="font-medium ml-2">Developed by:</span> Puneet Kumar Garg
              </p>
              <div className="flex justify-center gap-4">
                <a 
                  href="https://github.com/puneet-kumar-garg" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub
                </a>
                <span className="text-muted-foreground/50">•</span>
                <a 
                  href="https://www.linkedin.com/in/puneet-kumar-garg/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
