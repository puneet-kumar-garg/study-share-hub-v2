import { ReactNode, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, X, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('requests').insert({
      user_id: user!.id,
      email: user!.email,
      message: message.trim(),
    });
    setLoading(false);
    if (error) {
      toast.error('Failed to send request');
    } else {
      toast.success('Request sent to admin!');
      setMessage('');
      setOpen(false);
    }
  };
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

          {/* Floating request button */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {open && (
              <div className="bg-card border border-border rounded-xl shadow-xl p-4 w-80 animate-fade-in">
                <p className="font-semibold text-sm mb-3">Send a Request to Admin</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Textarea
                    placeholder="Write your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    required
                    className="text-sm"
                  />
                  <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </form>
              </div>
            )}
            <Button
              onClick={() => setOpen(prev => !prev)}
              className="w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-lg hover:opacity-90"
            >
              {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </Button>
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
