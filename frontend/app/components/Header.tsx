import { ChevronLeft, ChevronRight, Bell, User, Search } from 'lucide-react';
import { Button } from './ui/button';



interface HeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  pageType?: string;
  weekOffset?: number;
  onWeekOffsetChange?: (offset: number) => void;
  onOpenOnboarding?: () => void;
}

export function Header({ currentDate, onDateChange, pageType, weekOffset = 0, onWeekOffsetChange,  onOpenOnboarding, }: HeaderProps) {
  const isDailyRecord = pageType === 'daily-record';
  const isWeeklyPlan = pageType === 'weekly-plan';
  const isYearlyPlan = pageType === 'yearly-plan'; 

  const formatDate = (date: Date) => {
    if (isDailyRecord) {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }
    if (isWeeklyPlan) {
      // Format week range for weekly plan
      const baseDate = new Date(date);
      baseDate.setDate(baseDate.getDate() + (weekOffset * 7));
      const day = baseDate.getDay();
      const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(baseDate.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      return `${monday.getFullYear()}.${String(monday.getMonth() + 1).padStart(2, '0')}.${String(monday.getDate()).padStart(2, '0')} ~ ${sunday.getFullYear()}.${String(sunday.getMonth() + 1).padStart(2, '0')}.${String(sunday.getDate()).padStart(2, '0')}`;
    }
    if (isYearlyPlan) {
      return `${date.getFullYear()}`;                // ✅ 연도만
    }
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const goToPrevious = () => {
  if (isWeeklyPlan && onWeekOffsetChange) {
    onWeekOffsetChange(weekOffset - 1);
    return;
  }
  if (isDailyRecord) {
    const prev = new Date(currentDate); prev.setDate(prev.getDate() - 1); onDateChange(prev); return;
  }
  if (isYearlyPlan) {                                  // ✅ 연도 -1
    const prev = new Date(currentDate); prev.setFullYear(prev.getFullYear() - 1); onDateChange(prev); return;
  }
  const prev = new Date(currentDate); prev.setMonth(prev.getMonth() - 1); onDateChange(prev);
};

const goToNext = () => {
  if (isWeeklyPlan && onWeekOffsetChange) {
    onWeekOffsetChange(weekOffset + 1);
    return;
  }
  if (isDailyRecord) {
    const next = new Date(currentDate); next.setDate(next.getDate() + 1); onDateChange(next); return;
  }
  if (isYearlyPlan) {                                  // ✅ 연도 +1
    const next = new Date(currentDate); next.setFullYear(next.getFullYear() + 1); onDateChange(next); return;
  }
  const next = new Date(currentDate); next.setMonth(next.getMonth() + 1); onDateChange(next);
};

const goToToday = () => {
  if (isWeeklyPlan && onWeekOffsetChange) {
    onWeekOffsetChange(0);
    return;
  }
  if (isYearlyPlan) {                                  // ✅ 올해로 점프(연도만 변경)
    const today = new Date();
    const d = new Date(currentDate);
    d.setFullYear(today.getFullYear());
    onDateChange(d);
    return;
  }
  onDateChange(new Date());
};

  return (
    <header className="h-16 bg-background border-b border-border px-6 flex items-center justify-between">
      {/* Left side - Date Navigation */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          className="w-8 h-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className={`text-lg font-medium text-center ${isDailyRecord ? 'min-w-[120px]' : isWeeklyPlan ? 'min-w-[280px]' : 'min-w-[80px]'}`}>
          {formatDate(currentDate)}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          className="w-8 h-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          onClick={goToToday}
          className="ml-4"
        >
          오늘
        </Button>
      </div>

      {/* Right side - Icons */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
          <Bell className="h-4 w-4" />
        </Button>
         <Button
    variant="ghost"
    size="sm"
    className="w-8 h-8 p-0"
    onClick={() => onOpenOnboarding?.()}   // ← 추가
    aria-label="프로필/온보딩"
  >
    <User className="h-4 w-4" />
  </Button>
      </div>
    </header>
  );
}