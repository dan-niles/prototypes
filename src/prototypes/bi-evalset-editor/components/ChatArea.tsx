import React, { useRef, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import type { MessagePair as MessagePairType, Step } from '../types';
import { MessagePairComponent } from './MessagePair';

interface ChatAreaProps {
  messages: MessagePairType[];
  isEvalMode: boolean;
  isViewingCase?: boolean;
  editingId: string | null;
  expandedSteps: Record<string, boolean>;
  onToggleSteps: (id: string) => void;
  onUpdatePair: (id: string, updates: Partial<MessagePairType>) => void;
  onDeletePair: (id: string) => void;
  onSetEditingId: (id: string | null) => void;
  onAddEmptyPair: () => void;
  onAddToolStep: (pairId: string) => void;
  onEditStep: (pairId: string, step: Step) => void;
  onDeleteStep: (pairId: string, stepId: string) => void;
  onUpdateSteps: (pairId: string, steps: Step[]) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isEvalMode,
  isViewingCase = false,
  editingId,
  expandedSteps,
  onToggleSteps,
  onUpdatePair,
  onDeletePair,
  onSetEditingId,
  onAddEmptyPair,
  onAddToolStep,
  onEditStep,
  onDeleteStep,
  onUpdateSteps
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !isEvalMode && !isViewingCase) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isEvalMode, isViewingCase]);

  return (
    <main className="flex-1 overflow-y-auto bg-[#FFFFFF]" ref={scrollRef}>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="space-y-16">
          {messages.map((pair) => (
            <MessagePairComponent
              key={pair.id}
              pair={pair}
              isEvalMode={isEvalMode}
              isViewingCase={isViewingCase}
              editingId={editingId}
              expandedSteps={expandedSteps[pair.id] || false}
              onToggleSteps={() => onToggleSteps(pair.id)}
              onUpdatePair={(updates) => onUpdatePair(pair.id, updates)}
              onDeletePair={() => onDeletePair(pair.id)}
              onSetEditingId={onSetEditingId}
              onAddToolStep={() => onAddToolStep(pair.id)}
              onEditStep={(step) => onEditStep(pair.id, step)}
              onDeleteStep={(stepId) => onDeleteStep(pair.id, stepId)}
              onUpdateSteps={(steps) => onUpdateSteps(pair.id, steps)}
            />
          ))}
        </div>

        {isEvalMode && (
          <div className="flex justify-center pt-12">
            <button
              onClick={onAddEmptyPair}
              className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-dashed border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 rounded-2xl font-bold transition-all shadow-sm group"
            >
              <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Add Message Pair
            </button>
          </div>
        )}
      </div>
    </main>
  );
};
