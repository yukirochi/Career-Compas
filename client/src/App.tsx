import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
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
  RefreshCw,
  ArrowLeft,
  Globe,
  TrendingUp,
  Map,
  MapPin,
  Compass,
  ArrowUpRight,
  BarChart3,
  Zap,
  Award,
  Layers,
  Milestone
} from 'lucide-react';
const baseurl = 'https://career-compas.onrender.com/'

/**
 * ARCHITECTURAL SPECIFICATIONS:
 * 1. Keyboard Navigation: Support for ArrowUp/Down and Enter to select from predictive lists.
 * 2. Intent-Based Search: Search triggers only on Enter, Button click, or Suggestion selection.
 * 3. Predictive Search: Client-side filtering of unique skills derived from the 300-job buffer.
 * 4. Pagination Threshold: Slices the large backend response to prevent browser render overload.
 */

// --- TYPES ---

interface Job {
  job_title: string;
  specialization: string;
  required_skills: string;
  future_career_projection: string;
  difficulty: string;
  detailed_overview: string;
  learning_roadmap: string;
}

// --- ATOMIC COMPONENTS ---

const Badge = ({ 
  children, 
  variant = "default", 
  onClick, 
  className = "" 
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'success' | 'warning' | 'error' | 'indigo' | 'skill';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-rose-50 text-rose-700 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    skill: "bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 shadow-sm transition-all cursor-pointer font-bold"
  };
  
  const activeStyle = variants[variant as keyof typeof variants] || variants.default;

  return (
    <span 
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] uppercase tracking-widest border ${activeStyle} ${className}`}
    >
      {children}
    </span>
  );
};

// --- MEMOIZED COMPONENTS FOR PERFORMANCE ---

const JobCard = memo(({ job, theme, onNavigate, onSkillClick }: { 
  job: Job, 
  theme: any, 
  onNavigate: (j: Job) => void,
  onSkillClick: (s: string) => void
}) => {
  return (
    <div 
      onClick={() => onNavigate(job)}
      className="group bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] p-8 hover:shadow-[0_40px_80px_rgba(99,102,241,0.08)] hover:border-indigo-200 transition-all duration-500 flex flex-col cursor-pointer relative shadow-sm"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors text-slate-600 group-hover:text-indigo-600">
          {job.specialization === 'Hardware' ? <Cpu className="w-7 h-7" /> :
           job.specialization === 'Networks' ? <Shield className="w-7 h-7" /> :
           <Briefcase className="w-7 h-7" />}
        </div>
        {/* ADDED "Difficulty" text for context */}
        <Badge variant={job.difficulty === 'Very High' ? 'error' : 'success'}>
          {String(job.difficulty || "")} Difficulty
        </Badge>
      </div>

      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
        {String(job.job_title || "")}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-10 line-clamp-3 font-medium">
        {String(job.detailed_overview || "Analyzing strategic market trajectories for this professional node...")}
      </p>

      <div className="flex flex-wrap gap-2 mb-12 mt-auto">
        {String(job.required_skills || "").split(/\s+/).filter(Boolean).slice(0, 4).map((s, i) => (
          <Badge 
            key={i} 
            variant="skill"
            onClick={(e) => { e.stopPropagation(); onSkillClick(s.replace(/[,;]/g, "")); }}
          >
            {s.replace(/[,;]/g, "")}
          </Badge>
        ))}
      </div>

      <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Forecast</p>
          <p className={`text-xs md:text-sm font-black ${theme.text} uppercase tracking-tighter`}>
            {String(job.future_career_projection || "")}
          </p>
        </div>
        <div className="h-12 w-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all group-hover:scale-110 shadow-sm">
          <ChevronRight className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
});

// --- UTILS ---

const getProjectionTheme = (projection: string = "") => {
  const p = String(projection || "").toLowerCase();
  if (p.includes('critical') || p.includes('rapid') || p.includes('aggressive') || p.includes('expansion')) {
    return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      accent: 'bg-emerald-500'
    };
  }
  if (p.includes('high') || p.includes('growing') || p.includes('demand')) {
    return {
      text: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      accent: 'bg-indigo-500'
    };
  }
  if (p.includes('stable') || p.includes('steady') || p.includes('niche') || p.includes('emerging')) {
    return {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      accent: 'bg-amber-500'
    };
  }
  return {
    text: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-100',
    accent: 'bg-slate-400'
  };
};

// --- MAIN APPLICATION ---

export default function App() {
  // UI States
  const [view, setView] = useState<'home' | 'detail'>('home');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Search & Performance States
  const [displaySkill, setDisplaySkill] = useState(""); 
  const [skill, setSkill] = useState(""); 
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // Tracking keyboard focus in suggestions
  
  // Data Buffer States
  const fullJobsBuffer = useRef<Job[]>([]); 
  const [visibleCount, setVisibleCount] = useState(9); 
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 9;

  const lastQuery = useRef("");
  const isInitialMount = useRef(true);

  // --- PREDICTIVE SEARCH LOGIC ---
  
  const allUniqueSkills = useMemo(() => {
    if (fullJobsBuffer.current.length === 0) return [];
    const skillsSet = new Set<string>();
    fullJobsBuffer.current.forEach(job => {
      const skills = (job.required_skills || "").split(/\s+/).filter(Boolean);
      skills.forEach(s => {
        const clean = s.trim().replace(/[,;]/g, "").toUpperCase();
        if (clean && clean.length > 1) skillsSet.add(clean);
      });
    });
    return Array.from(skillsSet).sort();
  }, [fullJobsBuffer.current]);

  const suggestions = useMemo(() => {
    const query = displaySkill.trim().toUpperCase();
    if (!query || query.length < 1) return [];
    return allUniqueSkills
      .filter(s => s.includes(query) && s !== query)
      .slice(0, 6); 
  }, [displaySkill, allUniqueSkills]);

  const hotSkills = useMemo(() => {
    const source = fullJobsBuffer.current.length > 0 ? fullJobsBuffer.current : jobs;
    if (source.length === 0) return ['C++', 'PYTHON', 'SQL', 'FPGA', 'RTOS'];
    const counts: Record<string, number> = {};
    source.forEach(job => {
      const skills = (job.required_skills || "").split(/\s+/).filter(Boolean);
      skills.forEach(s => {
        const clean = s.trim().replace(/[,;]/g, "").toUpperCase();
        if (clean) counts[clean] = (counts[clean] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
  }, [jobs]);

  // Actions
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseurl}all_jobs`);
      if (!res.ok) throw new Error("Backend offline");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        fullJobsBuffer.current = data; 
        setJobs(data.slice(0, ITEMS_PER_PAGE)); 
        setHasMore(data.length > ITEMS_PER_PAGE);
        setVisibleCount(ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextCount = visibleCount + ITEMS_PER_PAGE;
    const nextSlice = fullJobsBuffer.current.slice(0, nextCount);
    setJobs(nextSlice);
    setVisibleCount(nextCount);
    setHasMore(fullJobsBuffer.current.length > nextCount);
  };

  const executeSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      resetFilters();
      return;
    }
    
    if (trimmedQuery === lastQuery.current && isSearching) {
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }
    lastQuery.current = trimmedQuery;

    // Sync UI states
    setDisplaySkill(trimmedQuery);
    setSkill(trimmedQuery);
    setIsSearching(true);
    setLoading(true);
    setShowSuggestions(false); 
    setActiveIndex(-1);

    try {
      const res = await fetch(`${baseurl}search_jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: trimmedQuery })
      });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        fullJobsBuffer.current = data;
        setJobs(data.slice(0, ITEMS_PER_PAGE));
        setHasMore(data.length > ITEMS_PER_PAGE);
        setVisibleCount(ITEMS_PER_PAGE);
      } else {
        setJobs([]);
        setHasMore(false);
      }
      
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setDisplaySkill("");
    setSkill("");
    lastQuery.current = "";
    setIsSearching(false);
    setShowSuggestions(false);
    setActiveIndex(-1);
    setJobs([]); 
    fetchJobs(); 
    setView('home');
  };

  const navigateToJob = (job: Job) => {
    setSelectedJob(job);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSkillClick = (s: string) => {
    executeSearch(s);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showSuggestions) setShowSuggestions(true);
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (showSuggestions && activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSkillClick(suggestions[activeIndex]);
      }
      // If Enter is pressed and no index is active, the form onSubmit handles executeSearch
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  // Initial Load
  useEffect(() => { 
    if (isInitialMount.current) {
        fetchJobs(); 
        isInitialMount.current = false;
    }
  }, []);

  // --- RENDER VIEW: CAREER PROFILE (DETAIL) ---
  if (view === 'detail' && selectedJob) {
    const theme = getProjectionTheme(selectedJob.future_career_projection);
    
    const roadmapSteps = (selectedJob.learning_roadmap || "")
      .split('|')
      .filter(Boolean);

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">
        <header className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-50 px-4 h-16">
          <div className="max-w-6xl mx-auto h-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-bold transition-all group shrink-0">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                <span className="text-xs sm:text-sm font-black uppercase tracking-tight">Roadmap</span>
              </button>
              <div className="h-4 w-px bg-slate-200 hidden xs:block" />
              <div className="flex items-center gap-1.5 font-bold text-slate-900 shrink-0">
                <div className="bg-slate-900 p-1.5 rounded-lg shrink-0">
                  <Terminal className="w-3.5 h-3.5 text-white" /> 
                </div>
                <span className="text-[10px] sm:text-xs tracking-widest uppercase font-black">CareerCompass</span>
              </div>
            </div>
            <Badge variant="indigo" className="hidden sm:inline-flex">Profile Details Active</Badge>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
              <section>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="indigo">{String(selectedJob.specialization || "")}</Badge>
                  {/* ALREADY HAS "Difficulty" context here */}
                  <Badge variant={selectedJob.difficulty === 'Very High' ? 'error' : 'warning'}>
                    {String(selectedJob.difficulty || "")} Difficulty
                  </Badge>
                </div>
                <h1 className="text-4xl xs:text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none mb-8">
                  {String(selectedJob.job_title || "")}
                </h1>
                
                <div className="p-8 md:p-12 bg-white border border-slate-200 rounded-[2.5rem] md:rounded-[4rem] shadow-sm leading-relaxed overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                    <Compass className="w-48 h-48 text-slate-900" />
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 mb-6 uppercase tracking-[0.3em]">
                      <Zap className={`w-4 h-4 ${theme.text}`} /> Career Profile Overview
                    </h3>
                    <p className="text-xl md:text-3xl text-slate-600 leading-tight font-bold mb-16">
                      {String(selectedJob.detailed_overview || "Career details are being synchronized...")}
                    </p>
                    
                    <div className="h-px bg-slate-100 w-full mb-12" />
                    
                    <div className="space-y-12">
                      <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.3em] mb-12">
                        <Map className="w-4 h-4 text-indigo-500" /> Knowledge Trajectory
                      </h3>
                      
                      <div className="relative pb-10">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 border-l border-dashed border-slate-200 hidden md:block" />
                        
                        <div className="space-y-12 md:space-y-2">
                          {roadmapSteps.map((step, idx) => {
                            const isEven = idx % 2 === 0;
                            return (
                              <div key={idx} className={`flex flex-col md:flex-row items-center gap-6 md:gap-0 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                <div className="w-full md:w-1/2 md:px-10">
                                  <div className={`p-6 bg-slate-50 border border-slate-100 rounded-3xl transition-all hover:border-indigo-100 group/step relative shadow-sm`}>
                                    <div className={`absolute -top-3 ${isEven ? 'right-6' : 'left-6'} md:${isEven ? 'left-auto right-6' : 'right-auto left-6'} bg-white border border-slate-200 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest text-slate-400`}>
                                      Phase 0{idx + 1}
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-bold text-sm md:text-base">
                                      {String(step || "").trim()}
                                    </p>
                                  </div>
                                </div>
                                <div className="hidden md:flex relative z-10 w-10 h-10 rounded-full bg-white border-2 border-slate-100 items-center justify-center shadow-sm">
                                  <div className={`w-2.5 h-2.5 rounded-full ${theme.accent} opacity-40`} />
                                </div>
                                <div className="hidden md:block w-1/2" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 mb-8">
                  <Terminal className="w-8 h-8 text-indigo-500" /> Technical Skills
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {String(selectedJob.required_skills || "").split(/\s+/).filter(Boolean).map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleSkillClick(s.replace(/[,;]/g, ""))}
                      className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-[1.5rem] hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${theme.accent} shadow-sm group-hover:animate-pulse`} />
                        <span className="font-black text-slate-700 uppercase tracking-widest text-[11px] group-hover:text-indigo-600">
                          {s.replace(/[,;]/g, "")}
                        </span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm sticky top-24">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Market Analysis
                </h3>
                
                <div className="space-y-10">
                  <div className={`text-center p-10 rounded-[2.5rem] border ${theme.bg} ${theme.border} transition-all`}>
                    <p className={`text-[10px] font-black ${theme.text} uppercase tracking-[0.3em] mb-3`}>Current Trajectory</p>
                    <p className={`text-2xl md:text-3xl font-black ${theme.text} leading-none tracking-tighter`}>
                      {String(selectedJob.future_career_projection || "Steady")}
                    </p>
                  </div>

                  <div className="space-y-8 px-2">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${theme.bg} flex items-center justify-center ${theme.text} shrink-0 shadow-sm`}>
                        <TrendingUp className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Projection Node</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">Verified Status</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-slate-50">
                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Confidence</p>
                      <p className="text-xl font-black text-indigo-600 tracking-tighter leading-none">96.4%</p>
                    </div>
                    <BarChart3 className="w-6 h-6 text-indigo-300" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans antialiased">
      <header className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-50 px-4 h-16">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 shrink-0">
            <div className="bg-slate-900 p-1.5 rounded-lg shrink-0 shadow-sm">
              <Terminal className="w-4 h-4 text-white" /> 
            </div>
            <span className="text-[10px] xs:text-sm sm:text-lg tracking-tight font-black uppercase">CareerCompass</span>
          </div>
          <div className="flex items-center gap-2">
            {isSearching && (
              <button 
                onClick={resetFilters} 
                className="text-[9px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 sm:px-3 py-1.5 rounded-full transition-all border border-indigo-100 shrink-0 shadow-sm"
              >
                <RefreshCw className="w-3 h-3" /> <span className="hidden xs:inline font-black uppercase">Reset</span>
              </button>
            )}
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 shrink-0 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                Jobs: {fullJobsBuffer.current.length || jobs.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <section className="text-center mb-10 md:mb-16 space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            Find your <br className="sm:hidden" />
            <span className="text-indigo-600 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Path.</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base md:text-xl font-medium px-4 leading-relaxed">
            Technical career pathways for graduates. Explore dynamic career profiles and future market projections.
          </p>
        </section>

        <section className="max-w-2xl mx-auto mb-16 md:mb-20 px-2 relative">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              executeSearch(displaySkill); 
            }} 
            className="relative group mb-8 md:mb-10 z-30"
          >
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className={`w-5 h-5 transition-colors ${loading ? 'text-indigo-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
            </div>
            <input 
              type="text"
              placeholder="Search technologies (e.g. 'RTOS')..."
              className="w-full pl-14 pr-28 md:pr-32 py-4 md:py-6 bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-indigo-900/5 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-base md:text-xl placeholder:text-slate-300 font-medium"
              value={displaySkill}
              onChange={(e) => {
                setDisplaySkill(e.target.value);
                setShowSuggestions(true);
                setActiveIndex(-1); // Reset highlight when typing
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
              onKeyDown={handleKeyDown} 
            />
            
            {/* PREDICTIVE SEARCH DROPDOWN */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">Matching Skills</p>
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSkillClick(item)}
                    onMouseEnter={() => setActiveIndex(idx)} // Sync mouse highlight with index
                    className={`w-full text-left px-5 py-4 transition-colors flex items-center justify-between group ${
                      activeIndex === idx ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        activeIndex === idx ? 'bg-indigo-500' : 'bg-slate-300'
                      }`} />
                      <span className={`font-bold uppercase text-xs tracking-wider transition-colors ${
                        activeIndex === idx ? 'text-indigo-600' : 'text-slate-700'
                      }`}>{item}</span>
                    </div>
                    <ArrowUpRight className={`w-3 h-3 transition-colors ${
                      activeIndex === idx ? 'text-indigo-500' : 'text-slate-300'
                    }`} />
                  </button>
                ))}
              </div>
            )}

            <div className="absolute inset-y-2.5 right-2.5 flex items-center">
              <button 
                type="submit" 
                disabled={loading} 
                className="h-full bg-slate-900 text-white px-6 md:px-10 rounded-[1rem] md:rounded-[1.75rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
              >
                {loading && !jobs.length ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </div>
          </form>
          
          <div className="flex flex-col items-center justify-center gap-5">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Trending Skills:</span>
            <div className="flex flex-wrap items-center justify-center gap-2 px-4 max-w-xl">
              {hotSkills.map(s => (
                <Badge key={s} variant="skill" onClick={() => handleSkillClick(s)}>
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {jobs.map((job, idx) => (
            <JobCard 
              key={`${job.job_title}-${idx}`}
              job={job}
              theme={getProjectionTheme(job.future_career_projection)}
              onNavigate={navigateToJob}
              onSkillClick={handleSkillClick}
            />
          ))}
        </div>

        <div className="mt-16 md:mt-24 flex flex-col items-center gap-6 pb-20">
          {!loading && hasMore && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-px h-12 bg-gradient-to-b from-slate-200 to-transparent" />
              <button 
                onClick={handleLoadMore} 
                className="group relative px-14 py-5 bg-white border-2 border-slate-900 text-slate-900 rounded-[1.75rem] font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                <span className="relative z-10 font-black uppercase tracking-widest">Discover More Paths</span>
                <div className="absolute inset-0 bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-[1.6rem]" />
              </button>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Showing {visibleCount} of {fullJobsBuffer.current.length} {isSearching ? 'Matches' : 'Technical Skills'}
              </p>
            </div>
          )}
          
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-400 font-black text-[9px] sm:text-xs uppercase tracking-widest bg-white px-8 py-6 rounded-full border border-slate-100 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" /> 
              <span>Synchronizing Relational Nodes...</span>
            </div>
          )}

          {!hasMore && jobs.length > 0 && (
            <div className="flex flex-col items-center gap-4 py-10 opacity-60">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
                {isSearching ? 'End of Search Results' : 'Full Roadmap Indexed'}
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 py-16 bg-white text-center">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mb-4 px-4 leading-relaxed">CareerCompass Research Division</p>
        <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-lg mx-auto leading-relaxed px-6">
          Mapping interdisciplinary engineering nodes via relational SQL indexing. Build 0.5.2-alpha.
        </p>
      </footer>
    </div>
  );
}