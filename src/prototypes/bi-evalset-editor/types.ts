// --- Types ---

export type StepType = 'invoke' | 'tool' | 'chat';

export const AVAILABLE_TOOLS = [
  'sumTool',
  'subtractTool',
  'multiplyTool',
  'divideTool',
  'analysisTool',
  'searchTool',
  'vectorDbSearch'
];

export interface ToolSchema {
  type: string;
  required?: string[];
  properties: Record<string, { type: string; format?: string }>;
}

export interface Step {
  id: string;
  type: StepType;
  name: string;
  duration: string;
  input?: string | ToolSchema;
  output?: string | ToolSchema;
  inputValues?: Record<string, any>;
  outputValues?: Record<string, any>;
}

export interface MessagePair {
  id: string;
  userInput: string;
  agentOutput: string;
  steps: Step[];
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'entrypoint' | 'listener' | 'connection' | 'type' | 'function' | 'datamapper' | 'config';
  children?: TreeNode[];
  expanded?: boolean;
}

// Testing Types
export type TestStatus = 'passed' | 'failed' | 'running' | 'pending';

export interface Test {
  id: string;
  name: string;
  functionName: string;
  dataProvider?: string;
  parameters?: Record<string, any>;
  returnType?: string;
  groups?: string[];
  enabled: boolean;
  status?: TestStatus;
}

export interface AgentEvaluation {
  id: string;
  name: string;
  type: 'from-eval-set' | 'standalone';
  evalSetId?: string; // If type is 'from-eval-set'
  functionName?: string; // If type is 'standalone'
  dataProvider?: string;
  parameters?: Record<string, any>;
  enabled: boolean;
  status?: TestStatus;
}

export interface EvalSetCase {
  id: string;
  name: string;
  status?: TestStatus;
  messages: MessagePair[];
}

export interface EvalSet {
  id: string;
  name: string;
  cases: EvalSetCase[];
}

export interface TestGroup {
  id: string;
  name: string;
  tests: Test[];
}

export interface AgentEvaluationGroup {
  id: string;
  name: string;
  evaluations: AgentEvaluation[];
}
