import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Play, Pause, SkipBack, SkipForward, RefreshCw,
    TrendingUp, AlertCircle, Code, BookOpen, MousePointer2,
    Info, ChevronRight, CheckCircle2, XCircle, Hash, Type, Home, ArrowLeft
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

// --- 核心演算法邏輯 ---

const ROMAN_MAP = [
    { val: 1000, sym: 'M' },
    { val: 900, sym: 'CM' },
    { val: 500, sym: 'D' },
    { val: 400, sym: 'CD' },
    { val: 100, sym: 'C' },
    { val: 90, sym: 'XC' },
    { val: 50, sym: 'L' },
    { val: 40, sym: 'XL' },
    { val: 10, sym: 'X' },
    { val: 9, sym: 'IX' },
    { val: 5, sym: 'V' },
    { val: 4, sym: 'IV' },
    { val: 1, sym: 'I' }
];

const generateAlgorithmFrames = (initialNum) => {
    const frames = [];
    let num = initialNum;
    let result = "";

    frames.push({
        num,
        result,
        currentMapIdx: -1,
        highlightSym: null,
        action: "INIT",
        description: `準備開始！目標將整數 ${initialNum} 轉換為羅馬數字。`
    });

    for (let i = 0; i < ROMAN_MAP.length; i++) {
        const { val, sym } = ROMAN_MAP[i];

        frames.push({
            num,
            result,
            currentMapIdx: i,
            highlightSym: sym,
            action: "COMPARE",
            description: `檢查：剩餘數值 ${num} 是否大於等於 ${val} (${sym})？`
        });

        while (num >= val) {
            const prevNum = num;
            num -= val;
            result += sym;

            frames.push({
                num,
                prevNum,
                result,
                currentMapIdx: i,
                highlightSym: sym,
                action: "SUBTRACT",
                description: `是！從 ${prevNum} 減去 ${val}，並在結果後加上 "${sym}"。剩餘：${num}。`
            });
        }
    }

    frames.push({
        num,
        result,
        currentMapIdx: -1,
        highlightSym: null,
        action: "DONE",
        description: `轉換完成！${initialNum} 的羅馬數字為 ${result}。`
    });

    return frames;
};

// --- 子元件 (淺色主題) ---

const Card = ({ title, children, className = "" }) => (
    <div className={`rounded-xl shadow-sm overflow-hidden ${className}`} style={{ backgroundColor: '#fff', border: '1px solid #eaecef' }}>
        <div className="px-4 py-3 font-semibold flex items-center gap-2" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eaecef', color: '#1a202c' }}>
            {title}
        </div>
        <div className="p-4">
            {children}
        </div>
    </div>
);

const PythonCodeBlock = ({ code }) => {
    const highlight = (text) => {
        const patterns = [
            { type: 'comment', regex: /(#.*)/g, color: 'text-gray-500 italic' },
            { type: 'string', regex: /('.*?'|".*?")/g, color: 'text-emerald-600' },
            { type: 'keyword', regex: /\b(def|class|return|if|else|elif|while|for|in|break|continue|import|from|pass|lambda)\b/g, color: 'text-pink-600 font-semibold' },
            { type: 'builtin', regex: /\b(int|str|list|dict|len|range|print|divmod|enumerate|zip)\b/g, color: 'text-cyan-600' },
            { type: 'boolean', regex: /\b(True|False|None)\b/g, color: 'text-rose-600' },
            { type: 'number', regex: /\b\d+\b/g, color: 'text-amber-600' },
            { type: 'self', regex: /\bself\b/g, color: 'text-indigo-500 italic' },
            { type: 'function', regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/g, color: 'text-blue-600' },
        ];

        return text.split('\n').map((line, lineIdx) => {
            const commentMatch = line.indexOf('#');
            let codePart = line;
            let commentPart = '';
            if (commentMatch !== -1) {
                codePart = line.substring(0, commentMatch);
                commentPart = line.substring(commentMatch);
            }

            const tokens = codePart.split(/(\b\w+\b|'.*?'|".*?"|[(){}\[\],:])/g).map((token, tokenIdx) => {
                if (!token) return null;

                if (token.startsWith("'") || token.startsWith('"')) {
                    return <span key={tokenIdx} className="text-emerald-600">{token}</span>;
                }
                if (/^\d+$/.test(token)) {
                    return <span key={tokenIdx} className="text-amber-600">{token}</span>;
                }

                for (const p of patterns) {
                    if (p.type !== 'comment' && p.type !== 'string' && new RegExp(`^${p.regex.source}$`).test(token)) {
                        return <span key={tokenIdx} className={p.color}>{token}</span>;
                    }
                }

                if (/[(){}\[\],:]/.test(token)) {
                    return <span key={tokenIdx} className="text-gray-500">{token}</span>;
                }

                return <span key={tokenIdx} className="text-gray-800">{token}</span>;
            });

            return (
                <div key={lineIdx} className="table-row">
                    <span className="table-cell text-right pr-4 text-gray-400 select-none text-xs w-8">{lineIdx + 1}</span>
                    <span className="table-cell whitespace-pre-wrap">
                        {tokens}
                        {commentPart && <span className="text-gray-500 italic">{commentPart}</span>}
                    </span>
                </div>
            );
        });
    };

    return (
        <div className="p-4 rounded-lg overflow-x-auto shadow-inner font-mono text-sm leading-relaxed" style={{ backgroundColor: '#f8f9fa', border: '1px solid #eaecef' }}>
            <div className="table w-full">
                {highlight(code)}
            </div>
        </div>
    );
};

const Badge = ({ children, color = "blue" }) => {
    const colors = {
        blue: "bg-blue-100 text-blue-700 border-blue-200",
        emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
        amber: "bg-amber-100 text-amber-700 border-amber-200",
        rose: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[color] || colors.blue}`}>
            {children}
        </span>
    );
};

// --- 主元件 (淺色主題) ---

export default function Problem12() {
    useSEO({
        title: "12. Integer to Roman 整數轉羅馬數字",
        description: "透過互動式動畫學習 LeetCode 12 Integer to Roman，理解整數轉羅馬數字的貪心演算法，Medium 難度",
        path: "/12-integer-to-roman"
    });

    const [inputNum, setInputNum] = useState(1994);
    const [activeTab, setActiveTab] = useState('visualize');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);

    const frames = useMemo(() => {
        const n = Math.max(1, Math.min(3999, parseInt(inputNum) || 1));
        return generateAlgorithmFrames(n);
    }, [inputNum]);

    const currentFrame = frames[currentFrameIdx] || frames[0];

    useEffect(() => {
        let timer;
        if (isPlaying && currentFrameIdx < frames.length - 1) {
            timer = setTimeout(() => {
                setCurrentFrameIdx(prev => prev + 1);
            }, playbackSpeed);
        } else if (currentFrameIdx >= frames.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentFrameIdx, frames.length, playbackSpeed]);

    const handleNext = () => setCurrentFrameIdx(prev => Math.min(prev + 1, frames.length - 1));
    const handlePrev = () => setCurrentFrameIdx(prev => Math.max(prev - 1, 0));
    const handleReset = () => {
        setIsPlaying(false);
        setCurrentFrameIdx(0);
    };

    const [exerciseNum, setExerciseNum] = useState(58);
    const [exerciseCurrentNum, setExerciseCurrentNum] = useState(58);
    const [exerciseResult, setExerciseResult] = useState("");
    const [exerciseFeedback, setExerciseFeedback] = useState(null);

    const handleExerciseClick = (val, sym) => {
        if (exerciseCurrentNum === 0) return;
        const correctOption = ROMAN_MAP.find(item => item.val <= exerciseCurrentNum);

        if (val === correctOption.val) {
            setExerciseCurrentNum(prev => prev - val);
            setExerciseResult(prev => prev + sym);

            if (exerciseCurrentNum - val === 0) {
                setExerciseFeedback({ type: 'success', msg: `太棒了！轉換完成。${exerciseNum} = ${exerciseResult + sym}` });
            } else {
                setExerciseFeedback({ type: 'success', msg: `正確！減去 ${val} (${sym})，繼續加油。` });
                setTimeout(() => setExerciseFeedback(null), 1500);
            }
        } else {
            if (val > exerciseCurrentNum) {
                setExerciseFeedback({ type: 'error', msg: `錯誤：${val} 比剩餘數字 ${exerciseCurrentNum} 還大，無法減去。` });
            } else {
                setExerciseFeedback({ type: 'error', msg: `錯誤：雖然 ${val} 小於 ${exerciseCurrentNum}，但在貪婪演算法中，我們必須優先選擇最大的可行數值 (${correctOption.sym} = ${correctOption.val})。` });
            }
            setTimeout(() => setExerciseFeedback(null), 3000);
        }
    };

    const resetExercise = () => {
        const newNum = Math.floor(Math.random() * 3000) + 1;
        setExerciseNum(newNum);
        setExerciseCurrentNum(newNum);
        setExerciseResult("");
        setExerciseFeedback(null);
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen font-sans overflow-hidden" style={{ backgroundColor: '#eee', color: '#3c4858' }}>

            {/* 側邊欄 (Sidebar) - 深色以突顯控制區 */}
            <div className="w-full lg:w-80 flex flex-col shadow-xl z-10 shrink-0" style={{ backgroundColor: '#2f4154' }}>
                <div className="p-5 border-b border-white/10">
                    <Link to="/" className="text-white/70 hover:text-white text-sm flex items-center gap-1 mb-3 transition-colors">
                        <ArrowLeft size={14} /> 返回題目列表
                    </Link>
                    <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                        <Hash className="w-6 h-6" />
                        LeetCode 12
                    </h1>
                    <p className="text-xs mt-1 uppercase tracking-wider font-semibold text-gray-300">Integer to Roman</p>
                </div>

                <div className="p-5 space-y-6 overflow-y-auto flex-1">
                    {/* 輸入控制 */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300">輸入整數 (1-3999)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={inputNum}
                                onChange={(e) => {
                                    setInputNum(e.target.value);
                                    handleReset();
                                }}
                                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[3, 58, 1994, 3999].map(n => (
                                <button
                                    key={n}
                                    onClick={() => { setInputNum(n); handleReset(); }}
                                    className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-xs text-white transition-colors"
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 播放控制 */}
                    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-center items-center gap-4">
                            <button onClick={handleReset} className="p-2 text-gray-300 hover:text-white transition-colors" title="重置">
                                <RefreshCw size={18} />
                            </button>
                            <button onClick={handlePrev} className="p-2 text-gray-300 hover:text-white transition-colors" disabled={currentFrameIdx === 0}>
                                <SkipBack size={20} />
                            </button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`p-3 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-amber-500 text-white' : 'bg-white text-[#2f4154]'}`}
                            >
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>
                            <button onClick={handleNext} className="p-2 text-gray-300 hover:text-white transition-colors" disabled={currentFrameIdx === frames.length - 1}>
                                <SkipForward size={20} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>慢</span>
                                <span>速度</span>
                                <span>快</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="2000"
                                step="100"
                                value={2100 - playbackSpeed}
                                onChange={(e) => setPlaybackSpeed(2100 - Number(e.target.value))}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>
                    </div>

                    {/* 當前狀態面板 */}
                    <div className="space-y-3">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Variables</div>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="bg-white/10 p-3 rounded border-l-4 border-emerald-400 shadow-sm">
                                <div className="text-xs text-gray-300">剩餘數值 (num)</div>
                                <div className="text-xl font-mono font-bold text-emerald-400">{currentFrame.num}</div>
                            </div>
                            <div className="bg-white/10 p-3 rounded border-l-4 border-blue-400 shadow-sm">
                                <div className="text-xs text-gray-300">結果字串 (result)</div>
                                <div className="text-xl font-mono font-bold text-blue-300 min-h-[1.75rem]">
                                    {currentFrame.result || <span className="text-gray-500 opacity-50">""</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 步驟說明 */}
                    <div className="bg-blue-500/20 border border-blue-400/30 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                            <p className="text-sm leading-relaxed text-blue-100">
                                {currentFrame.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 主視窗 (Main Canvas) - 淺色 */}
            <div className="flex-1 flex flex-col overflow-hidden relative" style={{ backgroundColor: '#eee' }}>

                {/* Tab 導航 */}
                <div className="flex border-b bg-white shadow-sm z-20" style={{ borderColor: '#eaecef' }}>
                    {[
                        { id: 'visualize', icon: TrendingUp, label: '視覺化演示' },
                        { id: 'exercise', icon: MousePointer2, label: '動手練習' },
                        { id: 'intro', icon: BookOpen, label: '題目與教學' },
                        { id: 'error', icon: AlertCircle, label: '常見錯誤' },
                        { id: 'code', icon: Code, label: '程式碼' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative
                ${activeTab === tab.id ? 'text-[#2f4154] bg-[#eee]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
              `}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2f4154]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* 內容區域 */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10">

                    {/* 1. 視覺化 Tab */}
                    {activeTab === 'visualize' && (
                        <div className="max-w-5xl mx-auto space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="relative h-40 bg-white rounded-2xl border flex flex-col items-center justify-center p-6 shadow-sm" style={{ borderColor: '#eaecef' }}>
                                    <div className="text-gray-500 text-sm mb-2 uppercase tracking-wide">Current Number</div>
                                    <div className="text-5xl font-mono font-bold transition-all duration-300 transform" style={{ color: '#2f4154' }}>
                                        {currentFrame.num}
                                    </div>
                                    {currentFrame.action === 'SUBTRACT' && (
                                        <div className="absolute top-4 right-4 text-rose-500 font-mono font-bold animate-bounce">
                                            -{ROMAN_MAP[currentFrame.currentMapIdx].val}
                                        </div>
                                    )}
                                </div>

                                <div className="relative h-40 bg-white rounded-2xl border flex flex-col items-center justify-center p-6 shadow-sm" style={{ borderColor: '#eaecef' }}>
                                    <div className="text-gray-500 text-sm mb-2 uppercase tracking-wide">Result String</div>
                                    <div className="text-5xl font-serif font-bold transition-all duration-300 break-all text-center" style={{ color: '#0366d6' }}>
                                        {currentFrame.result}
                                        <span className="animate-pulse text-blue-300">|</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: '#eaecef' }}>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#1a202c' }}>
                                    <Type className="w-5 h-5" style={{ color: '#2f4154' }} />
                                    數值-符號映射表 (Greedy Table)
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {ROMAN_MAP.map((item, idx) => {
                                        const isActive = currentFrame.currentMapIdx === idx;
                                        const isProcessed = currentFrame.currentMapIdx > idx;

                                        return (
                                            <div
                                                key={item.sym}
                                                className={`
                          relative p-3 rounded-lg border flex flex-col items-center justify-center transition-all duration-300
                          ${isActive
                                                        ? 'bg-[#2f4154] border-[#2f4154] scale-105 shadow-lg z-10'
                                                        : isProcessed
                                                            ? 'bg-gray-100 border-gray-200 opacity-40'
                                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }
                        `}
                                            >
                                                <span className={`text-2xl font-serif font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>
                                                    {item.sym}
                                                </span>
                                                <span className={`text-xs font-mono mt-1 ${isActive ? 'text-gray-200' : 'text-gray-500'}`}>
                                                    {item.val}
                                                </span>

                                                {isActive && (
                                                    <div className="absolute -top-2 -right-2">
                                                        <div className="relative flex h-3 w-3">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 text-center text-sm text-gray-500">
                                    <span className="inline-block w-2 h-2 rounded-full bg-[#2f4154] mr-2"></span>
                                    目前指針位置：演算法會嘗試用當前指針的數值去扣除剩餘數字。
                                </div>
                            </div>

                        </div>
                    )}

                    {/* 2. 動手練習 Tab */}
                    {activeTab === 'exercise' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold mb-2" style={{ color: '#1a202c' }}>我是 CPU！</h2>
                                <p className="text-gray-500">請依照「貪婪演算法」的邏輯，點擊下方按鈕，將數字減為 0。</p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-stretch mb-10">
                                <div className="flex-1 bg-white rounded-2xl p-8 border flex flex-col items-center justify-center gap-4 shadow-sm" style={{ borderColor: '#eaecef' }}>
                                    <div className="text-gray-500 text-sm uppercase tracking-wide">Target Number</div>
                                    <div className="text-6xl font-mono font-bold text-emerald-600 mb-2">{exerciseCurrentNum}</div>
                                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full transition-all duration-500"
                                            style={{ width: `${(exerciseCurrentNum / exerciseNum) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-center">
                                    <ChevronRight size={32} className="text-gray-300 hidden md:block" />
                                </div>

                                <div className="flex-1 bg-white rounded-2xl p-8 border flex flex-col items-center justify-center gap-4 shadow-sm" style={{ borderColor: '#eaecef' }}>
                                    <div className="text-gray-500 text-sm uppercase tracking-wide">Your Result</div>
                                    <div className="text-6xl font-serif font-bold mb-2 min-h-[4.5rem]" style={{ color: '#0366d6' }}>
                                        {exerciseResult || <span className="opacity-20">...</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
                                {ROMAN_MAP.map((item) => (
                                    <button
                                        key={item.sym}
                                        onClick={() => handleExerciseClick(item.val, item.sym)}
                                        disabled={exerciseCurrentNum === 0}
                                        className="group relative flex flex-col items-center justify-center p-4 bg-white border rounded-xl hover:bg-gray-50 hover:border-[#2f4154] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        style={{ borderColor: '#eaecef' }}
                                    >
                                        <span className="text-xl font-bold font-serif text-gray-700 group-hover:text-[#2f4154]">{item.sym}</span>
                                        <span className="text-xs text-gray-500 group-hover:text-[#2f4154] mt-1">{item.val}</span>
                                    </button>
                                ))}
                            </div>

                            {exerciseFeedback && (
                                <div className={`
                  fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 border z-50
                  ${exerciseFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}
                `}>
                                    {exerciseFeedback.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                    <span className="font-medium">{exerciseFeedback.msg}</span>
                                </div>
                            )}

                            <div className="flex justify-center">
                                <button
                                    onClick={resetExercise}
                                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-full transition-colors border"
                                    style={{ borderColor: '#eaecef' }}
                                >
                                    <RefreshCw size={18} /> 換一題試試
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 3. 算法教學 Tab */}
                    {activeTab === 'intro' && (
                        <div className="max-w-3xl mx-auto space-y-8">

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1a202c' }}>
                                    <BookOpen style={{ color: '#2f4154' }} /> 題目描述
                                </h2>
                                <Card title="LeetCode 12. Integer to Roman">
                                    <div className="space-y-4" style={{ color: '#3c4858' }}>
                                        <p>
                                            羅馬數字包含以下七種字符：
                                            <span className="font-mono text-emerald-600 mx-1">I, V, X, L, C, D, M</span>。
                                        </p>

                                        <div className="grid grid-cols-7 gap-1 text-center p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa', border: '1px solid #eaecef' }}>
                                            <div><div className="font-serif font-bold" style={{ color: '#1a202c' }}>I</div><div className="text-xs text-gray-500">1</div></div>
                                            <div><div className="font-serif font-bold" style={{ color: '#1a202c' }}>V</div><div className="text-xs text-gray-500">5</div></div>
                                            <div><div className="font-serif font-bold" style={{ color: '#1a202c' }}>X</div><div className="text-xs text-gray-500">10</div></div>
                                            <div><div className="font-serif font-bold" style={{ color: '#1a202c' }}>L</div><div className="text-xs text-gray-500">50</div></div>
                                            <div><div className="font-serif font-bold" style={{ color: '#1a202c' }}>C</div><div className="text-xs text-gray-500">100</div></div>
                                            <div><div className="font-serif font-bold" style={{ color: '#1a202c' }}>D</div><div className="text-xs text-gray-500">500</div></div>
                                            <div><div className="font-serif font-bold" style={{ color: '#1a202c' }}>M</div><div className="text-xs text-gray-500">1000</div></div>
                                        </div>

                                        <p>
                                            通常情況下，羅馬數字中小的數字在大的數字的右邊。但也存在特例（減法規則）：
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
                                            <li><span className="font-serif" style={{ color: '#2f4154' }}>I</span> 可以放在 V (5) 和 X (10) 的左邊，來表示 4 和 9。</li>
                                            <li><span className="font-serif" style={{ color: '#2f4154' }}>X</span> 可以放在 L (50) 和 C (100) 的左邊，來表示 40 和 90。</li>
                                            <li><span className="font-serif" style={{ color: '#2f4154' }}>C</span> 可以放在 D (500) 和 M (1000) 的左邊，來表示 400 和 900。</li>
                                        </ul>

                                        <div className="p-3 rounded border-l-4" style={{ backgroundColor: '#f8f9fa', borderColor: '#2f4154' }}>
                                            <p className="font-medium" style={{ color: '#1a202c' }}>任務目標</p>
                                            <p className="text-sm text-gray-600">給定一個整數，將其轉換為羅馬數字。輸入確保在 1 到 3999 範圍內。</p>
                                        </div>
                                    </div>
                                </Card>
                            </section>

                            <div className="w-full h-px my-4" style={{ backgroundColor: '#eaecef' }} />

                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1a202c' }}>
                                    <TrendingUp style={{ color: '#2f4154' }} /> 解題思路：貪婪演算法
                                </h2>

                                <Card title="核心概念">
                                    <p className="leading-relaxed mb-4" style={{ color: '#3c4858' }}>
                                        將整數轉換為羅馬數字的問題，本質上是一個「找零錢」問題。我們的目標是用最少數量的羅馬符號來湊出目標數字。
                                    </p>
                                    <p className="leading-relaxed" style={{ color: '#3c4858' }}>
                                        由於羅馬數字的設計規則（大的符號在左邊），我們可以採用<strong style={{ color: '#2f4154' }}>貪婪策略</strong>：
                                        每次都選擇 <span className="underline decoration-2" style={{ textDecorationColor: '#2f4154' }}>小於等於當前剩餘數值</span> 的 <span className="underline decoration-2" style={{ textDecorationColor: '#2f4154' }}>最大符號</span> 進行扣除。
                                    </p>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card title="為什麼包含 CM, CD, IV?">
                                        <p className="text-gray-600 text-sm leading-7">
                                            羅馬數字有「減法規則」，例如 4 寫作 IV (5-1)，而不是 IIII。
                                            為了簡化演算法邏輯，我們將這些特殊組合視為獨立的符號：
                                        </p>
                                        <ul className="mt-3 space-y-2 text-sm" style={{ color: '#3c4858' }}>
                                            <li className="flex justify-between border-b pb-1" style={{ borderColor: '#eaecef' }}><span>900</span> <span className="font-mono" style={{ color: '#2f4154' }}>CM</span></li>
                                            <li className="flex justify-between border-b pb-1" style={{ borderColor: '#eaecef' }}><span>400</span> <span className="font-mono" style={{ color: '#2f4154' }}>CD</span></li>
                                            <li className="flex justify-between border-b pb-1" style={{ borderColor: '#eaecef' }}><span>90</span> <span className="font-mono" style={{ color: '#2f4154' }}>XC</span></li>
                                            <li className="flex justify-between border-b pb-1" style={{ borderColor: '#eaecef' }}><span>40</span> <span className="font-mono" style={{ color: '#2f4154' }}>XL</span></li>
                                        </ul>
                                    </Card>

                                    <Card title="時間複雜度">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Badge color="emerald">O(1)</Badge>
                                            <span style={{ color: '#3c4858' }}>時間複雜度</span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            雖然這看起來像是一個迴圈，但由於輸入範圍被限制在 1 到 3999，且羅馬符號表是固定的（13 個項目）。
                                            迴圈執行的次數有一個很小的上限（例如 3999 最多產生約 15 個字符），因此我們可以視為常數時間複雜度。
                                        </p>
                                    </Card>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* 4. 常見錯誤 Tab */}
                    {activeTab === 'error' && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-rose-600">
                                <AlertCircle /> 常見誤區與陷阱
                            </h2>

                            <Card title="誤區 1：逐位處理 (Digit by Digit)">
                                <div className="flex gap-4 items-start">
                                    <div className="bg-rose-50 p-3 rounded text-rose-600 font-mono text-lg font-bold shrink-0 border border-rose-100">
                                        1994 <br />
                                        <span className="text-sm font-normal text-rose-400">!= 1, 9, 9, 4</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2" style={{ color: '#1a202c' }}>為什麼不能直接翻譯每個數字？</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            初學者常試圖將 1994 拆解為 '1', '9', '9', '4' 然後分別找對應符號。
                                            但羅馬數字是基於「位值 (Place Value)」的，1 是 1000 (M)，第一個 9 是 900 (CM)，第二個 9 是 90 (XC)。
                                            必須結合「位數」或直接用「數值減法」來處理。
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card title="誤區 2：忘記處理特殊組合 (4, 9, 40...)">
                                <div className="space-y-3">
                                    <p className="text-gray-600 text-sm">
                                        如果你只定義了 M, D, C, L, X, V, I，程式碼會變得非常複雜，充滿了 `if (num === 4)` 或回溯邏輯。
                                    </p>
                                    <div className="p-3 rounded border border-rose-100" style={{ backgroundColor: '#fef2f2' }}>
                                        <div className="text-rose-500 text-xs font-mono mb-1">// Bad Practice: 過多的條件判斷</div>
                                        <code className="text-gray-700 text-xs font-mono block">
                                            if (num &gt;= 900) &#123; ... &#125;<br />
                                            else if (num &gt;= 500) &#123; ... &#125;<br />
                                            else if (num &gt;= 400) &#123; // 特殊處理 ... &#125;
                                        </code>
                                    </div>
                                    <p className="text-emerald-600 text-sm font-medium mt-2">
                                        ✅ 解決方案：將 CM (900), CD (400) 加入映射表，把它們當作普通符號處理即可！
                                    </p>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* 5. 程式碼 Tab */}
                    {activeTab === 'code' && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center justify-between" style={{ color: '#2f4154' }}>
                                    <span>Python Solution</span>
                                    <Badge>Recommended</Badge>
                                </h3>
                                <PythonCodeBlock code={`class Solution:
    def intToRoman(self, num: int) -> str:
        # 定義數值與符號的映射列表 (tuple list)，從大到小排列
        v = [
            (1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'),
            (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'),
            (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')
        ]
        
        # 用於收集轉換後的羅馬數字片段
        res = []
        
        # 遍歷映射表，貪婪地由大數值開始處理
        for val, c in v:
            # 使用 divmod 同時取得商數 (d) 與餘數 (m)
            # d: 當前符號 c 需要重複的次數
            # m: 扣除後的剩餘數值
            d, m = divmod(num, val)
            
            # 將符號 c 重複 d 次加入結果 (Python 字串乘法)
            # 例如: c='M', d=2 -> 'MM'。若 d=0 則加入空字串
            res.append(c * d)
            
            # 更新剩餘數值 num，準備進行下一個符號的計算
            num = m
            
            # print(num, res) # (除錯用) 查看每一步的剩餘數值與結果
            
        # 將列表中的字串片段合併並回傳
        return ''.join(res)`} />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
