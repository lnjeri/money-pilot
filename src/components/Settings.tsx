import React, { useState } from 'react';
import { User, Camera, Plus, X, Tag } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsProps {
  user: UserType;
  onUpdateUser: (updates: Partial<UserType>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [income, setIncome] = useState(user.income?.toString() || '');
  const [currency, setCurrency] = useState(user.currency || 'USD');
  const [newCategory, setNewCategory] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ 
      name, 
      profileImage, 
      income: income ? parseFloat(income) : undefined,
      currency: currency as any
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const currentCategories = user.customCategories || [];
    if (currentCategories.includes(newCategory.trim())) return;
    
    onUpdateUser({ 
      customCategories: [...currentCategories, newCategory.trim()] 
    });
    setNewCategory('');
  };

  const handleRemoveCategory = (cat: string) => {
    onUpdateUser({ 
      customCategories: (user.customCategories || []).filter(c => c !== cat) 
    });
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-bold mb-6">Profile Settings</h3>
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-slate-100 overflow-hidden flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-emerald-900" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-2 bg-emerald-900 text-white rounded-xl cursor-pointer shadow-lg hover:bg-emerald-950 transition-colors">
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Income (Optional)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0.00"
                    value={income} 
                    onChange={(e) => setIncome(e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select 
                    className="input-field"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">US Dollar ($)</option>
                    <option value="KES">Kenyan Shilling (KES)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image URL (Alternative)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="https://example.com/photo.jpg"
                    value={profileImage} 
                    onChange={(e) => setProfileImage(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold mb-6">Custom Categories</h3>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              className="input-field pl-10" 
              placeholder="Add new category (e.g. Subscriptions)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {(user.customCategories || []).map(cat => (
            <div key={cat} className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl text-sm font-medium text-emerald-900 border border-emerald-100 max-w-full">
              <span className="truncate max-w-[120px] sm:max-w-[200px]" title={cat}>{cat}</span>
              <button 
                onClick={() => handleRemoveCategory(cat)}
                className="hover:text-red-500 transition-colors flex-shrink-0"
                aria-label={`Remove ${cat}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {(user.customCategories || []).length === 0 && (
            <p className="text-sm text-slate-400 italic">No custom categories added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
