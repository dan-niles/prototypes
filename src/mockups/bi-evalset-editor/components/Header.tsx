import React from 'react';
import { Trash2, FileEdit, MoreVertical, Plus, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface HeaderProps {
  isEvalMode: boolean;
  isViewingCase: boolean;
  onClearChat: () => void;
  onToggleEvalMode: () => void;
  evalSets: string[];
  selectedEvalSet: string;
  caseName: string;
  onEvalSetChange: (evalSet: string) => void;
  onCaseNameChange: (caseName: string) => void;
  onOpenCreateModal: () => void;
  onEditCase?: () => void;
  onDeleteCase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isEvalMode,
  isViewingCase,
  onClearChat,
  onToggleEvalMode,
  evalSets,
  selectedEvalSet,
  caseName,
  onEvalSetChange,
  onCaseNameChange,
  onOpenCreateModal
}) => {
  return (
    <header className={`flex items-center justify-${isEvalMode || isViewingCase ? 'center' : 'end'} px-6 py-4 border-b border-gray-200 z-20 gap-2 transition-colors ${isEvalMode || isViewingCase ? 'bg-gray-50' : 'bg-white'
      }`}>
      {isViewingCase && !isEvalMode ? (
        // Viewing a case (read-only)
        <div className="flex items-center gap-2">
          {/* Eval Set (Read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 px-1">Eval Set</label>
            <div className="px-4 py-2.5 min-w-[200px] text-sm font-medium text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-lg cursor-not-allowed">
              {selectedEvalSet}
            </div>
          </div>

          {/* Case Name (Read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 px-1">Case Name</label>
            <div className="px-4 py-2.5 min-w-[200px] text-sm font-medium text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-lg cursor-not-allowed">
              {caseName}
            </div>
          </div>
        </div>
      ) : isEvalMode ? (
        // Editing a case
        <div className="flex items-center gap-2">
          {/* Eval Set Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 px-1">Eval Set</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between gap-3 px-4 py-2.5 min-w-[200px] text-sm font-medium bg-white border-2 border-blue-500 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-900">{selectedEvalSet}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem
                  onClick={onOpenCreateModal}
                  className="text-blue-600 font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Eval Set
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {evalSets.map((set) => (
                  <DropdownMenuItem
                    key={set}
                    onClick={() => onEvalSetChange(set)}
                    className={selectedEvalSet === set ? 'bg-gray-100' : ''}
                  >
                    {set}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Case Name Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="case-name" className="text-xs font-medium text-gray-600 px-1">
              Case Name
            </label>
            <input
              id="case-name"
              type="text"
              value={caseName}
              onChange={(e) => onCaseNameChange(e.target.value)}
              placeholder="case-name"
              className="px-4 py-2.5 min-w-[200px] text-sm font-medium bg-white border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      ) : (
        // Normal chat mode
        <button
          onClick={onClearChat}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      )}

      <div className="flex items-center gap-2">
        {!isEvalMode && !isViewingCase && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-9 h-9 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onToggleEvalMode}>
                <FileEdit className="w-4 h-4 mr-2" />
                Create Evaluation Case
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
