import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  Play,
  PlayCircle,
  Circle,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Beaker,
  Edit2,
  Trash2,
  Bot,
  List,
  FolderTree,
  Folder,
  FileText
} from 'lucide-react';
import { CreateEvalSetModal } from './CreateEvalSetModal';
import type { EvalSet, TestStatus } from '../types';

interface ProjectTreeProps {
  evalSets: EvalSet[];
  onCreateEvalSet: (name: string) => void;
  onViewCase: (evalSetId: string, caseId: string) => void;
  onEditCase: (evalSetId: string, caseId: string) => void;
  onAddCaseToEvalSet: (evalSetId: string) => void;
  onOpenTestTab?: () => void;
  onOpenAgentEvaluationTab?: () => void;
}

interface TestItem {
  id: string;
  name: string;
  status?: TestStatus;
  type?: 'test' | 'ai-evaluation';
  groups?: string[];
}

interface TestGroup {
  id: string;
  name: string;
  tests: TestItem[];
}

interface TestSection {
  id: string;
  name: string;
  groups: TestGroup[];
}

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'passed':
      return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
    case 'failed':
      return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    case 'running':
      return <PlayCircle className="w-3.5 h-3.5 text-blue-500" />;
    case 'pending':
    default:
      return <Circle className="w-3.5 h-3.5 text-gray-400" />;
  }
};

const getTestTypeIcon = (type?: 'test' | 'ai-evaluation') => {
  if (type === 'ai-evaluation') {
    return <Bot className="w-3 h-3 text-cyan-700" />;
  }
  return null;
};

const getGroupIcon = (sectionId: string) => {
  if (sectionId === 'eval-sets') {
    return <Folder className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />;
  }
  return <Circle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />;
};

const getCaseIcon = (sectionId: string) => {
  if (sectionId === 'eval-sets') {
    return <FileText className="w-3.5 h-3.5 text-blue-500" />;
  }
  return null;
};

export const ProjectTree: React.FC<ProjectTreeProps> = ({
  evalSets,
  onCreateEvalSet,
  onViewCase,
  onEditCase,
  onAddCaseToEvalSet,
  onOpenTestTab,
  onOpenAgentEvaluationTab
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['tests', 'eval-sets'])
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['default-group', 'evaluations-group', evalSets[0]?.id])
  );
  const [filter, setFilter] = useState('');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Dialog states
  const [, setCreateTestDialogOpen] = useState(false);
  const [, setCreateEvaluationDialogOpen] = useState(false);
  const [createEvalSetDialogOpen, setCreateEvalSetDialogOpen] = useState(false);
  const [evalSetName, setEvalSetName] = useState('');

  // Generate test data with actual eval sets
  const allTests: TestItem[] = [
    { id: 'test1', name: 'test', status: 'pending', type: 'test', groups: ['default-group'] },
    { id: 'test2', name: 'jhbjh', status: 'pending', type: 'test', groups: ['default-group'] },
    { id: 'test3', name: 'myTest', status: 'pending', type: 'test', groups: ['default-group'] },
    { id: 'test4', name: 'myFunction2', status: 'pending', type: 'test', groups: ['default-group'] },
    { id: 'eval1', name: 'agentEval1', status: 'pending', type: 'ai-evaluation', groups: ['evaluations-group'] },
    { id: 'eval2', name: 'agentEval2', status: 'pending', type: 'ai-evaluation', groups: ['evaluations-group'] },
    { id: 'test5', name: 'testToolTrajectory', status: 'pending', type: 'ai-evaluation', groups: ['evaluations-group'] }
  ];

  const mockTestData: TestSection[] = [
    {
      id: 'tests',
      name: 'Tests',
      groups: [
        {
          id: 'default-group',
          name: 'Default Group',
          tests: allTests.filter(t => t.groups?.includes('default-group'))
        },
        {
          id: 'evaluations-group',
          name: 'Evaluations',
          tests: allTests.filter(t => t.groups?.includes('evaluations-group'))
        }
      ]
    },
    {
      id: 'eval-sets',
      name: 'Eval Sets',
      groups: evalSets.map(evalSet => ({
        id: evalSet.id,
        name: evalSet.name,
        tests: evalSet.cases.map(c => ({
          id: c.id,
          name: c.name,
          status: c.status
        }))
      }))
    }
  ];

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleAddSection = (sectionId: string) => {
    if (sectionId === 'tests') {
      // Toggle dropdown menu for test type selection
      setShowAddMenu(showAddMenu === sectionId ? null : sectionId);
    } else if (sectionId === 'eval-sets') {
      setEvalSetName('');
      setCreateEvalSetDialogOpen(true);
    }
  };

  const handleAddTest = () => {
    setShowAddMenu(null);
    if (onOpenTestTab) {
      onOpenTestTab();
    } else {
      setCreateTestDialogOpen(true);
    }
  };

  const handleAddEvaluation = () => {
    setShowAddMenu(null);
    if (onOpenAgentEvaluationTab) {
      onOpenAgentEvaluationTab();
    } else {
      setCreateEvaluationDialogOpen(true);
    }
  };

  const handleCreateEvalSet = (name: string) => {
    onCreateEvalSet(name);
  };

  const handleEditGroup = (groupId: string) => {
    console.log('Edit group:', groupId);
    // TODO: Implement group editing
  };

  const handleDeleteGroup = (groupId: string) => {
    console.log('Delete group:', groupId);
    // TODO: Implement group deletion
  };

  const handleRunItem = (itemId: string) => {
    console.log('Run item:', itemId);
    // TODO: Implement item execution
  };

  const handleEditItem = (itemId: string, sectionId: string, evalSetId?: string) => {
    if (sectionId === 'eval-sets' && evalSetId) {
      // Edit the case
      onEditCase(evalSetId, itemId);
    } else {
      console.log('Edit item:', itemId, 'in section:', sectionId);
      // TODO: Implement item editing for other types
    }
  };

  const handleDeleteItem = (itemId: string) => {
    console.log('Delete item:', itemId);
    // TODO: Implement item deletion
  };

  return (
    <div className="w-full h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-white">
        <span className="text-[13px] font-semibold text-gray-700">TESTING</span>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded" title="Add Test">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded" title="Refresh Tests">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded" title="Run All Tests">
            <Play className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded" title="More Actions">
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="px-3 py-2 border-b border-gray-200 bg-white">
        <div className="relative">
          <input
            type="text"
            placeholder="Filter (e.g. text, !exclude, @tag)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-1.5 pr-8 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Test Counter */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <Circle className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[13px] text-gray-700">0/0</span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded" title="Run Tests">
          <Play className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </div>

      {/* Test Sections */}
      <div className="flex-1 overflow-y-auto">
        {mockTestData.map((section) => {
          const isSectionExpanded = expandedSections.has(section.id);
          const isHovered = hoveredSection === section.id;
          return (
            <div key={section.id}>
              {/* Section Header */}
              <div
                className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 border-b border-gray-200 group"
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div
                  className="flex items-center gap-1.5 flex-1 cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                >
                  {isSectionExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  )}
                  <span className="text-[12px] font-semibold text-gray-800 uppercase tracking-wide">
                    {section.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {isHovered && section.id === 'tests' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode(viewMode === 'grouped' ? 'flat' : 'grouped');
                      }}
                      className="p-0.5 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title={viewMode === 'grouped' ? 'Switch to Flat View' : 'Switch to Grouped View'}
                    >
                      {viewMode === 'grouped' ? (
                        <List className="w-3.5 h-3.5 text-gray-600" />
                      ) : (
                        <FolderTree className="w-3.5 h-3.5 text-gray-600" />
                      )}
                    </button>
                  )}
                  {isHovered && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSection(section.id);
                        }}
                        className="p-0.5 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Add ${section.name.slice(0, -1)}`}
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      {showAddMenu === section.id && section.id === 'tests' && (
                        <div
                          ref={addMenuRef}
                          className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[180px]"
                        >
                          <button
                            onClick={handleAddTest}
                            className="w-full px-3 py-1.5 text-left text-[13px] hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Beaker className="w-4 h-4 text-gray-600" />
                            New Test
                          </button>
                          <button
                            onClick={handleAddEvaluation}
                            className="w-full px-3 py-1.5 text-left text-[13px] hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Bot className="w-4 h-4 text-gray-600" />
                            New AI Evaluation
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Flat View - All tests at same level */}
              {isSectionExpanded && section.id === 'tests' && viewMode === 'flat' && allTests.map((test) => {
                const isItemHovered = hoveredItem === test.id;
                return (
                  <div
                    key={test.id}
                    className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 group cursor-pointer"
                    style={{ paddingLeft: '24px' }}
                    onMouseEnter={() => setHoveredItem(test.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="flex items-center gap-1.5 flex-1">
                      {getStatusIcon(test.status)}
                      {getTestTypeIcon(test.type)}
                      <span className="text-[13px] text-gray-700">{test.name}</span>
                      {test.groups && test.groups.length > 0 && (
                        <span className="text-[11px] text-gray-500 ml-2">
                          [{test.groups.map(g => g.replace('-group', '')).join(', ')}]
                        </span>
                      )}
                      {test.groups && test.groups.length > 1 && (
                        <span className="text-[11px] text-blue-600 ml-1">×{test.groups.length}</span>
                      )}
                    </div>
                    {isItemHovered && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunItem(test.id);
                          }}
                          className="p-0.5 hover:bg-gray-200 rounded"
                          title="Run"
                        >
                          <Play className="w-3 h-3 text-green-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditItem(test.id, section.id);
                          }}
                          className="p-0.5 hover:bg-gray-200 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(test.id);
                          }}
                          className="p-0.5 hover:bg-gray-200 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Groups - Grouped View */}
              {isSectionExpanded && (section.id !== 'tests' || viewMode === 'grouped') && section.groups.map((group) => {
                const isGroupExpanded = expandedGroups.has(group.id);
                const isGroupHovered = hoveredGroup === group.id;
                return (
                  <div key={group.id}>
                    {/* Group Header */}
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 group"
                      style={{ paddingLeft: '24px' }}
                      onMouseEnter={() => setHoveredGroup(group.id)}
                      onMouseLeave={() => setHoveredGroup(null)}
                    >
                      <div
                        className="flex items-center gap-1.5 flex-1 cursor-pointer"
                        onClick={() => toggleGroup(group.id)}
                      >
                        {isGroupExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        )}
                        {getGroupIcon(section.id)}
                        <span className="text-[13px] text-gray-700">{group.name}</span>
                      </div>
                      {isGroupHovered && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {section.id === 'eval-sets' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddCaseToEvalSet(group.id);
                              }}
                              className="p-0.5 hover:bg-gray-200 rounded"
                              title="Add Case"
                            >
                              <Plus className="w-3 h-3 text-gray-600" />
                            </button>
                          )}
                          {section.id === 'tests' && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAddMenu(showAddMenu === group.id ? null : group.id);
                                }}
                                className="p-0.5 hover:bg-gray-200 rounded"
                                title="Add Test"
                              >
                                <Plus className="w-3 h-3 text-gray-600" />
                              </button>
                              {showAddMenu === group.id && (
                                <div
                                  ref={addMenuRef}
                                  className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[180px]"
                                >
                                  <button
                                    onClick={handleAddTest}
                                    className="w-full px-3 py-1.5 text-left text-[13px] hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <Beaker className="w-4 h-4 text-gray-600" />
                                    New Test
                                  </button>
                                  <button
                                    onClick={handleAddEvaluation}
                                    className="w-full px-3 py-1.5 text-left text-[13px] hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <Bot className="w-4 h-4 text-gray-600" />
                                    New AI Evaluation
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditGroup(group.id);
                            }}
                            className="p-0.5 hover:bg-gray-200 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group.id);
                            }}
                            className="p-0.5 hover:bg-gray-200 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tests */}
                    {isGroupExpanded && group.tests.map((test) => {
                      const isItemHovered = hoveredItem === test.id;
                      const isEvalSetCase = section.id === 'eval-sets';
                      return (
                        <div
                          key={test.id}
                          className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 group cursor-pointer"
                          style={{ paddingLeft: '64px' }}
                          onMouseEnter={() => setHoveredItem(test.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() => {
                            if (isEvalSetCase) {
                              onViewCase(group.id, test.id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-1.5 flex-1">
                            {section.id === 'eval-sets' ? (
                              getCaseIcon(section.id)
                            ) : (
                              <>
                                {getStatusIcon(test.status)}
                                {getTestTypeIcon(test.type)}
                              </>
                            )}
                            <span className="text-[13px] text-gray-700">{test.name}</span>
                          </div>
                          {isItemHovered && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRunItem(test.id);
                                }}
                                className="p-0.5 hover:bg-gray-200 rounded"
                                title="Run"
                              >
                                <Play className="w-3 h-3 text-green-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditItem(test.id, section.id, group.id);
                                }}
                                className="p-0.5 hover:bg-gray-200 rounded"
                                title="Edit"
                              >
                                <Edit2 className="w-3 h-3 text-gray-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(test.id);
                                }}
                                className="p-0.5 hover:bg-gray-200 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Dialogs
      <CreateTestDialog
        open={createTestDialogOpen}
        onOpenChange={setCreateTestDialogOpen}
        onCreateTest={handleCreateTest}
      />
      <CreateAgentEvaluationDialog
        open={createEvaluationDialogOpen}
        onOpenChange={setCreateEvaluationDialogOpen}
        evalSets={evalSets}
        onCreateEvaluation={handleCreateEvaluation}
      /> */}
      <CreateEvalSetModal
        isOpen={createEvalSetDialogOpen}
        onClose={() => setCreateEvalSetDialogOpen(false)}
        onCreateEvalSet={handleCreateEvalSet}
        defaultName={evalSetName}
      />
    </div>
  );
};
