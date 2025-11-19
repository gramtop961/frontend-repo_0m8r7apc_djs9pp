import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, Coins, Settings2 } from 'lucide-react'

const apiBase = import.meta.env.VITE_BACKEND_URL || ''

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
  { code: 'INR', symbol: '₹' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'CAD', symbol: 'C$' },
]

const DEFAULT_CATEGORIES = ["Food", "Bills", "Transport", "Shopping", "Savings", "Other"]

function Stepper({ step, total }){
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? 'bg-white' : 'bg-white/20'}`} style={{ width: i === step ? 28 : 16 }} />
      ))}
    </div>
  )
}

export default function Onboarding({ onDone }){
  const [step, setStep] = useState(0)
  const [currency, setCurrency] = useState(currencies[0])
  const [target, setTarget] = useState('1000')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

  function next(){ setStep(s => Math.min(s+1, 3)) }
  function prev(){ setStep(s => Math.max(s-1, 0)) }

  async function finish(){
    try{
      await fetch(`${apiBase}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ currency: currency.symbol, target: parseFloat(target) || 0, categories })
      })
    }catch{}
    onDone({ currency: currency.symbol, target: parseFloat(target) || 0, categories })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative mx-auto max-w-md px-4 pb-24 pt-16">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="text-slate-400" aria-label="Back">
            {step>0 ? <ChevronLeft size={22}/> : <span />}
          </button>
          <Stepper step={step} total={4} />
          <div className="w-6" />
        </div>

        {step===0 && (
          <div className="text-center mt-10">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 grid place-items-center shadow-xl">
              <Coins className="text-white"/>
            </div>
            <h1 className="mt-6 text-2xl font-semibold">Welcome</h1>
            <p className="mt-2 text-slate-400 text-sm">Track spending, set goals, and stay on top of your money.
            </p>
            <button onClick={next} className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white font-medium">Get started</button>
          </div>
        )}

        {step===1 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Choose your currency</h2>
            <p className="text-slate-400 text-sm mt-1">Applies across the app</p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {currencies.map(c => (
                <button key={c.code} onClick={()=>setCurrency(c)} className={`rounded-xl border border-white/10 px-3 py-3 text-sm ${currency.code===c.code ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5 text-slate-200'}`}>
                  <div className="text-lg">{c.symbol}</div>
                  <div className="text-[11px] text-slate-400">{c.code}</div>
                </button>
              ))}
            </div>
            <button onClick={next} className="mt-6 w-full py-3 rounded-xl bg-white/10 text-white">Continue</button>
          </div>
        )}

        {step===2 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Monthly target</h2>
            <p className="text-slate-400 text-sm mt-1">Your savings or spending budget</p>
            <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
              <label className="text-xs text-slate-400">Amount</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm">{currency.symbol}</div>
                <input inputMode="decimal" value={target} onChange={e=>setTarget(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" placeholder="e.g., 1200"/>
              </div>
            </div>
            <button onClick={next} className="mt-6 w-full py-3 rounded-xl bg-white/10 text-white">Continue</button>
          </div>
        )}

        {step===3 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Pick your categories</h2>
            <p className="text-slate-400 text-sm mt-1">You can change these later</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {DEFAULT_CATEGORIES.map(c => {
                const active = categories.includes(c)
                return (
                  <button key={c} onClick={()=> setCategories(prev => active ? prev.filter(x=>x!==c) : [...prev, c])} className={`px-3 py-2 rounded-xl text-xs ${active? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-300'}`}>{c}</button>
                )
              })}
            </div>
            <button onClick={finish} className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white font-medium">Finish</button>
          </div>
        )}

      </div>
    </div>
  )
}
