import React, { useState, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Loader2, Search, TrendingUp, TrendingDown, Minus, Upload, FileText, X } from 'lucide-react';
import { generateDashboardData } from '../services/geminiService';
import { GeneratedDashboard, DashboardMetric } from '../types';
import { SAMPLE_PROMPTS } from '../constants';

const DashboardBuilder: React.FC = () => {
  const [mode, setMode] = useState<'topic' | 'upload'>('topic');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GeneratedDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async (input: string, isFile: boolean) => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateDashboardData(input, isFile);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.name.match(/\.(csv|json|txt|md)$/i)) {
        setError("Please upload a supported text format (CSV, JSON, TXT, MD).");
        return;
    }

    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
        try {
            const content = ev.target?.result as string;
            await handleGenerate(content, true);
        } catch (err: any) {
             setError(err.message || "Failed to process file");
             setLoading(false);
        }
    };
    reader.onerror = () => {
        setError("Failed to read file");
        setLoading(false);
    }
    reader.readAsText(file);
  };

  const renderMetricCard = (metric: DashboardMetric, index: number) => {
    const trendColor = metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-slate-400';
    const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;

    return (
      <div key={index} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">{metric.label}</h3>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-white">{metric.value}</span>
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColor} bg-slate-900/50 px-2 py-1 rounded-lg`}>
            <TrendIcon size={16} />
            {metric.percentage}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Dashboard Generator</h1>
        <p className="text-slate-400 max-w-2xl">
          Master structured data generation. Choose to generate from a <span className="text-cyan-400">Topic</span> or upload <span className="text-cyan-400">Real Data</span>.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl w-fit border border-slate-700">
        <button
            onClick={() => { setMode('topic'); setData(null); setError(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'topic' 
                ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
        >
            <Search size={16} />
            By Topic
        </button>
        <button
            onClick={() => { setMode('upload'); setData(null); setError(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'upload' 
                ? 'bg-cyan-500/10 text-cyan-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
        >
            <Upload size={16} />
            From File
        </button>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700 shadow-lg transition-colors min-h-[80px] flex flex-col justify-center">
        {mode === 'topic' ? (
            <div className="flex items-center w-full px-2">
                <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate(topic, false)}
                placeholder="e.g., 'EV Sales in Europe 2024' or 'Tech Stock performance'"
                className="bg-transparent border-none text-white w-full px-4 py-3 focus:outline-none placeholder-slate-500"
                />
                <button
                onClick={() => handleGenerate(topic, false)}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                Generate
                </button>
            </div>
        ) : (
            <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    loading ? 'border-slate-600 bg-slate-800/30' : 'border-slate-600 hover:border-cyan-500/50 hover:bg-slate-800'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.txt,.md"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={loading}
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin text-cyan-400" size={32} />
                            <span className="text-slate-300 font-medium">Analyzing dataset...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                                <FileText className="text-slate-300" size={24} />
                            </div>
                            <div>
                                <div className="text-slate-200 font-medium">Click or Drag file to upload</div>
                                <div className="text-slate-500 text-sm mt-1">Supports CSV, JSON, TXT</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Sample Prompts (Topic Mode Only) */}
      {!data && !loading && mode === 'topic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_PROMPTS.dashboard.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => { setTopic(prompt); handleGenerate(prompt, false); }}
              className="text-left p-4 rounded-xl border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400 transition-all text-sm"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center justify-between">
          <span>Error: {error}</span>
          <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

      {/* Results View */}
      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h2 className="text-2xl font-bold text-white">{data.title}</h2>
                 {mode === 'upload' && <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2 py-1 rounded border border-cyan-500/20">File Data</span>}
              </div>
              <p className="text-slate-400">{data.summary}</p>
            </div>
            <button onClick={() => setData(null)} className="text-slate-500 hover:text-white text-sm">Clear Results</button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.metrics.map(renderMetricCard)}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.charts.map((chart, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl h-[400px] flex flex-col">
                <h3 className="text-lg font-medium text-white mb-6">{chart.title}</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.type === 'bar' ? (
                      <BarChart data={chart.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey={chart.xAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                            itemStyle={{ color: '#cbd5e1' }}
                        />
                        <Bar dataKey={chart.dataKey} fill="#06b6d4" radius={[4, 4, 0, 0]}>
                            {chart.data.map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={i % 2 === 0 ? '#06b6d4' : '#0891b2'} />
                            ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <AreaChart data={chart.data}>
                        <defs>
                          <linearGradient id={`color-${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey={chart.xAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                            itemStyle={{ color: '#cbd5e1' }}
                        />
                        <Area type="monotone" dataKey={chart.dataKey} stroke="#8b5cf6" fillOpacity={1} fill={`url(#color-${idx})`} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBuilder;