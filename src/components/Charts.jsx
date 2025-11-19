import { useMemo } from 'react'

export function MiniPie({ data = [] }){
  // data: [{label, value, color}]
  const total = useMemo(()=> data.reduce((a,b)=>a + b.value, 0) || 1, [data])
  let cumulative = 0
  const segments = data.map((d, idx) => {
    const start = (cumulative / total) * 100
    cumulative += d.value
    const end = (cumulative / total) * 100
    return <div key={idx} className="absolute inset-0 rounded-full" style={{
      background: `conic-gradient(${d.color} 0 ${end}%, transparent ${end}% 100%)`,
      mask: `radial-gradient(circle at center, transparent 58%, black 59%)`
    }} />
  })

  return (
    <div className="relative w-28 h-28">
      <div className="absolute inset-0 rounded-full bg-slate-800" />
      {segments}
      <div className="absolute inset-[22%] rounded-full bg-slate-950" />
    </div>
  )
}
