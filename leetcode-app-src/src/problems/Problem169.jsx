import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
  Info, Code, Trophy, BarChart3, Settings,
  CheckCircle2, XCircle, Crown, Hash, ArrowRight, RefreshCw
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

// --- Constants & Config ---
const ANIMATION_SPEED_MS = 800;
const DEFAULT_INPUT = "[2, 2, 1, 1, 1, 2, 2]";

// --- Algorithmic Logic Generators ---

/**
 * Algo 1: Boyer-Moore Voting Algorithm (Optimal)
 * Time: O(n), Space: O(1)
 */
const generateVotingFrames = (inputArr) => {
  const frames = [];
  const n = inputArr.length;
  let candidate = null;
  let count = 0;

  const addFrame = (type, description, activeIdx, stats = {}) => {
    frames.push({
      arr: [...inputArr],
      type,
      description,
      activeIdx,
      stats: { candidate, count, ...stats },
      algo: 'voting'
    });
  };

  addFrame('idle', '初始狀態：準備開始 Boyer-Moore 投票演算法', -1);

  for (let i = 0; i < n; i++) {
    const num = inputArr[i];

    // Step 1: Focus on element
    addFrame('focus', `讀取元素：nums[${i}] = ${num}`, i);

    if (count === 0) {
      // Step 2: New Candidate
      candidate = num;
      count = 1;
      addFrame('update', `計數為 0，立 ${num} 為新候選人 (Candidate)`, i, { highlightCand: true });
    } else if (num === candidate) {
      // Step 3: Increment
      count++;
      addFrame('match', `遇到同伴 ${num}，計數 +1 (目前: ${count})`, i, { highlightCand: true });
    } else {
      // Step 4: Decrement
      count--;
      addFrame('conflict', `遇到異類 ${num}，一換一消耗，計數 -1 (目前: ${count})`, i, { highlightCand: true });
    }
  }

  // Verification phase (optional for problem but good for visuals if needed, though Boyer-Moore guarantees result if majority exists)
  addFrame('done', `遍歷結束，最終倖存者 ${candidate} 即為多數元素`, -1, { winner: candidate });

  return frames;
};

/**
 * Algo 2: HashMap / Counting
 * Time: O(n), Space: O(n)
 */
const generateHashMapFrames = (inputArr) => {
  const frames = [];
  const n = inputArr.length;
  const threshold = Math.floor(n / 2);
  const map = {};

  const addFrame = (type, description, activeIdx, winner = null) => {
    frames.push({
      arr: [...inputArr],
      type,
      description,
      activeIdx,
      stats: { map: { ...map }, threshold },
      winner,
      algo: 'hashmap'
    });
  };

  addFrame('idle', `初始狀態：準備計數 (目標：數量 > ${threshold})`, -1);

  for (let i = 0; i < n; i++) {
    const num = inputArr[i];
    addFrame('focus', `讀取元素：${num}`, i);

    map[num] = (map[num] || 0) + 1;

    if (map[num] > threshold) {
      addFrame('found', `發現 ${num} 出現次數 (${map[num]}) 超過一半 (${threshold})！`, i, num);
      return frames;
    } else {
      addFrame('update', `更新計數：${num} 出現 ${map[num]} 次`, i);
    }
  }

  addFrame('done', '遍歷結束', -1);
  return frames;
};

/**
 * Algo 3: Sorting
 * Time: O(n log n), Space: O(1) or O(n)
 */
const generateSortingFrames = (inputArr) => {
  const frames = [];
  // Visualize a simplified sort -> pick middle
  let arr = [...inputArr];
  const n = arr.length;
  const mid = Math.floor(n / 2);

  frames.push({
    arr: [...arr],
    type: 'idle',
    description: '初始狀態：尚未排序',
    activeIdx: -1,
    algo: 'sorting'
  });

  // Just show result of sort directly for simplicity in this visualization
  arr.sort((a, b) => a - b);

  frames.push({
    arr: [...arr],
    type: 'sort',
    description: '執行排序 (Sorting)...',
    activeIdx: -1,
    algo: 'sorting'
  });

  frames.push({
    arr: [...arr],
    type: 'focus',
    description: `直接取中間位置 nums[n/2] = nums[${mid}]`,
    activeIdx: mid,
    algo: 'sorting'
  });

  frames.push({
    arr: [...arr],
    type: 'done',
    description: `因為多數元素超過一半，排序後必然佔據中間位置：${arr[mid]}`,
    activeIdx: mid,
    winner: arr[mid],
    algo: 'sorting'
  });

  return frames;
};


// --- Components ---

const Header = ({ onShowProblem }) => (
  <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-amber-100 p-2 rounded-lg">
          <Crown className="w-6 h-6 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-stone-800 tracking-tight">
          LeetCode 169 <span className="text-stone-400 font-normal">|</span> Majority Element
        </h1>
      </div>
      <button
        onClick={onShowProblem}
        className="flex items-center space-x-2 text-sm font-medium text-stone-600 hover:text-amber-600 transition-colors bg-stone-50 px-3 py-2 rounded-md hover:bg-amber-50"
      >
        <Info className="w-4 h-4" />
        <span>題目說明</span>
      </button>
    </div>
  </header>
);

const ArrayBlock = ({ value, index, isActive, type, isWinner }) => {
  let baseClasses = "w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-lg font-bold rounded-xl border-2 transition-all duration-300 transform relative";
  let colorClasses = "bg-white border-stone-200 text-stone-700";

  if (isActive) {
    if (type === 'focus') colorClasses = "bg-sky-50 border-sky-400 text-sky-700 scale-105";
    if (type === 'update' || type === 'match') colorClasses = "bg-emerald-100 border-emerald-500 text-emerald-800 scale-110 shadow-lg";
    if (type === 'conflict') colorClasses = "bg-red-100 border-red-500 text-red-800 scale-90";
  }

  if (isWinner) {
    colorClasses = "bg-amber-100 border-amber-500 text-amber-800 ring-4 ring-amber-100";
  }

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      {value}
      <span className="absolute -bottom-6 text-xs text-stone-400 font-mono font-normal">{index}</span>
    </div>
  );
};

const VotingStats = ({ candidate, count, type }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 flex items-center justify-around shadow-sm w-full max-w-md mx-auto">
      <div className="text-center">
        <div className="text-xs text-stone-500 mb-1 uppercase tracking-wider font-semibold">Candidate</div>
        <div className={`text-4xl font-bold transition-all duration-300 ${type === 'update' ? 'text-emerald-600 scale-110' : 'text-stone-800'}`}>
          {candidate !== null ? candidate : '-'}
        </div>
      </div>

      <div className="h-12 w-px bg-stone-200"></div>

      <div className="text-center">
        <div className="text-xs text-stone-500 mb-1 uppercase tracking-wider font-semibold">Count</div>
        <div className="flex items-center gap-2">
          <div className={`text-4xl font-bold transition-all duration-300 ${type === 'conflict' ? 'text-red-500' : type === 'match' ? 'text-emerald-500' : 'text-stone-800'}`}>
            {count}
          </div>
        </div>
      </div>
    </div>
  );
};

const HashMapStats = ({ map, threshold, currentVal }) => {
  const sortedKeys = Object.keys(map).sort((a, b) => map[b] - map[a]);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
        <span className="text-xs font-bold text-stone-500 uppercase">Frequency Map</span>
        <span className="text-xs font-medium text-stone-400">Target &gt; {threshold}</span>
      </div>
      <div className="space-y-3 max-h-[200px] overflow-y-auto">
        {sortedKeys.length === 0 && <p className="text-sm text-stone-400 text-center py-4">等待數據...</p>}
        {sortedKeys.map(key => {
          const val = map[key];
          const isWinning = val > threshold;
          const isCurrent = parseInt(key) === currentVal;
          const widthPct = Math.min(100, (val / (threshold * 1.5)) * 100);

          return (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-8 text-right font-mono font-bold ${isWinning ? 'text-amber-600' : 'text-stone-600'}`}>{key}</div>
              <div className="flex-1 bg-stone-100 h-6 rounded-full overflow-hidden relative">
                {/* Threshold Line */}
                <div className="absolute top-0 bottom-0 border-l border-dashed border-stone-400 z-10" style={{ left: `${(threshold / (threshold * 1.5)) * 100}%` }}></div>

                <div
                  className={`h-full transition-all duration-500 ${isWinning ? 'bg-amber-500' : isCurrent ? 'bg-sky-400' : 'bg-stone-300'}`}
                  style={{ width: `${widthPct}%` }}
                ></div>
              </div>
              <div className="w-8 text-sm text-stone-500 font-mono">{val}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProblemModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800">
          <XCircle className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-stone-800 mb-4">題目：多數元素 (Majority Element)</h2>
        <div className="space-y-4 text-stone-600">
          <p>給定一個大小為 <code>n</code> 的陣列 <code>nums</code>，請找出其中的「多數元素」。</p>
          <p>多數元素是指在陣列中出現次數 <strong>大於</strong> <code>⌊ n/2 ⌋</code> 的元素。</p>
          <p className="text-sm bg-stone-100 p-2 rounded">假設陣列是非空的，並且給定的陣列總是存在多數元素。</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-2 text-sm">進階挑戰</h3>
              <ul className="list-disc list-inside text-sm text-emerald-900 space-y-1">
                <li>時間複雜度 O(n)</li>
                <li>空間複雜度 O(1)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({ activeAlgo }) => {
  const codes = {
    voting: {
      title: "Boyer-Moore 投票演算法",
      desc: "核心邏輯是「一換一消耗」。設一個候選人，遇到同伴 +1，遇到敵人 -1。因為王者數量超過半數，跟其他人全部互殺完，最後活下來的一定是他。",
      complexity: "時間 O(n) | 空間 O(1)",
      code: `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        count = 0
        candidate = None
        
        for num in nums:
            if count == 0:
                candidate = num
            
            if num == candidate:
                count += 1
            else:
                count -= 1
                
        return candidate`
    },
    hashmap: {
      title: "HashMap 計數法",
      desc: "直覺解法。使用 Hash Map (或 Counter) 記錄每個數字出現的次數，一旦超過 n/2 即回傳。",
      complexity: "時間 O(n) | 空間 O(n)",
      code: `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        counts = collections.Counter(nums)
        return max(counts.keys(), key=counts.get)
        
        # 或者遇到過半就返回
        # limit = len(nums) // 2
        # for num in nums:
        #     counts[num] += 1
        #     if counts[num] > limit:
        #         return num`
    },
    sorting: {
      title: "排序取中位數",
      desc: "既然多數元素數量超過一半，那麼排序後，它一定會佔據中間的位置 (index = n//2)。",
      complexity: "時間 O(n log n) | 空間 O(1) 或 O(n)",
      code: `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        nums.sort()
        return nums[len(nums) // 2]`
    }
  };

  const current = codes[activeAlgo] || codes.voting;

  return (
    <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto shadow-inner border border-slate-800 h-full">
      <div className="mb-4 border-b border-slate-700 pb-4">
        <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
        <p className="text-slate-400 text-sm mb-2">{current.desc}</p>
        <div className="inline-block bg-emerald-900/50 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-800">
          {current.complexity}
        </div>
      </div>
      <pre className="font-mono text-sm text-slate-300 leading-relaxed">
        {current.code}
      </pre>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  useSEO({
    title: "169. Majority Element 多數元素",
    description: "透過視覺化學習 LeetCode 169 多數元素，理解 Boyer-Moore 投票演算法，Easy 難度題目詳解",
    path: "/169-majority-element"
  });

  const [inputStr, setInputStr] = useState(DEFAULT_INPUT);
  const [activeTab, setActiveTab] = useState('voting');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [showProblem, setShowProblem] = useState(false);
  const [frames, setFrames] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    try {
      const parsedArr = JSON.parse(inputStr);
      if (!Array.isArray(parsedArr)) throw new Error("Input must be an array");
      if (parsedArr.length === 0) throw new Error("Array cannot be empty");

      setErrorMsg('');

      let generatedFrames = [];
      const algoToRun = activeTab === 'code' ? 'voting' : activeTab;

      switch (algoToRun) {
        case 'hashmap':
          generatedFrames = generateHashMapFrames(parsedArr);
          break;
        case 'sorting':
          generatedFrames = generateSortingFrames(parsedArr);
          break;
        case 'voting':
        default:
          generatedFrames = generateVotingFrames(parsedArr);
          break;
      }

      setFrames(generatedFrames);
      setCurrentFrameIdx(0);
      setIsPlaying(false);

    } catch (e) {
      setErrorMsg("輸入格式錯誤 (請使用 JSON 陣列格式)");
      setFrames([]);
    }
  }, [inputStr, activeTab]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentFrameIdx(prev => {
          if (prev < frames.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, ANIMATION_SPEED_MS);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, frames]);

  const handleRandom = () => {
    // Generate a guaranteed majority array
    const len = 7;
    const majority = Math.floor(Math.random() * 9) + 1;
    const others = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== majority);

    // Fill array with majority element > len/2 times
    const arr = Array(len).fill(0).map((_, i) => {
      if (i < 4) return majority; // Ensure 4/7 are majority
      return others[Math.floor(Math.random() * others.length)];
    });

    // Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    setInputStr(JSON.stringify(arr));
  };

  const handleStepChange = (e) => {
    setIsPlaying(false);
    setCurrentFrameIdx(Number(e.target.value));
  };

  const currentFrame = frames[currentFrameIdx] || {
    arr: [], type: 'idle', description: '準備就緒', stats: {}
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 selection:bg-amber-100 selection:text-amber-900">
      <Header onShowProblem={() => setShowProblem(true)} />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-6">
              <Settings className="w-5 h-5 text-stone-500" />
              參數設定
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">輸入陣列 (JSON)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputStr}
                    onChange={(e) => setInputStr(e.target.value)}
                    className={`w-full p-3 pr-10 rounded-lg border font-mono text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all ${errorMsg ? 'border-red-300 bg-red-50' : 'border-stone-200 bg-stone-50'}`}
                  />
                  <button onClick={handleRandom} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-stone-200 rounded-md transition-colors" title="隨機生成多數元素陣列">
                    <RefreshCw className="w-4 h-4 text-stone-500" />
                  </button>
                </div>
                {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-stone-400">PROGRESS</span>
                <span className="text-xs font-mono text-stone-500">{currentFrameIdx + 1} / {frames.length}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(0, frames.length - 1)}
                value={currentFrameIdx}
                onChange={handleStepChange}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => { setIsPlaying(false); setCurrentFrameIdx(Math.max(0, currentFrameIdx - 1)); }}
                  className="p-3 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
                  disabled={currentFrameIdx === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-4 rounded-full shadow-lg transform active:scale-95 transition-all ${isPlaying ? 'bg-amber-100 text-amber-600' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
                >
                  {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6" />}
                </button>

                <button
                  onClick={() => { setIsPlaying(false); setCurrentFrameIdx(Math.min(frames.length - 1, currentFrameIdx + 1)); }}
                  className="p-3 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
                  disabled={currentFrameIdx === frames.length - 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <h3 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" /> 當前步驟解析
            </h3>
            <p className="text-amber-900 leading-relaxed text-sm md:text-base min-h-[3rem]">
              {currentFrame.description || "請設定輸入並開始播放"}
            </p>
          </div>
        </div>

        {/* Right Visualization Canvas */}
        <div className="lg:col-span-8 flex flex-col h-full">

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 bg-stone-200 p-1.5 rounded-xl mb-6 w-full md:w-fit">
            {[
              { id: 'voting', label: 'Boyer-Moore 投票法', icon: Trophy },
              { id: 'hashmap', label: 'HashMap 計數', icon: BarChart3 },
              { id: 'sorting', label: '排序法', icon: ArrowRight },
              { id: 'code', label: '程式碼邏輯', icon: Code },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-300/50'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.label.slice(0, 4)}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-stone-200 relative overflow-hidden flex flex-col min-h-[500px]">

            {activeTab === 'code' ? (
              <div className="p-4 h-full">
                <CodeBlock activeAlgo="voting" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col p-4 md:p-8 bg-stone-50/50">

                {/* Array Display */}
                <div className="flex justify-center items-end h-32 mb-8 gap-2 md:gap-3">
                  {currentFrame.arr.map((val, idx) => (
                    <ArrayBlock
                      key={idx}
                      value={val}
                      index={idx}
                      isActive={idx === currentFrame.activeIdx}
                      type={currentFrame.type}
                      isWinner={currentFrame.winner === val}
                    />
                  ))}
                </div>

                {/* State Visualization Area */}
                <div className="flex-1 flex flex-col justify-start">

                  {currentFrame.algo === 'voting' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <VotingStats
                        candidate={currentFrame.stats.candidate}
                        count={currentFrame.stats.count}
                        type={currentFrame.type}
                      />
                      <div className="text-center mt-6 text-sm text-stone-500 max-w-md mx-auto">
                        Boyer-Moore 的核心在於「抵銷」。當 count 歸零，代表之前的候選人已被完全消耗，新的候選人暫時登基。
                      </div>
                    </div>
                  )}

                  {currentFrame.algo === 'hashmap' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <HashMapStats
                        map={currentFrame.stats.map}
                        threshold={currentFrame.stats.threshold}
                        currentVal={currentFrame.arr[currentFrame.activeIdx]}
                      />
                    </div>
                  )}

                  {currentFrame.algo === 'sorting' && (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 p-8 bg-stone-100 rounded-xl border border-stone-200 mx-auto max-w-md">
                      <ArrowRight className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <p className="text-stone-600 mb-2">排序後，相同的元素會聚在一起。</p>
                      <p className="font-bold text-stone-800">
                        因為多數元素數量 &gt; n/2，所以它一定會跨越中間線 (Index n/2)。
                      </p>
                    </div>
                  )}

                </div>

              </div>
            )}
          </div>
        </div>
      </main>

      <ProblemModal isOpen={showProblem} onClose={() => setShowProblem(false)} />
    </div>
  );
}