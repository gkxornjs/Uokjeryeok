import { useState, useRef } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

interface ChecklistCardProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export function ChecklistCard({ items, onChange }: ChecklistCardProps) {
  const [newItem, setNewItem] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const dragCounter = useRef(0);

  // Sort items: incomplete first (by order), then completed at bottom
  const sortedItems = [...items].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // completed items go to bottom
    }
    return a.order - b.order; // maintain order within each group
  });

  const addItem = () => {
    if (newItem.trim()) {
      const maxOrder = Math.max(...items.map(item => item.order), 0);
      const item: ChecklistItem = {
        id: Date.now().toString(),
        text: newItem.trim(),
        completed: false,
        order: maxOrder + 1
      };
      onChange([...items, item]);
      setNewItem('');
    }
  };

  const toggleItem = (id: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onChange(updatedItems);
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', itemId);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    dragCounter.current++;
    
    const draggedItemData = items.find(item => item.id === draggedItem);
    const targetItemData = items.find(item => item.id === itemId);
    
    // Only allow reordering within the same completion status
    if (draggedItemData && targetItemData && 
        draggedItemData.completed === targetItemData.completed) {
      setDragOverItem(itemId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedItemData = items.find(item => item.id === draggedItem);
    const targetItemData = items.find(item => item.id === targetId);
    
    // Only allow reordering within the same completion status
    if (!draggedItemData || !targetItemData || 
        draggedItemData.completed !== targetItemData.completed) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const updatedItems = [...items];
    const draggedIndex = updatedItems.findIndex(item => item.id === draggedItem);
    const targetIndex = updatedItems.findIndex(item => item.id === targetId);
    
    // Remove dragged item and insert at target position
    const [draggedItemObj] = updatedItems.splice(draggedIndex, 1);
    updatedItems.splice(targetIndex, 0, draggedItemObj);
    
    // Update order values for items of the same completion status
    const sameStatusItems = updatedItems.filter(item => item.completed === draggedItemData.completed);
    sameStatusItems.forEach((item, index) => {
      item.order = index + 1;
    });
    
    onChange(updatedItems);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    dragCounter.current = 0;
  };

  // Get priority number for incomplete items
  const getPriorityNumber = (item: ChecklistItem) => {
    if (item.completed) return null;
    const incompleteItems = sortedItems.filter(i => !i.completed);
    return incompleteItems.findIndex(i => i.id === item.id) + 1;
  };

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="새 할 일을 추가하세요... (Enter로 추가)"
          className="flex-1"
        />
        <Button size="sm" onClick={addItem} disabled={!newItem.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {sortedItems.map((item) => {
          const priorityNumber = getPriorityNumber(item);
          const isDraggedOver = dragOverItem === item.id;
          const isDragged = draggedItem === item.id;
          
          return (
            <div
              key={item.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, item.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center space-x-3 p-2 rounded-lg border group transition-all ${
                isDragged ? 'opacity-50 scale-95' : ''
              } ${
                isDraggedOver ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'
              } ${
                item.completed ? 'opacity-60' : ''
              }`}
            >
              {/* Drag Handle */}
              <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              
              {/* Priority Badge */}
              {priorityNumber && (
                <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 text-xs flex items-center justify-center">
                  {priorityNumber}
                </Badge>
              )}
              
              {/* Checkbox */}
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
              />
              
              {/* Task Text */}
              <span className={`flex-1 text-sm transition-all ${
                item.completed 
                  ? 'line-through text-muted-foreground' 
                  : 'text-foreground'
              }`}>
                {item.text}
              </span>
              
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          );
        })}
        
        {items.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-border rounded-lg">
            할 일이 없습니다<br />
            <span className="text-xs">위에서 새로운 할 일을 추가해보세요</span>
          </div>
        )}
        
        {items.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            총 {items.filter(i => !i.completed).length}개의 할 일, {items.filter(i => i.completed).length}개 완료
          </div>
        )}
      </div>
    </div>
  );
}