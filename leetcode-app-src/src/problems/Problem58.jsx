import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  Info, Code, Bug, Eye, Edit3, CheckCircle2, AlertCircle,
  ChevronRight, ChevronLeft, Terminal, Layout, Scissors, MousePointer2
} from 'lucide-react';

// --- 核心演算法：幀生成器 ---
// 方法一：指針法 (Pointer)
const generatePointerFrames = (s) => {
  const frames = [];
  let i = s.length - 1;
  let length = 0;

  frames.push({
    index: i, length: 0, phase: 'init',
    description: "初始化：從字串末尾開始往回找。",
    highlightIdx: -1, foundWord: false
  });

  while (i >= 0 && s[i] === ' ') {
    frames.push({
      index: i, length: 0, phase: 'trimming',
      description: `正在跳過結尾空格：索引 ${i} 是空格。`,
      highlightIdx: i, foundWord: false
    });
    i--;
  }

  while (i >= 0 && s[i] !== ' ') {
    length++;
    frames.push({
      index: i, length: length, phase: 'counting',
      description: `發現字元 '${s[i]}'：這是單字的一部分，長度增加到 ${length}。`,
      highlightIdx: i, foundWord: true
    });
    i--;
  }

  frames.push({
    index: i, length: length, phase: 'done',
    description: `結束：遇到空格或字串開頭，最後一個單字長度為 ${length}。`,
    highlightIdx: -1, foundWord: true
  });
  return frames;
};

// 方法二：Split 切割法
const generateSplitFrames = (s) => {
  const frames = [];
  
  frames.push({
    phase: 'raw',
    data: s,
    description: "原始字串：準備使用 Python 的 split() 方法。"
  });

  // 模擬 Python 的 split()，它會自動處理連續空格
  const words = s.trim().split(/\s+/).filter(w => w.length > 0);
  
  frames.push({
    phase: 'split',
    data: words,
    description: "執行 split()：字串被切割成單字清單，自動忽略多餘空格。"
  });

  if (words.length > 0) {
    const lastWord = words[words.length - 1];
    frames.push({
      phase: 'target',
      data: words,
      targetIdx: words.length - 1,
      description: `選取索引 [-1]：清單中的最後一個單字是 "${lastWord}"。`
    });

    frames.push({
      phase: 'done',
      data: words,
      length: lastWord.length,
      description: `計算長度："${lastWord}" 的長度為 ${lastWord.length}。`
    });
  } else {
    frames.push({
      phase: 'done',
      data: [],
      length: 0,
      description: "清單為空，回傳長度 0。"
    });
  }
  return frames;
};

export default function Problem58() {
  useSEO({
    title: "58. Length of Last Word 最後一個單字的長度",
    description: "透過互動式動畫學習 LeetCode 58 最後一個單字的長度，深入理解指針法與Split切割字串的演算法，輕鬆掌握這個簡單難度的字串操作問題。",
    path: "/58-length-of-last-word"
  });

  // --- 狀態管理 ---
  const [inputText, setInputText] = useState("Hello World  ");
  const [method, setMethod] = useState('pointer'); // 'pointer' 或 'split'
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [activeTab, setActiveTab] = useState('visualize');
  const [fillValue, setFillValue] = useState(['', '']);
  const [feedback, setFeedback] = useState(null);

  const frames = useMemo(() => {
    return method === 'pointer' ? generatePointerFrames(inputText) : generateSplitFrames(inputText);
  }, [inputText, method]);

  const currentFrame = frames[currentFrameIdx] || frames[0];

  // --- 播放器邏輯 ---
  useEffect(() => {
    let timer;
    if (isPlaying && currentFrameIdx < frames.length - 1) {
      timer = setTimeout(() => {
        setCurrentFrameIdx(prev => prev + 1);
      }, speed);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentFrameIdx, frames.length, speed]);

  const resetAnimation = () => {
    setCurrentFrameIdx(0);
    setIsPlaying(false);
  };

  const handlePreset = (text) => {
    setInputText(text);
    resetAnimation();
  };

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 左側側邊欄 - 控制面板 */}
      <aside className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shadow-sm z-10">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-100 mt-1">
            <Layout size={22} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-xl tracking-tighter text-slate-800 leading-tight">LeetCode 58</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Length of Last Word</p>
          </div>
        </div>

        {/* 方法切換 */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">解法切換</label>
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => { setMethod('pointer'); resetAnimation(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${method === 'pointer' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <MousePointer2 size={14}/> 指針法
            </button>
            <button 
              onClick={() => { setMethod('split'); resetAnimation(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${method === 'split' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Scissors size={14}/> Split法
            </button>
          </div>
        </div>

        {/* 輸入區 */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Edit3 size={14}/> 輸入字串
          </label>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => handlePreset(e.target.value)}
            className="w-full p-3 bg-slate-100 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all font-mono text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handlePreset("Hello World")} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors">基本</button>
            <button onClick={() => handlePreset("   fly me   to   the moon  ")} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors">多空格</button>
            <button onClick={() => handlePreset("luffy")} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors">單字</button>
          </div>
        </div>

        {/* 播放控制 */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center px-2">
            <button onClick={resetAnimation} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-indigo-600 shadow-sm"><RotateCcw size={18}/></button>
            <button onClick={() => setCurrentFrameIdx(prev => Math.max(0, prev - 1))} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-indigo-600 shadow-sm"><SkipBack size={18}/></button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all shadow-lg scale-110 active:scale-95 flex items-center justify-center"
            >
              {isPlaying ? <Pause size={24}/> : <Play size={24} className="ml-1" fill="currentColor"/>}
            </button>
            <button onClick={() => setCurrentFrameIdx(prev => Math.min(frames.length - 1, prev + 1))} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-indigo-600 shadow-sm"><SkipForward size={18}/></button>
          </div>
          <div className="space-y-2 px-2">
            <input 
              type="range" min="100" max="1500" step="100" value={1600 - speed} 
              onChange={(e) => setSpeed(1600 - e.target.value)}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* 變數面板 */}
        <div className="space-y-3">
          <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase">當前長度</div>
            <div className="text-xl font-mono font-bold text-emerald-600">{currentFrame.length || 0}</div>
          </div>
        </div>

        {/* 步驟說明 */}
        <div className="flex-1 overflow-y-auto min-h-[100px]">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl shadow-sm">
            <p className="text-sm text-indigo-900 leading-relaxed font-medium italic">
              {currentFrame.description}
            </p>
          </div>
        </div>
      </aside>

      {/* 右側主視窗 */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        
        {/* Toast Feedback */}
        {feedback && (
          <div className={`absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-in fade-in zoom-in duration-300 ${feedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
            <span className="font-bold">{feedback.msg}</span>
          </div>
        )}

        {/* 分頁導航 */}
        <nav className="bg-white border-b border-slate-200 px-6 flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-1">
            {[
              { id: 'intro', label: '題目預覽', icon: Info },
              { id: 'visualize', label: '視覺化', icon: Eye },
              { id: 'exercise', label: '動手練習', icon: Edit3 },
              { id: 'theory', label: '算法教學', icon: Terminal },
              { id: 'fill', label: '程式填空', icon: CheckCircle2 },
              { id: 'error', label: '常見錯誤', icon: Bug },
              { id: 'code', label: '程式碼', icon: Code },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* 內容區塊 */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          
          {/* Tab: 題目預覽 */}
          {activeTab === 'intro' && (
            <div className="max-w-2xl w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-lg italic">58</span>
                Length of Last Word
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                返回字串中 <strong>最後一個</strong> 單字的長度。單字是由非空格字元組成的子字串。
              </p>
              <div className="bg-slate-50 p-5 rounded-2xl space-y-2 font-mono text-sm border border-slate-100 shadow-inner">
                <p><span className="text-indigo-600 font-bold">Input:</span> s = "Hello World"</p>
                <p><span className="text-indigo-600 font-bold">Output:</span> 5</p>
              </div>
            </div>
          )}

          {/* Tab: 視覺化 */}
          {activeTab === 'visualize' && (
            <div className="w-full flex flex-col items-center gap-12 py-12">
              {method === 'pointer' ? (
                <div className="flex flex-wrap justify-center gap-2 max-w-4xl px-4">
                  {inputText.split('').map((char, idx) => {
                    const isCurrent = idx === currentFrame.highlightIdx;
                    const isCounting = currentFrame.phase === 'counting' && idx >= currentFrame.index && idx <= currentFrame.index + (currentFrame.length - 1);
                    return (
                      <div key={idx} className={`w-10 h-14 sm:w-16 sm:h-20 flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300 relative ${isCurrent ? 'border-indigo-500 bg-indigo-50 scale-110 shadow-xl z-10' : 'border-slate-200 bg-white shadow-sm'} ${isCounting ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : ''}`}>
                        <span className={`text-xl sm:text-2xl font-bold font-mono ${char === ' ' ? 'opacity-20 text-slate-300' : ''}`}>{char === ' ' ? '␣' : char}</span>
                        {isCurrent && <div className="absolute -top-10 text-indigo-600 animate-bounce"><ChevronLeft className="rotate-90" size={24} /></div>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full max-w-4xl space-y-8 flex flex-col items-center">
                  <div className="bg-slate-100 p-6 rounded-2xl w-full text-center">
                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Input String</div>
                    <div className="text-xl font-mono tracking-widest">"{inputText}"</div>
                  </div>
                  <div className={`p-4 rounded-xl border-2 transition-all duration-500 ${currentFrame.phase !== 'raw' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentFrame.data instanceof Array ? currentFrame.data.map((word, idx) => (
                        <div key={idx} className={`px-4 py-2 rounded-lg border-2 font-mono font-bold transition-all ${idx === currentFrame.targetIdx ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}>
                          "{word}"
                          {idx === currentFrame.targetIdx && <div className="text-[10px] absolute -bottom-6 left-1/2 -translate-x-1/2 text-indigo-600">[-1]</div>}
                        </div>
                      )) : null}
                    </div>
                  </div>
                  {currentFrame.phase === 'done' && (
                    <div className="bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-xl animate-in zoom-in">
                      <div className="text-4xl font-black">{currentFrame.length}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab: 動手練習 */}
          {activeTab === 'exercise' && (
            <div className="max-w-4xl w-full flex flex-col items-center gap-8 bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">你是編譯器！</h3>
                <p className="text-slate-500">點擊「指針」下一個該移動的位置 (從後往前)。</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {inputText.split('').map((char, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const nextStep = frames[currentFrameIdx + 1];
                      if (nextStep && nextStep.index === idx) {
                        setCurrentFrameIdx(currentFrameIdx + 1);
                        showFeedback("正確！", "success");
                      } else {
                        showFeedback("不對喔，想一下指針移動的方向", "error");
                      }
                    }}
                    className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center font-mono text-xl transition-all
                      ${idx === currentFrame.index ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}
                    `}
                  >
                    {char === ' ' ? '␣' : char}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab: 算法教學 */}
          {activeTab === 'theory' && (
            <div className="max-w-3xl w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-4 text-indigo-600 font-black">
                    <MousePointer2 size={20}/> 指針法 ($O(1)$ 空間)
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">直接從末尾向前掃描，跳過空格後開始計數。不需要存儲額外清單，最省記憶體。</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-4 text-emerald-600 font-black">
                    <Scissors size={20}/> Split法 (簡潔易寫)
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">利用語言內建函數自動處理空格，程式碼極簡。但會產生清單，$O(N)$ 空間。</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: 程式填空 */}
          {activeTab === 'fill' && (
            <div className="max-w-2xl w-full bg-[#0d1117] p-8 rounded-3xl shadow-2xl text-slate-300 font-mono">
              <pre className="text-sm sm:text-base leading-loose">
                <code>
                  <span className="text-indigo-400">def</span> <span className="text-amber-300">lengthOfLastWord</span>(s):<br/>
                  {"    "}i = len(s) - 1<br/>
                  {"    "}<span className="text-indigo-400">while</span> i &gt;= 0 <span className="text-indigo-400">and</span> s[i] == <input 
                    type="text" 
                    value={fillValue[0]}
                    onChange={(e) => {
                      const v = e.target.value;
                      const newV = [...fillValue]; newV[0] = v; setFillValue(newV);
                      if (v === "' '" || v === '" "') showFeedback("正確！", "success");
                    }}
                    className={`w-12 bg-slate-800 border-b-2 outline-none text-center ${fillValue[0] === "' '" || fillValue[0] === '" "' ? 'border-emerald-500' : 'border-rose-500'}`}
                    placeholder="' '"
                  />:<br/>
                  {"        "}i -= 1<br/>
                  {"    "}length = 0<br/>
                  {"    "}<span className="text-indigo-400">while</span> i &gt;= 0 <span className="text-indigo-400">and</span> <input 
                    type="text" 
                    value={fillValue[1]}
                    onChange={(e) => {
                      const v = e.target.value;
                      const newV = [...fillValue]; newV[1] = v; setFillValue(newV);
                      if (v.replace(/\s/g,'') === "s[i]!=' '") showFeedback("完美！", "success");
                    }}
                    className={`w-32 bg-slate-800 border-b-2 outline-none text-center ${fillValue[1].replace(/\s/g,'') === "s[i]!=' '" ? 'border-emerald-500' : 'border-rose-500'}`}
                    placeholder="s[i] != ' '"
                  />:<br/>
                  {"        "}length += 1<br/>
                  {"        "}i -= 1<br/>
                  {"    "}<span className="text-indigo-400">return</span> length
                </code>
              </pre>
            </div>
          )}

          {/* Tab: 常見錯誤 */}
          {activeTab === 'error' && (
            <div className="max-w-2xl w-full space-y-6">
              <div className="bg-rose-50 border border-rose-100 p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-rose-800 mb-2 flex items-center gap-2">
                  <Bug size={24}/> 忽視尾部空格
                </h3>
                <p className="text-rose-700 text-sm">輸入 "a " 若不處理空格，會回傳 0。務必先移動指針跳過空格。</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <Bug size={24}/> 索引越界
                </h3>
                <p className="text-amber-700 text-sm">檢查 <code>s[i]</code> 前，必須確保 <code>i &gt;= 0</code>，否則在空字串或單一字母情況下會崩潰。</p>
              </div>
            </div>
          )}

          {/* Tab: 程式碼 */}
          {activeTab === 'code' && (
            <div className="max-w-3xl w-full flex flex-col gap-6">
              <div className="bg-[#1e1e1e] p-8 rounded-3xl shadow-2xl relative border border-slate-800">
                <div className="text-slate-500 text-xs font-bold mb-4">指針法 (Backward Pointer)</div>
                <pre className="text-sm leading-relaxed text-slate-300 font-mono">
                  <code>
                    <span className="text-[#c586c0]">while</span> p &gt;= <span className="text-[#b5cea8]">0</span> <span className="text-[#569cd6]">and</span> s[p] == <span className="text-[#ce9178]">' '</span>: p -= <span className="text-[#b5cea8]">1</span><br/>
                    <span className="text-[#c586c0]">while</span> p &gt;= <span className="text-[#b5cea8]">0</span> <span className="text-[#569cd6]">and</span> s[p] != <span className="text-[#ce9178]">' '</span>:<br/>
                    {"    "}length += <span className="text-[#b5cea8]">1</span>; p -= <span className="text-[#b5cea8]">1</span>
                  </code>
                </pre>
              </div>
              <div className="bg-[#1e1e1e] p-8 rounded-3xl shadow-2xl relative border border-slate-800">
                <div className="text-emerald-500 text-xs font-bold mb-4">Split法 (One-liner)</div>
                <pre className="text-lg leading-relaxed text-slate-300 font-mono">
                  <code>
                    <span className="text-[#569cd6]">def</span> <span className="text-[#dcdcaa]">lengthOfLastWord</span>(s):<br/>
                    {"    "}words = s.<span className="text-[#dcdcaa]">split</span>()<br/>
                    {"    "}<span className="text-[#c586c0]">return</span> <span className="text-[#b5cea8]">len</span>(words[<span className="text-[#b5cea8]">-1</span>]) <span className="text-[#c586c0]">if</span> words <span className="text-[#c586c0]">else</span> <span className="text-[#b5cea8]">0</span>
                  </code>
                </pre>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
