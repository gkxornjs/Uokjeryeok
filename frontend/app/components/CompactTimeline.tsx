import { useState, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';

interface TimeBlock {
  id: string;
  startTime: number; // minutes from 00:00
  endTime: number; // minutes from 00:00
  title: string;
  color: string;
  memo?: string;
}

interface CompactTimelineProps {
  blocks: TimeBlock[];
  onBlocksChange: (blocks: TimeBlock[]) => void;
  onBlockClick: (block: TimeBlock) => void;
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
];

export function CompactTimeline({ blocks, onBlocksChange, onBlockClick }: CompactTimelineProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);

  // Generate time slots (48 slots for 30-minute intervals)
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return { 
      slot: i, 
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      minutes: hour * 60 + minute
    };
  });

  const getTimeFromPosition = useCallback((y: number): number => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const relativeY = y - rect.top;
    const slotHeight = rect.height / 48;
    const slot = Math.floor(relativeY / slotHeight);
    return Math.max(0, Math.min(47, slot)) * 30; // Convert to minutes
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === timelineRef.current || (e.target as HTMLElement).classList.contains('time-slot')) {
      const startTime = getTimeFromPosition(e.clientY);
      setIsSelecting(true);
      setSelectionStart(startTime);
      setSelectionEnd(startTime);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selectionStart !== null) {
      const currentTime = getTimeFromPosition(e.clientY);
      setSelectionEnd(currentTime);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart !== null && selectionEnd !== null) {
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd) + 30; // Add 30 minutes to end
      
      if (end > start) {
        const newBlock: TimeBlock = {
          id: Date.now().toString(),
          startTime: start,
          endTime: end,
          title: '새 일정',
          color: COLORS[blocks.length % COLORS.length]
        };
        onBlocksChange([...blocks, newBlock]);
      }
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const formatTime = (minutes: number): string => {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  };

  const getBlockStyle = (block: TimeBlock) => {
    const startPercent = (block.startTime / (24 * 60)) * 100;
    const duration = block.endTime - block.startTime;
    const heightPercent = (duration / (24 * 60)) * 100;
    
    return {
      top: `${startPercent}%`,
      height: `${heightPercent}%`,
      backgroundColor: block.color,
      left: '50px',
      right: '8px',
    };
  };

  const getSelectionStyle = () => {
    if (!isSelecting || selectionStart === null || selectionEnd === null) return {};
    
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    const startPercent = (start / (24 * 60)) * 100;
    const endPercent = ((end + 30) / (24 * 60)) * 100;
    
    return {
      top: `${startPercent}%`,
      height: `${endPercent - startPercent}%`,
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
      left: '50px',
      right: '8px',
    };
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          시간 계획표
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          드래그로 시간 블록 생성
        </p>
      </div>
      
      <div className="p-3">
        <div 
          ref={timelineRef}
          className="relative h-[600px] bg-background border rounded"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Time labels */}
          {timeSlots.map((slot) => (
            <div
              key={slot.slot}
              className="absolute left-0 w-12 text-xs text-muted-foreground flex items-center justify-end pr-2 time-slot"
              style={{ 
                top: `${(slot.slot / 48) * 100}%`,
                height: `${100 / 48}%`,
              }}
            >
              {slot.slot % 4 === 0 && slot.time.split(':')[0]}
            </div>
          ))}
          
          {/* Grid lines */}
          {timeSlots.map((slot) => (
            <div
              key={slot.slot}
              className={`absolute left-12 right-0 border-t time-slot ${
                slot.slot % 4 === 0 ? 'border-border' : 'border-border/30'
              }`}
              style={{ top: `${(slot.slot / 48) * 100}%` }}
            />
          ))}
          
          {/* Selection preview */}
          {isSelecting && (
            <div
              className="absolute border-2 border-primary border-dashed rounded"
              style={getSelectionStyle()}
            />
          )}
          
          {/* Time blocks */}
          {blocks.map((block) => (
            <div
              key={block.id}
              className="absolute rounded px-2 py-1 cursor-pointer hover:opacity-90 transition-opacity group"
              style={getBlockStyle(block)}
              onClick={() => onBlockClick(block)}
            >
              <div className="text-white text-xs font-medium truncate">
                {block.title}
              </div>
              <div className="text-white/80 text-xs">
                {formatTime(block.startTime)}-{formatTime(block.endTime)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}