import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Request {
  id: string;
  message: string;
  status: string;
  reply: string | null;
  created_at: string;
}

export default function Requests() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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
      fetchRequests();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Send Request</h1>
        <p className="text-muted-foreground">Send a message or request to the admin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            New Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Write your message or request here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
            <Button type="submit" disabled={loading} className="gradient-primary text-primary-foreground">
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            My Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No requests sent yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(req.created_at), 'MMM d, yyyy • h:mm a')}
                    </span>
                    <Badge variant={req.status === 'pending' ? 'secondary' : 'default'}>
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-sm">{req.message}</p>
                  {req.reply && (
                    <div className="bg-muted/50 rounded p-2 text-sm">
                      <span className="font-medium text-xs text-primary">Admin reply: </span>
                      {req.reply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
