import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';

interface Habit {
  id: string;
  text: string;
  completed: boolean;
}

interface HabitsCardProps {
  habits: Habit[];
  onChange: (habits: Habit[]) => void;
}

export function HabitsCard({ habits, onChange }: HabitsCardProps) {
  const [newHabit, setNewHabit] = useState('');

  const addHabit = () => {
    if (newHabit.trim()) {
      const habit: Habit = {
        id: Date.now().toString(),
        text: newHabit.trim(),
        completed: false
      };
      onChange([...habits, habit]);
      setNewHabit('');
    }
  };

  const toggleHabit = (id: string) => {
    onChange(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  const removeHabit = (id: string) => {
    onChange(habits.filter(habit => habit.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHabit();
    }
  };

  return (
    <div className="space-y-3">
        <div className="flex space-x-2">
          <Input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="새 습관 추가... (Enter로 추가)"
            className="flex-1"
          />
          <Button size="sm" onClick={addHabit} disabled={!newHabit.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-2 rounded-lg border group hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <span className={`text-sm transition-all ${
                  habit.completed 
                    ? 'line-through text-muted-foreground' 
                    : 'text-foreground'
                }`}>
                  {habit.text}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={habit.completed}
                  onCheckedChange={() => toggleHabit(habit.id)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHabit(habit.id)}
                  className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {habits.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-4 border-2 border-dashed border-border rounded-lg">
              아직 습관이 없습니다<br />
              <span className="text-xs">위에서 새로운 습관을 추가해보세요</span>
            </div>
          )}
        </div>
        
        {habits.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            오늘 완료: {habits.filter(h => h.completed).length} / {habits.length}
          </div>
        )}
    </div>
  );
}