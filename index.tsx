import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  Sparkles, 
  LogOut, 
  Plus,
  Menu,
  X,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Expense, SavingsGoal, User } from './src/types';
import { Dashboard } from './src/components/Dashboard';
import { ExpenseList } from './src/components/ExpenseList';
import { SavingsGoalTracker } from './src/components/SavingsGoal';
import { AIAdvisor } from './src/components/AIAdvisor';
import { Settings } from './src/components/Settings';
import { AddExpenseModal } from './src/components/AddExpenseModal';
import { Login } from './src/components/Login';
import { LoadingScreen } from './src/components/LoadingScreen';
import { cn } from './src/utils';
import { supabase, getSupabase } from './src/lib/supabase';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isTimerLoading, setIsTimerLoading] = useState(true);
  const [isConfigMissing, setIsConfigMissing] = useState(false);
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'goals' | 'ai' | 'settings'>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Supabase Auth Listener & Guest Persistence
  useEffect(() => {
    const sb = getSupabase();
    
    // Check for guest user first
    const savedGuest = localStorage.getItem('money_pilot_guest_session');
    if (savedGuest) {
      setUser(JSON.parse(savedGuest));
      setIsAuthLoading(false);
      return;
    }

    if (!sb) {
      setIsConfigMissing(true);
      setIsAuthLoading(false);
      return;
    }

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.full_name || 'User',
          income: session.user.user_metadata.income,
          currency: session.user.user_metadata.currency || 'USD',
          customCategories: session.user.user_metadata.custom_categories || []
        });
      } else {
        // Only clear if not a guest
        setUser(prev => prev?.id === 'guest_user_id' ? prev : null);
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Minimum loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimerLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Combined loading state
  useEffect(() => {
    if (!isAuthLoading && !isTimerLoading) {
      setIsLoading(false);
    }
  }, [isAuthLoading, isTimerLoading]);


  // Fetch Data from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const sb = getSupabase();
      
      if (!sb || user.id === 'guest_user_id') {
        // Fallback to local storage
        const localExpenses = localStorage.getItem(`expenses_${user.id}`);
        if (localExpenses) setExpenses(JSON.parse(localExpenses));
        const localGoal = localStorage.getItem(`goal_${user.id}`);
        if (localGoal) setSavingsGoal(JSON.parse(localGoal));
        setIsLoading(false);
        return;
      }

      try {
        // Fetch User Profile Metadata
        const { data: { user: authUser } } = await sb.auth.getUser();
        if (authUser?.user_metadata) {
          setUser(prev => prev ? ({
            ...prev,
            name: authUser.user_metadata.full_name || prev.name,
            income: authUser.user_metadata.income,
            currency: authUser.user_metadata.currency,
            customCategories: authUser.user_metadata.custom_categories || []
          }) : null);
        }

        // Fetch Expenses
        const { data: expensesData, error: expensesError } = await sb
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        if (expensesError) throw expensesError;
        if (expensesData) setExpenses(expensesData);

        // Fetch Savings Goal
        const { data: goalsData, error: goalsError } = await sb
          .from('savings_goals')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (goalsError && goalsError.code !== 'PGRST116') throw goalsError; // PGRST116 is "no rows found"
        if (goalsData) setSavingsGoal(goalsData);
      } catch (err: any) {
        console.error("Data fetch error:", err);
        // Fallback to local storage for ANY error to ensure the app remains usable
        const localExpenses = localStorage.getItem(`expenses_${user.id}`);
        if (localExpenses) setExpenses(JSON.parse(localExpenses));
        const localGoal = localStorage.getItem(`goal_${user.id}`);
        if (localGoal) setSavingsGoal(JSON.parse(localGoal));
        
        if (err.message === 'Failed to fetch' || err.code === 'PGRST301' || err.code === '42501' || err.code === '42P01') {
          toast.info('Working in offline mode.');
        } else {
          toast.info('Unable to sync with cloud. Using local data.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogin = (userData: { name: string; email: string; id: string }) => {
    const newUser = {
      ...userData,
      customCategories: []
    };
    setUser(newUser);
    
    // Persist guest session
    if (userData.id === 'guest_user_id') {
      localStorage.setItem('money_pilot_guest_session', JSON.stringify(newUser));
    }
  };

  const handleUpdateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const sb = getSupabase();
    
    // Update local state immediately
    const newUser = { ...user, ...updates };
    setUser(newUser);
    localStorage.setItem(`user_${user.id}`, JSON.stringify(newUser));

    if (!sb) {
      toast.success('Profile updated locally');
      return;
    }
    
    try {
      // Update Supabase Metadata
      const { error } = await sb.auth.updateUser({
        data: {
          full_name: newUser.name,
          income: newUser.income,
          currency: newUser.currency,
          custom_categories: newUser.customCategories
        }
      });
      
      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.error("Update user error:", err);
      // Fallback message for any error
      if (err.message === 'Failed to fetch' || err.code === 'PGRST301' || err.code === '42501') {
        toast.info('Working in offline mode. Changes saved locally.');
      } else {
        toast.info('Unable to sync profile with cloud. Changes saved locally.');
      }
    }
  };

  const handleLogout = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    
    // Clear guest session
    localStorage.removeItem('money_pilot_guest_session');
    setUser(null);
  };

  const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
    if (!user) return;
    const sb = getSupabase();

    // Always use local storage for guest users or if Supabase is not configured
    if (!sb || user.id === 'guest_user_id') {
      const localExpense = { ...newExpense, id: Math.random().toString(36).substr(2, 9) };
      const updatedExpenses = [localExpense, ...expenses];
      setExpenses(updatedExpenses);
      localStorage.setItem(`expenses_${user.id}`, JSON.stringify(updatedExpenses));
      toast.success('Expense saved locally');
      return;
    }

    try {
      const { data, error } = await sb
        .from('expenses')
        .insert([{ ...newExpense, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setExpenses([data, ...expenses]);
        toast.success('Expense added successfully');
      }
    } catch (err: any) {
      console.error("Add expense error:", err);
      // Fallback to local storage on network error or permission issues for non-guest users
      if (err.message === 'Failed to fetch' || err.code === 'PGRST301' || err.code === '42501') {
        const localExpense = { ...newExpense, id: Math.random().toString(36).substr(2, 9) };
        const updatedExpenses = [localExpense, ...expenses];
        setExpenses(updatedExpenses);
        localStorage.setItem(`expenses_${user.id}`, JSON.stringify(updatedExpenses));
        toast.info('Working in offline mode. Saved locally.');
      } else {
        toast.error('Failed to add expense. Please try again.');
      }
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;
    const sb = getSupabase();

    if (!sb || user.id === 'guest_user_id') {
      const updatedExpenses = expenses.filter(e => e.id !== id);
      setExpenses(updatedExpenses);
      localStorage.setItem(`expenses_${user.id}`, JSON.stringify(updatedExpenses));
      toast.success('Expense removed locally');
      return;
    }

    try {
      const { error } = await sb
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success('Expense deleted successfully');
    } catch (err: any) {
      console.error("Delete expense error:", err);
      if (err.message === 'Failed to fetch' || err.code === 'PGRST301' || err.code === '42501') {
        const updatedExpenses = expenses.filter(e => e.id !== id);
        setExpenses(updatedExpenses);
        localStorage.setItem(`expenses_${user.id}`, JSON.stringify(updatedExpenses));
        toast.info('Working in offline mode. Removed locally.');
      } else {
        toast.error('Failed to delete expense.');
      }
    }
  };

  const updateSavingsGoal = async (goal: SavingsGoal) => {
    if (!user) return;
    const sb = getSupabase();

    if (!sb || user.id === 'guest_user_id') {
      setSavingsGoal(goal);
      localStorage.setItem(`goal_${user.id}`, JSON.stringify(goal));
      toast.success('Goal updated locally');
      return;
    }

    try {
      const { data, error } = await sb
        .from('savings_goals')
        .upsert({ ...goal, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSavingsGoal(data);
        toast.success('Savings goal updated');
      }
    } catch (err: any) {
      console.error("Update savings goal error:", err);
      if (err.message === 'Failed to fetch' || err.code === 'PGRST301' || err.code === '42501') {
        setSavingsGoal(goal);
        localStorage.setItem(`goal_${user.id}`, JSON.stringify(goal));
        toast.info('Working in offline mode. Updated locally.');
      } else {
        toast.error('Failed to update savings goal.');
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'ai', label: 'AI Advisor', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Wallet },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden relative">
      <Toaster position="top-right" richColors />
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-emerald-950 border-r border-white/5 transition-all duration-300 flex flex-col z-50 shadow-2xl relative overflow-hidden",
          isMobile ? (isSidebarOpen ? "fixed inset-y-0 left-0 w-64" : "fixed inset-y-0 -left-64 w-64") : (isSidebarOpen ? "w-64" : "w-20")
        )}
      >
        {/* Background Gradient & Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="p-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-white/10">
              <Wallet className="text-emerald-950 w-5 h-5" />
            </div>
            {(isSidebarOpen || isMobile) && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl tracking-tight text-white"
              >
                Money Pilot
              </motion.span>
            )}
          </div>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 relative z-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-white text-emerald-950 shadow-xl shadow-white/5" 
                  : "text-emerald-100/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                activeTab === item.id ? "scale-110" : "group-hover:scale-110"
              )} />
              {(isSidebarOpen || isMobile) && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 space-y-2 relative z-10">
          {(isSidebarOpen || isMobile) && (
            <div className="px-4 py-3 mb-2 flex items-center gap-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-full bg-emerald-900 border border-white/10 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group",
              (!isSidebarOpen && !isMobile) && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            {(isSidebarOpen || isMobile) && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && !isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Open Sidebar"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
            )}
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <div className="flex flex-col">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 capitalize leading-tight">{activeTab}</h2>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider hidden sm:block">Money Pilot / {activeTab}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center gap-2 px-3 md:px-4"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-600 text-sm md:text-base">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && <Dashboard expenses={expenses} user={user} />}
                {activeTab === 'expenses' && <ExpenseList expenses={expenses} onDelete={deleteExpense} user={user} />}
                {activeTab === 'goals' && <SavingsGoalTracker goal={savingsGoal} onUpdate={updateSavingsGoal} user={user} />}
                {activeTab === 'ai' && <AIAdvisor expenses={expenses} savingsGoal={savingsGoal} user={user} />}
                {activeTab === 'settings' && <Settings user={user} onUpdateUser={handleUpdateUser} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>


      <AddExpenseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addExpense} 
        customCategories={user.customCategories}
      />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  // @ts-ignore
  if (!window._root) {
    // @ts-ignore
    window._root = ReactDOM.createRoot(rootElement);
  }
  // @ts-ignore
  window._root.render(<React.StrictMode><App /></React.StrictMode>);
}
