import { useState, useEffect } from 'react'
import { X, User, Moon, Bell, Shield, Paintbrush } from 'lucide-react'
import { useAuth } from '@/lib/store'

interface ProfileSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export function ProfileSettingsModal({ isOpen, onClose, user }: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile')
  const { updateUser } = useAuth()
  
  const [name, setName] = useState(user?.name || '')
  
  // Theme state
  const [theme, setTheme] = useState('default')

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user])

  useEffect(() => {
    const savedTheme = localStorage.getItem('fc-theme') || 'default'
    setTheme(savedTheme)
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    updateUser(name)
    
    // Handle theme
    localStorage.setItem('fc-theme', theme)
    document.documentElement.classList.remove('theme-dark', 'theme-light')
    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`)
    }
    
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-base border border-border-subtle rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-raised">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`text-sm font-semibold transition ${activeTab === 'profile' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`text-sm font-semibold transition ${activeTab === 'settings' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              Settings
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-elevated text-text-muted hover:text-text-primary transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-surface-base text-2xl font-bold">
                  {name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">{name}</h3>
                  <p className="text-text-secondary text-sm">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-border-subtle">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Display Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-raised border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-sm text-text-primary transition" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">Email Address</label>
                  <input type="email" defaultValue={user?.email} disabled className="w-full px-4 py-2.5 rounded-xl bg-surface-raised border border-border-subtle opacity-50 cursor-not-allowed text-sm text-text-primary" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-elevated text-text-secondary"><Paintbrush className="w-4 h-4" /></div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">Theme</div>
                    <div className="text-xs text-text-muted">Choose your preferred appearance</div>
                  </div>
                </div>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle text-sm text-text-primary outline-none focus:border-brand"
                >
                  <option value="default">FormCraft Default (Green)</option>
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-elevated text-text-secondary"><Bell className="w-4 h-4" /></div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">Notifications</div>
                    <div className="text-xs text-text-muted">Get emails when you receive responses</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-surface-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle bg-surface-raised flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand to-brand-dark hover:opacity-90 transition shadow-lg shadow-brand/20">
            Save Changes
          </button>
        </div>
        
      </div>
    </div>
  )
}
