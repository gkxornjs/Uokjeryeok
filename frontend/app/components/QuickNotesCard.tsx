import { useState } from 'react';
import { ArrowUpRight, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface Note {
  id: string;
  text: string;
  timestamp: Date;
}

interface QuickNotesCardProps {
  notes: Note[];
  onChange: (notes: Note[]) => void;
  onMoveToTodos: (noteText: string) => void;
}

export function QuickNotesCard({ notes, onChange, onMoveToTodos }: QuickNotesCardProps) {
  const [newNote, setNewNote] = useState('');

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        timestamp: new Date()
      };
      onChange([note, ...notes]); // Add to beginning
      setNewNote('');
    }
  };

  const removeNote = (id: string) => {
    onChange(notes.filter(note => note.id !== id));
  };

  const moveToTodos = (note: Note) => {
    onMoveToTodos(note.text);
    removeNote(note.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      addNote();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">빠른 메모 (Inbox)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="빠른 생각, 아이디어 등을 적어보세요... (Ctrl+Enter로 추가)"
            className="min-h-[80px] resize-none"
          />
          <Button 
            onClick={addNote} 
            disabled={!newNote.trim()}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            메모 추가
          </Button>
        </div>
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 border rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm flex-1 whitespace-pre-wrap">{note.text}</p>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveToTodos(note)}
                    className="w-6 h-6 p-0 text-muted-foreground hover:text-primary"
                    title="할 일로 보내기"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNote(note.id)}
                    className="w-6 h-6 p-0 text-muted-foreground hover:text-destructive"
                    title="삭제"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {formatTime(note.timestamp)}
              </div>
            </div>
          ))}
          
          {notes.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-border rounded-lg">
              메모가 없습니다<br />
              <span className="text-xs">위에서 새로운 메모를 추가해보세요</span>
            </div>
          )}
        </div>
        
        {notes.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            총 {notes.length}개의 메모
          </div>
        )}
      </CardContent>
    </Card>
  );
}