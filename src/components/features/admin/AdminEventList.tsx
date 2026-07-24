'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { deleteEventAction } from '@/server/actions/events'

interface ClubEvent {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: 'upcoming' | 'past' | 'cancelled';
  cover_image_key: string | null;
  departments: string[];
}

interface AdminEventListProps {
  initialEvents: ClubEvent[];
}

export default function AdminEventList({ initialEvents }: AdminEventListProps) {
  const router = useRouter()
  const [events, setEvents] = useState<ClubEvent[]>(initialEvents)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDept, setFilterDept] = useState<string | null>(null)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the event "${title}"? This action cannot be undone.`)) {
      return
    }

    setLoadingId(id)
    try {
      const result = await deleteEventAction(id)
      if (result.success) {
        setEvents(prev => prev.filter(e => e.id !== id))
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete event.')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoadingId(null)
    }
  }

  const filteredEvents = events.filter(event => {
    const statusMatch = filterStatus === 'all' || event.status === filterStatus
    const deptMatch = filterDept === null || event.departments?.includes(filterDept)
    return statusMatch && deptMatch
  })

  return (
    <div className="w-full space-y-6">
      
      {/* Filtering and Create Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-border pb-4">
        
        {/* Filter Groups */}
        <div className="flex flex-col gap-3">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-text-muted mr-1.5">Status:</span>
            {['all', 'upcoming', 'past', 'cancelled'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filterStatus === status 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-neutral-100 hover:bg-neutral-200 text-text-muted'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Department Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-text-muted mr-1.5">Dept:</span>
            <button
              type="button"
              onClick={() => setFilterDept(null)}
              className={`px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all ${
                filterDept === null
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-text-muted'
              }`}
            >
              All
            </button>
            {[
              { name: 'CASuals', activeClass: 'bg-sky-50 border-sky-300 text-sky-800 ring-1 ring-sky-300' },
              { name: 'TOPICS', activeClass: 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-300' },
              { name: 'Palette', activeClass: 'bg-pink-50 border-pink-300 text-pink-800 ring-1 ring-pink-300' }
            ].map((dept) => (
              <button
                key={dept.name}
                type="button"
                onClick={() => setFilterDept(dept.name)}
                className={`px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  filterDept === dept.name
                    ? dept.activeClass
                    : 'bg-surface border-border text-text-muted hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/admin/events/new"
          className="px-5 py-2.5 rounded-none bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm active:scale-95 text-center self-start md:self-center"
        >
          + Create New Event
        </Link>
      </div>

      {/* Events Table / List */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-300 bg-neutral-50/50 p-6">
          <p className="text-xs text-text-muted font-bold">No events found matching this filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border bg-surface shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-neutral-500">
            <thead className="bg-neutral-50 text-[10px] uppercase font-black tracking-wider text-neutral-400 border-b border-border">
              <tr>
                <th scope="col" className="px-6 py-4">Event Details</th>
                <th scope="col" className="px-6 py-4">Date & Time</th>
                <th scope="col" className="px-6 py-4">Location</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border border-t border-border">
              {filteredEvents.map((event) => {
                const startDate = new Date(event.starts_at)
                const dateStr = startDate.toLocaleDateString('en-SG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
                const timeStr = startDate.toLocaleTimeString('en-SG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <tr key={event.id} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Event Info */}
                    <td className="px-6 py-4 font-normal text-neutral-900">
                      <div className="flex items-center gap-3">
                        {/* Cover Image Thumbnail */}
                        <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden border border-border bg-neutral-100">
                          {event.cover_image_key ? (
                            <Image 
                              src={event.cover_image_key} 
                              alt="" 
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-neutral-800">{event.title}</div>
                          <div className="text-xs text-text-muted font-mono mt-0.5">/{event.slug}</div>
                          {event.departments && event.departments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {event.departments.length === 3 ? (
                                <span className="text-[9px] px-1.5 py-0.5 font-extrabold uppercase tracking-wider rounded-none border bg-amber-50 text-amber-700 border-amber-200 shadow-sm">
                                  Joint
                                </span>
                              ) : (
                                event.departments.map((dept) => {
                                  let classes = "";
                                  if (dept === 'CASuals') {
                                    classes = "bg-sky-50 text-sky-700 border-sky-100";
                                  } else if (dept === 'TOPICS') {
                                    classes = "bg-emerald-50 text-emerald-700 border-emerald-100";
                                  } else if (dept === 'Palette') {
                                    classes = "bg-pink-50 text-pink-700 border-pink-100";
                                  }
                                  return (
                                    <span key={dept} className={`text-[9px] px-1.5 py-0.5 font-extrabold uppercase tracking-wider rounded-none border ${classes}`}>
                                      {dept}
                                    </span>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date/Time */}
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-neutral-700">{dateStr}</div>
                      <div className="text-xs text-text-muted mt-0.5">{timeStr}</div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-xs font-semibold text-neutral-700">
                      {event.location || 'Online / Discord'}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-none px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider border ${
                        event.status === 'upcoming' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : event.status === 'past' 
                            ? 'bg-neutral-50 text-neutral-600 border-neutral-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {event.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/events/edit/${event.id}`}
                          className="text-xs uppercase font-extrabold tracking-wider text-neutral-600 hover:text-accent transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(event.id, event.title)}
                          disabled={loadingId === event.id}
                          className="text-xs uppercase font-extrabold tracking-wider text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                        >
                          {loadingId === event.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
