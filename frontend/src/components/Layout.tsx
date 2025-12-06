import React from 'react';
import Navbar from './Navbar';
import ChatWidget from './ChatWidget';
import ThreeBackground from './ThreeBackground';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <ThreeBackground />
      <Navbar />
      <main className="container mx-auto px-4 pb-24 pt-8 md:pt-24 md:pb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
      <ChatWidget />
    </div>
  );
};

export default Layout;
