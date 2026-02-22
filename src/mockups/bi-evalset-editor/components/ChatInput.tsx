import React from 'react';
import { Send, Save, Trash, Edit2, Trash2 } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  isEvalMode: boolean;
  isViewingCase: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onExportJson: (type: 'current' | 'eval') => void;
  onToggleEvalMode: () => void;
  onEditCase?: () => void;
  onDeleteCase?: () => void;
  onSaveCase?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  isEvalMode,
  isViewingCase,
  onInputChange,
  onSubmit,
  onToggleEvalMode,
  onEditCase,
  onDeleteCase,
  onSaveCase
}) => {
  if (isViewingCase && !isEvalMode) {
    return (
      <footer className="px-6 py-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
          <button
            onClick={onDeleteCase}
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg transition-all shadow-sm text-red-700 border border-red-200 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={onEditCase}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </footer>
    );
  }

  if (isEvalMode) {
    return (
      <footer className="px-6 py-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
          <button
            onClick={onToggleEvalMode}
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg transition-all shadow-sm text-amber-700 border border-red-200 hover:bg-red-100"
          >
            <Trash className="w-4 h-4" />
            Discard
          </button>
          <button
            onClick={onSaveCase}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Case
          </button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="px-6 py-6 bg-white border-t border-gray-50">
      <div className="max-w-3xl mx-auto relative">
        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type a message..."
            className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-[14px] shadow-inner transition-all placeholder:text-gray-400 font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl transition-all shadow-md active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </footer>
  );
};
