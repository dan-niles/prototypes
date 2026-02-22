import { Clock, Bot, MessageSquare, ChevronRight, AlertCircle } from 'lucide-react';
import type { TraceNode } from './TraceTree';

interface TraceListViewProps {
    traces: TraceNode[];
    onTraceSelect: (trace: TraceNode) => void;
}

export function TraceListView({ traces, onTraceSelect }: TraceListViewProps) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'invoke_agent':
                return <Bot className="w-5 h-5 text-blue-500" />;
            case 'chat':
                return <MessageSquare className="w-5 h-5 text-amber-500" />;
            default:
                return <Bot className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getInput = (trace: TraceNode) => {
        const inputAttr = trace.spanData?.attributes.find(
            a => a.key === 'gen_ai.input.messages'
        );
        return inputAttr?.value || 'No input';
    };

    const hasError = (trace: TraceNode) => {
        return trace.spanData?.attributes.some(a => a.key === 'error.message');
    };

    return (
        <div className="space-y-3">
            {traces.map((trace) => (
                <button
                    key={trace.id}
                    onClick={() => onTraceSelect(trace)}
                    className={`w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-all group ${hasError(trace)
                        ? 'border-red-300'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            {getTypeIcon(trace.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900">{trace.name}</h3>
                                    {hasError(trace) && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-medium">
                                            <AlertCircle className="w-3 h-3" />
                                            Error
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {getInput(trace)}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{trace.duration}</span>
                                </div>
                                {trace.spanData && (
                                    <span>{formatTime(trace.spanData.startTime)}</span>
                                )}
                                {trace.children && trace.children.length > 0 && (
                                    <span>{trace.children.length} steps</span>
                                )}
                            </div>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
