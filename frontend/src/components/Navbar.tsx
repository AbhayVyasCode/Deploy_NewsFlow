import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Settings, Search, Video, Sparkles, Home, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/feed', label: 'Feed', icon: Newspaper },
    { href: '/trends', label: 'Trends', icon: TrendingUp },
    { href: '/videos', label: 'Videos', icon: Video },
    { href: '/tools', label: 'AI Tools', icon: Sparkles },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <Newspaper className="w-8 h-8" />
            </motion.div>
            <span className="hidden md:inline">NewsFlow</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 md:gap-2 lg:gap-4 overflow-x-auto no-scrollbar">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "relative px-3 md:px-4 py-2 rounded-full flex items-center gap-2 transition-colors shrink-0",
                      isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="hidden md:inline font-medium text-special">{link.label}</span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="pl-4 border-l border-border hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
