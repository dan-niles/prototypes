import type { SpanData } from './TraceTree';
import { Copy, Search, ChevronDown, ChevronRight, MessageSquare, Settings, Wrench, ArrowDownToLine, ArrowUpFromLine, Bot } from 'lucide-react';
import { useState } from 'react';

interface SpanDetailProps {
  spanData: SpanData;
  spanName?: string;
  spanType?: string;
}

export function SpanDetail({ spanData, spanName, spanType }: SpanDetailProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [showOutput, setShowOutput] = useState(true);
  const [inputViewMode, setInputViewMode] = useState<'list' | 'raw'>('list');
  const [outputViewMode, setOutputViewMode] = useState<'list' | 'raw'>('list');
  const [inputToolsViewMode, setInputToolsViewMode] = useState<'list' | 'raw'>('list');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fix invalid JSON escape sequences
  const fixJSONEscapes = (str: string): string => {
    // Replace invalid escape sequences with properly escaped versions
    // Valid JSON escapes: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
    // We need to escape backslashes that aren't followed by valid escape characters
    return str.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
  };

  const isJSON = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;

    const trimmed = str.trim();
    // Only consider it JSON if it starts with { or [
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return false;
    }

    try {
      JSON.parse(fixJSONEscapes(str));
      return true;
    } catch (e) {
      console.log('JSON parse failed for:', str?.substring(0, 100), e);
      return false;
    }
  };

  const formatJSON = (str: string): string => {
    try {
      return JSON.stringify(JSON.parse(fixJSONEscapes(str)), null, 4);
    } catch {
      return str;
    }
  };

  // Recursively format JSON strings within an object
  const deepFormatJSON = (obj: any): any => {
    if (typeof obj === 'string') {
      // Try to parse and format if it's a JSON string (starts with { or [)
      const trimmed = obj.trim();
      if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && isJSON(obj)) {
        try {
          return deepFormatJSON(JSON.parse(fixJSONEscapes(obj)));
        } catch {
          return obj;
        }
      }
      return obj;
    } else if (Array.isArray(obj)) {
      return obj.map(item => deepFormatJSON(item));
    } else if (obj !== null && typeof obj === 'object') {
      const formatted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        formatted[key] = deepFormatJSON(value);
      }
      return formatted;
    }
    return obj;
  };

  const formatJSONDeep = (str: string): string => {
    try {
      const parsed = JSON.parse(fixJSONEscapes(str));
      const deepFormatted = deepFormatJSON(parsed);
      return JSON.stringify(deepFormatted, null, 4);
    } catch (e) {
      console.error('Error formatting JSON:', e, 'Input:', str?.substring(0, 100));
      return str;
    }
  };

  // Extract key information for user-friendly display
  const getModelInfo = () => {
    const model = spanData.attributes.find(a => a.key === 'gen_ai.response.model')?.value;
    const provider = spanData.attributes.find(a => a.key === 'gen_ai.provider.name')?.value;
    const temperature = spanData.attributes.find(a => a.key === 'gen_ai.request.temperature')?.value;
    const inputTokens = parseInt(spanData.attributes.find(a => a.key === 'gen_ai.usage.input_tokens')?.value || '0');
    const outputTokens = parseInt(spanData.attributes.find(a => a.key === 'gen_ai.usage.output_tokens')?.value || '0');
    const tokens = inputTokens + outputTokens > 0 ? (inputTokens + outputTokens).toString() : undefined;

    return { model, provider, temperature, tokens };
  };

  const getToolInfo = () => {
    const toolName = spanData.attributes.find(a => a.key === 'tool.name')?.value;
    return toolName;
  };

  const getInputOutput = () => {
    const input = spanData.attributes.find(a =>
      a.key === 'gen_ai.input.messages' || a.key === 'gen_ai.tool.arguments'
    );
    const output = spanData.attributes.find(a =>
      a.key === 'gen_ai.output.messages' || a.key === 'gen_ai.tool.output'
    );
    const systemInstructions = spanData.attributes.find(a => a.key === 'gen_ai.system_instructions');
    const tools = spanData.attributes.find(a => a.key === 'gen_ai.input_tools');
    const inputTools = spanData.attributes.find(a => a.key === 'gen_ai.input.tools');
    const errorMessage = spanData.attributes.find(a => a.key === 'error.message');

    return { input, output, systemInstructions, tools, inputTools, errorMessage };
  };

  const getOperationName = () => {
    return spanData.attributes.find(a => a.key === 'gen_ai.operation.name')?.value;
  };

  const modelInfo = getModelInfo();
  const toolName = getToolInfo();
  const { input, output, systemInstructions, tools, inputTools, errorMessage } = getInputOutput();
  const operationName = getOperationName();

  // Calculate latency
  const getLatency = () => {
    if (!spanData.endTime) return null;
    const start = new Date(spanData.startTime).getTime();
    const end = new Date(spanData.endTime).getTime();
    const latencyMs = end - start;
    return latencyMs >= 1000 ? `${(latencyMs / 1000).toFixed(2)}s` : `${latencyMs.toFixed(0)}ms`;
  };

  const latency = getLatency();

  const advancedAttributes = spanData.attributes.filter(attr => {
    const excludeKeys = [
      'gen_ai.input.messages', 'gen_ai.output.messages', 'gen_ai.tool.arguments', 'gen_ai.tool.output',
      'gen_ai.system_instructions', 'gen_ai.input_tools', 'gen_ai.input.tools', 'error.message'
    ];
    return !excludeKeys.includes(attr.key);
  });

  const filterAttributes = (attrs: Array<{ key: string; value: string }>) => {
    if (!searchQuery) return attrs;
    return attrs.filter(
      attr =>
        attr.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attr.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200">{part}</mark>
      ) : (
        part
      )
    );
  };

  const matchesSearch = (text: string): boolean => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const jsonContainsSearch = (jsonString: string): boolean => {
    if (!searchQuery) return true;
    return jsonString.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Inline copy button for tree nodes
  const NodeCopyButton = ({ text, itemKey }: { text: string; itemKey: string }) => {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          copyToClipboard(text, itemKey);
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-0.5 transition-opacity"
        title="Copy"
      >
        {copiedKey === itemKey ? (
          <span className="text-green-600 text-xs">✓</span>
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    );
  };

  // Collapsible JSON Tree Component
  const CollapsibleJsonTree = ({ data, depth = 0, maxAutoExpandDepth = 2 }: { data: any; depth?: number; maxAutoExpandDepth?: number }) => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
      // Auto-expand items up to maxAutoExpandDepth
      const initialExpanded = new Set<string>();

      const autoExpand = (obj: any, currentDepth: number, pathPrefix: string) => {
        if (currentDepth >= maxAutoExpandDepth) return;

        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            const path = `${pathPrefix}-${index}`;
            if (typeof item === 'object' && item !== null) {
              initialExpanded.add(path);
              autoExpand(item, currentDepth + 1, path);
            }
          });
        } else if (obj !== null && typeof obj === 'object') {
          Object.entries(obj).forEach(([key, val]) => {
            const path = `${pathPrefix}-${key}`;
            if (typeof val === 'object' && val !== null) {
              initialExpanded.add(path);
              autoExpand(val, currentDepth + 1, path);
            }
          });
        }
      };

      autoExpand(data, depth, String(depth));
      return initialExpanded;
    });

    const toggleKey = (key: string) => {
      const newExpanded = new Set(expandedKeys);
      if (newExpanded.has(key)) {
        newExpanded.delete(key);
      } else {
        newExpanded.add(key);
      }
      setExpandedKeys(newExpanded);
    };

    const renderValue = (val: any, key: string, path: string, isArrayIndex = false): React.ReactNode => {
      const isExpanded = expandedKeys.has(path);
      const keyClassName = isArrayIndex
        ? "text-xs font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded"
        : "text-xs font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded";

      // Handle arrays
      if (Array.isArray(val)) {
        return (
          <div className="py-0.5">
            <div className="flex items-center gap-1 group">
              <button
                onClick={() => toggleKey(path)}
                className="flex items-center gap-1 hover:bg-gray-100 rounded px-1 -ml-1 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
                <span className={keyClassName}>
                  {highlightText(key)}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  [{val.length} {val.length === 1 ? 'item' : 'items'}]
                </span>
              </button>
              <NodeCopyButton text={JSON.stringify(val, null, 2)} itemKey={`copy-${path}`} />
            </div>
            {isExpanded && (
              <div className="ml-4 mt-1 border-l-2 border-gray-200 pl-3 space-y-1">
                {val.map((item, index) => (
                  <div key={index}>
                    {typeof item === 'object' && item !== null ? (
                      renderValue(item, String(index), `${path}-${index}`, true)
                    ) : (
                      <div className="flex items-start gap-2 py-0.5">
                        <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded">{index}</span>
                        <span className="text-sm text-gray-800 break-words flex-1">
                          {highlightText(String(item))}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Handle objects
      if (val !== null && typeof val === 'object') {
        const keys = Object.keys(val);
        return (
          <div className="py-0.5">
            <div className="flex items-center gap-1 group">
              <button
                onClick={() => toggleKey(path)}
                className="flex items-center gap-1 hover:bg-gray-100 rounded px-1 -ml-1 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
                <span className={keyClassName}>
                  {highlightText(key)}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {`{${keys.length} ${keys.length === 1 ? 'property' : 'properties'}}`}
                </span>
              </button>
              <NodeCopyButton text={JSON.stringify(val, null, 2)} itemKey={`copy-${path}`} />
            </div>
            {isExpanded && (
              <div className="ml-4 mt-1 border-l-2 border-gray-200 pl-3 space-y-1">
                <CollapsibleJsonTree data={val} depth={depth + 1} />
              </div>
            )}
          </div>
        );
      }

      // Handle primitive values
      return (
        <div className="flex items-start gap-2 py-0.5 group">
          <span className={`${keyClassName} whitespace-nowrap`}>
            {highlightText(key)}
          </span>
          <span className="text-sm text-gray-800 break-words">
            {highlightText(String(val))}
          </span>
          <NodeCopyButton text={String(val)} itemKey={`copy-${path}`} />
        </div>
      );
    };

    if (Array.isArray(data)) {
      return (
        <div className="space-y-1">
          {data.map((item, index) => (
            <div key={index}>
              {renderValue(item, String(index), `${depth}-${index}`, true)}
            </div>
          ))}
        </div>
      );
    }

    if (data !== null && typeof data === 'object') {
      return (
        <div className="space-y-1">
          {Object.entries(data).map(([key, val]) => (
            <div key={key}>
              {renderValue(val, key, `${depth}-${key}`)}
            </div>
          ))}
        </div>
      );
    }

    return <div className="text-sm text-gray-800">{highlightText(String(data))}</div>;
  };

  const SyntaxHighlightedJSON = ({ jsonString }: { jsonString: string }) => {
    const highlightJSON = (json: string): React.ReactNode[] => {
      const tokens: React.ReactNode[] = [];
      let i = 0;
      let tokenId = 0;

      while (i < json.length) {
        const char = json[i];

        // Strings (including keys)
        if (char === '"') {
          let str = '"';
          i++;
          while (i < json.length && (json[i] !== '"' || json[i - 1] === '\\')) {
            str += json[i];
            i++;
          }
          str += '"';
          i++;

          // Check if this is a key (followed by :)
          let j = i;
          while (j < json.length && /\s/.test(json[j])) j++;
          const isKey = json[j] === ':';

          tokens.push(
            <span key={tokenId++} className={isKey ? "text-blue-600" : "text-green-800"}>
              {str}
            </span>
          );
          continue;
        }

        // Numbers
        if (/[\d-]/.test(char)) {
          let num = '';
          while (i < json.length && /[\d.eE+-]/.test(json[i])) {
            num += json[i];
            i++;
          }
          tokens.push(
            <span key={tokenId++} className="text-orange-600">
              {num}
            </span>
          );
          continue;
        }

        // Booleans and null
        if (json.slice(i, i + 4) === 'true' || json.slice(i, i + 5) === 'false') {
          const bool = json.slice(i, i + 4) === 'true' ? 'true' : 'false';
          tokens.push(
            <span key={tokenId++} className="text-purple-600">
              {bool}
            </span>
          );
          i += bool.length;
          continue;
        }

        if (json.slice(i, i + 4) === 'null') {
          tokens.push(
            <span key={tokenId++} className="text-purple-600">
              null
            </span>
          );
          i += 4;
          continue;
        }

        // Punctuation
        if (/[{}\[\]:,]/.test(char)) {
          tokens.push(
            <span key={tokenId++} className="text-gray-600">
              {char}
            </span>
          );
          i++;
          continue;
        }

        // Everything else (whitespace, etc.)
        tokens.push(<span key={tokenId++}>{char}</span>);
        i++;
      }

      return tokens;
    };

    return <>{highlightJSON(jsonString)}</>;
  };

  const CopyButton = ({ text, itemKey }: { text: string; itemKey: string }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <button
            onClick={() => copyToClipboard(text, itemKey)}
            className="absolute -right-8 top-0 text-gray-400 hover:text-gray-600 p-1"
            title="Copy"
          >
            {copiedKey === itemKey ? (
              <span className="text-green-600 text-xs">✓</span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    );
  };

  const JsonViewer = ({
    value,
    viewMode,
    onViewModeChange,
    itemKey,
    title
  }: {
    value: string;
    viewMode: 'list' | 'raw';
    onViewModeChange: (mode: 'list' | 'raw') => void;
    itemKey: string;
    title?: string;
  }) => {
    const jsonIsValid = isJSON(value);

    if (!jsonIsValid) {
      // Not JSON, just display as text
      return (
        <div>
          {title && (
            <div className="flex items-center gap-2 mb-2 group">
              <h4 className="text-xs font-semibold text-gray-600 uppercase">{title}</h4>
              <button
                onClick={() => copyToClipboard(value, `${itemKey}-whole`)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-0.5 transition-opacity"
                title="Copy all"
              >
                {copiedKey === `${itemKey}-whole` ? (
                  <span className="text-green-600 text-xs">✓</span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
          <div className="relative">
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
              {value}
            </div>
            <CopyButton text={value} itemKey={itemKey} />
          </div>
        </div>
      );
    }

    const parsedJson = JSON.parse(fixJSONEscapes(value));

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          {title && (
            <div className="flex items-center gap-2 group">
              <h4 className="text-xs font-semibold text-gray-600 uppercase">{title}</h4>
              <button
                onClick={() => copyToClipboard(value, `${itemKey}-whole`)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-0.5 transition-opacity"
                title="Copy all"
              >
                {copiedKey === `${itemKey}-whole` ? (
                  <span className="text-green-600 text-xs">✓</span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-1 text-xs rounded ${viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Formatted
            </button>
            <button
              onClick={() => onViewModeChange('raw')}
              className={`px-3 py-1 text-xs rounded ${viewMode === 'raw'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Raw JSON
            </button>
          </div>
        </div>
        <div className="relative">
          {viewMode === 'list' ? (
            <div className="bg-gray-50 p-3 rounded border border-gray-200 max-h-[600px] overflow-y-auto">
              <CollapsibleJsonTree data={parsedJson} />
            </div>
          ) : (
            <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto max-h-[600px] overflow-y-auto" style={{ fontFamily: 'inherit' }}>
              {searchQuery ? (
                highlightText(formatJSONDeep(value))
              ) : (
                <SyntaxHighlightedJSON jsonString={formatJSONDeep(value)} />
              )}
            </pre>
          )}
          <CopyButton text={value} itemKey={itemKey} />
        </div>
      </div>
    );
  };

  const InfoCard = ({
    icon: Icon,
    title,
    children
  }: {
    icon: any;
    title: string;
    children: React.ReactNode;
  }) => {
    return (
      <div className="bg-white border border-gray-200 rounded p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
        {children}
      </div>
    );
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'invoke_agent':
        return <Bot className="w-6 h-6 text-blue-500" />;
      case 'chat':
        return <MessageSquare className="w-6 h-6 text-amber-500" />;
      case 'execute_tool':
        return <Wrench className="w-6 h-6 text-emerald-500" />;
      default:
        return <MessageSquare className="w-6 h-6 text-gray-600" />;
    }
  };

  // Check if sections match search
  const modelInfoMatches = !searchQuery || (
    matchesSearch(toolName || '') ||
    matchesSearch(modelInfo.provider || '') ||
    matchesSearch(modelInfo.model || '') ||
    matchesSearch(modelInfo.temperature || '')
  );

  const inputMatches = !searchQuery || (
    jsonContainsSearch(input?.value || '') ||
    jsonContainsSearch(systemInstructions?.value || '') ||
    jsonContainsSearch(inputTools?.value || '')
  );

  const outputMatches = !searchQuery || (
    jsonContainsSearch(output?.value || '') ||
    matchesSearch(errorMessage?.value || '')
  );

  const toolsMatches = !searchQuery || jsonContainsSearch(tools?.value || '');

  return (
    <div className="space-y-4">
      {/* Span Title */}
      {spanName && (
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          {getTypeIcon(spanType)}
          <h2 className="text-xl font-semibold text-gray-900">{spanName}</h2>
        </div>
      )}

      {/* Global Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search all sections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Metrics Pills */}
      <div className="flex flex-wrap gap-2">
        {latency && matchesSearch(`Latency: ${latency}`) && (
          <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
            Latency: {latency}
          </div>
        )}
        {modelInfo.temperature && matchesSearch(`Temperature: ${modelInfo.temperature}`) && (
          <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
            Temperature: {modelInfo.temperature}
          </div>
        )}
        {spanData.attributes.find(a => a.key === 'gen_ai.usage.input_tokens') && matchesSearch(`Input Tokens: ${parseInt(spanData.attributes.find(a => a.key === 'gen_ai.usage.input_tokens')?.value || '0')}`) && (
          <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
            Input Tokens: {parseInt(spanData.attributes.find(a => a.key === 'gen_ai.usage.input_tokens')?.value || '0')}
          </div>
        )}
        {spanData.attributes.find(a => a.key === 'gen_ai.usage.output_tokens') && matchesSearch(`Output Tokens: ${parseInt(spanData.attributes.find(a => a.key === 'gen_ai.usage.output_tokens')?.value || '0')}`) && (
          <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
            Output Tokens: {parseInt(spanData.attributes.find(a => a.key === 'gen_ai.usage.output_tokens')?.value || '0')}
          </div>
        )}
        {modelInfo.provider && matchesSearch(`Model Provider: ${modelInfo.provider}`) && (
          <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
            Provider: {modelInfo.provider}
          </div>
        )}
      </div>

      {/* Model/Tool Info */}
      {(modelInfo.model || toolName) && modelInfoMatches && (
        <InfoCard icon={Settings} title="Configuration">
          <div className="space-y-2 text-sm">
            {toolName && (
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Tool:</span>
                <span className="text-gray-700">{highlightText(toolName)}</span>
              </div>
            )}
            {modelInfo.provider && (
              <div className="flex gap-2">
                <span className="font-medium">Provider:</span>
                <span className="text-gray-700">{highlightText(modelInfo.provider)}</span>
              </div>
            )}
            {modelInfo.model && (
              <div className="flex gap-2">
                <span className="font-medium">Model:</span>
                <span className="text-gray-700 font-mono text-xs">{highlightText(modelInfo.model)}</span>
              </div>
            )}
            {modelInfo.temperature && (
              <div className="flex gap-2">
                <span className="font-medium">Temperature:</span>
                <span className="text-gray-700">{highlightText(modelInfo.temperature)}</span>
              </div>
            )}
          </div>
        </InfoCard>
      )}

      {/* Available Tools */}
      {tools && toolsMatches && (
        <InfoCard icon={Wrench} title="Available Tools">
          <div className="relative">
            <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
              {searchQuery ? (
                highlightText(formatJSON(tools.value))
              ) : (
                <SyntaxHighlightedJSON jsonString={formatJSON(tools.value)} />
              )}
            </pre>
            <CopyButton text={tools.value} itemKey="tools" />
          </div>
        </InfoCard>
      )}

      {/* Input */}
      {(input || systemInstructions || inputTools) && inputMatches && (
        <div className="border border-gray-200 rounded-lg bg-white">
          <button
            onClick={() => setShowInput(!showInput)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-700">Input</h3>
            </div>
            {showInput ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {showInput && (
            <div className="border-t border-gray-200 p-4">
              <div className="space-y-4">
                {systemInstructions && jsonContainsSearch(systemInstructions.value) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 group">
                      <h4 className="text-xs font-semibold text-gray-600 uppercase">System</h4>
                      <button
                        onClick={() => copyToClipboard(systemInstructions.value, 'system-whole')}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-0.5 transition-opacity"
                        title="Copy all"
                      >
                        {copiedKey === 'system-whole' ? (
                          <span className="text-green-600 text-xs">✓</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                        {highlightText(systemInstructions.value)}
                      </div>
                      <CopyButton text={systemInstructions.value} itemKey="system_instructions" />
                    </div>
                  </div>
                )}
                {input && jsonContainsSearch(input.value) && (
                  <div>
                    <JsonViewer
                      value={input.value}
                      viewMode={inputViewMode}
                      onViewModeChange={setInputViewMode}
                      itemKey="input"
                      title={
                        input.key === 'gen_ai.tool.arguments'
                          ? 'Tool Arguments'
                          : input.key === 'gen_ai.input.messages' && operationName === 'invoke_agent'
                            ? 'User'
                            : 'Messages'
                      }
                    />
                  </div>
                )}
                {inputTools && jsonContainsSearch(inputTools.value) && (
                  <div>
                    <JsonViewer
                      value={inputTools.value}
                      viewMode={inputToolsViewMode}
                      onViewModeChange={setInputToolsViewMode}
                      itemKey="input_tools"
                      title="Tools"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Output */}
      {(output || errorMessage) && outputMatches && (
        <div className="border border-gray-200 rounded-lg bg-white">
          <button
            onClick={() => setShowOutput(!showOutput)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-700">Output</h3>
            </div>
            {showOutput ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {showOutput && (
            <div className="border-t border-gray-200 p-4">
              <div className="space-y-4">
                {errorMessage && matchesSearch(errorMessage.value) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 group">
                      <h4 className="text-xs font-semibold text-red-600 uppercase flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 bg-red-100 rounded-full text-red-600">!</span>
                        Error
                      </h4>
                      <button
                        onClick={() => copyToClipboard(errorMessage.value, 'error-whole')}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-0.5 transition-opacity"
                        title="Copy all"
                      >
                        {copiedKey === 'error-whole' ? (
                          <span className="text-green-600 text-xs">✓</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="text-sm text-red-800 whitespace-pre-wrap break-words overflow-wrap-anywhere bg-red-50 p-3 rounded border border-red-200 overflow-x-auto">
                        {highlightText(errorMessage.value)}
                      </div>
                      <CopyButton text={errorMessage.value} itemKey="error_message" />
                    </div>
                  </div>
                )}
                {output && jsonContainsSearch(output.value) && (
                  <div>
                    <JsonViewer
                      value={output.value}
                      viewMode={outputViewMode}
                      onViewModeChange={setOutputViewMode}
                      itemKey="output"
                      title={output.key === 'gen_ai.tool.output' ? 'Tool Output' : 'Messages'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Details Toggle */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-700">Advanced Details</span>
          {showAdvanced ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {showAdvanced && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Technical IDs */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Technical IDs</h4>
              <div className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-600 w-32">Span ID:</span>
                  <span className="text-gray-900 font-mono text-xs">{spanData.spanId}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600 w-32">Trace ID:</span>
                  <span className="text-gray-900 font-mono text-xs">{spanData.traceId}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600 w-32">Parent Span ID:</span>
                  <span className="text-gray-900 font-mono text-xs">{spanData.parentSpanId}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600 w-32">Start Time:</span>
                  <span className="text-gray-900 font-mono text-xs">{formatTime(spanData.startTime)}</span>
                </div>
                {spanData.endTime && (
                  <div className="flex gap-2">
                    <span className="text-gray-600 w-32">End Time:</span>
                    <span className="text-gray-900 font-mono text-xs">{formatTime(spanData.endTime)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Other Technical Attributes */}
            {filterAttributes(advancedAttributes).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase">
                  Other Attributes ({filterAttributes(advancedAttributes).length})
                </h4>
                <div className="space-y-2">
                  {filterAttributes(advancedAttributes).map((attr, index) => (
                    <div key={index} className="flex gap-2 text-sm group">
                      <button className="text-blue-600 hover:underline whitespace-nowrap">
                        {highlightText(attr.key)}:
                      </button>
                      <div className="flex-1 relative">
                        <span className="text-gray-700 break-all">{highlightText(attr.value)}</span>
                        <div
                          className="inline-block ml-2"
                          onMouseEnter={(e) => {
                            const btn = e.currentTarget.querySelector('button');
                            if (btn) btn.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            const btn = e.currentTarget.querySelector('button');
                            if (btn && copiedKey !== attr.key) btn.style.opacity = '0';
                          }}
                        >
                          <button
                            onClick={() => copyToClipboard(attr.value, attr.key)}
                            className="text-gray-400 hover:text-gray-600 p-1 transition-opacity"
                            style={{ opacity: copiedKey === attr.key ? 1 : 0 }}
                            title="Copy value"
                          >
                            {copiedKey === attr.key ? (
                              <span className="text-green-600 text-xs">✓</span>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && filterAttributes(advancedAttributes).length === 0 && (
              <div className="text-center text-gray-500 py-4 text-sm">
                No attributes match your search
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}