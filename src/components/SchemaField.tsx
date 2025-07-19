import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FieldType, SchemaFieldData } from './JSONSchemaBuilder';

interface SchemaFieldProps {
  field: SchemaFieldData;
  level: number;
  onUpdate: (updates: Partial<SchemaFieldData>) => void;
  onDelete: () => void;
  onAddNested: () => void;
  children?: React.ReactNode;
}

export const SchemaField: React.FC<SchemaFieldProps> = ({
  field,
  level,
  onUpdate,
  onDelete,
  onAddNested,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState(field.key);

  const handleKeyChange = (value: string) => {
    setTempKey(value);
  };

  const handleKeySubmit = () => {
    if (tempKey.trim()) {
      onUpdate({ key: tempKey.trim() });
    } else {
      setTempKey(field.key);
    }
    setIsEditing(false);
  };

  const handleKeyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleKeySubmit();
    } else if (e.key === 'Escape') {
      setTempKey(field.key);
      setIsEditing(false);
    }
  };

  const handleTypeChange = (value: FieldType) => {
    onUpdate({ type: value });
    if (value === 'Nested' && !field.children) {
    
      setTimeout(() => onAddNested(), 0);
    }
  };

  const getTypeColor = (type: FieldType) => {
    switch (type) {
      case 'String':
        return 'text-info';
      case 'Number':
        return 'text-success';
      case 'Nested':
        return 'text-warning';
      default:
        return 'text-foreground';
    }
  };

  const indentLevel = level * 1.5;

  return (
    <div className="space-y-2">
      <Card className={cn(
        "transition-all duration-200",
        level > 0 && "ml-6 border-l-4 border-l-primary/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {field.type === 'Nested' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            <div className="flex-1 flex items-center gap-3">
              {isEditing ? (
                <Input
                  value={tempKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  onBlur={handleKeySubmit}
                  onKeyDown={handleKeyKeyPress}
                  className="w-32"
                  autoFocus
                  placeholder="Field key"
                />
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-left font-medium hover:bg-muted px-2 py-1 rounded transition-colors"
                >
                  {field.key}
                </button>
              )}

              <div className="text-muted-foreground">:</div>

              <Select value={field.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="String">
                    <span className={getTypeColor('String')}>String</span>
                  </SelectItem>
                   <SelectItem value="ObjectId">
                    <span className={getTypeColor('Number')}>ObjectId</span>
                  </SelectItem>
                   <SelectItem value="Float">
                    <span className={getTypeColor('Nested')}>Float</span>
                  </SelectItem>
                   <SelectItem value="Boolean">
                    <span className={getTypeColor('String')}>Boolean</span>
                  </SelectItem>
                  <SelectItem value="Number">
                    <span className={getTypeColor('Number')}>Number</span>
                  </SelectItem>
                  <SelectItem value="Array">
                    <span className={getTypeColor('String')}>Array</span>
                  </SelectItem>
                  <SelectItem value="Nested">
                    <span className={getTypeColor('Nested')}>Nested</span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {field.type === 'Nested' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddNested}
                  className="ml-auto"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {field.type === 'Nested' && isExpanded && children}
        </CardContent>
      </Card>
    </div>
  );
};