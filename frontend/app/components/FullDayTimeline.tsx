import { useState, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';

interface TimeBlock {
  id: string;
  startTime: number; // minutes from 00:00
  endTime: number; // minutes from 00:00
  title: string;
  color: string;
}

interface FullDayTimelineProps {
  blocks: TimeBlock[];
  onBlocksChange: (blocks: TimeBlock[]) => void;
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

export function FullDayTimeline({ blocks, onBlocksChange }: FullDayTimelineProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [resizingBlock, setResizingBlock] = useState<{ id: string; edge: 'top' | 'bottom' } | null>(null);
  
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
      left: '60px',
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
      left: '60px',
      right: '8px',
    };
  };

  const updateBlockTitle = (blockId: string, newTitle: string) => {
    onBlocksChange(blocks.map(block => 
      block.id === blockId ? { ...block, title: newTitle } : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    onBlocksChange(blocks.filter(block => block.id !== blockId));
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          오늘의 시간표
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          드래그하여 시간 블록을 생성하고, 블록을 클릭해서 편집하세요
        </p>
      </div>
      
      <div className="p-4">
        <div 
          ref={timelineRef}
          className="relative h-[800px] bg-background border rounded"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Time labels */}
          {timeSlots.map((slot) => (
            <div
              key={slot.slot}
              className="absolute left-0 w-14 text-xs text-muted-foreground flex items-center justify-end pr-2 time-slot"
              style={{ 
                top: `${(slot.slot / 48) * 100}%`,
                height: `${100 / 48}%`,
              }}
            >
              {slot.slot % 2 === 0 && slot.time}
            </div>
          ))}
          
          {/* Grid lines */}
          {timeSlots.map((slot) => (
            <div
              key={slot.slot}
              className={`absolute left-14 right-0 border-t time-slot ${
                slot.slot % 2 === 0 ? 'border-border' : 'border-border/30'
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
            >
              <div className="text-white text-xs font-medium">
                {formatTime(block.startTime)} - {formatTime(block.endTime)}
              </div>
              <input
                type="text"
                value={block.title}
                onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                className="w-full bg-transparent text-white text-sm font-medium placeholder-white/70 border-none outline-none mt-1"
                placeholder="일정 제목"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBlock(block.id);
                }}
                className="absolute top-1 right-1 w-4 h-4 bg-black/20 hover:bg-black/40 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}