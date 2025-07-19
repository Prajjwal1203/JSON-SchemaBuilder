import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SchemaField } from './SchemaField';

export type FieldType = 'String' | 'Number' | 'Float' | 'Nested' | 'ObjectId' | 'Boolean';

export interface SchemaFieldData {
  id: string;
  key: string;
  type: FieldType;
  children?: SchemaFieldData[];
}

const JSONSchemaBuilder: React.FC = () => {
  const [schema, setSchema] = useState<SchemaFieldData[]>([
    {
      id: '1',
      key: 'name',
      type: 'String'
    }
  ]);

  const generateId = useCallback(() => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }, []);

  const addField = useCallback((parentPath?: string[]) => {
    const newField: SchemaFieldData = {
      id: generateId(),
      key: 'newField',
      type: 'String'
    };

    setSchema(prevSchema => {
      if (!parentPath) {
        return [...prevSchema, newField];
      }

      const updateNestedFields = (fields: SchemaFieldData[], path: string[]): SchemaFieldData[] => {
        if (path.length === 1) {
          return fields.map(field => {
            if (field.id === path[0]) {
              return {
                ...field,
                children: [...(field.children || []), newField]
              };
            }
            return field;
          });
        }

        return fields.map(field => {
          if (field.id === path[0]) {
            return {
              ...field,
              children: updateNestedFields(field.children || [], path.slice(1))
            };
          }
          return field;
        });
      };

      return updateNestedFields(prevSchema, parentPath);
    });
  }, [generateId]);

  const updateField = useCallback((fieldId: string, updates: Partial<SchemaFieldData>, parentPath?: string[]) => {
    setSchema(prevSchema => {
      const updateNestedFields = (fields: SchemaFieldData[], path: string[] = []): SchemaFieldData[] => {
        if (path.length === 0) {
          return fields.map(field => {
            if (field.id === fieldId) {
              const updatedField = { ...field, ...updates };
            
              if (updatedField.type !== 'Nested') {
                delete updatedField.children;
              }
              return updatedField;
            }
            if (field.children) {
              return {
                ...field,
                children: updateNestedFields(field.children)
              };
            }
            return field;
          });
        } else {
          return fields.map(field => {
            if (field.id === path[0]) {
              return {
                ...field,
                children: updateNestedFields(field.children || [], path.slice(1))
              };
            }
            return field;
          });
        }
      };

      return updateNestedFields(prevSchema, parentPath || []);
    });
  }, []);

  const deleteField = useCallback((fieldId: string, parentPath?: string[]) => {
    setSchema(prevSchema => {
      if (!parentPath) {
        return prevSchema.filter(field => field.id !== fieldId);
      }

      const updateNestedFields = (fields: SchemaFieldData[], path: string[]): SchemaFieldData[] => {
        if (path.length === 1) {
          return fields.map(field => {
            if (field.id === path[0]) {
              return {
                ...field,
                children: (field.children || []).filter(child => child.id !== fieldId)
              };
            }
            return field;
          });
        }

        return fields.map(field => {
          if (field.id === path[0]) {
            return {
              ...field,
              children: updateNestedFields(field.children || [], path.slice(1))
            };
          }
          return field;
        });
      };

      return updateNestedFields(prevSchema, parentPath);
    });
  }, []);

  const generateJSON = useCallback((fields: SchemaFieldData[]): unknown => {
    const result: unknown = {};
    
    fields.forEach(field => {
      if (field.type === 'String') {
        result[field.key] = 'sample string';
      } else if (field.type === 'Number') {
        result[field.key] = 0;
      } 
       else if (field.type === 'Float') {
        result[field.key] = 0.000;
      }
      else if (field.type === 'Boolean') {
        result[field.key] = 'true and false';
      }
      else if (field.type === 'ObjectId') {
        result[field.key] = 'ee24ad';
      }
      else if (field.type === 'Nested' && field.children) {
        result[field.key] = generateJSON(field.children);
      }
    });

    return result;
  }, []);

  const renderFields = useCallback((fields: SchemaFieldData[], parentPath: string[] = [], level: number = 0) => {
    return fields.map((field, index) => (
      <SchemaField
        key={field.id}
        field={field}
        level={level}
        onUpdate={(updates) => updateField(field.id, updates, parentPath.length > 0 ? parentPath : undefined)}
        onDelete={() => deleteField(field.id, parentPath.length > 0 ? parentPath : undefined)}
        onAddNested={() => addField([...parentPath, field.id])}
      >
        {field.type === 'Nested' && field.children && field.children.length > 0 && (
          <div className="ml-6 mt-2 space-y-2">
            {renderFields(field.children, [...parentPath, field.id], level + 1)}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addField([...parentPath, field.id])}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Nested Field
            </Button>
          </div>
        )}
      </SchemaField>
    ));
  }, [updateField, deleteField, addField]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">JSON Schema Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="builder" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="builder">Schema Builder</TabsTrigger>
              <TabsTrigger value="json">JSON Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="builder" className="space-y-4">
              <div className="space-y-4">
                {renderFields(schema)}
                <Button
                  onClick={() => addField()}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="json">
              <Card>
                <CardContent className="p-4">
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(generateJSON(schema), null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default JSONSchemaBuilder;