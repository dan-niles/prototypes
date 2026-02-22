import { useState } from 'react';
import {
    ArrowLeft,
    Undo,
    Redo,
    Settings,
    Maximize,
    Plus,
    Minus,
    ChevronDown,
    ChevronUp,
    CornerDownLeft,
    MoreVertical,
    Beaker
} from 'lucide-react';

const LowCodeCanvas = () => {
    const [isParamsExpanded, setIsParamsExpanded] = useState(true);

    // Changed to state so we can dynamically add/remove them
    const [parameters, setParameters] = useState([
        { type: 'int', name: 'num1' },
        { type: 'int', name: 'num2' },
    ]);

    // Helper functions for the live-testing toggle
    const addParameter = () => {
        const types = ['int', 'string', 'boolean', 'float', 'any'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        setParameters([
            ...parameters,
            { type: randomType, name: `param${parameters.length + 1}` }
        ]);
    };

    const removeParameter = () => {
        if (parameters.length > 0) {
            setParameters(parameters.slice(0, -1));
        }
    };

    return (
        <div className="flex flex-col h-screen w-full font-sans text-gray-800 bg-white">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white z-10">
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
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-md transition-colors">
                        <Settings size={16} />
                        Configure
                    </button>
                </div>
            </header>

            {/* Canvas Area */}
            <main className="flex-1 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px]">

                {/* 1. Top-Left: The Parameter Box */}
                <div className="absolute top-6 left-6 w-64 bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden z-10 transition-all duration-200">
                    <button
                        onClick={() => setIsParamsExpanded(!isParamsExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <span className="font-medium text-sm text-gray-700">Input Parameters ({parameters.length})</span>
                        {isParamsExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                    </button>

                    {/* Scrollable area with max-height limits the impact of 10+ params */}
                    {isParamsExpanded && parameters.length > 0 && (
                        <div className="max-h-48 overflow-y-auto p-4 flex flex-col gap-2 border-t border-gray-200">
                            {parameters.map((param, idx) => (
                                <div key={idx} className="flex items-center gap-2 font-mono text-sm">
                                    <span className="text-blue-600 font-medium">{param.type}</span>
                                    <span className="text-gray-800">{param.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {isParamsExpanded && parameters.length === 0 && (
                        <div className="p-4 text-sm text-gray-500 italic border-t border-gray-200">
                            No parameters defined. Click 'Configure' to add parameters.
                        </div>
                    )}
                </div>

                {/* 2. Top-Right: View Toggles */}
                <div className="absolute top-6 right-6 flex bg-gray-50 border border-gray-200 rounded-lg p-1 z-10 shadow-sm">
                    <button className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-white shadow-sm rounded-md">
                        Flow
                    </button>
                    <button className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md">
                        Sequence
                    </button>
                </div>

                {/* 3. Bottom-Left: Zoom Controls */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-10">
                    <button className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600">
                        <Maximize size={18} />
                    </button>
                    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden text-gray-600">
                        <button className="p-2 hover:bg-gray-50 border-b border-gray-200"><Plus size={18} /></button>
                        <button className="p-2 hover:bg-gray-50"><Minus size={18} /></button>
                    </div>
                </div>

                {/* NEW: Bottom-Right: Live Tester Controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10 bg-white border border-blue-200 rounded-lg shadow-md overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider">
                        <Beaker size={14} />
                        Test Params UI
                    </div>
                    <div className="flex items-center justify-between p-2 gap-4">
                        <span className="text-sm font-medium text-gray-600 ml-2">Count: {parameters.length}</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={removeParameter}
                                disabled={parameters.length === 0}
                                className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove Parameter"
                            >
                                <Minus size={16} />
                            </button>
                            <button
                                onClick={addParameter}
                                className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
                                title="Add Parameter"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Center: The Flow Nodes */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="px-8 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-800">
                        Start
                    </div>
                    <svg width="2" height="60" className="my-1" overflow="visible">
                        <line x1="1" y1="0" x2="1" y2="54" stroke="#2563eb" strokeWidth="2" />
                        <polygon points="1,60 -3,52 5,52" fill="#2563eb" />
                    </svg>
                    <div className="w-72 bg-white border border-gray-300 rounded-xl shadow-sm p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CornerDownLeft size={20} className="text-blue-600" />
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-900 text-sm">Return</span>
                                <span className="font-mono text-xs text-gray-500 mt-1">num1 * num2</span>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default LowCodeCanvas;
