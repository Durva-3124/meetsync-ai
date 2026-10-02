import React, { useState } from 'react';
import {
  User,
  MapPin,
  Briefcase,
  Share2,
  Edit3,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Calendar,
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sliders,
  Bell,
  Mail,
  Lock,
  Globe,
  Check,
} from 'lucide-react';

interface CourseraProfilePageProps {
  onContinueCourse: (courseId: string) => void;
  onViewCertificateModal: () => void;
  onLaunchWorkspace: () => void;
  onShareProfile: () => void;
}

export const CourseraProfilePage: React.FC<CourseraProfilePageProps> = ({
  onContinueCourse,
  onViewCertificateModal,
  onLaunchWorkspace,
  onShareProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'skills' | 'settings'>('courses');
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Profile data
  const [userProfile, setUserProfile] = useState({
    name: 'Elena Rostova',
    title: 'Senior AI Systems & Product Architect',
    company: 'Acme Enterprise Global',
    location: 'San Francisco, CA · United States',
    bio: 'Leading product initiatives in AI-driven meeting intelligence, collaborative diarization, and verifiable semantic RAG decision pipelines.',
    joinedDate: 'Joined March 2024',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  });

  const enrolledCourses = [
    {
      id: 'course-2',
      code: 'COURSE 2',
      title: 'Human-in-the-Loop (HITL) Minutes of Meeting Systems',
      progress: 78,
      totalHours: '18 hours',
      nextLesson: 'Lesson 4: Building synchronized dual-tone scrubbers with interactive playheads',
      dueDate: 'Due in 3 days',
      instructor: 'MeetSync Engineering Guild',
      thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'course-3',
      code: 'COURSE 3',
      title: 'Decision Traceability & Vector-Grounded RAG Auditing',
      progress: 25,
      totalHours: '16 hours',
      nextLesson: 'Lesson 2: Calculating cosine similarity distance on executive consensus quotes',
      dueDate: 'Due in 10 days',
      instructor: 'Marcus Vance',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const earnedCertificates = [
    {
      id: 'cert-1',
      title: 'Foundations of Meeting Diarization & Speech Processing',
      issueDate: 'Completed September 28, 2026',
      credentialId: 'CERT-MS-884920',
      grade: 'Grade Achieved: 98.4%',
      skills: ['Acoustic Diarization', 'Speech-to-Text NLP', 'Frame Timecodes'],
      verifiedBy: 'MeetSync Enterprise Institute',
    },
    {
      id: 'cert-intro',
      title: 'Enterprise AI Governance & SOC2 Compliance Specialization',
      issueDate: 'Completed August 14, 2026',
      credentialId: 'CERT-GOV-412093',
      grade: 'Grade Achieved: 100%',
      skills: ['SOC2 Type II', 'Data Privacy', 'Audit Trail Architecture'],
      verifiedBy: 'Cloud Security Alliance Partner',
    },
  ];

  const skillMatrix = [
    { name: 'HITL Workflows', level: 'Advanced', endorsements: 48 },
    { name: 'Meeting Intelligence', level: 'Advanced', endorsements: 62 },
    { name: 'RAG Auditing', level: 'Proficient', endorsements: 39 },
    { name: 'Speaker Diarization', level: 'Proficient', endorsements: 31 },
    { name: 'React 19 & Tailwind', level: 'Advanced', endorsements: 85 },
    { name: 'CRDT Offline Sync', level: 'Intermediate', endorsements: 22 },
    { name: 'Enterprise API Design', level: 'Advanced', endorsements: 54 },
    { name: 'WCAG AA Accessibility', level: 'Advanced', endorsements: 41 },
  ];

  return (
    <div className="w-full bg-[#F8F9FA] min-h-screen text-[#1F1F1F] pb-16">
      
      {/* 1. Profile Header / Banner */}
      <div className="bg-white border-b border-[#E5E7EB] pt-8 pb-6 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            {/* User Avatar + Identity Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-[#0056D2]/20"
                />
                <span
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white"
                  title="Active Certified Learner"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] tracking-tight">
                    {userProfile.name}
                  </h1>
                  <span className="bg-[#EBF3FF] text-[#0056D2] font-semibold text-xs px-2.5 py-0.5 rounded-full border border-[#CCE0FF]">
                    Professional Learner
                  </span>
                </div>

                <div className="text-sm font-semibold text-[#4B5563]">
                  {userProfile.title}
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#6B7280] pt-1">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    {userProfile.company}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    {userProfile.location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    {userProfile.joinedDate}
                  </span>
                </div>

                <p className="text-xs text-[#4B5563] max-w-2xl pt-2 leading-relaxed">
                  {userProfile.bio}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-start">
              <button
                onClick={() => setEditProfileOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#1F1F1F] bg-white border border-[#D1D5DB] rounded hover:bg-[#F9FAFB] transition shadow-2xs min-h-[38px]"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={onShareProfile}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0056D2] hover:bg-[#00419E] rounded transition shadow-2xs min-h-[38px]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Profile Link</span>
              </button>
            </div>

          </div>

          {/* 2. Tabs Navigation */}
          <div className="flex items-center space-x-8 mt-8 border-b border-[#E5E7EB] text-sm font-semibold">
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'courses'
                  ? 'border-[#0056D2] text-[#0056D2]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1F1F1F]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>My Courses & Certificates</span>
              <span className="ml-1 text-xs bg-[#F3F4F6] text-[#4B5563] px-2 py-0.5 rounded-full font-mono">
                {enrolledCourses.length + earnedCertificates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`pb-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'skills'
                  ? 'border-[#0056D2] text-[#0056D2]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1F1F1F]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Skills & Achievements</span>
              <span className="ml-1 text-xs bg-[#F3F4F6] text-[#4B5563] px-2 py-0.5 rounded-full font-mono">
                {skillMatrix.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-[#0056D2] text-[#0056D2]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1F1F1F]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Main Body Content Based on Active Tab */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* TAB 1: Enrolled Courses & Certificates */}
        {activeTab === 'courses' && (
          <div className="space-y-10">
            
            {/* Active Enrolled Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F1F1F]">In Progress Courses</h2>
                  <p className="text-xs text-[#6B7280]">Pick up where you left off in your professional specialization</p>
                </div>

                <button
                  onClick={onLaunchWorkspace}
                  className="text-xs font-bold text-[#0056D2] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Practice Lab</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-[#D1D5DB] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      {/* Course Image Header */}
                      <div className="relative h-32 bg-slate-800 overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute top-3 left-3 bg-[#0056D2] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {course.code}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded">
                          {course.totalHours}
                        </div>
                      </div>

                      {/* Course Card Body */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-base font-bold text-[#1F1F1F] leading-snug">
                          {course.title}
                        </h3>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-[#1F1F1F]">{course.progress}% Completed</span>
                            <span className="text-[#6B7280]">{course.dueDate}</span>
                          </div>
                          <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0056D2] rounded-full transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Next recommended lesson */}
                        <div className="rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] p-3 text-xs">
                          <div className="font-semibold text-[#6B7280] uppercase text-[10px] tracking-wider">
                            Next Up:
                          </div>
                          <div className="font-medium text-[#1F1F1F] mt-0.5 line-clamp-2">
                            {course.nextLesson}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Button */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => onContinueCourse(course.id)}
                        className="w-full bg-[#0056D2] hover:bg-[#00419E] text-white font-bold text-xs py-2.5 rounded transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Continue Learning</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earned Certificates Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F1F1F]">Earned Certificates & Verified Credentials</h2>
                  <p className="text-xs text-[#6B7280]">Official shareable certificates with cryptographic verification</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {earnedCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white rounded-xl border border-[#D1D5DB] p-6 shadow-xs flex flex-col justify-between hover:border-[#0056D2]/60 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                          {cert.grade}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#1F1F1F] mt-3">
                        {cert.title}
                      </h3>

                      <div className="text-xs text-[#6B7280] mt-1">
                        {cert.issueDate} · <span className="font-mono text-[#0056D2] font-semibold">{cert.credentialId}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {cert.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-[#F3F4F6] text-[#374151] text-[11px] font-medium px-2 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                      <span className="text-[#6B7280]">{cert.verifiedBy}</span>
                      <button
                        onClick={onViewCertificateModal}
                        className="text-[#0056D2] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>View Certificate</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Skills & Achievements */}
        {activeTab === 'skills' && (
          <div className="bg-white rounded-xl border border-[#D1D5DB] p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1F1F1F]">Verified Skill Matrix</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Skills validated through real hands-on projects and interactive grading in MeetSync AI labs
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {skillMatrix.map((skill, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] p-4 space-y-1 hover:border-[#0056D2]/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1F1F1F]">{skill.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#0056D2]" />
                  </div>
                  <div className="text-xs text-[#0056D2] font-semibold">{skill.level}</div>
                  <div className="text-[11px] text-[#6B7280] pt-1">
                    {skill.endorsements} peer & automated assessments
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Want to add more skills to your profile?</span>
              <button
                onClick={onLaunchWorkspace}
                className="text-xs font-bold text-[#0056D2] hover:underline"
              >
                Complete Next Lab Project →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Account Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-[#D1D5DB] p-6 sm:p-8 shadow-xs max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1F1F1F]">Account & Privacy Settings</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">Manage notifications, public profile visibility, and certificates</p>
            </div>

            <div className="divide-y divide-[#E5E7EB] text-sm">
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#1F1F1F]">Public Profile Link</div>
                  <div className="text-xs text-[#6B7280]">Allow prospective employers to view verified certificates</div>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#0056D2] cursor-pointer" />
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#1F1F1F]">Course Deadline Reminders</div>
                  <div className="text-xs text-[#6B7280]">Send email notifications 48 hours prior to assignment deadlines</div>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#0056D2] cursor-pointer" />
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#1F1F1F]">LinkedIn Credential Auto-Sync</div>
                  <div className="text-xs text-[#6B7280]">Publish new badges directly to your LinkedIn licenses section</div>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#0056D2] cursor-pointer" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Interactive Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#D1D5DB] p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#1F1F1F] border-b border-[#E5E7EB] pb-3">
              Edit Learner Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#374151]">Full Display Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className="w-full mt-1 p-2 rounded border border-[#D1D5DB] text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-[#374151]">Job Title</label>
                <input
                  type="text"
                  value={userProfile.title}
                  onChange={(e) => setUserProfile({ ...userProfile, title: e.target.value })}
                  className="w-full mt-1 p-2 rounded border border-[#D1D5DB] text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-[#374151]">Company / Organization</label>
                <input
                  type="text"
                  value={userProfile.company}
                  onChange={(e) => setUserProfile({ ...userProfile, company: e.target.value })}
                  className="w-full mt-1 p-2 rounded border border-[#D1D5DB] text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-[#374151]">Location</label>
                <input
                  type="text"
                  value={userProfile.location}
                  onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                  className="w-full mt-1 p-2 rounded border border-[#D1D5DB] text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-[#374151]">Short Bio</label>
                <textarea
                  rows={3}
                  value={userProfile.bio}
                  onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                  className="w-full mt-1 p-2 rounded border border-[#D1D5DB] text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                onClick={() => setEditProfileOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#F3F4F6] rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditProfileOpen(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0056D2] hover:bg-[#00419E] rounded shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
