import React, { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CreateTestTabProps {
  onCreateTest: (test: {
    name: string;
    functionName: string;
    dataProvider?: string;
    parameters?: Record<string, any>;
    returnType?: string;
    groups?: string[];
    enabled: boolean;
  }) => void;
  onCancel: () => void;
}

export const CreateTestTab: React.FC<CreateTestTabProps> = ({
  onCreateTest,
  onCancel,
}) => {
  const [functionName, setFunctionName] = useState('');
  const [dataProvider, setDataProvider] = useState('');
  const [returnType] = useState('');
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
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-auto">
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-2">Create New Test Case</h2>
        <p className="text-gray-600">Create a new test for your integration</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
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
            </div>

            <div className="flex items-center justify-between my-6">
              <p className="text-sm">Advanced Configurations</p>
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
                <div className="flex items-center my-6 space-x-2">
                  <Checkbox
                    id="enabled"
                    checked={enabled}
                    onCheckedChange={(checked) => setEnabled(checked as boolean)}
                  />
                  <Label htmlFor="enabled" className="font-normal cursor-pointer">
                    Enabled - Enable/Disable the test
                  </Label>
                </div>

                <div className="space-y-2 my-8">
                  <Label htmlFor="data-provider">Parameters</Label>
                  <p className="text-sm text-blue-600 hover:text-blue-700">
                    + Add Parameter
                  </p>
                </div>

                <div className="space-y-2 my-8">
                  <Label htmlFor="data-provider">Data Provider</Label>
                  <p className="text-xs text-gray-500">
                    Data provider for the test
                  </p>
                  <Input
                    id="data-provider"
                    placeholder="Data provider for the test"
                    value={dataProvider}
                    onChange={(e) => setDataProvider(e.target.value)}
                  />
                </div>

                <div className="space-y-2 my-8">
                  <Label htmlFor="groups">Groups</Label>
                  <p className="text-xs text-gray-500">
                    Groups to run
                  </p>
                  <Input
                    id="groups"
                    placeholder="Group name"
                    value={groups}
                    onChange={(e) => setGroups(e.target.value)}
                  />
                  <p className="text-sm text-blue-600 hover:text-blue-700">
                    + Add Group
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!functionName.trim()}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
