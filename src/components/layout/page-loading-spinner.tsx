'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function PageLoadingSpinner({ message }: { message?: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 py-28"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
        <div
          className="absolute inset-1 animate-spin rounded-full border-4 border-transparent border-b-accent opacity-70"
          style={{ animationDuration: '0.7s', animationDirection: 'reverse' }}
        />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </motion.div>
  );
}
