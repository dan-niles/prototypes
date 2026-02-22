import { useState, useMemo } from 'react';
import { Bot, Wrench, MessageSquare, ZoomIn, ZoomOut, Zap } from 'lucide-react';
import type { TraceNode } from './TraceTree';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface WaterfallViewProps {
  nodes: TraceNode[];
  onNodeClick: (node: TraceNode) => void;
  selectedNodeId?: string;
}

interface FlatNode extends TraceNode {
  level: number;
  startOffsetMs: number;
  durationMs: number;
}

export function WaterfallView({ nodes, onNodeClick, selectedNodeId }: WaterfallViewProps) {
  const [zoom, setZoom] = useState(1);

  const parseDuration = (duration: string): number => {
    const num = parseFloat(duration);
    if (duration.includes('ms')) return num;
    if (duration.includes('s')) return num * 1000;
    return num;
  };

  // Get the root trace start time as reference point
  const traceStartTime = useMemo(() => {
    if (nodes[0]?.spanData?.startTime) {
      return new Date(nodes[0].spanData.startTime).getTime();
    }
    return 0;
  }, [nodes]);

  const flattenNodes = (nodeList: TraceNode[], level = 0): FlatNode[] => {
    const result: FlatNode[] = [];
    nodeList.forEach(node => {
      const nodeStart = node.spanData?.startTime
        ? new Date(node.spanData.startTime).getTime()
        : traceStartTime;
      const startOffsetMs = nodeStart - traceStartTime;
      const durationMs = parseDuration(node.duration);

      result.push({ ...node, level, startOffsetMs, durationMs });
      if (node.children && node.children.length > 0) {
        result.push(...flattenNodes(node.children, level + 1));
      }
    });
    return result;
  };

  const flatNodes = flattenNodes(nodes);
  const totalDurationMs = parseDuration(nodes[0]?.duration || '0');

  // Calculate timeline width based on zoom
  const timelineWidth = 100 * zoom;

  // Generate time markers
  const timeMarkers = useMemo(() => {
    const markers: number[] = [];
    const intervalMs = totalDurationMs <= 2000 ? 500 :
      totalDurationMs <= 5000 ? 1000 :
        totalDurationMs <= 10000 ? 2000 : 5000;
    for (let t = 0; t <= totalDurationMs; t += intervalMs) {
      markers.push(t);
    }
    return markers;
  }, [totalDurationMs]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'invoke_agent':
        return { bg: 'bg-blue-500', text: 'text-white' };
      case 'chat':
        return { bg: 'bg-amber-500', text: 'text-white' };
      case 'execute_tool':
        return { bg: 'bg-emerald-500', text: 'text-white' };
      default:
        return { bg: 'bg-gray-500', text: 'text-white' };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'invoke_agent':
        return 'Agent';
      case 'chat':
        return 'Model';
      case 'execute_tool':
        return 'Tool';
      default:
        return type;
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

  const formatTimeMarker = (ms: number) => {
    return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)}s`;
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Zoom Controls */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
          <span className="text-gray-600 text-sm font-medium">Timeline</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-1 rounded bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.25"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-gray-500 text-xs w-7">{Math.round(zoom * 100)}%</span>
            </div>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="p-1 rounded bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${timelineWidth}%` }}>
            {/* Time Axis */}
            <div className="relative h-8 border-b border-gray-200 bg-gray-50">
              <div className="absolute inset-0 flex">
                {timeMarkers.map((ms) => (
                  <div
                    key={ms}
                    className="absolute top-0 bottom-0 flex flex-col items-center"
                    style={{ left: `${(ms / totalDurationMs) * 100}%` }}
                  >
                    <div className="h-2 w-px bg-gray-300" />
                    <span className="text-xs text-gray-500 mt-1">{formatTimeMarker(ms)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spans */}
            <div className="relative">
              {flatNodes.map((node) => {
                const leftPercent = (node.startOffsetMs / totalDurationMs) * 100;
                const widthPercent = (node.durationMs / totalDurationMs) * 100;
                const colors = getTypeColor(node.type);
                const isSelected = selectedNodeId === node.id;
                const inputTokens = parseInt(node.spanData?.attributes.find(a => a.key === 'gen_ai.usage.input_tokens')?.value || '0');
                const outputTokens = parseInt(node.spanData?.attributes.find(a => a.key === 'gen_ai.usage.output_tokens')?.value || '0');
                const totalTokens = inputTokens + outputTokens;
                const tokens = totalTokens > 0 ? totalTokens.toString() : undefined;

                return (
                  <div
                    key={node.id}
                    className="relative h-9 border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                    style={{ paddingLeft: `${node.level * 24}px` }}
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      {timeMarkers.map((ms) => (
                        <div
                          key={ms}
                          className="absolute top-0 bottom-0 w-px bg-gray-100"
                          style={{ left: `${(ms / totalDurationMs) * 100}%` }}
                        />
                      ))}
                    </div>

                    {/* Bar with Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute top-1.5 h-6 rounded cursor-pointer transition-all shadow-sm ${colors.bg} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:shadow-md'
                            }`}
                          style={{
                            left: `calc(${leftPercent}% + ${node.level * 24}px)`,
                            width: `max(${widthPercent}%, 80px)`,
                          }}
                          onClick={() => onNodeClick(node)}
                        >
                          <div className={`flex items-center gap-1.5 h-full px-2 ${colors.text} text-xs font-medium overflow-hidden`}>
                            <span className="flex-shrink-0 opacity-90">{getTypeIcon(node.type)}</span>
                            <span className="truncate">{node.name}</span>
                            <span className="flex-shrink-0 opacity-80 text-xs ml-auto">{node.duration}</span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                              {getTypeLabel(node.type)}
                            </span>
                            <span className="font-medium text-gray-900">{node.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>Duration: <span className="font-medium text-gray-900">{node.duration}</span></span>
                            {tokens && (
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span className="font-medium text-gray-900">{tokens}</span> tokens
                              </span>
                            )}
                          </div>
                          {node.spanData?.startTime && (
                            <div className="text-xs text-gray-500">
                              Started at offset: {(node.startOffsetMs / 1000).toFixed(2)}s
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
