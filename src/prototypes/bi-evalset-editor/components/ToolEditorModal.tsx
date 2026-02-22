import React, { useState } from 'react';
import { X, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import type { Step } from '../types';
import { AVAILABLE_TOOLS } from '../types';

interface ToolEditorModalProps {
  step: Step;
  onClose: () => void;
  onSave: (updates: Partial<Step>) => void;
}

export const ToolEditorModal: React.FC<ToolEditorModalProps> = ({ step, onClose, onSave }) => {
  const [name, setName] = useState(step.name);
  const [inputValues, setInputValues] = useState<Record<string, any>>(step.inputValues || {});
  const [outputValues, setOutputValues] = useState<Record<string, any>>(step.outputValues || {});

  const inputSchema = typeof step.input === 'object' ? step.input : null;
  const outputSchema = typeof step.output === 'object' ? step.output : null;

  const handleInputChange = (fieldName: string, value: any) => {
    setInputValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleOutputChange = (fieldName: string, value: any) => {
    setOutputValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const renderField = (
    fieldName: string,
    fieldSchema: { type: string; format?: string },
    value: any,
    onChange: (val: any) => void
  ) => {
    const inputType =
      fieldSchema.type === 'integer' || fieldSchema.type === 'number' ? 'number' : 'text';

    return (
      <div key={fieldName} className="flex items-center gap-2">
        <label className="text-[13px] font-medium text-gray-600 min-w-[80px]">{fieldName}:</label>
        <input
          type={inputType}
          value={value ?? ''}
          onChange={(e) => {
            const val =
              inputType === 'number'
                ? e.target.value === ''
                  ? ''
                  : Number(e.target.value)
                : e.target.value;
            onChange(val);
          }}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[14px] focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-600" />
            <h2 className="text-[15px] font-bold text-gray-800">Edit Tool Call</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Tool Name
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            >
              {AVAILABLE_TOOLS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {inputSchema && inputSchema.properties && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Input Arguments
              </label>
              <div className="space-y-2">
                {Object.entries(inputSchema.properties).map(([fieldName, fieldSchema]) =>
                  renderField(fieldName, fieldSchema, inputValues[fieldName], (val) =>
                    handleInputChange(fieldName, val)
                  )
                )}
              </div>
            </div>
          )}

          {outputSchema && outputSchema.properties && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Output / Result
              </label>
              <div className="space-y-2">
                {Object.entries(outputSchema.properties).map(([fieldName, fieldSchema]) =>
                  renderField(fieldName, fieldSchema, outputValues[fieldName], (val) =>
                    handleOutputChange(fieldName, val)
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ name, inputValues, outputValues })}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[14px] font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};
