import React, { useState } from 'react';
import { Play, Loader2, ClipboardCheck, ArrowRight, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { runAutomationTask } from '../services/geminiService';
import { SAMPLE_PROMPTS } from '../constants';

const AutomationLab: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [taskType, setTaskType] = useState('Summarize and Extract Action Items');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRun = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await runAutomationTask(inputText, taskType);
      setResult(response);
    } catch (error) {
      console.error(error);
      setResult("Error executing automation task.");
    } finally {
      setLoading(false);
    }
  };

  const tasks = [
    "Summarize and Extract Action Items",
    "Translate to Spanish and French",
    "Analyze Sentiment and Tone",
    "Convert Unstructured Data to JSON",
    "Proofread and Improve Grammar"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="text-amber-400" />
          Automation Lab
        </h1>
        <p className="text-slate-400">
          This lab demonstrates Gemini's ability to follow complex <code className="text-amber-400">systemInstruction</code> sets.
          Select a predefined "Agent Behavior" and see how it processes your input.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              1. Select Agent Skill
            </label>
            <div className="space-y-2">
              {tasks.map((task) => (
                <button
                  key={task}
                  onClick={() => setTaskType(task)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                    taskType === task
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/50'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {task}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Input & Output */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              2. Input Data
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste text, meeting notes, code, or data here..."
              className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors resize-none font-mono text-sm"
            />
             {/* Quick fill */}
             <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              <span className="text-xs text-slate-500 whitespace-nowrap pt-1">Try:</span>
              {SAMPLE_PROMPTS.automation.map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => setInputText(p)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  Example {i + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleRun}
                disabled={loading || !inputText}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                Run Automation
              </button>
            </div>
          </div>

          {/* Result Area */}
          {result && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="absolute top-6 right-6 text-slate-600">
                  <ClipboardCheck size={20} />
               </div>
               <label className="block text-xs font-semibold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <ArrowRight size={14} /> Result
               </label>
               <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-slate-100">
                  <ReactMarkdown>{result}</ReactMarkdown>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationLab;
