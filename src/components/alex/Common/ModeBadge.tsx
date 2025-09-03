import React from 'react'

type Mode = 'PAPER' | 'LIVE' | 'MOCK'

export default function ModeBadge({ mode = 'PAPER' }: { mode?: Mode }){
  const cls = mode === 'LIVE' ? 'mode-badge live' : (mode==='MOCK' ? 'mode-badge mock' : 'mode-badge')
  return (
    <div className={cls} title={`Mode: ${mode}`}>{mode}</div>
  )
}
