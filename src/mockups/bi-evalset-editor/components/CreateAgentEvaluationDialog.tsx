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
import { Database, FileText } from 'lucide-react';
import type { EvalSet } from '../types';

interface CreateAgentEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evalSets: EvalSet[];
  onCreateEvaluation: (evaluation: {
    name: string;
    type: 'from-eval-set' | 'standalone';
    evalSetId?: string;
    functionName?: string;
  }) => void;
}

export const CreateAgentEvaluationDialog: React.FC<CreateAgentEvaluationDialogProps> = ({
  open,
  onOpenChange,
  evalSets,
  onCreateEvaluation,
}) => {
  const [evaluationType, setEvaluationType] = useState<'from-eval-set' | 'standalone'>('from-eval-set');
  const [selectedEvalSet, setSelectedEvalSet] = useState('');
  const [functionName, setFunctionName] = useState('');
  const [evaluationName, setEvaluationName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (evaluationType === 'from-eval-set' && !selectedEvalSet) return;
    if (evaluationType === 'standalone' && !functionName.trim()) return;
    if (!evaluationName.trim()) return;

    onCreateEvaluation({
      name: evaluationName.trim(),
      type: evaluationType,
      evalSetId: evaluationType === 'from-eval-set' ? selectedEvalSet : undefined,
      functionName: evaluationType === 'standalone' ? functionName.trim() : undefined,
    });

    // Reset form
    setEvaluationType('from-eval-set');
    setSelectedEvalSet('');
    setFunctionName('');
    setEvaluationName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Agent Evaluation</DialogTitle>
          <DialogDescription>
            Create an evaluation to test agent behavior
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="eval-name">
                Evaluation Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="eval-name"
                placeholder="e.g., test-agent-tool-use"
                value={evaluationName}
                onChange={(e) => setEvaluationName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Evaluation Type</Label>

              <div className="space-y-3">
                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    evaluationType === 'from-eval-set'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="eval-type"
                    value="from-eval-set"
                    checked={evaluationType === 'from-eval-set'}
                    onChange={(e) => setEvaluationType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Database className="w-4 h-4" />
                      From Eval Set
                    </div>
                    <p className="text-sm text-gray-600">
                      Use an existing eval set as data provider for this evaluation
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    evaluationType === 'standalone'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="eval-type"
                    value="standalone"
                    checked={evaluationType === 'standalone'}
                    onChange={(e) => setEvaluationType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <FileText className="w-4 h-4" />
                      Standalone/Custom
                    </div>
                    <p className="text-sm text-gray-600">
                      Create a custom evaluation from scratch
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {evaluationType === 'from-eval-set' && (
              <div className="space-y-2">
                <Label htmlFor="eval-set">
                  Select Eval Set <span className="text-red-500">*</span>
                </Label>
                <select
                  id="eval-set"
                  value={selectedEvalSet}
                  onChange={(e) => setSelectedEvalSet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an eval set...</option>
                  {evalSets.map((evalSet) => (
                    <option key={evalSet.id} value={evalSet.id}>
                      {evalSet.name} ({evalSet.cases.length} case{evalSet.cases.length !== 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {evaluationType === 'standalone' && (
              <div className="space-y-2">
                <Label htmlFor="function-name">
                  Agent Function <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="function-name"
                  placeholder="Agent function to evaluate"
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  required
                />
              </div>
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
            <Button
              type="submit"
              disabled={
                !evaluationName.trim() ||
                (evaluationType === 'from-eval-set' && !selectedEvalSet) ||
                (evaluationType === 'standalone' && !functionName.trim())
              }
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
