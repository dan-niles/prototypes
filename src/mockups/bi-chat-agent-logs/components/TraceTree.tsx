import { ChevronRight, ChevronDown, Clock, Bot, Wrench, MessageSquare, Zap, DatabaseZap } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export interface TraceNode {
  id: string;
  type: 'invoke_agent' | 'chat' | 'execute_tool';
  name: string;
  duration: string;
  children?: TraceNode[];
  spanData?: SpanData;
}

export interface SpanData {
  spanId: string;
  traceId: string;
  parentSpanId: string;
  startTime: string;
  endTime: string;
  duration: string;
  attributes: Array<{ key: string; value: string }>;
  badge?: string;
}

interface TraceTreeProps {
  nodes: TraceNode[];
  level?: number;
  onNodeClick: (node: TraceNode) => void;
  selectedNodeId?: string;
}

export function TraceTree({ nodes, level = 0, onNodeClick, selectedNodeId }: TraceTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(nodes.map(n => n.id)));

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getTypeStyles = (type: string) => {
    const baseStyles = 'text-white text-xs px-2 py-0.5 rounded flex items-center gap-1';
    switch (type) {
      case 'invoke_agent':
        return `${baseStyles} bg-blue-500`;
      case 'chat':
        return `${baseStyles} bg-amber-500`;
      case 'execute_tool':
        return `${baseStyles} bg-emerald-500`;
      default:
        return `${baseStyles} bg-gray-500`;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoke_agent':
        return <Bot className="w-3 h-3" />;
      case 'chat':
        return <MessageSquare className="w-3 h-3" />;
      case 'execute_tool':
        return <Wrench className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'invoke_agent':
        return 'Agent';
      case 'chat':
        return 'Model Call';
      case 'execute_tool':
        return 'Tool';
      default:
        return type;
    }
  };

  return (
    <div>
      {nodes.map((node) => (
        <div key={node.id}>
          <div
            className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-gray-50 ${selectedNodeId === node.id ? 'bg-blue-50' : ''
              }`}
            style={{ paddingLeft: `${level * 24 + 8}px` }}
            onClick={() => onNodeClick(node)}
          >
            <div className="flex items-center gap-2 flex-1">
              {node.children && node.children.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(node.id);
                  }}
                  className="p-0 hover:bg-gray-200 rounded"
                >
                  {expandedNodes.has(node.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
              {(!node.children || node.children.length === 0) && (
                <div className="w-4 h-4" />
              )}
              <span className={getTypeStyles(node.type)}>
                {getTypeIcon(node.type)}
                {getTypeLabel(node.type)}
              </span>
              <span className="text-sm text-gray-700">{node.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              {(() => {
                const inputTokens = parseInt(node.spanData?.attributes.find(a => a.key === 'gen_ai.usage.input_tokens')?.value || '0');
                const outputTokens = parseInt(node.spanData?.attributes.find(a => a.key === 'gen_ai.usage.output_tokens')?.value || '0');
                const totalTokens = inputTokens + outputTokens;
                return totalTokens > 0 ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-default">
                        <Zap className="w-3 h-3" />
                        <span>{totalTokens} tokens</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white text-gray-900 border-gray-200 p-3">
                      <div className="space-y-2">
                        <div className="font-semibold text-sm mb-2">Total token breakdown</div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <span>Input</span>
                            <span className="text-gray-500">{totalTokens > 0 ? Math.round((inputTokens / totalTokens) * 100) : 0}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DatabaseZap className="w-3 h-3" />
                            <span>{inputTokens}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <span>Output</span>
                            <span className="text-gray-500">{totalTokens > 0 ? Math.round((outputTokens / totalTokens) * 100) : 0}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DatabaseZap className="w-3 h-3" />
                            <span>{outputTokens}</span>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : null;
              })()}
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{node.duration}</span>
              </div>
            </div>
          </div>
          {node.children && node.children.length > 0 && expandedNodes.has(node.id) && (
            <TraceTree
              nodes={node.children}
              level={level + 1}
              onNodeClick={onNodeClick}
              selectedNodeId={selectedNodeId}
            />
          )}
        </div>
      ))}
    </div>
  );
}