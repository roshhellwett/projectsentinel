'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      className="fixed inset-0 z-[100] bg-[#fafafa] flex items-center justify-center"
    >
      <div className="relative">
        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2 text-slate-600">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
            </motion.div>
            <span className="text-sm font-semibold">Loading verified news...</span>
          </div>

          {/* Progress bar */}
          <div className="w-64 h-1 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
            />
          </div>
        </motion.div>

        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
