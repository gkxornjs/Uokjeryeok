import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Clock, FileText } from 'lucide-react';

interface TimeBlock {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
  color: string;
  memo?: string;
}

interface TimeBlockModalProps {
  block: TimeBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: TimeBlock) => void;
  onAddToDiary: (content: string) => void;
}

export function TimeBlockModal({ block, isOpen, onClose, onSave, onAddToDiary }: TimeBlockModalProps) {
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setMemo(block.memo || '');
    }
  }, [block]);

  const formatTime = (minutes: number): string => {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (block) {
      const updatedBlock = {
        ...block,
        title,
        memo
      };
      onSave(updatedBlock);
      onClose();
    }
  };

  const handleAddToDiary = () => {
    if (block && memo.trim()) {
      const timeRange = `${formatTime(block.startTime)} - ${formatTime(block.endTime)}`;
      const content = `[${timeRange}] ${title}\n${memo}`;
      onAddToDiary(content);
      onClose();
    }
  };

  if (!block) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            시간 블록 편집
          </DialogTitle>
          <DialogDescription>
            시간 블록의 제목과 메모를 편집하거나 일기에 추가할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formatTime(block.startTime)} - {formatTime(block.endTime)}</span>
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: block.color }}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">제목</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">메모</label>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="상세 내용이나 메모를 입력하세요..."
              className="min-h-[100px] resize-none"
            />
          </div>
          
          <div className="flex justify-between space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleAddToDiary}
              disabled={!memo.trim()}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              일기에 넣기
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button onClick={handleSave}>
                저장
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}