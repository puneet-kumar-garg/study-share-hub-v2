import { Download, Calendar, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { getSubjectById } from '@/lib/constants';
import { mockApi } from '@/lib/mockData';
import { toast } from 'sonner';

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
  onDownload?: () => void;
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
  onDownload,
}: WorksheetCardProps) {
  const subjectInfo = getSubjectById(subject);

  const handleDownload = async () => {
    try {
      const { data } = supabase.storage.from('worksheets').getPublicUrl(filePath);
      
      if (data?.publicUrl) {
        const link = document.createElement('a');
        link.href = data.publicUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        await supabase.rpc('increment_download_count', { worksheet_uuid: id });
        toast.success('Download started!');
        onDownload?.();
      } else {
        toast.error('File not found');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
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
        <Button 
          onClick={handleDownload}
          className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
