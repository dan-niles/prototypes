import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Database, FileText, ChevronDown, ChevronUp, GitMerge, MessageSquareQuote, MousePointer2 } from 'lucide-react';
import type { EvalSet } from '../types';

interface CreateAgentEvaluationTabProps {
  evalSets: EvalSet[];
  onCreateEvaluation: (evaluation: {
    name: string;
    type: 'from-eval-set' | 'standalone';
    template?: 'tool-trajectory' | 'response-match' | 'custom';
    evalSetId?: string;
    functionName?: string;
    confidence: number;
    dataProvider?: string;
    parameters?: Record<string, any>;
    groups?: string[];
    enabled: boolean;
    agentInstance?: string;
  }) => void;
  onCancel: () => void;
}

export const CreateAgentEvaluationTab: React.FC<CreateAgentEvaluationTabProps> = ({
  evalSets,
  onCreateEvaluation,
  onCancel,
}) => {
  const [evaluationType, setEvaluationType] = useState<'from-eval-set' | 'standalone'>('from-eval-set');
  const [selectedEvalSet, setSelectedEvalSet] = useState('');
  const [template, setTemplate] = useState<'tool-trajectory' | 'response-match' | 'custom'>('custom');
  const [functionName] = useState('');
  const [evaluationName, setEvaluationName] = useState('');
  const [confidence, setConfidence] = useState(0.5);
  const [dataProvider, setDataProvider] = useState('');
  const [groups, setGroups] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');

  useEffect(() => {
    if (template === 'custom' || evaluationType !== 'from-eval-set') {
      setSelectedAgent('');
    }
  }, [template, evaluationType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (evaluationType === 'from-eval-set' && !selectedEvalSet) return;
    if (evaluationType === 'standalone' && !functionName.trim()) return;
    if (!evaluationName.trim()) return;

    onCreateEvaluation({
      name: evaluationName.trim(),
      type: evaluationType,
      template: evaluationType === 'from-eval-set' ? template : undefined,
      evalSetId: evaluationType === 'from-eval-set' ? selectedEvalSet : undefined,
      functionName: evaluationType === 'standalone' ? functionName.trim() : undefined,
      confidence,
      dataProvider: dataProvider.trim() || undefined,
      groups: groups.trim() ? groups.split(',').map(g => g.trim()) : undefined,
      enabled,
      agentInstance: (evaluationType === 'from-eval-set' && template !== 'custom' && selectedAgent) ? selectedAgent : undefined,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-auto">
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-2">Create New AI Evaluation</h2>
        <p className="text-gray-600">Create an evaluation to test AI integrations behavior</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="space-y-8 py-4">
            <div className="space-y-2">
              <Label htmlFor="eval-name">
                Evaluation Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="eval-name"
                placeholder="e.g., agentEval"
                value={evaluationName}
                onChange={(e) => setEvaluationName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence">
                Confidence
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Slider
                    id="confidence"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[confidence]}
                    onValueChange={(value) => setConfidence(value[0])}
                  />
                </div>
                <Input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={confidence}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 1) {
                      setConfidence(val);
                    }
                  }}
                  className="w-24"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>How would you like to build this evaluation?</Label>

              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex flex-col gap-3 p-5 border-2 rounded-xl cursor-pointer transition-all ${evaluationType === 'from-eval-set'
                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/10'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${evaluationType === 'from-eval-set' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Database className="w-5 h-5" />
                    </div>
                    <input
                      type="radio"
                      name="eval-type"
                      value="from-eval-set"
                      checked={evaluationType === 'from-eval-set'}
                      onChange={(e) => setEvaluationType(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">From Eval Set</div>
                    <p className="text-xs text-gray-600 leading-relaxed mt-1">
                      Use conversation traces from an existing dataset to evaluate your agent.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex flex-col gap-3 p-5 border-2 rounded-xl cursor-pointer transition-all ${evaluationType === 'standalone'
                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/10'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${evaluationType === 'standalone' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <input
                      type="radio"
                      name="eval-type"
                      value="standalone"
                      checked={evaluationType === 'standalone'}
                      onChange={(e) => setEvaluationType(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Standalone/Custom</div>
                    <p className="text-xs text-gray-600 leading-relaxed mt-1">
                      Implement a fully custom logic to evaluate specific behaviors from scratch.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {evaluationType === 'from-eval-set' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <Label htmlFor="eval-set" className="text-sm font-bold text-gray-700">
                    Step 1: Select Eval Set <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="eval-set"
                    value={selectedEvalSet}
                    onChange={(e) => setSelectedEvalSet(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                    required
                  >
                    <option value="">Select an eval set...</option>
                    {evalSets.map((evalSet) => (
                      <option key={evalSet.id} value={evalSet.id}>
                        {evalSet.name} ({evalSet.cases.length} cases)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEvalSet && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-sm font-bold text-gray-700">
                      Step 2: Choose Evaluation Template
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setTemplate('tool-trajectory')}
                        className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl transition-all ${template === 'tool-trajectory'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 bg-white text-gray-600'
                          }`}
                      >
                        <div className={`p-2 rounded-lg ${template === 'tool-trajectory' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                          <GitMerge className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-center">Tool Trajectory</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTemplate('response-match')}
                        className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl transition-all ${template === 'response-match'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 bg-white text-gray-600'
                          }`}
                      >
                        <div className={`p-2 rounded-lg ${template === 'response-match' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                          <MessageSquareQuote className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-center">Response Match</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTemplate('custom')}
                        className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl transition-all ${template === 'custom'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 bg-white text-gray-600'
                          }`}
                      >
                        <div className={`p-2 rounded-lg ${template === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                          <MousePointer2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-center">Custom Logic</span>
                      </button>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 leading-relaxed italic">
                      {template === 'tool-trajectory' && "Checks if the agent invokes the correct sequence of tools as defined in your eval set cases."}
                      {template === 'response-match' && "Validates the final agent response against expected outputs using semantic similarity or exact match."}
                      {template === 'custom' && "Define your own validation logic for this eval set. You'll need to implement the function later."}
                    </div>

                    {template !== 'custom' && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="agent-select" className="text-sm font-bold text-gray-700">
                          Step 3: Select Agent Instance <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="agent-select"
                          value={selectedAgent}
                          onChange={(e) => setSelectedAgent(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                          required
                        >
                          <option value="">Select an agent instance...</option>
                          <option value="mathTutorAgent">mathTutorAgent</option>
                          <option value="customerServiceAgent">customerServiceAgent</option>
                          <option value="codeReviewAgent">codeReviewAgent</option>
                          <option value="researchAssistantAgent">researchAssistantAgent</option>
                          <option value="dataAnalysisAgent">dataAnalysisAgent</option>
                          <option value="contentWriterAgent">contentWriterAgent</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <p className="text-sm font-medium text-gray-600">Advanced Configurations</p>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
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
              <div className="space-y-6 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Checkbox
                    id="enabled"
                    checked={enabled}
                    onCheckedChange={(checked) => setEnabled(checked as boolean)}
                  />
                  <Label htmlFor="enabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Enable evaluation immediately
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="groups" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Groups</Label>
                    <Input
                      id="groups"
                      placeholder="e.g., core, safety"
                      value={groups}
                      onChange={(e) => setGroups(e.target.value)}
                      className="bg-white border-gray-200 rounded-xl focus:ring-blue-500/20"
                    />
                  </div>

                  {evaluationType === 'standalone' && (
                    <div className="space-y-2">
                      <Label htmlFor="data-provider" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data Provider</Label>
                      <Input
                        id="data-provider"
                        placeholder="Custom data source"
                        value={dataProvider}
                        onChange={(e) => setDataProvider(e.target.value)}
                        className="bg-white border-gray-200 rounded-xl focus:ring-blue-500/20"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-gray-100 mt-10">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
              disabled={
                !evaluationName.trim() ||
                (evaluationType === 'from-eval-set' && !selectedEvalSet) ||
                (evaluationType === 'from-eval-set' && template !== 'custom' && !selectedAgent)
              }
            >
              Create Evaluation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
