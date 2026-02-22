import React from 'react';
import { User, Bot, Edit2, Trash2, Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { MessagePair as MessagePairType, Step } from '../types';
import { NormalStepItem, SortableToolStep } from './StepItem';

interface MessagePairProps {
  pair: MessagePairType;
  isEvalMode: boolean;
  isViewingCase?: boolean;
  editingId: string | null;
  expandedSteps: boolean;
  onToggleSteps: () => void;
  onUpdatePair: (updates: Partial<MessagePairType>) => void;
  onDeletePair: () => void;
  onSetEditingId: (id: string | null) => void;
  onAddToolStep: () => void;
  onEditStep: (step: Step) => void;
  onDeleteStep: (stepId: string) => void;
  onUpdateSteps: (steps: Step[]) => void;
}

export const MessagePairComponent: React.FC<MessagePairProps> = ({
  pair,
  isEvalMode,
  isViewingCase = false,
  editingId,
  expandedSteps,
  onToggleSteps,
  onUpdatePair,
  onDeletePair,
  onSetEditingId,
  onAddToolStep,
  onEditStep,
  onDeleteStep,
  onUpdateSteps
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const toolSteps = pair.steps.filter((s) => s.type === 'tool');
    const oldIndex = toolSteps.findIndex((s) => s.id === active.id);
    const newIndex = toolSteps.findIndex((s) => s.id === over.id);

    const reorderedToolSteps = arrayMove(toolSteps, oldIndex, newIndex);
    const otherSteps = pair.steps.filter((s) => s.type !== 'tool');
    const newSteps = [...otherSteps, ...reorderedToolSteps];

    onUpdateSteps(newSteps);
  };

  return (
    <div className="relative group/pair">
      <div className="space-y-8">
        {/* User Message */}
        <div className="flex items-start justify-end gap-3 group/user">
          <div className="flex-1 flex flex-col items-end relative">
            {isEvalMode && editingId === `${pair.id}-user` ? (
              <div className="w-full flex flex-col items-end gap-2">
                <textarea
                  value={pair.userInput}
                  onChange={(e) => onUpdatePair({ userInput: e.target.value })}
                  className="w-full max-w-[80%] bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-tr-sm border-2 border-blue-400 focus:outline-none text-[14px] leading-relaxed resize-y shadow-lg"
                  rows={3}
                  autoFocus
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
                <button
                  onClick={() => onSetEditingId(null)}
                  className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Save changes
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isEvalMode && (
                  <div className="opacity-0 group-hover/user:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={onDeletePair}
                      className="p-2 bg-white border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl shadow-sm transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSetEditingId(`${pair.id}-user`)}
                      className="p-2 bg-white border border-blue-100 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl shadow-sm transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-sm transition-all ${isEvalMode
                      ? 'bg-[#DBEAFE] cursor-pointer hover:ring-2 hover:ring-blue-300 ring-offset-2 border border-blue-100'
                      : 'bg-[#DBEAFE] text-gray-800'
                    }`}
                  onClick={() => isEvalMode && onSetEditingId(`${pair.id}-user`)}
                >
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{pair.userInput}</p>
                </div>
              </div>
            )}
          </div>
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mt-1 flex-shrink-0 border border-gray-100 shadow-sm">
            <User className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Agent Sequence */}
        <div className="flex items-start gap-3 group/agent-container">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center mt-1 flex-shrink-0 shadow-sm">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 space-y-4 max-w-[90%] relative">
            {!isEvalMode && !isViewingCase && (
              <div className="space-y-3">
                <button
                  onClick={onToggleSteps}
                  className="flex items-center gap-1.5 text-[13px] text-gray-600 font-semibold hover:text-gray-900 transition-colors group/btn"
                >
                  <span>Execution Steps ({pair.steps.length})</span>
                  <motion.div
                    animate={{ rotate: expandedSteps ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {expandedSteps && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1">
                        {pair.steps.map((step) => (
                          <NormalStepItem key={step.id} step={step} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {isViewingCase && (
              <div className="space-y-2">
                {pair.steps
                  .filter((s) => s.type === 'tool')
                  .map((step) => (
                    <NormalStepItem key={step.id} step={step} isViewingCase={true} />
                  ))}
              </div>
            )}

            {isEvalMode && (
              <div className="space-y-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={pair.steps.filter((s) => s.type === 'tool').map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {pair.steps
                      .filter((s) => s.type === 'tool')
                      .map((step) => (
                        <SortableToolStep
                          key={step.id}
                          step={step}
                          onEdit={() => onEditStep(step)}
                          onDelete={() => onDeleteStep(step.id)}
                        />
                      ))}
                  </SortableContext>
                </DndContext>

                <button
                  onClick={onAddToolStep}
                  className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-xl border-2 border-dashed border-blue-100 transition-all w-full justify-center mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Tool Execution
                </button>
              </div>
            )}

            <div className="relative group/agent">
              {isEvalMode && editingId === `${pair.id}-agent` ? (
                <div className="w-full flex flex-col items-start gap-2">
                  <textarea
                    value={pair.agentOutput}
                    onChange={(e) => onUpdatePair({ agentOutput: e.target.value })}
                    className="w-full bg-white border-2 border-blue-400 px-4 py-3 rounded-2xl rounded-tl-sm shadow-lg focus:outline-none text-[14px] leading-relaxed resize-none min-h-[80px]"
                    autoFocus
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                  <button
                    onClick={() => onSetEditingId(null)}
                    className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Save changes
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className={`border border-gray-100 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm inline-block min-w-[140px] transition-all relative ${isEvalMode
                        ? 'bg-white cursor-pointer hover:ring-2 hover:ring-blue-300 ring-offset-2'
                        : 'bg-white'
                      }`}
                    onClick={() => isEvalMode && onSetEditingId(`${pair.id}-agent`)}
                  >
                    <p className="text-[14px] leading-relaxed text-gray-800 whitespace-pre-wrap">
                      {pair.agentOutput}
                    </p>
                  </div>

                  {isEvalMode && (
                    <button
                      onClick={() => onSetEditingId(`${pair.id}-agent`)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover/agent:opacity-100 shadow-sm border border-gray-50 bg-white flex-shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {!isEvalMode && !isViewingCase && (
              <button className="text-[13px] text-blue-600 font-bold hover:text-blue-700 transition-colors block pl-1">
                View All Logs
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
