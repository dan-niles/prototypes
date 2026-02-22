import type { MessagePair, EvalSet } from './types';

export const INITIAL_CHATS: MessagePair[] = [
  {
    id: '1',
    userInput: 'hi',
    agentOutput: 'Hello! How can I assist you with math today?',
    steps: [
      { id: 's1', type: 'invoke', name: 'Math Tutor', duration: '2.05s' },
      { id: 's2', type: 'chat', name: 'gpt-4o-mini', duration: '2.03s' }
    ]
  },
  {
    id: '2',
    userInput: 'how much is 1+1-2?',
    agentOutput:
      "Let's break down the calculation step-by-step:\n\n1. First, we calculate 1 + 1:\n   • Using the sum tool, we find that 1 + 1 = 2.\n2. Next, we subtract 2 from the result:\n   • Using the subtract tool, we find that 2 - 2 = 0.\n\nTherefore, the final answer is 0.",
    steps: [
      { id: 's3', type: 'invoke', name: 'Math Tutor', duration: '3.08s' },
      { id: 's4', type: 'chat', name: 'gpt-4o-mini', duration: '2.01s' },
      {
        id: 's5',
        type: 'tool',
        name: 'sumTool',
        duration: '10ms',
        input: {
          type: 'object',
          required: ['num1', 'num2'],
          properties: {
            num1: { type: 'integer', format: 'int64' },
            num2: { type: 'integer', format: 'int64' }
          }
        },
        inputValues: { num1: 1, num2: 1 },
        output: {
          type: 'object',
          required: ['result'],
          properties: {
            result: { type: 'integer', format: 'int64' }
          }
        },
        outputValues: { result: 2 }
      },
      { id: 's6', type: 'chat', name: 'gpt-4o-mini', duration: '1.05s' },
      {
        id: 's7',
        type: 'tool',
        name: 'subtractTool',
        duration: '12ms',
        input: {
          type: 'object',
          required: ['num1', 'num2'],
          properties: {
            num1: { type: 'integer', format: 'int64' },
            num2: { type: 'integer', format: 'int64' }
          }
        },
        inputValues: { num1: 2, num2: 2 },
        output: {
          type: 'object',
          required: ['result'],
          properties: {
            result: { type: 'integer', format: 'int64' }
          }
        },
        outputValues: { result: 0 }
      },
      { id: 's8', type: 'chat', name: 'gpt-4o-mini', duration: '0.9s' }
    ]
  }
];

export const INITIAL_EVAL_SETS: EvalSet[] = [
  {
    id: 'eval-set-1',
    name: 'eval-set-1',
    cases: [
      {
        id: 'case1',
        name: 'case-1',
        status: 'pending',
        messages: [
          {
            id: 'c1-m1',
            userInput: 'What is 5 + 3?',
            agentOutput: 'Let me calculate that for you. 5 + 3 = 8.',
            steps: [
              { id: 'c1-s1', type: 'invoke', name: 'Math Tutor', duration: '1.2s' },
              { id: 'c1-s2', type: 'chat', name: 'gpt-4o-mini', duration: '0.8s' },
              {
                id: 'c1-s3',
                type: 'tool',
                name: 'sumTool',
                duration: '8ms',
                input: {
                  type: 'object',
                  required: ['num1', 'num2'],
                  properties: {
                    num1: { type: 'integer', format: 'int64' },
                    num2: { type: 'integer', format: 'int64' }
                  }
                },
                inputValues: { num1: 5, num2: 3 },
                output: {
                  type: 'object',
                  required: ['result'],
                  properties: {
                    result: { type: 'integer', format: 'int64' }
                  }
                },
                outputValues: { result: 8 }
              }
            ]
          }
        ]
      },
      {
        id: 'case2',
        name: 'case-2',
        status: 'pending',
        messages: [
          {
            id: 'c2-m1',
            userInput: 'Calculate 10 * 4',
            agentOutput: 'The result of 10 × 4 is 40.',
            steps: [
              { id: 'c2-s1', type: 'invoke', name: 'Math Tutor', duration: '1.5s' },
              { id: 'c2-s2', type: 'chat', name: 'gpt-4o-mini', duration: '1.1s' },
              {
                id: 'c2-s3',
                type: 'tool',
                name: 'multiplyTool',
                duration: '9ms',
                input: {
                  type: 'object',
                  required: ['num1', 'num2'],
                  properties: {
                    num1: { type: 'integer', format: 'int64' },
                    num2: { type: 'integer', format: 'int64' }
                  }
                },
                inputValues: { num1: 10, num2: 4 },
                output: {
                  type: 'object',
                  required: ['result'],
                  properties: {
                    result: { type: 'integer', format: 'int64' }
                  }
                },
                outputValues: { result: 40 }
              }
            ]
          }
        ]
      },
      {
        id: 'case3',
        name: 'case-3',
        status: 'pending',
        messages: [
          {
            id: 'c3-m1',
            userInput: 'Help me with 20 / 5',
            agentOutput: 'The division of 20 by 5 equals 4.',
            steps: [
              { id: 'c3-s1', type: 'invoke', name: 'Math Tutor', duration: '1.3s' },
              { id: 'c3-s2', type: 'chat', name: 'gpt-4o-mini', duration: '0.9s' },
              {
                id: 'c3-s3',
                type: 'tool',
                name: 'divideTool',
                duration: '7ms',
                input: {
                  type: 'object',
                  required: ['num1', 'num2'],
                  properties: {
                    num1: { type: 'integer', format: 'int64' },
                    num2: { type: 'integer', format: 'int64' }
                  }
                },
                inputValues: { num1: 20, num2: 5 },
                output: {
                  type: 'object',
                  required: ['result'],
                  properties: {
                    result: { type: 'integer', format: 'int64' }
                  }
                },
                outputValues: { result: 4 }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'eval-set-2',
    name: 'eval-set-2',
    cases: [
      {
        id: 'case4',
        name: 'case-1',
        status: 'pending',
        messages: [
          {
            id: 'c4-m1',
            userInput: 'Can you search for information about machine learning?',
            agentOutput: 'I found comprehensive information about machine learning algorithms and applications.',
            steps: [
              { id: 'c4-s1', type: 'invoke', name: 'Research Assistant', duration: '2.1s' },
              { id: 'c4-s2', type: 'chat', name: 'gpt-4o', duration: '1.5s' },
              {
                id: 'c4-s3',
                type: 'tool',
                name: 'searchTool',
                duration: '450ms',
                input: {
                  type: 'object',
                  required: ['query'],
                  properties: {
                    query: { type: 'string' }
                  }
                },
                inputValues: { query: 'machine learning algorithms' },
                output: {
                  type: 'object',
                  required: ['results'],
                  properties: {
                    results: { type: 'string' }
                  }
                },
                outputValues: { results: 'Found 10 relevant articles' }
              }
            ]
          }
        ]
      },
      {
        id: 'case5',
        name: 'case-2',
        status: 'pending',
        messages: [
          {
            id: 'c5-m1',
            userInput: 'Analyze this data for patterns',
            agentOutput: 'I have analyzed the data and found several interesting patterns.',
            steps: [
              { id: 'c5-s1', type: 'invoke', name: 'Data Analyst', duration: '3.2s' },
              { id: 'c5-s2', type: 'chat', name: 'gpt-4o', duration: '2.1s' },
              {
                id: 'c5-s3',
                type: 'tool',
                name: 'analysisTool',
                duration: '1200ms',
                input: {
                  type: 'object',
                  required: ['data'],
                  properties: {
                    data: { type: 'string' }
                  }
                },
                inputValues: { data: 'sample dataset' },
                output: {
                  type: 'object',
                  required: ['analysis'],
                  properties: {
                    analysis: { type: 'string' }
                  }
                },
                outputValues: { analysis: 'Pattern detected: increasing trend' }
              }
            ]
          }
        ]
      }
    ]
  }
];
