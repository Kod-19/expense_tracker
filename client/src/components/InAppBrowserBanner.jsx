import React, { useState } from 'react'
import { Check, Copy, ExternalLink, Info } from 'lucide-react'
import { getInAppBrowserName, isAndroid, isIOS, tryOpenInExternalBrowser } from '../utils/inAppBrowser'

const InAppBrowserBanner = ({ className = '' }) => {
  const [copied, setCopied] = useState(false)
  const browserName = getInAppBrowserName()

  if (!browserName) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleOpenExternal = () => {
    tryOpenInExternalBrowser(window.location.href)
  }

  return (
    <div
      role="note"
      className={[
        'mb-5 rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-900',
        className,
      ].join(' ')}
    >
      <div className="flex items-start gap-2.5">
        <Info size={16} className="mt-0.5 shrink-0 text-amber-700" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">Viewing inside {browserName}</p>
          <p className="mt-0.5 leading-relaxed text-amber-800">
            Google blocks sign-in inside in-app browsers. For the smoothest experience, open this page in {isIOS() ? 'Safari' : 'Chrome'}, or sign in with your email below.
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-amber-300 bg-white px-2.5 text-[11px] font-bold text-amber-900 shadow-2xs transition hover:bg-amber-100"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-700" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {isAndroid() && (
              <button
                type="button"
                onClick={handleOpenExternal}
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-amber-700 px-2.5 text-[11px] font-bold text-white shadow-2xs transition hover:bg-amber-800"
              >
                <ExternalLink size={12} />
                <span>Open in Chrome</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InAppBrowserBanner

