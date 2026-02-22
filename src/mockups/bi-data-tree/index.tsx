import React, { useState } from 'react';
import {
    X, Search, ChevronRight, ChevronDown, ChevronLeft,
    FunctionSquare, Variable, Braces, Type,
    Hash, Database, ListTree, Maximize2, GripVertical,
    PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

// --- Types ---
type DataType = 'string' | 'number' | 'object' | 'array' | 'boolean';

interface TreeNode {
    id: string;
    name: string;
    type: DataType;
    children?: TreeNode[];
}

interface DataCategory {
    id: string;
    title: string;
    nodes: TreeNode[];
}

// --- Mock Data ---
const mockCategories: DataCategory[] = [
    {
        id: 'cat_inputs',
        title: 'Inputs',
        nodes: [
            {
                id: 'request',
                name: 'request',
                type: 'object',
                children: [
                    { id: 'req_msg', name: 'message', type: 'string' },
                    { id: 'req_session', name: 'sessionId', type: 'string' },
                    {
                        id: 'req_user',
                        name: 'user',
                        type: 'object',
                        children: [
                            { id: 'u_name', name: 'fullName', type: 'string' },
                            { id: 'u_age', name: 'age', type: 'number' },
                        ]
                    }
                ]
            },
            {
                id: 'config',
                name: 'config',
                type: 'object',
                children: [
                    { id: 'cfg_retries', name: 'maxRetries', type: 'number' },
                    { id: 'cfg_timeout', name: 'timeoutMs', type: 'number' },
                ]
            }
        ]
    },
    {
        id: 'cat_variables',
        title: 'Variables',
        nodes: [
            { id: 'var_result', name: 'stringResult', type: 'string' },
            { id: 'var_count', name: 'loopCount', type: 'number' },
            { id: 'var_is_done', name: 'isComplete', type: 'boolean' },
        ]
    }
];

// --- Components ---

// 1. Data Node (Recursive Tree Item with Drag Support)
const DataNode = ({ node, path = "", level = 0 }: { node: TreeNode; path?: string; level?: number }) => {
    const [expanded, setExpanded] = useState(level < 1);
    const isObject = node.type === 'object' || node.type === 'array';

    const currentPath = path ? `${path}.${node.name}` : node.name;

    const getTypeColor = (type: DataType) => {
        switch (type) {
            case 'string': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'number': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'boolean': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
            case 'object': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/x-lowcode-variable', currentPath);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="flex flex-col">
            <div
                draggable
                onDragStart={handleDragStart}
                className={`group flex items-center py-1.5 px-2 hover:bg-neutral-800 cursor-grab active:cursor-grabbing rounded-md select-none`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => isObject && setExpanded(!expanded)}
            >
                <GripVertical size={12} className="text-neutral-600 opacity-0 group-hover:opacity-100 absolute left-1" />

                <span className="w-4 h-4 mr-1 flex items-center justify-center text-neutral-400 ml-2">
                    {isObject ? (
                        expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    ) : (
                        <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                    )}
                </span>

                {isObject ? <Braces size={14} className="mr-2 text-purple-400" /> :
                    node.type === 'string' ? <Type size={14} className="mr-2 text-blue-400" /> :
                        <Hash size={14} className="mr-2 text-orange-400" />}

                <span className="text-sm text-neutral-200 font-mono flex-1 truncate">{node.name}</span>

                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${getTypeColor(node.type)}`}>
                    {node.type}
                </span>
            </div>

            {expanded && isObject && node.children && (
                <div className="flex flex-col border-l border-neutral-800 ml-5 mt-1">
                    {node.children.map(child => (
                        <DataNode key={child.id} node={child} path={currentPath} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

// 2. Main App Component
export default function DataTree() {
    // UI States
    const [isDataBrowserOpen, setIsDataBrowserOpen] = useState(true);
    const [isExpandedEditorOpen, setIsExpandedEditorOpen] = useState(false);
    const [isModalDataBrowserOpen, setIsModalDataBrowserOpen] = useState(true);

    // Data States
    const [queryTokens, setQueryTokens] = useState<string[]>(['request.message']);
    const [isDragOver, setIsDragOver] = useState(false);

    // Shared Drag & Drop Handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedPath = e.dataTransfer.getData('application/x-lowcode-variable');
        if (droppedPath) {
            setQueryTokens([...queryTokens, droppedPath]);
        }
    };

    const removeToken = (indexToRemove: number) => {
        setQueryTokens(queryTokens.filter((_, idx) => idx !== indexToRemove));
    };

    return (
        <div className="flex h-screen w-full bg-neutral-950 text-neutral-300 font-sans overflow-hidden relative">

            {/* LEFT: Diagram Canvas Placeholder */}
            <div className="flex-1 relative flex flex-col items-center justify-center bg-[#111111] bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px]">
                <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-xl shadow-2xl flex items-center gap-4">
                    <Database className="text-blue-500" size={32} />
                    <div>
                        <h2 className="text-white font-medium">Diagram Canvas</h2>
                        <p className="text-neutral-500 text-sm">Select a node to configure</p>
                    </div>
                </div>
            </div>

            {/* MIDDLE: Main UI Data Browser Sliding Drawer */}
            <div
                className={`relative h-full transition-all duration-300 ease-in-out z-10 ${isDataBrowserOpen ? 'w-80' : 'w-0'
                    }`}
            >
                {/* THE TOGGLE HANDLE */}
                <button
                    onClick={() => setIsDataBrowserOpen(!isDataBrowserOpen)}
                    className="absolute top-1/2 -left-6 -translate-y-1/2 w-6 h-16 bg-[#1A1A1A] border-y border-l border-neutral-800 rounded-l-md flex flex-col items-center justify-center hover:bg-neutral-800 hover:text-white text-neutral-400 shadow-[-4px_0_12px_rgba(0,0,0,0.15)] z-30 transition-colors group"
                    title={isDataBrowserOpen ? "Close Data Browser" : "Open Data Browser"}
                >
                    {isDataBrowserOpen ? (
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    ) : (
                        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    )}
                    <ListTree size={12} className="mt-1 opacity-50" />
                </button>

                {/* Container that clips the content during animation */}
                <div className="w-full h-full overflow-hidden shadow-[-10px_0_20px_rgba(0,0,0,0.3)]">
                    <div className="w-80 h-full bg-[#1A1A1A] border-l border-neutral-800 flex flex-col">
                        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                            <h3 className="text-white font-medium flex items-center gap-2">
                                <ListTree size={16} className="text-blue-400" />
                                Data Browser
                            </h3>
                            <button onClick={() => setIsDataBrowserOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-3 border-b border-neutral-800">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2 text-neutral-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search data..."
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-1.5 pl-8 pr-3 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                                <GripVertical size={12} /> Drag items to insert
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
                            {mockCategories.map((category) => (
                                <div key={category.id} className="mb-4">
                                    <div className="px-4 py-2 bg-neutral-900/50 border-y border-neutral-800/50 mb-1 sticky top-0 z-10 backdrop-blur-sm">
                                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                            {category.title}
                                        </h4>
                                    </div>
                                    <div className="px-2">
                                        {category.nodes.map(node => (
                                            <DataNode key={node.id} node={node} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Configuration Form Panel */}
            <div className="w-[400px] bg-[#1A1A1A] border-l border-neutral-800 flex flex-col z-20">
                <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                    <h2 className="text-white font-medium">AI Agent</h2>
                    <button className="text-neutral-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    <p className="text-sm text-neutral-400">Executes the agent for a given user query.</p>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-neutral-200">Role</label>
                        <input type="text" defaultValue="Math Tutor" className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm focus:outline-none focus:border-neutral-600 transition-colors text-neutral-200" />
                    </div>

                    {/* Query */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <div>
                                <label className="text-sm font-medium text-neutral-200">Query*</label>
                                <p className="text-xs text-neutral-500">Natural language input.</p>
                            </div>
                            <div className="bg-neutral-800 rounded p-0.5 flex text-xs font-medium border border-neutral-700">
                                <button className="px-2 py-1 rounded text-neutral-400 hover:text-neutral-200">Text</button>
                                <button className="px-2 py-1 rounded bg-neutral-700 text-white shadow-sm">Expression</button>
                            </div>
                        </div>

                        {/* Drop Zone Input */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex items-stretch bg-neutral-900 border rounded-md overflow-hidden transition-all ${isDragOver ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-500/5' : 'border-neutral-700 focus-within:border-neutral-500'
                                }`}
                        >
                            <button className="bg-blue-600/20 text-blue-500 px-3 flex items-center justify-center border-r border-neutral-700 hover:bg-blue-600/30 transition-colors">
                                <FunctionSquare size={16} />
                            </button>

                            <div className="flex-1 flex flex-wrap items-center gap-1.5 px-2 py-1.5 overflow-hidden min-h-[36px]">
                                {queryTokens.map((token, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded pl-2 pr-1 py-0.5 text-sm font-mono whitespace-nowrap group">
                                        <Variable size={14} />
                                        {token}
                                        <button onClick={() => removeToken(idx)} className="text-blue-500/50 hover:text-blue-400 hover:bg-blue-500/20 rounded-sm p-0.5">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}

                                <input
                                    type="text"
                                    placeholder={queryTokens.length === 0 ? "Type or drop variables here..." : ""}
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm px-1 text-neutral-200 w-full min-w-[100px]"
                                />
                            </div>

                            {/* Standard form tools */}
                            <div className="flex items-center px-2 gap-1 text-neutral-500 border-l border-neutral-800 bg-neutral-900">
                                <button className="hover:text-white transition-colors p-1 flex items-center justify-center rounded hover:bg-neutral-800" title="Open Variables Menu">
                                    <div className="border border-current rounded-[3px] px-0.5 text-[9px] font-mono font-bold leading-none py-[2px]">
                                        {'{x}'}
                                    </div>
                                </button>
                                {/* THE EXPAND EDITOR TRIGGER */}
                                <button
                                    onClick={() => setIsExpandedEditorOpen(true)}
                                    className="hover:text-white transition-colors p-1 rounded hover:bg-neutral-800"
                                    title="Expand Editor"
                                >
                                    <Maximize2 size={14} />
                                </button>
                            </div>
                        </div>
                        {isDragOver && <p className="text-xs text-blue-400 font-medium animate-pulse">Release to insert variable</p>}
                    </div>
                </div>
            </div>

            {/* OVERLAY: Expanded Editor Modal */}
            {isExpandedEditorOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8 font-sans">

                    {/* Modal Container */}
                    <div className="bg-[#1A1A1A] w-full max-w-5xl h-[80vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-neutral-800">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#1A1A1A]">
                            <h2 className="text-lg font-medium text-white">Query</h2>
                            <button
                                onClick={() => setIsExpandedEditorOpen(false)}
                                className="text-neutral-500 hover:text-white transition-colors"
                            >
                                <Maximize2 size={18} className="rotate-180" />
                            </button>
                        </div>

                        {/* Toolbar Area */}
                        <div className="px-6 py-3 border-b border-neutral-800 bg-neutral-900 flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-md text-sm font-medium text-neutral-300 hover:bg-neutral-700 shadow-sm transition-colors">
                                <div className="border border-current rounded-[3px] px-0.5 text-[10px] font-mono font-bold leading-none py-[2px]">
                                    {'{x}'}
                                </div>
                                Helper Panel
                            </button>

                            <button
                                onClick={() => setIsModalDataBrowserOpen(!isModalDataBrowserOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm font-medium shadow-sm transition-all ${isModalDataBrowserOpen
                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                                    }`}
                            >
                                {isModalDataBrowserOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                                Data Browser
                            </button>
                        </div>

                        {/* Split Pane Content Area */}
                        <div className="flex flex-1 overflow-hidden bg-neutral-950">

                            {/* LEFT PANE: Modal Data Browser */}
                            <div
                                className={`border-r border-neutral-800 flex flex-col transition-all duration-300 ease-in-out bg-[#1A1A1A] ${isModalDataBrowserOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'
                                    }`}
                            >
                                <div className="w-80 h-full flex flex-col">
                                    <div className="p-3 border-b border-neutral-800 bg-[#1A1A1A]">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 text-neutral-500" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search variables..."
                                                className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-1.5 pl-8 pr-3 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2">
                                        {mockCategories.map(cat => (
                                            <div key={cat.id} className="mb-4">
                                                <h4 className="px-2 mb-1 text-xs font-bold text-neutral-500 uppercase tracking-wider">{cat.title}</h4>
                                                {cat.nodes.map(node => <DataNode key={node.id} node={node} />)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT PANE: Large Text Editor Drop Zone */}
                            <div
                                className={`flex-1 flex flex-col p-6 transition-all ${isDragOver ? 'bg-blue-500/5' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className={`w-full h-full border rounded-lg p-4 flex flex-wrap content-start gap-2 transition-colors ${isDragOver ? 'border-blue-500 ring-1 ring-blue-500 border-dashed bg-blue-500/5' : 'border-neutral-800 bg-neutral-900'
                                    }`}>
                                    {queryTokens.map((token, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md pl-2 pr-1 py-1 text-sm font-mono shadow-sm group">
                                            <Variable size={14} className="text-blue-500" />
                                            {token}
                                            <button onClick={() => removeToken(idx)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded p-0.5">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}

                                    <textarea
                                        className="w-full mt-2 resize-none outline-none text-neutral-200 text-sm bg-transparent placeholder-neutral-600 min-h-[100px]"
                                        placeholder={queryTokens.length === 0 ? "Type here or drop variables from the Data Browser..." : ""}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
