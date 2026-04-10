import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-emerald-900 flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-white/10">
          <Wallet className="text-emerald-900 w-10 h-10" />
        </div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl font-bold text-white tracking-tight"
        >
          Money Pilot
        </motion.h1>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
          className="h-1 bg-white/20 rounded-full mt-8 overflow-hidden"
        >
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="h-full w-full bg-white"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
