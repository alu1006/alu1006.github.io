import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// 統一使用 /leetcode/ 路徑
const basePath = '/leetcode/'
const outputDir = '../source/leetcode'

// 動態從 App.jsx 讀取題目列表
function getProblemsFromAppJsx() {
  try {
    const appJsxPath = resolve(__dirname, 'src/App.jsx')
    const content = readFileSync(appJsxPath, 'utf-8')

    // 提取 problems 陣列中的 id 和 slug
    const routes = ['']  // 首頁
    const problemRegex = /id:\s*(\d+),[\s\S]*?slug:\s*['"]([^'"]+)['"]/g
    let match
    while ((match = problemRegex.exec(content)) !== null) {
      const [, id, slug] = match
      routes.push(`/${id}-${slug}`)
    }
    return routes
  } catch (e) {
    console.warn('無法讀取 App.jsx，使用預設路由')
    return ['']
  }
}

// 生成 sitemap.xml 內容
const siteUrl = 'https://codinglu.tw/leetcode'

function generateSitemap() {
  const problemRoutes = getProblemsFromAppJsx()
  const today = new Date().toISOString().split('T')[0]
  const urls = problemRoutes.map(route => `
  <url>
    <loc>${siteUrl}${route || ''}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'generate-sitemap',
      closeBundle() {
        const outDir = resolve(__dirname, outputDir)
        // 確保目錄存在
        if (!existsSync(outDir)) {
          mkdirSync(outDir, { recursive: true })
        }
        // 生成 sitemap.xml
        writeFileSync(resolve(outDir, 'sitemap.xml'), generateSitemap())
        const routes = getProblemsFromAppJsx()
        console.log(`✅ sitemap.xml generated with ${routes.length} URLs`)
        console.log(`📦 Deploy target: Vercel (codinglu.tw)`)
      }
    }
  ],
  base: basePath,
  build: {
    outDir: outputDir,
    emptyOutDir: true,
  },
})
