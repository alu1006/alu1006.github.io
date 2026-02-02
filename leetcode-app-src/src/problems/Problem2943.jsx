import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Settings, RefreshCw, Info, FileText, CheckCircle2, Dices, LayoutGrid, Lightbulb, MoveRight, Code } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function Problem2943() {
  useSEO({
    title: "2943. Maximize Area of Square Hole in Grid",
    description: "透過視覺化動畫學習 LeetCode 2943 網格最大正方形孔洞，使用貪婪演算法 Greedy，Medium 難度詳解",
    path: "/2943-maximize-area-of-square-hole-in-grid"
  });

  // 基本設定：n 和 m
  const [n, setN] = useState(4);
  const [m, setM] = useState(6);

  // hBars 和 vBars 的字串輸入
  const [hInput, setHInput] = useState("2,3,4");
  const [vInput, setVInput] = useState("2,3,5,6");

  // 隨機生成陣列字串的函式
  const generateRandomBars = (limit) => {
    const possible = [];
    for (let i = 2; i <= limit + 1; i++) {
      possible.push(i);
    }
    const ratio = 0.5 + Math.random() * 0.3;
    const count = Math.max(1, Math.floor(possible.length * ratio));
    const shuffled = [...possible].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count).sort((a, b) => a - b);
    return selected.join(', ');
  };

  const handleNChange = (val) => {
    setN(val);
    setHInput(generateRandomBars(val));
    setRemovedH(new Set());
  };

  const handleMChange = (val) => {
    setM(val);
    setVInput(generateRandomBars(val));
    setRemovedV(new Set());
  };

  // 解析輸入內容
  const hBars = useMemo(() => {
    if (!hInput || typeof hInput !== 'string') return [];
    return hInput.split(',')
      .map(s => parseInt(s.trim()))
      .filter(num => !isNaN(num) && num > 1 && num <= n + 1);
  }, [hInput, n]);

  const vBars = useMemo(() => {
    if (!vInput || typeof vInput !== 'string') return [];
    return vInput.split(',')
      .map(s => parseInt(s.trim()))
      .filter(num => !isNaN(num) && num > 1 && num <= m + 1);
  }, [vInput, m]);

  const [removedH, setRemovedH] = useState(new Set());
  const [removedV, setRemovedV] = useState(new Set());

  // 核心計算邏輯
  const findMaxGapInfo = (removedSet) => {
    if (!removedSet || removedSet.size === 0) return { max: 1, consecutive: [] };
    const sorted = Array.from(removedSet).sort((a, b) => a - b);
    let maxLen = 0;
    let currentLen = 0;
    let bestSeq = [];
    let currentSeq = [];

    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] === sorted[i - 1] + 1) {
        currentLen++;
        currentSeq.push(sorted[i]);
      } else {
        currentLen = 1;
        currentSeq = [sorted[i]];
      }
      if (currentLen > maxLen) {
        maxLen = currentLen;
        bestSeq = [...currentSeq];
      }
    }
    return { max: maxLen + 1, consecutive: bestSeq };
  };

  const hGapInfo = findMaxGapInfo(removedH);
  const vGapInfo = findMaxGapInfo(removedV);
  const side = Math.min(hGapInfo.max, vGapInfo.max);
  const area = side * side;

  // 動態格子大小計算
  const VIEW_AREA_SIZE = 400;
  const cellSize = Math.min(VIEW_AREA_SIZE / (m + 1), VIEW_AREA_SIZE / (n + 1));
  const gridWidth = (m + 1) * cellSize;
  const gridHeight = (n + 1) * cellSize;

  const toggleH = (bar) => {
    if (!hBars.includes(bar)) return;
    const next = new Set(removedH);
    if (next.has(bar)) next.delete(bar);
    else next.add(bar);
    setRemovedH(next);
  };

  const toggleV = (bar) => {
    if (!vBars.includes(bar)) return;
    const next = new Set(removedV);
    if (next.has(bar)) next.delete(bar);
    else next.add(bar);
    setRemovedV(next);
  };

  const resetAll = () => {
    const newH = generateRandomBars(n);
    const newV = generateRandomBars(m);
    setHInput(newH);
    setVInput(newV);
    setRemovedH(new Set());
    setRemovedV(new Set());
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* 頂部題目描述 */}
      <div className="bg-white border-b border-slate-200 p-4 shrink-0 shadow-sm z-20">
        <div className="max-w-7xl mx-auto flex items-start gap-4">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 hidden md:block mt-1">
            <FileText size={24} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              2943. Maximize Area of Square Hole in Grid
            </h1>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              給你兩個整數 <code className="bg-slate-100 px-1 rounded text-red-500">n</code> 和 <code className="bg-slate-100 px-1 rounded text-red-500">m</code>。
              網格有 <code className="bg-slate-100 px-1 rounded">n+2</code> 條水平線和 <code className="bg-slate-100 px-1 rounded">m+2</code> 條垂直線，創建出 1x1 的單元格。
              你可以移除 <code className="bg-slate-100 px-1 rounded text-blue-600">hBars</code> 中的水平欄杆和 <code className="bg-slate-100 px-1 rounded text-indigo-600">vBars</code> 中的垂直欄杆。其餘欄杆是固定的。
              請回傳移除部分欄杆後，網格中<b>最大正方形孔洞</b>的面積。
            </p>
          </div>
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all font-medium border border-blue-100 shadow-sm shrink-0"
          >
            <Dices size={16} /> 隨機生成新測資
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* 左側面板 */}
        <div className="w-80 border-r border-slate-200 bg-white p-6 overflow-y-auto shrink-0 flex flex-col gap-6 shadow-inner">
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Settings size={14} /> 網格設定
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2 text-slate-600">
                  <span>內部水平線 n: {n}</span>
                </div>
                <input type="range" min="1" max="12" value={n} onChange={(e) => handleNChange(parseInt(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2 text-slate-600">
                  <span>內部垂直線 m: {m}</span>
                </div>
                <input type="range" min="1" max="12" value={m} onChange={(e) => handleMChange(parseInt(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} /> 可選欄杆 (hBars/vBars)
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-blue-500 uppercase">水平 hBars</label>
                  <button onClick={() => setHInput(generateRandomBars(n))} className="text-slate-300 hover:text-blue-500 transition-colors"><RefreshCw size={10} /></button>
                </div>
                <input
                  type="text" value={hInput} onChange={(e) => { setHInput(e.target.value); setRemovedH(new Set()); }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-blue-500 outline-none font-mono"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-indigo-500 uppercase">垂直 vBars</label>
                  <button onClick={() => setVInput(generateRandomBars(m))} className="text-slate-300 hover:text-indigo-500 transition-colors"><RefreshCw size={10} /></button>
                </div>
                <input
                  type="text" value={vInput} onChange={(e) => { setVInput(e.target.value); setRemovedV(new Set()); }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:border-indigo-500 outline-none font-mono"
                />
              </div>
            </div>
          </section>

          <div className="mt-auto bg-slate-900 rounded-xl p-5 text-white shadow-2xl border border-slate-800">
            <div className="text-xs font-bold text-slate-500 uppercase mb-4 border-b border-slate-800 pb-2 flex justify-between text-center">
              <span>當前計算結果</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-400">最大水平間隙 (H)</span>
                <span className="text-xl font-mono text-blue-400">{hGapInfo.max}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-400">最大垂直間隙 (V)</span>
                <span className="text-xl font-mono text-indigo-400">{vGapInfo.max}</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex flex-col items-center gap-1 text-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">最大正方形面積</span>
                <span className="text-4xl font-black text-white">{area}</span>
                <div className="text-[10px] text-blue-400 mt-1 uppercase font-bold">Side: {side}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：畫布與解題引導 */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-100/50">
          <div className="p-12 flex-shrink-0 flex items-center justify-center min-h-[500px]">
            <div className="relative bg-white shadow-2xl rounded-lg flex items-center justify-center p-0 border-8 border-white transition-all duration-500"
              style={{ width: `${gridWidth}px`, height: `${gridHeight}px` }}>

              <div className="absolute inset-0 grid pointer-events-none"
                style={{ gridTemplateColumns: `repeat(${m + 1}, 1fr)`, gridTemplateRows: `repeat(${n + 1}, 1fr)` }}>
                {Array.from({ length: (n + 1) * (m + 1) }).map((_, i) => (
                  <div key={i} className="border border-slate-100 bg-slate-50/20"></div>
                ))}
              </div>

              <div className="absolute inset-0">
                {/* 水平欄杆 */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {Array.from({ length: n + 2 }).map((_, i) => {
                    const barNum = i + 1;
                    const canBeRemoved = hBars.includes(barNum);
                    const isRemoved = removedH.has(barNum);
                    return (
                      <div key={`h-${i}`} onClick={() => canBeRemoved && toggleH(barNum)}
                        className={`relative w-full h-1.5 transition-all duration-300 z-10 
                        ${isRemoved ? 'opacity-0 scale-y-0' : 'opacity-100'} 
                        ${canBeRemoved ? 'bg-blue-400 cursor-pointer hover:bg-blue-500 shadow-sm' : 'bg-slate-800 cursor-not-allowed'}`}>
                        <span className="absolute -top-4 left-0 text-[8px] font-mono text-slate-400 font-bold opacity-60">H{barNum}</span>
                      </div>
                    );
                  })}
                </div>
                {/* 垂直欄杆 */}
                <div className="absolute inset-0 flex justify-between">
                  {Array.from({ length: m + 2 }).map((_, i) => {
                    const barNum = i + 1;
                    const canBeRemoved = vBars.includes(barNum);
                    const isRemoved = removedV.has(barNum);
                    return (
                      <div key={`v-${i}`} onClick={() => canBeRemoved && toggleV(barNum)}
                        className={`relative h-full w-1.5 transition-all duration-300 z-10 
                        ${isRemoved ? 'opacity-0 scale-x-0' : 'opacity-100'} 
                        ${canBeRemoved ? 'bg-indigo-400 cursor-pointer hover:bg-indigo-500 shadow-sm' : 'bg-slate-800 cursor-not-allowed'}`}>
                        <span className="absolute -left-6 top-0 text-[8px] font-mono text-slate-400 rotate-[-90deg] font-bold opacity-60">V{barNum}</span>
                      </div>
                    );
                  })}
                </div>

                {/* 正方形高亮 */}
                <div className="absolute top-0 left-0 bg-blue-500/10 border-2 border-dashed border-blue-500 pointer-events-none transition-all duration-500 flex items-center justify-center"
                  style={{
                    width: `${side * cellSize}px`,
                    height: `${side * cellSize}px`,
                    opacity: area > 1 ? 1 : 0
                  }}>
                  {area > 1 && (
                    <div className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg">
                      {side}x{side}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 引導區 */}
          <div className="max-w-4xl mx-auto w-full p-8 pb-20 space-y-8">
            <div className="border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                <Lightbulb className="text-amber-500" />
                解題思路引導
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">1</span>
                    <h3 className="font-bold">尋找連續區間</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    洞口的大小取決於「連續移除」的數量。請點擊網格上的藍線模擬移除動作。
                  </p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 font-mono text-xs">
                    <span className="text-blue-500 font-bold uppercase tracking-tighter">最長連續 H 序列: </span>
                    <span className="text-slate-700 ml-1 font-bold">
                      {hGapInfo.consecutive.length > 0 ? hGapInfo.consecutive.join(' → ') : '無'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">2</span>
                    <h3 className="font-bold">計算該方向最大邊長</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    如果你連續移除了 $k$ 根欄杆，則該方向的最大邊長（Gap）就是 $k+1$。
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="px-2 py-1 bg-blue-50 rounded text-blue-600 font-bold">連 {hGapInfo.consecutive.length} 根</div>
                    <MoveRight size={16} className="text-slate-300" />
                    <div className="px-2 py-1 bg-slate-900 rounded text-white font-bold">邊長 {hGapInfo.max}</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">3</span>
                    <h3 className="font-bold">短板效應：決定正方形邊長</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    正方形要求長寬相等。最終邊長由水平 (H) 和垂直 (V) 中較短的那邊決定。
                  </p>
                  <div className="flex flex-wrap items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 justify-center">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Max H Side</div>
                      <div className="text-2xl font-black text-blue-600">{hGapInfo.max}</div>
                    </div>
                    <div className="text-slate-300 text-2xl font-light">|</div>
                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Max V Side</div>
                      <div className="text-2xl font-black text-indigo-600">{vGapInfo.max}</div>
                    </div>
                    <MoveRight className="text-slate-400" />
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-200 text-center min-w-[120px]">
                      <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest font-black">最終邊長 (Side)</div>
                      <div className="text-3xl font-black text-slate-900">{side}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-slate-900 rounded-2xl p-6 text-slate-300">
                <div className="flex items-center gap-2 mb-4 text-white font-bold underline decoration-blue-500 underline-offset-4">
                  <Code size={18} className="text-blue-400" />
                  核心邏輯摘要
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><span className="text-blue-400 font-bold">排序</span>：排序可移動欄杆，以便線性掃描找出連續的編號。</li>
                  <li><span className="text-blue-400 font-bold">掃描</span>：記錄最長連續序列長度 $k$，則最大間隙為 $k+1$。</li>
                  <li><span className="text-blue-400 font-bold">面積</span>：回傳 $\min(H\_Gap, V\_Gap)^2$。</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
