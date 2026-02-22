import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CreateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTest: (test: {
    name: string;
    functionName: string;
    dataProvider?: string;
    parameters?: Record<string, any>;
    returnType?: string;
    groups?: string[];
    enabled: boolean;
  }) => void;
}

export const CreateTestDialog: React.FC<CreateTestDialogProps> = ({
  open,
  onOpenChange,
  onCreateTest,
}) => {
  const [functionName, setFunctionName] = useState('');
  const [dataProvider, setDataProvider] = useState('');
  const [returnType, setReturnType] = useState('');
  const [groups, setGroups] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!functionName.trim()) return;

    onCreateTest({
      name: functionName,
      functionName: functionName.trim(),
      dataProvider: dataProvider.trim() || undefined,
      returnType: returnType.trim() || undefined,
      groups: groups.trim() ? groups.split(',').map(g => g.trim()) : undefined,
      enabled,
    });

    // Reset form
    setFunctionName('');
    setDataProvider('');
    setReturnType('');
    setGroups('');
    setEnabled(true);
    setShowAdvanced(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Test Case</DialogTitle>
          <DialogDescription>
            Create a new test for your integration
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-function">
                Test Function <span className="text-red-500">*</span>
              </Label>
              <Input
                id="test-function"
                placeholder="Test function"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                required
              />
              {!functionName && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="text-xs">⚠</span> missing identifier
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-provider">Data Provider</Label>
              <Input
                id="data-provider"
                placeholder="Data provider for the test"
                value={dataProvider}
                onChange={(e) => setDataProvider(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Data provider for the test
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                {showAdvanced ? (
                  <>
                    <ChevronUp className="w-4 h-4" /> Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" /> Expand
                  </>
                )}
              </button>
            </div>

            {showAdvanced && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="return-type">Return Type</Label>
                  <Textarea
                    id="return-type"
                    placeholder="Return type of the function"
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groups">Groups</Label>
                  <Input
                    id="groups"
                    placeholder="Groups to run (comma-separated)"
                    value={groups}
                    onChange={(e) => setGroups(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Comma-separated list of groups
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enabled"
                    checked={enabled}
                    onCheckedChange={(checked) => setEnabled(checked as boolean)}
                  />
                  <Label htmlFor="enabled" className="font-normal cursor-pointer">
                    Enabled - Enable/Disable the test
                  </Label>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!functionName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
