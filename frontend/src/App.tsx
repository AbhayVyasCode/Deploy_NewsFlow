import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Trends = lazy(() => import('./pages/Trends'));
const SearchPage = lazy(() => import('./pages/Search'));
const Settings = lazy(() => import('./pages/Settings'));
const HindiNews = lazy(() => import('./pages/HindiNews'));
const Videos = lazy(() => import('./pages/Videos'));
const ArticleTools = lazy(() => import('./pages/ArticleTools'));

const PageLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/hindi" element={<HindiNews />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/tools" element={<ArticleTools />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
