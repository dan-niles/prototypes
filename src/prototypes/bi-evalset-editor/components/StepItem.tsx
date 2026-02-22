import { ChevronRight, MessageSquare, Wrench, Bot, Edit2, Trash2, GripVertical, Settings2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Step, StepType } from '../types';

export const StepIcon = ({ type }: { type: StepType }) => {
  switch (type) {
    case 'invoke':
      return (
        <div className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center bg-white shadow-sm">
          <Bot className="w-4 h-4 text-cyan-500" />
        </div>
      );
    case 'tool':
      return (
        <div className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center bg-white shadow-sm">
          <Wrench className="w-4 h-4 text-purple-500" />
        </div>
      );
    case 'chat':
      return (
        <div className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center bg-white shadow-sm">
          <MessageSquare className="w-4 h-4 text-orange-400" />
        </div>
      );
  }
};

export const StepLabel = ({ type }: { type: StepType }) => {
  switch (type) {
    case 'invoke':
      return 'Invoke Agent';
    case 'tool':
      return 'Execute Tool';
    case 'chat':
      return 'Chat';
  }
};

export const NormalStepItem = ({ step, isViewingCase = false }: { step: Step; isViewingCase?: boolean }) => {
  return (
    <div className="relative pl-6 flex items-center mb-1.5 last:mb-0">
      <div className="absolute left-[7px] top-0 bottom-0 w-[1px] bg-gray-100"></div>
      <div className="absolute left-[3px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white bg-gray-200 z-10"></div>

      <div className="flex-1 flex items-center justify-between p-2.5 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 transition-all cursor-pointer group ml-2">
        <div className="flex items-center gap-3">
          <StepIcon type={step.type} />
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-[13px] leading-tight">
              <StepLabel type={step.type} />
            </span>
            <span className="text-gray-500 text-[13px] font-medium">{step.name}</span>
          </div>
        </div>
        {!isViewingCase && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-400 font-medium">{step.duration}</span>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export const SortableToolStep = ({
  step,
  onEdit,
  onDelete
}: {
  step: Step;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto'
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/step">
      <div className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-600 transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-xl border border-purple-50 flex items-center justify-center bg-purple-50">
          <Wrench className="w-4 h-4 text-purple-600" />
        </div>
        <div className="flex-1 flex flex-col">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-1">
            Execute Tool
          </span>
          <button
            onClick={onEdit}
            className="text-left text-[14px] font-bold text-gray-800 hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            {step.name}
            <Settings2 className="w-3.5 h-3.5 opacity-40" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
