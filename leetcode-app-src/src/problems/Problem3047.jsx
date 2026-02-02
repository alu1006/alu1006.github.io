import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import {
  Maximize,
  RefreshCw,
  RotateCcw,
  BookOpen,
  XCircle,
  Layers,
  MousePointer2,
  ArrowRight,
  Code2,
  CheckCircle2,
  Info,
  Dice5,
  Move
} from 'lucide-react';

export default function Problem3047() {
  useSEO({
    title: "3047. Find Largest Square 找出最大正方形",
    description: "透過互動式動畫學習 LeetCode 3047 找出兩個矩形交集區域內的最大正方形，Easy 難度題目視覺化詳解",
    path: "/3047-find-largest-square"
  });

  // --- 狀態管理 ---
  // 預設值
  const [bottomLeftInput, setBottomLeftInput] = useState("[[1,1], [2,2], [3,1]]");
  const [topRightInput, setTopRightInput] = useState("[[3,3], [4,4], [5,5]]");

  // 解析後的數據
  const [parsedBL, setParsedBL] = useState([]);
  const [parsedTR, setParsedTR] = useState([]);
  const [parseError, setParseError] = useState(null);

  // 互動狀態
  const [activeTab, setActiveTab] = useState('visualize'); // 'visualize' | 'zip'
  const [hoverPair, setHoverPair] = useState(null); // { i, j }
  const [showProblem, setShowProblem] = useState(false);
  const [selectedPair, setSelectedPair] = useState(null); // 用於鎖定顯示

  // --- 初始化與解析 ---
  useEffect(() => {
    try {
      const bl = JSON.parse(bottomLeftInput);
      const tr = JSON.parse(topRightInput);

      if (!Array.isArray(bl) || !Array.isArray(tr) || bl.length !== tr.length) {
        throw new Error("Arrays must be equal length arrays of [x,y]");
      }
      setParsedBL(bl);
      setParsedTR(tr);
      setParseError(null);
    } catch (e) {
      setParseError("格式錯誤: 請確保輸入為合法的 JSON 座標陣列且長度一致");
    }
  }, [bottomLeftInput, topRightInput]);

  // --- 核心邏輯：矩形生成 ---
  const rectangles = useMemo(() => {
    if (parseError) return [];
    return parsedBL.map((bl, i) => ({
      id: i,
      bl: bl,          // Bottom-Left [x, y]
      tr: parsedTR[i], // Top-Right [x, y]
      // 調整配色：讓線條更明顯，填充稍微透明
      color: `hsla(${i * 137.5 % 360}, 85%, 60%, 0.3)`,
      stroke: `hsla(${i * 137.5 % 360}, 90%, 40%, 1)`,
      textColor: `hsla(${i * 137.5 % 360}, 90%, 30%, 1)`
    }));
  }, [parsedBL, parsedTR, parseError]);

  // --- 核心邏輯：計算交集 ---
  const comparisons = useMemo(() => {
    const results = [];
    let globalMaxSide = 0;

    for (let i = 0; i < rectangles.length; i++) {
      for (let j = i + 1; j < rectangles.length; j++) {
        const r1 = rectangles[i];
        const r2 = rectangles[j];

        // 1. 找出交集區域 (Intersection)
        // Max of Bottom-Lefts, Min of Top-Rights
        const ix1 = Math.max(r1.bl[0], r2.bl[0]);
        const iy1 = Math.max(r1.bl[1], r2.bl[1]);
        const ix2 = Math.min(r1.tr[0], r2.tr[0]);
        const iy2 = Math.min(r1.tr[1], r2.tr[1]);

        let width = ix2 - ix1;
        let height = iy2 - iy1;

        let valid = false;
        let side = 0;
        let squareArea = 0;

        if (width > 0 && height > 0) {
          valid = true;
          // 題目核心：正方形邊長取決於交集長寬的最小值
          side = Math.min(width, height);
          squareArea = side * side;
          globalMaxSide = Math.max(globalMaxSide, side);
        }

        results.push({
          i, j,
          r1, r2,
          intersection: { x1: ix1, y1: iy1, x2: ix2, y2: iy2, w: width, h: height },
          valid,
          side,
          squareArea
        });
      }
    }
    // 排序：有解的放前面，面積大的放前面
    return {
      list: results.sort((a, b) => b.squareArea - a.squareArea),
      maxSide: globalMaxSide,
      maxArea: globalMaxSide * globalMaxSide
    };
  }, [rectangles]);

  // --- 智慧隨機生成 ---
  const generateRandom = () => {
    const count = Math.floor(Math.random() * 3) + 3; // 3-5 rects
    const newBL = [];
    const newTR = [];

    // 定義熱區，確保重疊
    const centerX = Math.floor(Math.random() * 8) + 4;
    const centerY = Math.floor(Math.random() * 8) + 4;

    for (let i = 0; i < count; i++) {
      const offsetX = Math.floor(Math.random() * 6) - 3;
      const offsetY = Math.floor(Math.random() * 6) - 3;

      let x1 = Math.max(0, centerX + offsetX);
      let y1 = Math.max(0, centerY + offsetY);

      // 限制範圍以免爆版
      x1 = Math.min(x1, 14);
      y1 = Math.min(y1, 14);

      const w = Math.floor(Math.random() * 4) + 2;
      const h = Math.floor(Math.random() * 4) + 2;

      newBL.push([x1, y1]);
      newTR.push([x1 + w, y1 + h]);
    }
    setBottomLeftInput(JSON.stringify(newBL));
    setTopRightInput(JSON.stringify(newTR));
    setHoverPair(null);
    setSelectedPair(null);
  };

  const resetDefault = () => {
    setBottomLeftInput("[[1,1], [2,2], [3,1]]");
    setTopRightInput("[[3,3], [4,4], [5,5]]");
    setHoverPair(null);
    setSelectedPair(null);
  };

  // --- 視覺化參數 ---
  const GRID_SIZE = 18; // 加大網格範圍
  const CELL_SIZE = 30;
  const PADDING = 50; // 增加 Padding 給 Axis Labels

  // 決定當前顯示的比較對象
  const activeComp = hoverPair !== null ? comparisons.list.find(c => c.i === hoverPair.i && c.j === hoverPair.j)
    : selectedPair !== null ? comparisons.list.find(c => c.i === selectedPair.i && c.j === selectedPair.j)
      : null;

  // 輔助函式：判斷坐標軸刻度是否需要高亮
  const getAxisStyle = (val, axis) => {
    if (!activeComp) return { fill: '#cbd5e1', fontWeight: 'normal', scale: 1, opacity: 1 };

    const { r1, r2 } = activeComp;
    // 檢查數值是否為某個矩形的邊界
    const r1Match = axis === 'x' ? (val === r1.bl[0] || val === r1.tr[0]) : (val === r1.bl[1] || val === r1.tr[1]);
    const r2Match = axis === 'x' ? (val === r2.bl[0] || val === r2.tr[0]) : (val === r2.bl[1] || val === r2.tr[1]);

    if (r1Match && r2Match) return { fill: '#7e22ce', fontWeight: '900', scale: 1.6, opacity: 1, isDouble: true }; // 重疊用紫色
    if (r1Match) return { fill: r1.stroke, fontWeight: '900', scale: 1.4, opacity: 1, isR1: true };
    if (r2Match) return { fill: r2.stroke, fontWeight: '900', scale: 1.4, opacity: 1, isR2: true };

    // 非相關刻度變淡
    return { fill: '#e2e8f0', fontWeight: 'normal', scale: 0.9, opacity: 0.5 };
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-3 md:p-4 shadow-sm z-20 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 hidden md:block">
              <Maximize size={24} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate flex items-center gap-2">
                3047. Find Largest Square
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 font-normal hidden sm:inline-block">Easy</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 truncate cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setShowProblem(true)}>
                找出兩個矩形交集區域內的最大正方形。
                <span className="md:hidden text-blue-500 underline ml-1">題目</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowProblem(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all text-sm font-medium"
            >
              <BookOpen size={16} /> 題目詳情
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
              className="flex items-center gap-2 px-3 py-1.5 md:px-3 md:py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg transition-all font-medium border border-emerald-100 shadow-sm text-xs md:text-sm shrink-0"
            >
              <Dice5 size={14} /> <span className="hidden sm:inline">隨機生成</span><span className="sm:hidden">隨機</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

        {/* Left Panel: Controls & Logic */}
        <div className="w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] lg:shadow-inner shrink-0 h-[40vh] lg:h-full">

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('visualize')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'visualize' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Layers size={16} /> 矩形分析
              {activeTab === 'visualize' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
            </button>
            <button
              onClick={() => setActiveTab('zip')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'zip' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Code2 size={16} /> Zip 教學
              {activeTab === 'zip' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

            {/* Input Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">輸入座標 (JSON)</label>
                {parseError && <span className="text-xs text-red-500 flex items-center gap-1"><XCircle size={12} /> 格式錯誤</span>}
              </div>
              <div>
                <span className="text-[10px] text-blue-500 font-mono mb-1 block">bottomLeft = </span>
                <input
                  type="text"
                  value={bottomLeftInput}
                  onChange={(e) => setBottomLeftInput(e.target.value)}
                  className="w-full font-mono text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <span className="text-[10px] text-emerald-500 font-mono mb-1 block">topRight = </span>
                <input
                  type="text"
                  value={topRightInput}
                  onChange={(e) => setTopRightInput(e.target.value)}
                  className="w-full font-mono text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Content based on Active Tab */}
            {activeTab === 'visualize' ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex justify-between items-end mb-3 border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MousePointer2 size={16} className="text-blue-500" />
                    交集列表
                  </h3>
                  <span className="text-[10px] text-slate-400">點擊列表鎖定顯示</span>
                </div>

                {/* Result List */}
                <div className="space-y-2">
                  {comparisons.list.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs">沒有足夠的矩形進行比較</div>
                  ) : (
                    comparisons.list.map((comp, idx) => {
                      const isActive = (hoverPair && hoverPair.i === comp.i && hoverPair.j === comp.j) || (selectedPair && selectedPair.i === comp.i && selectedPair.j === comp.j);
                      const isLocked = selectedPair && selectedPair.i === comp.i && selectedPair.j === comp.j;
                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoverPair({ i: comp.i, j: comp.j })}
                          onMouseLeave={() => setHoverPair(null)}
                          onClick={() => setSelectedPair(isLocked ? null : { i: comp.i, j: comp.j })}
                          className={`group p-3 rounded-lg border cursor-pointer transition-all relative overflow-hidden
                            ${isActive
                              ? 'bg-blue-50 border-blue-400 shadow-md ring-1 ring-blue-200'
                              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1">
                                <div className="w-3 h-3 rounded-sm border border-slate-300" style={{ backgroundColor: comp.r1.stroke }}></div>
                                <div className="w-3 h-3 rounded-sm border border-slate-300" style={{ backgroundColor: comp.r2.stroke }}></div>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-600">Rect #{comp.i} & #{comp.j}</span>
                            </div>
                            {comp.valid ? (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isActive ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                                {isLocked && <CheckCircle2 size={10} />}
                                Side: {comp.side}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">無重疊</span>
                            )}
                          </div>

                          {/* Details only when active */}
                          {isActive && comp.valid && (
                            <div className="mt-2 pt-2 border-t border-blue-200 text-[10px] font-mono space-y-1 text-blue-800 animate-in zoom-in-95 duration-200">
                              <div className="flex justify-between items-center group/item hover:bg-blue-100/50 rounded px-1 transition-colors">
                                <span className="flex items-center gap-1"><Move size={10} className="rotate-0" /> X交集:</span>
                                <span className="font-bold">[{comp.intersection.x1}, {comp.intersection.x2}]</span>
                              </div>
                              <div className="flex justify-between items-center group/item hover:bg-blue-100/50 rounded px-1 transition-colors">
                                <span className="flex items-center gap-1"><Move size={10} className="rotate-90" /> Y交集:</span>
                                <span className="font-bold">[{comp.intersection.y1}, {comp.intersection.y2}]</span>
                              </div>
                              <div className="flex justify-between font-bold mt-1 pt-1 border-t border-blue-200/50">
                                <span>最大正方形:</span>
                                <span>min({comp.intersection.w}, {comp.intersection.h}) = {comp.side}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              // ZIP Learning Tab
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">

                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-sm text-emerald-800 leading-relaxed">
                  <h4 className="font-bold flex items-center gap-2 mb-1"><Info size={14} /> 什麼是 Zip?</h4>
                  <p className="text-xs opacity-90">
                    LeetCode 的輸入將左下角和右上角分開成兩個陣列。使用 Python 的 <code>zip(bottomLeft, topRight)</code> 可以像拉鍊一樣，將對應的座標合併成一個個完整的矩形物件。
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-mono">
                  {/* Visualizing Array 1 */}
                  <div className="flex flex-col gap-2">
                    <div className="text-center font-bold text-blue-600 mb-1">bottomLeft</div>
                    {parsedBL.map((item, i) => (
                      <div key={i} className="bg-blue-50 border border-blue-200 px-2 py-1.5 rounded text-blue-700 h-8 flex items-center justify-center">
                        {JSON.stringify(item)}
                      </div>
                    ))}
                  </div>

                  <div className="text-slate-300 flex flex-col items-center gap-2 justify-center h-full pt-6">
                    {parsedBL.map((_, i) => (
                      <div key={i} className="h-8 flex items-center"><ArrowRight size={14} /></div>
                    ))}
                  </div>

                  {/* Visualizing Array 2 */}
                  <div className="flex flex-col gap-2">
                    <div className="text-center font-bold text-emerald-600 mb-1">topRight</div>
                    {parsedTR.map((item, i) => (
                      <div key={i} className="bg-emerald-50 border border-emerald-200 px-2 py-1.5 rounded text-emerald-700 h-8 flex items-center justify-center">
                        {JSON.stringify(item)}
                      </div>
                    ))}
                  </div>

                  <div className="text-slate-400 flex flex-col items-center justify-center pt-6 font-bold text-lg">
                    =
                  </div>

                  {/* Result */}
                  <div className="flex flex-col gap-2">
                    <div className="text-center font-bold text-purple-600 mb-1">Rectangles</div>
                    {rectangles.map((r, i) => (
                      <div key={i} className="bg-purple-50 border border-purple-200 px-2 py-1.5 rounded text-purple-700 h-8 flex items-center whitespace-nowrap shadow-sm">
                        [ {JSON.stringify(r.bl)}, {JSON.stringify(r.tr)} ]
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                  <div className="text-slate-500 mb-1">// Python Code Concept</div>
                  <div>rectangles = []</div>
                  <div><span className="text-purple-400">for</span> bl, tr <span className="text-purple-400">in</span> <span className="text-yellow-400">zip</span>(bottomLeft, topRight):</div>
                  <div className="pl-4">rectangles.append([bl, tr])</div>
                </div>
              </div>
            )}

            {/* Global Stats */}
            <div className="mt-auto bg-slate-900 text-white rounded-xl p-4 shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">全局最大邊長</span>
                <span className="text-2xl font-black text-emerald-400">{comparisons.maxSide}</span>
              </div>
              <div className="flex justify-between items-center mt-1 border-t border-slate-800 pt-2">
                <span className="text-xs text-slate-500">對應面積</span>
                <span className="text-sm font-mono text-slate-300">{comparisons.maxArea}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Panel: Visualization Grid */}
        <div className="flex-1 bg-slate-100/50 relative overflow-hidden flex flex-col items-center justify-center p-4">

          <div className="bg-white shadow-xl rounded-lg border border-slate-200 p-4 relative overflow-auto max-w-full max-h-full">
            {/* Coordinate Info */}
            <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded border border-slate-200 text-[10px] font-mono text-slate-500 shadow-sm pointer-events-none">
              Grid: 0 ~ {GRID_SIZE}
            </div>

            {/* SVG Canvas */}
            <svg
              width={GRID_SIZE * CELL_SIZE + PADDING * 2}
              height={GRID_SIZE * CELL_SIZE + PADDING * 2}
              className="select-none"
            >
              <g transform={`translate(${PADDING}, ${GRID_SIZE * CELL_SIZE + PADDING}) scale(1, -1)`}>

                {/* 1. Grid Lines (Bottom Layer) */}
                {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => {
                  const xStyle = getAxisStyle(i, 'x');
                  const yStyle = getAxisStyle(i, 'y');

                  return (
                    <g key={i}>
                      {/* Vertical lines */}
                      <line
                        x1={i * CELL_SIZE} y1={0}
                        x2={i * CELL_SIZE} y2={GRID_SIZE * CELL_SIZE}
                        stroke="#f1f5f9" strokeWidth="1"
                      />
                      {/* Horizontal lines */}
                      <line
                        x1={0} y1={i * CELL_SIZE}
                        x2={GRID_SIZE * CELL_SIZE} y2={i * CELL_SIZE}
                        stroke="#f1f5f9" strokeWidth="1"
                      />

                      {/* Axis Ticks/Marks on the axis line itself */}
                      <line x1={i * CELL_SIZE} x2={i * CELL_SIZE} y1={-3} y2={3} stroke={xStyle.fill} strokeWidth={xStyle.scale > 1 ? 2 : 1} />
                      <line y1={i * CELL_SIZE} y2={i * CELL_SIZE} x1={-3} x2={3} stroke={yStyle.fill} strokeWidth={yStyle.scale > 1 ? 2 : 1} />

                      {/* X Axis Labels */}
                      <text
                        x={i * CELL_SIZE}
                        y={-15}
                        transform="scale(1, -1)"
                        textAnchor="middle"
                        fontSize={10 * xStyle.scale}
                        fill={xStyle.fill}
                        fontWeight={xStyle.fontWeight}
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        {i}
                      </text>

                      {/* Y Axis Labels */}
                      <text
                        x={-15}
                        y={-(i * CELL_SIZE)}
                        transform="scale(1, -1)"
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={10 * yStyle.scale}
                        fill={yStyle.fill}
                        fontWeight={yStyle.fontWeight}
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        {i}
                      </text>
                    </g>
                  )
                })}

                {/* 2. Projection Lines (For Active Comp Only) */}
                {activeComp && (
                  <>
                    {/* Projections for Rect 1 */}
                    {[activeComp.r1.bl, activeComp.r1.tr].map((coord, idx) => (
                      <g key={`proj-r1-${idx}`} opacity="0.6">
                        {/* Vertical Projection to X axis */}
                        <line
                          x1={coord[0] * CELL_SIZE} y1={0}
                          x2={coord[0] * CELL_SIZE} y2={coord[1] * CELL_SIZE}
                          stroke={activeComp.r1.stroke}
                          strokeWidth="1"
                          strokeDasharray="4 2"
                        />
                        {/* Horizontal Projection to Y axis */}
                        <line
                          x1={0} y1={coord[1] * CELL_SIZE}
                          x2={coord[0] * CELL_SIZE} y2={coord[1] * CELL_SIZE}
                          stroke={activeComp.r1.stroke}
                          strokeWidth="1"
                          strokeDasharray="4 2"
                        />
                      </g>
                    ))}
                    {/* Projections for Rect 2 */}
                    {[activeComp.r2.bl, activeComp.r2.tr].map((coord, idx) => (
                      <g key={`proj-r2-${idx}`} opacity="0.6">
                        <line
                          x1={coord[0] * CELL_SIZE} y1={0}
                          x2={coord[0] * CELL_SIZE} y2={coord[1] * CELL_SIZE}
                          stroke={activeComp.r2.stroke}
                          strokeWidth="1"
                          strokeDasharray="4 2"
                        />
                        <line
                          x1={0} y1={coord[1] * CELL_SIZE}
                          x2={coord[0] * CELL_SIZE} y2={coord[1] * CELL_SIZE}
                          stroke={activeComp.r2.stroke}
                          strokeWidth="1"
                          strokeDasharray="4 2"
                        />
                      </g>
                    ))}
                  </>
                )}

                {/* 3. Rectangles */}
                {rectangles.map((rect, idx) => {
                  const width = (rect.tr[0] - rect.bl[0]) * CELL_SIZE;
                  const height = (rect.tr[1] - rect.bl[1]) * CELL_SIZE;
                  const x = rect.bl[0] * CELL_SIZE;
                  const y = rect.bl[1] * CELL_SIZE;

                  const isDimmed = activeComp && (activeComp.i !== rect.id && activeComp.j !== rect.id);

                  return (
                    <g key={rect.id} style={{ opacity: isDimmed ? 0.05 : 1, transition: 'opacity 0.3s ease' }}>
                      <rect
                        x={x} y={y} width={width} height={height}
                        fill={rect.color}
                        stroke={rect.stroke}
                        strokeWidth="2"
                        rx="2"
                      />
                      {/* Label ID */}
                      <text
                        x={x + width / 2} y={-(y + height / 2)}
                        transform="scale(1, -1)"
                        fill={rect.textColor}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        #{rect.id}
                      </text>
                    </g>
                  );
                })}

                {/* 4. Intersection Highlight */}
                {activeComp && activeComp.valid && (
                  <g>
                    {/* Intersection Area (Dashed Box) */}
                    <rect
                      x={activeComp.intersection.x1 * CELL_SIZE}
                      y={activeComp.intersection.y1 * CELL_SIZE}
                      width={activeComp.intersection.w * CELL_SIZE}
                      height={activeComp.intersection.h * CELL_SIZE}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />

                    {/* The Max Square Inside (Solid Gold Box) */}
                    <rect
                      x={activeComp.intersection.x1 * CELL_SIZE}
                      y={activeComp.intersection.y1 * CELL_SIZE}
                      width={activeComp.side * CELL_SIZE}
                      height={activeComp.side * CELL_SIZE}
                      fill="rgba(245, 158, 11, 0.4)"
                      stroke="#f59e0b"
                      strokeWidth="3"
                    />
                    <text
                      x={(activeComp.intersection.x1 * CELL_SIZE) + (activeComp.side * CELL_SIZE) / 2}
                      y={-((activeComp.intersection.y1 * CELL_SIZE) + (activeComp.side * CELL_SIZE) / 2)}
                      transform="scale(1, -1)"
                      fill="#b45309"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      S: {activeComp.side}
                    </text>
                  </g>
                )}
              </g>
            </svg>
          </div>

          {/* Logic Explanation Overlay (Bottom Right) */}
          {activeComp && (
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur shadow-xl border border-blue-100 p-4 rounded-xl max-w-xs animate-in slide-in-from-bottom-4 z-20 hidden md:block">
              <h4 className="font-bold text-blue-800 text-xs uppercase mb-2 flex items-center gap-2">
                <CheckCircle2 size={14} /> 坐標解析
              </h4>
              <div className="space-y-2 text-xs font-mono text-slate-600">
                <div className="flex justify-between items-center bg-blue-50/50 p-1 rounded">
                  <span>Max(X1):</span>
                  <span className="text-blue-600 font-bold">max({activeComp.r1.bl[0]}, {activeComp.r2.bl[0]}) = {activeComp.intersection.x1}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50/50 p-1 rounded">
                  <span>Min(X2):</span>
                  <span className="text-emerald-600 font-bold">min({activeComp.r1.tr[0]}, {activeComp.r2.tr[0]}) = {activeComp.intersection.x2}</span>
                </div>

                <div className="border-t border-slate-100 pt-2 mt-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Width</span>
                    <span>Height</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{activeComp.intersection.w}</span>
                    <span>{activeComp.intersection.h}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1 bg-amber-50 p-1 rounded">
                  <span className="block text-[10px] text-amber-600 font-bold">最大正方形 (Side)</span>
                  <div className="text-amber-800 font-bold">min({activeComp.intersection.w}, {activeComp.intersection.h}) = {activeComp.side}</div>
                </div>
              </div>
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
                <BookOpen size={20} className="text-blue-600" /> 3047. 題目描述
              </h3>
              <button onClick={() => setShowProblem(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed overflow-y-auto max-h-[60vh]">
              <p>
                給你兩個 2D 整數陣列 <code>bottomLeft</code> 和 <code>topRight</code>，分別代表平面上多個軸對齊矩形的左下角和右上角座標。
              </p>
              <div className="bg-slate-50 p-3 rounded border border-slate-100">
                <p className="font-mono text-xs text-slate-500 mb-1">輸入範例：</p>
                <code className="block text-xs text-blue-600">bottomLeft = [[1,1], [2,2]]</code>
                <code className="block text-xs text-emerald-600">topRight = [[3,3], [4,4]]</code>
              </div>
              <p>
                請你找出這群矩形中，任意 <strong>兩個矩形</strong> 的 <strong>交集區域 (Intersection)</strong> 內，可以形成的的 <strong>最大正方形</strong> 面積。
              </p>
              <div className="border-l-4 border-blue-500 pl-4 py-1 bg-blue-50/50">
                <p className="font-bold text-slate-800 mb-1">解題思路：</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>使用 <code>zip</code> 將兩個座標陣列合併成矩形物件。</li>
                  <li>使用兩層迴圈遍歷所有矩形組合 (i, j)。</li>
                  <li>
                    計算重疊區域的邊界：
                    <br />
                    <code>ix1 = max(ax, bx), ix2 = min(aw, bw)</code>
                  </li>
                  <li>
                    交集寬度 = <code>ix2 - ix1</code>
                  </li>
                  <li>正方形邊長 = <code>min(width, height)</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
