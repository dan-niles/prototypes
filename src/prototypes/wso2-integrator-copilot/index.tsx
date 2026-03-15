import { useState, useEffect } from 'react';
import {
    Settings,
    ListX,
    Bot,
    FilePlus,
    Pencil,
    LayoutList,
    Send,
    Wrench,
    ChevronDown,
    ChevronRight,
    ThumbsUp,
    ThumbsDown,
    StopCircle,
    Activity,
    TerminalSquare
} from 'lucide-react';

export default function WSO2CopilotPrototype() {
    // States: 'empty' -> 'generating' -> 'review' -> 'accepted'
    const [chatState, setChatState] = useState('empty');
    const [isChangesExpanded, setIsChangesExpanded] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // NEW: State for Build vs Plan toggle
    const [inputMode, setInputMode] = useState('build');

    // Auto-transition from generating to review for demo purposes
    useEffect(() => {
        if (chatState === 'generating') {
            const timer = setTimeout(() => setChatState('review'), 3500);
            return () => clearTimeout(timer);
        }
    }, [chatState]);

    const handleStartGeneration = () => {
        setChatState('generating');
        setInputValue(''); // Clear input if user typed anything
    };

    const handleReset = () => {
        setChatState('empty');
        setIsChangesExpanded(false);
        setInputValue('');
        setInputMode('build'); // Reset mode too
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 font-sans">
            {/* Left Side - Blank IDE Area */}
            <div className="flex-1 bg-white relative border-r border-gray-200">
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
            </div>

            {/* Right Side - WSO2 Integrator Copilot Panel */}
            <div className="w-[450px] lg:w-[500px] bg-white flex flex-col shadow-sm z-10">

                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 text-[13px] text-gray-600 shrink-0 bg-white">
                    <div>Remaining Usage: Unlimited</div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                        >
                            <ListX size={15} strokeWidth={1.5} />
                            <span>Clear</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                            <Settings size={15} strokeWidth={1.5} />
                            <span>Settings</span>
                        </button>
                    </div>
                </div>

                {/* Dynamic Center Content (Scrollable) */}
                <div className={`flex-1 overflow-y-auto ${chatState === 'empty' ? 'flex flex-col p-8 text-center' : 'p-4'}`}>

                    {chatState === 'empty' ? (
                        /* --- EMPTY STATE --- */
                        <div className="flex-1 flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-300">
                            <div className="flex flex-col items-center">
                                <Bot size={52} className="text-gray-800 mb-4" strokeWidth={1.75} />
                                <h1 className="text-xl font-bold text-gray-900 mb-2">WSO2 Integrator Copilot</h1>
                                <p className="text-[13px] text-gray-600 max-w-[340px] leading-relaxed">
                                    WSO2 Integrator Copilot is powered by AI. It can make mistakes.
                                    Review generated code before adding it to your integration.
                                </p>
                            </div>

                            <div className="text-[13px] text-gray-600 space-y-1.5 mt-2">
                                <p>
                                    Type <span className="font-semibold text-gray-800">/</span> to use commands
                                </p>
                                <p className="flex items-center justify-center gap-1.5">
                                    <FilePlus size={15} className="text-gray-500" strokeWidth={1.5} /> to attach context
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* --- CHAT FLOW STATE --- */
                        <div className="space-y-5 animate-in fade-in duration-300">
                            {/* Checkpoint Divider */}
                            <div className="flex items-center justify-center relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-dashed border-gray-300"></div>
                                </div>
                                <div className="relative bg-[#E2E8F0] text-gray-500 text-[12px] px-3 py-1 rounded-md">
                                    Creating a checkpoint ...
                                </div>
                            </div>

                            {/* User Message */}
                            <div className="flex justify-end">
                                <div className="bg-[#E2E8F0]/60 text-gray-800 text-[13px] px-4 py-2.5 rounded-xl rounded-tr-sm max-w-[85%]">
                                    write a hello world http service
                                </div>
                            </div>

                            {/* AI Response Container */}
                            <div className="text-[13px] text-gray-800 space-y-4 leading-relaxed">
                                <p>
                                    I'll help you create a simple HTTP "Hello World" service. Let me
                                    modify the existing code to add this service.
                                </p>

                                {/* Tool Calls */}
                                <div className="space-y-1.5 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Wrench size={14} strokeWidth={2} />
                                        <span>HTTP service libraries search completed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Wrench size={14} strokeWidth={2} />
                                        <span>Fetched: [ballerina/http]</span>
                                    </div>

                                    {(chatState === 'review' || chatState === 'accepted') && (
                                        <div className="animate-in fade-in duration-300">
                                            <div className="mt-3 text-gray-800">
                                                Now I'll add a simple "Hello World" HTTP service to the existing code:
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Wrench size={14} strokeWidth={2} />
                                                <span>Updated <span className="font-semibold text-gray-800">main.bal</span></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Wrench size={14} strokeWidth={2} />
                                                <span>No issues found</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

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
                                        <div className="font-semibold text-gray-900 mb-2">
                                            Changes ready to review
                                        </div>
                                        {/* Diff Tree */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <ChevronDown size={14} />
                                                <Activity size={14} />
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
                                        {/* Actions */}
                                        <div className="flex justify-end gap-2 mt-4">
                                            <button
                                                onClick={handleReset}
                                                className="px-4 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                                            >
                                                Discard
                                            </button>
                                            <button
                                                onClick={() => setChatState('accepted')}
                                                className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
                                            >
                                                ✓ Keep
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Accepted State Collapsible */}
                                {chatState === 'accepted' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => setIsChangesExpanded(!isChangesExpanded)}
                                                className="flex items-center gap-2 w-full p-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                {isChangesExpanded ? (
                                                    <ChevronDown size={14} />
                                                ) : (
                                                    <ChevronRight size={14} />
                                                )}
                                                <span className="font-medium">Changes accepted</span>
                                            </button>

                                            {/* Expanded Diff View */}
                                            {isChangesExpanded && (
                                                <div className="p-3 pt-0 border-t border-gray-100 bg-gray-50/50">
                                                    <div className="space-y-1 mt-2">
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <ChevronDown size={14} />
                                                            <Activity size={14} />
                                                            <span>service</span>
                                                            <span className="font-semibold text-gray-800">
                                                                /hello
                                                            </span>
                                                            <span className="text-gray-400 text-[11px]">1</span>
                                                        </div>
                                                        <div className="flex items-center justify-between bg-[#F0FDF4] border border-green-100 rounded p-1.5 pl-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-600">resource</span>
                                                                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                                    GET
                                                                </span>
                                                                <span className="text-gray-900 font-medium">world</span>
                                                            </div>
                                                            <span className="bg-[#DCFCE7] text-green-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
                                                                + Added
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Feedback Widget */}
                                        <div className="flex justify-center pb-4">
                                            <div className="flex items-center gap-4 border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm">
                                                <span className="text-gray-600 font-medium">
                                                    Was this response helpful?
                                                </span>
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
                        </div>
                    )}
                </div>

                {/* Bottom Input Area */}
                <div className="p-4 px-5 pb-6 shrink-0 bg-white border-t border-gray-50">

                    {/* Suggested Prompts (Only show in Empty State) */}
                    {chatState === 'empty' && (
                        <div className="flex flex-col gap-1 mb-3 text-[13px] text-blue-600 font-medium">
                            <button
                                onClick={handleStartGeneration}
                                className="text-left w-max hover:underline decoration-blue-400 underline-offset-2 transition-all"
                            >
                                write a hello world http service
                            </button>
                            <button className="text-left w-max hover:underline decoration-blue-400 underline-offset-2 transition-all">
                                /ask how to write a concurrent application?
                            </button>
                        </div>
                    )}

                    {/* Generating Indicator */}
                    {chatState === 'generating' && (
                        <div
                            className="flex items-center gap-1 mb-3 ml-2 text-gray-500 text-[13px] cursor-pointer"
                            onClick={() => setChatState('review')}
                        >
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span className="ml-1">Generating..</span>
                        </div>
                    )}

                    {/* NEW: Enhanced Chat Input Container */}
                    <div className="border border-gray-300 rounded-xl shadow-sm flex flex-col bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (inputValue.trim() || chatState === 'empty') {
                                        handleStartGeneration();
                                    }
                                }
                            }}
                            className="w-full px-3 py-3 min-h-[60px] max-h-[150px] text-[14px] text-gray-900 outline-none resize-y bg-transparent rounded-t-xl placeholder:text-gray-400"
                            placeholder="Describe your integration..."
                            rows={2}
                        />

                        {/* Bottom Toolbar inside input */}
                        <div className="flex justify-between items-center px-2 pb-2 mt-1">

                            {/* LEFT: AI Mode Selector (Build vs Plan) */}
                            <div className="flex bg-gray-100 rounded-[6px] p-0.5 border border-gray-200/50">
                                <button
                                    onClick={() => setInputMode('build')}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[12px] font-medium transition-all ${inputMode === 'build' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Pencil size={12} fill={inputMode === 'build' ? 'currentColor' : 'none'} />
                                    Build
                                </button>
                                <button
                                    onClick={() => setInputMode('plan')}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[12px] font-medium transition-all ${inputMode === 'plan' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <LayoutList size={12} />
                                    Plan
                                </button>
                            </div>

                            {/* RIGHT: Input Tools & Send */}
                            <div className="flex items-center gap-1">
                                <button
                                    title="Use slash commands"
                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <TerminalSquare size={16} strokeWidth={1.5} />
                                </button>
                                <button
                                    title="Attach context or files"
                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <FilePlus size={16} strokeWidth={1.5} />
                                </button>

                                <div className="w-px h-4 bg-gray-200 mx-1"></div>

                                {/* Action Button (Stop or Send) */}
                                {chatState === 'generating' ? (
                                    <button
                                        onClick={() => setChatState('review')}
                                        className="p-1.5 text-gray-600 hover:text-gray-900 rounded-md transition-colors flex items-center justify-center"
                                    >
                                        <StopCircle size={18} strokeWidth={1.5} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStartGeneration}
                                        disabled={!inputValue.trim() && chatState !== 'empty'}
                                        className={`p-1.5 rounded-md transition-all flex items-center justify-center ${inputValue.trim() || chatState === 'empty'
                                            ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm'
                                            : 'text-gray-300 bg-transparent cursor-not-allowed'
                                            }`}
                                    >
                                        <Send
                                            size={16}
                                            strokeWidth={2}
                                            className={inputValue.trim() || chatState === 'empty' ? "translate-x-0.5" : ""}
                                        />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
