import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import {
  Maximize,
  RotateCcw,
  BookOpen,
  XCircle,
  Layers,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronRight,
  MousePointer2,
  Code2,
  Dice5,
  CheckCircle2,
  ArrowDown,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function Problem88() {
  useSEO({
    title: "88. Merge Sorted Array 合併排序陣列",
    description: "透過互動式動畫學習 LeetCode 88 合併排序陣列，理解雙指針 Two Pointers 技巧，Easy 難度題目詳解",
    path: "/88-merge-sorted-array"
  });

  // --- 狀態管理 ---
  // 輸入狀態
  const [nums1Input, setNums1Input] = useState("[1,2,3]");
  const [nums2Input, setNums2Input] = useState("[2,5,6]");

  // 演算法執行狀態 (雙指針)
  const [frames, setFrames] = useState([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [parseError, setParseError] = useState(null);

  // 互動狀態
  const [activeTab, setActiveTab] = useState('visualize'); // 'visualize' | 'forward' | 'sort' | 'learn'
  const [showProblem, setShowProblem] = useState(false);
  const timerRef = useRef(null);

  // --- 初始化與解析 ---
  useEffect(() => {
    try {
      const n1 = JSON.parse(nums1Input);
      const n2 = JSON.parse(nums2Input);

      if (!Array.isArray(n1) || !Array.isArray(n2)) {
        throw new Error("Inputs must be arrays");
      }

      // 生成演算法的所有步驟 (Frames)
      const generatedFrames = generateAlgorithmFrames(n1, n2);
      setFrames(generatedFrames);
      setCurrentFrameIdx(0);
      setIsPlaying(false);
      setParseError(null);
    } catch (e) {
      setParseError("格式錯誤: 請輸入有效的 JSON 數字陣列 (例如: [1,2,3])");
    }
  }, [nums1Input, nums2Input]);

  // --- 自動播放邏輯 ---
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentFrameIdx(prev => {
          if (prev < frames.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 800); // 播放速度
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, frames.length]);

  // --- 核心演算法：逆向雙指針 生成影格 ---
  const generateAlgorithmFrames = (initialNums1, initialNums2) => {
    const m = initialNums1.length;
    const n = initialNums2.length;
    // 建立實際操作的陣列 (nums1 後面補 0)
    let nums1 = [...initialNums1, ...Array(n).fill(0)];
    let nums2 = [...initialNums2];

    let p1 = m - 1;
    let p2 = n - 1;
    let p = m + n - 1;

    const framesList = [];

    // Helper: 紀錄當下狀態
    const addFrame = (desc, highlightIndices = [], activeVal = null, type = 'idle') => {
      framesList.push({
        nums1: [...nums1],
        nums2: [...nums2],
        p1, p2, p,
        description: desc,
        highlightIndices,
        activeVal,
        type // 'compare', 'move', 'done'
      });
    };

    addFrame("初始狀態：準備開始合併。從後方開始比較以避免覆蓋。", [], null, 'start');

    while (p2 >= 0) {
      if (p1 >= 0) {
        addFrame(
          `比較 nums1[${p1}] (${nums1[p1]}) 與 nums2[${p2}] (${nums2[p2]})`,
          [p1, p + n + p2],
          null,
          'compare'
        );

        if (nums1[p1] > nums2[p2]) {
          addFrame(
            `${nums1[p1]} 較大，填入位置 p (${p})`,
            [p],
            nums1[p1],
            'move_p1'
          );
          nums1[p] = nums1[p1];
          p1--;
        } else {
          addFrame(
            `${nums2[p2]} 較大 (或相等)，填入位置 p (${p})`,
            [p],
            nums2[p2],
            'move_p2'
          );
          nums1[p] = nums2[p2];
          p2--;
        }
      } else {
        addFrame(
          `nums1 已遍歷完畢，將 nums2[${p2}] (${nums2[p2]}) 填入位置 p`,
          [p],
          nums2[p2],
          'move_p2_only'
        );
        nums1[p] = nums2[p2];
        p2--;
      }
      p--;
    }

    addFrame("合併完成！所有元素已按順序排列。", [], null, 'done');
    return framesList;
  };

  // --- 控制函式 ---
  const handleStep = (direction) => {
    setIsPlaying(false);
    setCurrentFrameIdx(prev => {
      const next = prev + direction;
      return Math.max(0, Math.min(next, frames.length - 1));
    });
  };

  const generateRandom = () => {
    const len1 = Math.floor(Math.random() * 4) + 2; // 2-5
    const len2 = Math.floor(Math.random() * 4) + 1; // 1-4

    const arr1 = Array.from({ length: len1 }, () => Math.floor(Math.random() * 10)).sort((a, b) => a - b);
    const arr2 = Array.from({ length: len2 }, () => Math.floor(Math.random() * 10)).sort((a, b) => a - b);

    setNums1Input(JSON.stringify(arr1));
    setNums2Input(JSON.stringify(arr2));
  };

  const resetDefault = () => {
    setNums1Input("[1,2,3]");
    setNums2Input("[2,5,6]");
    setCurrentFrameIdx(0);
    setIsPlaying(false);
  };

  // --- 視覺化參數 ---
  const currentFrame = frames[currentFrameIdx] || {
    nums1: [],
    nums2: [],
    p1: -1,
    p2: -1,
    p: -1,
    description: "Loading...",
    type: 'idle'
  };

  // --- 特殊分頁：正向合併問題 ---
  const ForwardProblemDemo = () => {
    // 固定範例展示碰撞
    const badNums1 = [3, 4, 5, 0, 0, 0];
    const badNums2 = [1, 2, 6];

    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center shadow-sm">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-700 mb-2">為什麼不能從前往後？</h3>
          <p className="text-red-600/80">
            如果直接將較小的元素填入 <code>nums1</code> 的前方，原本存在的元素會被<strong>覆蓋 (Overwrite)</strong>，導致資料遺失！
          </p>
        </div>

        <div className="w-full space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-4">災難現場演示</div>

          {/* Step 1: Initial */}
          <div className="flex items-center justify-center gap-4 opacity-50">
            <div className="flex gap-1">
              {[3, 4, 5, 0, 0, 0].map((n, i) => (
                <div key={i} className={`w-10 h-10 border flex items-center justify-center rounded ${n === 0 ? 'text-slate-300' : 'font-bold'}`}>{n}</div>
              ))}
            </div>
            <div className="text-slate-400">vs</div>
            <div className="flex gap-1">
              {[1, 2, 6].map((n, i) => (
                <div key={i} className="w-10 h-10 border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center justify-center rounded font-bold">{n}</div>
              ))}
            </div>
          </div>

          <div className="flex justify-center"><ArrowDown className="text-slate-300" /></div>

          {/* Step 2: Disaster */}
          <div className="relative p-6 bg-white rounded-xl border border-slate-200 shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
              發生碰撞!
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex gap-1 relative">
                <div className="w-12 h-12 border-2 border-red-500 bg-red-50 text-red-700 flex items-center justify-center rounded-lg font-bold text-xl relative overflow-hidden">
                  1
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400/30 text-4xl rotate-12 line-through decoration-red-500 decoration-4">3</div>
                </div>
                {[4, 5, 0, 0, 0].map((n, i) => (
                  <div key={i} className={`w-12 h-12 border flex items-center justify-center rounded-lg ${n === 0 ? 'text-slate-300' : 'font-bold text-slate-700'}`}>{n}</div>
                ))}
                <div className="absolute -bottom-6 left-0 w-12 text-center text-[10px] text-red-500 font-bold">Overwrite</div>
              </div>
            </div>
            <p className="text-center mt-6 text-sm text-slate-600">
              當我們把 <code>nums2[0] (1)</code> 放到 <code>nums1[0]</code> 時，原本的 <code>3</code> 就消失了！
              <br />之後我們將無法再比較 <code>3</code> 與其他數字。
            </p>
          </div>
        </div>
      </div>
    );
  };

  // --- 特殊分頁：暴力解法 ---
  const SimpleSortDemo = () => {
    const n1 = JSON.parse(nums1Input);
    const n2 = JSON.parse(nums2Input);
    const sorted = [...n1, ...n2].sort((a, b) => a - b);

    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6 w-full shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            直覺暴力解 (Naive Approach)
          </h3>
          <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm leading-relaxed mb-4">
            <div className="text-slate-500 mb-2"># Python One-Liner</div>
            <div><span className="text-purple-400">def</span> <span className="text-yellow-400">merge</span>(nums1, m, nums2, n):</div>
            <div className="pl-4 text-slate-400"># 1. 將 nums2 接到 nums1 後面 (覆蓋 0)</div>
            <div className="pl-4">nums1[m:] = nums2</div>
            <div className="pl-4 text-slate-400"># 2. 直接排序</div>
            <div className="pl-4">nums1.sort()</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded border border-slate-100">
              <span className="font-bold text-slate-500 block mb-1">時間複雜度</span>
              <span className="text-lg font-mono text-slate-700">O((m+n)log(m+n))</span>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-100">
              <span className="font-bold text-slate-500 block mb-1">空間複雜度</span>
              <span className="text-lg font-mono text-slate-700">O(1) <span className="text-[10px] text-slate-400">or O(log(m+n)) stack</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded text-xs font-mono">[{n1.join(',')}]</div>
          <span>+</span>
          <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded text-xs font-mono">[{n2.join(',')}]</div>
          <ArrowRight size={14} />
          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded text-xs font-mono font-bold border border-amber-200 shadow-sm">
            [{sorted.join(',')}]
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-3 md:p-4 shadow-sm z-20 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600 hidden md:block">
              <Maximize size={24} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate flex items-center gap-2">
                88. Merge Sorted Array
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-normal hidden sm:inline-block">Easy</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 truncate cursor-pointer hover:text-purple-600 transition-colors" onClick={() => setShowProblem(true)}>
                逆向雙指針法 (Two Pointers)
                <span className="md:hidden text-purple-500 underline ml-1">題目</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowProblem(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-purple-600 hover:bg-slate-50 rounded-lg transition-all text-sm font-medium"
            >
              <BookOpen size={16} /> 題目
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <button
              onClick={resetDefault}
              className="flex items-center gap-2 px-3 py-1.5 md:px-3 md:py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all font-medium shadow-sm text-xs md:text-sm shrink-0"
            >
              <RotateCcw size={14} /> <span className="hidden sm:inline">重置</span>
            </button>
            <button
              onClick={generateRandom}
              className="flex items-center gap-2 px-3 py-1.5 md:px-3 md:py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 rounded-lg transition-all font-medium border border-purple-100 shadow-sm text-xs md:text-sm shrink-0"
            >
              <Dice5 size={14} /> <span className="hidden sm:inline">隨機</span><span className="sm:hidden">Random</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

        {/* Left Panel: Navigation & Controls */}
        <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] lg:shadow-inner shrink-0 h-[45vh] lg:h-full">

          {/* Enhanced Tab Switcher (Grid Layout) */}
          <div className="grid grid-cols-2 p-2 gap-2 bg-slate-50 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('visualize')}
              className={`py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'visualize' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Layers size={14} /> 雙指針 (最佳)
            </button>
            <button
              onClick={() => setActiveTab('forward')}
              className={`py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'forward' ? 'bg-white text-red-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <AlertTriangle size={14} /> 正向問題
            </button>
            <button
              onClick={() => setActiveTab('sort')}
              className={`py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'sort' ? 'bg-white text-amber-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Sparkles size={14} /> 暴力解 (Sort)
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className={`py-2 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'learn' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Code2 size={14} /> 邏輯代碼
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* Input Section (Always Visible) */}
            <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">初始陣列 (JSON)</label>
                {parseError && <span className="text-[10px] text-red-500 flex items-center gap-1"><XCircle size={10} /> 錯誤</span>}
              </div>
              <div>
                <span className="text-[10px] text-blue-500 font-mono mb-1 flex justify-between">
                  <span>nums1 (有效)</span>
                  <span className="opacity-50">m = {JSON.parse(nums1Input)?.length || 0}</span>
                </span>
                <input
                  type="text"
                  value={nums1Input}
                  onChange={(e) => setNums1Input(e.target.value)}
                  className="w-full font-mono text-xs p-2 bg-white border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <span className="text-[10px] text-emerald-500 font-mono mb-1 flex justify-between">
                  <span>nums2</span>
                  <span className="opacity-50">n = {JSON.parse(nums2Input)?.length || 0}</span>
                </span>
                <input
                  type="text"
                  value={nums2Input}
                  onChange={(e) => setNums2Input(e.target.value)}
                  className="w-full font-mono text-xs p-2 bg-white border border-slate-200 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Contextual Left Panel Content */}
            {activeTab === 'visualize' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-4">
                {/* Controls */}
                <div className="bg-white rounded-xl p-1 flex items-center justify-between border border-slate-200 shadow-sm">
                  <button onClick={() => handleStep(-1)} disabled={currentFrameIdx === 0} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-all text-slate-600">
                    <SkipBack size={16} />
                  </button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${isPlaying ? 'bg-amber-100 text-amber-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {isPlaying ? <><Pause size={14} /> 暫停</> : <><Play size={14} /> 播放</>}
                  </button>
                  <button onClick={() => handleStep(1)} disabled={currentFrameIdx === frames.length - 1} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-all text-slate-600">
                    <SkipForward size={16} />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Step</span>
                    <span>{currentFrameIdx} / {frames.length - 1}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${(currentFrameIdx / (frames.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className={`p-3 rounded-lg border-l-4 shadow-sm transition-all duration-300 text-xs ${currentFrame.type === 'compare' ? 'bg-amber-50 border-amber-400 text-amber-900' :
                  currentFrame.type?.startsWith('move') ? 'bg-purple-50 border-purple-400 text-purple-900' :
                    currentFrame.type === 'done' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' :
                      'bg-white border-slate-300 text-slate-600'
                  }`}>
                  <p className="font-medium leading-relaxed">
                    {currentFrame.description}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'learn' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-[10px] font-mono overflow-x-auto leading-loose shadow-inner">
                  <div className="text-slate-500 mb-2">// 逆向雙指針 Python 範例</div>
                  <div>p1, p2 = m - 1, n - 1</div>
                  <div>p = m + n - 1</div>
                  <br />
                  <div><span className="text-purple-400">while</span> p2 &gt;= 0:</div>
                  <div className="pl-4 text-slate-500"># 若 p1 還有且 p1 較大</div>
                  <div className="pl-4">
                    <span className="text-purple-400">if</span> p1 &gt;= 0 <span className="text-purple-400">and</span> nums1[p1] &gt; nums2[p2]:
                  </div>
                  <div className="pl-8">nums1[p] = nums1[p1]</div>
                  <div className="pl-8">p1 -= 1</div>
                  <div className="pl-4"><span className="text-purple-400">else</span>:</div>
                  <div className="pl-8">nums1[p] = nums2[p2]</div>
                  <div className="pl-8">p2 -= 1</div>
                  <div className="pl-4">p -= 1</div>
                </div>
                <div className="text-xs text-slate-500 bg-white p-3 rounded border border-slate-200">
                  此算法的時間複雜度為 <strong className="text-slate-700">O(m + n)</strong>，空間複雜度為 <strong className="text-slate-700">O(1)</strong>。
                </div>
              </div>
            )}

            {(activeTab === 'forward' || activeTab === 'sort') && (
              <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-500">
                請查看右側面板以獲得詳細的圖解說明。
              </div>
            )}

          </div>
        </div>

        {/* Right Panel: Visualization & Content */}
        <div className="flex-1 bg-slate-100/50 relative overflow-hidden flex flex-col items-center justify-center p-4 lg:p-10">

          {/* Default Visualization (Double Pointer) */}
          {activeTab === 'visualize' && (
            <div className="w-full max-w-4xl space-y-12 animate-in zoom-in-95 duration-300">
              {/* nums1 */}
              <div className="relative">
                <div className="flex items-end mb-2 gap-2">
                  <h3 className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">nums1</h3>
                  <span className="text-xs text-slate-400 font-mono">(m + n length)</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {currentFrame.nums1.map((val, idx) => {
                    const isP = idx === currentFrame.p;
                    const isP1 = idx === currentFrame.p1;
                    let bgClass = "bg-white";
                    let borderClass = "border-slate-300";
                    let textClass = "text-slate-700";
                    if (val === 0 && idx >= (currentFrame.nums1.length - currentFrame.nums2.length)) textClass = "text-slate-300";
                    if (currentFrame.type?.startsWith('move') && idx === currentFrame.p) {
                      bgClass = "bg-purple-100"; borderClass = "border-purple-500 scale-110"; textClass = "text-purple-700 font-bold";
                    } else if (currentFrame.type === 'compare' && idx === currentFrame.p1) {
                      bgClass = "bg-amber-50"; borderClass = "border-amber-400";
                    }
                    return (
                      <div key={`n1-${idx}`} className="relative group">
                        {isP1 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce"><span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1 rounded mb-0.5">p1</span><ArrowDown size={14} className="text-blue-600" /></div>}
                        {isP && <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center transition-all duration-300"><span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-1 rounded mt-0.5">p</span><div className="rotate-180"><ArrowDown size={14} className="text-purple-600" /></div></div>}
                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border-2 flex items-center justify-center text-lg md:text-xl font-mono shadow-sm transition-all duration-300 ${bgClass} ${borderClass} ${textClass}`}>{val}</div>
                        <div className="text-[10px] text-slate-300 text-center mt-1 font-mono">{idx}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* nums2 */}
              <div className="relative">
                <div className="flex items-end mb-2 gap-2">
                  <h3 className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">nums2</h3>
                  <span className="text-xs text-slate-400 font-mono">(n length)</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {currentFrame.nums2.map((val, idx) => {
                    const isP2 = idx === currentFrame.p2;
                    let bgClass = "bg-emerald-50"; let borderClass = "border-emerald-200"; let textClass = "text-emerald-800";
                    if (currentFrame.type === 'compare' && idx === currentFrame.p2) { bgClass = "bg-amber-50"; borderClass = "border-amber-400"; textClass = "text-slate-800"; }
                    if (idx > currentFrame.p2) { bgClass = "bg-slate-50 opacity-50"; borderClass = "border-slate-200"; textClass = "text-slate-300"; }
                    return (
                      <div key={`n2-${idx}`} className="relative">
                        {isP2 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce"><span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded mb-0.5">p2</span><ArrowDown size={14} className="text-emerald-600" /></div>}
                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border-2 flex items-center justify-center text-lg md:text-xl font-mono shadow-sm transition-all duration-300 ${bgClass} ${borderClass} ${textClass}`}>{val}</div>
                        <div className="text-[10px] text-slate-300 text-center mt-1 font-mono">{idx}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Comparison */}
              {currentFrame.type === 'compare' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur shadow-xl border-2 border-amber-200 p-3 rounded-xl flex items-center gap-4 animate-in zoom-in-95 duration-200 z-30">
                  <div className="flex flex-col items-center"><span className="text-[10px] uppercase font-bold text-blue-500 mb-1">nums1[{currentFrame.p1}]</span><span className="text-xl font-bold text-slate-700">{currentFrame.nums1[currentFrame.p1]}</span></div>
                  <div className="text-slate-400 font-bold">vs</div>
                  <div className="flex flex-col items-center"><span className="text-[10px] uppercase font-bold text-emerald-500 mb-1">nums2[{currentFrame.p2}]</span><span className="text-xl font-bold text-slate-700">{currentFrame.nums2[currentFrame.p2]}</span></div>
                </div>
              )}
            </div>
          )}

          {/* New Tab: Forward Problem */}
          {activeTab === 'forward' && <ForwardProblemDemo />}

          {/* New Tab: Simple Sort */}
          {activeTab === 'sort' && <SimpleSortDemo />}

          {/* Learn Code (Reuse Visualize Panel for Code if needed, or keep blank) */}
          {activeTab === 'learn' && (
            <div className="flex flex-col items-center justify-center text-slate-400 space-y-2 animate-in fade-in">
              <Code2 size={48} className="opacity-20" />
              <p className="text-sm">請參考左側面板的代碼邏輯。</p>
            </div>
          )}

          {/* Tips Overlay */}
          {activeTab === 'visualize' && (
            <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 hidden md:block">
              提示: 使用 <span className="font-mono bg-slate-200 px-1 rounded">←</span> <span className="font-mono bg-slate-200 px-1 rounded">→</span> 鍵盤控制上一步/下一步
            </div>
          )}

        </div>
      </div>

      {/* Problem Modal */}
      {showProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowProblem(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={20} className="text-purple-600" /> 88. Merge Sorted Array
              </h3>
              <button onClick={() => setShowProblem(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed overflow-y-auto max-h-[60vh]">
              <p>
                給你兩個按 <strong>非遞減順序</strong> 排列的整數陣列 <code>nums1</code> 和 <code>nums2</code>，以及兩個整數 <code>m</code> 和 <code>n</code>，分別代表 <code>nums1</code> 和 <code>nums2</code> 中的元素數目。
              </p>
              <div className="border-l-4 border-purple-500 pl-4 py-1 bg-purple-50/50">
                <p className="font-bold text-slate-800 mb-1">最佳策略：逆向雙指針</p>
                <p className="text-xs">
                  設置三個指針：p1 (m-1), p2 (n-1), p (m+n-1)。從後方開始填寫，避免覆蓋前方未比較的元素。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
