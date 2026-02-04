// 生成随机请求头，用于绕过防盗链检测
export function getRandomHeaders(imageUrl) {
  // 随机浏览器版本
  const chromeVersions = ['120.0.0.0', '121.0.0.0', '122.0.0.0', '123.0.0.0', '119.0.0.0']
  const edgeVersions = ['120.0.0.0', '121.0.0.0', '122.0.0.0', '119.0.0.0']
  const firefoxVersions = ['121.0', '122.0', '123.0', '120.0', '119.0']

  // 随机操作系统
  const platforms = [
    { os: 'Windows NT 10.0; Win64; x64', platform: 'Windows' },
    { os: 'Windows NT 11.0; Win64; x64', platform: 'Windows' },
    { os: 'Macintosh; Intel Mac OS X 10_15_7', platform: 'macOS' },
    { os: 'Macintosh; Intel Mac OS X 13_0_0', platform: 'macOS' },
    { os: 'X11; Linux x86_64', platform: 'Linux' }
  ]

  // 随机语言
  const languages = [
    'zh-CN,zh;q=0.9,en;q=0.8',
    'en-US,en;q=0.9',
    'zh-TW,zh;q=0.9,en;q=0.8',
    'ja-JP,ja;q=0.9,en;q=0.8',
    'en-GB,en;q=0.9'
  ]

  // 随机选择
  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const platform = randomChoice(platforms)
  const language = randomChoice(languages)

  // 随机选择浏览器类型
  const browserType = Math.random()
  let userAgent, secChUa

  if (browserType < 0.6) {
    // Chrome
    const version = randomChoice(chromeVersions)
    const majorVersion = version.split('.')[0]
    userAgent = `Mozilla/5.0 (${platform.os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`
    secChUa = `"Not_A Brand";v="8", "Chromium";v="${majorVersion}", "Google Chrome";v="${majorVersion}"`
  } else if (browserType < 0.85) {
    // Edge
    const version = randomChoice(edgeVersions)
    const majorVersion = version.split('.')[0]
    userAgent = `Mozilla/5.0 (${platform.os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36 Edg/${version}`
    secChUa = `"Not_A Brand";v="8", "Chromium";v="${majorVersion}", "Microsoft Edge";v="${majorVersion}"`
  } else {
    // Firefox
    const version = randomChoice(firefoxVersions)
    userAgent = `Mozilla/5.0 (${platform.os}; rv:${version}) Gecko/20100101 Firefox/${version}`
    secChUa = null // Firefox 不使用 Sec-Ch-Ua
  }

  const headers = {
    'User-Agent': userAgent,
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': language,
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'image',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Site': 'cross-site',
    // 使用图片URL的origin作为Referer，绕过防盗链
    'Referer': imageUrl.origin + '/',
    'Origin': imageUrl.origin
  }

  // 只有非 Firefox 浏览器才添加 Sec-Ch-Ua 头
  if (secChUa) {
    headers['Sec-Ch-Ua'] = secChUa
    headers['Sec-Ch-Ua-Mobile'] = '?0'
    headers['Sec-Ch-Ua-Platform'] = `"${platform.platform}"`
  }

  return headers
}
