// Mock data for local development
export interface Worksheet {
  id: string;
  title: string;
  description: string;
  subject: string;
  file_path: string;
  created_at: string;
  user_id: string;
  download_count: number;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
}

const WORKSHEETS_KEY = 'study_hub_worksheets';
const PROFILES_KEY = 'study_hub_profiles';

// Sample data
const sampleWorksheets: Worksheet[] = [
  {
    id: '1',
    title: 'Algebra Basics',
    description: 'Introduction to algebraic expressions and equations',
    subject: 'Mathematics',
    file_path: 'sample-algebra.pdf',
    created_at: new Date().toISOString(),
    user_id: '1',
    download_count: 15
  },
  {
    id: '2',
    title: 'Cell Biology',
    description: 'Understanding cell structure and functions',
    subject: 'Biology',
    file_path: 'sample-biology.pdf',
    created_at: new Date().toISOString(),
    user_id: '1',
    download_count: 8
  },
  {
    id: '3',
    title: 'World War II',
    description: 'Key events and timeline of WWII',
    subject: 'History',
    file_path: 'sample-history.pdf',
    created_at: new Date().toISOString(),
    user_id: '1',
    download_count: 12
  }
];

export const mockApi = {
  // Initialize sample data if not exists
  init() {
    if (!localStorage.getItem(WORKSHEETS_KEY)) {
      localStorage.setItem(WORKSHEETS_KEY, JSON.stringify(sampleWorksheets));
    }
  },

  // Worksheets
  getWorksheets(): Worksheet[] {
    const data = localStorage.getItem(WORKSHEETS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getWorksheetsBySubject(subject: string): Worksheet[] {
    return this.getWorksheets().filter(w => w.subject === subject);
  },

  getWorksheetsByUser(userId: string): Worksheet[] {
    return this.getWorksheets().filter(w => w.user_id === userId);
  },

  addWorksheet(worksheet: Omit<Worksheet, 'id' | 'created_at' | 'download_count'>): Worksheet {
    const worksheets = this.getWorksheets();
    const newWorksheet: Worksheet = {
      ...worksheet,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      download_count: 0
    };
    worksheets.push(newWorksheet);
    localStorage.setItem(WORKSHEETS_KEY, JSON.stringify(worksheets));
    return newWorksheet;
  },

  deleteWorksheet(id: string): void {
    const worksheets = this.getWorksheets().filter(w => w.id !== id);
    localStorage.setItem(WORKSHEETS_KEY, JSON.stringify(worksheets));
  },

  incrementDownloadCount(id: string): void {
    const worksheets = this.getWorksheets();
    const worksheet = worksheets.find(w => w.id === id);
    if (worksheet) {
      worksheet.download_count++;
      localStorage.setItem(WORKSHEETS_KEY, JSON.stringify(worksheets));
    }
  },

  // Profiles
  getProfile(userId: string): Profile | null {
    const users = JSON.parse(localStorage.getItem('study_hub_users') || '[]');
    const user = users.find((u: any) => u.id === userId);
    return user ? {
      id: user.id,
      full_name: user.user_metadata.full_name,
      email: user.email
    } : null;
  },

  // Stats
  getStats(userId: string) {
    const userWorksheets = this.getWorksheetsByUser(userId);
    const totalDownloads = userWorksheets.reduce((sum, w) => sum + w.download_count, 0);
    
    return {
      totalUploads: userWorksheets.length,
      totalDownloads,
      totalWorksheets: this.getWorksheets().length
    };
  },

  // Subjects
  getSubjects(): string[] {
    const worksheets = this.getWorksheets();
    const subjects = [...new Set(worksheets.map(w => w.subject))];
    return subjects.sort();
  }
};