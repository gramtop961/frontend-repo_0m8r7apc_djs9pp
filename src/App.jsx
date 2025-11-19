import { useEffect, useState } from 'react'
import MobileShell from './components/MobileShell'
import Onboarding from './components/Onboarding'

const apiBase = import.meta.env.VITE_BACKEND_URL || ''

function App() {
  const [profile, setProfile] = useState(null)

  useEffect(()=>{
    async function load(){
      try{
        const r = await fetch(`${apiBase}/profile`)
        const data = await r.json()
        setProfile(data)
      }catch{
        // fallback demo
        setProfile({ currency: '$', onboarded: false })
      }
    }
    load()
  },[])

  if(!profile){
    return <div className="min-h-screen bg-slate-950 text-white grid place-items-center">Loading…</div>
  }

  if(!profile.onboarded){
    return <Onboarding onDone={(p)=> setProfile({ ...profile, ...p, onboarded: true })} />
  }

  return (
    <MobileShell />
  )
}

export default App
