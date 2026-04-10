import {supabase} from '../lib/supabase';
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Expense, Category } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  customCategories?: string[];
}

const DEFAULT_CATEGORIES: Category[] = ['Food', 'Transport', 'Entertainment', 'Health', 'Bills', 'Shopping', 'Other'];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAdd, customCategories = [] }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];
  const handlleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense = {
      amount: parseFloat(amount),
      category,
      description,
      date,
    };
    onAdd(newExpense);
    const { data, error } = await supabase
    .from ('expenses')
    .insert ([newExpense]);
    if (error) {      console.error('Error adding expense:', error);
    } else {
      console.log('Expense added successfully:', data);
    }
    onAdd(newExpense);
    setAmount('');
    setDescription('');
    onClose();
  };
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      amount: parseFloat(amount),
      category,
      description,
      date,
    });
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add Expense</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
            <input 
              type="number" 
              step="0.01" 
              required 
              className="input-field" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input 
              type="text" 
              required 
              className="input-field" 
              placeholder="Lunch at Joe's"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input 
              type="date" 
              required 
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3 mt-4">
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
};
