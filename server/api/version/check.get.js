import { verifyToken } from '../../utils/jwt'

// GitHub package.json 的 URL
const PROXY_URL = 'https://git.221022.xyz/https://raw.githubusercontent.com/chaos-zhu/easyimg/main/package.json'
const DIRECT_URL = 'https://raw.githubusercontent.com/chaos-zhu/easyimg/main/package.json'

export default defineEventHandler(async (event) => {
  try {
    // 验证登录状态
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        message: '需要登录后才能检测版本更新'
      }
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return {
        success: false,
        message: '登录已过期，请重新登录'
      }
    }

    // 从 runtimeConfig 获取当前版本（构建时注入）
    const config = useRuntimeConfig()
    const currentVersion = config.appVersion || '1.0.0'

    // 从 GitHub 获取最新版本
    let latestVersion = null
    let hasUpdate = false
    let error = null

    // 尝试通过代理获取
    let remotePackage = await fetchPackageJson(PROXY_URL)

    // 如果代理失败，使用源地址兜底
    if (!remotePackage) {
      remotePackage = await fetchPackageJson(DIRECT_URL)
    }

    if (remotePackage && remotePackage.version) {
      latestVersion = remotePackage.version
      // 比较版本号
      hasUpdate = compareVersions(latestVersion, currentVersion) > 0
    } else {
      error = '无法获取最新版本信息'
    }

    return {
      success: true,
      data: {
        currentVersion,
        latestVersion,
        hasUpdate,
        error
      }
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
})

/**
 * 从指定 URL 获取 package.json
 * @param {string} url - 请求地址
 * @returns {object|null} - package.json 对象或 null
 */
async function fetchPackageJson(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EasyImg-Version-Check'
      },
      // 设置超时时间为 10 秒
      signal: AbortSignal.timeout(10000)
    })

    if (response.ok) {
      return await response.json()
    }
  } catch (err) {
    // 请求失败，返回 null
    console.log(`版本检测请求失败 (${url}):`, err.message)
  }
  return null
}

/**
 * 比较两个语义化版本号
 * @param {string} v1 - 版本号1
 * @param {string} v2 - 版本号2
 * @returns {number} - 1: v1 > v2, -1: v1 < v2, 0: v1 = v2
 */
function compareVersions(v1, v2) {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number)
  const parts2 = v2.replace(/^v/, '').split('.').map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0
    const num2 = parts2[i] || 0

    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }

  return 0
}