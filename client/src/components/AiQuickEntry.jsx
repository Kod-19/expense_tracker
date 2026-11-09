import React, { useEffect, useRef, useState } from 'react'
import { Camera, LoaderCircle, Mic, MicOff, Sparkles } from 'lucide-react'
import Button from './Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from './ToastProvider'

const AiQuickEntry = ({ onTransactionParsed, className = '' }) => {
  const { authorizedFetch } = useAuth()
  const notify = useToast()
  const [text, setText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [scannedFileName, setScannedFileName] = useState('')
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript
        if (transcript) {
          setText(transcript)
          notify(`Transcribed: "${transcript}"`)
        }
        setIsListening(false)
      }

      recognition.onerror = (event) => {
        setIsListening(false)
        if (event.error !== 'no-speech') {
          notify(`Voice input error: ${event.error}`, 'error')
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }
    }
  }, [notify])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      notify('Voice input is not supported in this browser. Try Chrome, Edge, or Safari.', 'error')
      return
    }

    if (isListening) {
      try {
        recognitionRef.current.stop()
      } catch {}
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        notify('Listening... speak your expense or income.')
      } catch (err) {
        setIsListening(false)
        notify('Could not start microphone.', 'error')
      }
    }
  }

  const handleQuickLog = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) {
      notify('Please enter or speak a description of your expense or income.', 'error')
      return
    }

    setIsProcessing(true)
    try {
      const response = await authorizedFetch('/api/ai/quick-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message || 'Could not parse transaction with AI.')
      }

      if (!data?.transaction) {
        throw new Error('No transaction details returned.')
      }

      notify('Transaction parsed! Review and confirm.')
      setText('')
      if (onTransactionParsed) {
        onTransactionParsed(data.transaction)
      }
    } catch (error) {
      notify(error.message || 'AI parsing failed. Please enter details manually.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setScannedFileName(file.name)
    event.target.value = ''

    setIsProcessing(true)
    notify('Scanning receipt with Gemini Vision...')

    try {
      const formData = new FormData()
      formData.append('receipt', file)

      const response = await authorizedFetch('/api/ai/scan-receipt', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to scan receipt image.')
      }

      if (!data?.transaction) {
        throw new Error('No transaction details extracted from receipt.')
      }

      notify('Receipt scanned successfully! Review and confirm.')
      setScannedFileName('')
      if (onTransactionParsed) {
        onTransactionParsed(data.transaction)
      }
    } catch (error) {
      setScannedFileName('')
      notify(error.message || 'Could not scan receipt. Please enter details manually.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={[
        'rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/60 p-4 shadow-sm transition hover:shadow-md sm:p-5',
        className,
      ].join(' ')}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Smart AI Assistant</h3>
            <p className="text-xs text-slate-500">
              Type naturally, speak, or scan a receipt — AI extracts amounts, dates, and categories.
            </p>
          </div>
        </div>

        {scannedFileName && isProcessing && (
          <span className="hidden items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 sm:inline-flex">
            <LoaderCircle size={12} className="animate-spin" />
            Scanning {scannedFileName}...
          </span>
        )}
      </div>

      <form onSubmit={handleQuickLog} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
            placeholder={
              isListening
                ? 'Listening... say something like "Spent 45 cedis on lunch yesterday"'
                : 'e.g., "Spent 45 cedis on lunch at KFC yesterday" or "Received 500 bonus"'
            }
            className={`h-11 w-full rounded-xl border bg-white px-3.5 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 disabled:opacity-60 ${
              isListening
                ? 'border-rose-400 ring-2 ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
            }`}
          />
          {text && (
            <button
              type="button"
              onClick={() => setText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop listening' : 'Speak to input with voice'}
            className={`flex h-11 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold shadow-sm transition sm:text-sm ${
              isListening
                ? 'border-rose-400 bg-rose-50 text-rose-600 animate-pulse ring-2 ring-rose-200'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isListening ? (
              <>
                <MicOff size={16} className="text-rose-600" />
                <span className="text-rose-600">Listening...</span>
              </>
            ) : (
              <>
                <Mic size={16} className="text-slate-500" />
                <span className="hidden xs:inline">Speak</span>
              </>
            )}
          </button>

          <Button
            type="submit"
            disabled={isProcessing || !text.trim()}
            className="h-11 shrink-0 gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700 sm:text-sm"
          >
            {isProcessing ? (
              <>
                <LoaderCircle className="animate-spin" size={16} />
                Parsing...
              </>
            ) : (
              <>Quick Log</>
            )}
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
            className="hidden"
          />

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            title="Scan paper receipt or digital invoice"
            className="flex h-11 items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:opacity-60 sm:text-sm"
          >
            <Camera size={16} />
            <span className="hidden xs:inline">Scan Receipt</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default AiQuickEntry
