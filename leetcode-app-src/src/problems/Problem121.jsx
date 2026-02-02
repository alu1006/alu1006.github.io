import React, { useState, useEffect, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
  Info, Code, AlertTriangle, Activity, BarChart2,
  TrendingUp, X, BookOpen, Lightbulb, CheckCircle2
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

// ==========================================
// 1. 核心演算法與影格生成器 (Frame Generator)
// ==========================================

const generateAlgorithmFrames = (prices) => {
  const frames = [];
  let minPrice = Infinity;
  let maxProfit = 0;
  let minPriceIdx = -1;
  let bestBuyIdx = -1;
  let bestSellIdx = -1;

  // 0. 初始狀態
  frames.push({
    prices: [...prices],
    currentIndex: -1,
    minPrice: Infinity,
    minPriceIdx: -1,
    currentProfit: null,
    maxProfit: 0,
    bestBuyIdx: -1,
    bestSellIdx: -1,
    action: 'start',
    description: '演算法開始：初始化最低價格 (minPrice) 為無限大，最大利潤 (maxProfit) 為 0。'
  });

  for (let i = 0; i < prices.length; i++) {
    const currentPrice = prices[i];

    // 1. 移動指針 (掃描中)
    frames.push({
      prices: [...prices],
      currentIndex: i,
      minPrice,
      minPriceIdx,
      currentProfit: null,
      maxProfit,
      bestBuyIdx,
      bestSellIdx,
      action: 'scan',
      description: `第 ${i + 1} 天：股價為 ${currentPrice}。正在評估此價格。`
    });

    // 2. 判斷是否為歷史新低
    if (currentPrice < minPrice) {
      minPrice = currentPrice;
      minPriceIdx = i;

      frames.push({
        prices: [...prices],
        currentIndex: i,
        minPrice,
        minPriceIdx,
        currentProfit: null,
        maxProfit,
        bestBuyIdx,
        bestSellIdx,
        action: 'updateMin',
        description: `發現新低價！將最低買入價更新為 ${currentPrice} (第 ${i + 1} 天)。`
      });
    } else {
      // 3. 如果不是新低，計算利潤
      const currentProfit = currentPrice - minPrice;

      frames.push({
        prices: [...prices],
        currentIndex: i,
        minPrice,
        minPriceIdx,
        currentProfit,
        maxProfit,
        bestBuyIdx,
        bestSellIdx,
        action: 'calcProfit',
        description: `計算利潤：當前價格 (${currentPrice}) - 最低買入價 (${minPrice}) = ${currentProfit}。`
      });

      // 4. 判斷是否為最大利潤
      if (currentProfit > maxProfit) {
        maxProfit = currentProfit;
        bestBuyIdx = minPriceIdx;
        bestSellIdx = i;

        frames.push({
          prices: [...prices],
          currentIndex: i,
          minPrice,
          minPriceIdx,
          currentProfit,
          maxProfit,
          bestBuyIdx,
          bestSellIdx,
          action: 'updateMax',
          description: `發現更高利潤！更新最大利潤為 ${maxProfit} (買入: 第${minPriceIdx + 1}天, 賣出: 第${i + 1}天)。`
        });
      }
    }
  }

  // 5. 完成
  frames.push({
    prices: [...prices],
    currentIndex: -1,
    minPrice,
    minPriceIdx,
    currentProfit: null,
    maxProfit,
    bestBuyIdx,
    bestSellIdx,
    action: 'finish',
    description: `遍歷結束。最終最大利潤為 ${maxProfit}。`
  });

  return frames;
};

// ==========================================
// 2. 主應用組件
// ==========================================

export default function StockVisualizer() {
  useSEO({
    title: "121. Best Time to Buy and Sell Stock 買賣股票最佳時機",
    description: "透過互動式圖表學習 LeetCode 121 股票買賣最佳時機，掌握一次遍歷 Greedy 解法，Easy 難度詳解",
    path: "/121-best-time-to-buy-and-sell-stock"
  });

  // --- State ---
  const [inputStr, setInputStr] = useState("[7,1,5,3,6,4]");
  const [prices, setPrices] = useState([7, 1, 5, 3, 6, 4]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [activeTab, setActiveTab] = useState('visualize'); // 'visualize', 'intro', 'error', 'code'
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- Derived State (Memoized Frames) ---
  const frames = useMemo(() => generateAlgorithmFrames(prices), [prices]);
  const currentFrame = frames[currentFrameIdx] || frames[0];
  const maxPriceInArray = Math.max(...prices, 1); // For scaling bar height

  // --- Effects ---
  useEffect(() => {
    let interval;
    if (isPlaying && currentFrameIdx < frames.length - 1) {
      interval = setInterval(() => {
        setCurrentFrameIdx(prev => prev + 1);
      }, playbackSpeed);
    } else if (currentFrameIdx >= frames.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentFrameIdx, frames.length, playbackSpeed]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputStr(val);
    setErrorMsg("");
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.every(n => typeof n === 'number')) {
        if (parsed.length > 20) {
          setErrorMsg("建議輸入 20 筆以內的資料以獲得最佳視覺效果");
        }
        setPrices(parsed);
        setCurrentFrameIdx(0);
        setIsPlaying(false);
      } else {
        setErrorMsg("請輸入有效的數字陣列，例如 [7,1,5,3,6,4]");
      }
    } catch (err) {
      // Don't update prices if JSON is invalid, just let user type
    }
  };

  const handleRandomize = () => {
    const len = Math.floor(Math.random() * 10) + 5; // 5 to 15 items
    const newPrices = Array.from({ length: len }, () => Math.floor(Math.random() * 15) + 1);
    const newStr = JSON.stringify(newPrices);
    setInputStr(newStr);
    setPrices(newPrices);
    setCurrentFrameIdx(0);
    setIsPlaying(false);
    setErrorMsg("");
  };

  const stepForward = () => {
    setCurrentFrameIdx(prev => Math.min(prev + 1, frames.length - 1));
    setIsPlaying(false);
  };

  const stepBackward = () => {
    setCurrentFrameIdx(prev => Math.max(prev - 1, 0));
    setIsPlaying(false);
  };

  const reset = () => {
    setCurrentFrameIdx(0);
    setIsPlaying(false);
  };

  // --- Visual Helpers ---
  const getBarColor = (idx, frame) => {
    // Priority: Scan cursor > Best Sell > Best Buy > Min Price Marker
    if (frame.currentIndex === idx) return "bg-amber-400 border-amber-600"; // Currently scanning
    if (idx === frame.bestSellIdx) return "bg-red-400 border-red-600"; // Part of max profit
    if (idx === frame.bestBuyIdx) return "bg-emerald-400 border-emerald-600"; // Part of max profit
    if (idx === frame.minPriceIdx) return "bg-blue-400 border-blue-600"; // Current min
    return "bg-slate-300 border-slate-400"; // Default
  };

  const getBarHeight = (price) => {
    return `${(price / maxPriceInArray) * 100}%`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">

      {/* ================= Header ================= */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/30">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">121. Best Time to Buy and Sell Stock</h1>
            <div className="flex gap-2 text-xs text-slate-400 mt-0.5">
              <span className="bg-emerald-900 text-emerald-400 px-1.5 py-0.5 rounded">Easy</span>
              <span>Array</span>
              <span>Greedy</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md transition text-sm font-medium border border-slate-600"
        >
          <Info size={16} />
          <span className="hidden sm:inline">題目說明</span>
        </button>
      </header>

      {/* ================= Main Layout ================= */}
      <main className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* --- Left Sidebar (Controls & Logic) --- */}
        <aside className="w-full lg:w-96 bg-white border-r border-slate-200 flex flex-col shadow-sm z-0 overflow-y-auto">

          {/* Input Section */}
          <div className="p-5 border-b border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              測試資料 (Prices Array)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={inputStr}
                onChange={handleInputChange}
                className={`flex-1 p-2 border rounded-md font-mono text-sm focus:ring-2 outline-none transition-all ${errorMsg ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-200'}`}
                placeholder="[7, 1, 5, 3, 6, 4]"
              />
              <button
                onClick={handleRandomize}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition border border-slate-200"
                title="隨機生成"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            {errorMsg && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> {errorMsg}</p>}
          </div>

          {/* Controls */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-center items-center gap-4 mb-4">
              <button onClick={reset} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition text-slate-600" title="重置">
                <RotateCcw size={20} />
              </button>
              <button onClick={stepBackward} className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-full shadow-sm hover:shadow active:scale-95 transition text-indigo-600" disabled={currentFrameIdx === 0}>
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-4 rounded-full shadow-md hover:shadow-lg active:scale-95 transition text-white ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={stepForward} className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-full shadow-sm hover:shadow active:scale-95 transition text-indigo-600" disabled={currentFrameIdx === frames.length - 1}>
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">速度</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-xs text-slate-500 w-12 text-right">{playbackSpeed}ms</span>
            </div>
          </div>

          {/* Status & Description */}
          <div className="flex-1 p-5 flex flex-col gap-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <h3 className="text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center gap-2">
                <Activity size={14} /> 當前狀態
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="flex justify-between border-b border-indigo-100 pb-1">
                  <span className="text-slate-500">當前掃描 (Price)</span>
                  <span className="font-mono font-bold text-slate-800">
                    {currentFrame.currentIndex >= 0 ? prices[currentFrame.currentIndex] : '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-indigo-100 pb-1">
                  <span className="text-slate-500">歷史最低 (Min)</span>
                  <span className="font-mono font-bold text-blue-600">
                    {currentFrame.minPrice === Infinity ? '∞' : currentFrame.minPrice}
                  </span>
                </div>
                <div className="flex justify-between border-b border-indigo-100 pb-1">
                  <span className="text-slate-500">當前利潤</span>
                  <span className={`font-mono font-bold ${currentFrame.currentProfit > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {currentFrame.currentProfit !== null ? currentFrame.currentProfit : '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-indigo-100 pb-1">
                  <span className="text-slate-500">最大利潤 (Max)</span>
                  <span className="font-mono font-bold text-red-600">
                    {currentFrame.maxProfit}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">演算法步驟說明</h3>
              <div className="bg-slate-800 text-slate-100 p-4 rounded-lg text-sm leading-relaxed shadow-inner min-h-[100px] transition-all duration-300">
                {currentFrame.description}
              </div>
            </div>
          </div>
        </aside>

        {/* --- Right Canvas (Animation & Logic Tabs) --- */}
        <section className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-white px-4 pt-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('visualize')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'visualize' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <div className="flex items-center gap-2"><BarChart2 size={16} /> 視覺化演示</div>
            </button>
            <button
              onClick={() => setActiveTab('intro')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'intro' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <div className="flex items-center gap-2"><BookOpen size={16} /> 算法教學</div>
            </button>
            <button
              onClick={() => setActiveTab('error')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'error' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <div className="flex items-center gap-2"><AlertTriangle size={16} /> 常見錯誤</div>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'code' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <div className="flex items-center gap-2"><Code size={16} /> 程式碼</div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">

            {/* 1. VISUALIZE TAB */}
            {activeTab === 'visualize' && (
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2">
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 justify-center text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-sm"></div>
                    <span>當前掃描 (i)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                    <span>最低買入點 (min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
                    <span>最佳買入</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                    <span>最佳賣出</span>
                  </div>
                </div>

                {/* Animation Canvas */}
                <div className="flex-1 flex items-end justify-center pb-12 px-4 gap-2 md:gap-4 min-h-[300px]">
                  {prices.map((price, idx) => {
                    const isMin = currentFrame.minPriceIdx === idx;
                    const isScan = currentFrame.currentIndex === idx;
                    const isBestBuy = currentFrame.bestBuyIdx === idx;
                    const isBestSell = currentFrame.bestSellIdx === idx;

                    return (
                      <div key={idx} className="relative flex flex-col items-center group w-full max-w-[60px]" style={{ height: '100%' }}>

                        {/* Indicators (Top) */}
                        <div className="absolute -top-10 flex flex-col items-center transition-all duration-300">
                          {isScan && <span className="text-amber-600 font-bold text-xs animate-bounce mb-1">i</span>}
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-lg border-t border-x transition-all duration-500 ease-in-out relative ${getBarColor(idx, currentFrame)}`}
                          style={{
                            height: getBarHeight(price),
                            minHeight: '24px'
                          }}
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-700">
                            {price}
                          </span>
                        </div>

                        {/* X-Axis Label */}
                        <div className="mt-2 text-xs text-slate-400 font-mono">
                          Day{idx + 1}
                        </div>

                        {/* Bottom Indicators (Min/Max) */}
                        <div className="absolute -bottom-8 flex flex-col items-center text-[10px] font-bold whitespace-nowrap">
                          {isMin && !isBestBuy && <span className="text-blue-500">Min</span>}
                          {isBestBuy && <span className="text-emerald-600">Buy</span>}
                          {isBestSell && <span className="text-red-500">Sell</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Profit Arrow Animation (Overlay) */}
                {currentFrame.action === 'calcProfit' && currentFrame.currentIndex > -1 && currentFrame.minPriceIdx > -1 && (
                  <div className="absolute top-10 right-10 bg-white/90 p-4 rounded-xl shadow-lg border border-slate-100 animate-in fade-in slide-in-from-bottom-4 z-20">
                    <div className="text-xs text-slate-500 mb-1">潛在利潤計算</div>
                    <div className="flex items-center gap-3 text-lg font-bold">
                      <div className="text-slate-800">{prices[currentFrame.currentIndex]}</div>
                      <div className="text-slate-400">-</div>
                      <div className="text-blue-600">{currentFrame.minPrice}</div>
                      <div className="text-slate-400">=</div>
                      <div className={`${currentFrame.currentProfit > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {currentFrame.currentProfit}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. INTRO TAB (New!) */}
            {activeTab === 'intro' && (
              <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2">

                {/* Intro Header */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Lightbulb className="text-yellow-300" />
                    貪婪演算法 (Greedy Algorithm)
                  </h2>
                  <p className="text-indigo-100 text-lg">
                    「目光短淺，活在當下，只選眼前最好的。」
                  </p>
                </div>

                {/* Core Concept */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                      貪婪選擇性質
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      我們可以通過做出<strong>局部最佳 (Local Optimal)</strong> 的選擇，來構造出<strong>全域最佳 (Global Optimal)</strong> 的解。也就是說，我們不需要「回頭」去修正之前的決定。
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                      最佳子結構
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      一個問題的最佳解，包含了其子問題的最佳解。這意味著我們可以將問題層層拆解，每一步都用貪婪的方式解決子問題。
                    </p>
                  </div>
                </div>

                {/* Why this problem is Greedy */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-emerald-800 mb-4">為什麼「買賣股票」是貪婪法？</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="bg-white p-2 rounded-full h-fit shadow-sm text-emerald-600"><TrendingUp size={20} /></div>
                      <div>
                        <h4 className="font-bold text-emerald-900">貪心地更新最低點</h4>
                        <p className="text-sm text-emerald-800 mt-1">
                          只要看到比 <code className="bg-white px-1 rounded border border-emerald-200">minPrice</code> 更低的價格，我們就立刻更新。我們假設「買得越低越好」，所以眼前看到最低的就抓，完全不回頭。
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-white p-2 rounded-full h-fit shadow-sm text-emerald-600"><BarChart2 size={20} /></div>
                      <div>
                        <h4 className="font-bold text-emerald-900">貪心地計算最大利潤</h4>
                        <p className="text-sm text-emerald-800 mt-1">
                          每一天都試算：「如果今天賣會怎樣？」如果賺得比以前多，我們就更新 <code className="bg-white px-1 rounded border border-emerald-200">maxProfit</code>。只在乎「至今為止」能賺到的最大錢。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    貪婪法 vs 動態規劃 (DP)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-6 py-3 font-medium">特性</th>
                          <th className="px-6 py-3 font-medium text-indigo-600">貪婪演算法 (Greedy)</th>
                          <th className="px-6 py-3 font-medium text-slate-600">動態規劃 (DP)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-900">決策方式</td>
                          <td className="px-6 py-4 text-slate-600"><strong>絕不回頭</strong>。一旦做了決定就不會再改變。</td>
                          <td className="px-6 py-4 text-slate-600"><strong>通盤考量</strong>。必要時會回頭查找或比較。</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-900">效率</td>
                          <td className="px-6 py-4 text-slate-600">非常快 (O(N) 或 O(N log N))。</td>
                          <td className="px-6 py-4 text-slate-600">通常較慢 (O(N²) 或更高)。</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-medium text-slate-900">風險</td>
                          <td className="px-6 py-4 text-slate-600">容易陷入局部最佳解。</td>
                          <td className="px-6 py-4 text-slate-600">保證能找到全域最佳解。</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Warning Example */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex gap-4">
                  <div className="shrink-0">
                    <AlertTriangle className="text-amber-500" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-800 mb-1">貪婪法的陷阱：找零錢問題</h4>
                    <p className="text-sm text-amber-700 mb-2">
                      假設硬幣面額有 <code>[1, 3, 4]</code>，要湊出 <code>6</code> 元。
                    </p>
                    <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
                      <li><strong>貪婪法 (失敗)</strong>：先拿最大的 4，剩下 2，只能拿兩個 1。總共 3 枚 (4+1+1)。</li>
                      <li><strong>最佳解 (DP)</strong>：直接拿兩個 3。總共 2 枚 (3+3)。</li>
                    </ul>
                  </div>
                </div>

              </div>
            )}

            {/* 3. ERROR TAB */}
            {activeTab === 'error' && (
              <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-red-50 border border-red-100 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
                    <X size={20} /> 暴力解法 (Brute Force) - Time Limit Exceeded
                  </h3>
                  <p className="text-slate-700 mb-4">
                    最直覺的想法是使用兩層迴圈：對於每一天，都去檢查它之後的每一天，計算所有可能的利潤。
                  </p>
                  <div className="bg-slate-900 text-slate-300 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <code className="block">for (let i = 0; i &lt; prices.length; i++) {'{'}</code>
                    <code className="block pl-4">for (let j = i + 1; j &lt; prices.length; j++) {'{'}</code>
                    <code className="block pl-8">profit = prices[j] - prices[i];</code>
                    <code className="block pl-8">maxProfit = Math.max(maxProfit, profit);</code>
                    <code className="block pl-4">{'}'}</code>
                    <code className="block">{'}'}</code>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-red-700 font-medium">
                    <AlertTriangle size={16} />
                    時間複雜度：O(n²)，當 n 很大時會超時。
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={20} /> 貪婪演算法 (One Pass) - 正確解法
                  </h3>
                  <p className="text-slate-700 mb-2">
                    只需要遍歷一次陣列。我們只需要關心兩件事：
                  </p>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 ml-2">
                    <li>目前的<strong>歷史最低價</strong>是多少？ (`minPrice`)</li>
                    <li>如果今天賣出，能不能賺更多？ (`price - minPrice`)</li>
                  </ul>
                  <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 font-medium">
                    <Activity size={16} />
                    時間複雜度：O(n)，只需要掃描一次。
                  </div>
                </div>
              </div>
            )}

            {/* 4. CODE TAB */}
            {activeTab === 'code' && (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Python Solution</h3>
                <div className="bg-[#1e1e1e] text-[#d4d4d4] p-6 rounded-lg font-mono text-sm shadow-xl leading-relaxed overflow-x-auto border border-slate-700">
                  <pre className="font-mono">
                    <code>
                      <span className="text-[#569cd6]">class</span> <span className="text-[#4ec9b0]">Solution</span>:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#569cd6]">def</span> <span className="text-[#dcdcaa]">maxProfit</span>(<span className="text-[#569cd6]">self</span>, prices: <span className="text-[#4ec9b0]">List</span>[<span className="text-[#4ec9b0]">int</span>]) -&gt; <span className="text-[#4ec9b0]">int</span>:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;min_price = <span className="text-[#4ec9b0]">float</span>(<span className="text-[#ce9178]">'inf'</span>)<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;max_profit = <span className="text-[#b5cea8]">0</span><br />
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#c586c0]">for</span> price <span className="text-[#c586c0]">in</span> prices:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#6a9955]"># 貪婪選擇 1: 看到更低的就更新最低買入價</span><br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#c586c0]">if</span> price &lt; min_price:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;min_price = price<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#6a9955]"># 貪婪選擇 2: 計算當下賣出的利潤，並更新最大利潤</span><br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#c586c0]">elif</span> price - min_price &gt; max_profit:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;max_profit = price - min_price<br />
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#c586c0]">return</span> max_profit
                    </code>
                  </pre>
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      {/* ================= Problem Modal ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">121. Best Time to Buy and Sell Stock (買賣股票的最佳時機)</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-slate-700 leading-relaxed">
              <p className="mb-4">
                給定一個陣列 <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono text-red-600">prices</code>，其中 <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono">prices[i]</code> 代表某支股票在第 <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono">i</code> 天的價格。
              </p>
              <p className="mb-4">
                你只能選擇 <strong>某一天</strong> 買入這支股票，並選擇在 <strong>未來的某一個不同的日子</strong> 賣出該股票。
              </p>
              <p className="mb-6">
                請設計一個演算法來計算你所能獲取的<strong>最大利潤</strong>。如果你不能獲取任何利潤，請返回 0。
              </p>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <h4 className="font-bold text-sm text-slate-900 mb-2">範例 1：</h4>
                <p className="font-mono text-sm mb-1">輸入：prices = [7,1,5,3,6,4]</p>
                <p className="font-mono text-sm mb-1">輸出：5</p>
                <p className="text-xs text-slate-500">解釋：在第 2 天（股票價格 = 1）的時候買入，在第 5 天（股票價格 = 6）的時候賣出，最大利潤 = 6-1 = 5。注意利潤不能是 7-1 = 6, 因為賣出價格需要大於買入價格；同時，你不能在買入前賣出股票。</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 mb-2">範例 2：</h4>
                <p className="font-mono text-sm mb-1">輸入：prices = [7,6,4,3,1]</p>
                <p className="font-mono text-sm mb-1">輸出：0</p>
                <p className="text-xs text-slate-500">解釋：在這種情況下，沒有交易完成，所以最大利潤為 0。</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition"
              >
                理解了
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}