'use client'

import { useState } from 'react'
import { updateUserRoleAction, toggleUserActiveAction } from '@/server/actions/members'

interface UserProfile {
  id: string
  display_name: string
  email: string
  role: 'member' | 'committee' | 'admin'
  is_active: boolean
  created_at: string
}

interface AdminMembersClientProps {
  initialUsers: UserProfile[]
  currentUserId: string
}

export default function AdminMembersClient({ initialUsers, currentUserId }: AdminMembersClientProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: 'member' | 'committee' | 'admin') => {
    setLoadingId(userId)
    setError(null)
    setSuccess(null)

    const result = await updateUserRoleAction(userId, newRole)

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      setSuccess('User role updated successfully.')
    } else {
      setError(result.error || 'Failed to update user role.')
    }
    setLoadingId(null)
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setLoadingId(userId)
    setError(null)
    setSuccess(null)

    const targetStatus = !currentStatus
    const result = await toggleUserActiveAction(userId, targetStatus)

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: targetStatus } : u))
      )
      setSuccess(targetStatus ? 'User account reactivated.' : 'User account deactivated.')
    } else {
      setError(result.error || 'Failed to toggle account active status.')
    }
    setLoadingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {(error || success) && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-600 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">×</button>
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-700 flex items-center justify-between">
              <span>{success}</span>
              <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-600">×</button>
            </div>
          )}
        </div>
      )}

      {/* Members Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden fanzine-dot-grid">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500">Name</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500">Email</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500">Role</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500">Joined</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((user) => {
                const isSelf = user.id === currentUserId
                const isLoading = loadingId === user.id

                return (
                  <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 text-sm">
                          {user.display_name}
                        </span>
                        {isSelf && (
                          <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-extrabold text-accent uppercase tracking-wider border border-accent/20">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        disabled={isLoading || isSelf}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'member' | 'committee' | 'admin')}
                        className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <option value="member">Member</option>
                        <option value="committee">Committee (EXCO)</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                          user.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {user.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">
                      {new Date(user.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        disabled={isLoading || isSelf}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:scale-100 disabled:opacity-50 ${
                          user.is_active
                            ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isLoading ? 'Processing...' : user.is_active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-text-muted">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
