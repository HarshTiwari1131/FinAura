import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function Profile() {
  const [profile, setProfile] = useState(null)

  const load = async () => {
    const { data } = await api.get('/api/auth/profile')
    setProfile(data)
  }

  useEffect(() => { load() }, [])

  if (!profile) return <div>Loading...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <div className="p-4 rounded-xl border border-gray-800">
        <div>Name: {profile.name}</div>
        <div>Email: {profile.email}</div>
        <div>Risk: {profile.riskProfile}</div>
        <div>KYC: {profile.kycStatus}</div>
      </div>
    </div>
  )
}
