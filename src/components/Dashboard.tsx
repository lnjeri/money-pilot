import{useEffect, useState} from 'react'; 
import { supabase } from '../lib/supabase';
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Expense, User } from '../types';
import { formatCurrency, cn } from '../utils';
import { format, startOfDay, subDays, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { TrendingUp, CreditCard, PiggyBank, Activity, History } from 'lucide-react';
import { sync } from 'framer-motion';

interface DashboardProps {
  expenses: Expense[];
  user?: User;
}

const COLORS = ['#022c22', '#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399'];

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-bold text-emerald-900">
          {formatCurrency(payload[0].value, currency)}
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ expenses:intialExpenses, user: initialUser }) => {
 const [expenses, setExpenses] = useState<Expense[]>(intialExpenses);
const [user, setUser] = useState<User | undefined>(initialUser);

useEffect(() => {
  const syncWithCloud = async () => {
    const { data: expenseData, error: expError } = await supabase
      .from('expenses')
      .select('*');
    
    if (expenseData) {
      setExpenses(expenseData);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id);
      
      if (profileData) {
        setUser(prev => ({
          ...prev,
          currency: profileData[0].currency,
          avatar_url: profileData[0].avatar_url
        }));
      }
    }
  };
  syncWithCloud();
}, []); // ← Add empty dependency array to prevent infinite loops

if (!user) {
  return null; // or a loading state
}

// Daily spending for the last 7 days
const last7Days = eachDayOfInterval({
  start: subDays(new Date(), 6),
  end: new Date(),
}).map(date => {
  const dayTotal = expenses
    .filter(e => isSameDay(parseISO(e.date), date))
    .reduce((sum, e) => sum + e.amount, 0);
  return {
    name: format(date, 'EEE'),
    amount: dayTotal,
  };
});

 

  // Category distribution
  <div className="card p-6">
  <h3 className="text-lg font-bold mb-6">Spending by Category</h3>
  
  {expenses.length === 0 ? (
    // This is the "Empty State" UI
    <div className="h-64 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
        <TrendingUp className="w-6 h-6 text-slate-300" />
      </div>
      <p className="text-sm font-medium text-slate-500">No data to categorize</p>
      <p className="text-[10px] text-slate-400 mt-1 px-4">Your spending breakdown will appear here once you add expenses.</p>
    </div>
  ) : (
    // This is your existing Chart logic
    <div className="h-64 flex flex-col sm:flex-row items-center">
       {/* ... your ResponsiveContainer and PieChart code ... */}
    </div>
  )}
</div>

  const categoryData = expenses.reduce((acc: any[], expense) => {
    const existing = acc.find(a => a.name.toLowerCase() === expense.category.toLowerCase());
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, []);

  // Daily spending for the last 30 days (Monthly Trend)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  }).map(date => {
    const dayTotal = expenses
      .filter(e => isSameDay(parseISO(e.date), date))
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      date: format(date, 'MMM d'),
      amount: dayTotal,
    };
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const spentToday = expenses
    .filter(e => isSameDay(parseISO(e.date), new Date()))
    .reduce((sum, e) => sum + e.amount, 0);
  const avgDailySpend = totalSpent / 30;
  const threshold = avgDailySpend * 1.5; // 50% above average is "beyond normal"

  const income = user?.income || 0;
  const savingsRate = income > 0 ? ((income - totalSpent) / income) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-900 tracking-tight">
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your money today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 group hover:border-emerald-200 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-900 group-hover:bg-emerald-900 group-hover:text-white transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{format(new Date(), 'MMM do')}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Spent Today</h3>
          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(spentToday, user?.currency)}</p>
          {income > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    spentToday > (income / 30) ? "bg-red-500" : "bg-emerald-900"
                  )}
                  style={{ width: `${Math.min((spentToday / (income / 30)) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-slate-400">
                {((spentToday / (income / 30)) * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        <div className="card p-6 group hover:border-emerald-200 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-900 group-hover:bg-emerald-900 group-hover:text-white transition-colors">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Active</span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Spending</h3>
          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(totalSpent, user?.currency)}</p>
        </div>

        {income > 0 && (
          <div className="card p-6 group hover:border-emerald-200 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-900 group-hover:bg-emerald-900 group-hover:text-white transition-colors">
                <PiggyBank className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-full">{savingsRate.toFixed(0)}% Rate</span>
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Monthly Savings</h3>
            <p className="text-2xl font-bold text-emerald-900">{formatCurrency(income - totalSpent, user?.currency)}</p>
          </div>
        )}

        <div className="card p-6 group hover:border-emerald-200 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-900 group-hover:bg-emerald-900 group-hover:text-white transition-colors">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">30 Days</span>
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Avg. Daily Spend</h3>
          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(avgDailySpend, user?.currency)}</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold mb-6">Monthly Spending Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last30Days}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#064e3b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#064e3b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 10}}
                interval={4}
              />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip content={<CustomTooltip currency={user?.currency} />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#064e3b" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-6">Weekly Spending</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#065f46" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#064e3b" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="barGradientWarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  content={<CustomTooltip currency={user?.currency} />}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} animationDuration={1500}>
                  {last7Days.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.amount > threshold ? 'url(#barGradientWarning)' : 'url(#barGradient)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-6">Spending by Category</h3>
          <div className="h-64 flex flex-col sm:flex-row items-center">
            <div className="w-full sm:w-2/3 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip currency={user?.currency} />}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-lg font-bold text-emerald-900">{formatCurrency(totalSpent, user?.currency)}</span>
              </div>
            </div>
            <div className="w-full sm:w-1/3 mt-4 sm:mt-0 space-y-3 max-h-32 sm:max-h-none overflow-y-auto px-2">
              {categoryData.sort((a, b) => b.value - a.value).slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex flex-col gap-0.5">
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                    <span className="text-slate-600 truncate font-medium">{item.name}</span>
                    <span className="ml-auto font-bold text-emerald-900">{formatCurrency(item.value, user?.currency)}</span>
                  </div>
                  <div className="ml-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-900/20 rounded-full"
                      style={{ width: `${(item.value / totalSpent * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
