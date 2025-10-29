import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  memo: string;
  top: number;
  height: number;
}

interface TimeBlockPanelProps {
  block: TimeBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: TimeBlock) => void;
  onAddToDiary: (content: string) => void;
}

export function TimeBlockPanel({ block, isOpen, onClose, onSave, onAddToDiary }: TimeBlockPanelProps) {
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setMemo(block.memo);
    }
  }, [block]);

  const handleSave = () => {
    if (block) {
      onSave({
        ...block,
        title,
        memo
      });
      onClose();
    }
  };

  const handleAddToDiary = () => {
    const content = `[${block?.startTime}-${block?.endTime}] ${title}\n${memo}`;
    onAddToDiary(content);
    onClose();
  };

  if (!isOpen || !block) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative ml-auto w-96 h-full bg-background border-l border-border shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-medium">일정 편집</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="text-sm text-muted-foreground">
            {block.startTime} - {block.endTime}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="memo">메모</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              className="min-h-[120px]"
            />
          </div>
          
          <div className="flex flex-col space-y-2 pt-4">
            <Button onClick={handleSave}>
              저장하기
            </Button>
            <Button variant="outline" onClick={handleAddToDiary}>
              <ArrowRight className="w-4 h-4 mr-2" />
              일기에 넣기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}