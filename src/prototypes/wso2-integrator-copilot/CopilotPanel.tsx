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
    MessageSquarePlus,
    Play,
    SendHorizonal,
    FlaskConical,
    ArrowLeft,
    Plus,
    Trash2,
    Wrench,
    Download,
    Pencil,
    RefreshCw
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
    openSettings?: boolean;
    openExtensions?: boolean;
    openSkills?: boolean;
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
    openSettings: openSettingsProp,
    openExtensions: openExtensionsProp,
    openSkills: openSkillsProp,
}: CopilotPanelProps) {
    const [isChangesExpanded, setIsChangesExpanded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [activeCommand, setActiveCommand] = useState<{ name: string; icon: React.ComponentType<any> } | null>(null);
    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
    const [isPlanTasksExpanded, setIsPlanTasksExpanded] = useState(true);
    const [isPlanApprovedExpanded, setIsPlanApprovedExpanded] = useState(false);
    const [webSearchEnabled, setWebSearchEnabled] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    useEffect(() => {
        if (openSettingsProp) setShowSettings(true);
    }, [openSettingsProp]);
    const [extPage, setExtPage] = useState<'none' | 'mcp' | 'skills'>('none');
    useEffect(() => {
        if (openExtensionsProp) setExtPage('mcp');
    }, [openExtensionsProp]);
    useEffect(() => {
        if (openSkillsProp) setExtPage('skills');
    }, [openSkillsProp]);
    const [servers, setServers] = useState<McpServer[]>(INITIAL_SERVERS);
    const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
    const mcpConnected = servers.filter((s) => s.enabled && s.status === 'connected');
    const mcpToolCount = mcpConnected.reduce((n, s) => n + s.tools.length, 0);
    const skillsEnabled = skills.filter((s) => s.enabled).length;
    const [mainAgent, setMainAgent] = useState('normal');
    const [subAgent, setSubAgent] = useState('normal');
    const [extendedThinking, setExtendedThinking] = useState(false);
    const [githubAuthorized, setGithubAuthorized] = useState(true);
    const [terminalStep, setTerminalStep] = useState(0);
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

    // Terminal demo auto-advance
    useEffect(() => {
        if (chatState === 'terminal-demo' && terminalStep === 0) {
            setTerminalStep(1);
            return;
        }
        if (chatState !== 'terminal-demo') return;
        if (terminalStep >= 9) return;
        const delays = [0, 1200, 1800, 1500, 2000, 1200, 1800, 1500, 2000];
        const timer = setTimeout(() => setTerminalStep((s) => s + 1), delays[terminalStep] || 1500);
        return () => clearTimeout(timer);
    }, [chatState, terminalStep]);

    const handleStartGeneration = () => {
        onStartGeneration();
        setInputValue('');
    };

    const handleReset = () => {
        onReset();
        setIsChangesExpanded(false);
        setInputValue('');
        setActiveCommand(null);
        setTerminalStep(0);
    };

    return (
        <div className="w-[450px] lg:w-[500px] bg-white flex flex-col shadow-sm z-10">
            {showSettings ? (
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                        <button
                            onClick={() => setShowSettings(false)}
                            className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft size={16} strokeWidth={1.5} />
                        </button>
                        <span className="text-[14px] font-semibold text-gray-900">Settings</span>
                    </div>

                    <div className="p-5 space-y-6">
                        {/* Agent intelligence & thinking — MI only */}
                        {headerMode === 'mi' && (
                        <>
                        {/* Main Agent Intelligence */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Main Agent Intelligence</h3>
                            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
                                {['normal', 'high'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setMainAgent(level)}
                                        className={`flex-1 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all capitalize ${mainAgent === level ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        {level}{mainAgent === level && ' •'}
                                    </button>
                                ))}
                            </div>
                            <div className="text-[11px] text-gray-400 space-y-0.5">
                                <p>{mainAgent === 'normal' ? 'Balanced quality, speed, and quota usage for everyday requests.' : 'Maximum reasoning capability for complex tasks. Higher quota usage.'}</p>
                                <p className="font-medium text-gray-500">Uses Claude {mainAgent === 'normal' ? 'Sonnet 4.6' : 'Opus 4.6'}</p>
                            </div>
                        </div>

                        {/* Sub-Agent Intelligence */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Sub-Agent Intelligence</h3>
                            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
                                {['normal', 'high'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setSubAgent(level)}
                                        className={`flex-1 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all capitalize ${subAgent === level ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        {level}{subAgent === level && ' •'}
                                    </button>
                                ))}
                            </div>
                            <div className="text-[11px] text-gray-400 space-y-0.5">
                                <p>{subAgent === 'normal' ? 'Fast and lightweight for routine sub-agent work.' : 'Higher quality sub-agent responses. Moderate quota usage.'}</p>
                                <p className="font-medium text-gray-500">Uses Claude {subAgent === 'normal' ? 'Haiku 4.5' : 'Sonnet 4.6'}</p>
                            </div>
                        </div>

                        {/* Thinking Mode */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Thinking Mode</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-800">Extended Thinking</span>
                                <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
                                    <button
                                        onClick={() => setExtendedThinking(false)}
                                        className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${!extendedThinking ? 'bg-gray-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        Off
                                    </button>
                                    <button
                                        onClick={() => setExtendedThinking(true)}
                                        className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${extendedThinking ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        On
                                    </button>
                                </div>
                            </div>
                        </div>

                        </>
                        )}

                        {/* Customize Copilot */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Customize Copilot</h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                                <button
                                    onClick={() => { setShowSettings(false); setExtPage('mcp'); }}
                                    className="flex items-center gap-3 w-full px-3 py-3 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <McpIcon size={18} className="text-gray-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-gray-900">MCP servers</p>
                                        <p className="text-[11.5px] text-gray-400 mt-0.5">{mcpConnected.length}/{servers.length} connected · {mcpToolCount} tools</p>
                                    </div>
                                    <ChevronRight size={16} strokeWidth={1.5} className="text-gray-300 shrink-0" />
                                </button>
                                <button
                                    onClick={() => { setShowSettings(false); setExtPage('skills'); }}
                                    className="flex items-center gap-3 w-full px-3 py-3 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <Sparkles size={18} strokeWidth={1.5} className="text-gray-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-gray-900">Skills</p>
                                        <p className="text-[11.5px] text-gray-400 mt-0.5">{skillsEnabled} of {skills.length} enabled</p>
                                    </div>
                                    <ChevronRight size={16} strokeWidth={1.5} className="text-gray-300 shrink-0" />
                                </button>
                            </div>
                        </div>

                        {/* Integrations */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Integrations</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[13px] text-gray-800">GitHub Copilot</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Enable inline completions via GitHub Copilot</p>
                                </div>
                                <button
                                    onClick={() => setGithubAuthorized(!githubAuthorized)}
                                    className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors shrink-0 ml-4 ${githubAuthorized ? 'text-green-700 bg-green-50 border border-green-200' : 'text-white bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {githubAuthorized ? 'Authorized' : 'Authorize'}
                                </button>
                            </div>
                        </div>

                        {/* Account */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Account</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[13px] text-gray-800">Sign out</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">End your session and disconnect from AI services</p>
                                </div>
                                <button className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors shrink-0 ml-4">
                                    <LogOut size={12} strokeWidth={1.5} />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Settings persist across sessions</span>
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                            <RotateCcw size={11} strokeWidth={2} />
                            Reset to defaults
                        </button>
                    </div>
                </div>
            ) : extPage === 'mcp' ? (
                <McpServersPage servers={servers} setServers={setServers} onBack={() => { setExtPage('none'); setShowSettings(true); }} />
            ) : extPage === 'skills' ? (
                <SkillsPage skills={skills} setSkills={setSkills} onBack={() => { setExtPage('none'); setShowSettings(true); }} />
            ) : (
            <>
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
                            <button
                                onClick={() => setShowSettings(true)}
                                className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                            >
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
                            <button
                                onClick={() => setShowSettings(true)}
                                className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                            >
                                <Settings size={15} strokeWidth={1.5} />
                                <span>Settings</span>
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
                ) : chatState === 'terminal-demo' ? (
                    /* --- TERMINAL DEMO --- */
                    <div className={`space-y-5 animate-in fade-in duration-300 ${checkpointStyle === 'divider' ? 'group/turn' : ''}`}>
                        <CheckpointIndicator style={checkpointStyle} onRestore={handleReset} />

                        <div className="flex justify-end">
                            <div className="bg-[#E2E8F0]/60 text-gray-800 text-[13px] px-4 py-2.5 rounded-xl rounded-tr-sm max-w-[85%]">
                                run the service and test it
                            </div>
                        </div>

                        <div className="text-[13px] text-gray-800 space-y-4 leading-relaxed">
                            {/* Step 1: Intro text */}
                            {terminalStep >= 1 && (
                                <p><Typewriter text="I'll run your service and test the hello world endpoint." /></p>
                            )}

                            {/* Step 2: Run service (starts as running) */}
                            {terminalStep >= 2 && (
                                <TerminalCard
                                    title="Build and run the service"
                                    icon={Play}
                                    command="bal run"
                                    status={terminalStep <= 2 ? 'running' : 'success'}
                                    statusText={terminalStep <= 2 ? 'Running...' : 'Service started'}
                                    output={`Compiling source\n    danniles/MathTutor:0.1.0\n\nRunning executable\n\n[ballerina/http] started HTTP/WS listener\n0.0.0.0:8080`}
                                />
                            )}

                            {/* Step 3: Service running text */}
                            {terminalStep >= 4 && (
                                <p><Typewriter text="Service is running. Let me test the endpoint:" /></p>
                            )}

                            {/* Step 4: HTTP test */}
                            {terminalStep >= 5 && (
                                <HttpTestCard
                                    status={terminalStep <= 5 ? 'running' : 'success'}
                                    endpoints={[
                                        { method: 'GET', path: '/hello/world', statusCode: 200, response: `{\n    "message": "Hello, World!"\n}` },
                                        { method: 'POST', path: '/MathTutor/chat', statusCode: 200, response: `{\n    "answer": "2 + 2 = 4"\n}` },
                                    ]}
                                />
                            )}

                            {/* Step 5: Success text */}
                            {terminalStep >= 7 && (
                                <p>
                                    <Typewriter text="The endpoint is returning the expected response. Let me also run the tests:" />
                                </p>
                            )}

                            {/* Step 6: Run tests */}
                            {terminalStep >= 8 && (
                                <TerminalCard
                                    title="Run tests"
                                    icon={FlaskConical}
                                    command="bal test"
                                    status={terminalStep <= 8 ? 'running' : 'success'}
                                    statusText={terminalStep <= 8 ? 'Running tests...' : '1 passing, 0 failing'}
                                    output={`Compiling source\n    danniles/MathTutor:0.1.0\n\nRunning Tests\n\n    [pass] testHelloWorld\n\n    1 passing\n    0 failing`}
                                />
                            )}

                            {/* Step 7: All done */}
                            {terminalStep >= 9 && (
                                <p>
                                    <Typewriter text="All tests are passing. Your hello world HTTP service is ready to use." />
                                </p>
                            )}
                        </div>
                    </div>
                ) : chatState === 'extensions-demo' ? (
                    /* --- EXTENSIONS IN-CHAT SURFACING DEMO --- */
                    <div className={`space-y-5 animate-in fade-in duration-300 ${checkpointStyle === 'divider' ? 'group/turn' : ''}`}>
                        <CheckpointIndicator style={checkpointStyle} onRestore={handleReset} />

                        <div className="flex justify-end">
                            <div className="bg-[#E2E8F0]/60 text-gray-800 text-[13px] px-4 py-2.5 rounded-xl rounded-tr-sm max-w-[85%]">
                                find a Salesforce connector and open a GitHub issue to track the integration
                            </div>
                        </div>

                        <div className="text-[13px] text-gray-800 space-y-4 leading-relaxed">
                            <p>I'll look up the Salesforce connector and create a tracking issue for you.</p>

                            {/* Active skill */}
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[12px] font-medium rounded-md">
                                    <Sparkles size={11} strokeWidth={2} />
                                    Skill: Integration Patterns
                                </span>
                            </div>

                            {/* MCP tool calls — tagged with their server */}
                            <div className="space-y-2 text-gray-400 text-[12.5px]">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[11px] text-gray-500 font-medium shrink-0">
                                        <McpIcon size={11} className="shrink-0" />
                                        wso2-connectors
                                    </span>
                                    <span>Found Salesforce connector <span className="font-medium text-gray-500">(v4.1.0)</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[11px] text-gray-500 font-medium shrink-0">
                                        <McpIcon size={11} className="shrink-0" />
                                        github
                                    </span>
                                    <span>Created issue <span className="font-medium text-gray-500">#1042</span></span>
                                </div>
                            </div>

                            <p>
                                I found the <span className="font-medium">Salesforce connector (v4.1.0)</span> in the WSO2 catalog and opened <span className="font-medium">issue #1042</span> to track the work. Want me to scaffold the connection config next?
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
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[12px] font-medium transition-all ${inputMode === 'build' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <Hammer size={12} />
                                    Build
                                </button>
                                <button
                                    onClick={() => setInputMode('plan')}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[12px] font-medium transition-all ${inputMode === 'plan' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
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
                                }} className="w-[28px] h-[28px] flex items-center justify-center text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors">
                                    <StopCircle size={16} strokeWidth={2} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleStartGeneration}
                                    disabled={!inputValue.trim() && chatState !== 'empty'}
                                    className={`w-[28px] h-[28px] flex items-center justify-center rounded-md transition-colors ${inputValue.trim() || chatState === 'empty'
                                        ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm'
                                        : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                        }`}
                                >
                                    <Send size={14} strokeWidth={2} />
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
            </>
            )}
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

/** Unified terminal card for running commands and showing output */
function TerminalCard({ title, icon: Icon, command, output, status, statusText }: {
    title: React.ReactNode;
    icon?: React.ComponentType<any>;
    command: string;
    output: string;
    status: 'running' | 'success' | 'error';
    statusText?: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const prevStatusRef = useRef(status);

    // Auto-expand on error
    useEffect(() => {
        if (prevStatusRef.current === 'running' && status === 'error') {
            setExpanded(true);
        }
        prevStatusRef.current = status;
    }, [status]);

    const label = statusText || (status === 'running' ? 'Running...' : status === 'success' ? 'Completed' : 'Failed');

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden text-[12.5px] animate-in fade-in duration-300">
            <button
                onClick={() => status !== 'running' && setExpanded(!expanded)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 transition-colors ${status !== 'running' ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}`}
            >
                {Icon && <Icon size={15} strokeWidth={1.5} className="text-gray-400 shrink-0" />}
                <span className="flex-1 text-left text-[12.5px] text-gray-700">{title}</span>
                <span className={`text-[11.5px] ${status === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
                    {label}
                </span>
                {status !== 'running' && (
                    <ChevronDown size={12} className={`text-gray-400 transition-transform shrink-0 ${expanded ? 'rotate-0' : '-rotate-90'}`} />
                )}
            </button>

            {/* Expandable details — command + output */}
            <Collapse open={expanded}>
                <div className="border-t border-gray-200 bg-gray-50 font-mono text-[11px] text-gray-600 leading-relaxed">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200/60">
                        <span className="text-green-600 select-none">$</span>
                        <span className="text-gray-700">{command}</span>
                    </div>
                    <div className="px-3 py-2 max-h-[150px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{output}</pre>
                    </div>
                </div>
            </Collapse>
        </div>
    );
}

/** HTTP test card — shows endpoint results with expandable responses */
function HttpTestCard({ status, endpoints }: {
    status: 'running' | 'success' | 'error';
    endpoints: { method: string; path: string; statusCode: number; response: string }[];
}) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden text-[12.5px] animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
                <SendHorizonal size={15} strokeWidth={1.5} className="text-gray-400 shrink-0" />
                <span className="text-gray-700">HTTP Request</span>
                {status === 'running' && <span className="text-[11px] text-gray-400">Running...</span>}
            </div>

            {/* Endpoint list */}
            {status !== 'running' && (
                <div className="border-t border-gray-100">
                    {endpoints.map((ep, i) => {
                        const isExpanded = expandedIndex === i;
                        const isError = ep.statusCode >= 400;
                        return (
                            <div key={i} className="border-b border-gray-100 last:border-b-0">
                                <button
                                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                                    className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-gray-50 transition-colors"
                                >
                                    {isError && <X size={13} strokeWidth={2} className="text-red-500 shrink-0" />}
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white shrink-0 ${ep.method === 'GET' ? 'bg-blue-500' : ep.method === 'POST' ? 'bg-green-500' : ep.method === 'PUT' ? 'bg-amber-500' : ep.method === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'}`}>
                                        {ep.method}
                                    </span>
                                    <span className="flex-1 text-left text-[12px] text-gray-600 font-mono">{ep.path}</span>
                                    <span className={`text-[11.5px] font-mono ${isError ? 'text-red-500' : 'text-gray-400'}`}>{ep.statusCode}</span>
                                    <ChevronDown size={12} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                                </button>
                                <Collapse open={isExpanded}>
                                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                                        <pre className="font-mono text-[11px] text-gray-600 whitespace-pre-wrap">{ep.response}</pre>
                                    </div>
                                </Collapse>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/** Typewriter text reveal effect */
function Typewriter({ text, speed = 20 }: { text: string; speed?: number }) {
    const [displayed, setDisplayed] = useState('');
    useEffect(() => {
        setDisplayed('');
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);
    return <>{displayed}</>;
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

/* ───────────────────────── Extensions ───────────────────────── */

/** MCP logo (mingcute/mcp-line), inlined to avoid an icon dependency */
function McpIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path fill="currentColor" d="M9.112 3.161a4.498 4.498 0 0 1 7.65 3.658a4.5 4.5 0 0 1 3.662 7.656l-5.303 5.304l.707.707a1 1 0 1 1-1.414 1.414l-.707-.707a2 2 0 0 1 0-2.83l5.304-5.302a2.5 2.5 0 0 0-3.536-3.536l-3.889 3.89a1 1 0 0 1-1.173.178l-.004-.002a1 1 0 0 1-.242-1.593l3.89-3.89a2.498 2.498 0 0 0-3.53-3.533l-6.013 6.013A1 1 0 0 1 3.1 9.173zm2.474 2.475A1 1 0 0 1 13 7.05l-3.89 3.89a2.5 2.5 0 0 0 3.537 3.535l3.888-3.889A1 1 0 1 1 17.95 12l-3.888 3.889a4.5 4.5 0 0 1-6.365-6.364z" />
        </svg>
    );
}

/** iOS-style toggle switch */
function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); if (!disabled) onChange(); }}
            disabled={disabled}
            className={`relative inline-flex h-[18px] w-[32px] items-center rounded-full transition-colors shrink-0 ${checked ? 'bg-blue-600' : 'bg-gray-200'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
            <span className={`inline-block h-[14px] w-[14px] transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[16px]' : 'translate-x-[2px]'}`} />
        </button>
    );
}

type ServerStatus = 'connected' | 'needs-auth' | 'error' | 'disabled';
type ServerScope = 'project' | 'user';

interface McpServer {
    id: string;
    name: string;
    scope: ServerScope;
    transportType: string;
    command: string;
    tools: string[];
    status: ServerStatus;
    enabled: boolean;
    error?: string;
}

interface Skill {
    id: string;
    name: string;
    description: string;
    trigger: string;
    source: 'Built-in' | 'Custom';
    enabled: boolean;
}

const FILESYSTEM_TOOLS = ['read_file', 'read_text_file', 'read_media_file', 'read_multiple_files', 'write_file', 'edit_file', 'create_directory', 'list_directory', 'list_directory_with_sizes', 'directory_tree', 'move_file', 'search_files', 'get_file_info', 'list_allowed_directories'];

const INITIAL_SERVERS: McpServer[] = [
    { id: 'filesystem', name: 'filesystem', scope: 'project', transportType: 'stdio', command: 'npx -y @modelcontextprotocol/server-filesystem', tools: FILESYSTEM_TOOLS, status: 'connected', enabled: true },
    { id: 'excalidraw', name: 'excalidraw', scope: 'user', transportType: 'stdio', command: 'npx -y mcp-excalidraw', tools: ['create_element', 'update_element', 'get_scene', 'export_png', 'clear_canvas', 'list_elements'], status: 'connected', enabled: false },
    { id: 'everything', name: 'everything', scope: 'user', transportType: 'stdio', command: 'npx -y @modelcontextprotocol/server-everything', tools: ['echo', 'add', 'longRunningOperation', 'sampleLLM', 'getTinyImage', 'printEnv', 'annotatedMessage', 'getResourceReference', 'startElicitation'], status: 'connected', enabled: false },
    { id: 'ballerina-library', name: 'ballerina-library', scope: 'user', transportType: 'stdio', command: 'bal mcp library', tools: ['search_library', 'get_module_docs', 'list_modules'], status: 'connected', enabled: false },
];

const INITIAL_SKILLS: Skill[] = [
    { id: 'openapi', name: 'OpenAPI Import', description: 'Scaffold services from an OpenAPI specification', trigger: 'you run /openapi or attach an OpenAPI file', source: 'Built-in', enabled: true },
    { id: 'datamap', name: 'Data Mapper', description: 'Generate data mappings between record types', trigger: 'you run /datamap or describe a transformation', source: 'Built-in', enabled: true },
    { id: 'typecreator', name: 'Type Creator', description: 'Create custom Ballerina types from samples', trigger: 'you run /typecreator', source: 'Built-in', enabled: false },
    { id: 'eip', name: 'Integration Patterns', description: 'Apply enterprise integration patterns idiomatically', trigger: 'building routing, aggregation, or messaging flows', source: 'Custom', enabled: true },
];

function effectiveStatus(server: McpServer): ServerStatus {
    return server.enabled ? server.status : 'disabled';
}

function statusDotColor(status: ServerStatus) {
    return status === 'connected' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : status === 'needs-auth' ? 'bg-amber-500' : 'bg-gray-300';
}

/** MCP Servers management page — grouped by scope (project / user) */
function McpServersPage({ servers, setServers, onBack }: {
    servers: McpServer[];
    setServers: React.Dispatch<React.SetStateAction<McpServer[]>>;
    onBack: () => void;
}) {
    const [adding, setAdding] = useState<null | { scope: ServerScope }>(null);
    const [collapsed, setCollapsed] = useState<Set<ServerScope>>(new Set());
    const [refreshing, setRefreshing] = useState(false);

    const toggleServer = (id: string) => setServers((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
    const loginServer = (id: string) => setServers((prev) => prev.map((s) => s.id === id ? { ...s, status: 'connected', enabled: true } : s));
    const removeServer = (id: string) => setServers((prev) => prev.filter((s) => s.id !== id));

    const groups: { scope: ServerScope; label: string; helper: string; file: string }[] = [
        { scope: 'project', label: 'Project', helper: "Used only with this project, via its .mcp.json", file: '.mcp.json' },
        { scope: 'user', label: 'User', helper: 'Available across all your projects', file: '~/.mcp.json' },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
                <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={16} strokeWidth={1.5} />
                </button>
                <span className="text-[14px] font-semibold text-gray-900">MCP Servers</span>
                <div className="flex-1" />
                <button
                    onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 900); }}
                    title="Refresh servers"
                    className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    <RefreshCw size={14} strokeWidth={2} className={refreshing ? 'animate-spin' : ''} />
                </button>
                <button
                    onClick={() => setAdding({ scope: 'user' })}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                    <Plus size={13} strokeWidth={2.5} />Add server
                </button>
            </div>

            {/* Scope groups */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {groups.map((g) => {
                    const list = servers.filter((s) => s.scope === g.scope);
                    const isCollapsed = collapsed.has(g.scope);
                    const allOn = list.length > 0 && list.every((s) => s.enabled);
                    return (
                        <div key={g.scope}>
                            {/* Group header */}
                            <div className="flex items-center gap-2 mb-1">
                                <button
                                    onClick={() => setCollapsed((prev) => { const n = new Set(prev); n.has(g.scope) ? n.delete(g.scope) : n.add(g.scope); return n; })}
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors"
                                >
                                    {isCollapsed ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronDown size={13} strokeWidth={2.5} />}
                                    <span className="text-[11px] font-semibold uppercase tracking-wider">{g.label}</span>
                                    <span className="text-[11px] text-gray-300 font-medium">{list.length}</span>
                                </button>
                                <Switch checked={allOn} onChange={() => setServers((prev) => prev.map((s) => s.scope === g.scope ? { ...s, enabled: !allOn } : s))} disabled={list.length === 0} />
                                <div className="flex-1" />
                                <button
                                    title={`Open ${g.file}`}
                                    className="flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <FileJson size={13} strokeWidth={2} />
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-2.5 ml-[19px]">{g.helper}</p>

                            <Collapse open={!isCollapsed}>
                                {list.length === 0 ? (
                                    <p className="text-[12px] text-gray-400 italic ml-[19px]">No servers in this scope.</p>
                                ) : (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                                        {list.map((s) => (
                                            <McpServerRow
                                                key={s.id}
                                                server={s}
                                                onToggle={() => toggleServer(s.id)}
                                                onLogin={() => loginServer(s.id)}
                                                onRemove={() => removeServer(s.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Collapse>
                        </div>
                    );
                })}
            </div>

            {adding && (
                <AddServerModal
                    initialScope={adding.scope}
                    onClose={() => setAdding(null)}
                    onAdd={(s) => { setServers((prev) => [...prev, s]); setAdding(null); }}
                />
            )}
        </div>
    );
}

function McpServerRow({ server, onToggle, onLogin, onRemove }: {
    server: McpServer;
    onToggle: () => void;
    onLogin: () => void;
    onRemove: () => void;
}) {
    const [showTools, setShowTools] = useState(false);
    const eff = effectiveStatus(server);
    const hasTools = server.tools.length > 0;
    const statusLabel = eff === 'needs-auth' ? 'needs login' : eff === 'error' ? 'error' : `${server.tools.length} tools`;
    const dim = eff === 'disabled';

    return (
        <div className="group/row">
            <div className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors">
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotColor(eff)}`} />
                <button
                    onClick={() => hasTools && setShowTools(!showTools)}
                    className={`flex items-center gap-2 min-w-0 text-left ${hasTools ? '' : 'cursor-default'}`}
                >
                    <span className={`text-[13px] font-medium truncate ${dim ? 'text-gray-400' : 'text-gray-900'}`}>{server.name}</span>
                    <span className={`text-[11.5px] shrink-0 whitespace-nowrap ${eff === 'error' ? 'text-red-500' : 'text-gray-400'}`}>{server.transportType} · {statusLabel}</span>
                    {hasTools && (showTools
                        ? <ChevronDown size={11} strokeWidth={2.5} className="text-gray-300 shrink-0" />
                        : <ChevronRight size={11} strokeWidth={2.5} className="text-gray-300 shrink-0" />)}
                </button>

                <div className="flex-1" />

                {/* Edit / Delete reveal on hover — the flex-1 spacer absorbs them so the toggle stays put */}
                <div className="hidden group-hover/row:flex items-center gap-0.5 shrink-0">
                    <button title="Edit" className="flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><Pencil size={12} strokeWidth={2} /></button>
                    <button onClick={onRemove} title="Delete" className="flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={12} strokeWidth={2} /></button>
                </div>

                {server.status === 'needs-auth' && (
                    <button onClick={onLogin} className="px-2 py-0.5 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors shrink-0">Login</button>
                )}
                <Switch checked={server.enabled} onChange={onToggle} />
            </div>

            {server.error && eff === 'error' && (
                <p className="px-3 pb-2.5 pl-[30px] text-[11.5px] text-red-600 leading-relaxed">{server.error}</p>
            )}

            <Collapse open={showTools}>
                <div className="px-3 pb-3 pl-[30px] flex flex-wrap gap-1.5">
                    {server.tools.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-500 font-mono">
                            <Wrench size={10} strokeWidth={2} className="text-gray-300" />{t}
                        </span>
                    ))}
                </div>
            </Collapse>
        </div>
    );
}

/** Skills management page — built-in (slash commands) + custom */
function SkillsPage({ skills, setSkills, onBack }: {
    skills: Skill[];
    setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
    onBack: () => void;
}) {
    const [adding, setAdding] = useState(false);
    if (adding) {
        return <AddSkillForm onBack={() => setAdding(false)} onAdd={(s) => { setSkills((prev) => [...prev, s]); setAdding(false); }} />;
    }

    const custom = skills.filter((s) => s.source === 'Custom');
    const builtin = skills.filter((s) => s.source === 'Built-in');
    const toggle = (id: string) => setSkills((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
    const remove = (id: string) => setSkills((prev) => prev.filter((s) => s.id !== id));

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
                <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={16} strokeWidth={1.5} />
                </button>
                <span className="text-[14px] font-semibold text-gray-900">Skills</span>
                <div className="flex-1" />
                <button onClick={() => setAdding(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                    <Plus size={13} strokeWidth={2.5} />Add skill
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {custom.length > 0 && (
                    <>
                        <p className="text-[10.5px] font-medium text-gray-400 uppercase tracking-wider">Custom</p>
                        {custom.map((s) => <SkillCard key={s.id} skill={s} onToggle={() => toggle(s.id)} onRemove={() => remove(s.id)} />)}
                    </>
                )}
                <p className="text-[10.5px] font-medium text-gray-400 uppercase tracking-wider pt-1">Built-in</p>
                {builtin.map((s) => <SkillCard key={s.id} skill={s} onToggle={() => toggle(s.id)} />)}
            </div>
        </div>
    );
}

function SkillCard({ skill, onToggle, onRemove }: { skill: Skill; onToggle: () => void; onRemove?: () => void }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-start gap-3 p-3">
                <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                    <Sparkles size={14} strokeWidth={1.75} className={skill.enabled ? 'text-blue-500' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-[13px] font-medium truncate ${skill.enabled ? 'text-gray-900' : 'text-gray-400'}`}>{skill.name}</span>
                            <span className="px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded shrink-0">{skill.source}</span>
                        </div>
                        <Switch checked={skill.enabled} onChange={onToggle} />
                    </div>
                    <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 mt-0.5 w-full text-left">
                        <span className="text-[11.5px] text-gray-400 truncate flex-1">{skill.description}</span>
                        <ChevronDown size={11} className={`text-gray-300 transition-transform shrink-0 ${expanded ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                </div>
            </div>
            <Collapse open={expanded}>
                <div className="px-3 pb-3 pl-[52px] space-y-2">
                    <p className="text-[11.5px] text-gray-500"><span className="text-gray-400">Triggers when</span> {skill.trigger}.</p>
                    <div className="flex items-center gap-3 pt-0.5">
                        <button className="flex items-center gap-1 text-[11.5px] text-gray-400 hover:text-gray-700 transition-colors"><BookOpen size={11} strokeWidth={2} />View</button>
                        {onRemove && (
                            <button onClick={onRemove} className="flex items-center gap-1 text-[11.5px] text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={11} strokeWidth={2} />Remove</button>
                        )}
                    </div>
                </div>
            </Collapse>
        </div>
    );
}

type KvRow = { id: string; key: string; value: string };

function KeyValueEditor({ label, rows, setRows, keyPh, valuePh, addLabel }: {
    label: string;
    rows: KvRow[];
    setRows: React.Dispatch<React.SetStateAction<KvRow[]>>;
    keyPh: string;
    valuePh: string;
    addLabel: string;
}) {
    const update = (id: string, field: 'key' | 'value', v: string) => setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: v } : r));
    const fieldCls = 'px-2.5 py-1.5 text-[12px] text-gray-900 font-mono border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 placeholder:font-sans';
    return (
        <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-600">{label}</label>
            {rows.map((r) => (
                <div key={r.id} className="flex items-center gap-1.5">
                    <input value={r.key} onChange={(e) => update(r.id, 'key', e.target.value)} placeholder={keyPh} className={`w-[38%] ${fieldCls}`} />
                    <input value={r.value} onChange={(e) => update(r.id, 'value', e.target.value)} placeholder={valuePh} className={`flex-1 min-w-0 ${fieldCls}`} />
                    <button onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))} className="flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"><X size={13} strokeWidth={2} /></button>
                </div>
            ))}
            <button onClick={() => setRows((prev) => [...prev, { id: `kv-${Date.now()}`, key: '', value: '' }])} className="flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-gray-500 hover:text-gray-800 border border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                <Plus size={12} strokeWidth={2.5} />{addLabel}
            </button>
        </div>
    );
}

function AddServerModal({ initialScope, onClose, onAdd }: {
    initialScope: ServerScope;
    onClose: () => void;
    onAdd: (s: McpServer) => void;
}) {
    const [scope, setScope] = useState<ServerScope>(initialScope);
    const [name, setName] = useState('');
    const [transport, setTransport] = useState<'stdio' | 'http'>('stdio');
    const [command, setCommand] = useState('');
    const [args, setArgs] = useState('');
    const [url, setUrl] = useState('');
    const [envVars, setEnvVars] = useState<KvRow[]>([]);
    const [headers, setHeaders] = useState<KvRow[]>([]);

    const canAdd = name.trim().length > 0 && (transport === 'stdio' ? command.trim().length > 0 : url.trim().length > 0);

    const submit = () => {
        if (!canAdd) return;
        onAdd({
            id: `srv-${Date.now()}`,
            name: name.trim(),
            scope,
            transportType: transport,
            command: transport === 'stdio'
                ? [command.trim(), ...args.split('\n').map((a) => a.trim()).filter(Boolean)].join(' ')
                : url.trim(),
            tools: [],
            status: 'connected',
            enabled: true,
        });
    };

    const inputCls = 'w-full px-3 py-2 text-[13px] text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400';

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/30 animate-in fade-in duration-150" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[420px] max-h-[92%] bg-white rounded-xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                    <span className="text-[14px] font-semibold text-gray-900">Add MCP server</span>
                    <button onClick={onClose} className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={16} strokeWidth={2} /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Scope */}
                    <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-gray-600">Scope</label>
                        <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
                            {(['project', 'user'] as const).map((sc) => (
                                <button key={sc} onClick={() => setScope(sc)} className={`flex-1 px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all ${scope === sc ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                                    {sc}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-gray-400">{scope === 'project' ? "Saved to this project's .mcp.json and used only with this project." : 'Available across all your projects.'}</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-gray-600">Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-server" className={inputCls} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-gray-600">Transport</label>
                        <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
                            {(['stdio', 'http'] as const).map((tr) => (
                                <button key={tr} onClick={() => setTransport(tr)} className={`flex-1 px-3 py-1.5 rounded-md text-[12px] font-medium uppercase transition-all ${transport === tr ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                                    {tr}
                                </button>
                            ))}
                        </div>
                    </div>

                    {transport === 'stdio' ? (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-gray-600">Command</label>
                                <input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="e.g. npx, uvx, python" className={`${inputCls} font-mono placeholder:font-sans`} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-gray-600">Arguments</label>
                                <textarea value={args} onChange={(e) => setArgs(e.target.value)} rows={3} placeholder={'-y\nyour-mcp-package'} className={`${inputCls} font-mono resize-none placeholder:font-sans leading-relaxed`} />
                                <p className="text-[11px] text-gray-400">One argument per line. Empty lines are ignored.</p>
                            </div>
                            <KeyValueEditor label="Environment variables" rows={envVars} setRows={setEnvVars} keyPh="KEY" valuePh="value" addLabel="Add" />
                        </>
                    ) : (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium text-gray-600">Server URL</label>
                                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/mcp" className={`${inputCls} font-mono placeholder:font-sans`} />
                            </div>
                            <KeyValueEditor label="Headers" rows={headers} setRows={setHeaders} keyPh="Header" valuePh="value" addLabel="Add header" />
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 shrink-0">
                    <button onClick={onClose} className="px-4 py-1.5 text-[13px] text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors">Cancel</button>
                    <button onClick={submit} disabled={!canAdd} className={`px-4 py-1.5 text-[13px] rounded-md font-medium transition-colors ${canAdd ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-400 bg-gray-100 cursor-not-allowed'}`}>Add</button>
                </div>
            </div>
        </div>
    );
}

function AddSkillForm({ onBack, onAdd }: { onBack: () => void; onAdd: (s: Skill) => void }) {
    const [mode, setMode] = useState<'create' | 'import'>('create');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');

    const canAdd = mode === 'create'
        ? name.trim().length > 0 && instructions.trim().length > 0
        : name.trim().length > 0;

    const submit = () => {
        if (!canAdd) return;
        onAdd({
            id: `skill-${Date.now()}`,
            name: name.trim(),
            description: description.trim() || 'Custom skill',
            trigger: 'relevant to your request',
            source: 'Custom',
            enabled: true,
        });
    };

    return (
        <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
                <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={16} strokeWidth={1.5} />
                </button>
                <span className="text-[14px] font-semibold text-gray-900">Add Skill</span>
            </div>

            <div className="p-5 space-y-5 flex-1">
                <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
                    {(['create', 'import'] as const).map((m) => (
                        <button key={m} onClick={() => setMode(m)} className={`flex-1 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                            {m === 'create' ? 'Create new' : 'Import'}
                        </button>
                    ))}
                </div>

                {mode === 'create' ? (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-gray-600">Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Connector Scaffolding" className="w-full px-3 py-2 text-[13px] text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-gray-600">Description</label>
                            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One line on what this skill does" className="w-full px-3 py-2 text-[13px] text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-gray-600">Instructions</label>
                            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={6} placeholder="Describe how the copilot should behave when this skill is active…" className="w-full px-3 py-2 text-[13px] text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none placeholder:text-gray-400 leading-relaxed" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Download size={20} strokeWidth={1.5} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-[12.5px] text-gray-500">Drop a skill folder or <span className="text-blue-600 font-medium">.zip</span> here</p>
                            <p className="text-[11px] text-gray-400 mt-1">Must contain a SKILL.md file</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-gray-600">Skill name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Detected from SKILL.md" className="w-full px-3 py-2 text-[13px] text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400" />
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2 shrink-0">
                <button onClick={onBack} className="px-4 py-1.5 text-[13px] text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors">Cancel</button>
                <button onClick={submit} disabled={!canAdd} className={`px-4 py-1.5 text-[13px] rounded-md font-medium transition-colors ${canAdd ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-400 bg-gray-100 cursor-not-allowed'}`}>Add skill</button>
            </div>
        </div>
    );
}

