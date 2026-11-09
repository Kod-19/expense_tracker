import React, { useState } from 'react'
import { Check, Copy, ExternalLink, HelpCircle, X } from 'lucide-react'
import { isAndroid, isIOS, tryOpenInExternalBrowser } from '../utils/inAppBrowser'

const InAppBrowserModal = ({ isOpen, onClose, browserName = 'In-App Browser', onUseEmail }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for older webviews
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

  const handleAndroidOpen = () => {
    tryOpenInExternalBrowser(window.location.href)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="iab-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1 text-muted transition hover:bg-slate-100 hover:text-text"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
            <HelpCircle size={22} />
          </div>
          <div>
            <h2 id="iab-modal-title" className="text-base font-bold text-text">
              Google Sign-In in {browserName}
            </h2>
            <p className="text-xs text-muted">A quick tip for in-app browsers</p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted sm:text-sm">
          Google strictly blocks sign-in inside social apps like <strong>{browserName}</strong> for security reasons. To sign in easily, choose one of these options:
        </p>

        <div className="mt-4 space-y-3">
          {/* Option 1: Open in External Browser */}
          <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-teal">
              Option 1 · Open in your regular browser
            </p>
            <p className="mt-1 text-xs text-muted">
              Tap the <strong>•••</strong> or <strong>Share</strong> icon in the corner of your screen, then select <strong>"Open in {isIOS() ? 'Safari' : 'Chrome'}"</strong>.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-bold text-text shadow-2xs transition hover:bg-slate-50"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Page Link</span>
                  </>
                )}
              </button>

              {isAndroid() && (
                <button
                  type="button"
                  onClick={handleAndroidOpen}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-white shadow-2xs transition hover:bg-primary/90"
                >
                  <ExternalLink size={14} />
                  <span>Open in Chrome</span>
                </button>
              )}
            </div>
          </div>

          {/* Option 2: Use Email & Password */}
          <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-teal">
              Option 2 · No browser switch needed
            </p>
            <p className="mt-1 text-xs text-muted">
              You can sign in or register with your email and password right here inside {browserName} without any restrictions.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose()
                if (onUseEmail) onUseEmail()
              }}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-3 text-xs font-bold text-primary transition hover:bg-primary/15"
            >
              Continue with Email & Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InAppBrowserModal

