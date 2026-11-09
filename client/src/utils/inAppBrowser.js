const IN_APP_BROWSER_PATTERNS = [
  ['Instagram', /Instagram/i],
  ['Snapchat', /Snapchat/i],
  ['LinkedIn', /LinkedInApp/i],
  ['Facebook', /FBAN|FBAV|FB_IAB/i],
  ['TikTok', /TikTok|BytedanceWebview|musical_ly/i],
  ['X (Twitter)', /Twitter|TwitterAndroid/i],
  ['WeChat', /MicroMessenger/i],
  ['LINE', /Line\//i],
  ['Telegram', /Telegram/i],
  ['WhatsApp', /WhatsApp/i],
  ['In-App Browser', /; wv\)|WebView/i],
]

export const getInAppBrowserName = (userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '') =>
  IN_APP_BROWSER_PATTERNS.find(([, pattern]) => pattern.test(userAgent))?.[0] || null

export const isInAppBrowser = (userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '') =>
  Boolean(getInAppBrowserName(userAgent))

export const isAndroid = (userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '') =>
  /Android/i.test(userAgent)

export const isIOS = (userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '') =>
  /iPhone|iPad|iPod/i.test(userAgent)

/**
 * Attempts to break out of in-app webviews to the system default browser.
 * On Android, using an Intent URI directly launches the external browser (Chrome / Samsung Internet).
 * Returns true if breakout was attempted, false otherwise.
 */
export const tryOpenInExternalBrowser = (targetUrl) => {
  if (typeof window === 'undefined') return false

  const url = targetUrl || window.location.href

  if (isAndroid()) {
    try {
      const cleanUrl = url.replace(/^https?:\/\//i, '')
      // Android Intent scheme forces opening in external browser
      window.location.href = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end;`
      return true
    } catch {
      return false
    }
  }

  return false
}

