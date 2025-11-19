import { useEffect, useMemo, useState } from 'react'
import { Home, PlusCircle, History, User, Wallet, Calendar, Filter, Moon, Sun, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import Spline from '@splinetool/react-spline'

const CATEGORIES = ["Food", "Bills", "Transport", "Shopping", "Savings", "Other"]

const palette = {
  bg: 'bg-slate-950',
  card: 'bg-slate-900/70 backdrop-blur border border-white/5 shadow-xl',
  text: 'text-slate-100',
  sub: 'text-slate-400',
  accent: 'from-indigo-500 via-blue-500 to-cyan-400',
  green: 'bg-emerald-500',
  red: 'bg-rose-500',
}

const apiBase = import.meta.env.VITE_BACKEND_URL || ''

function formatCurrency(n, currency = '$') {
  const sign = n < 0 ? '-' : ''
  return `${sign}${currency}${Math.abs(n).toFixed(2)}`
}

function ProgressBar({ value }) {
  const color = value < 0.6 ? 'bg-emerald-500' : value < 0.9 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="w-full h-2 rounded-full bg-slate-700/50">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(100, value * 100).toFixed(0)}%` }} />
    </div>
  )
}

function Stat({ label, value, icon, tone='indigo' }) {
  return (
    <div className={`rounded-2xl p-4 ${palette.card}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </div>
  )
}

function RecentItem({ item, currency }) {
  const isIncome = item.type === 'income'
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isIncome ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
          {isIncome ? <ArrowUpRight size={18}/> : <ArrowDownLeft size={18}/>}
        </div>
        <div>
          <div className="text-slate-100 text-sm leading-none">{item.title}</div>
          <div className="text-slate-400 text-[11px] mt-1">{new Date(item.date).toLocaleDateString()}</div>
        </div>
      </div>
      <div className={`text-sm ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>{isIncome ? '+' : '-'}{currency}{item.amount.toFixed(2)}</div>
    </div>
  )
}

function AddSheet({ open, onClose, onAdd, categories }) {
  const [type, setType] = useState('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [notes, setNotes] = useState('')

  useEffect(()=>{
    if(open){
      setType('expense'); setTitle(''); setAmount(''); setCategory(categories[0]); setNotes('')
    }
  },[open, categories])

  function submit(){
    const val = parseFloat(amount)
    if(!title || !val || val<=0) return
    onAdd({ title, amount: val, type, category, notes })
    onClose()
  }

  return (
    <div className={`fixed inset-0 z-50 ${open? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 transition ${open? 'bg-black/40' : 'bg-transparent'}`} onClick={onClose} />
      <div className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ${open? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="rounded-t-3xl p-5 space-y-4 bg-slate-900 border-t border-white/10">
          <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto" />
          <div className="flex gap-2">
            <button onClick={()=>setType('expense')} className={`flex-1 py-2 rounded-xl text-sm ${type==='expense'? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-300'}`}>Expense</button>
            <button onClick={()=>setType('income')} className={`flex-1 py-2 rounded-xl text-sm ${type==='income'? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-300'}`}>Income</button>
          </div>
          <div className="space-y-3">
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400" placeholder="Title (e.g., Groceries)" value={title} onChange={e=>setTitle(e.target.value)} />
            <input inputMode="decimal" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map(c => (
                <button key={c} onClick={()=>setCategory(c)} className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap ${category===c? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-300'}`}>{c}</button>
              ))}
            </div>
            <textarea rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400" placeholder="Notes (optional)" value={notes} onChange={e=>setNotes(e.target.value)} />
          </div>
          <button onClick={submit} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white font-medium">Add</button>
        </div>
      </div>
    </div>
  )
}

export default function MobileShell(){
  const [tab, setTab] = useState('home')
  const [dark, setDark] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  const [summary, setSummary] = useState(null)
  const [recent, setRecent] = useState([])
  const [currency, setCurrency] = useState('$')
  const [filters, setFilters] = useState({ category: '', type: '', start: '', end: '' })
  const [list, setList] = useState([])

  const categories = CATEGORIES

  async function fetchSummary(){
    try{
      const r = await fetch(`${apiBase}/summary`)
      const data = await r.json()
      setSummary(data)
      setRecent(data.recent || [])
    }catch(e){
      // fallback demo data if backend isn't ready
      const demo = {
        balance: 1087.4,
        income: 1800,
        expense: 712.6,
        month: '2025-01',
        month_spend: 412.6,
        budget: 1200,
        progress: 0.34,
        recent: [
          { id: '1', title: 'Groceries', amount: 42.5, type: 'expense', category: 'Food', date: new Date().toISOString() },
          { id: '2', title: 'Metro', amount: 3.2, type: 'expense', category: 'Transport', date: new Date().toISOString() },
          { id: '3', title: 'Salary', amount: 1800, type: 'income', category: 'Other', date: new Date().toISOString() },
        ]
      }
      setSummary(demo)
      setRecent(demo.recent)
    }
  }

  async function fetchList(){
    try{
      const params = new URLSearchParams()
      if(filters.category) params.append('category', filters.category)
      if(filters.type) params.append('type', filters.type)
      if(filters.start) params.append('start_date', filters.start)
      if(filters.end) params.append('end_date', filters.end)
      const r = await fetch(`${apiBase}/transactions?${params.toString()}`)
      const data = await r.json()
      setList(data)
    }catch{
      setList(recent)
    }
  }

  useEffect(()=>{ fetchSummary() },[])
  useEffect(()=>{ if(tab==='history') fetchList() },[tab, filters])

  async function addItem(item){
    try{
      await fetch(`${apiBase}/transactions`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(item) })
      fetchSummary()
      if(tab==='history') fetchList()
    }catch{
      // optimistic update fallback
      const fake = { ...item, id: Math.random().toString(36).slice(2), date: new Date().toISOString() }
      setRecent([fake, ...recent])
    }
  }

  const balanceColor = (summary?.balance ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
  const progressVal = summary?.progress ?? 0

  return (
    <div className={`min-h-screen ${palette.bg} relative overflow-hidden`}> 
      <div className="absolute inset-x-0 top-0 h-64">
        <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width:'100%', height:'100%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/70 to-slate-950 pointer-events-none" />
      </div>

      <div className="relative mx-auto max-w-md px-4 pb-28 pt-40">
        <div className={`rounded-3xl p-5 ${palette.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Current Balance</div>
              <div className={`text-3xl font-semibold ${balanceColor}`}>{formatCurrency(summary?.balance ?? 0, currency)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Monthly Spend</div>
              <div className="text-lg text-slate-100">{formatCurrency(summary?.month_spend ?? 0, currency)}</div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={progressVal} />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Budget {currency}{summary?.budget ?? 0}</span>
              <span>{Math.round(progressVal*100)}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Stat label="Income" value={formatCurrency(summary?.income ?? 0, currency)} icon={<ArrowUpRight className="text-emerald-400" size={18}/>} />
          <Stat label="Expenses" value={formatCurrency(summary?.expense ?? 0, currency)} icon={<ArrowDownLeft className="text-rose-400" size={18}/>} />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-300">Recent</div>
            <button className="text-xs text-slate-400" onClick={()=>setTab('history')}>See all</button>
          </div>
          <div className={`rounded-3xl px-4 ${palette.card}`}>
            {recent.slice(0,6).map(r => <RecentItem key={r.id || r._id} item={r} currency={currency}/>) }
          </div>
        </div>
      </div>

      <button className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-xl flex items-center justify-center" onClick={()=>setSheetOpen(true)}>
        <PlusCircle size={24}/>
      </button>

      <AddSheet open={sheetOpen} onClose={()=>setSheetOpen(false)} onAdd={addItem} categories={categories} />

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md rounded-2xl bg-slate-900/80 backdrop-blur border border-white/10 p-2 flex items-center justify-between">
        <button onClick={()=>setTab('home')} className={`flex-1 py-2 rounded-xl text-slate-300 flex flex-col items-center gap-1 ${tab==='home' && 'bg-white/5 text-white'}`}>
          <Home size={20}/><span className="text-[11px]">Home</span>
        </button>
        <button onClick={()=>setTab('add')} className={`flex-1 py-2 rounded-xl text-slate-300 flex flex-col items-center gap-1 ${tab==='add' && 'bg-white/5 text-white'}`}>
          <PlusCircle size={20}/><span className="text-[11px]">Add</span>
        </button>
        <button onClick={()=>setTab('history')} className={`flex-1 py-2 rounded-xl text-slate-300 flex flex-col items-center gap-1 ${tab==='history' && 'bg-white/5 text-white'}`}>
          <History size={20}/><span className="text-[11px]">History</span>
        </button>
        <button onClick={()=>setTab('profile')} className={`flex-1 py-2 rounded-xl text-slate-300 flex flex-col items-center gap-1 ${tab==='profile' && 'bg-white/5 text-white'}`}>
          <User size={20}/><span className="text-[11px]">Profile</span>
        </button>
      </nav>

      {tab==='add' && (
        <div className="fixed inset-0 z-30" onClick={()=>setTab('home')}>
          <div className="absolute inset-x-0 bottom-20 mx-auto max-w-md px-4">
            <div className={`rounded-3xl p-5 ${palette.card}`} onClick={e=>e.stopPropagation()}>
              <div className="text-slate-200 text-sm mb-3">Quick Add</div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map(c => (
                  <button key={c} onClick={()=>{ setSheetOpen(true); }} className="px-3 py-2 rounded-xl bg-white/5 text-slate-300 text-xs whitespace-nowrap">{c}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==='history' && (
        <div className="fixed inset-0 z-30" onClick={()=>setTab('home')}>
          <div className="absolute inset-x-0 bottom-20 top-40 mx-auto max-w-md px-4" onClick={e=>e.stopPropagation()}>
            <div className={`rounded-3xl p-5 h-full overflow-auto ${palette.card}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-slate-200 text-sm">History</div>
                <button onClick={fetchList} className="text-xs text-slate-400">Refresh</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <select value={filters.category} onChange={e=>setFilters(v=>({...v, category:e.target.value}))} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200">
                  <option value="">All Categories</option>
                  {categories.map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filters.type} onChange={e=>setFilters(v=>({...v, type:e.target.value}))} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200">
                  <option value="">All Types</option>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input type="date" value={filters.start} onChange={e=>setFilters(v=>({...v, start:e.target.value}))} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200"/>
                <input type="date" value={filters.end} onChange={e=>setFilters(v=>({...v, end:e.target.value}))} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200"/>
              </div>
              <div>
                {list.map(i=> <RecentItem key={i.id} item={i} currency={currency} />)}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
