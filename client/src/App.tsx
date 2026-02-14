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
  Compass,
  ArrowUpRight,
  BarChart3,
  Zap,
  Award,
  Layers,
  Clock,
  Code2,
  HelpCircle,
  ExternalLink,
  GraduationCap,
  ScrollText,
  Building2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Target,
  Quote
} from 'lucide-react';
const baseurl = 'https://career-compas.onrender.com/'

/**
 * ARCHITECTURAL UPDATE (V4.9 - SCHEMA FIDELITY):
 * 1. Data Mapping: Corrected to use 'degree_necessity' and 'suggested_certifications'.
 * 2. Card Visibility: Defined ITEMS_PER_PAGE and optimized unique filtering to fix empty grid.
 * 3. Branding: Logo home-redirect, NVIDIA Green, Apple Silver, Twitter Blue.
 * 4. Roadmap: Preserved Zig-Zag alternating mastery path.
 */

// --- TYPES ---

interface Job {
  id: number;
  job_title: string;
  specialization: string;
  difficulty: string;
  future_career_projection: string;
  salary_ph_entry: string | number;
  salary_ph_mid: string | number;
  salary_ph_senior: string | number;
  salary_us_entry: string | number;
  salary_us_mid: string | number;
  salary_us_senior: string | number;
  salary_uk_entry: string | number;
  salary_uk_mid: string | number;
  salary_uk_senior: string | number;
  remote_work_viability: string;
  detailed_overview: string;
  job_guide_link: string;
  required_skills: string; 
  learning_roadmap: string; 
  roadmap_with_study_links?: string;
  common_interview_questions: string; 
  related_careers: string;
  time_to_master: string;
  related_words: string;
  resume_project_idea: string;
  degree_necessity?: string; // Corrected column name
  suggested_certifications?: string; // Corrected column name
}

// --- CONSTANTS ---
const ITEMS_PER_PAGE = 9;

// --- UTILS ---

const parsePipeList = (str: string = "") => {
  if (!str || typeof str !== 'string') return [];
  if (str.includes('|')) {
    return str.split('|').map(s => s.trim()).filter(s => s.length > 0);
  }
  return str.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
};

const parseRoadmap = (str: string = "") => {
  if (!str) return [];
  return str.split(';').map(part => {
    const trimmed = part.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^(.*?)\s*\[(.*?)\]\((.*)\)$/);
    if (match) {
      return { 
        text: match[1].trim().replace(/^\d+\.\s*/, ''), 
        linkText: match[2], 
        url: match[3].startsWith('http') ? match[3] : `https://${match[3]}` 
      };
    }
    return { text: trimmed.replace(/^\d+\.\s*/, ''), linkText: null, url: null };
  }).filter(Boolean);
};

const parseInterviewQuestions = (str: string = "") => {
    if (!str) return [];
    return str.split(';').map(q => {
        const trimmed = q.trim();
        if (!trimmed) return null;
        const match = trimmed.match(/^\[(.*?)\]\s*(.*)$/);
        if (match) return { context: match[1], text: match[2] };
        return { context: "General", text: trimmed };
    }).filter(Boolean);
};

const formatMoney = (amount: string | number, currency: 'PHP' | 'USD' | 'GBP') => {
  const num = Number(amount);
  if (isNaN(num) || num === 0) return "N/A";
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: currency, maximumSignificantDigits: 3, notation: "compact"
  }).format(num);
};

const getDifficultyVariant = (difficulty: string = "") => {
  const d = (difficulty || "").toLowerCase();
  if (d.includes('very high') || d.includes('high')) return 'error'; 
  if (d.includes('medium')) return 'warning'; 
  return 'success'; 
};

// Brand Colors for Companies
const getCompanyStyle = (company: string = "") => {
  const c = company.toUpperCase();
  if (c.includes('NVIDIA')) return "bg-[#76b900] text-white border-[#76b900]";
  if (c.includes('APPLE')) return "bg-slate-100 text-slate-900 border-slate-300";
  if (c.includes('TWITTER') || c.includes(' X ')) return "bg-[#1DA1F2] text-white border-[#1DA1F2]";
  if (c.includes('GOOGLE')) return "bg-[#4285F4] text-white border-[#4285F4]";
  if (c.includes('INTEL')) return "bg-[#0071C5] text-white border-[#0071C5]";
  if (c.includes('META') || c.includes('FACEBOOK')) return "bg-[#0668E1] text-white border-[#0668E1]";
  if (c.includes('MICROSOFT')) return "bg-[#00a4ef] text-white border-[#00a4ef]";
  if (c.includes('AMAZON')) return "bg-[#232f3e] text-white border-[#232f3e]";
  if (c.includes('TESLA')) return "bg-[#cc0000] text-white border-[#cc0000]";
  return "bg-indigo-50 text-indigo-700 border-indigo-100";
};

const getProjectionTheme = (projection: string = "") => {
  const p = (projection || "").toLowerCase();
  if (p.includes('critical') || p.includes('scarcity') || p.includes('aggressive')) {
    return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500' };
  }
  if (p.includes('high') || p.includes('growing')) {
    return { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-500' };
  }
  return { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-500' };
};

// --- ATOMIC COMPONENTS ---

const Badge = ({ children, variant = "default", onClick, className = "" }: any) => {
  const variants: any = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    skill: "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all cursor-pointer font-semibold"
  };
  return (
    <span onClick={onClick} className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

const Tabs = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const tabs = [
    { id: 'overview', label: 'Dossier Overview', icon: Zap },
    { id: 'roadmap', label: 'Technical Path', icon: Map },
    { id: 'compensation', label: 'Global Salary', icon: DollarSign },
    { id: 'interview', label: 'Interview Prep', icon: HelpCircle },
  ];

  return (
    <div className="flex overflow-x-auto gap-1 pb-2 mb-8 border-b border-slate-200 no-scrollbar">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-sm whitespace-nowrap transition-all border-b-2 relative ${
              isActive 
                ? 'border-indigo-600 text-indigo-700 bg-white' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-300'}`} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

const JobCard = memo(({ job, theme, onNavigate, onSkillClick }: { job: Job, theme: any, onNavigate: (j: Job) => void, onSkillClick: (s: string) => void }) => {
  const skills = parsePipeList(job.required_skills).slice(0, 4);

  return (
    <div onClick={() => onNavigate(job)} className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 flex flex-col cursor-pointer h-full relative overflow-hidden shadow-sm">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${theme.bg} to-transparent opacity-50 rounded-bl-[3rem] -z-0 transition-opacity`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-600 group-hover:text-indigo-600 transition-colors">
          {job.specialization === 'Hardware' ? <Cpu className="w-5 h-5" /> :
           job.specialization === 'Networks' ? <Shield className="w-5 h-5" /> :
           job.specialization === 'Data Science' ? <Database className="w-5 h-5" /> :
           <Briefcase className="w-5 h-5" />}
        </div>
        <Badge variant={getDifficultyVariant(job.difficulty)}>{String(job.difficulty || "Standard")}</Badge>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2 min-h-[3.5rem] relative z-10">{job.job_title}</h3>
      
      <div className="space-y-3 mb-6 relative z-10">
         <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <TrendingUp className={`w-3.5 h-3.5 ${theme.icon}`} />
            <span>{job.future_career_projection}</span>
         </div>
         <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatMoney(job.salary_ph_entry, 'PHP')} (PH)</span>
         </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-auto relative z-10">
        {skills.map((s, i) => (
          <Badge key={i} variant="skill" onClick={(e: any) => { e.stopPropagation(); onSkillClick(s); }} className="text-[10px] py-0.5 px-2">{s}</Badge>
        ))}
      </div>
    </div>
  );
});

// --- MAIN APPLICATION ---

export default function App() {
  const [view, setView] = useState<'home' | 'detail'>('home');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [displaySkill, setDisplaySkill] = useState(""); 
  const [skill, setSkill] = useState(""); 
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  
  const fullJobsBuffer = useRef<Job[]>([]); 
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE); 
  const [hasMore, setHasMore] = useState(true);
  const lastQuery = useRef("");
  const isInitialMount = useRef(true);

  // --- LOGIC ---

  const allUniqueSkills = useMemo(() => {
    if (fullJobsBuffer.current.length === 0) return [];
    const skillsSet = new Set<string>();
    fullJobsBuffer.current.forEach(job => {
      parsePipeList(job.required_skills).forEach(s => skillsSet.add(s.toUpperCase()));
    });
    return Array.from(skillsSet).sort();
  }, [fullJobsBuffer.current]);

  const suggestions = useMemo(() => {
    const query = displaySkill.trim().toUpperCase();
    if (!query || query.length < 1) return [];
    return allUniqueSkills.filter(s => s.includes(query) && s !== query).slice(0, 6); 
  }, [displaySkill, allUniqueSkills]);

  const hotSkills = useMemo(() => {
    const source = fullJobsBuffer.current.length > 0 ? fullJobsBuffer.current : jobs;
    if (source.length === 0) return ['SQL', 'PYTHON', 'FPGA', 'C++'];
    const counts: Record<string, number> = {};
    source.forEach(job => {
        parsePipeList(job.required_skills).forEach(s => {
            const clean = s.toUpperCase();
            counts[clean] = (counts[clean] || 0) + 1;
        });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
  }, [jobs]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseurl}all_jobs`);
      if (!res.ok) throw new Error("Backend offline");
      const data = await res.json();
      if (Array.isArray(data)) {
        const uniqueData = data.filter((v, i, a) => 
          v && v.job_title && a.findIndex(t => (t && t.job_title === v.job_title)) === i
        );
        fullJobsBuffer.current = uniqueData; 
        setJobs(uniqueData.slice(0, ITEMS_PER_PAGE)); 
        setHasMore(uniqueData.length > ITEMS_PER_PAGE);
        setVisibleCount(ITEMS_PER_PAGE);
      } else { setHasMore(false); }
    } catch (err) { console.error(err); setHasMore(false); } 
    finally { setLoading(false); }
  };

  const handleLoadMore = () => {
    const nextCount = visibleCount + ITEMS_PER_PAGE;
    setJobs(fullJobsBuffer.current.slice(0, nextCount));
    setVisibleCount(nextCount);
    setHasMore(fullJobsBuffer.current.length > nextCount);
  };

  const executeSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) { if (isSearching) resetFilters(); return; }
    lastQuery.current = trimmedQuery;

    setDisplaySkill(trimmedQuery);
    setSkill(trimmedQuery);
    setIsSearching(true);
    setLoading(true);
    setShowSuggestions(false); 
    setActiveIndex(-1);

    try {
      const res = await fetch(`${baseurl}search_jobs`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ skill: trimmedQuery })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const uniqueData = data.filter((v, i, a) => 
          v && v.job_title && a.findIndex(t => (t && t.job_title === v.job_title)) === i
        );
        fullJobsBuffer.current = uniqueData;
        setJobs(uniqueData.slice(0, ITEMS_PER_PAGE));
        setHasMore(uniqueData.length > ITEMS_PER_PAGE);
        setVisibleCount(ITEMS_PER_PAGE);
      } else { setJobs([]); setHasMore(false); }
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const resetFilters = () => {
    setDisplaySkill(""); setSkill(""); lastQuery.current = ""; setIsSearching(false);
    setJobs([]); fetchJobs(); setView('home');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); if (!showSuggestions) setShowSuggestions(true);
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault(); 
      if (showSuggestions && activeIndex >= 0) { 
        executeSearch(suggestions[activeIndex]); 
      } else {
        executeSearch(displaySkill); 
      }
    } else if (e.key === 'Escape') { setShowSuggestions(false); }
  };
  
  const navigateToJob = (job: Job) => {
    setSelectedJob(job);
    setExpandedStep(null);
    setActiveTab('overview'); 
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => { if (isInitialMount.current) { fetchJobs(); isInitialMount.current = false; } }, []);

  // --- DETAIL VIEW ---
  if (view === 'detail' && selectedJob) {
    const theme = getProjectionTheme(selectedJob.future_career_projection);
    const rawRoadmap = selectedJob.roadmap_with_study_links || selectedJob.learning_roadmap;
    const roadmapSteps = parseRoadmap(rawRoadmap);
    const skills = parsePipeList(selectedJob.required_skills);
    const relatedJobs = parsePipeList(selectedJob.related_careers);
    const questions = parseInterviewQuestions(selectedJob.common_interview_questions);
    
    // DB Column mapping
    const jobCerts = parsePipeList(selectedJob.suggested_certifications || "");
    const jobDegree = selectedJob.degree_necessity || "";

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">
        <header className="sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <button 
              onClick={() => { setView('home'); resetFilters(); }} 
              className="flex items-center gap-3 font-black text-xl text-slate-900 tracking-tighter hover:text-indigo-600 transition-colors group"
            >
              <div className="bg-slate-900 p-1.5 rounded-xl shadow-lg group-hover:bg-indigo-600 transition-colors">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:inline uppercase">CareerCompass</span>
            </button>
            <div className="flex items-center gap-3">
               <Badge variant={selectedJob.remote_work_viability.toLowerCase().includes('high') ? 'success' : 'warning'}>
                 <Globe className="w-3 h-3 mr-1.5 inline" /> {selectedJob.remote_work_viability}
               </Badge>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-10">
          
          {/* DOSSIER HEADER */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl mb-10 relative overflow-hidden group">
             <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl ${theme.bg} to-transparent opacity-60 rounded-bl-[100%] -z-0 pointer-events-none group-hover:scale-110 transition-transform duration-700`} />
             
             <div className="relative z-10">
                <div className="flex flex-wrap gap-2 mb-8">
                   <Badge variant="indigo" className="px-4 py-1">Field: {selectedJob.specialization}</Badge>
                   <Badge variant="default" className="px-4 py-1"><Clock className="w-3.5 h-3.5 mr-1.5" /> {selectedJob.time_to_master}</Badge>
                   <Badge variant={getDifficultyVariant(selectedJob.difficulty)} className="px-4 py-1">{selectedJob.difficulty} DIFFICULTY</Badge>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">{selectedJob.job_title}</h1>
                <div className="flex items-start gap-4">
                    <Quote className="w-8 h-8 text-indigo-200 flex-shrink-0" />
                    <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-medium italic">{selectedJob.detailed_overview}</p>
                </div>
             </div>
          </div>

          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === 'overview' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-md col-span-1 md:col-span-2">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                     <Layers className="w-4 h-4 text-indigo-500" /> skills needed
                   </h3>
                   <div className="flex flex-wrap gap-3">
                      {skills.map((s, i) => (
                          <Badge key={i} variant="skill" onClick={() => { setSkill(s); executeSearch(s); }} className="px-5 py-2.5 text-xs rounded-xl">{s}</Badge>
                      ))}
                   </div>
                </div>

                {/* Academic Prerequisite Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-md flex flex-col gap-6 group hover:border-indigo-300 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><GraduationCap className="w-6 h-6" /></div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Academic Prerequisite</h3>
                   </div>
                   <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">{jobDegree || "Technical bachelor's degree required (CpE, CS, or EE preferred)."}</p>
                </div>

                {/* Technical Credentials Card (Suggested Certifications) */}
                <div className="bg-white p-8 rounded-[2rem] border-2 border-indigo-100 shadow-lg shadow-indigo-100/20 flex flex-col gap-6 group hover:border-indigo-300 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><ScrollText className="w-6 h-6" /></div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Certifications</h3>
                   </div>
                   <div className="flex flex-col gap-2">
                      {jobCerts.length > 0 ? jobCerts.map((cert, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {cert}
                        </div>
                      )) : (
                        <p className="text-slate-400 text-sm italic font-medium">Industry standard certifications recommended for professional verification.</p>
                      )}
                   </div>
                </div>

                {/* Portfolio Section */}
                <div className="bg-white border-2 border-indigo-100 p-10 rounded-[2.5rem] shadow-xl col-span-1 md:col-span-2 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none"><Code2 className="w-40 h-40 text-indigo-600" /></div>
                   <div className="relative z-10">
                      <h4 className="text-2xl font-black mb-4 flex items-center gap-3 text-slate-900 tracking-tight"><Award className="w-6 h-6 text-indigo-600" /> PROJECT SUGGESTION</h4>
                      <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-2xl font-medium">{selectedJob.resume_project_idea || "Project scope currently in design phase."}</p>
                      {selectedJob.job_guide_link && (
                        <a href={selectedJob.job_guide_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-600/20">
                           Look For Guide <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                   </div>
                </div>
             </div>
          )}

          {/* TAB CONTENT: ROADMAP */}
          {activeTab === 'roadmap' && (
             <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="flex items-center justify-between mb-12">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                     <Map className="w-4 h-4 text-indigo-500" /> Roadmap
                   </h3>
                </div>
                
                <div className="relative space-y-10">
                   {/* Vertical Line Connector */}
                   <div className="absolute left-[19px] md:left-1/2 top-4 bottom-10 w-0.5 bg-indigo-100 transform md:-translate-x-1/2" />
                   
                   {roadmapSteps.map((step: any, idx: number) => {
                      const isLeft = idx % 2 === 0;
                      const isOpen = expandedStep === idx;
                      
                      return (
                        <div key={idx} className={`relative flex items-start md:items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 group pl-12 md:pl-0`}>
                           
                           {/* Step Card */}
                           <div className="w-full md:w-[calc(50%-2.5rem)] transition-all duration-300">
                              <div 
                                onClick={() => setExpandedStep(isOpen ? null : idx)}
                                className={`bg-white border-2 p-6 rounded-2xl cursor-pointer relative transition-all group/card ${isOpen ? 'border-indigo-600 shadow-2xl ring-8 ring-indigo-50' : 'border-slate-100 hover:border-indigo-200 shadow-sm'}`}
                              >
                                 <div className="flex justify-between items-start gap-4">
                                    <span className={`font-black text-base ${isOpen ? 'text-indigo-900' : 'text-slate-700'}`}>{step.text}</span>
                                    <div className={`p-1 rounded-lg transition-colors ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                 </div>
                                 
                                 {isOpen && step.url && (
                                   <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in duration-300">
                                      <a href={step.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-lg w-fit">
                                        <ExternalLink className="w-3.5 h-3.5" /> Recommended Source
                                      </a>
                                   </div>
                                 )}
                              </div>
                           </div>

                           {/* Node Point */}
                           <div className={`absolute left-0 md:left-1/2 top-0 md:top-1/2 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-8 border-slate-50 shadow-xl z-20 transition-all duration-500 md:-translate-x-1/2 md:-translate-y-1/2 ${isOpen ? 'bg-indigo-600 text-white scale-125' : 'bg-white text-slate-300'}`}>
                             {idx + 1}
                           </div>

                        </div>
                      );
                   })}
                </div>
             </div>
          )}

          {/* TAB CONTENT: COMPENSATION */}
          {activeTab === 'compensation' && (
             <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
                {/* PH Card */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-md flex flex-col lg:flex-row items-center justify-between gap-10">
                   <div className="flex items-center gap-6 w-full lg:w-auto">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner"><Globe className="w-8 h-8" /></div>
                      <div>
                         <h4 className="font-black text-2xl text-slate-900 tracking-tight">Philippines</h4>
                         <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Annual Gross Tier (PHP)</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-3 gap-4 w-full lg:w-auto flex-grow max-w-2xl">
                      <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                         <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Entry</p>
                         <p className="text-base font-black text-slate-700">{formatMoney(selectedJob.salary_ph_entry, 'PHP')}</p>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                         <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Mid-Level</p>
                         <p className="text-base font-black text-slate-900">{formatMoney(selectedJob.salary_ph_mid, 'PHP')}</p>
                      </div>
                      <div className="bg-emerald-50/50 p-5 rounded-2xl text-center border border-emerald-100 hover:bg-emerald-50 hover:shadow-lg transition-all">
                         <p className="text-[10px] uppercase font-black text-emerald-600 mb-2">Senior</p>
                         <p className="text-lg font-black text-emerald-700">{formatMoney(selectedJob.salary_ph_senior, 'PHP')}</p>
                      </div>
                   </div>
                </div>

                {/* US Card */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-md flex flex-col lg:flex-row items-center justify-between gap-10 opacity-95">
                   <div className="flex items-center gap-6 w-full lg:w-auto">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-500 shadow-inner"><Globe className="w-8 h-8" /></div>
                      <div>
                         <h4 className="font-black text-2xl text-slate-900 tracking-tight">United States</h4>
                         <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Annual Gross Tier (USD)</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-3 gap-4 w-full lg:w-auto flex-grow max-w-2xl">
                      <div className="bg-slate-50/80 p-5 rounded-2xl text-center border border-slate-100">
                         <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Entry</p>
                         <p className="text-base font-black text-slate-700">{formatMoney(selectedJob.salary_us_entry, 'USD')}</p>
                      </div>
                      <div className="bg-slate-50/80 p-5 rounded-2xl text-center border border-slate-100">
                         <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Mid-Level</p>
                         <p className="text-base font-black text-slate-900">{formatMoney(selectedJob.salary_us_mid, 'USD')}</p>
                      </div>
                      <div className="bg-indigo-50/50 p-5 rounded-2xl text-center border border-indigo-100">
                         <p className="text-[10px] uppercase font-black text-indigo-600 mb-2">Senior</p>
                         <p className="text-lg font-black text-indigo-700">{formatMoney(selectedJob.salary_us_senior, 'USD')}</p>
                      </div>
                   </div>
                </div>

                {/* UK Card */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-md flex flex-col lg:flex-row items-center justify-between gap-10 opacity-90">
                   <div className="flex items-center gap-6 w-full lg:w-auto">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-500 shadow-inner"><Globe className="w-8 h-8" /></div>
                      <div>
                         <h4 className="font-black text-2xl text-slate-900 tracking-tight">United Kingdom</h4>
                         <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Annual Gross Tier (GBP)</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-3 gap-4 w-full lg:w-auto flex-grow max-w-2xl">
                      <div className="bg-slate-50/80 p-5 rounded-2xl text-center border border-slate-100">
                         <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Entry</p>
                         <p className="text-base font-black text-slate-700">{formatMoney(selectedJob.salary_uk_entry, 'GBP')}</p>
                      </div>
                      <div className="bg-slate-50/80 p-5 rounded-2xl text-center border border-slate-100">
                         <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Mid-Level</p>
                         <p className="text-base font-black text-slate-900">{formatMoney(selectedJob.salary_uk_mid, 'GBP')}</p>
                      </div>
                      <div className="bg-indigo-50/50 p-5 rounded-2xl text-center border border-indigo-100">
                         <p className="text-[10px] uppercase font-black text-indigo-600 mb-2">Senior</p>
                         <p className="text-lg font-black text-indigo-700">{formatMoney(selectedJob.salary_uk_senior, 'GBP')}</p>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* TAB CONTENT: INTERVIEW */}
          {activeTab === 'interview' && (
             <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                   <HelpCircle className="w-4 h-4 text-indigo-500" /> Common Interview Questions
                 </h3>
                 {questions.map((q: any, i) => (
                    <div key={i} className="group bg-white p-8 rounded-[2rem] border border-slate-200 shadow-md hover:border-indigo-300 transition-all hover:shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                          <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border ${getCompanyStyle(q.context)}`}>
                            {q.context}
                          </span>
                      </div>
                      <p className="text-slate-800 font-bold text-xl leading-relaxed">"{q.text}"</p>
                    </div>
                 ))}
                 {relatedJobs.length > 0 && (
                     <div className="mt-12">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Related Career</h4>
                        <div className="flex flex-wrap gap-4">
                           {relatedJobs.map((career, i) => (
                              <button key={i} onClick={() => { setSkill(career); executeSearch(career); }} className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-xl transition-all text-base font-black text-slate-700 group">
                                 <Building2 className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                                 {career}
                              </button>
                           ))}
                        </div>
                     </div>
                 )}
             </div>
          )}

        </main>
      </div>
    );
  }

  // --- HOME VIEW RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans antialiased">
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => { setView('home'); resetFilters(); }}
            className="flex items-center gap-3 font-black text-xl text-slate-900 tracking-tighter group hover:text-indigo-600 transition-colors"
          >
            <div className="bg-slate-900 p-1.5 rounded-xl shadow-lg group-hover:bg-indigo-600 transition-colors">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline uppercase">CareerCompass</span>
          </button>
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200">
                <Target className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Jobs: {fullJobsBuffer.current.length || jobs.length}
             </div>
             {isSearching && (
               <button 
                 onClick={resetFilters} 
                 className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                 title="Reset Roadmap"
               >
                 <RefreshCw className="w-4 h-4" />
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <section className="text-center mb-16 space-y-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.95]">
            Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Path.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            The high-density career engine for Computer tech professionals.
          </p>
        </section>

        <section className="max-w-2xl mx-auto mb-20 relative px-4">
          <form 
            className="relative group z-20"
            onSubmit={(e) => { e.preventDefault(); executeSearch(displaySkill); }}
          >
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
             <input 
                type="text" 
                placeholder="Search technical domains..." 
                className="w-full pl-16 pr-36 py-6 bg-white border-2 border-slate-100 rounded-[2rem] text-xl font-bold shadow-2xl shadow-slate-200/60 focus:outline-none focus:border-indigo-600 focus:ring-8 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                value={displaySkill}
                onChange={(e) => { setDisplaySkill(e.target.value); setShowSuggestions(true); setActiveIndex(-1); }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
             />
             
             <button 
               type="submit"
               className="absolute right-3 top-2.5 bottom-2.5 bg-slate-900 text-white px-8 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
             >
               Execute
             </button>

             {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-t-0 ring-4 ring-indigo-500/5">
                   {suggestions.map((item, idx) => (
                      <button key={idx} type="button" onClick={() => executeSearch(item)} onMouseEnter={() => setActiveIndex(idx)} className={`w-full text-left px-8 py-5 flex items-center gap-4 transition-colors ${activeIndex === idx ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                         <Search className={`w-4 h-4 ${activeIndex === idx ? 'text-indigo-500' : 'text-slate-300'}`} /> <span className="font-black text-sm uppercase tracking-wider">{item}</span>
                      </button>
                   ))}
                </div>
             )}
          </form>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] py-1.5">Trending Domains:</span>
             {hotSkills.map(s => <Badge key={s} variant="skill" onClick={() => executeSearch(s)} className="px-4 py-2 border-slate-100">{s}</Badge>)}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {jobs.map((job, idx) => (
              <JobCard key={`${job.job_title}-${idx}`} job={job} theme={getProjectionTheme(job.future_career_projection)} onNavigate={navigateToJob} onSkillClick={executeSearch} />
           ))}
        </div>

        <div className="mt-20 text-center pb-20">
           {!loading && hasMore && (
              <button onClick={handleLoadMore} className="px-16 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 shadow-xl transition-all active:scale-95">Discover More</button>
           )}
           {loading && <div className="flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hydrating Relational jobs...</span></div>}
        </div>
      </main>
    </div>
  );
}