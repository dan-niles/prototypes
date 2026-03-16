import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Settings,
    ListX,
    Bot,
    Paperclip,
    Hammer,
    LayoutList,
    Send,
    Search,
    Package,
    FilePen,
    CircleCheck,
    ChevronDown,
    ChevronRight,
    ThumbsUp,
    ThumbsDown,
    StopCircle,
    CheckCircle2,
    ArrowRight,
    Map,
    Blocks,
    MessageCircleQuestion,
    Sparkles,
    FileJson,
    BookOpen,
    X,
    RotateCcw,
    Plug,
    MoreHorizontal,
    Globe,
    Key,
    LogOut,
    MessageSquarePlus
} from 'lucide-react';

const slashCommands = [
    { name: '/ask', description: 'Ask a question without editing', icon: MessageCircleQuestion },
    { name: '/doc', description: 'Generate documentation', icon: BookOpen },
    { name: '/openapi', description: 'Import OpenAPI specifications', icon: FileJson },
    { name: '/typecreator', description: 'Create custom types', icon: Blocks },
    { name: '/datamap', description: 'Generate data mappings', icon: Map },
    { name: '/natural-programming', description: 'Experimental NL-to-code', icon: Sparkles },
];

interface CopilotPanelProps {
    chatState: string;
    setChatState: (state: string) => void;
    inputMode: string;
    setInputMode: (mode: string) => void;
    showSlashMenu: boolean;
    setShowSlashMenu: (show: boolean) => void;
    slashMenuIndex: number;
    setSlashMenuIndex: (index: number | ((prev: number) => number)) => void;
    onStartGeneration: () => void;
    onReset: () => void;
    authProvider: string;
    headerMode: 'bi' | 'mi';
    checkpointStyle: 'inline' | 'divider';
}

export default function CopilotPanel({
    chatState,
    setChatState,
    inputMode,
    setInputMode,
    showSlashMenu,
    setShowSlashMenu,
    slashMenuIndex,
    setSlashMenuIndex,
    onStartGeneration,
    onReset,
    authProvider,
    headerMode,
    checkpointStyle,
}: CopilotPanelProps) {
    const [isChangesExpanded, setIsChangesExpanded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [activeCommand, setActiveCommand] = useState<{ name: string; icon: React.ComponentType<any> } | null>(null);
    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
    const [isPlanTasksExpanded, setIsPlanTasksExpanded] = useState(true);
    const [isPlanApprovedExpanded, setIsPlanApprovedExpanded] = useState(false);
    const [webSearchEnabled, setWebSearchEnabled] = useState(false);
    const isExecuting = ['generating', 'thinking', 'plan-generating', 'plan-revising', 'plan-building-1', 'plan-building-2'].includes(chatState);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const slashMenuRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const setSlashMenuRef = useCallback((index: number) => (el: HTMLButtonElement | null) => {
        slashMenuRefs.current[index] = el;
    }, []);

    useEffect(() => {
        if (chatState === 'generating') {
            const timer = setTimeout(() => setChatState('review'), 3500);
            return () => clearTimeout(timer);
        }
        if (chatState === 'thinking') {
            const timer = setTimeout(() => setChatState('thought-complete'), 3000);
            return () => clearTimeout(timer);
        }
        if (chatState === 'plan-generating') {
            const timer = setTimeout(() => setChatState('plan-review'), 2000);
            return () => clearTimeout(timer);
        }
        if (chatState === 'plan-revising') {
            const timer = setTimeout(() => setChatState('plan-revised'), 1500);
            return () => clearTimeout(timer);
        }
        if (chatState === 'plan-building-1') {
            const timer = setTimeout(() => setChatState('plan-building-2'), 2500);
            return () => clearTimeout(timer);
        }
        if (chatState === 'plan-building-2') {
            const timer = setTimeout(() => setChatState('plan-complete'), 2500);
            return () => clearTimeout(timer);
        }
    }, [chatState, setChatState]);

    const handleStartGeneration = () => {
        onStartGeneration();
        setInputValue('');
    };

    const handleReset = () => {
        onReset();
        setIsChangesExpanded(false);
        setInputValue('');
        setActiveCommand(null);
    };

    return (
        <div className="w-[450px] lg:w-[500px] bg-white flex flex-col shadow-sm z-10">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 text-[13px] text-gray-600 shrink-0 bg-white">
                <AuthProviderChip provider={authProvider} />
                <div className="flex items-center gap-4">
                    {headerMode === 'bi' ? (
                        <>
                            {chatState !== 'empty' && (
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                                >
                                    <ListX size={15} strokeWidth={1.5} />
                                    <span>Clear</span>
                                </button>
                            )}
                            <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                                <Settings size={15} strokeWidth={1.5} />
                                <span>Settings</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                            >
                                <MessageSquarePlus size={14} strokeWidth={1.5} />
                                <span>New Chat</span>
                                <ChevronDown size={12} strokeWidth={2} className="text-gray-400" />
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                                <LogOut size={14} strokeWidth={1.5} />
                                <span>Logout</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Dynamic Center Content (Scrollable) */}
            <div className={`flex-1 overflow-y-auto ${chatState === 'empty' ? 'flex flex-col p-8 text-center' : 'p-4'}`}>
                {chatState === 'empty' ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-300">
                        <div className="flex flex-col items-center">
                            <Bot size={52} className="text-gray-800 mb-2" strokeWidth={1.75} />
                            <h1 className="text-xl font-bold text-gray-900 mb-4">WSO2 Integrator Copilot</h1>
                            <p className="text-[13px] text-gray-600 max-w-[340px] leading-relaxed">
                                Build integrations faster with AI.
                                Describe your requirements in plain language and get working implementations instantly.
                            </p>
                        </div>
                        <div className="text-[13px] text-gray-600 space-y-1.5 mt-2">
                            <p>
                                Type <span className="font-semibold text-gray-800">/</span> to use commands
                            </p>
                            <p className="flex items-center justify-center gap-1.5">
                                <Paperclip size={15} className="text-gray-500" strokeWidth={1.5} /> to attach context
                            </p>
                        </div>
                    </div>
                ) : isPlanState(chatState) ? (
                    /* --- PLAN MODE FLOW --- */
                    <div className={`space-y-5 animate-in fade-in duration-300 ${checkpointStyle === 'divider' ? 'group/turn' : ''}`}>
                        <CheckpointIndicator style={checkpointStyle} onRestore={handleReset} />

                        {/* User Message */}
                        <div className="flex justify-end">
                            <div className="bg-[#E2E8F0]/60 text-gray-800 text-[13px] px-4 py-2.5 rounded-xl rounded-tr-sm max-w-[85%]">
                                build a hello world http service
                            </div>
                        </div>

                        {/* AI Plan Response */}
                        <div className="text-[13px] text-gray-800 space-y-4 leading-relaxed">
                            <p>
                                I'll help you create a hello world HTTP service. Let me break this down into a simple plan.
                            </p>

                            <div>
                                <strong className="text-gray-900 text-[14px]">High-Level Design</strong>
                                <p className="mt-1">
                                    I'll create a basic HTTP service with a single resource function that returns
                                    "Hello, World!" when accessed via a GET request.
                                </p>
                            </div>

                            <div>
                                <strong className="text-gray-900 text-[14px]">Implementation Plan</strong>
                                <p className="mt-1">Let me create the tasks for this implementation:</p>
                            </div>

                            {/* Initial Tasks Card — shown in plan-review only (before any revision) */}
                            {chatState === 'plan-review' && (
                                <PlanTasksCard
                                    title="Plan"
                                    expanded={isPlanTasksExpanded}
                                    onToggle={() => setIsPlanTasksExpanded(!isPlanTasksExpanded)}
                                    tasks={[
                                        'Create HTTP service with hello world resource function',
                                        'Implement the hello world resource function logic',
                                    ]}
                                />
                            )}

                            {/* Plan revised collapsed card — shown after revision */}
                            {(chatState === 'plan-revising' || chatState === 'plan-revised') && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden animate-in fade-in duration-300">
                                    <button className="flex items-center gap-2 w-full p-3 text-gray-500">
                                        <ChevronRight size={14} />
                                        <span className="font-medium">Plan revised</span>
                                        <span className="text-gray-300 text-[12px]">— Can you make it say hello universe instead?</span>
                                    </button>
                                </div>
                            )}

                            {/* Revised plan response + new tasks */}
                            {chatState === 'plan-revised' && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <p>I'll update the plan to return "Hello, Universe!" instead:</p>
                                    <PlanTasksCard
                                        title="Plan"
                                        expanded={isPlanTasksExpanded}
                                        onToggle={() => setIsPlanTasksExpanded(!isPlanTasksExpanded)}
                                        tasks={[
                                            'Create HTTP service with hello universe resource function',
                                        ]}
                                    />
                                </div>
                            )}

                            {/* Plan approved card — shown during building/complete */}
                            {(chatState === 'plan-building-1' || chatState === 'plan-building-2' || chatState === 'plan-complete') && (
                                <PlanTasksCard
                                    title="Plan approved"
                                    muted
                                    expanded={isPlanApprovedExpanded}
                                    onToggle={() => setIsPlanApprovedExpanded(!isPlanApprovedExpanded)}
                                    tasks={[
                                        'Create HTTP service with hello world resource function',
                                        'Implement the hello world resource function logic',
                                    ]}
                                />
                            )}

                            {/* After plan approved — execution flow */}
                            {(chatState === 'plan-building-1' || chatState === 'plan-building-2' || chatState === 'plan-complete') && (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    <p>
                                        Perfect! The plan is approved. Let me start implementing the hello world HTTP service.
                                    </p>

                                    {/* Task 1 */}
                                    <PlanTask
                                        index={0}
                                        label="Create HTTP service with hello world resource function"
                                        status={chatState === 'plan-building-1' ? 'active' : 'done'}
                                        expanded={chatState === 'plan-building-1' || expandedTasks.has(0)}
                                        onToggle={() => setExpandedTasks((prev) => {
                                            const next = new Set(prev);
                                            next.has(0) ? next.delete(0) : next.add(0);
                                            return next;
                                        })}
                                        toolCalls={[
                                            { icon: FilePen, text: <>Created <span className="font-medium text-gray-500">service.bal</span></> },
                                            { icon: CircleCheck, text: 'No issues found' },
                                        ]}
                                    />

                                    {/* Task 2 */}
                                    {(chatState === 'plan-building-2' || chatState === 'plan-complete') && (
                                        <PlanTask
                                            index={1}
                                            label="Implement the hello world resource function logic"
                                            status={chatState === 'plan-building-2' ? 'active' : 'done'}
                                            expanded={chatState === 'plan-building-2' || expandedTasks.has(1)}
                                            onToggle={() => setExpandedTasks((prev) => {
                                                const next = new Set(prev);
                                                next.has(1) ? next.delete(1) : next.add(1);
                                                return next;
                                            })}
                                            toolCalls={[
                                                { type: 'thinking' as const, text: chatState === 'plan-building-2' ? 'Thinking' : 'Thought for 3s' },
                                                { icon: FilePen, text: <>Updated <span className="font-medium text-gray-500">service.bal</span></> },
                                                { icon: CircleCheck, text: 'No issues found' },
                                            ]}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Plan complete — summary + changes card */}
                            {chatState === 'plan-complete' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <p>
                                        Perfect! I've successfully created a hello world HTTP service for you. Here's what was changed:
                                    </p>
                                    <div>
                                        <strong className="text-gray-900">Summary:</strong>
                                        <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                                            <li>Created a new HTTP service with a hello world resource function</li>
                                            <li>
                                                Added a <code className="bg-gray-100 px-1 py-0.5 rounded text-[12px]">GET /hello/world</code> endpoint that returns "Hello, World!"
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        The service is now ready to use. When you run it, you can access:
                                        <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                                            <li>
                                                <code className="bg-gray-100 px-1 py-0.5 rounded text-[12px]">GET http://localhost:9090/hello/world</code> - Returns "Hello, World!"
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-3 shadow-sm bg-white">
                                        <div className="font-semibold text-gray-900 mb-2">Changes ready to review</div>
                                        <DiffTree />
                                        <div className="flex justify-end gap-2 mt-4">
                                            <button onClick={handleReset} className="px-4 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors">
                                                Discard
                                            </button>
                                            <button onClick={() => setChatState('accepted')} className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors">
                                                ✓ Keep
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* --- BUILD MODE FLOW --- */
                    <div className={`space-y-5 animate-in fade-in duration-300 ${checkpointStyle === 'divider' ? 'group/turn' : ''}`}>
                        <CheckpointIndicator style={checkpointStyle} onRestore={handleReset} />

                        {/* User Message */}
                        <div className="flex justify-end">
                            <div className="bg-[#E2E8F0]/60 text-gray-800 text-[13px] px-4 py-2.5 rounded-xl rounded-tr-sm max-w-[85%]">
                                build a hello world http service
                            </div>
                        </div>

                        {/* Thinking Block */}
                        {(chatState === 'thinking' || chatState === 'thought-complete') && (
                            <ThinkingBlock status={chatState === 'thinking' ? 'thinking' : 'done'} />
                        )}

                        {/* AI Response Container */}
                        {chatState !== 'thinking' && (
                            <div className="text-[13px] text-gray-800 space-y-4 leading-relaxed">
                                <p>
                                    I'll help you create a simple HTTP "Hello World" service. Let me
                                    modify the existing code to add this service.
                                </p>

                                {/* Tool Calls */}
                                <div className="space-y-1.5 text-gray-400 text-[12.5px]">
                                    <div className="flex items-center gap-2">
                                        <Search size={13} strokeWidth={2} />
                                        <span>HTTP service libraries search completed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package size={13} strokeWidth={2} />
                                        <span>Fetched: [ballerina/http]</span>
                                    </div>
                                </div>

                                {(chatState === 'review' || chatState === 'accepted') && (
                                    <div className="animate-in fade-in duration-300 space-y-4">
                                        <p>Now I'll add a simple "Hello World" HTTP service to the existing code:</p>
                                        <div className="space-y-1.5 text-gray-400 text-[12.5px]">
                                            <div className="flex items-center gap-2">
                                                <FilePen size={13} strokeWidth={2} />
                                                <span>Updated <span className="font-medium text-gray-500">main.bal</span></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CircleCheck size={13} strokeWidth={2} />
                                                <span>No issues found</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Post-Generation Explanation */}
                                {(chatState === 'review' || chatState === 'accepted') && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <p>
                                            Perfect! I've successfully added a simple "Hello World" HTTP
                                            service to your code. Here's what was changed:
                                        </p>
                                        <div>
                                            <strong className="text-gray-900">Summary:</strong>
                                            <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                                                <li>Created a new HTTP listener on port 8080</li>
                                                <li>
                                                    Added a new <code className="bg-gray-100 px-1 py-0.5 rounded text-[12px]">/hello</code> service with a <code className="bg-gray-100 px-1 py-0.5 rounded text-[12px]">GET /world</code> endpoint that returns "Hello, World!"
                                                </li>
                                                <li>Updated the existing MathTutor service to use the same HTTP listener</li>
                                            </ul>
                                        </div>
                                        <div>
                                            The service is now ready to use. When you run it, you can access:
                                            <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                                                <li>
                                                    <code className="bg-gray-100 px-1 py-0.5 rounded text-[12px]">GET http://localhost:8080/hello/world</code> - Returns "Hello, World!"
                                                </li>
                                                <li>
                                                    <code className="bg-gray-100 px-1 py-0.5 rounded text-[12px]">POST http://localhost:8080/MathTutor/chat</code> - Your existing math tutor endpoint
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Changes Card */}
                                {chatState === 'review' && (
                                    <div className="border border-gray-200 rounded-lg p-3 shadow-sm bg-white animate-in fade-in duration-300">
                                        <div className="font-semibold text-gray-900 mb-2">Changes ready to review</div>
                                        <DiffTree />
                                        <div className="flex justify-end gap-2 mt-4">
                                            <button onClick={handleReset} className="px-4 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors">
                                                Discard
                                            </button>
                                            <button onClick={() => setChatState('accepted')} className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors">
                                                ✓ Keep
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Accepted State */}
                                {chatState === 'accepted' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => setIsChangesExpanded(!isChangesExpanded)}
                                                className="flex items-center gap-2 w-full p-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                {isChangesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                <span className="font-medium">Changes accepted</span>
                                            </button>
                                            <Collapse open={isChangesExpanded}>
                                                <div className="p-3 pt-0 border-t border-gray-100 bg-gray-50/50">
                                                    <div className="mt-2">
                                                        <DiffTree />
                                                    </div>
                                                </div>
                                            </Collapse>
                                        </div>

                                        {/* Feedback Widget */}
                                        <div className="flex justify-center pb-4">
                                            <div className="flex items-center gap-4 border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm">
                                                <span className="text-gray-600 font-medium">Was this response helpful?</span>
                                                <div className="flex items-center gap-1">
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors">
                                                        <ThumbsUp size={16} />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors">
                                                        <ThumbsDown size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Input Area */}
            <div className="p-4 px-5 pb-6 shrink-0 bg-white border-t border-gray-50">

                {/* Plan Review Actions */}
                {(chatState === 'plan-review' || chatState === 'plan-revised') && (
                    <div className="space-y-2.5 mb-0">
                        <p className="text-[13px] text-gray-700 font-medium">Does this plan look right?</p>
                        <button
                            onClick={() => setChatState('plan-building-1')}
                            className="w-full py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-[13px]"
                        >
                            Start building
                        </button>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                            <input
                                type="text"
                                placeholder="What should be different?"
                                className="flex-1 px-3 py-2.5 text-[13px] text-gray-900 outline-none placeholder:text-gray-400"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setChatState('plan-revising');
                                    }
                                }}
                            />
                            <button
                                onClick={() => setChatState('plan-revising')}
                                className="px-3 py-2.5 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                                <Send size={16} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Suggested Prompts */}
                {chatState === 'empty' && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        <button
                            onClick={handleStartGeneration}
                            className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
                        >
                            <ArrowRight size={13} strokeWidth={2} className="text-gray-400" />
                            build a hello world http service
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all">
                            <ArrowRight size={13} strokeWidth={2} className="text-gray-400" />
                            /ask how to build a concurrent application?
                        </button>
                    </div>
                )}

                {/* Generating Indicator */}
                {(chatState === 'generating' || chatState === 'plan-generating' || chatState === 'plan-revising' || chatState === 'plan-building-1' || chatState === 'plan-building-2') && (
                    <div
                        className="flex items-center gap-1 mb-3 ml-2 text-gray-500 text-[13px] cursor-pointer"
                        onClick={() => {
                            if (chatState === 'generating') setChatState('review');
                            else if (chatState === 'plan-generating') setChatState('plan-review');
                            else if (chatState === 'plan-revising') setChatState('plan-revised');
                            else if (chatState === 'plan-building-1') setChatState('plan-building-2');
                            else if (chatState === 'plan-building-2') setChatState('plan-complete');
                        }}
                    >
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="ml-1">Generating..</span>
                    </div>
                )}

                {/* Chat Input Container — hidden during plan-review/revised which have their own bottom */}
                {chatState !== 'plan-review' && chatState !== 'plan-revised' && <div className="relative border border-gray-300 rounded-xl shadow-sm flex flex-col bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                    {/* Slash Command Menu */}
                    {showSlashMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowSlashMenu(false)} />
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150 z-20">
                                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Commands</span>
                                    <button onClick={() => setShowSlashMenu(false)} className="p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
                                        <X size={13} strokeWidth={2} />
                                    </button>
                                </div>
                                <div className="p-1.5 max-h-[240px] overflow-y-auto">
                                    {slashCommands.map((cmd, index) => {
                                        const isActive = index === slashMenuIndex;
                                        return (
                                            <button
                                                key={cmd.name}
                                                ref={setSlashMenuRef(index)}
                                                onMouseEnter={() => setSlashMenuIndex(index)}
                                                onClick={() => {
                                                    setActiveCommand({ name: cmd.name, icon: cmd.icon });
                                                    setInputValue('');
                                                    setShowSlashMenu(false);
                                                    textareaRef.current?.focus();
                                                }}
                                                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-left ${isActive ? 'bg-blue-50' : ''}`}
                                            >
                                                <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                    <cmd.icon size={14} strokeWidth={2} className={`transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-[13px] font-medium transition-colors ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>{cmd.name}</span>
                                                    <span className="text-[11px] text-gray-400">{cmd.description}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex flex-wrap items-start gap-1.5 px-3 pt-3 min-h-[60px]">
                        {activeCommand && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[12.5px] font-medium rounded-lg shrink-0">
                                <activeCommand.icon size={12} strokeWidth={2} />
                                {activeCommand.name}
                                <button
                                    onClick={() => { setActiveCommand(null); textareaRef.current?.focus(); }}
                                    className="ml-0.5 text-blue-400 hover:text-blue-600 transition-colors"
                                >
                                    <X size={11} strokeWidth={2.5} />
                                </button>
                            </span>
                        )}
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => {
                                const val = e.target.value;
                                setInputValue(val);
                                if (val === '/') {
                                    setShowSlashMenu(true);
                                    setSlashMenuIndex(0);
                                } else {
                                    setShowSlashMenu(false);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (showSlashMenu) {
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setSlashMenuIndex((prev: number) => {
                                            const next = (prev + 1) % slashCommands.length;
                                            slashMenuRefs.current[next]?.scrollIntoView({ block: 'nearest' });
                                            return next;
                                        });
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setSlashMenuIndex((prev: number) => {
                                            const next = (prev - 1 + slashCommands.length) % slashCommands.length;
                                            slashMenuRefs.current[next]?.scrollIntoView({ block: 'nearest' });
                                            return next;
                                        });
                                    } else if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const cmd = slashCommands[slashMenuIndex];
                                        setActiveCommand({ name: cmd.name, icon: cmd.icon });
                                        setInputValue('');
                                        setShowSlashMenu(false);
                                        return;
                                    } else if (e.key === 'Escape') {
                                        setShowSlashMenu(false);
                                        return;
                                    }
                                }
                                if (e.key === 'Backspace' && inputValue === '' && activeCommand) {
                                    setActiveCommand(null);
                                }
                                if (e.key === 'Escape') {
                                    setShowSlashMenu(false);
                                }
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    setShowSlashMenu(false);
                                    if (inputValue.trim() || activeCommand || chatState === 'empty') {
                                        handleStartGeneration();
                                    }
                                }
                            }}
                            className="flex-1 min-w-[120px] py-1 max-h-[120px] text-[14px] text-gray-900 outline-none resize-none bg-transparent placeholder:text-gray-400"
                            placeholder={activeCommand ? `Describe your ${activeCommand.name.slice(1)} request...` : inputMode === 'build' ? "Describe what to build..." : "Describe what to plan..."}
                            rows={2}
                        />
                    </div>

                    {/* Bottom Toolbar */}
                    <div className="flex justify-between items-center px-2 pb-2 mt-1">
                        <div className="flex items-center gap-1">
                            <div className={`flex bg-gray-100 rounded-[6px] p-0.5 border border-gray-200/50 ${isExecuting ? 'opacity-50 pointer-events-none' : ''}`}>
                                <button
                                    onClick={() => setInputMode('build')}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[12px] font-medium transition-all ${inputMode === 'build' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    <Hammer size={12} />
                                    Build
                                </button>
                                <button
                                    onClick={() => setInputMode('plan')}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[12px] font-medium transition-all ${inputMode === 'plan' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    <LayoutList size={12} />
                                    Plan
                                </button>
                            </div>

                            <button
                                title="Web search"
                                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                                className={`w-[28px] h-[28px] flex items-center justify-center rounded-md transition-colors ${webSearchEnabled ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                                <Globe size={15} strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                title="Use slash commands"
                                onClick={() => { setShowSlashMenu(!showSlashMenu); setSlashMenuIndex(0); }}
                                className={`w-[28px] h-[28px] flex items-center justify-center hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${showSlashMenu ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
                            >
                                <span className="text-[15px] font-medium leading-none">/</span>
                            </button>
                            <button title="Attach context or files" className="w-[28px] h-[28px] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                                <Paperclip size={16} strokeWidth={1.5} />
                            </button>

                            <div className="w-px h-4 bg-gray-200 mx-1"></div>

                            {(chatState === 'generating' || chatState === 'plan-generating' || chatState === 'plan-building-1' || chatState === 'plan-building-2') ? (
                                <button onClick={() => {
                                    if (chatState === 'generating') setChatState('review');
                                    else if (chatState === 'plan-generating') setChatState('plan-review');
                                    else setChatState('plan-complete');
                                }} className="w-[28px] h-[28px] flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                                    <StopCircle size={18} strokeWidth={1.5} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleStartGeneration}
                                    disabled={!inputValue.trim() && chatState !== 'empty'}
                                    className={`w-[28px] h-[28px] flex items-center justify-center rounded-md transition-colors ${inputValue.trim() || chatState === 'empty'
                                        ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                        : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <Send size={16} strokeWidth={1.5} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>}

                {chatState !== 'empty' && chatState !== 'plan-review' && chatState !== 'plan-revised' && (
                    <p className="text-[10.5px] text-gray-400 text-center mt-2">
                        AI-generated output may contain mistakes. Review before adding to your integration.
                    </p>
                )}
            </div>
        </div>
    );
}

function isPlanState(state: string) {
    return state.startsWith('plan-');
}

/** Smooth height animation wrapper using CSS grid trick */
function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
    return (
        <div
            className="grid transition-[grid-template-rows] duration-200 ease-out"
            style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        >
            <div className="overflow-hidden">{children}</div>
        </div>
    );
}

/** Reusable expandable tasks card for plan review/approved states */
function PlanTasksCard({ title, tasks, expanded, onToggle, muted = false }: {
    title: string;
    tasks: string[];
    expanded: boolean;
    onToggle: () => void;
    muted?: boolean;
}) {
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden animate-in fade-in duration-300">
            <button
                onClick={onToggle}
                className={`flex items-center gap-2 w-full p-3 hover:bg-gray-50 transition-colors ${muted ? 'text-gray-500' : 'text-gray-700'}`}
            >
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="font-medium">{title}</span>
                <span className={`text-[12px] ${muted ? 'text-gray-300' : 'text-gray-400'}`}>· {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}</span>
            </button>
            <Collapse open={expanded}>
                <div className={`px-3 pb-3 ${muted ? 'border-t border-gray-100' : ''}`}>
                    <ul className={`space-y-2 pl-2 ${muted ? 'mt-2' : ''}`}>
                        {tasks.map((task, i) => (
                            <li key={i} className={`flex items-center gap-2.5 ${muted ? 'text-gray-500' : ''}`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${muted ? 'bg-gray-300' : 'bg-blue-500'}`}></span>
                                <span>{task}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </Collapse>
        </div>
    );
}

/** Task item in plan execution with expandable tool calls */
type ToolCallItem =
    | { icon: React.ComponentType<any>; text: React.ReactNode; type?: never }
    | { type: 'thinking'; text: string; icon?: never };

function PlanTask({ label, status, expanded, onToggle, toolCalls }: {
    index: number;
    label: string;
    status: 'active' | 'done';
    expanded: boolean;
    onToggle: () => void;
    toolCalls: ToolCallItem[];
}) {
    return (
        <div className="flex items-start gap-2.5">
            <div className="shrink-0 flex items-center justify-center h-[20px] w-3">
                {status === 'active' ? (
                    <div className="w-3 h-3 rounded-full border-2 border-blue-400 flex items-center justify-center animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    </div>
                ) : (
                    <span className="w-2 h-2 rounded-full bg-green-500 block animate-in fade-in zoom-in duration-300"></span>
                )}
            </div>
            <div className="flex-1">
                <div
                    className={`flex items-center gap-2 ${status === 'done' ? 'cursor-pointer' : ''}`}
                    onClick={status === 'done' ? onToggle : undefined}
                >
                    <span className={status === 'active' ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                        {label}
                    </span>
                    {status === 'done' && (
                        <span className="text-gray-300">
                            <MoreHorizontal size={14} />
                        </span>
                    )}
                </div>
                <Collapse open={expanded}>
                    <div className="mt-2 ml-1 border-l-2 border-gray-200 pl-3 space-y-1.5 text-gray-400 text-[12.5px]">
                        {toolCalls.map((call, i) => {
                            if (call.type === 'thinking') {
                                return <TaskThinkingItem key={i} text={call.text} />;
                            }
                            const Icon = call.icon;
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <Icon size={13} strokeWidth={2} />
                                    <span>{call.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </Collapse>
            </div>
        </div>
    );
}

/** Reusable diff tree shown in review and accepted states */
function DiffTree() {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-600">
                <ChevronDown size={14} />
                <Plug size={14} />
                <span>service</span>
                <span className="font-semibold text-gray-800">/hello</span>
                <span className="text-gray-400 text-[11px]">1</span>
            </div>
            <div className="flex items-center justify-between bg-[#F0FDF4] border border-green-100 rounded p-1.5 pl-6">
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">resource</span>
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">GET</span>
                    <span className="text-gray-900 font-medium">world</span>
                </div>
                <span className="bg-[#DCFCE7] text-green-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
                    + Added
                </span>
            </div>
        </div>
    );
}

function AuthProviderChip({ provider }: { provider: string }) {
    if (provider === 'wso2-cloud') {
        return (
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
                <span>Remaining Usage:</span>
                <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-600">
                    Unlimited
                </span>
            </div>
        );
    }

    const providers: Record<string, string> = {
        'anthropic': 'Anthropic API',
        'aws-bedrock': 'AWS Bedrock',
        'vertex-ai': 'Vertex AI',
    };

    return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-500">
            <Key size={13} strokeWidth={1.5} />
            <span className="font-medium">{providers[provider] ?? provider}</span>
        </div>
    );
}

/** Thinking state block — shows pulsing indicator while thinking, collapsible summary when done */
function ThinkingBlock({ status }: { status: 'thinking' | 'done' }) {
    const [expanded, setExpanded] = useState(false);

    if (status === 'thinking') {
        return (
            <div className="flex items-center gap-2 text-[12.5px] text-gray-400 animate-in fade-in duration-300">
                <ChevronRight size={13} strokeWidth={2} />
                <span>
                    Thinking
                    <span className="inline-flex w-4">
                        <span className="animate-[fade-dot_1.4s_ease-in-out_infinite]">.</span>
                        <span className="animate-[fade-dot_1.4s_ease-in-out_0.2s_infinite]">.</span>
                        <span className="animate-[fade-dot_1.4s_ease-in-out_0.4s_infinite]">.</span>
                    </span>
                </span>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-[12.5px] text-gray-400 hover:text-gray-600 transition-colors"
            >
                {expanded ? <ChevronDown size={13} strokeWidth={2} /> : <ChevronRight size={13} strokeWidth={2} />}
                <span>Thought for 3s</span>
            </button>
            <Collapse open={expanded}>
                <div className="ml-6 mt-2 pl-3 border-l-2 border-gray-200 text-[12.5px] text-gray-400 space-y-2 leading-relaxed">
                    <p>The user wants a hello world HTTP service. I need to check if there are existing service files and what HTTP libraries are available.</p>
                    <p>I'll search for HTTP service libraries first, then create a simple service with a GET endpoint that returns "Hello, World!".</p>
                    <p>I should use the existing HTTP listener if one is already configured, otherwise create a new one on port 8080.</p>
                </div>
            </Collapse>
        </div>
    );
}

/** Thinking item inside a task's tool call list — expandable in-place without extra nesting */
function TaskThinkingItem({ text }: { text: string }) {
    const [expanded, setExpanded] = useState(false);
    const isActive = text === 'Thinking';

    if (isActive) {
        return (
            <div className="flex items-center gap-2">
                <ChevronRight size={13} strokeWidth={2} />
                <span>
                    Thinking
                    <span className="inline-flex w-4">
                        <span className="animate-[fade-dot_1.4s_ease-in-out_infinite]">.</span>
                        <span className="animate-[fade-dot_1.4s_ease-in-out_0.2s_infinite]">.</span>
                        <span className="animate-[fade-dot_1.4s_ease-in-out_0.4s_infinite]">.</span>
                    </span>
                </span>
            </div>
        );
    }

    return (
        <div>
            <div
                className="flex items-center gap-2 cursor-pointer hover:text-gray-500 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? <ChevronDown size={13} strokeWidth={2} /> : <ChevronRight size={13} strokeWidth={2} />}
                <span>{text}</span>
            </div>
            <Collapse open={expanded}>
                <p className="mt-1.5 text-[12px] text-gray-300 italic leading-relaxed">
                    I need to implement the resource function logic. The function should return "Hello, World!" as a string response for GET requests to the /world path.
                </p>
            </Collapse>
        </div>
    );
}

/** Checkpoint indicator — two styles: inline (current) and divider (GitHub-inspired) */
function CheckpointIndicator({ style, onRestore }: { style: 'inline' | 'divider'; onRestore: () => void }) {
    if (style === 'divider') {
        return (
            <div className="flex items-center justify-center relative mt-1 mb-3 opacity-0 group-hover/turn:opacity-100 transition-opacity duration-200">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <button
                    onClick={onRestore}
                    className="relative flex items-center gap-1.5 px-3 py-1 bg-white text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <span>Restore Checkpoint</span>
                    <RotateCcw size={11} strokeWidth={2.5} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-[12px] text-gray-400 px-1">
            <CheckCircle2 size={13} strokeWidth={2} className="text-green-500" />
            <span>Checkpoint saved</span>
            <button
                onClick={onRestore}
                className="cursor-pointer group/restore flex items-center gap-1 px-1.5 py-0.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
                <RotateCcw size={11} strokeWidth={2.5} />
                <span className="max-w-0 overflow-hidden group-hover/restore:max-w-[60px] transition-all duration-200 whitespace-nowrap">Restore</span>
            </button>
        </div>
    );
}
