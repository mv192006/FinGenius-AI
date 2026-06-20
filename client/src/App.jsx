import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, Bell, Bot, BriefcaseBusiness, Car, ChartNoAxesCombined,
  ChevronDown, CircleDollarSign, Coffee, Goal, LayoutDashboard, Menu, MessageCircle, MoreHorizontal,
  PiggyBank, Play, Plus, Search, Send, Settings, ShieldCheck, ShoppingBag, Sparkles, TrendingUp, WalletCards, X
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import {
  AdvisorPage, AnalyticsPage, GlobalSearch, GoalsPage, Notifications, SettingsPage,
  TransactionModal, TransactionsPage
} from './Features.jsx';

const fallback = {
  user: { name: 'Aarav', initials: 'AK' }, balance: 284650, income: 95000, spending: 56740, savings: 38260,
  savingsRate: 40.3, healthScore: 82,
  monthly: [{month:'Jan',income:82,spending:49},{month:'Feb',income:86,spending:55},{month:'Mar',income:88,spending:52},{month:'Apr',income:90,spending:61},{month:'May',income:92,spending:58},{month:'Jun',income:95,spending:57}],
  categories: [{name:'Housing',value:34,color:'#163d33'},{name:'Food',value:23,color:'#e8a25a'},{name:'Transport',value:15,color:'#78a58e'},{name:'Lifestyle',value:17,color:'#d9cf9a'},{name:'Other',value:11,color:'#a9b4ae'}],
  goals: [{name:'Emergency fund',current:185000,target:300000,color:'#163d33'},{name:'Europe trip',current:72000,target:150000,color:'#e8a25a'}],
  transactions: [{id:1,merchant:'Green Basket',category:'Groceries',amount:2840,date:'2026-06-18',icon:'shopping'},{id:2,merchant:'Metro Transit',category:'Transport',amount:620,date:'2026-06-17',icon:'car'},{id:3,merchant:'Cloud Nine Cafe',category:'Dining',amount:1150,date:'2026-06-16',icon:'coffee'},{id:4,merchant:'StreamFlix',category:'Subscriptions',amount:649,date:'2026-06-15',icon:'play'},{id:5,merchant:'Acme Technologies',category:'Income',amount:95000,date:'2026-06-01',icon:'briefcase',income:true}]
};

const nav = [
  ['Overview', LayoutDashboard], ['Transactions', WalletCards], ['Analytics', ChartNoAxesCombined],
  ['Savings goals', Goal], ['Investments', TrendingUp], ['AI advisor', Sparkles]
];
const iconMap = { shopping: ShoppingBag, car: Car, coffee: Coffee, play: Play, briefcase: BriefcaseBusiness };
const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

function StatCard({ label, value, change, icon: Icon, dark }) {
  return <article className={`stat-card ${dark ? 'dark' : ''}`}>
    <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18}/></span></div>
    <strong>{value}</strong>
    <div className="stat-foot"><span className={change?.startsWith('+') ? 'positive' : ''}>{change}</span><span>vs last month</span></div>
  </article>;
}

function Overview({ data, setChatOpen, openAdd, navigate }) {
  return <>
    <section className="hero-row">
      <div><p className="eyebrow">THURSDAY, 19 JUNE</p><h1>Good morning, {data.user.name}.</h1><p>Here’s what’s happening with your money.</p></div>
      <button className="primary" onClick={openAdd}><Plus size={17}/> Add transaction</button>
    </section>
    <section className="stats-grid">
      <StatCard label="Total balance" value={money(data.balance)} change="+8.2%" icon={WalletCards} dark />
      <StatCard label="Monthly income" value={money(data.income)} change="+3.1%" icon={ArrowDownLeft} />
      <StatCard label="Monthly spending" value={money(data.spending)} change="-4.6%" icon={ArrowUpRight} />
      <StatCard label="Saved this month" value={money(data.savings)} change={`+${data.savingsRate}%`} icon={PiggyBank} />
    </section>
    <section className="dashboard-grid">
      <article className="panel cashflow">
        <div className="panel-head"><div><h2>Cash flow</h2><p>Your income and spending over time</p></div><button className="select">Last 6 months <ChevronDown size={15}/></button></div>
        <div className="legend"><span><i className="dot income"/>Income</span><span><i className="dot spend"/>Spending</span></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.monthly} margin={{left:-18,right:8,top:12,bottom:0}}>
          <defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#183f35" stopOpacity=".24"/><stop offset="1" stopColor="#183f35" stopOpacity="0"/></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="#eceee8"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#89918d',fontSize:12}}/>
          <Tooltip formatter={(v)=>[`₹${v}k`]} contentStyle={{border:'0',borderRadius:12,boxShadow:'0 8px 30px #193b3020'}}/>
          <Area type="monotone" dataKey="income" stroke="#183f35" strokeWidth={2.5} fill="url(#incomeFill)"/>
          <Area type="monotone" dataKey="spending" stroke="#e39a52" strokeWidth={2.5} fill="transparent" strokeDasharray="5 5"/>
        </AreaChart></ResponsiveContainer></div>
      </article>
      <article className="panel spending-panel">
        <div className="panel-head"><div><h2>Spending by category</h2><p>Where your money went this month</p></div><button className="icon-button"><MoreHorizontal size={20}/></button></div>
        <div className="donut-row"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.categories} dataKey="value" innerRadius={56} outerRadius={78} paddingAngle={3}>{data.categories.map(x=><Cell key={x.name} fill={x.color}/>)}</Pie></PieChart></ResponsiveContainer><div className="donut-center"><strong>{money(data.spending)}</strong><span>Total spent</span></div></div>
        <div className="category-list">{data.categories.map(x=><div key={x.name}><span><i style={{background:x.color}}/>{x.name}</span><strong>{x.value}%</strong></div>)}</div></div>
      </article>
      <article className="panel transactions">
        <div className="panel-head"><div><h2>Recent transactions</h2><p>Your latest financial activity</p></div><button className="text-button" onClick={()=>navigate('Transactions')}>View all <ArrowRight size={15}/></button></div>
        <div className="transaction-list">{data.transactions.slice(0,5).map(t=>{const Icon=iconMap[t.icon]||CircleDollarSign;const income=t.type==='income'||t.income;return <div className="transaction" key={t.id}><span className="merchant-icon"><Icon size={18}/></span><div><strong>{t.merchant}</strong><span>{t.category} · {new Date(t.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span></div><b className={income?'credit':''}>{income?'+':'-'}{money(t.amount)}</b></div>})}</div>
      </article>
      <div className="side-stack">
        <article className="health-card"><div><span>FINANCIAL HEALTH</span><ShieldCheck size={20}/></div><section><strong>{data.healthScore}</strong><span>/ 100</span></section><h3>You're doing great</h3><p>Your score reflects savings, goals, and budget use.</p><div className="score-track"><i style={{width:`${data.healthScore}%`}}/></div><button onClick={()=>navigate('Analytics')}>View full report <ArrowRight size={15}/></button></article>
        <article className="insight-card"><span className="spark"><Sparkles size={18}/></span><div><span>AI INSIGHT</span><h3>You could save ₹2,100 more</h3><p>Your dining spend is 18% higher than usual. A small adjustment could accelerate your goals.</p><button onClick={()=>setChatOpen(true)}>Ask FinGenius <ArrowRight size={15}/></button></div></article>
      </div>
      <article className="panel goals-panel">
        <div className="panel-head"><div><h2>Savings goals</h2><p>Keep an eye on what you're building</p></div><button className="text-button" onClick={()=>navigate('Savings goals')}>Manage goals <ArrowRight size={15}/></button></div>
        <div className="goals">{data.goals.map(g=>{const pct=Math.round(g.current/g.target*100);return <div className="goal-row" key={g.name}><div className="goal-top"><span><i style={{background:g.color}}/><strong>{g.name}</strong></span><b>{pct}%</b></div><div className="goal-track"><i style={{width:`${pct}%`,background:g.color}}/></div><div className="goal-values"><span>{money(g.current)} saved</span><span>of {money(g.target)}</span></div></div>})}</div>
      </article>
    </section>
  </>;
}

function InvestmentPlanner() {
  const [risk,setRisk]=useState('Moderate'), [age,setAge]=useState(28), [monthly,setMonthly]=useState(20000), [plan,setPlan]=useState(null);
  const makePlan=async()=>{try{const r=await fetch('/api/investment-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({risk,age,monthlyInvestment:monthly})});setPlan(await r.json())}catch{const equity=risk==='Aggressive'?70:risk==='Conservative'?35:55;setPlan({allocation:[{name:'Equity funds',value:equity},{name:'Debt funds',value:risk==='Conservative'?50:30},{name:'Gold',value:risk==='Aggressive'?10:15}],projected:monthly*12*(60-age)*1.72,years:60-age})}};
  return <div className="page-view"><p className="eyebrow">AI INVESTMENT ADVISOR</p><h1>Build a plan around your life.</h1><p className="page-sub">Tell us a little about you. FinGenius will create a practical long-term allocation.</p><div className="planner-grid"><article className="panel form-card"><label>Your age<input type="number" value={age} onChange={e=>setAge(e.target.value)}/></label><label>Monthly investment<input type="number" value={monthly} onChange={e=>setMonthly(e.target.value)}/></label><label>Risk appetite<div className="risk-options">{['Conservative','Moderate','Aggressive'].map(r=><button className={risk===r?'active':''} onClick={()=>setRisk(r)} key={r}>{r}</button>)}</div></label><button className="primary full" onClick={makePlan}><Sparkles size={17}/> Generate my plan</button></article><article className="panel plan-result">{plan?<><span className="result-icon"><TrendingUp/></span><h2>Your recommended allocation</h2><div className="allocations">{plan.allocation.map((a,i)=><div key={a.name}><span>{a.name}</span><strong>{a.value}%</strong><i><b style={{width:`${a.value}%`,background:['#173f34','#e49a52','#d5c87d'][i]}}/></i></div>)}</div><div className="projection"><span>Potential value in {plan.years} years</span><strong>{money(plan.projected)}</strong><small>Illustrative projection, not guaranteed returns.</small></div></>:<div className="empty-plan"><TrendingUp size={35}/><h2>Your tailored plan will appear here</h2><p>We’ll balance growth, stability, and your comfort with risk.</p></div>}</article></div></div>;
}

function Chat({open,setOpen}) {
  const [messages,setMessages]=useState([{role:'ai',text:'Hi Aarav. I’ve reviewed your June finances. What would you like to improve today?'}]);
  const [input,setInput]=useState(''), [loading,setLoading]=useState(false);
  const send=async(text=input)=>{if(!text.trim())return;setMessages(m=>[...m,{role:'user',text}]);setInput('');setLoading(true);try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});const d=await r.json();setMessages(m=>[...m,{role:'ai',text:d.reply}])}catch{setMessages(m=>[...m,{role:'ai',text:'Your savings rate is strong. Focus next on completing your emergency fund and keeping lifestyle inflation in check.'}])}finally{setLoading(false)}};
  if(!open)return null;
  return <aside className="chat"><header><div><span><Bot size={19}/></span><div><strong>FinGenius AI</strong><small>Personal finance advisor</small></div></div><button onClick={()=>setOpen(false)}><X size={19}/></button></header><div className="chat-body"><div className="quick-prompts">{['Where can I save?','How should I invest?'].map(q=><button key={q} onClick={()=>send(q)}>{q}</button>)}</div>{messages.map((m,i)=><div key={i} className={`message ${m.role}`}>{m.text}</div>)}{loading&&<div className="message ai typing">Thinking…</div>}</div><form onSubmit={e=>{e.preventDefault();send()}}><input placeholder="Ask about your finances…" value={input} onChange={e=>setInput(e.target.value)}/><button><Send size={17}/></button></form></aside>;
}

export default function App() {
  const [data,setData]=useState(fallback), [active,setActive]=useState('Overview'), [chatOpen,setChatOpen]=useState(false), [menu,setMenu]=useState(false);
  const [addOpen,setAddOpen]=useState(false), [settingsOpen,setSettingsOpen]=useState(false), [notificationsOpen,setNotificationsOpen]=useState(false), [searchQuery,setSearchQuery]=useState('');
  const refresh=useCallback(()=>fetch('/api/dashboard').then(r=>r.ok?r.json():Promise.reject()).then(setData).catch(()=>{}),[]);
  useEffect(()=>{refresh()},[refresh]);
  const navigate=useCallback(page=>{setActive(page);setSearchQuery('');setMenu(false)},[]);
  const content=useMemo(()=>{
    if(active==='Overview')return <Overview data={data} setChatOpen={setChatOpen} openAdd={()=>setAddOpen(true)} navigate={navigate}/>;
    if(active==='Transactions')return <TransactionsPage data={data} refresh={refresh} openAdd={()=>setAddOpen(true)}/>;
    if(active==='Analytics')return <AnalyticsPage data={data}/>;
    if(active==='Savings goals')return <GoalsPage data={data} refresh={refresh}/>;
    if(active==='Investments')return <InvestmentPlanner/>;
    return <AdvisorPage data={data} openChat={()=>setChatOpen(true)}/>;
  },[active,data,navigate,refresh]);
  return <div className="app-shell">
    <aside className={`sidebar ${menu?'open':''}`}><div className="brand"><span><ChartNoAxesCombined size={23}/></span><strong>FinGenius</strong><i>AI</i></div><nav>{nav.map(([name,Icon])=><button key={name} className={active===name?'active':''} onClick={()=>navigate(name)}><Icon size={18}/><span>{name}</span>{name==='AI advisor'&&<b>AI</b>}</button>)}</nav><div className="sidebar-bottom"><button onClick={()=>setSettingsOpen(true)}><Settings size={18}/>Settings</button><div className="profile"><span>AK</span><div><strong>Aarav Kapoor</strong><small>Personal account</small></div><MoreHorizontal size={18}/></div></div></aside>
    <main><header className="topbar"><button className="menu-button" onClick={()=>setMenu(!menu)}><Menu size={21}/></button><div className="search"><Search size={17}/><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search transactions, goals…"/><kbd>⌘ K</kbd>{searchQuery&&<GlobalSearch query={searchQuery} data={data} onSelect={navigate}/>}</div><div className="top-actions"><button onClick={()=>setNotificationsOpen(!notificationsOpen)}><Bell size={19}/><i/></button><button className="avatar" onClick={()=>setSettingsOpen(true)}>AK</button>{notificationsOpen&&<Notifications data={data} onClose={()=>setNotificationsOpen(false)}/>}</div></header><div className="content">{content}</div></main>
    <button className="chat-fab" onClick={()=>setChatOpen(true)}><MessageCircle size={20}/><span>Ask FinGenius</span></button><Chat open={chatOpen} setOpen={setChatOpen}/>
    <TransactionModal open={addOpen} onClose={()=>setAddOpen(false)} onSaved={refresh}/>
    {settingsOpen&&<SettingsPage onClose={()=>setSettingsOpen(false)}/>} 
  </div>;
}
