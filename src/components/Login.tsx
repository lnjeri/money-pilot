import React, { useState } from 'react';
import { LogIn, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSupabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (user: { name: string; email: string; id: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) {
      setError('Supabase is not configured. Please check environment variables.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const { data, error: signUpError } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          onLogin({ 
            name: data.user.user_metadata.full_name || 'User', 
            email: data.user.email!,
            id: data.user.id
          });
        }
      } else {
        const { data, error: signInError } = await sb.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) {
          onLogin({ 
            name: data.user.user_metadata.full_name || 'User', 
            email: data.user.email!,
            id: data.user.id
          });
        }
      }
    } catch (err: any) {
      let message = err.message || 'An error occurred during authentication';
      
      // Handle common network/config errors
      if (message === 'Failed to fetch') {
        message = 'Unable to connect to our services. Please try again in a few minutes.';
      } else if (message.toLowerCase().includes('api key') || message.toLowerCase().includes('invalid key')) {
        message = 'Service temporarily unavailable. Please try again later.';
      } else if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('too many requests')) {
        message = 'Too many sign-up attempts. Please try again in an hour or use "Continue as Guest" below.';
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    onLogin({
      name: 'Guest User',
      email: 'guest@moneypilot.local',
      id: 'guest_user_id'
    });
  };

  const sb = getSupabase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <LogIn className="text-white w-8 h-8" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-emerald-900 tracking-tight">
            Money Pilot
          </h1>
          <p className="text-slate-500 mt-2">
            {isRegistering ? 'Start managing your finances today' : 'Log in to track your expenses'}
          </p>
        </div>

        {!sb ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-900 text-sm text-center">
              We're currently in preview mode. You can continue as a guest to explore the features.
            </div>
            <button 
              onClick={handleGuestLogin}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              Continue as Guest
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}
              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="input-field" 
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="input-field" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  className="input-field" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  isRegistering ? 'Sign Up' : 'Log In'
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-center">
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </button>
              
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400">Or</span>
                </div>
              </div>

              <button 
                onClick={handleGuestLogin}
                className="text-sm text-emerald-700 hover:text-emerald-900 font-bold py-2 px-4 rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
