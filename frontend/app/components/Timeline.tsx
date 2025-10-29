import { useState, useRef, useCallback } from 'react';
import { Card } from './ui/card';

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  memo: string;
  top: number;
  height: number;
}

interface TimelineProps {
  onBlockClick: (block: TimeBlock) => void;
}

export function Timeline({ onBlockClick }: TimelineProps) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ y: number; time: string } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Generate time slots from 08:00 to 24:00 (30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getTimeFromY = useCallback((y: number) => {
    if (!timelineRef.current) return '08:00';
    
    const rect = timelineRef.current.getBoundingClientRect();
    const relativeY = y - rect.top;
    const slotHeight = 30; // 30px per 30-minute slot
    const slotIndex = Math.floor(relativeY / slotHeight);
    
    return timeSlots[Math.max(0, Math.min(slotIndex, timeSlots.length - 1))] || '08:00';
  }, [timeSlots]);

  const getYFromTime = (time: string) => {
    const index = timeSlots.indexOf(time);
    return index * 30; // 30px per slot
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== timelineRef.current && !(e.target as Element).closest('.time-slot')) return;
    
    const startTime = getTimeFromY(e.clientY);
    setDragStart({ y: e.clientY, time: startTime });
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    e.preventDefault();
    
    // Visual feedback during drag (you can add a temporary block here)
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const endTime = getTimeFromY(e.clientY);
    const startTime = dragStart.time;
    
    // Ensure endTime is after startTime
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (startIndex < endIndex) {
      const newBlock: TimeBlock = {
        id: Date.now().toString(),
        startTime,
        endTime,
        title: '새 일정',
        memo: '',
        top: getYFromTime(startTime),
        height: (endIndex - startIndex) * 30
      };
      
      setBlocks(prev => [...prev, newBlock]);
    }
    
    setIsDragging(false);
    setDragStart(null);
  }, [isDragging, dragStart, timeSlots]);

  // Add event listeners
  useState(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return (
    <Card className="h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium">타임라인</h3>
        <p className="text-sm text-muted-foreground">드래그해서 일정을 만드세요</p>
      </div>
      
      <div 
        ref={timelineRef}
        className="relative overflow-y-auto max-h-[600px] select-none"
        onMouseDown={handleMouseDown}
      >
        {/* Time slots */}
        {timeSlots.map((time, index) => (
          <div
            key={time}
            className="time-slot flex items-center h-[30px] border-b border-border/50 hover:bg-muted/30 cursor-crosshair"
          >
            <div className="w-16 text-sm text-muted-foreground px-3 border-r border-border/50">
              {time}
            </div>
            <div className="flex-1 h-full"></div>
          </div>
        ))}
        
        {/* Time blocks */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute left-16 right-2 bg-primary/10 border border-primary/20 rounded cursor-pointer hover:bg-primary/20 transition-colors"
            style={{
              top: `${block.top}px`,
              height: `${block.height}px`
            }}
            onClick={() => onBlockClick(block)}
          >
            <div className="p-2 h-full overflow-hidden">
              <div className="text-sm font-medium text-primary truncate">
                {block.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {block.startTime} - {block.endTime}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}