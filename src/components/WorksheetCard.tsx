import { Download, Calendar, User, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { getSubjectById } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
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

interface WorksheetCardProps {
  id: string;
  title: string;
  description?: string | null;
  subject: string;
  status: 'completed' | 'unsolved';
  uploadedBy: string;
  uploadDate: string;
  downloadCount: number;
  filePath: string;
  fileName: string;
  uploaderId: string;
  onDownload?: () => void;
  onDelete?: () => void;
}

export function WorksheetCard({
  id,
  title,
  description,
  subject,
  status,
  uploadedBy,
  uploadDate,
  downloadCount,
  filePath,
  fileName,
  uploaderId,
  onDownload,
  onDelete,
}: WorksheetCardProps) {
  const { user } = useAuth();
  const subjectInfo = getSubjectById(subject);
  const canDelete = user?.id === uploaderId;

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('worksheets')
        .download(filePath);
      
      if (error) {
        console.error('Storage error:', error);
        const { data: urlData } = supabase.storage.from('worksheets').getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          window.open(urlData.publicUrl, '_blank');
        } else {
          throw new Error('File not accessible');
        }
      } else if (data) {
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      // Directly increment download count
      const { error: updateError } = await supabase
        .from('worksheets')
        .update({ download_count: downloadCount + 1 })
        .eq('id', id);
      
      if (updateError) {
        console.error('Failed to update download count:', updateError);
      }
      
      // Track the download in downloads table
      if (user) {
        await supabase
          .from('downloads')
          .upsert({
            worksheet_id: id,
            user_id: user.id
          }, { onConflict: 'worksheet_id,user_id' });
      }
        
      toast.success('Download started!');
      onDownload?.(); // This will refresh the parent component
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async () => {
    try {
      await supabase.storage.from('worksheets').remove([filePath]);
      const { error } = await supabase.from('worksheets').delete().eq('id', id);
      if (error) throw error;
      toast.success('Worksheet deleted successfully');
      onDelete?.();
    } catch (error) {
      toast.error('Failed to delete worksheet');
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 animate-fade-in border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            {subjectInfo && (
              <p className="text-xs text-muted-foreground mt-1">{subjectInfo.shortName}</p>
            )}
          </div>
          <Badge 
            variant={status === 'completed' ? 'default' : 'secondary'}
            className={status === 'completed' 
              ? 'bg-success text-success-foreground' 
              : 'bg-warning/20 text-warning border border-warning/30'
            }
          >
            {status === 'completed' ? '✓ Completed' : '○ Unsolved'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{uploadedBy}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(uploadDate), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            <span>{downloadCount} downloads</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex gap-2 w-full">
          <Button 
            onClick={handleDownload}
            className="flex-1 gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Worksheet</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
