import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Briefcase, 
  Cpu, 
  Shield, 
  Database, 
  ChevronRight, 
  Terminal,
  Sparkles, 
  Loader2,
  RefreshCw
} from 'lucide-react';

/**
 * PRODUCTION CONSOLIDATED BUILD
 * Includes: 
 * - Multi-token whitespace skill splitting
 * - Dynamic Hot Skills frequency analysis
 * - Type-safe Badge variant indexing
 * - Mobile-optimized header and grid
 */

// --- TYPES ---

interface Job {
  job_title?: string;
  specialization?: string;
  required_skills: string;
  entry_level_salary_est?: string;
  difficulty?: string;
  job_description?: string;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'indigo' | 'skill';
  onClick?: () => void;
  className?: string;
}

// --- SUB-COMPONENTS ---

const Badge = ({ children, variant = "default", onClick, className = "" }: BadgeProps) => {
  const variants: Record<string, string> = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-rose-50 text-rose-700 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    skill: "bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 shadow-sm transition-all cursor-pointer font-bold"
  };
  
  // Type-safe lookup to prevent TS errors in local dev
  const activeStyle = variants[variant as keyof typeof variants] || variants.default;

  return (
    <span 
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest border ${activeStyle} ${className}`}
    >
      {children}
    </span>
  );
};

// --- MAIN APPLICATION ---

export default function App() {
  // State Management
  const [skill, setSkill] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 9;

  // Dynamic Hot Skills: Calculates top 5 skills based on currently loaded job data
  const hotSkills = useMemo(() => {
    if (jobs.length === 0) return ['C++', 'PYTHON', 'RTOS', 'DOCKER', 'FPGA'];
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      const skills = job.required_skills.split(/\s+/).filter(Boolean);
      skills.forEach(s => {
        const clean = s.trim().replace(/[,;]/g, "").toUpperCase();
        if (clean) counts[clean] = (counts[clean] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  }, [jobs]);

  // Data Actions
  const fetchJobs = async (pageNumber: number, isInitial = false) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/all_jobs?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`);
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
      const data = await res.json();

      setJobs(prev => {
        if (isInitial) return data;
        // Logic to prevent duplicate items if fetching the same page twice
        const existingTitles = new Set(prev.map(j => j.job_title));
        return [...prev, ...data.filter((j: Job) => !existingTitles.has(j.job_title))];
      });
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async (query: string) => {
    if (!query.trim()) return resetFilters();
    setIsSearching(true);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/search_jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: query })
      });
      const data = await res.json();
      setJobs(data);
      setHasMore(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSkill("");
    setIsSearching(false);
    setPage(1);
    setHasMore(true);
    fetchJobs(1, true);
  };

  const handleQuickSearch = (s: string) => {
    setSkill(s);
    executeSearch(s);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchJobs(next);
  };

  // Lifecycle
  useEffect(() => {
    fetchJobs(1, true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans antialiased">
      {/* Sticky Glass Header */}
      <header className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 p-1.5 rounded-lg shadow-sm">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-lg tracking-tight text-slate-900">
              CareerCompass
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isSearching && (
              <button 
                onClick={resetFilters} 
                className="text-[9px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full transition-all border border-indigo-100 shadow-sm"
              >
                <RefreshCw className="w-3 h-3" /> <span>Reset</span>
              </button>
            )}
            <Badge variant="indigo" className="text-[9px] sm:text-[10px] px-2 py-1">
              SQL: {jobs.length}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Hero Section */}
        <section className="text-center mb-10 md:mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 leading-tight">
            Map your toolkit to <br className="sm:hidden" />
            <span className="text-indigo-600 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Industry.</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-base md:text-lg font-medium px-4">
            A specialized roadmap for CpE students. Click any box below to filter results based on individual technologies.
          </p>
        </section>

        {/* Search Control Panel */}
        <section className="max-w-2xl mx-auto mb-12 px-2">
          <form 
            onSubmit={(e) => { e.preventDefault(); executeSearch(skill); }} 
            className="relative group"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className={`w-5 h-5 transition-colors ${loading ? 'text-indigo-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
            </div>
            <input 
              type="text"
              placeholder="Search skills (e.g. 'Python')..."
              className="w-full pl-12 pr-28 md:pr-32 py-4 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-base md:text-lg"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              <button 
                type="submit" 
                disabled={loading} 
                className="h-full bg-slate-900 text-white px-4 md:px-6 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:bg-slate-300"
              >
                {loading && !jobs.length ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </div>
          </form>
          
          {/* Dynamic Hot Skills row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dynamic Hot Skills:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {hotSkills.map(s => (
                <Badge key={s} variant="skill" onClick={() => handleQuickSearch(s)}>
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Career Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, idx) => (
            <div key={`${job.job_title}-${idx}`} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  {job.specialization === 'Hardware' ? <Cpu className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" /> :
                   job.specialization === 'Data Science' ? <Database className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" /> :
                   job.specialization === 'Networks' ? <Shield className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" /> :
                   <Briefcase className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />}
                </div>
                <Badge variant={job.difficulty === 'Very High' ? 'error' : job.difficulty === 'High' ? 'warning' : 'success'}>
                  {job.difficulty || "Standard"}
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight tracking-tight">{job.job_title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                {job.job_description}
              </p>

              {/* INDIVIDUAL SKILL BOXES: Tokenized by whitespace */}
              <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                {job.required_skills ? job.required_skills.split(/\s+/).filter(Boolean).map((s, i) => (
                  <Badge 
                    key={i} 
                    variant="skill"
                    onClick={() => handleQuickSearch(s.replace(/[,;]/g, ""))}
                  >
                    {s.trim().replace(/[,;]/g, "").replace(/_/g, " ")}
                  </Badge>
                )) : null}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Est. Salary</p>
                  <p className="text-sm font-extrabold text-slate-900">{job.entry_level_salary_est || "Market Rate"}</p>
                </div>
                <button 
                  onClick={() => handleQuickSearch(job.job_title || "")}
                  className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all group-hover:scale-110"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty Search State */}
          {jobs.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner px-4">
              <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">End of the Road</h3>
              <p className="text-slate-500">No matching careers found in the database.</p>
              <button onClick={resetFilters} className="mt-4 text-indigo-600 font-bold hover:underline">Show all jobs</button>
            </div>
          )}
        </div>

        {/* Load More Button */}
        <div className="mt-16 flex flex-col items-center gap-6 pb-20">
          {!loading && hasMore && !isSearching && (
            <button 
              onClick={handleLoadMore} 
              className="px-10 md:px-12 py-3.5 md:py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 shadow-xl shadow-slate-300 transition-all active:scale-95 flex items-center gap-2"
            >
              Load More Pathways
            </button>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Fetching SQL...
            </div>
          )}
          {!hasMore && jobs.length > 0 && !isSearching && (
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">All available data loaded</p>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-3">CpE CareerCompass</p>
          <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto leading-relaxed px-4">
            Relational database implementation. Successfully mapping {jobs.length} professional paths.
          </p>
        </div>
      </footer>
    </div>
  );
}