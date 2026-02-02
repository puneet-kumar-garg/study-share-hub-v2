import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Download, FileText, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { SubjectCard } from '@/components/SubjectCard';
import { WorksheetCard } from '@/components/WorksheetCard';
import { useAuth } from '@/hooks/useAuth';
import { mockApi, Worksheet } from '@/lib/mockData';
import { SUBJECTS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalUploads, setTotalUploads] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [recentWorksheets, setRecentWorksheets] = useState<Worksheet[]>([]);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});

  const fetchRecentWorksheets = () => {
    const worksheets = mockApi.getWorksheets();
    const recent = worksheets
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
    setRecentWorksheets(recent);
  };

  useEffect(() => {
    function fetchDashboardData() {
      if (!user) return;

      try {
        // Initialize mock data
        mockApi.init();

        // Get stats
        const stats = mockApi.getStats(user.id);
        setTotalUploads(stats.totalUploads);
        setTotalDownloads(stats.totalDownloads);

        // Fetch recent worksheets
        fetchRecentWorksheets();

        // Fetch subject counts
        const worksheets = mockApi.getWorksheets();
        const counts: Record<string, number> = {};
        worksheets.forEach(w => {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>
        <Link to="/upload">
          <Button className="gradient-primary text-primary-foreground shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            Upload Worksheet
          </Button>
        </Link>
      </div>

      {/* Stats */}
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

      {/* Subjects Grid */}
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

      {/* Recent Worksheets */}
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
                status="completed"
                uploadedBy={user?.user_metadata?.full_name || 'Unknown User'}
                uploadDate={worksheet.created_at}
                downloadCount={worksheet.download_count}
                filePath={worksheet.file_path}
                fileName={worksheet.file_path}
                onDownload={fetchRecentWorksheets}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
