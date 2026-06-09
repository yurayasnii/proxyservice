'use client'



import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { Bot, User, Send, Plus, Loader2, MessageSquare, X } from 'lucide-react'

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const codeLines: string[] = []; i++
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++ }
      nodes.push(<pre key={i} style={{ background: '#080808', borderRadius: '8px', padding: '10px 12px', overflowX: 'auto', margin: '6px 0', fontSize: '12px', fontFamily: 'monospace', color: '#DDDDDD', lineHeight: 1.5 }}><code>{codeLines.join('\n')}</code></pre>)
      i++; continue
    }
    if (line.match(/^[-*]\s/)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^[-*]\s/)) { items.push(lines[i].replace(/^[-*]\s/, '')); i++ }
      nodes.push(<ul key={i} style={{ margin: '4px 0', paddingLeft: '16px', listStyleType: 'disc' }}>{items.map((item, j) => <li key={j} style={{ marginBottom: '2px' }}>{inlineMarkdown(item)}</li>)}</ul>)
      continue
    }
    if (line.trim() === '') { nodes.push(<div key={i} style={{ height: '5px' }} />); i++; continue }
    nodes.push(<p key={i} style={{ margin: 0, lineHeight: 1.6 }}>{inlineMarkdown(line)}</p>); i++
  }
  return nodes
}

function inlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g
  let last = 0; let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[0].startsWith('**')) parts.push(<strong key={match.index} style={{ color: '#FFFFFF', fontWeight: 600 }}>{match[2]}</strong>)
    else parts.push(<code key={match.index} style={{ background: 'rgba(255,255,255,0.30)', borderRadius: '4px', padding: '1px 5px', fontSize: '11.5px', fontFamily: 'monospace', color: '#DDDDDD' }}>{match[3]}</code>)
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 ? parts[0] : <>{parts}</>
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatFull(date: Date) {
  return date.toLocaleString('uk-UA', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

interface Ticket {
  _id: string; category: string; status: string
  messages: Array<{ role: string; content: string; createdAt: string; quickReplies?: string[] }>
  createdAt: string
}

const CATEGORIES: Record<string, string> = {
  proxy_not_working: 'Проксі не працює',
  slow_speed: 'Повільна швидкість',
  wrong_geo: 'Неправильна геолокація',
  payment_issue: 'Проблема з оплатою',
  refund_request: 'Запит на повернення',
  other: 'Інше питання',
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  open:          { label: 'Відкритий',     color: '#22C55E' },
  ai_resolved:   { label: 'AI вирішив',    color: '#CCCCCC' },
  pending_human: { label: 'Очікує',        color: '#F59E0B' },
  closed:        { label: 'Закритий',      color: '#EEEEEE' },
}

export default function SupportPage() {
  
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newCategory, setNewCategory] = useState('proxy_not_working')
  const [creating, setCreating] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchTickets() }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [activeTicket?.messages])

  async function fetchTickets() {
    setLoading(true)
    try { const res = await fetch('/api/v1/support/tickets'); const data = await res.json(); setTickets(data.data?.items ?? []) }
    finally { setLoading(false) }
  }

  async function createTicket() {
    setCreating(true)
    try {
      const res = await fetch('/api/v1/support/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: newCategory, message: CATEGORIES[newCategory] }) })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)
      setShowNew(false); setQuickReplies(data.data?.aiResponse?.quickReplies ?? [])
      await fetchTickets(); setActiveTicket(data.data?.ticket ?? null)
    } finally { setCreating(false) }
  }

  async function sendMessage(override?: string) {
    const text = override ?? message
    if (!activeTicket || !text.trim()) return
    const now = new Date()
    setSending(true); setMessage(''); setQuickReplies([])

    // Optimistic: show bot confirmation immediately
    const confirmMsg = {
      role: 'assistant',
      content: `📨 Надсилаю повідомлення до підтримки...\n\n${formatFull(now)}`,
      createdAt: now.toISOString(),
    }
    setActiveTicket(prev => prev ? { ...prev, messages: [...prev.messages, { role: 'user', content: text, createdAt: now.toISOString() }, confirmMsg] } : prev)

    try {
      const res = await fetch(`/api/v1/support/tickets/${activeTicket._id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)
      setActiveTicket(data.data?.ticket ?? null); setQuickReplies(data.data?.aiResponse?.quickReplies ?? [])
      fetchTickets()
    } finally { setSending(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '26px', letterSpacing: '-0.03em', color: '#FFFFFF' }}>Підтримка</h1>
          <p style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>24/7 · Відповідь протягом години</p>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 18px', borderRadius: '9px', background: '#FFFFFF', color: '#000', fontSize: '13px', fontWeight: 600 }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}>
          <Plus style={{ width: '13px', height: '13px' }} />
          Новий тікет
        </button>
      </div>

      {/* New ticket modal */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowNew(false) }}>
          <div className="animate-modal-in sm:rounded-2xl rounded-t-2xl" style={{ width: '100%', maxWidth: '400px', background: '#0C0C0C', boxShadow: '0 0 0 1px rgba(255,255,255,0.25), 0 -32px 80px rgba(0,0,0,0.8)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: '#FFFFFF' }}>З чим допомогти?</p>
                <p style={{ fontSize: '12px', color: '#CCCCCC', marginTop: '3px' }}>Наша команда відповість</p>
              </div>
              <button onClick={() => setShowNew(false)} style={{ color: '#EEEEEE', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <div className="space-y-1.5 mb-5">
              {Object.entries(CATEGORIES).map(([v, l]) => (
                <button key={v} onClick={() => setNewCategory(v)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', textAlign: 'left', fontSize: '13.5px', fontWeight: 500, color: newCategory === v ? '#FFFFFF' : '#444', background: newCategory === v ? 'rgba(255,255,255,0.28)' : 'transparent', transition: 'color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { if (newCategory !== v) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.20)'; (e.currentTarget as HTMLButtonElement).style.color = '#888' }}}
                  onMouseLeave={e => { if (newCategory !== v) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#444' }}}>
                  {l}
                </button>
              ))}
            </div>
            <button disabled={creating} onClick={createTicket}
              style={{ width: '100%', height: '44px', borderRadius: '10px', background: '#FFFFFF', color: '#000', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: creating ? 0.6 : 1 }}
              onMouseEnter={e => { if (!creating) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = creating ? '0.6' : '1'}>
              {creating ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> : null}
              {creating ? 'Підключаємо AI...' : 'Почати чат'}
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', height: 'calc(100vh - 200px)', minHeight: '500px' }} className="lg:grid-cols-3">

        {/* Ticket list */}
        <div style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Тікети</span>
            <span style={{ fontSize: '11px', color: '#CCCCCC', fontFamily: 'JetBrains Mono, monospace' }}>{tickets.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '12px' }} className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '52px', borderRadius: '8px' }} />)}
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
                <MessageSquare style={{ width: '24px', height: '24px', color: '#CCCCCC', marginBottom: '10px' }} />
                <p style={{ fontSize: '13px', color: '#CCCCCC' }}>Немає тікетів</p>
              </div>
            ) : tickets.map(ticket => {
              const active = activeTicket?._id === ticket._id
              const badge = STATUS_BADGE[ticket.status] ?? STATUS_BADGE.open
              return (
                <button key={ticket._id} onClick={() => { setActiveTicket(ticket); setQuickReplies([]) }}
                  style={{ width: '100%', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', background: active ? 'rgba(255,255,255,0.20)' : 'transparent', borderLeft: `2px solid ${active ? '#FFFFFF' : 'transparent'}`, borderTop: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#CCCCCC' }}>{CATEGORIES[ticket.category]}</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: badge.color, background: `${badge.color}12`, padding: '2px 7px', borderRadius: '4px' }}>{badge.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#CCCCCC' }}>{new Date(ticket.createdAt).toLocaleDateString('uk-UA')}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat — spans 2 cols on lg */}
        <div className="lg:col-span-2" style={{ background: '#0A0A0A', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!activeTicket ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Bot style={{ width: '22px', height: '22px', color: '#CCCCCC' }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>ProxyService AI</p>
                <p style={{ fontSize: '12px', color: '#CCCCCC' }}>Оберіть тікет або створіть новий</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '12px 18px', background: '#080808', borderBottom: '1px solid rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot style={{ width: '15px', height: '15px', color: '#000' }} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>ProxyService AI</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E' }} />
                    <span style={{ fontSize: '11px', color: '#22C55E' }}>Online</span>
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{ fontSize: '11px', color: '#EEEEEE', padding: '3px 9px', background: 'rgba(255,255,255,0.20)', borderRadius: '5px' }}>
                    {CATEGORIES[activeTicket.category]}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeTicket.messages.map((msg, i) => {
                  const isAi = msg.role !== 'user'
                  return (
                    <div key={i} style={{ display: 'flex', gap: '8px', flexDirection: isAi ? 'row' : 'row-reverse' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: isAi ? '#FFFFFF' : 'rgba(255,255,255,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        {isAi ? <Bot style={{ width: '13px', height: '13px', color: '#000' }} /> : <User style={{ width: '13px', height: '13px', color: '#CCCCCC' }} />}
                      </div>
                      <div style={{ maxWidth: '76%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: isAi ? 'flex-start' : 'flex-end' }}>
                        <div style={{ padding: '10px 14px', borderRadius: isAi ? '4px 12px 12px 12px' : '12px 4px 12px 12px', background: isAi ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.28)', fontSize: '13px', color: '#CCCCCC', lineHeight: 1.6 }}>
                          {isAi ? renderMarkdown(msg.content) : <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>}
                        </div>
                        {msg.createdAt && <span style={{ fontSize: '10px', color: '#242424' }}>{formatTime(msg.createdAt)}</span>}
                      </div>
                    </div>
                  )
                })}

                {/* Quick replies */}
                {quickReplies.length > 0 && !sending && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '34px' }}>
                    {quickReplies.map((reply, j) => (
                      <button key={j} onClick={() => sendMessage(reply)}
                        style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 500, color: '#CCCCCC', background: 'rgba(255,255,255,0.20)', transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.30)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.20)' }}>
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

                {/* Typing indicator */}
                {sending && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot style={{ width: '13px', height: '13px', color: '#000' }} />
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: '4px 12px 12px 12px', background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {[0,1,2].map(d => <div key={d} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2A2A2A', animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite` }} />)}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              {activeTicket.status !== 'closed' && (
                <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.20)', display: 'flex', gap: '8px' }}>
                  <input value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Напишіть повідомлення..."
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    style={{ flex: 1, height: '42px', borderRadius: '9px', background: 'rgba(255,255,255,0.20)', border: 'none', outline: 'none', color: '#FFFFFF', fontSize: '13.5px', padding: '0 14px' }}
                    onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.30)')}
                    onBlur={e => (e.currentTarget.style.boxShadow = 'none')} />
                  <button onClick={() => sendMessage()} disabled={sending || !message.trim()}
                    style={{ width: '42px', height: '42px', borderRadius: '9px', background: '#FFFFFF', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (sending || !message.trim()) ? 0.4 : 1, transition: 'opacity 0.15s' }}
                    onMouseEnter={e => { if (!sending && message.trim()) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = (sending || !message.trim()) ? '0.4' : '1'}>
                    {sending ? <Loader2 style={{ width: '15px', height: '15px' }} className="animate-spin" /> : <Send style={{ width: '15px', height: '15px' }} />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
