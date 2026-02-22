import { Bot, User, Send } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    hasLogs?: boolean;
    traceId?: string;
    isError?: boolean;
}

interface ChatWindowProps {
    onShowLogs?: (traceId: string) => void;
    onShowOverview?: () => void;
}

const mockMessages: Message[] = [
    {
        id: '1',
        role: 'user',
        content: 'How much is 1+8*9?',
    },
    {
        id: '2',
        role: 'assistant',
        content: 'To solve the expression \( 1 + 8 \times 9 \), we follow the order of operations (PEMDAS/BODMAS): 1. First, we multiply \( 8 \times 9 = 72 \). 2. Then, we add \( 1 + 72 = 73 \). So, the final answer is **73**.',
        hasLogs: true,
        traceId: '1',
    },
    {
        id: '3',
        role: 'user',
        content: 'What is 15 - 3 * 2?',
    },
    {
        id: '4',
        role: 'assistant',
        content: 'To solve \( 15 - 3 \times 2 \), we follow the order of operations: 1. First, multiply \( 3 \times 2 = 6 \). 2. Then, subtract \( 15 - 6 = 9 \). The final answer is **9**.',
        hasLogs: true,
        traceId: '6',
    },
    {
        id: '5',
        role: 'user',
        content: 'What is the square root of 144?',
    },
    {
        id: '6',
        role: 'assistant',
        content: 'Internal Server Error: Something went wrong on the server.',
        hasLogs: true,
        traceId: '7',
        isError: true,
    },
];

export function ChatWindow({ onShowLogs, onShowOverview }: ChatWindowProps) {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header with Executions button */}
            <div className="border-b border-gray-200 bg-white px-6 py-3">
                <div className="max-w-[600px] mx-auto w-full flex justify-end">
                    <button
                        onClick={onShowOverview}
                        className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        View All Logs
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 max-w-[600px] mx-auto w-full">
                <div className="space-y-6">
                    {mockMessages.map((message) => (
                        <div key={message.id}>
                            {message.role === 'user' ? (
                                <div className="flex items-start gap-3 justify-end">
                                    <div className="bg-blue-200 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-md">
                                        <p className="text-sm text-gray-900">{message.content}</p>
                                    </div>
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
                                        <User className="w-4 h-4 text-gray-700" />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-white border border-gray-200">
                                            <Bot className="w-5 h-5 text-gray-700" />
                                        </div>
                                        <div className={`bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-md border ${message.isError ? 'border-red-200' : 'border-gray-200'}`}>
                                            <p className={`text-sm whitespace-pre-line ${message.isError ? 'text-red-800' : 'text-gray-900'}`}>
                                                {message.content}
                                            </p>
                                        </div>
                                    </div>
                                    {message.hasLogs && (
                                        <div className="ml-11 mt-2">
                                            <button
                                                onClick={() => onShowLogs?.(message.traceId!)}
                                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Show logs
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-200 bg-white p-4">
                <div className="max-w-[600px] mx-auto w-full">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            disabled
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        />
                        <button
                            disabled
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
