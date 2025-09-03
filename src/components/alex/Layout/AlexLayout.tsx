import React, { useEffect, useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import '../../../styles/alex/alex.css'
import ModeBadge from '../../alex/Common/ModeBadge'
import { MOCK } from '../../../api/client'
import CommandPalette from '../../common/CommandPalette'

export default function AlexLayout({ children }: { children: React.ReactNode }){
  const [paletteOpen, setPaletteOpen] = useState(false)
  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      const isCmdK = (e.key.toLowerCase()==='k') && (e.ctrlKey || e.metaKey)
      if(isCmdK){ e.preventDefault(); setPaletteOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[])
  return (
    <div>
      <Sidebar />
      <Header onOpenPalette={()=>setPaletteOpen(true)} />
      <main className="alex-main">{children}</main>
      <BottomNav />
      <ModeBadge mode={MOCK ? 'MOCK' : 'PAPER'} />
      <CommandPalette open={paletteOpen} onClose={()=>setPaletteOpen(false)} />
    </div>
  )
}
