import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('personal')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showBankModal, setShowBankModal] = useState(false)
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', ifsc: '', consent: false })
  const [showKycModal, setShowKycModal] = useState(false)
  const [kycForm, setKycForm] = useState({ pan: '', dob: '', address: '' })
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [riskAnswers, setRiskAnswers] = useState({ horizon: '3+', emergencyFund: 'yes', drawdown: '10', experience: 'mid' })
  const nav = useNavigate()
  const { logout } = useAuth()

  const load = async () => {
    setError('')
    try {
      const { data } = await api.get('/api/auth/profile')
      setProfile(data)
    } catch (e) {
      const status = e?.response?.status
      if (status === 401) {
        // Token invalid/expired -> logout and redirect to login
        try { logout?.() } catch {}
        nav('/login')
        return
      }
      console.error('Failed to load profile', e)
      setError('Failed to load profile. Please try again.')
    }
  }

  useEffect(() => { load() }, [])

  const update = async (patch) => {
    setSaving(true)
    try {
      const { data } = await api.put('/api/auth/profile', patch)
      setProfile(data)
    } finally {
      setSaving(false)
    }
  }

  // IMPORTANT: Hooks must be called before any early returns.
  // Compute riskColor even if profile is not yet loaded; handle null safely.
  const riskColor = useMemo(() => {
    const rp = ((profile && profile.riskProfile) || 'Medium').toLowerCase()
    if (rp === 'low') return 'bg-emerald-500'
    if (rp === 'high') return 'bg-red-500'
    return 'bg-yellow-500'
  }, [profile?.riskProfile])

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border card-base p-6">
          <div className="text-red-400 font-medium">{error}</div>
          <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>You may need to log in again.</div>
        </div>
      </div>
    )
  }

  if (!profile) return (
    <div className="p-8 space-y-4">
      <div className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Profile</div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-4">
          <div className="rounded-xl border card-base p-6 animate-pulse h-28" />
          <div className="rounded-xl border card-base p-6 animate-pulse h-40" />
        </div>
        <div className="md:col-span-8 space-y-4">
          <div className="rounded-xl border card-base p-6 animate-pulse h-64" />
          <div className="rounded-xl border card-base p-6 animate-pulse h-64" />
        </div>
      </div>
    </div>
  )

  const Section = ({ children }) => (
    <AnimatePresence mode="wait">
      <motion.div key={tab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}>
        {children}
      </motion.div>
    </AnimatePresence>
  )

  return (
    <div className="p-6">
      <div className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>Profile</div>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left: Navigation & Avatar */}
      <div className="md:col-span-4 space-y-4">
        <div className="rounded-xl border card-base backdrop-blur-sm p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full grid place-items-center" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>{(profile.name||'U')[0]}</div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--text)' }}>{profile.name}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{profile.email}</div>
            </div>
            </div>
            <button
              className="btn-secondary"
              onClick={() => { try { logout?.() } catch {} nav('/login') }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="rounded-xl border card-base backdrop-blur-sm p-3">
          <nav className="flex md:flex-col gap-2">
            {[
              { id: 'personal', label: 'Personal Info' },
              { id: 'security', label: 'Security' },
              { id: 'financial', label: 'Financial Details' },
              { id: 'risk', label: 'Risk Profile' },
            ].map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} className={`text-left px-3 py-2 rounded-lg border`} style={{
                borderColor: tab===t.id ? 'var(--accent)' : 'var(--border)',
                color: tab===t.id ? 'var(--text)' : 'var(--text-muted)',
                background: tab===t.id ? 'color-mix(in oklab, var(--accent) 12%, transparent)' : 'transparent'
              }}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Right: Content */}
      <div className="md:col-span-8 space-y-4">
        {tab === 'personal' && (
          <Section>
            <div className="rounded-xl border card-base backdrop-blur-sm p-6">
              <div className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Personal Info</div>
              <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); update({ name: e.target.name.value })}}>
                <label className="block">
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Full Name</div>
                  <input name="name" defaultValue={profile.name} className="input w-full" />
                </label>
                <label className="block">
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Email</div>
                  <input disabled value={profile.email} className="input w-full" />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>New Password</div>
                    <input type="password" name="password" className="input w-full" />
                  </label>
                  <label className="block">
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Confirm Password</div>
                    <input type="password" name="confirm" className="input w-full" />
                  </label>
                </div>
                <button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>
          </Section>
        )}

        {tab === 'security' && (
          <Section>
            <div className="rounded-xl border card-base backdrop-blur-sm p-6">
              <div className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Security</div>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ color: 'var(--text)' }}>Two-Factor Authentication</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Add an extra layer of protection to your account.</div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-400/40 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full after:absolute after:top-0.5 after:left-[2px] after:transition-all relative peer-checked:bg-cyan-500" />
                </label>
              </div>

              <div className="mt-6">
                <div className="font-medium mb-2" style={{ color: 'var(--text)' }}>Active Sessions</div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <li className="flex items-center justify-between rounded-lg border p-3" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
                    <span>Chrome • Windows • Mumbai</span>
                    <button className="btn-secondary px-2 py-1 text-xs">Sign out</button>
                  </li>
                  <li className="flex items-center justify-between rounded-lg border p-3" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
                    <span>Safari • iOS • Last week</span>
                    <button className="btn-secondary px-2 py-1 text-xs">Sign out</button>
                  </li>
                </ul>
              </div>
            </div>
          </Section>
        )}

        {tab === 'financial' && (
          <Section>
            <div className="rounded-xl border card-base backdrop-blur-sm p-6">
              <div className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Financial Details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>KYC Status</div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      {String(profile.kycStatus).toLowerCase() === 'verified' ? (
                        <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs">Verified</span>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">Pending</span>
                      )}
                      <button className="btn-secondary px-2 py-1 text-xs" onClick={()=>setShowKycModal(true)}>
                        {String(profile.kycStatus).toLowerCase() === 'verified' ? 'View / Update' : 'Update KYC'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Bank Linking</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text)' }}>{profile.bankLinked ? 'Connected' : 'Not Connected'}</span>
                    <button
                      className="btn px-3 py-1 text-sm"
                      onClick={() => {
                        // Open modal for connect/update
                        setShowBankModal(true)
                      }}
                    >
                      {profile.bankLinked ? 'Update' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        )}

        {tab === 'risk' && (
          <Section>
            <div className="rounded-xl border card-base backdrop-blur-sm p-6">
              <div className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Risk Profile</div>
              <div className="flex items-center gap-3">
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Current:</div>
                <div className="font-medium" style={{ color: 'var(--text)' }}>{profile.riskProfile || 'Medium'}</div>
              </div>
              <div className="mt-4">
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                  <div className="h-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500" style={{ width: profile.riskProfile==='Low'? '33%': profile.riskProfile==='High' ? '100%':'66%' }} />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                {['Low','Medium','High'].map(r => (
                  <button key={r} onClick={()=>update({ riskProfile: r })} className={`px-3 py-1.5 rounded-lg border`} style={{
                    borderColor: profile.riskProfile===r ? 'var(--accent)' : 'var(--border)',
                    color: profile.riskProfile===r ? 'var(--text)' : 'var(--text-muted)',
                    boxShadow: profile.riskProfile===r ? '0 0 0 2px rgba(34,211,238,.15)' : 'none'
                  }}>
                    {r}
                  </button>
                ))}
                <button onClick={()=>setShowRiskModal(true)} className="btn-secondary">Retake Assessment</button>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
    {/* Bank Linking Modal */}
    <AnimatePresence>
      {showBankModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.98, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-xl border card-base p-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-slate-200 font-semibold">{profile?.bankLinked ? 'Update Bank Linking' : 'Connect Bank Account'}</div>
              <button className="btn-secondary" onClick={()=>setShowBankModal(false)}>Close</button>
            </div>
            <form
              className="mt-4 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                // Only toggling bankLinked on backend for now
                await update({ bankLinked: true })
                setShowBankModal(false)
              }}
            >
              <label className="block">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Bank Name</div>
                <input
                  className="input w-full"
                  placeholder="e.g., HDFC Bank"
                  value={bankForm.bankName}
                  onChange={(e)=>setBankForm(f=>({...f, bankName: e.target.value}))}
                  required
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Account Number</div>
                  <input
                    className="input w-full"
                    placeholder="XXXXXXXXXX"
                    value={bankForm.accountNumber}
                    onChange={(e)=>setBankForm(f=>({...f, accountNumber: e.target.value}))}
                    required
                  />
                </label>
                <label className="block">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>IFSC Code</div>
                  <input
                    className="input w-full"
                    placeholder="ABCD0123456"
                    value={bankForm.ifsc}
                    onChange={(e)=>setBankForm(f=>({...f, ifsc: e.target.value}))}
                    required
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={bankForm.consent}
                  onChange={(e)=>setBankForm(f=>({...f, consent: e.target.checked}))}
                />
                <span style={{ color: 'var(--text-muted)' }}>I consent to securely link my bank account.</span>
              </label>
              <div className="flex justify-end gap-2">
                {!profile?.bankLinked ? (
                  <button className="btn" type="submit" disabled={!bankForm.consent || saving}>{saving? 'Connecting...' : 'Connect'}</button>
                ) : (
                  <>
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={async ()=>{ await update({ bankLinked: false }); setShowBankModal(false) }}
                    >
                      Disconnect
                    </button>
                    <button className="btn" type="submit" disabled={!bankForm.consent || saving}>{saving? 'Saving...' : 'Save'}</button>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* KYC Modal */}
    <AnimatePresence>
      {showKycModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50">
          <motion.div initial={{ scale: 0.98, y: 8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 8, opacity: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-lg rounded-xl border card-base p-6">
            <div className="flex items-center justify-between">
              <div className="text-slate-200 font-semibold">KYC Details</div>
              <button className="btn-secondary" onClick={()=>setShowKycModal(false)}>Close</button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={async (e)=>{
              e.preventDefault()
              await update({ kycStatus: 'Verified', kyc: { ...kycForm } })
              setShowKycModal(false)
            }}>
              <label className="block">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>PAN</div>
                <input className="input w-full uppercase" placeholder="ABCDE1234F" value={kycForm.pan} onChange={(e)=>setKycForm(f=>({...f, pan: e.target.value.toUpperCase()}))} required />
              </label>
              <label className="block">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Date of Birth</div>
                <input type="date" className="input w-full" value={kycForm.dob} onChange={(e)=>setKycForm(f=>({...f, dob: e.target.value}))} required />
              </label>
              <label className="block">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Address</div>
                <textarea className="input w-full" rows={3} value={kycForm.address} onChange={(e)=>setKycForm(f=>({...f, address: e.target.value}))} required />
              </label>
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" type="button" onClick={()=>setShowKycModal(false)}>Cancel</button>
                <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save KYC'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Risk Assessment Modal */}
    <AnimatePresence>
      {showRiskModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50">
          <motion.div initial={{ scale: 0.98, y: 8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 8, opacity: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-xl rounded-xl border card-base p-6">
            <div className="flex items-center justify-between">
              <div className="text-slate-200 font-semibold">Risk Assessment</div>
              <button className="btn-secondary" onClick={()=>setShowRiskModal(false)}>Close</button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={async (e)=>{
              e.preventDefault()
              // Simple scoring: higher score => higher risk
              let score = 0
              score += riskAnswers.horizon === '5+' ? 2 : riskAnswers.horizon === '3+' ? 1 : 0
              score += riskAnswers.emergencyFund === 'yes' ? 1 : 0
              score += parseInt(riskAnswers.drawdown||'0',10) >= 20 ? 2 : parseInt(riskAnswers.drawdown||'0',10) >= 10 ? 1 : 0
              score += riskAnswers.experience === 'high' ? 2 : riskAnswers.experience === 'mid' ? 1 : 0
              const rp = score >= 4 ? 'High' : score >= 2 ? 'Medium' : 'Low'
              await update({ riskProfile: rp })
              setShowRiskModal(false)
            }}>
              <label className="block">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Investment Horizon</div>
                <select className="input w-full" value={riskAnswers.horizon} onChange={(e)=>setRiskAnswers(s=>({...s, horizon: e.target.value}))}>
                  <option value="<3">Less than 3 years</option>
                  <option value="3+">3-5 years</option>
                  <option value="5+">More than 5 years</option>
                </select>
              </label>
              <label className="block">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Emergency Fund (3 months)</div>
                <select className="input w-full" value={riskAnswers.emergencyFund} onChange={(e)=>setRiskAnswers(s=>({...s, emergencyFund: e.target.value}))}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label className="block">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Max Drawdown You Can Tolerate</div>
                <select className="input w-full" value={riskAnswers.drawdown} onChange={(e)=>setRiskAnswers(s=>({...s, drawdown: e.target.value}))}>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="20">20%+</option>
                </select>
              </label>
              <label className="block">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Market Experience</div>
                <select className="input w-full" value={riskAnswers.experience} onChange={(e)=>setRiskAnswers(s=>({...s, experience: e.target.value}))}>
                  <option value="low">Beginner</option>
                  <option value="mid">Intermediate</option>
                  <option value="high">Advanced</option>
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" type="button" onClick={()=>setShowRiskModal(false)}>Cancel</button>
                <button className="btn" type="submit">Save Profile</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  )
}
