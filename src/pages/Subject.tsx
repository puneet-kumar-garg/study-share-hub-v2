import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, ArrowUpDown, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorksheetCard } from '@/components/WorksheetCard';
import { getSubjectById } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Worksheet {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  status: 'completed' | 'unsolved';
  file_path: string;
  file_name: string;
  download_count: number;
  created_at: string;
  uploader_id: string;
  uploader_name?: string;
}

export default function Subject() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [filteredWorksheets, setFilteredWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');

  const subject = getSubjectById(subjectId || '');

  const fetchWorksheets = async () => {
    if (!subjectId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('worksheets')
        .select('*')
        .eq('subject', subjectId);

      if (error) throw error;

      if (data) {
        const uploaderIds = [...new Set(data.map(w => w.uploader_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', uploaderIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        const worksheetsWithNames = data.map(w => ({
          ...w,
          uploader_name: profileMap.get(w.uploader_id) || 'Unknown',
        }));

        setWorksheets(worksheetsWithNames);
      }
    } catch (error) {
      console.error('Error fetching worksheets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorksheets();
  }, [subjectId]);

  useEffect(() => {
    let result = [...worksheets];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(w =>
        w.title.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query)
      );
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'downloads') {
      result.sort((a, b) => b.download_count - a.download_count);
    }

    setFilteredWorksheets(result);
  }, [worksheets, searchQuery, sortBy]);

  if (!subject) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-foreground mb-2">Subject Not Found</h1>
        <p className="text-muted-foreground mb-4">The subject you're looking for doesn't exist.</p>
        <Link to="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
          <p className="text-muted-foreground">
            {filteredWorksheets.length} worksheet{filteredWorksheets.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Link to="/upload">
          <Button className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Upload New
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="downloads">Most Downloaded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredWorksheets.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-xl border border-border/50">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">
            {worksheets.length === 0
              ? 'No worksheets uploaded for this subject yet.'
              : 'No worksheets match your filters.'}
          </p>
          {worksheets.length === 0 && (
            <Link to="/upload">
              <Button variant="link" className="text-primary">
                Be the first to upload!
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWorksheets.map(worksheet => (
            <WorksheetCard
              key={worksheet.id}
              id={worksheet.id}
              title={worksheet.title}
              description={worksheet.description}
              subject={worksheet.subject}
              status={worksheet.status}
              uploadedBy={worksheet.uploader_name || 'Unknown'}
              uploadDate={worksheet.created_at}
              downloadCount={worksheet.download_count}
              filePath={worksheet.file_path}
              fileName={worksheet.file_name}
              onDownload={fetchWorksheets}
            />
          ))}
        </div>
      )}
    </div>
  );
}
