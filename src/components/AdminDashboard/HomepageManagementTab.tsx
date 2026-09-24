import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash2, Edit3, Save, BookOpen, User, DollarSign, Calendar, ChevronDown, ChevronUp,
  AlertTriangle, Sparkles, Check, CheckCircle2, RotateCcw, Image as ImageIcon, Clock,
  Sliders, Play, ArrowUp, ArrowDown, ExternalLink, Layers, Terminal, ShieldCheck,
  Zap, Cpu, Code2, MessageSquare, Send, Star, GraduationCap, Eye, Link2, FolderOpen,
  Globe, Layout, Award, Radar, Lock, Unlock, CheckSquare, RefreshCw, Smartphone
} from "lucide-react";
import {
  CMSFullConfig, CMSClass, CMSAboutCard, CMSSkillItem, CMSProjectItem,
  CMSTestimonialItem, CMSStatItem
} from "../../types/cms";
import {
  DEFAULT_CMS_CONFIG, DEFAULT_HOMEPAGE_CLASSES, loadCmsConfig, saveCmsConfig
} from "../../constants/defaultCms";

// Curated developer & design high-resolution images for quick 1-click selection
const CURATED_IMAGE_SUGGESTIONS = [
  { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop", name: "Modern IDE Code Editor" },
  { url: "https://images.unsplash.com/photo-1516116211223-5c359a36298a?q=80&w=800&auto=format&fit=crop", name: "Clean TypeScript Code" },
  { url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop", name: "Cybersecurity & Shield" },
  { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop", name: "Terminal & Hacking Matrix" },
  { url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop", name: "Smart Campus & Education" },
  { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop", name: "Distributed Cloud Server" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop", name: "Developer Avatar 1" },
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", name: "Developer Avatar 2" },
  { url: "/src/assets/images/ChatGPT Image Jun 28, 2026, 10_07_30 PM.png", name: "ROOZZERO Hero Background" },
  { url: "/src/assets/images/photo_2024-10-20_19-21-55.jpg", name: "ROOZZERO Bio Portrait" }
];

export { DEFAULT_HOMEPAGE_CLASSES };

interface HomepageManagementTabProps {
  showCustomToast: (msg: string, type?: "info" | "success" | "warning") => void;
}

type SectionTabId =
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "classes"
  | "students"
  | "contact"
  | "footer";

export default function HomepageManagementTab({ showCustomToast }: HomepageManagementTabProps) {
  // Active section tab
  const [activeSection, setActiveSection] = useState<SectionTabId>("hero");

  // Loaded published config
  const [publishedConfig, setPublishedConfig] = useState<CMSFullConfig>(() => loadCmsConfig());

  // Working draft state
  const [draftConfig, setDraftConfig] = useState<CMSFullConfig>(() => loadCmsConfig());

  // Image Picker Modal State
  const [imagePickerTarget, setImagePickerTarget] = useState<{
    fieldPath: string;
    currentValue: string;
  } | null>(null);

  // Expanded items state for accordions
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [expandedTestimonialId, setExpandedTestimonialId] = useState<string | null>(null);

  // Delete target state
  const [deleteDialog, setDeleteDialog] = useState<{
    type: "course" | "skill" | "project" | "card" | "testimonial" | "stat" | "word";
    id: string;
    title: string;
  } | null>(null);

  // Check if draft has unsaved changes compared to published state
  const hasUnpublishedChanges = JSON.stringify(draftConfig) !== JSON.stringify(publishedConfig);

  // Save draft without publishing
  const handleSaveDraft = () => {
    saveCmsConfig(draftConfig);
    setPublishedConfig(draftConfig);
    showCustomToast("Draft saved to browser storage!", "info");
  };

  // Publish changes to live site
  const handlePublishAll = () => {
    saveCmsConfig(draftConfig);
    setPublishedConfig(draftConfig);
    showCustomToast("All Homepage sections updated & published live!", "success");
  };

  // Reset current section to factory default
  const handleResetCurrentSection = () => {
    if (activeSection === "hero") {
      setDraftConfig((prev) => ({ ...prev, hero: { ...DEFAULT_CMS_CONFIG.hero } }));
    } else if (activeSection === "about") {
      setDraftConfig((prev) => ({ ...prev, aboutMe: { ...DEFAULT_CMS_CONFIG.aboutMe } }));
    } else if (activeSection === "skills") {
      setDraftConfig((prev) => ({ ...prev, skills: { ...DEFAULT_CMS_CONFIG.skills } }));
    } else if (activeSection === "projects") {
      setDraftConfig((prev) => ({ ...prev, projects: { ...DEFAULT_CMS_CONFIG.projects } }));
    } else if (activeSection === "classes") {
      setDraftConfig((prev) => ({
        ...prev,
        classes: [...DEFAULT_CMS_CONFIG.classes],
        classesHeader: { ...DEFAULT_CMS_CONFIG.classesHeader }
      }));
    } else if (activeSection === "students") {
      setDraftConfig((prev) => ({ ...prev, testimonials: { ...DEFAULT_CMS_CONFIG.testimonials } }));
    } else if (activeSection === "contact") {
      setDraftConfig((prev) => ({ ...prev, contact: { ...DEFAULT_CMS_CONFIG.contact } }));
    } else if (activeSection === "footer") {
      setDraftConfig((prev) => ({ ...prev, footer: { ...DEFAULT_CMS_CONFIG.footer } }));
    }
    showCustomToast(`Reset "${activeSection}" to initial defaults.`, "info");
  };

  // Reset everything to factory defaults
  const handleResetAllToDefaults = () => {
    if (window.confirm("Are you sure you want to reset ALL homepage sections to factory default configuration?")) {
      setDraftConfig(DEFAULT_CMS_CONFIG);
      saveCmsConfig(DEFAULT_CMS_CONFIG);
      setPublishedConfig(DEFAULT_CMS_CONFIG);
      showCustomToast("Reset entire website configuration to factory defaults.", "warning");
    }
  };

  // Discard draft changes
  const handleDiscardDraft = () => {
    setDraftConfig(publishedConfig);
    showCustomToast("Discarded draft changes. Restored to published version.", "info");
  };

  // Universal nested state updater helper
  const updateDraft = (updater: (prev: CMSFullConfig) => CMSFullConfig) => {
    setDraftConfig((prev) => updater(prev));
  };

  // Set image via picker
  const handleSelectSuggestedImage = (url: string) => {
    if (!imagePickerTarget) return;
    const { fieldPath } = imagePickerTarget;

    updateDraft((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = fieldPath.split(".");
      let curr: any = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = url;
      return copy;
    });

    setImagePickerTarget(null);
    showCustomToast("Image selected & updated!", "success");
  };

  // Delete modal executor
  const executeDelete = () => {
    if (!deleteDialog) return;
    const { type, id } = deleteDialog;

    if (type === "card") {
      updateDraft((prev) => ({
        ...prev,
        aboutMe: {
          ...prev.aboutMe,
          cards: prev.aboutMe.cards.filter((c) => c.id !== id)
        }
      }));
    } else if (type === "skill") {
      updateDraft((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          skills: prev.skills.skills.filter((s) => s.id !== id)
        }
      }));
    } else if (type === "project") {
      updateDraft((prev) => ({
        ...prev,
        projects: {
          ...prev.projects,
          projects: prev.projects.projects.filter((p) => p.id !== id)
        }
      }));
    } else if (type === "course") {
      updateDraft((prev) => ({
        ...prev,
        classes: prev.classes.filter((c) => c.id !== id)
      }));
    } else if (type === "testimonial") {
      updateDraft((prev) => ({
        ...prev,
        testimonials: {
          ...prev.testimonials,
          testimonials: prev.testimonials.testimonials.filter((t) => t.id !== id)
        }
      }));
    } else if (type === "stat") {
      updateDraft((prev) => ({
        ...prev,
        testimonials: {
          ...prev.testimonials,
          stats: prev.testimonials.stats.filter((s) => s.id !== id)
        }
      }));
    }

    setDeleteDialog(null);
    showCustomToast("Item removed.", "warning");
  };

  // Section tabs definitions with icons
  const SECTION_TABS = [
    { id: "hero", label: "Hero & Intro", icon: Sparkles, color: "text-emerald-400" },
    { id: "about", label: "Who's Me", icon: User, color: "text-blue-400" },
    { id: "skills", label: "Skills & Stack", icon: Zap, color: "text-amber-400" },
    { id: "projects", label: "Projects", icon: FolderOpen, color: "text-purple-400" },
    { id: "classes", label: "Classes & Curriculum", icon: BookOpen, color: "text-emerald-400" },
    { id: "students", label: "Students & Reviews", icon: GraduationCap, color: "text-cyan-400" },
    { id: "contact", label: "Contact & Social", icon: Send, color: "text-rose-400" },
    { id: "footer", label: "Footer & Branding", icon: Layout, color: "text-indigo-400" }
  ];

  return (
    <div id="homepage-comprehensive-dashboard" className="flex flex-col h-full bg-[#050508] p-4 sm:p-6 space-y-6 overflow-y-auto text-white">
      
      {/* =========================================================================
          TOP COMMAND BAR & CONTROLS
         ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm">
              <Layout size={20} />
            </span>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Landing Page Management</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-mono font-medium">
                  Full CMS
                </span>
              </h1>
              <p className="text-xs text-white/50 mt-0.5">
                Customize every single text, image, card, and section of the public homepage with real-time sync.
              </p>
            </div>
          </div>
        </div>

        {/* Global Save / Publish / Reset Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {hasUnpublishedChanges && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Unpublished edits
            </span>
          )}

          <button
            onClick={handleResetCurrentSection}
            className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold text-white/70 hover:text-white flex items-center gap-1.5 transition-all bg-white/[0.02]"
            title="Restore this specific section to factory default"
          >
            <RotateCcw size={13} />
            Reset Section
          </button>

          {hasUnpublishedChanges && (
            <button
              onClick={handleDiscardDraft}
              className="px-3 py-1.5 rounded-xl border border-rose-500/20 hover:border-rose-500/40 text-xs font-semibold text-rose-300 hover:text-rose-200 flex items-center gap-1.5 transition-all bg-rose-500/5"
            >
              Discard
            </button>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={!hasUnpublishedChanges}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              hasUnpublishedChanges
                ? "bg-white/5 border-white/20 text-white hover:bg-white/10 cursor-pointer"
                : "border-white/5 text-white/30 cursor-not-allowed bg-transparent"
            }`}
          >
            <Save size={13} />
            Save Draft
          </button>

          <button
            onClick={handlePublishAll}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_4px_16px_rgba(16,185,129,0.25)] ${
              hasUnpublishedChanges
                ? "bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer font-black"
                : "bg-emerald-500/30 text-emerald-300/40 cursor-not-allowed"
            }`}
          >
            <Sparkles size={13} />
            Publish Changes
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION NAVIGATION TABS
         ========================================================================= */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-x-auto scrollbar-none">
        {SECTION_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as SectionTabId)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-white text-black shadow-lg shadow-white/10 font-bold"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={14} className={isActive ? "text-black" : tab.color} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SECTION 1: HERO & INTRO MANAGEMENT
         ========================================================================= */}
      {activeSection === "hero" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                Hero Banner &amp; Headline
              </h2>
              <p className="text-xs text-white/50">
                Configure main landing title, typing headline phrases, and the background portrait image.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Inputs */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Small Top Badge ("I'M")
                  </label>
                  <input
                    type="text"
                    value={draftConfig.hero.badge || ""}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, badge: e.target.value }
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="I'M"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Main Headline Title
                  </label>
                  <input
                    type="text"
                    value={draftConfig.hero.headline || ""}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, headline: e.target.value }
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs font-bold uppercase tracking-wider focus:border-emerald-500 focus:outline-none"
                    placeholder="ROOZZERO"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                  Hero Background Portrait Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draftConfig.hero.heroImage || ""}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, heroImage: e.target.value }
                      }))
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    placeholder="/path or https://image-url"
                  />
                  <button
                    onClick={() =>
                      setImagePickerTarget({
                        fieldPath: "hero.heroImage",
                        currentValue: draftConfig.hero.heroImage
                      })
                    }
                    className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon size={14} className="text-emerald-400" />
                    Browse
                  </button>
                </div>
              </div>

              {/* Animated Typing Phrases Manager */}
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Terminal size={14} className="text-emerald-400" />
                      Rotating Typing Subtitles
                    </span>
                    <p className="text-[11px] text-white/40">
                      These dynamic phrases type out automatically next to the glowing emerald status pulse.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      updateDraft((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          animatedTexts: [...prev.hero.animatedTexts, "New Engineering Skill"]
                        }
                      }));
                      showCustomToast("Added typing phrase.", "info");
                    }}
                    className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    Add Phrase
                  </button>
                </div>

                <div className="space-y-2">
                  {draftConfig.hero.animatedTexts.map((txt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/30 w-4 text-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={txt}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const arr = [...prev.hero.animatedTexts];
                            arr[idx] = val;
                            return { ...prev, hero: { ...prev.hero, animatedTexts: arr } };
                          });
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (draftConfig.hero.animatedTexts.length <= 1) {
                            showCustomToast("Must have at least one phrase.", "warning");
                            return;
                          }
                          updateDraft((prev) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              animatedTexts: prev.hero.animatedTexts.filter((_, i) => i !== idx)
                            }
                          }));
                        }}
                        className="p-2 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Live Mini Preview */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <Eye size={12} className="text-emerald-400" />
                Live Preview
              </span>
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl flex flex-col justify-end p-5">
                <img
                  src={draftConfig.hero.heroImage}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity filter brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="relative z-10 text-left">
                  <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
                    {draftConfig.hero.badge}
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-widest uppercase mt-0.5">
                    {draftConfig.hero.headline}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs text-emerald-400 uppercase font-bold">
                      {draftConfig.hero.animatedTexts[0] || "Full Stack Engineering"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: WHO'S ME / ABOUT SECTION MANAGEMENT
         ========================================================================= */}
      {activeSection === "about" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User size={16} className="text-blue-400" />
                Who's Me / About Section &amp; Bento Cards
              </h2>
              <p className="text-xs text-white/50">
                Edit bio presentation, CV &amp; GitHub links, bio portrait, and the 4 statistics Bento cards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Bio Details */}
            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Badge Pill
                  </label>
                  <input
                    type="text"
                    value={draftConfig.aboutMe.badge}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        aboutMe: { ...prev.aboutMe, badge: e.target.value }
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={draftConfig.aboutMe.title}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        aboutMe: { ...prev.aboutMe, title: e.target.value }
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                  Bio / Introduction Text
                </label>
                <textarea
                  rows={3}
                  value={draftConfig.aboutMe.bio}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      aboutMe: { ...prev.aboutMe, bio: e.target.value }
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs leading-relaxed focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    CV Download Link
                  </label>
                  <input
                    type="text"
                    value={draftConfig.aboutMe.cvUrl}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        aboutMe: { ...prev.aboutMe, cvUrl: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    value={draftConfig.aboutMe.githubUrl}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        aboutMe: { ...prev.aboutMe, githubUrl: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                  Bio Portrait Photo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draftConfig.aboutMe.portraitImage}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        aboutMe: { ...prev.aboutMe, portraitImage: e.target.value }
                      }))
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      setImagePickerTarget({
                        fieldPath: "aboutMe.portraitImage",
                        currentValue: draftConfig.aboutMe.portraitImage
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon size={14} className="text-blue-400" />
                    Browse
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Bio Image Preview */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Eye size={12} className="text-blue-400" />
                Portrait Preview
              </span>
              <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center shadow-xl">
                <img
                  src={draftConfig.aboutMe.portraitImage}
                  alt="Portrait preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-left">
                  <span className="text-xs font-bold text-white block">Roozbeh Tavakoli</span>
                  <span className="text-[10px] font-mono text-white/60">Frontend Developer &amp; Security Engineer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Stats Cards Manager */}
          <div className="pt-4 border-t border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award size={15} className="text-emerald-400" />
                  Bento Grid Cards ({draftConfig.aboutMe.cards.length} Cards)
                </h3>
                <p className="text-xs text-white/50">
                  Manage the cards displayed next to the bio photo. Edit values, titles, badges, and bottom tags.
                </p>
              </div>

              <button
                onClick={() => {
                  const newCard: CMSAboutCard = {
                    id: `card-${Date.now()}`,
                    tag: "SPECIALTY",
                    badgeText: "High Impact",
                    badgeIcon: "Sparkles",
                    statNumber: "99%",
                    statSubtitle: "Satisfaction & Excellence",
                    footerLabel: "Performance",
                    footerValue: "Verified"
                  };
                  updateDraft((prev) => ({
                    ...prev,
                    aboutMe: {
                      ...prev.aboutMe,
                      cards: [...prev.aboutMe.cards, newCard]
                    }
                  }));
                  showCustomToast("New Bento card added!", "success");
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={13} />
                Add Bento Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftConfig.aboutMe.cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.08] hover:border-emerald-500/30 transition-all space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-emerald-400 font-bold">
                      Card #{idx + 1}
                    </span>
                    <button
                      onClick={() =>
                        setDeleteDialog({
                          type: "card",
                          id: card.id,
                          title: card.tag
                        })
                      }
                      className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                        Header Tag
                      </label>
                      <input
                        type="text"
                        value={card.tag}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            aboutMe: {
                              ...prev.aboutMe,
                              cards: prev.aboutMe.cards.map((c) =>
                                c.id === card.id ? { ...c, tag: val } : c
                              )
                            }
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={card.badgeText}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            aboutMe: {
                              ...prev.aboutMe,
                              cards: prev.aboutMe.cards.map((c) =>
                                c.id === card.id ? { ...c, badgeText: val } : c
                              )
                            }
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-emerald-400 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                        Big Stat Number / Text
                      </label>
                      <input
                        type="text"
                        value={card.statNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            aboutMe: {
                              ...prev.aboutMe,
                              cards: prev.aboutMe.cards.map((c) =>
                                c.id === card.id ? { ...c, statNumber: val } : c
                              )
                            }
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-base font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                        Stat Subtitle
                      </label>
                      <input
                        type="text"
                        value={card.statSubtitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            aboutMe: {
                              ...prev.aboutMe,
                              cards: prev.aboutMe.cards.map((c) =>
                                c.id === card.id ? { ...c, statSubtitle: val } : c
                              )
                            }
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white/80 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                        Footer Left Label
                      </label>
                      <input
                        type="text"
                        value={card.footerLabel}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            aboutMe: {
                              ...prev.aboutMe,
                              cards: prev.aboutMe.cards.map((c) =>
                                c.id === card.id ? { ...c, footerLabel: val } : c
                              )
                            }
                          }));
                        }}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white/60 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                        Footer Right Status
                      </label>
                      <input
                        type="text"
                        value={card.footerValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            aboutMe: {
                              ...prev.aboutMe,
                              cards: prev.aboutMe.cards.map((c) =>
                                c.id === card.id ? { ...c, footerValue: val } : c
                              )
                            }
                          }));
                        }}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-white/10 text-emerald-400 text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: SKILLS & STACK MANAGEMENT
         ========================================================================= */}
      {activeSection === "skills" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                Skills &amp; Tech Stack Cards
              </h2>
              <p className="text-xs text-white/50">
                Configure skill items, proficiencies, progress bars, level badges, and category classifications.
              </p>
            </div>
            <button
              onClick={() => {
                const newSkill: CMSSkillItem = {
                  id: `sk-${Date.now()}`,
                  name: "Docker & Kubernetes",
                  category: "backend",
                  percentage: 85,
                  levelBadge: "Container Orchestration",
                  description: "Containerization, microservice deployment, and cluster auto-scaling."
                };
                updateDraft((prev) => ({
                  ...prev,
                  skills: {
                    ...prev.skills,
                    skills: [...prev.skills.skills, newSkill]
                  }
                }));
                showCustomToast("New skill card added!", "success");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              Add Skill Card
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Badge Pill
              </label>
              <input
                type="text"
                value={draftConfig.skills.badge}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    skills: { ...prev.skills, badge: e.target.value }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Section Heading Title
              </label>
              <input
                type="text"
                value={draftConfig.skills.title}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    skills: { ...prev.skills, title: e.target.value }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
              />
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftConfig.skills.skills.map((skill, idx) => (
              <div
                key={skill.id}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.08] hover:border-amber-500/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-amber-400 font-bold">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            skills: prev.skills.skills.map((s) =>
                              s.id === skill.id ? { ...s, name: val } : s
                            )
                          }
                        }));
                      }}
                      className="px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white font-bold text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <select
                      value={skill.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            skills: prev.skills.skills.map((s) =>
                              s.id === skill.id ? { ...s, category: val } : s
                            )
                          }
                        }));
                      }}
                      className="px-2 py-1 rounded bg-zinc-900 border border-white/10 text-white/70 text-[10px] font-mono"
                    >
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="security">Security</option>
                    </select>

                    <button
                      onClick={() =>
                        setDeleteDialog({
                          type: "skill",
                          id: skill.id,
                          title: skill.name
                        })
                      }
                      className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Percentage Slider & Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[11px] font-mono text-white/40">Proficiency:</span>
                    <span className="font-mono text-emerald-400 font-bold">{skill.percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={skill.percentage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateDraft((prev) => ({
                        ...prev,
                        skills: {
                          ...prev.skills,
                          skills: prev.skills.skills.map((s) =>
                            s.id === skill.id ? { ...s, percentage: val } : s
                          )
                        }
                      }));
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                    Level Badge
                  </label>
                  <input
                    type="text"
                    value={skill.levelBadge}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        skills: {
                          ...prev.skills,
                          skills: prev.skills.skills.map((s) =>
                            s.id === skill.id ? { ...s, levelBadge: val } : s
                          )
                        }
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-emerald-400 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={skill.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        skills: {
                          ...prev.skills,
                          skills: prev.skills.skills.map((s) =>
                            s.id === skill.id ? { ...s, description: val } : s
                          )
                        }
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white/70 text-xs leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 4: FEATURED PROJECTS MANAGEMENT
         ========================================================================= */}
      {activeSection === "projects" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderOpen size={16} className="text-purple-400" />
                Featured Projects &amp; Systems
              </h2>
              <p className="text-xs text-white/50">
                Manage project tabs (TeacherShow / Aegis Sentinel / Nexus Engine), cover photos, disabled preview state, and descriptions.
              </p>
            </div>
            <button
              onClick={() => {
                const newProj: CMSProjectItem = {
                  id: `proj-${Date.now()}`,
                  tabLabel: "New Project",
                  title: "New Flagship Engineering Project",
                  badge: "Full-Stack System",
                  description: "High-performance web architecture with modern reactive state management.",
                  coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
                  tags: ["React", "TypeScript", "Vite"],
                  liveDemoUrl: "#",
                  githubUrl: "https://github.com/roozzero",
                  isPreviewDisabled: false
                };
                updateDraft((prev) => ({
                  ...prev,
                  projects: {
                    ...prev.projects,
                    projects: [...prev.projects.projects, newProj]
                  }
                }));
                showCustomToast("New project added!", "success");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Badge Pill
              </label>
              <input
                type="text"
                value={draftConfig.projects.badge}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    projects: { ...prev.projects, badge: e.target.value }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Section Title
              </label>
              <input
                type="text"
                value={draftConfig.projects.title}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    projects: { ...prev.projects, title: e.target.value }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {draftConfig.projects.projects.map((proj, idx) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-zinc-950/90 border border-white/[0.08] hover:border-purple-500/30 transition-all space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30">
                      Tab #{idx + 1}: {proj.tabLabel}
                    </span>
                    {proj.isPreviewDisabled && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        <Lock size={10} />
                        Preview Disabled
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setDeleteDialog({
                        type: "project",
                        id: proj.id,
                        title: proj.title
                      })
                    }
                    className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                      Tab Switcher Label
                    </label>
                    <input
                      type="text"
                      value={proj.tabLabel}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          projects: {
                            ...prev.projects,
                            projects: prev.projects.projects.map((p) =>
                              p.id === proj.id ? { ...p, tabLabel: val } : p
                            )
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                      Full Project Title
                    </label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          projects: {
                            ...prev.projects,
                            projects: prev.projects.projects.map((p) =>
                              p.id === proj.id ? { ...p, title: val } : p
                            )
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                    Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        projects: {
                          ...prev.projects,
                          projects: prev.projects.projects.map((p) =>
                            p.id === proj.id ? { ...p, description: val } : p
                          )
                        }
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                      Cover Banner Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={proj.coverImage}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            projects: {
                              ...prev.projects,
                              projects: prev.projects.projects.map((p) =>
                                p.id === proj.id ? { ...p, coverImage: val } : p
                              )
                            }
                          }));
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono"
                      />
                      <button
                        onClick={() =>
                          setImagePickerTarget({
                            fieldPath: `projects.projects.${idx}.coverImage`,
                            currentValue: proj.coverImage
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon size={13} className="text-purple-400" />
                        Browse
                      </button>
                    </div>
                  </div>

                  {/* Disable Preview Toggle */}
                  <div className="flex flex-col justify-end">
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                      Project Live Preview Button State
                    </label>
                    <div className="flex items-center gap-3 h-[42px] px-3.5 rounded-xl bg-zinc-900 border border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          updateDraft((prev) => ({
                            ...prev,
                            projects: {
                              ...prev.projects,
                              projects: prev.projects.projects.map((p) =>
                                p.id === proj.id ? { ...p, isPreviewDisabled: !p.isPreviewDisabled } : p
                              )
                            }
                          }));
                        }}
                        className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${
                          proj.isPreviewDisabled ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {proj.isPreviewDisabled ? (
                          <>
                            <Lock size={14} />
                            <span>Preview Disabled (Requested for Project 1)</span>
                          </>
                        ) : (
                          <>
                            <Unlock size={14} />
                            <span>Preview Enabled (Active)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 5: CLASSES & CURRICULUM MANAGEMENT
         ========================================================================= */}
      {activeSection === "classes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-400" />
                Classes &amp; Academy Courses
              </h2>
              <p className="text-xs text-white/50">
                Manage course cards, prices, instructor names, sessions count, banner images, and full syllabus modules.
              </p>
            </div>

            <button
              onClick={() => {
                const nextOrder = draftConfig.classes.length + 1;
                const newCourse: CMSClass = {
                  id: `cl-${Date.now()}`,
                  courseImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
                  courseName: "New High-Fidelity Masterclass",
                  instructor: "Roozbeh",
                  price: "$199",
                  shortDescription: "A fresh course focusing on modular design architecture and deployment patterns.",
                  description: "A fresh course focusing on modular design architecture and deployment patterns.",
                  sessions: 16,
                  status: "Published",
                  displayOrder: nextOrder,
                  tags: ["React", "TypeScript", "Vite"] as any,
                  syllabus: [
                    { id: `s1-${Date.now()}`, title: "Module 1: Layout Fundamentals", description: "Structuring pixel-perfect CSS grids and flex containers.", duration: "Session 1" }
                  ] as any
                };
                updateDraft((prev) => ({
                  ...prev,
                  classes: [...prev.classes, newCourse]
                }));
                setExpandedCourseId(newCourse.id);
                showCustomToast("New course card added!", "success");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              Add Course Card
            </button>
          </div>

          {/* Classes Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Badge Pill
              </label>
              <input
                type="text"
                value={draftConfig.classesHeader?.badge || "Academy"}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    classesHeader: {
                      badge: e.target.value,
                      title: prev.classesHeader?.title || "Latest Classes",
                      description: prev.classesHeader?.description || ""
                    }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Section Title
              </label>
              <input
                type="text"
                value={draftConfig.classesHeader?.title || "Latest Classes"}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    classesHeader: {
                      badge: prev.classesHeader?.badge || "Academy",
                      title: e.target.value,
                      description: prev.classesHeader?.description || ""
                    }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Subtitle Description
              </label>
              <input
                type="text"
                value={draftConfig.classesHeader?.description || "Explore our dynamic curriculum, interactive resources, and live lecture schedules."}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    classesHeader: {
                      badge: prev.classesHeader?.badge || "Academy",
                      title: prev.classesHeader?.title || "Latest Classes",
                      description: e.target.value
                    }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
              />
            </div>
          </div>

          {/* Courses Accordion List */}
          <div className="space-y-4">
            {draftConfig.classes.map((cls, idx) => {
              const isExpanded = expandedCourseId === cls.id;
              const syllabusItems = (cls as any).syllabus || [];

              return (
                <div
                  key={cls.id}
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? "bg-zinc-950/95 border-emerald-500/30 shadow-2xl"
                      : "bg-[#0b0b10] border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedCourseId(isExpanded ? null : cls.id)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-zinc-900">
                        <img src={cls.courseImage} alt={cls.courseName} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate">{cls.courseName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 font-bold">
                            {cls.price}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40 truncate">
                          {cls.instructor} • {cls.sessions || 16} Sessions • {syllabusItems.length} Syllabus Modules
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Move buttons */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (idx === 0) return;
                          const list = [...draftConfig.classes];
                          const temp = list[idx];
                          list[idx] = list[idx - 1];
                          list[idx - 1] = temp;
                          updateDraft((prev) => ({ ...prev, classes: list }));
                        }}
                        disabled={idx === 0}
                        className="p-1.5 text-white/40 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (idx === draftConfig.classes.length - 1) return;
                          const list = [...draftConfig.classes];
                          const temp = list[idx];
                          list[idx] = list[idx + 1];
                          list[idx + 1] = temp;
                          updateDraft((prev) => ({ ...prev, classes: list }));
                        }}
                        disabled={idx === draftConfig.classes.length - 1}
                        className="p-1.5 text-white/40 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({
                            type: "course",
                            id: cls.id,
                            title: cls.courseName
                          });
                        }}
                        className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>

                      {isExpanded ? <ChevronUp size={16} className="text-emerald-400 ml-1" /> : <ChevronDown size={16} className="text-white/40 ml-1" />}
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-5 border-t border-white/5 space-y-4 bg-black/40"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                              Course Name
                            </label>
                            <input
                              type="text"
                              value={cls.courseName}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => ({
                                  ...prev,
                                  classes: prev.classes.map((c) => (c.id === cls.id ? { ...c, courseName: val } : c))
                                }));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                              Instructor
                            </label>
                            <input
                              type="text"
                              value={cls.instructor}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => ({
                                  ...prev,
                                  classes: prev.classes.map((c) => (c.id === cls.id ? { ...c, instructor: val } : c))
                                }));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                              Price (e.g. $199)
                            </label>
                            <input
                              type="text"
                              value={cls.price}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => ({
                                  ...prev,
                                  classes: prev.classes.map((c) => (c.id === cls.id ? { ...c, price: val } : c))
                                }));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-emerald-400 text-xs font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                            Course Banner Image URL
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={cls.courseImage}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => ({
                                  ...prev,
                                  classes: prev.classes.map((c) => (c.id === cls.id ? { ...c, courseImage: val } : c))
                                }));
                              }}
                              className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono"
                            />
                            <button
                              onClick={() =>
                                setImagePickerTarget({
                                  fieldPath: `classes.${idx}.courseImage`,
                                  currentValue: cls.courseImage
                                })
                              }
                              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                            >
                              <ImageIcon size={13} className="text-emerald-400" />
                              Browse
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                            Course Description
                          </label>
                          <textarea
                            rows={2}
                            value={cls.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => ({
                                ...prev,
                                classes: prev.classes.map((c) =>
                                  c.id === cls.id ? { ...c, description: val, shortDescription: val } : c
                                )
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs leading-relaxed"
                          />
                        </div>

                        {/* Syllabus Item Manager */}
                        <div className="pt-3 border-t border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <BookOpen size={13} className="text-emerald-400" />
                              Curriculum Modules ({syllabusItems.length})
                            </span>
                            <button
                              onClick={() => {
                                const nextNum = syllabusItems.length + 1;
                                const newModule = {
                                  id: `syl-${Date.now()}`,
                                  title: `Module ${nextNum}: New Topic`,
                                  description: "Comprehensive hands-on topic learning breakdown.",
                                  duration: `Session ${nextNum}`
                                };
                                updateDraft((prev) => ({
                                  ...prev,
                                  classes: prev.classes.map((c) =>
                                    c.id === cls.id ? { ...c, syllabus: [...syllabusItems, newModule] } : c
                                  )
                                }));
                                showCustomToast("Added syllabus module.", "info");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={11} />
                              Add Module
                            </button>
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {syllabusItems.map((mod: any, mIdx: number) => (
                              <div key={mod.id || mIdx} className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono flex items-center justify-center shrink-0 mt-1">
                                  {mIdx + 1}
                                </span>
                                <div className="flex-1 space-y-1.5">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={mod.title}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateDraft((prev) => ({
                                          ...prev,
                                          classes: prev.classes.map((c) => {
                                            if (c.id !== cls.id) return c;
                                            const sCopy = [...(c.syllabus || [])];
                                            sCopy[mIdx] = { ...sCopy[mIdx], title: val };
                                            return { ...c, syllabus: sCopy };
                                          })
                                        }));
                                      }}
                                      className="flex-1 px-2 py-1 rounded bg-black/40 border border-white/10 text-white text-xs font-semibold"
                                      placeholder="Module title"
                                    />
                                    <input
                                      type="text"
                                      value={mod.duration || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateDraft((prev) => ({
                                          ...prev,
                                          classes: prev.classes.map((c) => {
                                            if (c.id !== cls.id) return c;
                                            const sCopy = [...(c.syllabus || [])];
                                            sCopy[mIdx] = { ...sCopy[mIdx], duration: val };
                                            return { ...c, syllabus: sCopy };
                                          })
                                        }));
                                      }}
                                      className="w-24 px-2 py-1 rounded bg-black/40 border border-white/10 text-white/60 text-xs font-mono"
                                      placeholder="Duration"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    value={mod.description || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateDraft((prev) => ({
                                        ...prev,
                                        classes: prev.classes.map((c) => {
                                          if (c.id !== cls.id) return c;
                                          const sCopy = [...(c.syllabus || [])];
                                          sCopy[mIdx] = { ...sCopy[mIdx], description: val };
                                          return { ...c, syllabus: sCopy };
                                        })
                                      }));
                                    }}
                                    className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-white/50 text-[11px]"
                                    placeholder="Short description"
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    updateDraft((prev) => ({
                                      ...prev,
                                      classes: prev.classes.map((c) => {
                                        if (c.id !== cls.id) return c;
                                        const sCopy = [...(c.syllabus || [])];
                                        sCopy.splice(mIdx, 1);
                                        return { ...c, syllabus: sCopy };
                                      })
                                    }));
                                  }}
                                  className="text-white/30 hover:text-rose-400 p-1"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 6: STUDENTS & REVIEWS MANAGEMENT
         ========================================================================= */}
      {activeSection === "students" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap size={16} className="text-cyan-400" />
                Students &amp; Testimonials Section
              </h2>
              <p className="text-xs text-white/50">
                Manage student reviews, avatar images, star ratings, outcome achievements, and top statistics counters.
              </p>
            </div>

            <button
              onClick={() => {
                const newRev: CMSTestimonialItem = {
                  id: `rev-${Date.now()}`,
                  name: "New Student",
                  role: "Software Developer",
                  company: "Tech Studio",
                  course: "Modern React Development",
                  rating: 5.0,
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=160&auto=format&fit=crop",
                  text: "The practical exercises and guidance transformed my frontend engineering skills.",
                  highlight: "Completed 5+ Production Apps"
                };
                updateDraft((prev) => ({
                  ...prev,
                  testimonials: {
                    ...prev.testimonials,
                    testimonials: [...prev.testimonials.testimonials, newRev]
                  }
                }));
                showCustomToast("New student testimonial added!", "success");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              Add Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Badge Pill
              </label>
              <input
                type="text"
                value={draftConfig.testimonials.badge}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    testimonials: { ...prev.testimonials, badge: e.target.value }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Section Title
              </label>
              <input
                type="text"
                value={draftConfig.testimonials.title}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    testimonials: { ...prev.testimonials, title: e.target.value }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
              />
            </div>
          </div>

          {/* Testimonials List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftConfig.testimonials.testimonials.map((rev, idx) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.08] hover:border-cyan-500/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-zinc-900">
                      <img src={rev.avatar} alt={rev.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={rev.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            testimonials: {
                              ...prev.testimonials,
                              testimonials: prev.testimonials.testimonials.map((t) =>
                                t.id === rev.id ? { ...t, name: val } : t
                              )
                            }
                          }));
                        }}
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-white text-xs font-bold"
                      />
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          value={rev.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => ({
                              ...prev,
                              testimonials: {
                                ...prev.testimonials,
                                testimonials: prev.testimonials.testimonials.map((t) =>
                                  t.id === rev.id ? { ...t, role: val } : t
                                )
                              }
                            }));
                          }}
                          className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/10 text-white/50 text-[10px]"
                          placeholder="Role"
                        />
                        <span className="text-white/30 text-[10px]">@</span>
                        <input
                          type="text"
                          value={rev.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => ({
                              ...prev,
                              testimonials: {
                                ...prev.testimonials,
                                testimonials: prev.testimonials.testimonials.map((t) =>
                                  t.id === rev.id ? { ...t, company: val } : t
                                )
                              }
                            }));
                          }}
                          className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/10 text-cyan-400 text-[10px]"
                          placeholder="Company"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setDeleteDialog({
                        type: "testimonial",
                        id: rev.id,
                        title: rev.name
                      })
                    }
                    className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rev.avatar}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        testimonials: {
                          ...prev.testimonials,
                          testimonials: prev.testimonials.testimonials.map((t) =>
                            t.id === rev.id ? { ...t, avatar: val } : t
                          )
                        }
                      }));
                    }}
                    className="flex-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-white text-[11px] font-mono"
                    placeholder="Avatar image URL"
                  />
                  <button
                    onClick={() =>
                      setImagePickerTarget({
                        fieldPath: `testimonials.testimonials.${idx}.avatar`,
                        currentValue: rev.avatar
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon size={11} className="text-cyan-400" />
                    Browse
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                    Student Quote / Testimonial
                  </label>
                  <textarea
                    rows={2}
                    value={rev.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => ({
                        ...prev,
                        testimonials: {
                          ...prev.testimonials,
                          testimonials: prev.testimonials.testimonials.map((t) =>
                            t.id === rev.id ? { ...t, text: val } : t
                          )
                        }
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white/70 text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                      Highlight Badge
                    </label>
                    <input
                      type="text"
                      value={rev.highlight}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          testimonials: {
                            ...prev.testimonials,
                            testimonials: prev.testimonials.testimonials.map((t) =>
                              t.id === rev.id ? { ...t, highlight: val } : t
                            )
                          }
                        }));
                      }}
                      className="w-full px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-emerald-400 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                      Course Taken
                    </label>
                    <input
                      type="text"
                      value={rev.course}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          testimonials: {
                            ...prev.testimonials,
                            testimonials: prev.testimonials.testimonials.map((t) =>
                              t.id === rev.id ? { ...t, course: val } : t
                            )
                          }
                        }));
                      }}
                      className="w-full px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-white/70 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 7: CONTACT & SOCIAL MANAGEMENT
         ========================================================================= */}
      {activeSection === "contact" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Send size={16} className="text-rose-400" />
                Contact Information &amp; Social Links
              </h2>
              <p className="text-xs text-white/50">
                Update direct contact email, phone, location, and social media profile links (Telegram, Instagram, GitHub, LinkedIn).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Badge Pill
              </label>
              <input
                type="text"
                value={draftConfig.contact.badge}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, badge: e.target.value }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Section Heading Title
              </label>
              <input
                type="text"
                value={draftConfig.contact.title}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, title: e.target.value }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
              Contact Subtitle Statement
            </label>
            <textarea
              rows={2}
              value={draftConfig.contact.description}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, description: e.target.value }
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs leading-relaxed"
            />
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.06] space-y-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Link2 size={14} className="text-rose-400" />
              Social Network &amp; Channel URLs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                  Contact Email
                </label>
                <input
                  type="text"
                  value={draftConfig.contact.email}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                  Telegram Channel / Profile
                </label>
                <input
                  type="text"
                  value={draftConfig.contact.telegramUrl}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, telegramUrl: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                  Instagram Profile
                </label>
                <input
                  type="text"
                  value={draftConfig.contact.instagramUrl}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, instagramUrl: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="text"
                  value={draftConfig.contact.linkedinUrl}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, linkedinUrl: e.target.value }
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 8: FOOTER & BRANDING MANAGEMENT
         ========================================================================= */}
      {activeSection === "footer" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layout size={16} className="text-indigo-400" />
                Footer &amp; Global Branding
              </h2>
              <p className="text-xs text-white/50">
                Configure brand name, footer mission tagline, copyright notice, and animated rotating words (e.g. LET'S BUILD / LET'S CREATE).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={draftConfig.footer.brandName}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, brandName: e.target.value }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Copyright Notice
              </label>
              <input
                type="text"
                value={draftConfig.footer.copyright}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, copyright: e.target.value }
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
              Mission / Tagline Statement
            </label>
            <textarea
              rows={2}
              value={draftConfig.footer.tagline}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, tagline: e.target.value }
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs leading-relaxed"
            />
          </div>

          {/* Animated Footer Words (LET'S BUILD / LET'S CREATE) */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-400" />
                  Animated Vertical Words ("LET'S ...")
                </h3>
                <p className="text-[11px] text-white/40">
                  These words cycle vertically in the large footer call-to-action title.
                </p>
              </div>

              <button
                onClick={() => {
                  updateDraft((prev) => ({
                    ...prev,
                    footer: {
                      ...prev.footer,
                      animatedWords: [...prev.footer.animatedWords, "DEVELOP"]
                    }
                  }));
                  showCustomToast("Added new animated keyword.", "info");
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} />
                Add Keyword
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {draftConfig.footer.animatedWords.map((word, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10">
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft((prev) => {
                        const copy = [...prev.footer.animatedWords];
                        copy[idx] = val;
                        return { ...prev, footer: { ...prev.footer, animatedWords: copy } };
                      });
                    }}
                    className="w-24 bg-transparent text-white font-bold text-xs uppercase focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (draftConfig.footer.animatedWords.length <= 1) return;
                      updateDraft((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          animatedWords: prev.footer.animatedWords.filter((_, i) => i !== idx)
                        }
                      }));
                    }}
                    className="text-white/30 hover:text-rose-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GLOBAL CURATED IMAGE PICKER MODAL
         ========================================================================= */}
      <AnimatePresence>
        {imagePickerTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl bg-zinc-950 border border-white/10 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <ImageIcon size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Select High-Resolution Image</h3>
                    <p className="text-[11px] text-white/40">Choose from curated developer images or enter a custom URL.</p>
                  </div>
                </div>
                <button
                  onClick={() => setImagePickerTarget(null)}
                  className="text-white/40 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              {/* Current URL Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/50">Custom URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={imagePickerTarget.currentValue}
                    id="custom-modal-image-input"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono"
                    placeholder="https://..."
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("custom-modal-image-input") as HTMLInputElement;
                      if (input && input.value) {
                        handleSelectSuggestedImage(input.value);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Curated Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-white/50">Quick-Select Gallery</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {CURATED_IMAGE_SUGGESTIONS.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectSuggestedImage(img.url)}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-emerald-400 cursor-pointer transition-all bg-black"
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-95" />
                      <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-medium text-white truncate">
                        {img.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          DELETE CONFIRMATION DIALOG MODAL
         ========================================================================= */}
      <AnimatePresence>
        {deleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-zinc-950 border border-rose-500/30 p-5 space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle size={20} />
                <h3 className="text-sm font-bold text-white">Confirm Removal</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Are you sure you want to remove <strong className="text-white">"{deleteDialog.title}"</strong> from the website layout?
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setDeleteDialog(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 text-white/70 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
