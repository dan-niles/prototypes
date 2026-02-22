import React, { useState } from 'react';
import { toast } from 'sonner';
import type { MessagePair, Step, EvalSet, EvalSetCase } from './types';
import { INITIAL_CHATS, INITIAL_EVAL_SETS } from './mockData';
import { Header } from './components/Header';
import { ProjectTree } from './components/ProjectTree';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { ToolEditorModal } from './components/ToolEditorModal';
import { CreateEvalSetModal } from './components/CreateEvalSetModal';
import { TabBar, type Tab } from './components/TabBar';
import { CreateAgentEvaluationTab } from './components/CreateAgentEvaluationTab';
import { CreateTestTab } from './components/CreateTestTab';

const generateCaseName = () => `case-${Math.floor(Math.random() * 10000)}`;
const generateCaseId = () => `case-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export default function ChatApp() {
  const [messages, setMessages] = useState<MessagePair[]>(INITIAL_CHATS);
  const [inputText, setInputText] = useState('');
  const [isEvalMode, setIsEvalMode] = useState(false);
  const [isViewingCase, setIsViewingCase] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    '1': false,
    '2': false
  });
  const [selectedStep, setSelectedStep] = useState<{ pairId: string; step: Step } | null>(null);
  const [savedMessages, setSavedMessages] = useState<MessagePair[]>([]);
  const [evalSets, setEvalSets] = useState<EvalSet[]>(INITIAL_EVAL_SETS);
  const [selectedEvalSet, setSelectedEvalSet] = useState<string>('eval-set-1');
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [caseName, setCaseName] = useState<string>(generateCaseName());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEvalSetName, setNewEvalSetName] = useState('');
  const [isCreatedFromChat, setIsCreatedFromChat] = useState(false);

  // Tab management for middle area
  const [middleTabs, setMiddleTabs] = useState<Tab[]>([
    { id: 'wso2-integrator', title: 'WSO2 Integrator: BI', type: 'dummy' }
  ]);
  const [activeMiddleTab, setActiveMiddleTab] = useState<string | null>('wso2-integrator');

  // Agent chat on right is always visible initially
  const [showAgentChat, setShowAgentChat] = useState(true);

  const toggleSteps = (id: string) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.info('Chat cleared');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newPair: MessagePair = {
      id: Date.now().toString(),
      userInput: inputText,
      agentOutput: 'Processing your request...',
      steps: [
        { id: Math.random().toString(), type: 'invoke', name: 'Math Tutor', duration: '0.5s' },
        { id: Math.random().toString(), type: 'chat', name: 'gpt-4o', duration: '1.2s' }
      ]
    };

    setMessages([...messages, newPair]);
    setInputText('');

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newPair.id
            ? {
              ...m,
              agentOutput: `I've analyzed "${inputText}". Here is the result based on my internal tools.`,
              steps: [
                ...m.steps,
                {
                  id: Math.random().toString(),
                  type: 'tool',
                  name: 'analysisTool',
                  duration: '150ms',
                  input: {
                    type: 'object',
                    required: ['query'],
                    properties: {
                      query: { type: 'string' }
                    }
                  },
                  inputValues: { query: inputText },
                  output: {
                    type: 'object',
                    required: ['result'],
                    properties: {
                      result: { type: 'string' }
                    }
                  },
                  outputValues: { result: 'processed' }
                }
              ]
            }
            : m
        )
      );
    }, 1500);
  };

  const handleExportJson = (type: 'current' | 'eval') => {
    const data = JSON.stringify(messages, null, 2);
    const filename = type === 'current' ? 'chat-export.json' : 'evaluation-dataset.json';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${type === 'current' ? 'Chat' : 'Dataset'} exported successfully`);
  };

  const handleSaveCase = () => {
    if (!currentCaseId || !selectedEvalSet) {
      toast.error('No case or eval set selected');
      return;
    }

    // Check if the selected eval set exists
    const evalSetExists = evalSets.find(es => es.id === selectedEvalSet);

    if (!evalSetExists) {
      toast.error('Selected eval set not found');
      return;
    }

    // Save the current messages to the case in the eval set
    setEvalSets(prevSets => prevSets.map(es =>
      es.id === selectedEvalSet
        ? {
          ...es,
          cases: es.cases.map(c =>
            c.id === currentCaseId
              ? { ...c, messages, name: caseName }
              : c
          )
        }
        : es
    ));

    if (isCreatedFromChat) {
      // Return to original chat session
      setMessages(savedMessages);
      setIsEvalMode(false);
      setIsViewingCase(false);
      setCurrentCaseId(null);
      setIsCreatedFromChat(false);

      // Close evaluations tab and show agent chat
      setMiddleTabs(prevTabs => prevTabs.filter(tab => tab.id !== 'evaluations'));
      setShowAgentChat(true);

      toast.success(`Case "${caseName}" saved to "${evalSetExists.name}". Returned to chat.`);
    } else {
      // Was editing an existing case from tree - switch to view mode
      setIsEvalMode(false);
      setIsViewingCase(true);

      toast.success(`Case "${caseName}" saved to "${evalSetExists.name}"`);
    }
  };

  const updatePair = (id: string, updates: Partial<MessagePair>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deletePair = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast.info('Conversation turn deleted');
  };

  const addEmptyPair = () => {
    const newPair: MessagePair = {
      id: Date.now().toString(),
      userInput: 'New user message',
      agentOutput: 'New agent response',
      steps: []
    };
    setMessages([...messages, newPair]);
  };

  const addToolStep = (pairId: string) => {
    const newStep: Step = {
      id: Math.random().toString(),
      type: 'tool',
      name: 'analysisTool',
      duration: '0ms',
      input: {
        type: 'object',
        required: ['num1', 'num2'],
        properties: {
          num1: { type: 'integer', format: 'int64' },
          num2: { type: 'integer', format: 'int64' }
        }
      },
      inputValues: { num1: 0, num2: 0 },
      output: {
        type: 'object',
        required: ['result'],
        properties: {
          result: { type: 'integer', format: 'int64' }
        }
      },
      outputValues: { result: 0 }
    };
    setMessages((prev) =>
      prev.map((m) => (m.id === pairId ? { ...m, steps: [...m.steps, newStep] } : m))
    );
  };

  const updateStep = (pairId: string, stepId: string, updates: Partial<Step>) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === pairId
          ? {
            ...m,
            steps: m.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s))
          }
          : m
      )
    );
  };

  const deleteStep = (pairId: string, stepId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === pairId
          ? {
            ...m,
            steps: m.steps.filter((s) => s.id !== stepId)
          }
          : m
      )
    );
  };

  const updateSteps = (pairId: string, steps: Step[]) => {
    setMessages((prev) => prev.map((m) => (m.id === pairId ? { ...m, steps } : m)));
  };

  const handleMiddleTabClose = (tabId: string) => {
    setMiddleTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));

    // If closing the active tab, switch to another tab or null
    if (activeMiddleTab === tabId) {
      const remainingTabs = middleTabs.filter(tab => tab.id !== tabId);
      setActiveMiddleTab(remainingTabs.length > 0 ? remainingTabs[0].id : null);
    }
  };

  const handleMiddleTabClick = (tabId: string) => {
    setActiveMiddleTab(tabId);
  };

  const handleToggleEvalMode = () => {
    if (isEvalMode) {
      // Exiting eval mode - check if we should return to view mode or exit completely
      if (currentCaseId) {
        const evalSet = evalSets.find(es => es.cases.some(c => c.id === currentCaseId));
        const evalCase = evalSet?.cases.find(c => c.id === currentCaseId);

        // If the case exists and has messages, return to view mode
        if (evalCase && evalCase.messages.length > 0) {
          // Reload the original case messages (discard changes)
          setMessages(evalCase.messages);
          setIsEvalMode(false);
          setIsViewingCase(true);
          // Keep currentCaseId, selectedEvalSet, and caseName

          toast.info('Changes discarded, returned to view mode');
          return;
        }
      }

      // No case to return to, exit completely
      setMessages(savedMessages);
      setIsEvalMode(false);
      setIsViewingCase(false);
      setCurrentCaseId(null);
      setIsCreatedFromChat(false);

      // Close evaluations tab and show agent chat
      setMiddleTabs(prevTabs => prevTabs.filter(tab => tab.id !== 'evaluations'));
      setShowAgentChat(true);

      toast.info('Exited dataset editor');
    } else {
      // Entering eval mode - save current messages and generate new case name
      setSavedMessages([...messages]);

      // Create a new case in the selected (or default) eval set
      const targetEvalSetId = selectedEvalSet || evalSets[0]?.id;
      if (!targetEvalSetId) {
        toast.error('No eval sets available. Create one first.');
        return;
      }

      const newCaseId = generateCaseId();
      const newCaseName = generateCaseName();

      // Add empty case to eval set
      setEvalSets(prevSets => prevSets.map(es =>
        es.id === targetEvalSetId
          ? { ...es, cases: [...es.cases, { id: newCaseId, name: newCaseName, status: 'pending', messages: [] }] }
          : es
      ));

      setCurrentCaseId(newCaseId);
      setCaseName(newCaseName);
      setSelectedEvalSet(targetEvalSetId);
      setIsEvalMode(true);
      setIsViewingCase(false);
      setIsCreatedFromChat(true);

      // Add evaluations tab if not exists and close agent chat
      setMiddleTabs(prevTabs => {
        const hasEvalTab = prevTabs.some(tab => tab.id === 'evaluations');
        if (!hasEvalTab) {
          return [...prevTabs, { id: 'evaluations', title: 'Evaluations', type: 'evaluations' }];
        }
        return prevTabs;
      });
      setActiveMiddleTab('evaluations');
      setShowAgentChat(false);

      toast.info('Entered dataset editor');
    }
  };

  const handleEditCaseFromHeader = () => {
    // Switch from viewing to editing mode
    if (currentCaseId) {
      setIsEvalMode(true);
      setIsViewingCase(false);
      toast.info('Editing case');
    }
  };

  const handleDeleteCase = () => {
    if (currentCaseId) {
      const confirmed = window.confirm(`Are you sure you want to delete this case?`);
      if (confirmed) {
        // Remove the case from the eval set
        setEvalSets(prevSets => prevSets.map(es => ({
          ...es,
          cases: es.cases.filter(c => c.id !== currentCaseId)
        })));

        // Return to normal chat
        setMessages(savedMessages);
        setIsEvalMode(false);
        setIsViewingCase(false);
        setCurrentCaseId(null);
        setIsCreatedFromChat(false);

        // Close evaluations tab and show agent chat
        setMiddleTabs(prevTabs => prevTabs.filter(tab => tab.id !== 'evaluations'));
        setShowAgentChat(true);

        toast.success('Case deleted');
      }
    }
  };

  const handleCreateNewEvalSet = (name: string) => {
    const exists = evalSets.some(es => es.name === name);
    if (!exists) {
      // Create new eval set with an empty case
      const newCaseId = generateCaseId();
      const newEvalSet: EvalSet = {
        id: `eval-set-${Date.now()}`,
        name,
        cases: [
          {
            id: newCaseId,
            name: generateCaseName(),
            status: 'pending',
            messages: []
          }
        ]
      };

      setEvalSets([...evalSets, newEvalSet]);
      setSelectedEvalSet(newEvalSet.id);

      // Enter eval mode with empty messages
      setSavedMessages([...messages]);
      setMessages([]);
      setIsEvalMode(true);
      setCurrentCaseId(newCaseId);
      setCaseName(newEvalSet.cases[0].name);
      setIsCreatedFromChat(false);

      // Add evaluations tab if not exists and close agent chat
      setMiddleTabs(prevTabs => {
        const hasEvalTab = prevTabs.some(tab => tab.id === 'evaluations');
        if (!hasEvalTab) {
          return [...prevTabs, { id: 'evaluations', title: 'Evaluations', type: 'evaluations' }];
        }
        return prevTabs;
      });
      setActiveMiddleTab('evaluations');
      setShowAgentChat(false);

      toast.success(`Created eval set: ${name}`);
    }
  };

  const handleViewCase = (evalSetId: string, caseId: string) => {
    const evalSet = evalSets.find(es => es.id === evalSetId);
    const evalCase = evalSet?.cases.find(c => c.id === caseId);

    if (evalCase) {
      // Save current work if in eval mode
      if (isEvalMode && currentCaseId) {
        const currentEvalSet = evalSets.find(es => es.cases.some(c => c.id === currentCaseId));
        if (currentEvalSet) {
          setEvalSets(prevSets => prevSets.map(es =>
            es.id === currentEvalSet.id
              ? {
                ...es,
                cases: es.cases.map(c =>
                  c.id === currentCaseId ? { ...c, messages } : c
                )
              }
              : es
          ));
        }
      }

      // Load the case in view mode (not edit mode)
      if (!isViewingCase && !isEvalMode) {
        setSavedMessages([...messages]);
      }
      setMessages(evalCase.messages);
      setIsEvalMode(false);
      setIsViewingCase(true);
      setCurrentCaseId(caseId);
      setSelectedEvalSet(evalSetId);
      setCaseName(evalCase.name);
      setIsCreatedFromChat(false);

      // Add evaluations tab if not exists and close agent chat
      setMiddleTabs(prevTabs => {
        const hasEvalTab = prevTabs.some(tab => tab.id === 'evaluations');
        if (!hasEvalTab) {
          return [...prevTabs, { id: 'evaluations', title: 'Evaluations', type: 'evaluations' }];
        }
        return prevTabs;
      });
      setActiveMiddleTab('evaluations');
      setShowAgentChat(false);

      toast.info(`Viewing case: ${evalCase.name}`);
    }
  };

  const handleEditCase = (evalSetId: string, caseId: string) => {
    const evalSet = evalSets.find(es => es.id === evalSetId);
    const evalCase = evalSet?.cases.find(c => c.id === caseId);

    if (evalCase) {
      // Save current work if already in eval mode
      if (isEvalMode && currentCaseId) {
        const currentEvalSet = evalSets.find(es => es.cases.some(c => c.id === currentCaseId));
        if (currentEvalSet) {
          setEvalSets(prevSets => prevSets.map(es =>
            es.id === currentEvalSet.id
              ? {
                ...es,
                cases: es.cases.map(c =>
                  c.id === currentCaseId ? { ...c, messages } : c
                )
              }
              : es
          ));
        }
      } else if (!isViewingCase && !isEvalMode) {
        // Save original messages if entering eval mode for the first time
        setSavedMessages([...messages]);
      }

      // Load the case in edit mode
      setMessages(evalCase.messages);
      setIsEvalMode(true);
      setIsViewingCase(false);
      setCurrentCaseId(caseId);
      setSelectedEvalSet(evalSetId);
      setCaseName(evalCase.name);
      setIsCreatedFromChat(false);

      // Add evaluations tab if not exists and close agent chat
      setMiddleTabs(prevTabs => {
        const hasEvalTab = prevTabs.some(tab => tab.id === 'evaluations');
        if (!hasEvalTab) {
          return [...prevTabs, { id: 'evaluations', title: 'Evaluations', type: 'evaluations' }];
        }
        return prevTabs;
      });
      setActiveMiddleTab('evaluations');
      setShowAgentChat(false);

      toast.info(`Editing case: ${evalCase.name}`);
    }
  };

  const handleAddCaseToEvalSet = (evalSetId: string) => {
    const newCaseId = generateCaseId();
    const newCase: EvalSetCase = {
      id: newCaseId,
      name: generateCaseName(),
      status: 'pending',
      messages: []
    };

    setEvalSets(prevSets => prevSets.map(es =>
      es.id === evalSetId
        ? { ...es, cases: [...es.cases, newCase] }
        : es
    ));

    // Enter eval mode with empty messages for the new case
    if (isEvalMode && currentCaseId) {
      // Save current case first
      const currentEvalSet = evalSets.find(es => es.cases.some(c => c.id === currentCaseId));
      if (currentEvalSet) {
        setEvalSets(prevSets => prevSets.map(es =>
          es.id === currentEvalSet.id
            ? {
              ...es,
              cases: es.cases.map(c =>
                c.id === currentCaseId ? { ...c, messages } : c
              )
            }
            : es
        ));
      }
    } else {
      setSavedMessages([...messages]);
    }

    setMessages([]);
    setIsEvalMode(true);
    setCurrentCaseId(newCaseId);
    setSelectedEvalSet(evalSetId);
    setCaseName(newCase.name);
    setIsCreatedFromChat(false);

    // Add evaluations tab if not exists and close agent chat
    setMiddleTabs(prevTabs => {
      const hasEvalTab = prevTabs.some(tab => tab.id === 'evaluations');
      if (!hasEvalTab) {
        return [...prevTabs, { id: 'evaluations', title: 'Evaluations', type: 'evaluations' }];
      }
      return prevTabs;
    });
    setActiveMiddleTab('evaluations');
    setShowAgentChat(false);

    toast.success('New case created');
  };

  const handleOpenCreateModal = () => {
    const generatedName = `eval-set-${Math.floor(Math.random() * 10000)}`;
    setNewEvalSetName(generatedName);
    setIsCreateModalOpen(true);
  };

  const handleCaseNameChange = (newName: string) => {
    setCaseName(newName);

    // Update the case name in the eval set
    if (currentCaseId) {
      setEvalSets(prevSets => prevSets.map(es => ({
        ...es,
        cases: es.cases.map(c =>
          c.id === currentCaseId ? { ...c, name: newName } : c
        )
      })));
    }
  };

  const handleOpenAgentEvaluationTab = () => {
    // Add tab if not exists
    setMiddleTabs(prevTabs => {
      const hasTab = prevTabs.some(tab => tab.id === 'create-agent-eval');
      if (!hasTab) {
        return [...prevTabs, { id: 'create-agent-eval', title: 'Create AI Evaluation', type: 'create-agent-eval' }];
      }
      return prevTabs;
    });
    setActiveMiddleTab('create-agent-eval');
    setShowAgentChat(false);
  };

  const handleOpenTestTab = () => {
    // Add tab if not exists
    setMiddleTabs(prevTabs => {
      const hasTab = prevTabs.some(tab => tab.id === 'create-test');
      if (!hasTab) {
        return [...prevTabs, { id: 'create-test', title: 'Create Test Case', type: 'create-test' }];
      }
      return prevTabs;
    });
    setActiveMiddleTab('create-test');
    setShowAgentChat(false);
  };

  const handleCloseAgentEvalTab = () => {
    setMiddleTabs(prevTabs => prevTabs.filter(tab => tab.id !== 'create-agent-eval'));
    // Switch to another tab or show agent chat
    const remainingTabs = middleTabs.filter(tab => tab.id !== 'create-agent-eval');
    if (remainingTabs.length > 0) {
      setActiveMiddleTab(remainingTabs[0].id);
    } else {
      setActiveMiddleTab(null);
      setShowAgentChat(true);
    }
  };

  const handleCloseTestTab = () => {
    setMiddleTabs(prevTabs => prevTabs.filter(tab => tab.id !== 'create-test'));
    // Switch to another tab or show agent chat
    const remainingTabs = middleTabs.filter(tab => tab.id !== 'create-test');
    if (remainingTabs.length > 0) {
      setActiveMiddleTab(remainingTabs[0].id);
    } else {
      setActiveMiddleTab(null);
      setShowAgentChat(true);
    }
  };

  const handleCreateEvaluation = (evaluation: {
    name: string;
    type: 'from-eval-set' | 'standalone';
    evalSetId?: string;
    functionName?: string;
  }) => {
    toast.success(`Created evaluation: ${evaluation.name}`);
    handleCloseAgentEvalTab();
  };

  const handleCreateTest = (test: {
    name: string;
    functionName: string;
    dataProvider?: string;
    parameters?: Record<string, any>;
    returnType?: string;
    groups?: string[];
    enabled: boolean;
  }) => {
    toast.success(`Created test: ${test.name}`);
    handleCloseTestTab();
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden">
      {/* Left Column - Project Tree */}
      <div className="w-1/5 h-full border-r border-gray-200">
        <ProjectTree
          evalSets={evalSets}
          onCreateEvalSet={handleCreateNewEvalSet}
          onViewCase={handleViewCase}
          onEditCase={handleEditCase}
          onAddCaseToEvalSet={handleAddCaseToEvalSet}
          onOpenTestTab={handleOpenTestTab}
          onOpenAgentEvaluationTab={handleOpenAgentEvaluationTab}
        />
      </div>

      {/* Middle Column - Tab Content Area */}
      <div className="flex-1 h-full flex flex-col bg-white">
        <TabBar
          tabs={middleTabs}
          activeTab={activeMiddleTab}
          onTabClick={handleMiddleTabClick}
          onTabClose={handleMiddleTabClose}
        />

        <div className="flex-1 overflow-hidden">
          {activeMiddleTab === 'wso2-integrator' && (
            <div className="h-full flex items-center justify-center bg-white p-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">WSO2 Integrator: BI</h2>
                <p className="text-gray-500">Dummy content for WSO2 Integrator BI tab</p>
              </div>
            </div>
          )}

          {activeMiddleTab === 'evaluations' && (
            <div className="h-full flex flex-col bg-white">
              <Header
                isEvalMode={isEvalMode}
                isViewingCase={isViewingCase}
                onClearChat={handleClearChat}
                onToggleEvalMode={handleToggleEvalMode}
                evalSets={evalSets.map(es => es.name)}
                selectedEvalSet={evalSets.find(es => es.id === selectedEvalSet)?.name || selectedEvalSet}
                caseName={caseName}
                onEvalSetChange={(name) => {
                  const evalSet = evalSets.find(es => es.name === name);
                  if (evalSet) {
                    setSelectedEvalSet(evalSet.id);
                  }
                }}
                onCaseNameChange={handleCaseNameChange}
                onOpenCreateModal={handleOpenCreateModal}
                onEditCase={handleEditCaseFromHeader}
                onDeleteCase={handleDeleteCase}
              />

              <ChatArea
                messages={messages}
                isEvalMode={isEvalMode}
                isViewingCase={isViewingCase}
                editingId={editingId}
                expandedSteps={expandedSteps}
                onToggleSteps={toggleSteps}
                onUpdatePair={updatePair}
                onDeletePair={deletePair}
                onSetEditingId={setEditingId}
                onAddEmptyPair={addEmptyPair}
                onAddToolStep={addToolStep}
                onEditStep={(pairId, step) => setSelectedStep({ pairId, step })}
                onDeleteStep={deleteStep}
                onUpdateSteps={updateSteps}
              />

              <ChatInput
                inputText={inputText}
                isEvalMode={isEvalMode}
                isViewingCase={isViewingCase}
                onInputChange={setInputText}
                onSubmit={handleSendMessage}
                onExportJson={handleExportJson}
                onToggleEvalMode={handleToggleEvalMode}
                onEditCase={handleEditCaseFromHeader}
                onDeleteCase={handleDeleteCase}
                onSaveCase={handleSaveCase}
              />
            </div>
          )}

          {activeMiddleTab === 'create-agent-eval' && (
            <CreateAgentEvaluationTab
              evalSets={evalSets}
              onCreateEvaluation={handleCreateEvaluation}
              onCancel={handleCloseAgentEvalTab}
            />
          )}

          {activeMiddleTab === 'create-test' && (
            <CreateTestTab
              onCreateTest={handleCreateTest}
              onCancel={handleCloseTestTab}
            />
          )}
        </div>
      </div>

      {/* Right Column - Agent Chat */}
      {showAgentChat && (
        <div className="w-2/5 h-full flex flex-col border-l border-gray-200 bg-white">
          <div className="flex items-center h-9 bg-gray-100 border-b border-gray-300">
            <div className="flex items-center gap-2 px-3 h-9 bg-white text-gray-900 border-t-2 border-t-blue-500 border-r border-gray-300">
              <span className="text-sm">Agent Chat</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-auto">
            <Header
              isEvalMode={isEvalMode}
              isViewingCase={isViewingCase}
              onClearChat={handleClearChat}
              onToggleEvalMode={handleToggleEvalMode}
              evalSets={evalSets.map(es => es.name)}
              selectedEvalSet={evalSets.find(es => es.id === selectedEvalSet)?.name || selectedEvalSet}
              caseName={caseName}
              onEvalSetChange={(name) => {
                const evalSet = evalSets.find(es => es.name === name);
                if (evalSet) {
                  setSelectedEvalSet(evalSet.id);
                }
              }}
              onCaseNameChange={handleCaseNameChange}
              onOpenCreateModal={handleOpenCreateModal}
              onEditCase={handleEditCaseFromHeader}
              onDeleteCase={handleDeleteCase}
            />

            <ChatArea
              messages={messages}
              isEvalMode={isEvalMode}
              isViewingCase={isViewingCase}
              editingId={editingId}
              expandedSteps={expandedSteps}
              onToggleSteps={toggleSteps}
              onUpdatePair={updatePair}
              onDeletePair={deletePair}
              onSetEditingId={setEditingId}
              onAddEmptyPair={addEmptyPair}
              onAddToolStep={addToolStep}
              onEditStep={(pairId, step) => setSelectedStep({ pairId, step })}
              onDeleteStep={deleteStep}
              onUpdateSteps={updateSteps}
            />

            <ChatInput
              inputText={inputText}
              isEvalMode={isEvalMode}
              isViewingCase={isViewingCase}
              onInputChange={setInputText}
              onSubmit={handleSendMessage}
              onExportJson={handleExportJson}
              onToggleEvalMode={handleToggleEvalMode}
              onEditCase={handleEditCaseFromHeader}
              onDeleteCase={handleDeleteCase}
              onSaveCase={handleSaveCase}
            />
          </div>
        </div>
      )}

      {selectedStep && (
        <ToolEditorModal
          step={selectedStep.step}
          onClose={() => setSelectedStep(null)}
          onSave={(updates) => {
            updateStep(selectedStep.pairId, selectedStep.step.id, updates);
            setSelectedStep(null);
            toast.success('Tool call updated');
          }}
        />
      )}

      <CreateEvalSetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvalSet={handleCreateNewEvalSet}
        defaultName={newEvalSetName}
      />

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
