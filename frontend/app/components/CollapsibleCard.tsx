import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface CollapsibleCardProps {
  title: string;
  defaultExpanded?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
}

export function CollapsibleCard({ 
  title, 
  defaultExpanded = false, 
  placeholder,
  value = '',
  onChange,
  children 
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium">{title}</h3>
        <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border">
          {children || (
            <Textarea
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          )}
        </div>
      )}
    </Card>
  );
}