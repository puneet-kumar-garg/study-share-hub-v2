import { useEffect, useState } from 'react';
import { User, Calendar, Upload, Download, FileText, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { getSubjectById } from '@/lib/constants';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Worksheet {
  id: string;
  title: string;
  subject: string;
  status: 'completed' | 'unsolved';
  download_count: number;
  created_at: string;
  file_path: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) return;

      try {
        const { data: worksheetsData } = await supabase
          .from('worksheets')
          .select('id, title, subject, status, download_count, created_at, file_path')
          .eq('uploader_id', user.id)
          .order('created_at', { ascending: false });

        setWorksheets(worksheetsData || []);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [user]);

  const handleDelete = async (worksheetId: string, filePath: string) => {
    setDeletingId(worksheetId);
    try {
      await supabase.storage.from('worksheets').remove([filePath]);

      const { error } = await supabase
        .from('worksheets')
        .delete()
        .eq('id', worksheetId);

      if (error) throw error;

      setWorksheets(prev => prev.filter(w => w.id !== worksheetId));
      toast.success('Worksheet deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete worksheet');
    } finally {
      setDeletingId(null);
    }
  };

  const totalDownloads = worksheets.reduce((sum, w) => sum + w.download_count, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Card */}
      <Card className="border-border/50 overflow-hidden">
        <div className="h-24 gradient-hero" />
        <CardContent className="pt-0 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center border-4 border-card shadow-lg">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {user?.user_metadata?.full_name || 'User'}
              </h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Joined</span>
              </div>
              <p className="font-semibold text-foreground">
                {format(new Date(), 'MMM yyyy')}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <Upload className="w-4 h-4" />
                <span className="text-xs">Uploads</span>
              </div>
              <p className="font-semibold text-foreground">{worksheets.length}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <Download className="w-4 h-4" />
                <span className="text-xs">Downloads</span>
              </div>
              <p className="font-semibold text-foreground">{totalDownloads}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs">Total</span>
              </div>
              <p className="font-semibold text-foreground">{worksheets.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worksheets List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Worksheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {worksheets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You haven't uploaded any worksheets yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {worksheets.map(worksheet => {
                const subject = getSubjectById(worksheet.subject);
                return (
                  <div
                    key={worksheet.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {worksheet.title}
                        </h3>
                        <Badge
                          variant="default"
                          className="bg-success/20 text-success border border-success/30"
                        >
                          completed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{subject?.shortName}</span>
                        <span>{format(new Date(worksheet.created_at), 'MMM d, yyyy')}</span>
                        <span>{worksheet.download_count} downloads</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {deletingId === worksheet.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Worksheet</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{worksheet.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(worksheet.id, worksheet.file_path)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
