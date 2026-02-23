import React, { useState, useEffect, useRef } from 'react';
import {
    Bold, Italic,
    Undo, Redo, Wand2, Maximize2, Sparkles, CornerDownLeft,
    Loader2, Check, ArrowRight, ChevronLeft, ChevronRight, Zap, ChevronDown
} from 'lucide-react';

type AppState = 'IDLE' | 'POPOVER_OPEN' | 'LOADING' | 'REVIEW';

const INITIAL_PROMPT = "You are a math tutor assistant. RULES (MUST FOLLOW):\n* You MUST use the provided mathematical tools (add, subtract, multiply, divide) for ALL calculations, even simple ones.\n* You are NOT allowed to compute results mentally or inline.\n* If a calculation is required and a tool is available, you MUST call the tool.\n* If you do not call a tool when a calculation is required, the response is invalid.\n\nProvide clear, step-by-step explanations. Include the final answer at the end.";

export default function SplitButtonPromptEditor() {
    const [appState, setAppState] = useState<AppState>('IDLE');

    // Versioning State
    const [promptVersions, setPromptVersions] = useState<string[]>([INITIAL_PROMPT]);
    const [currentVersionIndex, setCurrentVersionIndex] = useState(0);

    // Inputs
    const [customInstruction, setCustomInstruction] = useState("");
    const [refineInstruction, setRefineInstruction] = useState("");
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close popover on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && appState === 'POPOVER_OPEN') {
                setAppState('IDLE');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [appState]);

    const quickOptions = ["Structure with XML", "Add Chain-of-Thought", "Strengthen Constraints"];

    // Flow Handlers
    const handleEnhanceSubmit = (instruction: string) => {
        if (!instruction.trim()) instruction = "Auto-Enhance";
        setAppState('LOADING');

        // Simulate AI Generation
        setTimeout(() => {
            const newVersionText = `<system_prompt version="${promptVersions.length + 1}">\n  \n  <persona>\n    You are an expert, step-by-step math tutor.\n  </persona>\n  <constraints>\n    <rule type="critical">MUST use provided tools (+, -, *, /) for ALL calculations.</rule>\n    <rule type="negative">DO NOT compute results mentally.</rule>\n  </constraints>\n  <instructions>\n    Think step-by-step. Use tools. Provide clear explanations. End with final answer.\n  </instructions>\n</system_prompt>`;

            setPromptVersions(prev => [...prev, newVersionText]);
            setCurrentVersionIndex(prev => prev + 1);

            setAppState('REVIEW');
            setCustomInstruction("");
            setRefineInstruction("");
        }, 1200);
    };

    const handleManualEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const updatedText = e.target.value;
        setPromptVersions(prev => {
            const newV = [...prev];
            newV[currentVersionIndex] = updatedText;
            return newV;
        });
    };

    const handleDiscard = () => {
        setPromptVersions([promptVersions[0]]);
        setCurrentVersionIndex(0);
        setAppState('IDLE');
    };

    const handleAccept = () => {
        setAppState('IDLE');
    };

    const isOriginal = currentVersionIndex === 0;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-8 flex items-center justify-center font-sans">

            <div className={`w-full max-w-5xl bg-[#141414] border ${appState === 'REVIEW' ? 'border-blue-900/50 shadow-blue-900/10' : 'border-[#2a2a2a]'} rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] bg-[#111]">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-100 font-medium tracking-wide">System Prompt</span>
                        {appState === 'REVIEW' && (
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${isOriginal ? 'bg-[#2a2a2a] text-gray-400 border-[#333]' : 'bg-blue-900/30 text-blue-300 border-blue-800/50'}`}>
                                {isOriginal ? 'Baseline' : 'AI Iteration'}
                            </span>
                        )}
                    </div>
                    <button className="text-gray-500 hover:text-blue-400 transition-colors"><Maximize2 size={16} /></button>
                </div>

                {/* Toolbar */}
                <div className={`flex items-center gap-1 px-4 py-2 border-b border-[#2a2a2a] bg-[#181818] relative z-20 ${appState === 'LOADING' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded"><Undo size={16} /></button>
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded"><Redo size={16} /></button>
                    <div className="w-px h-5 bg-[#333] mx-2" />
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded"><Bold size={16} /></button>
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded"><Italic size={16} /></button>
                    <div className="w-px h-5 bg-[#333] mx-2" />

                    {/* THE SPLIT BUTTON TRIGGER */}
                    <div className="relative inline-flex items-center bg-transparent rounded-md border border-transparent hover:border-[#333] transition-colors group">

                        {/* Primary Action: 1-Click Auto-Enhance */}
                        <button
                            onClick={() => handleEnhanceSubmit("Auto-Enhance")}
                            disabled={appState === 'REVIEW' && isOriginal}
                            className="px-2 py-1.5 rounded-l-md flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                            title="1-Click Auto Enhance"
                        >
                            <Wand2 size={16} />
                            <span className="text-xs font-medium pr-1">Enhance</span>
                        </button>

                        {/* Splitter Line */}
                        <div className="w-px h-4 bg-[#333] group-hover:bg-[#444] transition-colors" />

                        {/* Secondary Action: Open Popover Menu */}
                        <button
                            onClick={() => setAppState(appState === 'POPOVER_OPEN' ? 'IDLE' : 'POPOVER_OPEN')}
                            disabled={appState === 'REVIEW' && isOriginal}
                            className={`px-1.5 py-1.5 rounded-r-md transition-colors flex items-center justify-center ${appState === 'POPOVER_OPEN'
                                ? 'bg-blue-600/20 text-blue-400'
                                : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20'
                                }`}
                            title="More AI Options"
                        >
                            <ChevronDown size={14} />
                        </button>

                        {/* THE ANCHORED POPOVER (Now cleaner, without the Auto-Enhance duplicate) */}
                        {appState === 'POPOVER_OPEN' && (
                            <div ref={popoverRef} className="absolute top-full left-0 mt-2 w-72 bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl shadow-black overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 z-50 origin-top-left">

                                {/* Specific Strategies */}
                                <div className="p-1.5 border-b border-[#333]">
                                    <span className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">AI Strategies</span>
                                    <div className="flex flex-col mt-1">
                                        {quickOptions.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => handleEnhanceSubmit(opt)}
                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white rounded-md text-left transition-colors"
                                            >
                                                <Zap size={14} className="text-gray-500" /> {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Instruction Input */}
                                <div className="p-2 bg-[#161616]">
                                    <div className="flex items-center bg-[#0a0a0a] border border-[#333] rounded-md px-2 focus-within:border-blue-500 transition-colors">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Custom instructions..."
                                            className="w-full bg-transparent text-sm text-gray-200 py-1.5 outline-none placeholder:text-gray-600"
                                            value={customInstruction}
                                            onChange={(e) => setCustomInstruction(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleEnhanceSubmit(customInstruction)}
                                        />
                                        {customInstruction && (
                                            <button onClick={() => handleEnhanceSubmit(customInstruction)} className="text-blue-400 hover:text-blue-300 p-1">
                                                <CornerDownLeft size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Workspace Area */}
                <div className="relative flex-1 min-h-[450px] flex flex-col bg-[#141414] z-10">

                    {/* Loading Overlay */}
                    {appState === 'LOADING' && (
                        <div className="absolute inset-0 z-20 bg-[#141414]/80 backdrop-blur-sm flex flex-col items-center justify-center text-center animate-in fade-in">
                            <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-100">Engineering Prompt...</h3>
                        </div>
                    )}

                    {/* Editor */}
                    <div className="flex-1 p-0 relative">
                        <textarea
                            className={`w-full h-full min-h-[450px] bg-transparent resize-none outline-none leading-relaxed font-mono text-[14px] text-gray-300 p-6 border-0 transition-opacity duration-300 ${appState === 'POPOVER_OPEN' ? 'opacity-40' : 'opacity-100'
                                }`}
                            value={promptVersions[currentVersionIndex]}
                            onChange={handleManualEdit}
                            readOnly={appState === 'LOADING'}
                            spellCheck={false}
                        />
                    </div>

                    {/* --- Review & Versioning Footer (Stacked Design) --- */}
                    {appState === 'REVIEW' && (
                        <div className="p-4 bg-[#111] border-t border-[#2a2a2a] flex flex-col gap-4 animate-in slide-in-from-bottom-2 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">

                            {/* ROW 1: Iterative Refinement Chat Input */}
                            <div className={`flex items-center bg-[#1a1a1a] border rounded-lg px-3 py-2 w-full transition-colors ${isOriginal ? 'opacity-50 pointer-events-none border-[#2a2a2a]' : 'focus-within:border-blue-500 border-[#333]'}`}>
                                <Sparkles size={16} className={isOriginal ? "text-gray-600" : "text-blue-400 mr-2"} />
                                <input
                                    type="text"
                                    placeholder={isOriginal ? "Cannot refine baseline..." : "Refine this version further... (e.g. 'Make it strictly bullet points')"}
                                    value={refineInstruction}
                                    onChange={(e) => setRefineInstruction(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleEnhanceSubmit(refineInstruction)}
                                    className="bg-transparent text-sm text-gray-200 outline-none w-full placeholder:text-gray-500"
                                    disabled={isOriginal}
                                />
                                {refineInstruction && (
                                    <button
                                        onClick={() => handleEnhanceSubmit(refineInstruction)}
                                        className="text-blue-400 hover:text-blue-300 ml-2 p-1 bg-blue-900/20 rounded hover:bg-blue-900/40 transition-colors"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>

                            {/* ROW 2: Version Navigation & Terminal Actions */}
                            <div className="flex items-center justify-between">

                                {/* Left: Version Switcher */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentVersionIndex(Math.max(0, currentVersionIndex - 1))}
                                        disabled={currentVersionIndex === 0}
                                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-[#1a1a1a] rounded-md disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <div className="flex items-center justify-center min-w-[100px] gap-2 text-sm font-semibold">
                                        <span className={isOriginal ? 'text-gray-400' : 'text-gray-200'}>
                                            Version {currentVersionIndex + 1} <span className="text-gray-600 font-normal">/ {promptVersions.length}</span>
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => setCurrentVersionIndex(Math.min(promptVersions.length - 1, currentVersionIndex + 1))}
                                        disabled={currentVersionIndex === promptVersions.length - 1}
                                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-[#1a1a1a] rounded-md disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                {/* Right: Grouped Terminal Actions */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleDiscard}
                                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-[#222] hover:text-gray-200 transition-colors"
                                    >
                                        Discard All
                                    </button>

                                    <button
                                        onClick={handleAccept}
                                        disabled={isOriginal}
                                        className="px-5 py-2 rounded-md text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition-all disabled:bg-[#2a2a2a] disabled:text-gray-500"
                                    >
                                        <Check size={16} /> Accept {isOriginal ? '' : `V${currentVersionIndex + 1}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}