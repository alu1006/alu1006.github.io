import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Hash, BookOpen, ArrowRight, Home } from 'lucide-react';
import Problem12 from './problems/Problem12';
import Problem58 from './problems/Problem58';
import Problem3047 from './problems/Problem3047';
import Problem2943 from './problems/Problem2943';
import Problem88 from './problems/Problem88';
import Problem169 from './problems/Problem169';
import Problem121 from './problems/Problem121';
import Problem13 from './problems/Problem13';
import Problem55 from './problems/Problem55';
import useSEO from './hooks/useSEO';
import './index.css';

// 將標題轉換為 URL slug
function toSlug(title) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// 題目列表資料（含 SEO description）
export const problems = [
  {
    id: 58,
    title: 'Length of Last Word',
    titleZh: '最後一個單字的長度',
    difficulty: 'Easy',
    tags: ['String', 'Split'],
    slug: 'length-of-last-word',
    description: '透過互動式動畫學習 LeetCode 58 最後一個單字的長度，深入理解指針法與Split切割字串的演算法，輕鬆掌握這個簡單難度的字串操作問題。'
  },
  {
    id: 3047,
    title: 'Find Largest Square',
    titleZh: '找出兩個矩形交集區域內的最大正方形',
    difficulty: 'Easy',
    tags: ['Geometry', 'Array', 'Math'],
    slug: 'find-largest-square',
    description: '透過互動式動畫學習 LeetCode 3047，理解如何在兩個矩形的交集區域中找出最大正方形'
  },
  {
    id: 2943,
    title: 'Maximize Area of Square Hole in Grid',
    titleZh: '網格中最大正方形孔洞的面積',
    difficulty: 'Medium',
    tags: ['Array', 'Greedy', 'Sorting'],
    slug: 'maximize-area-of-square-hole-in-grid',
    description: '透過視覺化動畫學習 LeetCode 2943，使用貪婪演算法找出網格中最大的正方形孔洞'
  },
  {
    id: 88,
    title: 'Merge Sorted Array',
    titleZh: '合併兩個有序陣列',
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers'],
    slug: 'merge-sorted-array',
    description: '透過互動式動畫學習 LeetCode 88 合併有序陣列，掌握雙指標從後往前的技巧'
  },
  {
    id: 169,
    title: 'Majority Element',
    titleZh: '多數元素',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table', 'Sorting', 'Greedy', 'Counting'],
    slug: 'majority-element',
    description: '透過視覺化學習 LeetCode 169 多數元素，理解 Boyer-Moore 投票演算法'
  },
  {
    id: 121,
    title: 'Best Time to Buy and Sell Stock',
    titleZh: '買賣股票的最佳時機',
    difficulty: 'Easy',
    tags: ['Array', 'Greedy'],
    slug: 'best-time-to-buy-and-sell-stock',
    description: '透過互動式圖表學習 LeetCode 121 股票買賣最佳時機，掌握一次遍歷找最大利潤'
  },
  {
    id: 13,
    title: 'Roman to Integer',
    titleZh: '羅馬轉整數',
    difficulty: 'Easy',
    tags: ['Math', 'String', 'Hash Table'],
    slug: 'roman-to-integer',
    description: '透過動畫學習 LeetCode 13 羅馬數字轉整數，理解減法規則的處理方式'
  },
  {
    id: 55,
    title: 'Jump Game',
    titleZh: '跳躍遊戲',
    difficulty: 'Medium',
    tags: ['Greedy', 'Array'],
    slug: 'jump-game',
    description: '透過視覺化學習 LeetCode 55 跳躍遊戲，使用貪婪演算法判斷能否到達終點'
  },
  {
    id: 12,
    title: 'Integer to Roman',
    titleZh: '整數轉羅馬數字',
    difficulty: 'Medium',
    tags: ['Greedy', 'Math'],
    slug: 'integer-to-roman',
    description: '透過互動式動畫學習 LeetCode 12 整數轉羅馬數字，掌握貪婪演算法的核心概念'
  },
];

// 難度顏色 - 淺色主題
const difficultyColors = {
  Easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Hard: 'bg-rose-100 text-rose-700 border-rose-200',
};

// 首頁元件 - Fluid 淺色主題
function HomePage() {
  useSEO({
    title: null, // 使用預設標題
    description: '透過互動式動畫、步驟解說、動手練習，深入理解 LeetCode 經典題目。由阿盧老師精心製作的視覺化演算法教材。',
    path: '/'
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#eee', color: '#3c4858' }}>
      {/* Header - 匹配 Fluid navbar */}
      <header className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#2f4154' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">LeetCode 互動教材</h1>
              <p className="text-xs text-gray-300">by 阿盧老師</p>
            </div>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm text-white hover:bg-white/20"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Home size={16} />
            返回部落格
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 text-center" style={{ background: 'linear-gradient(to bottom, #2f4154, #4a6274)' }}>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          用視覺化學演算法
        </h2>
        <p className="text-lg max-w-2xl mx-auto text-gray-200">
          透過互動式動畫、步驟解說、動手練習，深入理解每一道 LeetCode 經典題目。
        </p>
      </section>

      {/* Problem List */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen style={{ color: '#2f4154' }} />
          <h3 className="text-2xl font-bold" style={{ color: '#1a202c' }}>題目列表</h3>
          <span className="ml-2 px-2 py-0.5 rounded text-sm" style={{ backgroundColor: '#fff', color: '#718096', border: '1px solid #eaecef' }}>
            {problems.length} 題
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              to={`/${problem.id}-${problem.slug}`}
              className="group rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: '#fff',
                border: '1px solid #eaecef',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-bold" style={{ color: '#2f4154' }}>#{problem.id}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${difficultyColors[problem.difficulty]}`}>
                  {problem.difficulty}
                </span>
              </div>

              <h4 className="text-lg font-semibold mb-1 group-hover:text-[#0366d6] transition-colors" style={{ color: '#1a202c' }}>
                {problem.title}
              </h4>
              <p className="text-sm mb-4" style={{ color: '#718096' }}>{problem.titleZh}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {problem.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#f8f9fa', color: '#718096', border: '1px solid #eaecef' }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center text-sm font-medium transition-colors" style={{ color: '#0366d6' }}>
                開始學習 <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Placeholder */}
        <div className="mt-12 text-center">
          <p style={{ color: '#718096' }}>更多題目陸續新增中...</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm" style={{ borderTop: '1px solid #eaecef', color: '#718096' }}>
        <p>© 2025 阿盧老師Coding嚕 | LeetCode 互動教材</p>
      </footer>
    </div>
  );
}

// 主應用程式
function App() {
  return (
    <BrowserRouter basename="/leetcode">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/12-integer-to-roman" element={<Problem12 />} />
        <Route path="/58-length-of-last-word" element={<Problem58 />} />
        <Route path="/3047-find-largest-square" element={<Problem3047 />} />
        <Route path="/2943-maximize-area-of-square-hole-in-grid" element={<Problem2943 />} />
        <Route path="/88-merge-sorted-array" element={<Problem88 />} />
        <Route path="/169-majority-element" element={<Problem169 />} />
        <Route path="/121-best-time-to-buy-and-sell-stock" element={<Problem121 />} />
        <Route path="/13-roman-to-integer" element={<Problem13 />} />
        <Route path="/55-jump-game" element={<Problem55 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
