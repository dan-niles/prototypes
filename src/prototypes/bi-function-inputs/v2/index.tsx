import { useState } from 'react';
import {
    ArrowLeft,
    Undo,
    Redo,
    Settings,
    Maximize,
    Plus,
    Minus,
    CornerDownLeft,
    MoreVertical,
    X,
    FunctionSquare,
    Info
} from 'lucide-react';

const LowCodeCanvasSidebarView = () => {
    // State to manage sidebar visibility and which node is selected
    const [activeSidebar, setActiveSidebar] = useState<'start' | 'return' | null>(null);
    // State to manage the visibility of the helpful hint
    const [showHint, setShowHint] = useState(true);

    // Mock data for the view-only parameters
    const parameters = [
        { type: 'int', name: 'num1' },
        { type: 'int', name: 'num2' },
        { type: 'string', name: 'mode' },
        { type: 'boolean', name: 'debug' }
    ];

    // Logic to generate the summarized subtitle for the Start node
    const getParameterSummary = () => {
        if (parameters.length === 0) return "No inputs";
        if (parameters.length <= 2) {
            return parameters.map(p => `${p.name}`).join(', ');
        }
        const firstTwo = parameters.slice(0, 2).map(p => p.name).join(', ');
        const remaining = parameters.length - 2;
        return `${firstTwo}, +${remaining} more`;
    };

    return (
        <div className="flex h-screen w-full font-sans text-gray-800 bg-white overflow-hidden">

            {/* Main Canvas Container */}
            <div className={`flex flex-col transition-all duration-300 ${activeSidebar ? 'w-[calc(100%-400px)]' : 'w-full'}`}>

                {/* --- Top Navigation Bar (V1 Style) --- */}
                <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white z-20">
                    <div className="flex items-center gap-4">
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-lg font-semibold text-gray-900">Function</h1>
                            <span className="text-sm font-mono text-gray-600">multiply</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <button className="p-1 hover:bg-gray-100 rounded hover:text-gray-600"><Undo size={18} /></button>
                            <button className="p-1 hover:bg-gray-100 rounded hover:text-gray-600"><Redo size={18} /></button>
                        </div>
                        {/* Configure button added back to match V1 top nav */}
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-md transition-colors">
                            <Settings size={16} />
                            Configure
                        </button>
                    </div>
                </header>

                {/* --- Canvas Area (V1 Style Background) --- */}
                <main className="flex-1 relative overflow-hidden bg-white bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px]">

                    {/* View Toggles (Added back from V1) */}
                    <div className="absolute top-6 right-6 flex bg-gray-50 border border-gray-200 rounded-lg p-1 z-10 shadow-sm">
                        <button className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-white shadow-sm rounded-md">
                            Flow
                        </button>
                        <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md">
                            Sequence
                        </button>
                    </div>

                    {/* Bottom-Left Zoom Controls */}
                    <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-20">
                        <button className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600"><Maximize size={18} /></button>
                        <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden text-gray-600">
                            <button className="p-2 hover:bg-gray-50 border-b border-gray-200"><Plus size={18} /></button>
                            <button className="p-2 hover:bg-gray-50"><Minus size={18} /></button>
                        </div>
                    </div>

                    {/* New: Bottom-Right Hint Message */}
                    {showHint && !activeSidebar && (
                        <div className="absolute bottom-6 right-6 flex items-start gap-3 p-4 bg-white border border-blue-200 rounded-lg shadow-md max-w-xs z-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mt-0.5 text-blue-500">
                                <Info size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700">
                                    Click on the <strong>Start</strong> node to view all input parameters in the sidebar.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowHint(false)}
                                className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* ================= FLOW NODES (V1 Style) ================= */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">

                        {/* --- START NODE --- */}
                        <button
                            onClick={() => {
                                setActiveSidebar('start');
                                setShowHint(false); // Optionally hide the hint automatically once they click a node
                            }}
                            className={`group relative flex flex-col items-center justify-center px-8 py-2 bg-white border rounded-full shadow-sm transition-all duration-200 min-w-[120px] ${activeSidebar === 'start' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-blue-400 hover:shadow-md'}`}
                        >
                            <span className="text-sm font-medium text-gray-800">Start</span>
                            {/* Summarized input params */}
                            <span className="text-xs font-mono text-blue-600 mt-0.5">
                                {getParameterSummary()}
                            </span>
                        </button>

                        {/* Connecting Arrow */}
                        <svg width="2" height="50" className="my-1" overflow="visible">
                            <line x1="1" y1="0" x2="1" y2="44" stroke="#2563eb" strokeWidth="2" />
                            <polygon points="1,50 -3,42 5,42" fill="#2563eb" />
                        </svg>

                        {/* --- RETURN NODE --- */}
                        <button
                            onClick={() => {
                                setActiveSidebar('return');
                                setShowHint(false);
                            }}
                            className={`w-72 bg-white border rounded-xl shadow-sm p-4 flex items-center justify-between text-left transition-all duration-200 ${activeSidebar === 'return' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-blue-400 hover:shadow-md'}`}
                        >
                            <div className="flex items-center gap-4">
                                <CornerDownLeft size={20} className="text-blue-600" />
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 text-sm">Return</span>
                                    <span className="font-mono text-xs text-gray-500 mt-1">num1 * num2</span>
                                </div>
                            </div>
                            <MoreVertical size={16} className="text-gray-400" />
                        </button>

                    </div>
                </main>
            </div>

            {/* ================= RIGHT SIDEBAR ================= */}
            <aside
                className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l border-gray-200 shadow-2xl z-30 flex flex-col transition-transform duration-300 ease-in-out ${activeSidebar ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-base font-medium text-gray-900">
                        {activeSidebar === 'start' ? 'Start Configuration' : 'Return Configuration'}
                    </h2>
                    <button onClick={() => setActiveSidebar(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                {/* Sidebar Body */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

                    {/* START NODE SIDEBAR CONTENT */}
                    {activeSidebar === 'start' && (
                        <>
                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-md text-sm text-gray-700 leading-relaxed">
                                This node marks the beginning of the execution flow. Input parameters required by this function are listed below.
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center justify-between">
                                    <span>Input Parameters ({parameters.length})</span>
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {parameters.map((param, idx) => (
                                        <div key={idx} className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-md bg-white shadow-sm">
                                            <span className="text-blue-600 font-mono text-xs font-semibold bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                {param.type}
                                            </span>
                                            <span className="text-gray-900 font-mono text-sm">
                                                {param.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* RETURN NODE SIDEBAR CONTENT */}
                    {activeSidebar === 'return' && (
                        <>
                            <div>
                                <h3 className="text-sm font-medium text-gray-800 mb-2">Value of 'num1 * num2'</h3>
                                <div className="bg-gray-50 border border-gray-200 p-4 rounded-md text-sm text-gray-600 leading-relaxed">
                                    This operation has no required parameters. Optional settings can be configured below.
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-800 mb-1">Expression</h3>
                                <p className="text-xs text-gray-500 mb-2">Return value.</p>

                                <div className="flex items-stretch border border-gray-300 rounded-md overflow-hidden bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                                    <div className="bg-gray-100 px-3 py-2 flex items-center justify-center text-gray-500 border-r border-gray-300">
                                        <FunctionSquare size={16} />
                                    </div>
                                    <div className="flex-1 flex items-center px-3 py-2 gap-2 text-sm">
                                        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                                            <span className="text-blue-400 font-mono text-xs">{'{x}'}</span> num1
                                        </span>
                                        <span className="text-gray-500">*</span>
                                        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                                            <span className="text-blue-400 font-mono text-xs">{'{x}'}</span> num2
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 border-l border-gray-200 text-gray-400">
                                        <button className="hover:text-gray-600"><Settings size={14} /></button>
                                        <button className="hover:text-gray-600"><Maximize size={14} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                                    Save Configuration
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </aside>

        </div>
    );
};

export default LowCodeCanvasSidebarView;
