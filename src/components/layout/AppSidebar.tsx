import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Upload, 
  User, 
  LogOut,
  ChevronRight,
  Brain,
  Calculator,
  Cloud,
  Code2,
  Network,
  Trophy,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { SUBJECTS } from '@/lib/constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Calculator,
  Cloud,
  Code2,
  Network,
  Trophy,
};

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Upload Worksheet', url: '/upload', icon: Upload },
  { title: 'My Profile', url: '/profile', icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [subjectsOpen, setSubjectsOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;
  const isSubjectActive = SUBJECTS.some(s => location.pathname === `/subjects/${s.id}`);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">Worksheet Hub</span>
              <span className="text-xs text-sidebar-foreground/60">Exchange & Learn</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2">
            {!collapsed && 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <Collapsible open={subjectsOpen} onOpenChange={setSubjectsOpen}>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2 cursor-pointer hover:text-sidebar-foreground/70">
                {!collapsed && (
                  <>
                    <span>Subjects</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${subjectsOpen ? 'rotate-90' : ''}`} />
                  </>
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {SUBJECTS.map((subject) => {
                    const Icon = iconMap[subject.icon];
                    return (
                      <SidebarMenuItem key={subject.id}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={`/subjects/${subject.id}`}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent text-sm"
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {!collapsed && <span className="truncate">{subject.shortName}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {!collapsed && 'Sign Out'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
