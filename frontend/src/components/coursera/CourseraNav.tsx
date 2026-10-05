import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Bell,
  Globe,
  User,
  ExternalLink,
  BookOpen,
  Sparkles,
  Menu,
  X,
  GraduationCap,
  Layers,
} from 'lucide-react';

interface CourseraNavProps {
  activeView: 'landing' | 'profile' | 'workspace';
  onNavigate: (view: 'landing' | 'profile' | 'workspace') => void;
  onOpenEnrollModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const CourseraNav: React.FC<CourseraNavProps> = ({
  activeView,
  onNavigate,
  onOpenEnrollModal,
  searchQuery,
  setSearchQuery,
}) => {
  const [activeAudience, setActiveAudience] = useState<string>('Individuals');
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const audienceTabs = [
    { id: 'Individuals', label: 'For Individuals' },
    { id: 'Businesses', label: 'For Businesses' },
    { id: 'Universities', label: 'For Universities' },
    { id: 'Governments', label: 'For Governments' },
  ];

  const exploreCategories = [
    { name: 'Meeting Intelligence & NLP', courses: '12 Courses' },
    { name: 'Generative AI & LLM Systems', courses: '24 Courses' },
    { name: 'Human-in-the-Loop Product Design', courses: '8 Courses' },
    { name: 'RAG Architecture & Semantic Search', courses: '16 Courses' },
    { name: 'Enterprise Cloud & Data Auditing', courses: '19 Courses' },
  ];

  return (
    <header className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
      {/* 1. Top Audience Switcher Bar */}
      <div className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[13px] font-medium text-[#4B5563]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <div className="flex items-center space-x-6 overflow-x-auto py-1">
            {audienceTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveAudience(tab.id)}
                className={`transition-colors whitespace-nowrap py-1 font-medium ${
                  activeAudience === tab.id
                    ? 'text-[#0056D2] font-semibold border-b-2 border-[#0056D2]'
                    : 'text-[#4B5563] hover:text-[#1F1F1F]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-5 text-xs text-[#4B5563]">
            <button
              onClick={() => onNavigate('workspace')}
              className="flex items-center gap-1.5 text-[#0056D2] font-semibold hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Live AI Meeting Workspace</span>
            </button>
            <div className="flex items-center gap-1 cursor-pointer hover:text-[#1F1F1F]">
              <Globe className="w-3.5 h-3.5" />
              <span>English</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand & Explore Dropdown */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#4B5563] hover:text-[#1F1F1F] lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Coursera-inspired MeetSync logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-9 h-9 rounded bg-[#0056D2] flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:bg-[#00419E] transition-colors">
              M
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0056D2]">
                MeetSync
              </span>
              <span className="text-[11px] font-bold text-[#6B7280] ml-1 uppercase tracking-wider hidden sm:inline">
                Learning
              </span>
            </div>
          </button>

          {/* Explore dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setExploreOpen(!exploreOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded border border-[#0056D2] text-[#0056D2] bg-white hover:bg-[#F0F5FF] text-sm font-semibold transition"
            >
              <span>Explore</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
            </button>

            {exploreOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-lg bg-white shadow-xl border border-[#E5E7EB] py-2 z-50">
                <div className="px-4 py-2 border-b border-[#F3F4F6] text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Browse Categories
                </div>
                {exploreCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setExploreOpen(false)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#F9FAFB] flex items-center justify-between text-sm text-[#1F1F1F]"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-[#6B7280] font-normal">{cat.courses}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg hidden sm:block">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to learn? (e.g. Diarization, HITL, RAG)"
              className="w-full h-11 pl-4 pr-12 rounded-full border border-[#D1D5DB] focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2] outline-none text-sm text-[#1F1F1F] placeholder-[#6B7280]"
            />
            <button
              aria-label="Search"
              className="absolute right-1 w-9 h-9 rounded-full bg-[#0056D2] hover:bg-[#00419E] text-white flex items-center justify-center transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Actions & Navigation Tabs */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className={`hidden lg:block text-sm font-semibold transition px-2 py-1 ${
              activeView === 'landing' ? 'text-[#0056D2]' : 'text-[#374151] hover:text-[#0056D2]'
            }`}
          >
            Course Series
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className={`hidden lg:block text-sm font-semibold transition px-2 py-1 ${
              activeView === 'profile' ? 'text-[#0056D2]' : 'text-[#374151] hover:text-[#0056D2]'
            }`}
          >
            Learner Profile
          </button>

          {/* Notification icon */}
          <button
            className="p-2 text-[#4B5563] hover:text-[#1F1F1F] rounded-full hover:bg-[#F3F4F6] relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0056D2]"></span>
          </button>

          {/* User Profile Avatar Link */}
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#0056D2]/30 transition"
            title="View Learner Profile"
          >
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
              alt="Elena Rostova"
              className="w-8 h-8 rounded-full object-cover border border-[#D1D5DB]"
            />
          </button>

          {/* Enroll / Join Button */}
          <button
            onClick={onOpenEnrollModal}
            className="bg-[#0056D2] hover:bg-[#00419E] text-white text-sm font-bold px-4 sm:px-5 py-2.5 rounded transition shadow-xs whitespace-nowrap min-h-[40px]"
          >
            Join for Free
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-white px-4 py-4 space-y-3">
          <div className="relative flex items-center mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses and skills..."
              className="w-full h-10 pl-3 pr-10 rounded border border-[#D1D5DB] text-sm"
            />
            <button className="absolute right-1 w-8 h-8 bg-[#0056D2] rounded text-white flex items-center justify-center">
              <Search className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 font-semibold text-sm ${
              activeView === 'landing' ? 'text-[#0056D2]' : 'text-[#374151]'
            }`}
          >
            Course Overview & Syllabus
          </button>

          <button
            onClick={() => {
              onNavigate('profile');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 font-semibold text-sm ${
              activeView === 'profile' ? 'text-[#0056D2]' : 'text-[#374151]'
            }`}
          >
            Learner Profile & Credentials
          </button>

          <button
            onClick={() => {
              onNavigate('workspace');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-semibold text-sm text-[#0056D2] flex items-center justify-between"
          >
            <span>Live AI Meeting Workspace</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
