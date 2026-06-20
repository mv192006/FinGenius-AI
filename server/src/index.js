import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(cors());
app.use(express.json());

const dataFile = join(dirname(fileURLToPath(import.meta.url)), '../data/finance.json');
const seed = {
  user: { name: 'Aarav', initials: 'AK' },
  balance: 284650,
  income: 95000,
  savingsRate: 40.3,
  healthScore: 82,
  transactions: [
    { id: 1, merchant: 'Green Basket', category: 'Groceries', amount: 2840, date: '2026-06-18', type: 'expense', icon: 'shopping', status: 'cleared' },
    { id: 2, merchant: 'Metro Transit', category: 'Transport', amount: 620, date: '2026-06-17', type: 'expense', icon: 'car', status: 'cleared' },
    { id: 3, merchant: 'Cloud Nine Cafe', category: 'Dining', amount: 1150, date: '2026-06-16', type: 'expense', icon: 'coffee', status: 'cleared' },
    { id: 4, merchant: 'StreamFlix', category: 'Subscriptions', amount: 649, date: '2026-06-15', type: 'expense', icon: 'play', status: 'cleared' },
    { id: 5, merchant: 'Acme Technologies', category: 'Income', amount: 95000, date: '2026-06-01', type: 'income', icon: 'briefcase', status: 'cleared' },
    { id: 6, merchant: 'Urban Homes', category: 'Housing', amount: 24000, date: '2026-06-02', type: 'expense', icon: 'home', status: 'cleared' },
    { id: 7, merchant: 'Power & Light', category: 'Utilities', amount: 3250, date: '2026-06-05', type: 'expense', icon: 'utility', status: 'cleared' },
    { id: 8, merchant: 'Wellness Pharmacy', category: 'Health', amount: 1860, date: '2026-05-28', type: 'expense', icon: 'health', status: 'cleared' }
  ],
  goals: [
    { id: 1, name: 'Emergency fund', current: 185000, target: 300000, deadline: '2026-12-31', color: '#163d33' },
    { id: 2, name: 'Europe trip', current: 72000, target: 150000, deadline: '2027-04-01', color: '#e8a25a' }
  ],
  settings: { currency: 'INR', monthlyBudget: 65000, alerts: true, darkMode: false }
};

async function loadData() {
  try { return JSON.parse(await readFile(dataFile, 'utf8')); }
  catch { await mkdir(dirname(dataFile), { recursive: true }); await writeFile(dataFile, JSON.stringify(seed, null, 2)); return structuredClone(seed); }
}
let db = await loadData();
const save = () => writeFile(dataFile, JSON.stringify(db, null, 2));
const monthly = [
  { month: 'Jan', income: 82, spending: 49 }, { month: 'Feb', income: 86, spending: 55 },
  { month: 'Mar', income: 88, spending: 52 }, { month: 'Apr', income: 90, spending: 61 },
  { month: 'May', income: 92, spending: 58 }, { month: 'Jun', income: 95, spending: 57 }
];
const colors = ['#163d33', '#e8a25a', '#78a58e', '#d9cf9a', '#a9b4ae', '#8f7a9b', '#6d8ca0'];

function computed() {
  const spending = db.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const income = db.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || db.income;
  const byCategory = db.transactions.filter(t => t.type === 'expense').reduce((acc, t) => ({ ...acc, [t.category]: (acc[t.category] || 0) + Number(t.amount) }), {});
  const categories = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([name, amount], index) => ({ name, amount, value: spending ? Math.round(amount / spending * 100) : 0, color: colors[index % colors.length] }));
  const savings = Math.max(0, income - spending);
  const savingsRate = income ? Number((savings / income * 100).toFixed(1)) : 0;
  const budgetUse = db.settings.monthlyBudget ? spending / db.settings.monthlyBudget : 1;
  const goalProgress = db.goals.length ? db.goals.reduce((s,g)=>s+Math.min(1,g.current/g.target),0)/db.goals.length : 0;
  const healthScore = Math.round(Math.max(35, Math.min(98, 55 + savingsRate * .45 + goalProgress * 18 - Math.max(0, budgetUse - 1) * 20)));
  return { spending, income, savings, savingsRate, healthScore, categories };
}

function suspiciousTransactions() {
  return db.transactions.filter((t, index, all) => {
    const duplicate = all.some((other, i) => i !== index && other.type === 'expense' && other.merchant === t.merchant && other.amount === t.amount && other.date === t.date);
    return t.type === 'expense' && (Number(t.amount) >= 50000 || duplicate || t.status === 'flagged');
  }).map(t => ({ ...t, risk: Number(t.amount) >= 50000 ? 'High value transaction' : 'Possible duplicate' }));
}

app.get('/api/health', (_, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'local' }));
app.get('/api/dashboard', (_, res) => res.json({ ...db, ...computed(), monthly }));
app.get('/api/transactions', (req, res) => {
  const query = String(req.query.q || '').toLowerCase();
  const type = req.query.type;
  const result = db.transactions.filter(t => (!query || `${t.merchant} ${t.category}`.toLowerCase().includes(query)) && (!type || type === 'all' || t.type === type));
  res.json(result.sort((a,b)=>b.date.localeCompare(a.date)));
});
app.post('/api/transactions', async (req, res) => {
  const { merchant, category, amount, date, type = 'expense' } = req.body;
  if (!merchant || !category || !amount || Number(amount) <= 0) return res.status(400).json({ error: 'Merchant, category, and a positive amount are required.' });
  const transaction = { id: Date.now(), merchant: String(merchant), category: String(category), amount: Number(amount), date: date || new Date().toISOString().slice(0,10), type, icon: type === 'income' ? 'briefcase' : 'shopping', status: Number(amount) >= 50000 && type === 'expense' ? 'flagged' : 'cleared' };
  db.transactions.push(transaction); await save(); res.status(201).json(transaction);
});
app.delete('/api/transactions/:id', async (req, res) => {
  const before = db.transactions.length; db.transactions = db.transactions.filter(t => String(t.id) !== req.params.id);
  if (db.transactions.length === before) return res.status(404).json({ error: 'Transaction not found.' });
  await save(); res.status(204).end();
});
app.get('/api/analytics', (_, res) => {
  const values = computed();
  const forecast = monthly.map((item, i) => ({ month: item.month, actual: item.spending, predicted: i < 5 ? null : Math.round((monthly.slice(-3).reduce((s,m)=>s+m.spending,0)/3) * 1.03) }));
  res.json({ ...values, monthly, forecast, fraud: suspiciousTransactions(), budget: db.settings.monthlyBudget, budgetRemaining: db.settings.monthlyBudget - values.spending });
});
app.get('/api/goals', (_, res) => res.json(db.goals));
app.post('/api/goals', async (req, res) => {
  const { name, target, deadline } = req.body;
  if (!name || !target || Number(target) <= 0) return res.status(400).json({ error: 'A goal name and positive target are required.' });
  const goal = { id: Date.now(), name, target: Number(target), current: 0, deadline: deadline || '', color: colors[db.goals.length % colors.length] };
  db.goals.push(goal); await save(); res.status(201).json(goal);
});
app.patch('/api/goals/:id', async (req, res) => {
  const goal = db.goals.find(g => String(g.id) === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found.' });
  if (req.body.contribution) goal.current = Math.min(goal.target, goal.current + Math.max(0, Number(req.body.contribution)));
  Object.assign(goal, Object.fromEntries(Object.entries(req.body).filter(([key]) => ['name','target','deadline'].includes(key))));
  await save(); res.json(goal);
});
app.delete('/api/goals/:id', async (req, res) => { db.goals = db.goals.filter(g => String(g.id) !== req.params.id); await save(); res.status(204).end(); });
app.get('/api/settings', (_, res) => res.json(db.settings));
app.patch('/api/settings', async (req, res) => { db.settings = { ...db.settings, ...req.body }; await save(); res.json(db.settings); });

app.post('/api/investment-plan', (req, res) => {
  const { age = 28, risk = 'Moderate', monthlyInvestment = 20000 } = req.body;
  const equity = risk === 'Aggressive' ? 70 : risk === 'Conservative' ? 35 : 55;
  const debt = risk === 'Aggressive' ? 20 : risk === 'Conservative' ? 50 : 30;
  const gold = 100 - equity - debt;
  const years = Math.max(5, 60 - Number(age));
  const rate = risk === 'Aggressive' ? .12 : risk === 'Conservative' ? .075 : .095;
  const months = years * 12;
  const projected = Math.round(Number(monthlyInvestment) * (((1 + rate / 12) ** months - 1) / (rate / 12)) * (1 + rate / 12));
  res.json({ allocation: [{ name: 'Equity funds', value: equity }, { name: 'Debt funds', value: debt }, { name: 'Gold', value: gold }], projected, invested: Number(monthlyInvestment) * months, years });
});

app.post('/api/chat', (req, res) => {
  const prompt = String(req.body.message || '').toLowerCase();
  const stats = computed();
  let reply = `Your savings rate is ${stats.savingsRate}%. Keep building your emergency fund, then direct surplus cash toward diversified investments.`;
  if (prompt.includes('spend') || prompt.includes('expense')) reply = `You have spent ₹${stats.spending.toLocaleString('en-IN')} in the tracked period. ${stats.categories[0]?.name || 'Essentials'} is your largest category at ${stats.categories[0]?.value || 0}%.`;
  if (prompt.includes('invest')) reply = `With a moderate risk profile, consider 55% equity funds, 30% debt funds, and 15% gold. Your current monthly surplus is about ₹${stats.savings.toLocaleString('en-IN')}.`;
  if (prompt.includes('save') || prompt.includes('goal')) reply = db.goals.length ? `${db.goals[0].name} is ${Math.round(db.goals[0].current/db.goals[0].target*100)}% complete. A monthly contribution of ₹${Math.ceil((db.goals[0].target-db.goals[0].current)/6).toLocaleString('en-IN')} would finish it in six months.` : 'Create your first savings goal and I will calculate a contribution plan.';
  if (prompt.includes('fraud') || prompt.includes('suspicious')) reply = suspiciousTransactions().length ? `I found ${suspiciousTransactions().length} transaction(s) worth reviewing in Analytics.` : 'I found no high-risk or duplicate transactions in your current activity.';
  res.json({ reply });
});

const port = process.env.PORT || 5001;
if (process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI).catch(error => console.error('MongoDB connection failed:', error.message));
app.listen(port, '127.0.0.1', () => console.log(`FinGenius API running on http://127.0.0.1:${port}`));
