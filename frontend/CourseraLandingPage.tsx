import React, { useState } from 'react';
import {
  ChevronRight,
  Star,
  Globe,
  Award,
  Clock,
  Calendar,
  CheckCircle2,
  Users,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Play,
  Share2,
  Download,
  Building2,
  FileCheck,
  Layers,
} from 'lucide-react';

interface CourseraLandingPageProps {
  onEnroll: () => void;
  onNavigateToProfile: () => void;
  onLaunchWorkspace: () => void;
}

export const CourseraLandingPage: React.FC<CourseraLandingPageProps> = ({
  onEnroll,
  onNavigateToProfile,
  onLaunchWorkspace,
}) => {
  const [activeCourseTab, setActiveCourseTab] = useState<number>(1);

  const coursesInSeries = [
    {
      number: 1,
      title: 'Foundations of Meeting Diarization & Speech Processing',
      duration: '14 hours · 4 weeks',
      rating: '4.9 ★',
      reviews: '12,410 reviews',
      description:
        'Understand multi-speaker acoustic diarization, acoustic confidence models, and real-time audio playback alignment with frame-accurate timecodes.',
      skills: ['Acoustic Diarization', 'Speech-to-Text NLP', 'Audio Synchronization'],
    },
    {
      number: 2,
      title: 'Human-in-the-Loop (HITL) Minutes of Meeting (MOM) Systems',
      duration: '18 hours · 4 weeks',
      rating: '4.8 ★',
      reviews: '9,840 reviews',
      description:
        'Design and implement interactive editor workflows, collaborative minutes drafting, action item extraction, and real-time human verification gates.',
      skills: ['HITL Architecture', 'Collaborative Editing', 'Action Item Mining'],
    },
    {
      number: 3,
      title: 'Decision Traceability & Vector-Grounded RAG Auditing',
      duration: '16 hours · 3 weeks',
      rating: '4.9 ★',
      reviews: '14,200 reviews',
      description:
        'Ground every executive decision in verbatim audio timestamps using dense vector embeddings, cosine distance thresholds, and consensus stance modeling.',
      skills: ['RAG Retrieval', 'Semantic Embeddings', 'Decision Traceability', 'SOC2 Auditing'],
    },
    {
      number: 4,
      title: 'Enterprise Capstone: Production Meeting Intelligence Platform',
      duration: '22 hours · 5 weeks',
      rating: '4.9 ★',
      reviews: '8,120 reviews',
      description:
        'Build and deploy a full-scale meeting intelligence application featuring dual-tone scrubbers, interactive transcripts, and automated Jira/Linear issue synchronization.',
      skills: ['Full-Stack React', 'Tailwind Systems', 'Enterprise API Integration'],
    },
  ];

  return (
    <div className="w-full bg-white text-[#1F1F1F]">
      {/* 1. Breadcrumb Navigation */}
      <div className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-xs text-[#4B5563]" aria-label="Breadcrumb">
            <span className="hover:text-[#0056D2] cursor-pointer">Home</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="hover:text-[#0056D2] cursor-pointer">Categories</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="hover:text-[#0056D2] cursor-pointer">Enterprise AI</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="font-semibold text-[#1F1F1F]">Meeting Intelligence</span>
          </nav>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0F5FF]/80 via-white to-white border-b border-[#E5E7EB] pt-10 pb-16">
        {/* Subtle geometric background accents */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#0056D2]/8 via-[#0056D2]/3 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left 7 Columns: Hero Copy & CTA */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Partner Brand Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#0056D2] flex items-center justify-center text-white font-bold text-xl shadow-xs">
                  M
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1F1F1F]">MeetSync Institute</div>
                  <div className="text-[11px] text-[#6B7280]">Advanced Enterprise AI Specialization</div>
                </div>
              </div>

              {/* Large Bold Course Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1F1F1F] leading-tight">
                MeetSync AI Professional Certificate
              </h1>

              {/* Subtitle Value Proposition */}
              <p className="text-base sm:text-lg text-[#374151] leading-relaxed max-w-2xl font-normal">
                Master enterprise meeting intelligence and automated executive decision auditing. 
                Build production-ready diarized speech interfaces, human-in-the-loop (HITL) minutes pipelines, 
                and RAG-grounded decision traceability matrices.
              </p>

              {/* Instructor Metadata & Social Proof Badges */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-[#4B5563] pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#E5E7EB] flex items-center justify-center font-bold text-xs text-[#0056D2]">
                    MS
                  </div>
                  <span>
                    Instructor: <strong className="text-[#1F1F1F] font-semibold">MeetSync Engineering Team</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[#1F1F1F] font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.8</span>
                  <span className="text-xs text-[#6B7280] font-normal">(42,180 ratings)</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                  <Globe className="w-4 h-4 text-[#6B7280]" />
                  <span>English · 12 Languages Available</span>
                </div>
              </div>

              {/* CTA Button & Enrollment Social Proof */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={onEnroll}
                  className="w-full sm:w-auto bg-[#0056D2] hover:bg-[#00419E] text-white text-base font-bold px-8 py-4 rounded-md transition shadow-md hover:shadow-lg transform active:scale-98 min-h-[50px]"
                >
                  Enroll for Free (Starts Today)
                </button>

                <div className="text-xs text-[#4B5563]">
                  <div className="font-semibold text-[#1F1F1F]">
                    1,594,526 already enrolled
                  </div>
                  <div className="text-[#0056D2] hover:underline cursor-pointer">
                    Financial aid available
                  </div>
                </div>
              </div>

              {/* Guarantee / Credential Note */}
              <div className="flex items-center gap-2 text-xs text-[#6B7280] pt-2">
                <Award className="w-4 h-4 text-[#0056D2]" />
                <span>Shareable Certificate included upon completion · 100% Online</span>
              </div>
            </div>

            {/* Right 5 Columns: Interactive Course Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-lg overflow-hidden sticky top-24">
                {/* Course Visual Media Header */}
                <div className="relative aspect-video bg-[#1F2937] overflow-hidden group cursor-pointer" onClick={onLaunchWorkspace}>
                  <img
                    src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80"
                    alt="Course Preview"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-103 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-4">
                    <div className="flex justify-between items-center text-white text-xs">
                      <span className="bg-[#0056D2] font-semibold px-2 py-0.5 rounded text-[11px]">
                        PROFESSIONAL CERTIFICATE
                      </span>
                      <span className="font-mono text-[11px] bg-black/50 px-2 py-0.5 rounded">Preview 02:45</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#0056D2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                      <div className="text-white">
                        <div className="text-xs font-semibold uppercase tracking-wider text-blue-200">Interactive Lab Demo</div>
                        <div className="text-sm font-bold">Launch MeetSync Workspace Lab</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Card Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#6B7280] pb-2 border-b border-[#F3F4F6]">
                    <span>Provided by MeetSync & Industry Partners</span>
                    <span className="font-bold text-[#0056D2]">Verified Credential</span>
                  </div>

                  <div className="space-y-3 text-xs text-[#374151]">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Learn at your own pace with practical interactive assignments</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Apply concepts directly in our live browser-based meeting editor</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Earn an official industry certificate for LinkedIn & resume</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={onEnroll}
                      className="w-full bg-[#0056D2] hover:bg-[#00419E] text-white text-sm font-bold py-3 rounded transition shadow-xs text-center"
                    >
                      Enroll in Specialization
                    </button>
                    <p className="text-[11px] text-[#6B7280] text-center mt-2">
                      Try free for 7 days, then $49/month. Cancel anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Course Highlights Banner */}
      <section className="bg-white border-b border-[#E5E7EB] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Highlight 1: Series Count */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/80 hover:border-[#0056D2]/50 transition">
              <div className="w-8 h-8 rounded-lg bg-[#0056D2]/10 text-[#0056D2] flex items-center justify-center mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold text-[#1F1F1F]">4-Course Series</div>
              <div className="text-xs text-[#6B7280] mt-0.5">Comprehensive hands-on curriculum</div>
            </div>

            {/* Highlight 2: Ratings */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/80 hover:border-[#0056D2]/50 transition">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <div className="text-lg font-bold text-[#1F1F1F]">4.8 ★ Rating</div>
              <div className="text-xs text-[#6B7280] mt-0.5">From 42,180 verified student reviews</div>
            </div>

            {/* Highlight 3: Level */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/80 hover:border-[#0056D2]/50 transition">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold text-[#1F1F1F]">Beginner Level</div>
              <div className="text-xs text-[#6B7280] mt-0.5">No prior NLP coding background required</div>
            </div>

            {/* Highlight 4: Schedule */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/80 hover:border-[#0056D2]/50 transition">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold text-[#1F1F1F]">Flexible Schedule</div>
              <div className="text-xs text-[#6B7280] mt-0.5">~3 months at 5 hours per week</div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. "What You Will Learn" Grid */}
      <section className="py-14 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F] tracking-tight">
              What you will learn
            </h2>
            <p className="mt-2 text-sm text-[#4B5563]">
              Gain job-ready skills designed in collaboration with engineering teams at Fortune 500 enterprises.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-[#D1D5DB] p-6 sm:p-8 bg-[#F8F9FA]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'Build synchronized media playback architectures with millisecond-precision audio scrubbers and caption tracks.',
                'Implement human-in-the-loop (HITL) review loops to let managers refine, approve, and auto-dispatch meeting minutes.',
                'Construct vector-grounded RAG audit matrices that map decisions directly to verbatim timestamped audio quotes.',
                'Master speaker diarization principles, turn attribution algorithms, and real-time talk-time parity analytics.',
                'Integrate enterprise webhooks with Jira, Linear, and Slack for automatic sprint ticket creation from meeting action items.',
                'Implement CRDT collaborative conflict-free resolution for offline mobile notes and executive summaries.',
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#0056D2] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#374151] leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Courses in this Professional Certificate */}
      <section className="py-14 bg-[#F8F9FA] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F] tracking-tight">
                Courses in this Professional Certificate
              </h2>
              <p className="text-sm text-[#4B5563] mt-1">
                4 comprehensive applied courses taking you from fundamentals to enterprise architecture.
              </p>
            </div>

            <button
              onClick={onLaunchWorkspace}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0056D2] hover:underline"
            >
              <span>Explore Interactive Labs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Course List Cards */}
          <div className="space-y-4">
            {coursesInSeries.map((course) => (
              <div
                key={course.number}
                className="bg-white rounded-xl border border-[#D1D5DB] p-6 transition hover:shadow-md hover:border-[#0056D2]/60"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F3F4F6]">
                  <div>
                    <span className="text-xs font-bold text-[#0056D2] uppercase tracking-wider">
                      COURSE {course.number}
                    </span>
                    <h3 className="text-lg font-bold text-[#1F1F1F] mt-0.5">
                      {course.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1 font-semibold text-[#1F1F1F]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {course.rating}
                    </span>
                    <span>{course.reviews}</span>
                    <span>·</span>
                    <span className="font-mono">{course.duration}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    {course.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[#6B7280]">Skills covered:</span>
                    {course.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="rounded-full bg-[#F0F5FF] text-[#0056D2] px-3 py-0.5 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Instructor Showcase */}
      <section className="py-14 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F] tracking-tight">
            Meet Your Instructors
          </h2>
          <p className="text-sm text-[#4B5563] mt-1">
            Learn from senior product directors and principal architects who build real meeting intelligence infrastructure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
                alt="Elena Rostova"
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div className="text-base font-bold text-[#1F1F1F] mt-3">Elena Rostova</div>
              <div className="text-xs text-[#0056D2] font-semibold">VP of Product & AI Systems</div>
              <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
                Former lead product architect at enterprise SaaS scale. Pioneer in human-in-the-loop executive summarization tools.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                alt="Marcus Vance"
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div className="text-base font-bold text-[#1F1F1F] mt-3">Marcus Vance</div>
              <div className="text-xs text-[#0056D2] font-semibold">Principal Cloud Architect</div>
              <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
                Specializes in vector databases, semantic RAG pipelines, and sub-100ms multi-tenant GraphQL gateways.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80"
                alt="Sarah Chen"
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div className="text-base font-bold text-[#1F1F1F] mt-3">Sarah Chen</div>
              <div className="text-xs text-[#0056D2] font-semibold">Head of Design & Accessibility</div>
              <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
                International design system leader with a focus on WCAG AA high-contrast enterprise audio/video interfaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Bar */}
      <section className="py-12 bg-[#0056D2] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight">
              Start building meeting intelligence skills today
            </h3>
            <p className="text-sm text-blue-100 mt-1">
              Join over 1.5 million learners. Includes hands-on labs and official career certificate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnroll}
              className="bg-white hover:bg-slate-100 text-[#0056D2] font-bold text-sm px-6 py-3.5 rounded shadow-md transition"
            >
              Enroll for Free
            </button>
            <button
              onClick={onNavigateToProfile}
              className="bg-transparent hover:bg-white/10 border border-white text-white font-semibold text-sm px-5 py-3.5 rounded transition"
            >
              View Learner Profile
            </button>
          </div>
        </div>
      </section>

      {/* Coursera-style Footer */}
      <footer className="bg-[#F8F9FA] border-t border-[#E5E7EB] py-12 text-xs text-[#6B7280]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-[#1F1F1F] uppercase mb-3">MeetSync Learning</div>
            <ul className="space-y-2">
              <li className="hover:text-[#0056D2] cursor-pointer">About the Certificate</li>
              <li className="hover:text-[#0056D2] cursor-pointer">Leadership & Faculty</li>
              <li className="hover:text-[#0056D2] cursor-pointer">Enterprise Partnerships</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-[#1F1F1F] uppercase mb-3">Resources</div>
            <ul className="space-y-2">
              <li className="hover:text-[#0056D2] cursor-pointer">Interactive Lab Workspace</li>
              <li className="hover:text-[#0056D2] cursor-pointer">RAG Documentation</li>
              <li className="hover:text-[#0056D2] cursor-pointer">Financial Aid Guidance</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-[#1F1F1F] uppercase mb-3">Community</div>
            <ul className="space-y-2">
              <li className="hover:text-[#0056D2] cursor-pointer">Learners Forum</li>
              <li className="hover:text-[#0056D2] cursor-pointer">Alumni Network</li>
              <li className="hover:text-[#0056D2] cursor-pointer">Career Success Stories</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-[#1F1F1F] uppercase mb-3">Legal & Trust</div>
            <ul className="space-y-2">
              <li className="hover:text-[#0056D2] cursor-pointer">SOC2 Type II Audit</li>
              <li className="hover:text-[#0056D2] cursor-pointer">Privacy & Cookie Policy</li>
              <li className="hover:text-[#0056D2] cursor-pointer">Accessibility Statement (AA)</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-[#E5E7EB] text-center text-xs">
          © 2026 MeetSync AI Learning Corp. All rights reserved. Coursera-inspired enterprise design system.
        </div>
      </footer>
    </div>
  );
};
