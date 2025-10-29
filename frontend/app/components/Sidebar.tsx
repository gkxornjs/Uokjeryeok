import { Home, PenTool, Calendar, CalendarDays, CalendarRange, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { PageType } from '@/types/navigation';
import type { LucideIcon } from 'lucide-react'

interface NavigationItem {
  id: PageType;
  icon: LucideIcon;
  label: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', icon: Home, label: '🏠 대시보드' },
  { id: 'daily-record', icon: PenTool, label: '✍ 일일 기록' },
  { id: 'weekly-plan', icon: Calendar, label: '📅 주간 계획' },
  { id: 'monthly-plan', icon: CalendarDays, label: '🗓 월간 계획' },
  { id: 'yearly-plan', icon: CalendarRange, label: '📆 연간 계획' },
  { id: 'settings', icon: Settings, label: '⚙ 설정' },
];

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-sidebar-foreground mb-8">억제력</h1>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onPageChange(item.id)}
                className={`w-full justify-start text-left p-3 h-auto ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <span className="text-base">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}