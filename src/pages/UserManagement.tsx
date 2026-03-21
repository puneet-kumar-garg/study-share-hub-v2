import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, UserMinus, Shield, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { isAdmin, grantUploadPermission, revokeUploadPermission } from '@/lib/permissions';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UserPermission {
  id: string;
  email: string;
  can_upload: boolean;
  created_at: string;
}

interface Request {
  id: string;
  email: string;
  message: string;
  status: string;
  reply: string | null;
  created_at: string;
}

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  if (!user || !isAdmin(user.email || '')) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

  const fetchData = async () => {
    try {
      const [{ data: usersData }, { data: reqData }] = await Promise.all([
        supabase.from('user_permissions').select('*').order('created_at', { ascending: false }),
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
      ]);
      setUsers(usersData || []);
      setRequests(reqData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrantPermission = async () => {
    if (!newUserEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    const success = await grantUploadPermission(newUserEmail);
    if (success) {
      toast.success('Upload permission granted');
      setNewUserEmail('');
      fetchData();
    } else {
      toast.error('Failed to grant permission');
    }
  };

  const handleRevokePermission = async (email: string) => {
    const success = await revokeUploadPermission(email);
    if (success) {
      toast.success('Upload permission revoked');
      fetchData();
    } else {
      toast.error('Failed to revoke permission');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage users and view requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            User Requests ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{req.email}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(req.created_at), 'MMM d, yyyy • h:mm a')}
                      </span>
                      <Badge variant={req.status === 'pending' ? 'secondary' : 'default'}>
                        {req.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{req.message}</p>
                  {req.reply && (
                    <div className="bg-muted/50 rounded p-2 text-sm">
                      <span className="font-medium text-xs text-primary">Admin reply: </span>
                      {req.reply}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Input
                      placeholder="Write a reply..."
                      value={replyText[req.id] || ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [req.id]: e.target.value }))}
                      className="text-sm h-8"
                    />
                    <Button
                      size="sm"
                      className="h-8 gradient-primary text-primary-foreground"
                      onClick={async () => {
                        if (!replyText[req.id]?.trim()) return;
                        const { error } = await supabase
                          .from('requests')
                          .update({ reply: replyText[req.id], status: 'replied' })
                          .eq('id', req.id);
                        if (error) {
                          toast.error('Failed to send reply');
                        } else {
                          toast.success('Reply sent!');
                          setReplyText(prev => ({ ...prev, [req.id]: '' }));
                          fetchData();
                        }
                      }}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Grant Upload Permission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleGrantPermission} className="gradient-primary text-primary-foreground">
                Grant Access
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Current Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">No users found</p>
          ) : (
            <div className="space-y-3">
              {users.map(userPerm => (
                <div key={userPerm.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{userPerm.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Added {new Date(userPerm.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={userPerm.can_upload ? 'default' : 'secondary'}>
                      {userPerm.can_upload ? 'Can Upload' : 'Viewer'}
                    </Badge>
                    {userPerm.can_upload && userPerm.email !== user.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokePermission(userPerm.email)}
                        className="text-destructive hover:text-destructive"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
