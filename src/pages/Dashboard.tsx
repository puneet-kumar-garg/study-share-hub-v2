import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Download, FileText, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { SubjectCard } from '@/components/SubjectCard';
import { WorksheetCard } from '@/components/WorksheetCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SUBJECTS } from '@/lib/constants';
import { canUserUpload, isAdmin } from '@/lib/permissions';
import { migrateExistingUsersToDownloadOnly } from '@/lib/migratePermissions';
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

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalUploads, setTotalUploads] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [recentWorksheets, setRecentWorksheets] = useState<Worksheet[]>([]);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});
  const [canUpload, setCanUpload] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    async function checkPermissions() {
      if (!user) return;
      
      // Run migration for existing users (one-time)
      if (isAdmin(user.email || '')) {
        await migrateExistingUsersToDownloadOnly();
      }
      
      const uploadPerm = await canUserUpload(user.email || '');
      const adminPerm = isAdmin(user.email || '');
      console.log('User email:', user.email);
      console.log('Is admin:', adminPerm);
      setCanUpload(uploadPerm);
      setUserIsAdmin(adminPerm);
    }
    checkPermissions();
  }, [user]);

  const fetchRecentWorksheets = async () => {
    const { data: recent } = await supabase
      .from('worksheets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recent) {
      const uploaderIds = [...new Set(recent.map(w => w.uploader_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', uploaderIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      const worksheetsWithNames = recent.map(w => ({
        ...w,
        uploader_name: profileMap.get(w.uploader_id) || 'Unknown',
      }));

      setRecentWorksheets(worksheetsWithNames);
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        const { count: uploadCount } = await supabase
          .from('worksheets')
          .select('*', { count: 'exact', head: true })
          .eq('uploader_id', user.id);

        setTotalUploads(uploadCount || 0);

        const { data: userWorksheets } = await supabase
          .from('worksheets')
          .select('download_count')
          .eq('uploader_id', user.id);

        const downloads = userWorksheets?.reduce((sum, w) => sum + w.download_count, 0) || 0;
        setTotalDownloads(downloads);

        await fetchRecentWorksheets();

        const { data: worksheets } = await supabase
          .from('worksheets')
          .select('subject');

        const counts: Record<string, number> = {};
        worksheets?.forEach(w => {
          counts[w.subject] = (counts[w.subject] || 0) + 1;
        });
        setSubjectCounts(counts);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>
        <div className="flex gap-2">
          {canUpload && (
            <Link to="/upload">
              <Button className="gradient-primary text-primary-foreground shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Upload Worksheet
              </Button>
            </Link>
          )}
          {userIsAdmin && (
            <Link to="/users">
              <Button variant="outline">
                Manage Users
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Your Uploads"
          value={totalUploads}
          icon={Upload}
          description="Total worksheets you've shared"
          gradient="gradient-primary"
        />
        <StatsCard
          title="Downloads Received"
          value={totalDownloads}
          icon={Download}
          description="Times your worksheets were downloaded"
          gradient="gradient-accent"
        />
        <StatsCard
          title="Total Worksheets"
          value={Object.values(subjectCounts).reduce((a, b) => a + b, 0)}
          icon={FileText}
          description="Available across all subjects"
          gradient="gradient-success"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Browse by Subject
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map(subject => (
            <SubjectCard
              key={subject.id}
              {...subject}
              worksheetCount={subjectCounts[subject.id] || 0}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recently Uploaded
        </h2>
        {recentWorksheets.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-border/50">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No worksheets uploaded yet.</p>
            <Link to="/upload">
              <Button variant="link" className="text-primary mt-2">
                Be the first to upload!
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentWorksheets.map(worksheet => (
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
                uploaderId={worksheet.uploader_id}
                onDownload={fetchRecentWorksheets}
                onDelete={fetchRecentWorksheets}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
