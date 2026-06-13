import { getSeoSettings } from '@/api/settings'

/**
 * 更新页面SEO信息（使用全局SEO设置）
 */
export async function updatePageSeo(defaultTitle?: string) {
  try {
    // 获取全局SEO配置
    const res = await getSeoSettings()
    
    if (res.ok === 1 && res.data?.seo) {
      const { site_title, site_description, site_keywords } = res.data.seo
      
      // 更新页面标题
      // 如果有全局标题，使用：页面默认标题 - 全局标题
      // 如果没有全局标题，只使用页面默认标题
      if (site_title) {
        if (defaultTitle) {
          // 如果defaultTitle已经包含了site_title，不再重复添加
          document.title = defaultTitle.includes(site_title) 
            ? defaultTitle 
            : `${defaultTitle} - ${site_title}`
        } else {
          document.title = site_title
        }
      } else if (defaultTitle) {
        document.title = defaultTitle
      }
      
      // 更新meta description
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      if (site_description) {
        metaDescription.setAttribute('content', site_description)
      }
      
      // 更新meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      if (site_keywords) {
        metaKeywords.setAttribute('content', site_keywords)
      }
      
      // 更新 Open Graph meta标签（可选，用于社交媒体分享）
      let ogTitle = document.querySelector('meta[property="og:title"]')
      if (!ogTitle) {
        ogTitle = document.createElement('meta')
        ogTitle.setAttribute('property', 'og:title')
        document.head.appendChild(ogTitle)
      }
      if (site_title) {
        ogTitle.setAttribute('content', site_title)
      }
      
      let ogDescription = document.querySelector('meta[property="og:description"]')
      if (!ogDescription) {
        ogDescription = document.createElement('meta')
        ogDescription.setAttribute('property', 'og:description')
        document.head.appendChild(ogDescription)
      }
      if (site_description) {
        ogDescription.setAttribute('content', site_description)
      }
    } else if (defaultTitle) {
      // 如果API调用失败，至少设置默认标题
      document.title = defaultTitle
    }
  } catch (error) {
    console.error('更新页面SEO失败:', error)
    // 如果API调用失败，至少设置默认标题
    if (defaultTitle) {
      document.title = defaultTitle
    }
  }
}
