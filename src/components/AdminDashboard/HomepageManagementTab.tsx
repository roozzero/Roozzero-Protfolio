import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash, Edit, Save, BookOpen, User, DollarSign, Calendar, ChevronDown, ChevronUp,
  AlertTriangle, Move, Sparkles, Check, CheckCircle2, RotateCcw, Image as ImageIcon,
  Clock, BookOpenCheck, Sliders, Play, Trash2, ArrowUp, ArrowDown, ExternalLink
} from "lucide-react";
import { CMSFullConfig, CMSClass } from "../../types/cms";

// Initial default classes matching the Techzo & Lumin Studio content from public Home Page
export const DEFAULT_HOMEPAGE_CLASSES: CMSClass[] = [
  {
    id: "techzo",
    courseImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    courseName: "Techzo: Creative Agency System",
    instructor: "Roozbeh",
    price: "$149",
    description: "Techzo is a cutting-edge design agency template built to showcase innovation, digital expertise, and a bold creative presence online.",
    sessions: 12,
    status: "Published",
    displayOrder: 1,
    tags: ["HTML5 & CSS", "Framer Motion", "Vite"] as any,
    syllabus: [
      { id: "s1", title: "Advanced Grid & Immersive Layout Layouts", description: "Mastering multi-column modern alignment, viewport control, and custom margins.", duration: "45 mins" },
      { id: "s2", title: "Framer Motion Micro-Animations", description: "Designing spring physics, hover interactions, page reveals, and viewport triggering.", duration: "60 mins" },
      { id: "s3", title: "Dark Theme Colors & Ambient Shadows", description: "Defining professional color palettes, blur ratios, gradients, and custom overlays.", duration: "30 mins" },
      { id: "s4", title: "Deploying High-Fidelity Apps with Vite", description: "Packaging final static web assets, bundle size checks, and hosting on lightning-fast CDNs.", duration: "40 mins" }
    ]
  } as any,
  {
    id: "lumin",
    courseImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    courseName: "Lumin Studio: Design Aesthetics",
    instructor: "Roozbeh",
    price: "$199",
    description: "LuminStudio blends elegance and clarity — a modern design agency template crafted to highlight creative work and impress potential clients.",
    sessions: 16,
    status: "Published",
    displayOrder: 2,
    tags: ["HTML5 & Tailwind CSS", "React", "Vite"] as any,
    syllabus: [
      { id: "s1", title: "React Design System Architecture", description: "Creating modular UI tokens, layouts, buttons, and fully dynamic state structures.", duration: "50 mins" },
      { id: "s2", title: "Responsive Styling with Tailwind CSS", description: "Using responsive flex/grids, customized font utilities, and pixel-perfect sizing.", duration: "45 mins" },
      { id: "s3", title: "Typography Reflections & Vector Styling", description: "Recreating high-end reflection aesthetics, blur mechanics, and responsive device shells.", duration: "40 mins" },
      { id: "s4", title: "Sleek Showcase & Portfolio SEO", description: "Optimizing load times, search engine configurations, meta tags, and premium client pitch decks.", duration: "35 mins" }
    ]
  } as any
];

// Beautiful Unsplash developer images for easy banner selection
const SUGGESTED_BANNER_IMAGES = [
  { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop", name: "Cyber Matrix Security" },
  { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop", name: "Microchip Board Grid" },
  { url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop", name: "Modern React Development" },
  { url: "https://images.unsplash.com/photo-1516116211223-5c359a36298a?q=80&w=800&auto=format&fit=crop", name: "Lines of Code Workspace" },
  { url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop", name: "UX Design Canvas Wireframe" },
  { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop", name: "Sublime Code IDE Editor" }
];

interface HomepageManagementTabProps {
  showCustomToast: (msg: string, type?: "info" | "success" | "warning") => void;
}

export default function HomepageManagementTab({ showCustomToast }: HomepageManagementTabProps) {
  // Load configuration or fall back
  const [currentConfig, setCurrentConfig] = useState<CMSFullConfig>(() => {
    const saved = localStorage.getItem("cms_current_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.classes)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse config from storage", e);
      }
    }
    // Setup initial config containing default classes
    const initialConfig: any = {
      classes: DEFAULT_HOMEPAGE_CLASSES,
      general: { websiteTitle: "RoozZero Academy" }
    };
    localStorage.setItem("cms_current_config", JSON.stringify(initialConfig));
    return initialConfig;
  });

  const [draftClasses, setDraftClasses] = useState<CMSClass[]>(() => {
    return currentConfig.classes || [];
  });

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  
  // Delete confirmation modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Gallery picker states
  const [activePickerIdx, setActivePickerIdx] = useState<number | null>(null);

  // Check if draft has changed compared to current config
  const hasChanges = JSON.stringify(draftClasses) !== JSON.stringify(currentConfig.classes);

  const handleSaveDraft = () => {
    const updatedConfig = { ...currentConfig, classes: draftClasses };
    setCurrentConfig(updatedConfig);
    localStorage.setItem("cms_current_config", JSON.stringify(updatedConfig));
    showCustomToast("Classes layout saved as Draft!", "info");
  };

  const handlePublish = () => {
    const updatedConfig = { ...currentConfig, classes: draftClasses };
    setCurrentConfig(updatedConfig);
    localStorage.setItem("cms_current_config", JSON.stringify(updatedConfig));
    showCustomToast("Changes published successfully! Home Page is updated.", "success");
  };

  const handleResetDraft = () => {
    setDraftClasses(currentConfig.classes || []);
    showCustomToast("Draft restored to last published state.", "info");
  };

  // Drag and Drop ordering handlers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...draftClasses];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);

    // Update display orders based on index
    const updatedList = list.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setDraftClasses(updatedList);
    setDraggedIndex(null);
    showCustomToast("Rearranged course layout order.", "success");
  };

  const moveOrder = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === draftClasses.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const list = [...draftClasses];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    const updatedList = list.map((item, index) => ({
      ...item,
      displayOrder: index + 1
    }));

    setDraftClasses(updatedList);
  };

  // Add new course
  const handleAddNewCourse = () => {
    const nextOrder = draftClasses.length + 1;
    const newId = `cl-${Date.now()}`;
    const newCourse: CMSClass = {
      id: newId,
      courseImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
      courseName: "New High-Fidelity Masterclass",
      instructor: "Roozbeh",
      price: "$199",
      description: "A fresh course focusing on modular design architecture and deployment patterns.",
      sessions: 8,
      status: "Draft",
      displayOrder: nextOrder,
      tags: ["React", "TypeScript", "Vite"] as any,
      syllabus: [
        { id: `s1-${Date.now()}`, title: "Module 1: Layout Fundamentals", description: "Structuring pixel-perfect CSS grids and flex containers.", duration: "45 mins" }
      ] as any
    };

    setDraftClasses((prev) => [...prev, newCourse]);
    setExpandedCourseId(newId);
    showCustomToast("New course card template added. Start customizing!", "success");
  };

  const confirmDeleteCourse = () => {
    if (!deleteTargetId) return;
    setDraftClasses((prev) => prev.filter((item) => item.id !== deleteTargetId));
    setDeleteTargetId(null);
    showCustomToast("Course deleted successfully.", "warning");
  };

  // Field change handler helper
  const handleFieldChange = (courseId: string, field: keyof CMSClass, value: any) => {
    setDraftClasses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, [field]: value } : c))
    );
  };

  // Syllabus items management
  const handleAddSyllabusItem = (courseId: string) => {
    setDraftClasses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const currentSyllabus = (c as any).syllabus || [];
          const nextIndex = currentSyllabus.length + 1;
          const newItem = {
            id: `s-${Date.now()}`,
            title: `Module ${nextIndex}: Topic Title`,
            description: "Provide short bullet items or learning details.",
            duration: "45 mins"
          };
          return { ...c, syllabus: [...currentSyllabus, newItem] };
        }
        return c;
      })
    );
    showCustomToast("Added new syllabus module.", "info");
  };

  const handleEditSyllabusItem = (courseId: string, itemIndex: number, field: string, value: any) => {
    setDraftClasses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const syllabusCopy = [...((c as any).syllabus || [])];
          if (syllabusCopy[itemIndex]) {
            syllabusCopy[itemIndex] = { ...syllabusCopy[itemIndex], [field]: value };
          }
          return { ...c, syllabus: syllabusCopy };
        }
        return c;
      })
    );
  };

  const handleDeleteSyllabusItem = (courseId: string, itemIndex: number) => {
    setDraftClasses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const syllabusCopy = [...((c as any).syllabus || [])];
          syllabusCopy.splice(itemIndex, 1);
          return { ...c, syllabus: syllabusCopy };
        }
        return c;
      })
    );
    showCustomToast("Syllabus module removed.", "warning");
  };

  return (
    <div id="homepage-classes-panel" className="flex flex-col h-full bg-[#050508] p-6 space-y-6 overflow-y-auto select-none">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BookOpen size={18} />
            </span>
            <h1 className="text-xl font-black text-white tracking-tight">Classes Management</h1>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Configure courses appearing in the public Home Page Classes list. Change values, toggle statuses, and rearrange positions.
          </p>
        </div>

        {/* Action button states */}
        <div className="flex items-center gap-2.5">
          {hasChanges && (
            <button
              onClick={handleResetDraft}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-white/70 hover:text-white flex items-center gap-1.5 transition-all bg-white/[0.01]"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}

          <button
            onClick={handleSaveDraft}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              hasChanges
                ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20"
                : "border-white/5 text-white/40 cursor-not-allowed bg-transparent"
            }`}
            disabled={!hasChanges}
          >
            <Save size={13} />
            Save Draft
          </button>

          <button
            onClick={handlePublish}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_4px_12px_rgba(99,102,241,0.15)] ${
              hasChanges
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-indigo-600/50 text-white/50 cursor-not-allowed"
            }`}
          >
            <Sparkles size={13} />
            Publish Changes
          </button>
        </div>
      </div>

      {/* Top statistics banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400">
            <BookOpen size={16} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Total Courses</p>
            <p className="text-lg font-black text-white mt-0.5">{draftClasses.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Published</p>
            <p className="text-lg font-black text-white mt-0.5">
              {draftClasses.filter((c) => c.status === "Published").length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Draft / Hidden</p>
            <p className="text-lg font-black text-white mt-0.5">
              {draftClasses.filter((c) => c.status !== "Published").length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Drag-and-Drop Course Cards container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-1.5">
            <Sliders size={11} className="text-indigo-400" />
            Drag or use arrows to change website layout order
          </span>
          <button
            onClick={handleAddNewCourse}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
          >
            <Plus size={13} />
            Add Course Card
          </button>
        </div>

        <div className="space-y-3.5">
          {draftClasses.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/5 space-y-3">
              <BookOpen size={24} className="text-white/20 mx-auto" />
              <p className="text-xs text-white/40">No course cards configured. Click "Add Course Card" above to build your first layout card!</p>
            </div>
          ) : (
            draftClasses.map((cls, idx) => {
              const isExpanded = expandedCourseId === cls.id;
              const isPublished = cls.status === "Published";
              const syllabusItems = (cls as any).syllabus || [];
              const tagsList = Array.isArray(cls.tags) ? cls.tags : [];

              return (
                <div
                  key={cls.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? "bg-zinc-950/80 border-indigo-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.4)]"
                      : "bg-[#0b0b10]/95 border-white/[0.03] hover:border-white/[0.07]"
                  }`}
                >
                  
                  {/* Card Header Row */}
                  <div className="p-4 flex items-center justify-between gap-4 select-none">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/45 p-1 transition-colors">
                        <Move size={14} />
                      </div>

                      {/* Quick Thumbnail Preview */}
                      <div className="relative h-10 w-10 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden shrink-0">
                        <img src={cls.courseImage} className="h-full w-full object-cover" alt="" />
                      </div>

                      {/* Course Basics */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white tracking-tight truncate">{cls.courseName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isPublished
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                          }`}>
                            {cls.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-white/40 font-semibold">
                          <span className="flex items-center gap-1"><User size={10} className="text-indigo-400/70" /> {cls.instructor || "Roozbeh"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><DollarSign size={10} className="text-emerald-400/70" /> {cls.price}</span>
                          <span>•</span>
                          <span>{cls.sessions} Sessions</span>
                          <span>•</span>
                          <span>{syllabusItems.length} syllabus modules</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Row Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      
                      {/* Move controls for accessibility */}
                      <div className="flex items-center gap-0.5 mr-2">
                        <button
                          onClick={() => moveOrder(idx, "up")}
                          disabled={idx === 0}
                          className="p-1.5 text-white/20 hover:text-white/60 disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => moveOrder(idx, "down")}
                          disabled={idx === draftClasses.length - 1}
                          className="p-1.5 text-white/20 hover:text-white/60 disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => setExpandedCourseId(isExpanded ? null : cls.id)}
                        className="p-2 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] text-white/60 hover:text-white rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        <span className="text-[10px] font-bold px-1">{isExpanded ? "Collapse" : "Edit Card"}</span>
                      </button>

                      <button
                        onClick={() => setDeleteTargetId(cls.id)}
                        className="p-2 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/25 text-rose-400 rounded-xl transition-all cursor-pointer"
                        title="Delete Course Card"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Form Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-white/[0.04] bg-black/35"
                      >
                        <div className="p-5 space-y-5">
                          
                          {/* Part A: Basic Configuration Row */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            
                            {/* Course Title */}
                            <div className="md:col-span-2 flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Course Name</label>
                              <input
                                type="text"
                                value={cls.courseName}
                                onChange={(e) => handleFieldChange(cls.id, "courseName", e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                                placeholder="Enter course name..."
                              />
                            </div>

                            {/* Instructor Name */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Instructor</label>
                              <input
                                type="text"
                                value={cls.instructor || "Roozbeh"}
                                onChange={(e) => handleFieldChange(cls.id, "instructor", e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                                placeholder="Instructor name..."
                              />
                            </div>

                            {/* Course Status */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Status</label>
                              <select
                                value={cls.status}
                                onChange={(e) => handleFieldChange(cls.id, "status", e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-indigo-400 font-bold focus:outline-none transition-all cursor-pointer"
                              >
                                <option value="Published">Published (Active on page)</option>
                                <option value="Draft">Draft (Invisible on page)</option>
                                <option value="Hidden">Hidden (Hidden)</option>
                              </select>
                            </div>
                          </div>

                          {/* Part B: Layout metadata row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Price */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Price (USD)</label>
                              <input
                                type="text"
                                value={cls.price}
                                onChange={(e) => handleFieldChange(cls.id, "price", e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                                placeholder="e.g. $199"
                              />
                            </div>

                            {/* Total sessions */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Number of Sessions</label>
                              <input
                                type="number"
                                value={cls.sessions}
                                onChange={(e) => handleFieldChange(cls.id, "sessions", parseInt(e.target.value) || 0)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                                placeholder="e.g. 12"
                              />
                            </div>

                            {/* Tags list (comma separated) */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Badges/Tags (Comma separated)</label>
                              <input
                                type="text"
                                value={tagsList.join(", ")}
                                onChange={(e) => {
                                  const list = e.target.value.split(",").map(item => item.trim()).filter(Boolean);
                                  handleFieldChange(cls.id, "tags", list);
                                }}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                                placeholder="e.g. HTML5, React, Vite"
                              />
                            </div>
                          </div>

                          {/* Part C: Banner & Description */}
                          <div className="space-y-4">
                            
                            {/* Image Selection Block */}
                            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Course Banner Image Source</span>
                                <span className="text-[10px] text-white/30 font-mono">16:10 Aspect recommended</span>
                              </div>
                              
                              <div className="flex flex-col md:flex-row items-stretch gap-4">
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={cls.courseImage}
                                    onChange={(e) => handleFieldChange(cls.id, "courseImage", e.target.value)}
                                    className="w-full bg-zinc-950 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none transition-all"
                                    placeholder="Enter image URL..."
                                  />
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setActivePickerIdx(activePickerIdx === idx ? null : idx)}
                                      className="px-3 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <ImageIcon size={11} /> Select from Suggestions
                                    </button>
                                  </div>
                                </div>
                                <div className="w-24 shrink-0 rounded-xl border border-white/10 overflow-hidden relative bg-zinc-900 flex items-center justify-center">
                                  <img src={cls.courseImage} className="w-full h-full object-cover" alt="" />
                                </div>
                              </div>

                              {/* Nested Suggested Image List */}
                              <AnimatePresence>
                                {activePickerIdx === idx && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden border-t border-white/5 pt-3 mt-2"
                                  >
                                    <p className="text-[9px] text-white/40 font-bold uppercase mb-2">Beautiful developer mockups (Click to choose):</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                      {SUGGESTED_BANNER_IMAGES.map((img) => (
                                        <button
                                          key={img.url}
                                          type="button"
                                          onClick={() => {
                                            handleFieldChange(cls.id, "courseImage", img.url);
                                            setActivePickerIdx(null);
                                            showCustomToast("Banner image updated.", "success");
                                          }}
                                          className="p-1 rounded-lg border border-white/5 hover:border-indigo-500/40 bg-zinc-950 overflow-hidden text-center transition-all group/picker cursor-pointer"
                                        >
                                          <div className="aspect-[16/10] rounded overflow-hidden relative mb-1">
                                            <img src={img.url} className="h-full w-full object-cover group-hover/picker:scale-110 transition-transform duration-300" alt="" />
                                          </div>
                                          <span className="text-[8px] text-white/40 font-semibold group-hover/picker:text-white block truncate">{img.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Short description */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Short Course Description (Appears on Card)</label>
                              <textarea
                                rows={2}
                                value={cls.description}
                                onChange={(e) => handleFieldChange(cls.id, "description", e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/[0.06] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all resize-none"
                                placeholder="Describe course outcomes cleanly..."
                              />
                            </div>
                          </div>

                          {/* Part D: Expandable Syllabus Modules List */}
                          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5">
                                <BookOpenCheck size={14} className="text-indigo-400" />
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/80">Course Syllabus Chapters</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddSyllabusItem(cls.id)}
                                className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={11} /> Add Syllabus Module
                              </button>
                            </div>

                            <div className="space-y-3">
                              {syllabusItems.length === 0 ? (
                                <p className="text-[10px] text-white/30 text-center py-3 font-semibold">No syllabus modules defined yet. Add some topics!</p>
                              ) : (
                                syllabusItems.map((syl: any, sIdx: number) => (
                                  <div key={syl.id || sIdx} className="p-3.5 rounded-lg bg-zinc-950/70 border border-white/[0.03] flex items-start gap-3.5">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 mt-0.5 shrink-0">
                                      {sIdx + 1}
                                    </span>
                                    
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                                      {/* Chapter Title */}
                                      <div className="sm:col-span-8 flex flex-col gap-1">
                                        <span className="text-[8px] font-bold uppercase text-white/30 tracking-widest">Chapter Title</span>
                                        <input
                                          type="text"
                                          value={syl.title}
                                          onChange={(e) => handleEditSyllabusItem(cls.id, sIdx, "title", e.target.value)}
                                          className="bg-transparent border-b border-white/10 hover:border-white/20 focus:border-indigo-500 text-xs font-bold text-white focus:outline-none pb-0.5"
                                          placeholder="e.g. Advanced Routing..."
                                        />
                                      </div>

                                      {/* Duration */}
                                      <div className="sm:col-span-4 flex flex-col gap-1">
                                        <span className="text-[8px] font-bold uppercase text-white/30 tracking-widest">Duration Label</span>
                                        <input
                                          type="text"
                                          value={syl.duration}
                                          onChange={(e) => handleEditSyllabusItem(cls.id, sIdx, "duration", e.target.value)}
                                          className="bg-transparent border-b border-white/10 hover:border-white/20 focus:border-indigo-500 text-xs text-white/80 font-mono focus:outline-none pb-0.5"
                                          placeholder="e.g. 45 mins"
                                        />
                                      </div>

                                      {/* Chapter Description */}
                                      <div className="sm:col-span-12 flex flex-col gap-1 mt-1">
                                        <span className="text-[8px] font-bold uppercase text-white/30 tracking-widest">Chapter Content Details</span>
                                        <input
                                          type="text"
                                          value={syl.description}
                                          onChange={(e) => handleEditSyllabusItem(cls.id, sIdx, "description", e.target.value)}
                                          className="bg-transparent border-b border-white/10 hover:border-white/20 focus:border-indigo-500 text-[11px] text-white/50 focus:outline-none pb-0.5"
                                          placeholder="Brief overview of topics discussed..."
                                        />
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSyllabusItem(cls.id, sIdx)}
                                      className="p-1.5 text-white/20 hover:text-rose-400 mt-1 cursor-pointer transition-colors"
                                      title="Delete Syllabus Module"
                                    >
                                      <Trash size={12} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECURE DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteTargetId !== null && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0b0f] border border-white/10 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl text-center space-y-4"
            >
              <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Delete Course Card?</h4>
                <p className="text-xs text-white/55 mt-1.5 leading-relaxed">
                  Are you absolutely sure you want to remove this course card layout? This action cannot be undone and will delete all associated course metadata.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCourse}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Delete Course
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
