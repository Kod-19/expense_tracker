import { Mail, MapPin, UserCircle2 } from 'lucide-react'
import Card from '../components/Card'

const Profile = () => {
  const profile = {
    name: 'Kwame Dawson',
    email: 'kwame.dawson@example.com',
    location: 'Accra, Ghana',
    memberSince: 'January 2025',
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-bold text-text">Profile</p>
        <p className="mt-2 text-base font-medium text-muted">Manage your personal finance details.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            KD
          </div>

          <div>
            <p className="text-2xl font-bold text-text">{profile.name}</p>
            <p className="mt-1 text-sm font-medium text-muted">Member since {profile.memberSince}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3 text-muted">
              <UserCircle2 size={18} />
              <span className="text-sm font-semibold">Account type</span>
            </div>
            <p className="mt-3 text-lg font-bold text-text">Premium</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3 text-muted">
              <Mail size={18} />
              <span className="text-sm font-semibold">Email</span>
            </div>
            <p className="mt-3 break-all text-base font-bold text-text sm:text-lg">{profile.email}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3 text-muted">
              <MapPin size={18} />
              <span className="text-sm font-semibold">Location</span>
            </div>
            <p className="mt-3 text-lg font-bold text-text">{profile.location}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Profile