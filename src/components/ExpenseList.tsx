import React from 'react';
import { Expense, User } from '../types';
import { formatCurrency } from '../utils';
import { Trash2, ShoppingBag, Utensils, Car, Heart, FileText, MoreHorizontal, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  user?: User;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food': return <Utensils className="w-4 h-4" />;
    case 'Transport': return <Car className="w-4 h-4" />;
    case 'Shopping': return <ShoppingBag className="w-4 h-4" />;
    case 'Health': return <Heart className="w-4 h-4" />;
    case 'Bills': return <Zap className="w-4 h-4" />;
    case 'Entertainment': return <FileText className="w-4 h-4" />;
    default: return <MoreHorizontal className="w-4 h-4" />;
  }
};

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, user }) => {
  const sortedExpenses = [...expenses].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">{expenses.length} total recorded</p>
        </div>
        <div className="bg-emerald-900 text-white px-4 py-2 rounded-xl flex flex-col items-end shadow-lg shadow-emerald-900/10">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Total Value</span>
          <span className="text-lg font-bold">{formatCurrency(totalAmount, user?.currency)}</span>
        </div>
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-50">
              <th className="px-6 py-4 font-medium">Transaction</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{expense.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-slate-500 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-3 text-emerald-900">
                      {getCategoryIcon(expense.category)}
                    </div>
                    {expense.category}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {format(parseISO(expense.date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-slate-900">
                  {formatCurrency(expense.amount, user?.currency)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onDelete(expense.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-slate-50">
        {sortedExpenses.map((expense) => (
          <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-emerald-50/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-900 flex-shrink-0">
                {getCategoryIcon(expense.category)}
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">{expense.description}</div>
                <div className="text-xs text-slate-500">{format(parseISO(expense.date), 'MMM d, yyyy')}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="font-bold text-slate-900">{formatCurrency(expense.amount, user?.currency)}</div>
              <button 
                onClick={() => onDelete(expense.id)}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="px-6 py-12 text-center text-slate-400 italic">
          No transactions found. Add your first expense to get started!
        </div>
      )}
    </div>
  );
};

