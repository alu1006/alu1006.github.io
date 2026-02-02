import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Pause, SkipBack, SkipForward, RefreshCw,
  Info, Code, Lightbulb, Edit3, AlertCircle, CheckCircle2,
  XCircle, ChevronRight, HelpCircle, Terminal, Trophy, MousePointer2
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

/**
 * LeetCode 55: Jump Game - 互動式教學教材
 * 修復：修正 JSX 中 ">" 符號造成的編譯錯誤，並完善互動練習與代碼高亮
 */

export default function Problem55() {
  useSEO({
    title: "55. Jump Game 跳躍遊戲",
    description: "透過互動式動畫學習 LeetCode 55 跳躍遊戲，理解貪心演算法 Greedy 解法，Medium 難度題目詳解",
    path: "/55-jump-game"
  });

  // --- 基礎狀態 ---
  const [inputStr, setInputStr] = useState("[2, 3, 1, 1, 4]");
  const [nums, setNums] = useState([2, 3, 1, 1, 4]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [activeTab, setActiveTab] = useState('visualize');
  const [error, setError] = useState("");
  const [showProblemModal, setShowProblemModal] = useState(false);

  // --- 互動練習狀態 ---
  const [userPos, setUserPos] = useState(0);
  const [userMaxReach, setUserMaxReach] = useState(0);
  const [exerciseStatus, setExerciseStatus] = useState('playing'); // playing, won, lost

  // 重置練習
  const resetExercise = () => {
    setUserPos(0);
    setUserMaxReach(nums[0] || 0);
    setExerciseStatus('playing');
  };

  useEffect(() => {
    resetExercise();
  }, [nums]);

  const handleManualJump = (idx) => {
    if (exerciseStatus !== 'playing') return;
    if (idx > userMaxReach) return; // 不可達

    setUserPos(idx);
    const newReach = Math.max(userMaxReach, idx + nums[idx]);
    setUserMaxReach(newReach);

    if (newReach >= nums.length - 1) {
      setExerciseStatus('won');
    } else if (idx === newReach && nums[idx] === 0) {
      // 如果目前位置等於最遠可達且該位跳躍力為 0，則無法前進
      setExerciseStatus('lost');
    }
  };

  // --- 影格生成邏輯 (Frame-based Execution) ---
  const frames = useMemo(() => {
    const f = [];
    const n = nums.length;
    let mx_jump = 0;

    f.push({
      nums: [...nums], i: -1, mx_jump: 0,
      description: "演算法開始：初始化最遠可達距離為 0。",
      type: 'init', highlightIdx: [], status: 'working'
    });

    for (let i = 0; i < n; i++) {
      const num = nums[i];
      f.push({
        nums: [...nums], i, mx_jump,
        description: `檢查索引 ${i}：目前最遠只能到 ${mx_jump}，${i > mx_jump ? '無法到達此位置！' : '可以到達此位置。'}`,
        type: 'compare', highlightIdx: [i], status: i > mx_jump ? 'fail' : 'working'
      });

      if (i > mx_jump) {
        f.push({
          nums: [...nums], i, mx_jump,
          description: `因為當前位置 ${i} 超過了最遠可達距離 ${mx_jump}，回傳 False。`,
          type: 'end', highlightIdx: [i], status: 'fail', result: false
        });
        return f;
      }

      const old_mx = mx_jump;
      mx_jump = Math.max(mx_jump, i + num);

      f.push({
        nums: [...nums], i, mx_jump,
        description: `更新最遠距離：max(舊的 ${old_mx}, 目前位置 ${i} + 跳躍力 ${num} = ${i + num}) = ${mx_jump}`,
        type: 'update', highlightIdx: [i], status: 'working'
      });

      if (mx_jump >= n - 1) {
        f.push({
          nums: [...nums], i, mx_jump,
          description: `最遠可達距離 ${mx_jump} 已覆蓋終點 (索引 ${n - 1})，回傳 True！`,
          type: 'end', highlightIdx: [i], status: 'success', result: true
        });
        return f;
      }
    }
    return f;
  }, [nums]);

  // --- 自動播放控制 ---
  useEffect(() => {
    let timer;
    if (isPlaying && currentFrameIdx < frames.length - 1) {
      timer = setTimeout(() => {
        setCurrentFrameIdx(prev => prev + 1);
      }, playbackSpeed);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentFrameIdx, frames.length, playbackSpeed]);

  const handleInputChange = (val) => {
    setInputStr(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.every(n => typeof n === 'number')) {
        setNums(parsed);
        setCurrentFrameIdx(0);
        setError("");
      } else {
        setError("請輸入數字陣列，如 [2,3,1]");
      }
    } catch (e) {
      setError("格式錯誤");
    }
  };

  const currentFrame = frames[currentFrameIdx] || frames[0];

  // --- 代碼渲染組件 (Syntax Highlighting) ---
  const CodeBlock = () => {
    const codeLines = [
      { text: "class", type: "keyword" }, { text: " Solution", type: "class" }, { text: ":", type: "punctuation" },
      { text: "\n    def", type: "keyword" }, { text: " canJump", type: "function" }, { text: "(self, nums: List[int]) -> bool:", type: "text" },
      { text: "\n        # mx_jump 記錄我們當前能到達的最遠下標", type: "comment" },
      { text: "\n        mx_jump ", type: "text" }, { text: "=", type: "operator" }, { text: " 0", type: "number" },
      { text: "\n        n ", type: "text" }, { text: "=", type: "operator" }, { text: " len(nums)", type: "text" },
      { text: "\n\n        for", type: "keyword" }, { text: " i, num ", type: "text" }, { text: "in", type: "keyword" }, { text: " enumerate(nums):", type: "text" },
      { text: "\n            if", type: "keyword" }, { text: " i ", type: "text" }, { text: ">", type: "operator" }, { text: " mx_jump:", type: "text" },
      { text: "\n                return", type: "keyword" }, { text: " False", type: "boolean" },
      { text: "\n\n            mx_jump ", type: "text" }, { text: "=", type: "operator" }, { text: " max(mx_jump, i ", type: "text" }, { text: "+", type: "operator" }, { text: " num)", type: "text" },
      { text: "\n\n            if", type: "keyword" }, { text: " mx_jump ", type: "text" }, { text: ">=", type: "operator" }, { text: " n ", type: "text" }, { text: "-", type: "operator" }, { text: " 1:", type: "text" },
      { text: "\n                return", type: "keyword" }, { text: " True", type: "boolean" },
      { text: "\n\n        return", type: "keyword" }, { text: " False", type: "boolean" }
    ];

    const getColor = (type) => {
      switch (type) {
        case 'keyword': return 'text-pink-400';
        case 'class': return 'text-emerald-400';
        case 'function': return 'text-blue-400';
        case 'comment': return 'text-slate-500 italic';
        case 'operator': return 'text-amber-400';
        case 'number': return 'text-orange-400';
        case 'boolean': return 'text-orange-400';
        case 'punctuation': return 'text-slate-300';
        default: return 'text-slate-200';
      }
    };

    return (
      <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl font-mono text-sm leading-6 border border-slate-800 overflow-x-auto">
        <div className="flex gap-1.5 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <pre className="whitespace-pre">
          {codeLines.map((part, i) => (
            <span key={i} className={getColor(part.type)}>{part.text}</span>
          ))}
        </pre>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans p-4 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm mb-4 border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100 text-white">
            <Terminal size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">LeetCode 55: Jump Game</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Interactive Learning Module</p>
          </div>
        </div>
        <button
          onClick={() => setShowProblemModal(true)}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-bold border border-slate-200 transition-all"
        >
          <Info size={18} className="text-indigo-500" /> 查看題目詳解
        </button>
      </header>

      <main className="flex flex-1 gap-4 overflow-hidden">
        {/* 左側控制面板 */}
        <aside className="w-80 flex flex-col gap-4 overflow-y-auto pr-1">
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal size={14} /> 測資輸入
            </h3>
            <input
              type="text"
              value={inputStr}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`w-full p-3 bg-slate-50 border rounded-xl font-mono text-sm focus:outline-none focus:ring-4 transition-all ${error ? 'border-red-200 focus:ring-red-50/50 text-red-600' : 'border-slate-100 focus:ring-indigo-50 text-indigo-700'}`}
            />
            {error && <p className="mt-2 text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
            <button
              onClick={() => handleInputChange(JSON.stringify(Array.from({ length: 6 }, () => Math.floor(Math.random() * 5))))}
              className="w-full mt-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> 隨機生成數組
            </button>
          </section>

          {activeTab === 'visualize' && (
            <>
              <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Play size={14} /> 播放控制
                </h3>
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setCurrentFrameIdx(Math.max(0, currentFrameIdx - 1))} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 transition-all active:scale-90">
                    <SkipBack size={20} />
                  </button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${isPlaying ? 'bg-amber-100 text-amber-600 shadow-amber-100' : 'bg-indigo-600 text-white shadow-indigo-100'}`}>
                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                  </button>
                  <button onClick={() => setCurrentFrameIdx(Math.min(frames.length - 1, currentFrameIdx + 1))} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 transition-all active:scale-90">
                    <SkipForward size={20} />
                  </button>
                </div>
                <input type="range" min="200" max="2000" step="100" value={playbackSpeed} onChange={(e) => setPlaybackSpeed(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </section>

              <section className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">執行步驟紀錄</h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {frames.map((f, i) => (
                    <div key={i} onClick={() => setCurrentFrameIdx(i)} className={`cursor-pointer p-3 rounded-xl border-l-4 transition-all ${i === currentFrameIdx ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-transparent hover:border-slate-300'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-bold uppercase ${i === currentFrameIdx ? 'text-indigo-600' : 'text-slate-400'}`}>Step {i}</span>
                        <span className="text-[10px] font-mono text-slate-300">{f.type}</span>
                      </div>
                      <p className={`text-[11px] leading-snug ${i === currentFrameIdx ? 'text-indigo-900 font-medium' : 'text-slate-500'}`}>{f.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'exercise' && (
            <section className="bg-indigo-900 p-5 rounded-2xl shadow-xl text-white">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Trophy size={14} /> 練習狀態
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">目前位置:</span>
                  <span className="text-lg font-black">{userPos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">最遠可達:</span>
                  <span className="text-lg font-black text-amber-400">{userMaxReach}</span>
                </div>
                <div className={`p-3 rounded-xl text-center text-sm font-bold ${exerciseStatus === 'won' ? 'bg-green-500' : exerciseStatus === 'lost' ? 'bg-red-500' : 'bg-indigo-800'}`}>
                  {exerciseStatus === 'won' ? '恭喜到達終點！' : exerciseStatus === 'lost' ? '糟糕，你陷進 0 了！' : '請點擊可到達的格子進行跳躍'}
                </div>
                <button onClick={resetExercise} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">重新挑戰</button>
              </div>
            </section>
          )}
        </aside>

        {/* 右側內容區 */}
        <section className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <nav className="flex px-4 pt-4 gap-2 border-b border-slate-50">
            {[
              { id: 'visualize', label: '核心過程', icon: Play },
              { id: 'concepts', label: '觀念講解', icon: Lightbulb },
              { id: 'exercise', label: '互動練習', icon: Edit3 },
              { id: 'logic', label: '代碼展示', icon: Code },
              { id: 'error', label: '錯誤示範', icon: XCircle },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)] border-t border-x border-slate-100 relative top-[1px]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 p-8 overflow-y-auto relative">

            {/* 1. Visualize Tab */}
            {activeTab === 'visualize' && (
              <div className="flex flex-col h-full animate-in fade-in duration-500">
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-10 relative overflow-hidden">
                  <div className="flex gap-4 mb-16 relative">
                    {nums.map((val, idx) => {
                      const isCurrent = currentFrame.i === idx;
                      const isReachable = idx <= currentFrame.mx_jump;
                      const isHighlight = currentFrame.highlightIdx.includes(idx);
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div className={`w-16 h-20 rounded-2xl flex items-center justify-center text-2xl font-black transition-all duration-500 relative ${isHighlight ? 'scale-110 shadow-2xl z-20' : 'scale-100 opacity-80'} ${isCurrent ? 'ring-4 ring-indigo-500 bg-white text-indigo-600' : isReachable ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'} ${isHighlight && currentFrame.type === 'compare' ? 'bg-amber-400 text-white ring-4 ring-amber-100' : ''}`}>
                            {val}
                            {isCurrent && <div className="absolute -top-12 animate-bounce"><div className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded font-bold">目前指標 i</div><div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-indigo-600 mx-auto" /></div>}
                          </div>
                          <span className="mt-3 text-[10px] font-mono text-slate-400">idx: {idx}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-full max-w-2xl px-10">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-black text-amber-600 bg-amber-100 p-1 rounded">mx_jump: {currentFrame.mx_jump}</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase italic">Max Reach Progress</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full mt-4 relative overflow-hidden border border-slate-200">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-700 shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: `${Math.min(100, (currentFrame.mx_jump / (nums.length - 1)) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="mt-16 w-full max-w-xl bg-white p-6 rounded-2xl shadow-xl border border-slate-100"><p className="text-slate-700 text-lg font-medium italic">「{currentFrame.description}」</p></div>
                </div>
              </div>
            )}

            {/* 2. Concepts Tab */}
            {activeTab === 'concepts' && (
              <div className="prose prose-slate max-w-none animate-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3"><div className="bg-amber-400 p-2 rounded-xl text-white"><Lightbulb size={24} /></div>貪婪演算法的核心思維</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                      <h4 className="text-indigo-900 font-bold mb-2">💡 策略總結</h4>
                      <p className="text-sm text-indigo-800 leading-relaxed">我們不需要計算所有的路徑（那會變成 $O(2^n)$ 或 $O(n^2)$ 的動態規劃問題），我們只需要「邊走邊記住最遠能去哪」。只要最遠的點一直都在我們前方，我們就立於不敗之地。</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm space-y-2 text-slate-600">
                      <p>1. 初始化 <strong>mx_jump = 0</strong></p>
                      <p>2. 遍歷每一個 <strong>i</strong></p>
                      <p>3. 如果 <strong>{'i > mx_jump'}</strong>，代表斷掉，回傳 False</p>
                      <p>4. 否則，<strong>mx_jump = max(mx_jump, i + nums[i])</strong></p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                    <h4 className="font-bold mb-4 flex items-center gap-2"><Terminal size={18} className="text-slate-400" /> 性能表現</h4>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl mb-4"><span className="text-sm font-medium text-slate-500">時間複雜度</span><span className="font-mono font-bold text-indigo-600 text-lg">O(n)</span></div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl"><span className="text-sm font-medium text-slate-500">空間複雜度</span><span className="font-mono font-bold text-indigo-600 text-lg">O(1)</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Logic Tab (Code with Syntax Highlighting) */}
            {activeTab === 'logic' && (
              <div className="flex flex-col h-full animate-in zoom-in-95 duration-300">
                <CodeBlock />
              </div>
            )}

            {/* 4. Exercise Tab (Manual Simulation) */}
            {activeTab === 'exercise' && (
              <div className="flex flex-col items-center animate-in fade-in duration-500 h-full">
                <div className="bg-slate-50 w-full flex-1 rounded-3xl border-2 border-slate-200 flex flex-col items-center justify-center p-10 relative">
                  {exerciseStatus === 'won' && <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in zoom-in"><Trophy size={80} className="text-amber-500 mb-4 animate-bounce" /><h2 className="text-4xl font-black text-slate-800">挑戰成功！</h2><button onClick={resetExercise} className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100">再玩一次</button></div>}
                  {exerciseStatus === 'lost' && <div className="absolute inset-0 z-40 bg-red-50/80 backdrop-blur-md flex flex-col items-center justify-center animate-in zoom-in"><XCircle size={80} className="text-red-500 mb-4" /><h2 className="text-4xl font-black text-red-800">挑戰失敗...</h2><p className="text-red-600 mt-2">你卡在了一個跳力為 0 的位置</p><button onClick={resetExercise} className="mt-6 px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold">重新挑戰</button></div>}

                  <div className="flex gap-4 mb-20">
                    {nums.map((val, idx) => {
                      const isCurrent = userPos === idx;
                      const isAvailable = idx <= userMaxReach;
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <button
                            disabled={!isAvailable || exerciseStatus !== 'playing'}
                            onClick={() => handleManualJump(idx)}
                            className={`
                              w-16 h-20 rounded-2xl flex items-center justify-center text-2xl font-black transition-all duration-300 relative group
                              ${isCurrent ? 'bg-indigo-600 text-white scale-110 shadow-2xl ring-4 ring-white' : isAvailable ? 'bg-indigo-100 text-indigo-700 hover:scale-105 hover:bg-indigo-200 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'}
                            `}
                          >
                            {val}
                            {isAvailable && !isCurrent && exerciseStatus === 'playing' && (
                              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MousePointer2 size={24} className="text-indigo-400 animate-pulse" />
                              </div>
                            )}
                          </button>
                          <span className={`mt-3 text-[10px] font-bold ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>IDX: {idx}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="w-full max-w-xl text-center">
                    <h3 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest">你的跳躍紀錄與最遠距離</h3>
                    <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex-1 text-left">
                        <p className="text-xs text-slate-400 font-bold uppercase">目前你的位置</p>
                        <p className="text-2xl font-black text-indigo-600">{userPos}</p>
                      </div>
                      <div className="w-[1px] h-10 bg-slate-100" />
                      <div className="flex-1 text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase">你開發的最遠領土</p>
                        <p className="text-2xl font-black text-amber-500">{userMaxReach}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Error Tab */}
            {activeTab === 'error' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
                  <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2"><AlertCircle size={24} /> 常見錯誤：忽略斷層</h3>
                  <p className="text-red-700 text-sm mb-6">如果沒有檢查 <strong>{'i > mx_jump'}</strong>，你的迴圈會一直跑完。但實際上，你可能早在索引 3 的位置就已經卡死在 0，永遠過不去了。</p>
                  <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                    <div className="flex gap-2 mb-4">{[3, 2, 1, 0, 4].map((v, i) => (<div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${i === 3 ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{v}</div>))}</div>
                    <p className="text-xs font-mono text-red-400 italic"># 缺少檢查時：你會認為 mx_jump 到達索引 3 是正常的，但卻會計算出 (3+0) 作為下一個跳躍起點，這毫無意義。</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Problem Modal */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black text-slate-800">題目詳解：跳躍遊戲</h2>
                <button onClick={() => setShowProblemModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><XCircle size={24} className="text-slate-300" /></button>
              </div>
              <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
                <p>給定一個非負整數陣列 <strong>nums</strong>，判斷你是否能夠到達 <strong>最後一個下標</strong>。</p>
                <div className="bg-slate-50 p-4 rounded-xl"><strong>解法關鍵：</strong> 遍歷陣列，記錄一個變數 mx_jump。在每個位置 i，如果 <strong>{'i > mx_jump'}</strong>，回傳 False；否則更新 mx_jump = max(mx_jump, i + nums[i])。如果最後 <strong>{'mx_jump >= n - 1'}</strong>，回傳 True。</div>
              </div>
              <button onClick={() => setShowProblemModal(false)} className="w-full mt-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg">開始學習</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-4 flex justify-between items-center px-4">
        <div className="flex items-center gap-6"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Algorithm Ready</span></div></div>
        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter italic">LeetCode 視覺化教材製作 · Jump Game (Greedy Strategy)</div>
      </footer>
    </div>
  );
};
