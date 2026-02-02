import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { mockApi } from '@/lib/mockData';
import { SUBJECTS } from '@/lib/constants';
import { toast } from 'sonner';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState<'completed' | 'unsolved'>('unsolved');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (50MB limit)
      if (selectedFile.size > 52428800) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to upload');
      return;
    }

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!subject) {
      toast.error('Please select a subject');
      return;
    }

    setIsLoading(true);

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const fileUrl = URL.createObjectURL(file);
      
      const uploadedFiles = JSON.parse(localStorage.getItem('uploaded_files') || '{}');
      uploadedFiles[filePath] = { url: fileUrl, name: file.name };
      localStorage.setItem('uploaded_files', JSON.stringify(uploadedFiles));
      
      mockApi.addWorksheet({
        title: title.trim(),
        description: description.trim() || null,
        subject: subject,
        file_path: filePath,
        user_id: user.id,
      });

      toast.success('Worksheet uploaded successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload worksheet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="w-5 h-5 text-primary" />
            Upload Worksheet
          </CardTitle>
          <CardDescription>
            Share your worksheet with fellow students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Week 5 Practice Problems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={subject} onValueChange={setSubject} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the worksheet content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="space-y-3">
              <Label>Status *</Label>
              <RadioGroup value={status} onValueChange={(v) => setStatus(v as 'completed' | 'unsolved')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed" className="text-sm font-normal cursor-pointer">
                    ✓ Completed - I've solved this worksheet
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsolved" id="unsolved" />
                  <Label htmlFor="unsolved" className="text-sm font-normal cursor-pointer">
                    ○ Unsolved - This needs to be solved
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>File *</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <UploadIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, DOC, or Images (max 50MB)
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                placeholder="e.g., midterm, practice, chapter5 (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload Worksheet
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
