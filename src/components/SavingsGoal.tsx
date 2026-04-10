import React, { useState } from 'react';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { SavingsGoal, User } from '../types';
import { formatCurrency } from '../utils';
import { format } from 'date-fns';

interface SavingsGoalProps {
  goal: SavingsGoal | null;
  onUpdate: (goal: SavingsGoal) => void;
  user?: User;
}

export const SavingsGoalTracker: React.FC<SavingsGoalProps> = ({ goal, onUpdate, user }) => {
  const [isEditing, setIsEditing] = useState(!goal);
  const [name, setName] = useState(goal?.name || '');
  const [target, setTarget] = useState(goal?.targetAmount.toString() || '');
  const [current, setCurrent] = useState(goal?.currentAmount.toString() || '');
  const [deadline, setDeadline] = useState(goal?.deadline || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      name,
      targetAmount: parseFloat(target),
      currentAmount: parseFloat(current),
      deadline,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          {goal ? 'Edit Savings Goal' : 'Set a Savings Goal'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
              <input type="text" required className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="New Car, Vacation, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount</label>
              <input type="number" required className="input-field" value={target} onChange={e => setTarget(e.target.value)} placeholder="5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Savings</label>
              <input type="number" required className="input-field" value={current} onChange={e => setCurrent(e.target.value)} placeholder="1000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
              <input type="date" required className="input-field" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">Save Goal</button>
            {goal && <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>}
          </div>
        </form>
      </div>
    );
  }

  if (!goal) return null;

  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  const getProgressColor = (p: number) => {
    if (p < 25) return 'bg-red-500';
    if (p < 50) return 'bg-amber-500';
    if (p < 75) return 'bg-emerald-700';
    return 'bg-emerald-900';
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{goal.name}</h3>
          <p className="text-sm text-slate-500 flex items-center mt-1">
            <Calendar className="w-3 h-3 mr-1" />
            Target: {format(new Date(goal.deadline), 'MMM d, yyyy')}
          </p>
        </div>
        <button onClick={() => setIsEditing(true)} className="text-sm text-slate-600 hover:text-slate-900 font-medium">
          Edit Goal
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-slate-600">Progress</span>
          <span className="text-slate-900">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor(progress)} transition-all duration-500`} 
            style={{width: `${Math.min(progress, 100)}%`}} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 p-3 rounded-xl">
            <span className="text-xs text-emerald-900 block mb-1">Saved</span>
            <span className="text-lg font-bold text-emerald-900">{formatCurrency(goal.currentAmount, user?.currency)}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <span className="text-xs text-emerald-900 block mb-1">Remaining</span>
            <span className="text-lg font-bold text-emerald-900">{formatCurrency(goal.targetAmount - goal.currentAmount, user?.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
