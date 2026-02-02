import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
    Info, Code, AlertTriangle, Activity, BookOpen,
    Lightbulb, CheckCircle2, MousePointerClick, Trophy,
    Sigma, X, Home
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

/**
 * LeetCode 13: Roman to Integer - 互動式教學教材
 */

const ROMAN_MAP = { 'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000 };

const generateAlgorithmFrames = (s) => {
    const frames = [];
    let total = 0;
    const n = s.length;
    frames.push({ str: s, index: -1, currentVal: null, nextVal: null, total: 0, action: 'start', description: '準備開始解析字串。' });

    for (let i = 0; i < n; i++) {
        const char = s[i];
        const val = ROMAN_MAP[char];
        const nextChar = i + 1 < n ? s[i + 1] : null;
        const nextVal = nextChar ? ROMAN_MAP[nextChar] : 0;

        frames.push({ str: s, index: i, currentVal: val, nextVal: nextVal, total: total, action: 'scan', description: `目前讀取 '${char}' (${val})。` });

        let operation = val < nextVal ? 'subtract' : 'add';
        let newTotal = operation === 'subtract' ? total - val : total + val;

        frames.push({
            str: s, index: i, currentVal: val, nextVal: nextVal, total: newTotal, prevTotal: total, action: operation,
            description: operation === 'subtract' ? `${val} < ${nextVal}，觸發減法。` : `一般加法規則。`
        });
        total = newTotal;
    }
    frames.push({ str: s, index: n, currentVal: null, nextVal: null, total: total, action: 'finish', description: `解析完成！結果為 ${total}。` });
    return frames;
};

export default function Problem13() {
    useSEO({
        title: "13. Roman to Integer 羅馬數字轉整數",
        description: "透過互動式動畫學習 LeetCode 13 羅馬轉整數，理解字符解析與遍歷算法，Easy 難度題目詳解",
        path: "/13-roman-to-integer"
    });

    const [inputStr, setInputStr] = useState("MCMXCIV");
    const [validStr, setValidStr] = useState("MCMXCIV");
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);
    const [activeTab, setActiveTab] = useState('visualize');
    const [showModal, setShowModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [exStep, setExStep] = useState(0);
    const [exTotal, setExTotal] = useState(0);
    const [exFeedback, setExFeedback] = useState(null);
    const [exFinished, setExFinished] = useState(false);

    const frames = useMemo(() => generateAlgorithmFrames(validStr), [validStr]);
    const currentFrame = frames[currentFrameIdx] || frames[0];

    useEffect(() => {
        let interval;
        if (isPlaying && currentFrameIdx < frames.length - 1) {
            interval = setInterval(() => setCurrentFrameIdx(prev => prev + 1), playbackSpeed);
        } else if (currentFrameIdx >= frames.length - 1) {
            setIsPlaying(false);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentFrameIdx, frames.length, playbackSpeed]);

    const handleInputChange = (e) => {
        const val = e.target.value.toUpperCase();
        if (/^[IVXLCDM]*$/.test(val)) {
            setInputStr(val);
            setErrorMsg("");
            if (val.length > 0) { setValidStr(val); handleReset(); }
        } else {
            setInputStr(val);
            setErrorMsg("請輸入有效的羅馬數字");
        }
    };

    const handlePreset = (type) => {
        const presets = { simple: "III", sub: "IV", complex: "MCMXCIV", large: "MMMDCCCLXXXVIII" };
        const newS = presets[type] || "LVIII";
        setInputStr(newS); setValidStr(newS); setErrorMsg(""); handleReset();
    };

    const handleReset = () => {
        setCurrentFrameIdx(0); setIsPlaying(false);
        setExStep(0); setExTotal(0); setExFeedback(null); setExFinished(false);
    };

    const handleExerciseChoice = (choice) => {
        const char = validStr[exStep];
        const val = ROMAN_MAP[char];
        const nextVal = (exStep + 1 < validStr.length) ? ROMAN_MAP[validStr[exStep + 1]] : 0;
        const correct = val < nextVal ? 'sub' : 'add';

        if (choice === correct) {
            const nextTotal = choice === 'add' ? exTotal + val : exTotal - val;
            setExTotal(nextTotal);
            setExFeedback({ type: 'success', msg: `正確！${choice === 'add' ? '加上' : '減去'}了 ${val}` });
            if (exStep + 1 >= validStr.length) setExFinished(true); else setExStep(prev => prev + 1);
        } else {
            setExFeedback({ type: 'error', msg: `答錯囉，看看預讀值！` });
        }
        setTimeout(() => { if (!exFinished) setExFeedback(null); }, 1200);
    };

    const getBlockStyle = (idx, frame) => {
        if (frame.index === idx) return "bg-indigo-600 text-white border-indigo-700 shadow-lg scale-110 z-10";
        if (frame.index !== -1 && idx === frame.index + 1) return "bg-amber-100 text-amber-700 border-amber-300 shadow-md ring-2 ring-amber-200";
        if (idx < frame.index) return "bg-slate-200 text-slate-400 border-slate-300 opacity-60";
        return "bg-white text-slate-700 border-slate-200";
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
            {/* Header */}
            <header className="bg-slate-900 text-white p-3 md:p-4 flex justify-between items-center shadow-md shrink-0 z-20">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="bg-indigo-500 p-1.5 md:p-2 rounded-lg shadow-lg">
                        <Sigma size={20} className="text-white md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h1 className="text-sm md:text-lg font-bold">13. Roman to Integer</h1>
                        <div className="flex gap-1.5 text-[10px] md:text-xs text-slate-400">
                            <span className="bg-emerald-900 text-emerald-400 px-1 rounded border border-emerald-800">Easy</span>
                            <span className="hidden sm:inline">String & Math</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md transition text-xs font-medium border border-slate-600">
                        <Info size={14} />
                        <span className="hidden sm:inline">說明</span>
                    </button>
                    <Link to="/" className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md transition text-xs font-medium border border-slate-600">
                        <Home size={14} />
                        <span className="hidden sm:inline">首頁</span>
                    </Link>
                </div>
            </header>

            <main className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-full lg:w-80 xl:w-96 bg-white border-b lg:border-r border-slate-200 flex flex-col shadow-sm z-10 max-h-[45vh] lg:max-h-none overflow-y-auto">
                    <div className="p-4 border-b border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">羅馬數字輸入</label>
                        <input
                            type="text"
                            value={inputStr}
                            onChange={handleInputChange}
                            className={`w-full p-2 border rounded-md font-mono text-base tracking-widest uppercase outline-none transition-all ${errorMsg ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-200'}`}
                        />
                        <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5 mt-3">
                            {['simple', 'sub', 'complex', 'large'].map(t => (
                                <button key={t} onClick={() => handlePreset(t)} className="text-[10px] px-1 py-1.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-600 truncate">
                                    {t === 'simple' ? '基本' : t === 'sub' ? '減法' : t === 'complex' ? '複雜' : '最長'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                        <div className="flex justify-center items-center gap-4 mb-3">
                            <button onClick={handleReset} className="p-1.5 text-slate-500"><RotateCcw size={18} /></button>
                            <button onClick={() => setCurrentFrameIdx(Math.max(0, currentFrameIdx - 1))} className="p-2 bg-white border border-slate-200 rounded-full text-indigo-600 shadow-sm"><ChevronLeft size={20} /></button>
                            <button onClick={() => setIsPlaying(!isPlaying)} className={`p-3 rounded-full text-white shadow-md ${isPlaying ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                                {isPlaying ? <Pause className="fill-current" /> : <Play className="ml-0.5 fill-current" />}
                            </button>
                            <button onClick={() => setCurrentFrameIdx(Math.min(frames.length - 1, currentFrameIdx + 1))} className="p-2 bg-white border border-slate-200 rounded-full text-indigo-600 shadow-sm"><ChevronRight size={20} /></button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="shrink-0">速度</span>
                            <input type="range" min="200" max="2000" step="100" value={playbackSpeed} onChange={(e) => setPlaybackSpeed(Number(e.target.value))} className="flex-1 h-1 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer" />
                            <span className="shrink-0 w-8 text-right">{playbackSpeed}ms</span>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div><div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">當前</div><div className="font-mono font-bold text-indigo-700">{currentFrame.currentVal || '-'}</div></div>
                                <div><div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">預讀</div><div className="font-mono font-bold text-amber-600">{currentFrame.nextVal || '-'}</div></div>
                                <div><div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">總和</div><div className="font-mono font-bold text-indigo-800 text-lg">{currentFrame.total}</div></div>
                            </div>
                        </div>
                        <div className="bg-slate-800 text-slate-100 p-3 rounded-lg text-xs leading-relaxed min-h-[60px] lg:min-h-[100px] border-l-4 border-indigo-500 font-medium">
                            {currentFrame.description}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <section className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
                    <div className="flex border-b border-slate-200 bg-white overflow-x-auto shrink-0">
                        {[
                            { id: 'visualize', label: '視覺化', icon: Activity },
                            { id: 'exercise', label: '練習', icon: MousePointerClick },
                            { id: 'intro', label: '教學', icon: BookOpen },
                            { id: 'error', label: '陷阱', icon: AlertTriangle },
                            { id: 'code', label: '程式碼', icon: Code }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === t.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-500'}`}
                            >
                                <t.icon size={14} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        {/* Visualize Tab */}
                        {activeTab === 'visualize' && (
                            <div className="flex flex-col items-center pt-4 md:pt-10">
                                <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16">
                                    {validStr.split('').map((char, idx) => (
                                        <div key={idx} className={`relative w-10 h-14 md:w-16 md:h-20 rounded-lg flex items-center justify-center text-lg md:text-3xl font-bold border-2 transition-all duration-300 ${getBlockStyle(idx, currentFrame)}`}>
                                            {char}
                                            {(idx === currentFrame.index || idx === currentFrame.index + 1) && (
                                                <div className={`absolute -top-3 -right-3 w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold border shadow-sm z-20 ${idx === currentFrame.index ? 'bg-indigo-600 text-white' : 'bg-amber-400 text-amber-900'}`}>{ROMAN_MAP[char]}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {(currentFrame.action === 'add' || currentFrame.action === 'subtract') && (
                                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-2">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">當前運算</div>
                                        <div className="flex items-center gap-2 md:gap-4 text-xl md:text-3xl font-mono font-black">
                                            <span className="text-slate-400 text-sm md:text-base">{currentFrame.prevTotal}</span>
                                            <span className={currentFrame.action === 'add' ? "text-emerald-500" : "text-red-500"}>{currentFrame.action === 'add' ? '+' : '-'}</span>
                                            <span className="text-indigo-600">{currentFrame.currentVal}</span>
                                            <span className="text-slate-300">=</span>
                                            <span className="text-slate-800">{currentFrame.total}</span>
                                        </div>
                                    </div>
                                )}
                                {currentFrame.action === 'finish' && (
                                    <div className="text-center">
                                        <Trophy size={48} className="text-amber-500 mx-auto mb-2" />
                                        <div className="text-3xl font-black text-slate-800">{currentFrame.total}</div>
                                        <div className="text-xs text-slate-500 font-bold">CONVERSION COMPLETE</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Exercise Tab */}
                        {activeTab === 'exercise' && (
                            <div className="flex flex-col items-center max-w-lg mx-auto">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold mb-1">我是解碼員</h2>
                                    <p className="text-xs text-slate-500">當前應執行加法或減法？</p>
                                </div>
                                <div className="flex justify-center gap-2 mb-10">
                                    {validStr.split('').map((char, idx) => (
                                        <div key={idx} className={`relative w-9 h-12 md:w-12 md:h-16 rounded-lg flex items-center justify-center font-bold border-2 transition-all ${idx === exStep ? 'bg-indigo-600 text-white border-indigo-500 scale-110 shadow-lg' : idx < exStep ? 'bg-slate-100 text-slate-300' : 'bg-white text-slate-400'}`}>
                                            {char}
                                            {idx === exStep && <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[8px] w-5 h-5 rounded-full flex items-center justify-center">{ROMAN_MAP[char]}</div>}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-4xl font-black text-indigo-600 mb-8">{exTotal}</div>
                                {!exFinished ? (
                                    <div className="flex gap-4 w-full">
                                        <button onClick={() => handleExerciseChoice('add')} className="flex-1 py-4 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-400 font-bold active:scale-95 transition flex flex-col items-center">
                                            <span className="text-xl text-emerald-500">+</span>加法
                                        </button>
                                        <button onClick={() => handleExerciseChoice('sub')} className="flex-1 py-4 bg-white border-2 border-slate-200 rounded-xl hover:border-red-400 font-bold active:scale-95 transition flex flex-col items-center">
                                            <span className="text-xl text-red-500">-</span>減法
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={handleReset} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">重新練習</button>
                                )}
                                {exFeedback && (
                                    <div className={`mt-6 p-4 rounded-xl border text-sm font-bold flex items-center gap-2 ${exFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                        {exFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                                        {exFeedback.msg}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Intro Tab */}
                        {activeTab === 'intro' && (
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-md">
                                    <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                                        <Lightbulb className="text-amber-300" />解題核心：預讀
                                    </h2>
                                    <p className="text-indigo-100 text-sm opacity-90">小的在大的左邊時，代表減法運算。</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-bold mb-2 text-indigo-700 flex items-center gap-1.5">
                                            <div className="w-4 h-4 bg-indigo-100 rounded-full text-[10px] flex items-center justify-center">1</div>加法規則
                                        </h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">當 <code>curr ≥ next</code>。例如：VI (5+1=6)。</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-bold mb-2 text-amber-700 flex items-center gap-1.5">
                                            <div className="w-4 h-4 bg-amber-100 rounded-full text-[10px] flex items-center justify-center">2</div>減法規則
                                        </h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">當 <code>{'curr < next'}</code>。例如：IV (-1+5=4)。</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Tab */}
                        {activeTab === 'error' && (
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="bg-red-50 border border-red-100 p-5 rounded-xl">
                                    <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                        <X size={18} />索引越界 (Index Out of Bounds)
                                    </h3>
                                    <p className="text-xs text-red-700 leading-relaxed">在比較 <code>s[i]</code> 與 <code>s[i+1]</code> 時，若不檢查 <code>{'i+1 < s.length'}</code>，在許多強型別語言會導致程式崩潰。</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl">
                                    <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                        <AlertTriangle size={18} />不合法的組合
                                    </h3>
                                    <p className="text-xs text-amber-700 leading-relaxed">題目保證輸入合法，但現實中如 <code>VV</code> (應為 X) 是錯誤的，面試時可主動提及對輸入數據的校驗。</p>
                                </div>
                            </div>
                        )}

                        {/* Code Tab */}
                        {activeTab === 'code' && (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                                    <div className="flex gap-1.5 px-4 py-3 bg-slate-800 border-b border-slate-700">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                        <span className="ml-2 text-[10px] text-slate-400 font-mono">Solution.py</span>
                                    </div>
                                    <pre className="p-4 text-[11px] md:text-xs text-slate-300 font-mono overflow-x-auto">
                                        <code>{`class Solution:
    def romanToInt(self, s: str) -> int:
        d = {'I':1, 'V':5, 'X':10, 'L':50, 'C':100, 'D':500, 'M':1000}
        total = 0
        n = len(s)
        for i in range(n):
            v = d[s[i]]
            if i + 1 < n and v < d[s[i+1]]:
                total -= v
            else:
                total += v
        return total`}</code>
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">13. Roman to Integer</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 text-xs text-slate-600 space-y-4 overflow-y-auto max-h-[60vh]">
                            <p>羅馬數字由 <code>I, V, X, L, C, D, M</code> 組成。通常大的在左，小的在右。但在特定的六個組合中會使用減法：</p>
                            <div className="grid grid-cols-2 gap-2 font-mono bg-slate-100 p-3 rounded text-indigo-700 text-center">
                                <div>IV: 4 / IX: 9</div>
                                <div>XL: 40 / XC: 90</div>
                                <div className="col-span-2">CD: 400 / CM: 900</div>
                            </div>
                            <p>輸入保證在 1 到 3999 的範圍內。</p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setShowModal(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs">開始學習</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}