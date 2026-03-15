import { useState, useEffect, useRef, useCallback, Children, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import notesContent from './notes.md?raw';
const noteImages = import.meta.glob('./img/*.*', { eager: true, import: 'default' }) as Record<string, string>;
import {
    Settings,
    ListX,
    Bot,
    FilePlus,
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
    Activity,
    CheckCircle2,
    ArrowRight,
    Map,
    Blocks,
    MessageCircleQuestion,
    Sparkles,
    FileJson,
    BookOpen,
    X,
    RotateCcw
} from 'lucide-react';

export default function WSO2CopilotPrototype() {
    // States: 'empty' -> 'generating' -> 'review' -> 'accepted'
    const [chatState, setChatState] = useState('empty');
    const [isChangesExpanded, setIsChangesExpanded] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const [inputMode, setInputMode] = useState('build');
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuIndex, setSlashMenuIndex] = useState(0);
    const [activeCommand, setActiveCommand] = useState<{ name: string; icon: React.ComponentType<any> } | null>(null);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const slashMenuRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const setSlashMenuRef = useCallback((index: number) => (el: HTMLButtonElement | null) => {
        slashMenuRefs.current[index] = el;
    }, []);

    const slashCommands = [
        { name: '/ask', description: 'Ask a question without editing', icon: MessageCircleQuestion },
        { name: '/doc', description: 'Generate documentation', icon: BookOpen },
        { name: '/openapi', description: 'Import OpenAPI specifications', icon: FileJson },
        { name: '/typecreator', description: 'Create custom types', icon: Blocks },
        { name: '/datamap', description: 'Generate data mappings', icon: Map },
        { name: '/natural-programming', description: 'Experimental NL-to-code', icon: Sparkles },
    ];

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
        setInputMode('build');
        setActiveCommand(null);
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 font-sans">
            {/* Left Side - Notes Panel */}
            <div
                className="flex-1 bg-white relative border-r border-gray-200 overflow-y-auto"
                onClick={(e) => {
                    const target = (e.target as HTMLElement).closest('a[href^="#action-"]');
                    if (!target) return;
                    e.preventDefault();
                    const href = target.getAttribute('href') || '';
                    const action = href.replace('#action-', '');
                    switch (action) {
                        case 'empty': handleReset(); break;
                        case 'generating': handleStartGeneration(); break;
                        case 'review': setChatState('review'); break;
                        case 'accepted': setChatState('accepted'); break;
                        case 'slashMenu': handleReset(); setShowSlashMenu(true); setSlashMenuIndex(0); break;
                        case 'planMode': setInputMode('plan'); break;
                        case 'buildMode': setInputMode('build'); break;
                    }
                }}
            >
                <div className="max-w-2xl mx-auto px-8 py-12">
                    <ReactMarkdown
                        components={{
                            h1: (props: ComponentPropsWithoutRef<'h1'>) => <h1 className="text-2xl font-bold text-gray-900 mb-2" {...props} />,
                            h2: (props: ComponentPropsWithoutRef<'h2'>) => <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3" {...props} />,
                            p: ({ children }: ComponentPropsWithoutRef<'p'>) => {
                                const kids = Children.toArray(children as ReactNode);
                                const nonWhitespace = kids.filter((child) => !(typeof child === 'string' && !child.trim()));
                                const allImages = nonWhitespace.length > 0 && nonWhitespace.every(
                                    (child) => isValidElement(child) && (child.props as any)?.src !== undefined
                                );
                                if (allImages) {
                                    return <div className={`flex flex-wrap gap-4 mb-3 ${nonWhitespace.length > 1 ? 'items-start' : ''}`}>{children}</div>;
                                }
                                return <p className="text-[14px] text-gray-600 leading-relaxed mb-3">{children}</p>;
                            },
                            hr: (props: ComponentPropsWithoutRef<'hr'>) => <hr className="border-gray-100 my-6" {...props} />,
                            ul: (props: ComponentPropsWithoutRef<'ul'>) => <ul className="list-disc pl-5 text-[14px] text-gray-600 space-y-1 mb-3" {...props} />,
                            li: (props: ComponentPropsWithoutRef<'li'>) => <li className="leading-relaxed" {...props} />,
                            strong: (props: ComponentPropsWithoutRef<'strong'>) => <strong className="text-gray-800 font-semibold" {...props} />,
                            code: (props: ComponentPropsWithoutRef<'code'>) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[13px] text-gray-700" {...props} />,
                            img: ({ src, alt }: ComponentPropsWithoutRef<'img'>) => {
                                const [path, hash] = (src || '').split('#');
                                const width = hash?.match(/width=(\d+)/)?.[1];
                                const resolved = (path ? noteImages[`./${path}`] : undefined) || path;
                                return (
                                    <figure className="my-3">
                                        <img
                                            src={resolved}
                                            alt={alt}
                                            style={width ? { width: `${width}px` } : undefined}
                                            className="rounded-lg border border-gray-200 shadow-sm max-w-full cursor-zoom-in hover:shadow-md transition-shadow"
                                            onClick={() => setLightboxSrc(resolved || '')}
                                        />
                                        {alt && <figcaption className="text-[12px] text-gray-400 mt-1 italic text-center" style={width ? { width: `${width}px` } : undefined}>{alt}</figcaption>}
                                    </figure>
                                );
                            },
                            a: ({ href, children }: ComponentPropsWithoutRef<'a'>) => {
                                if (href?.startsWith('#action-')) {
                                    return (
                                        <a
                                            href={href}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[12.5px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer no-underline"
                                        >
                                            <ArrowRight size={12} strokeWidth={2} />
                                            {children}
                                        </a>
                                    );
                                }
                                return <a href={href} className="text-blue-600 hover:underline">{children}</a>;
                            },
                        }}
                    >
                        {notesContent}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Right Side - WSO2 Integrator Copilot Panel */}
            <div className="w-[450px] lg:w-[500px] bg-white flex flex-col shadow-sm z-10">

                {/* Header */}
                <div className="flex justify-end items-center px-4 py-3 border-b border-gray-100 text-[13px] text-gray-600 shrink-0 bg-white">
                    <div className="flex items-center gap-4">
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
                    </div>
                </div>

                {/* Dynamic Center Content (Scrollable) */}
                <div className={`flex-1 overflow-y-auto ${chatState === 'empty' ? 'flex flex-col p-8 text-center' : 'p-4'}`}>

                    {chatState === 'empty' ? (
                        /* --- EMPTY STATE --- */
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
                                    <FilePlus size={15} className="text-gray-500" strokeWidth={1.5} /> to attach context
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* --- CHAT FLOW STATE --- */
                        <div className="space-y-5 animate-in fade-in duration-300">
                            {/* Checkpoint Indicator */}
                            <div className="flex items-center gap-2 text-[12px] text-gray-400 px-1">
                                <CheckCircle2 size={13} strokeWidth={2} className="text-green-500" />
                                <span>Checkpoint saved</span>
                                <button
                                    onClick={handleReset}
                                    className="cursor-pointer group/restore flex items-center gap-1 px-1.5 py-0.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                >
                                    <RotateCcw size={11} strokeWidth={2.5} />
                                    <span className="max-w-0 overflow-hidden group-hover/restore:max-w-[60px] transition-all duration-200 whitespace-nowrap">Restore</span>
                                </button>
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
                                        <p>
                                            Now I'll add a simple "Hello World" HTTP service to the existing code:
                                        </p>
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
                        <div className="flex flex-wrap gap-2 mb-3">
                            <button
                                onClick={handleStartGeneration}
                                className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
                            >
                                <ArrowRight size={13} strokeWidth={2} className="text-gray-400" />
                                write a hello world http service
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all">
                                <ArrowRight size={13} strokeWidth={2} className="text-gray-400" />
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

                    {/* Enhanced Chat Input Container */}
                    <div className="relative border border-gray-300 rounded-xl shadow-sm flex flex-col bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">

                        {/* Slash Command Menu */}
                        {showSlashMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowSlashMenu(false)} />
                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150 z-20">
                                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Commands</span>
                                        <button
                                            onClick={() => setShowSlashMenu(false)}
                                            className="p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                                        >
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
                                        onClick={() => {
                                            setActiveCommand(null);
                                            textareaRef.current?.focus();
                                        }}
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
                                            setSlashMenuIndex((prev) => {
                                                const next = (prev + 1) % slashCommands.length;
                                                slashMenuRefs.current[next]?.scrollIntoView({ block: 'nearest' });
                                                return next;
                                            });
                                        } else if (e.key === 'ArrowUp') {
                                            e.preventDefault();
                                            setSlashMenuIndex((prev) => {
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

                        {/* Bottom Toolbar inside input */}
                        <div className="flex justify-between items-center px-2 pb-2 mt-1">

                            {/* LEFT: AI Mode Selector (Build vs Plan) */}
                            <div className="flex bg-gray-100 rounded-[6px] p-0.5 border border-gray-200/50">
                                <button
                                    onClick={() => setInputMode('build')}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[12px] font-medium transition-all ${inputMode === 'build' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Hammer size={12} />
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
                                    onClick={() => { setShowSlashMenu(!showSlashMenu); setSlashMenuIndex(0); }}
                                    className={`w-[28px] h-[28px] flex items-center justify-center hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${showSlashMenu ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
                                >
                                    <span className="text-[15px] font-medium leading-none">/</span>
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
                                        />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxSrc && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center cursor-zoom-out animate-in fade-in duration-150"
                    onClick={() => setLightboxSrc(null)}
                >
                    <button
                        onClick={() => setLightboxSrc(null)}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={24} strokeWidth={2} />
                    </button>
                    <img
                        src={lightboxSrc}
                        className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
