import { X } from 'lucide-react';

export interface Tab {
  id: string;
  title: string;
  type: 'agent-chat' | 'evaluations' | 'dummy' | 'create-agent-eval' | 'create-test';
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export function TabBar({ tabs, activeTab, onTabClick, onTabClose }: TabBarProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center h-9 bg-gray-100 border-b border-gray-300">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            flex items-center gap-2 px-3 h-full cursor-pointer group border-r border-gray-300
            ${activeTab === tab.id
              ? 'bg-white text-gray-900 border-t-2 border-t-blue-500'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="text-sm">{tab.title}</span>
          <button
            className="opacity-100 group-hover:opacity-100 hover:bg-gray-300 rounded p-0.5 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
