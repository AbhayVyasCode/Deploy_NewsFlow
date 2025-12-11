import { motion } from 'framer-motion';
import { ArrowRight, Globe, Zap, Shield, Sparkles } from 'lucide-react';
import Hero3D from '../components/Hero3D';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
        <Hero3D />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 fill-primary" />
          <span>Next Generation News Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-400 dark:from-white dark:via-gray-200 dark:to-gray-500 drop-shadow-2xl"
        >
          NewsFlow
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Experience the future of news. <span className="font-semibold text-red-600 dark:text-red-500">AI-curated,</span> real-time, and immersive. 
          Stay ahead of the curve with our intelligent insights.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link to="/feed">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              Start Exploring <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link to="/tools">
             <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-secondary/80 text-foreground rounded-full font-bold text-lg border border-white/10 hover:bg-secondary transition-all backdrop-blur-md"
            >
              View AI Tools
            </motion.button>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left"
        >
             {[
                { icon: Globe, title: "Global Coverage", desc: "Real-time updates from trusted sources worldwide." },
                { icon: Zap, title: "AI Powered", desc: "Smart summaries and sentiment analysis for every story." },
                { icon: Shield, title: "Verified Sources", desc: "Curated content ensuring accuracy and reliability." }
             ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                        <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-special">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
             ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
