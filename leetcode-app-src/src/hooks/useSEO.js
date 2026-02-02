import { useEffect } from 'react';

/**
 * 動態設置頁面 SEO 元數據
 * @param {Object} options - SEO 選項
 * @param {string} options.title - 頁面標題
 * @param {string} options.description - 頁面描述
 * @param {string} options.path - 頁面路徑 (不含 /leetcode)
 */
export function useSEO({ title, description, path = '' }) {
    useEffect(() => {
        const baseTitle = 'LeetCode 互動教材 | 阿盧老師Coding嚕';
        const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
        const url = `https://codinglu.tw/leetcode${path}`;

        // 設置 title
        document.title = fullTitle;

        // 設置或更新 meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = description || '透過互動式動畫、步驟解說學習 LeetCode 經典題目';

        // 設置 canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = url;

        // 設置 Open Graph 標籤
        const ogTags = [
            { property: 'og:title', content: fullTitle },
            { property: 'og:description', content: description },
            { property: 'og:url', content: url },
            { property: 'og:type', content: 'article' },
            { property: 'og:site_name', content: '阿盧老師Coding嚕' },
        ];

        ogTags.forEach(({ property, content }) => {
            if (!content) return;
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.content = content;
        });

        // 清理函數：恢復預設標題
        return () => {
            document.title = baseTitle;
        };
    }, [title, description, path]);
}

export default useSEO;
