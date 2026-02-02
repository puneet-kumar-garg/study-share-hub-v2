import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Brain, Calculator, Cloud, Code2, Network, Trophy } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Calculator,
  Cloud,
  Code2,
  Network,
  Trophy,
};

interface SubjectCardProps {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  worksheetCount?: number;
}

export function SubjectCard({ id, name, shortName, icon, color, worksheetCount = 0 }: SubjectCardProps) {
  const Icon = iconMap[icon];

  return (
    <Link to={`/subjects/${id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 overflow-hidden">
        <CardContent className="p-0">
          <div className={`bg-gradient-to-r ${color} p-4`}>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {shortName}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{name}</p>
            <p className="text-sm font-medium text-primary mt-2">
              {worksheetCount} worksheet{worksheetCount !== 1 ? 's' : ''}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
