import React, { useState } from 'react';
import { Sparkles, Brain, Lightbulb, RefreshCw, TrendingUp } from 'lucide-react';
import { getFinancialAdvice } from '../services/gemini';
import { Expense, SavingsGoal, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAdvisorProps {
  expenses: Expense[];
  savingsGoal: SavingsGoal | null;
  user?: User;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ expenses, savingsGoal, user }) => {
  const [advice, setAdvice] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetAdvice = async () => {
    if (expenses.length === 0) return;
    setIsLoading(true);
    try {
      const result = await getFinancialAdvice(expenses, savingsGoal, user?.income, user?.currency);
      if (result && result.advice && result.advice.length > 0) {
        setAdvice(result.advice);
      } else {
        setAdvice(["I couldn't generate specific advice right now. Try adding more transaction details!"]);
      }
    } catch (error) {
      console.error("Failed to get advice:", error);
      setAdvice(["Sorry, I encountered an error while analyzing your finances. Please try again later."]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6 bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mr-4">
            <Sparkles className="w-6 h-6 text-emerald-900" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-900">AI Financial Advisor</h3>
            <p className="text-sm text-emerald-900/70">Personalized insights based on your spending</p>
          </div>
        </div>
        <button 
          onClick={handleGetAdvice} 
          disabled={isLoading || expenses.length === 0}
          className="p-3 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50 text-slate-600"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <div className="flex justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-emerald-900 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <div className="w-3 h-3 bg-emerald-900 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <div className="w-3 h-3 bg-emerald-900 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
              <p className="text-base font-medium text-slate-600">Analyzing your financial patterns...</p>
            </motion.div>
          ) : advice.length > 0 ? (
            <motion.div 
              key="advice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {advice.map((item, index) => (
                <div key={index} className="flex items-start bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="mt-1 mr-4 flex-shrink-0">
                    {index === 0 ? <Brain className="w-5 h-5 text-emerald-900" /> : 
                     index === 1 ? <Lightbulb className="w-5 h-5 text-amber-600" /> : 
                     <TrendingUp className="w-5 h-5 text-emerald-900" />}
                  </div>
                  <p className="text-base leading-relaxed text-emerald-900 font-medium">{item}</p>
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-base text-slate-500 mb-6 px-8">
                {expenses.length === 0 
                  ? "Add some expenses first to get personalized financial advice." 
                  : "Click the refresh icon to get AI-powered insights on your spending."}
              </p>
              {expenses.length > 0 && (
                <button 
                  onClick={handleGetAdvice}
                  className="btn-primary"
                >
                  Generate Insights
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

