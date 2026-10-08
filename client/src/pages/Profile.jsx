import { useEffect, useState } from 'react'
import { LoaderCircle, Mail, Pencil, UserRound, X } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import { useToast } from '../components/ToastProvider'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/preferences'

const Profile = () => {
  const { fetchProfile, profile, updateProfile, user } = useAuth()
  const notify = useToast()
  const [fullName, setFullName] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(!profile)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (profile) {
      setIsLoading(false)
      return
    }

    let isMounted = true
    fetchProfile()
      .catch((error) => {
        if (isMounted) {
          setLoadError(error.message || 'Could not load your profile.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [fetchProfile, profile])

  const name = profile?.full_name || user?.user_metadata?.full_name || ''
  const email = user?.email || 'No email available'
  const initials = name
    ? name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    : email[0]?.toUpperCase() || 'U'

  const openEditor = () => {
    setFullName(name)
    setFormError('')
    setIsEditing(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const normalizedName = fullName.trim()
    if (!normalizedName || normalizedName.length > 100) {
      setFormError('Enter a name of up to 100 characters.')
      return
    }

    setIsSaving(true)
    setFormError('')
    try {
      await updateProfile(normalizedName)
      setIsEditing(false)
      notify('Profile updated.')
    } catch (error) {
      setFormError(error.message || 'Could not update your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const retryLoad = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      await fetchProfile()
    } catch (error) {
      setLoadError(error.message || 'Could not load your profile.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-semibold text-muted" role="status">
        <LoaderCircle size={20} className="animate-spin" />
        Loading profile…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-error/30 bg-error/5 p-5" role="alert">
        <p className="font-semibold text-error">{loadError}</p>
        <Button variant="secondary" className="mt-4" onClick={retryLoad}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Profile</h1>
          <p className="mt-2 text-base font-medium text-muted">View and update your account details.</p>
        </div>
        {!isEditing && (
          <Button onClick={openEditor} className="gap-2">
            <Pencil size={16} />
            Edit profile
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-text">Personal details</h2>
              <button
                type="button"
                aria-label="Cancel profile editing"
                onClick={() => setIsEditing(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <Input
              id="profile-full-name"
              label="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              maxLength={100}
              autoComplete="name"
              required
              error={formError}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-2xl font-bold text-text">{name || 'Your profile'}</h2>
            <p className="mt-1 text-sm font-medium text-muted">
              {profile?.created_at ? `Member since ${formatDate(profile.created_at)}` : 'Account details'}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-muted">
              <UserRound size={17} />
              <span className="text-sm font-semibold">Full name</span>
            </div>
            <p className="mt-2 break-words font-bold text-text">{name || 'Not set'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-muted">
              <Mail size={17} />
              <span className="text-sm font-semibold">Email address</span>
            </div>
            <p className="mt-2 break-all font-bold text-text">{email}</p>
            <p className="mt-1 text-xs text-muted">To change your email, update it with the service you use to sign in.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Profile
