import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Plus, Trash2, Edit3, Check, X, Clock, Layers,
  ListOrdered, ChevronDown, ChevronRight, Save, AlertCircle
} from "lucide-react";
import { adminApi } from "../../lib/api";

export interface SyllabusItem {
  id: string;
  title: string;
  duration?: string;
  description?: string;
  lessonsCount?: number;
  topics?: string[];
}

interface CourseSyllabusModalProps {
  isOpen: boolean;
  courseId: string;
  courseTitle: string;
  initialSyllabus?: SyllabusItem[];
  onSaveSyllabus: (updatedSyllabus: SyllabusItem[]) => void;
  onClose: () => void;
  showCustomToast?: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function CourseSyllabusModal({
  isOpen,
  courseId,
  courseTitle,
  initialSyllabus = [],
  onSaveSyllabus,
  onClose,
  showCustomToast
}: CourseSyllabusModalProps) {
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(initialSyllabus || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Form state for adding/editing a module
  const [formState, setFormState] = useState<SyllabusItem>({
    id: "",
    title: "",
    duration: "4 hours",
    description: "",
    lessonsCount: 4,
    topics: []
  });
  const [newTopicText, setNewTopicText] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setSyllabus(initialSyllabus || []);
      setEditingIndex(null);
      setFormState({
        id: "",
        title: "",
        duration: "4 hours",
        description: "",
        lessonsCount: 4,
        topics: []
      });
      setNewTopicText("");
    }
  }, [isOpen, initialSyllabus]);

  const handleStartAdd = () => {
    setEditingIndex(-1); // -1 signifies new module
    setFormState({
      id: `mod-${Date.now()}`,
      title: "",
      duration: "4 hours",
      description: "",
      lessonsCount: 3,
      topics: []
    });
    setNewTopicText("");
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setFormState({ ...syllabus[index] });
    setNewTopicText("");
  };

  const handleAddTopic = () => {
    if (!newTopicText.trim()) return;
    setFormState((prev) => ({
      ...prev,
      topics: [...(prev.topics || []), newTopicText.trim()]
    }));
    setNewTopicText("");
  };

  const handleRemoveTopic = (tIdx: number) => {
    setFormState((prev) => ({
      ...prev,
      topics: (prev.topics || []).filter((_, idx) => idx !== tIdx)
    }));
  };

  const handleSaveModule = () => {
    if (!formState.title.trim()) {
      showCustomToast?.("Module title is required", "warning");
      return;
    }

    if (editingIndex === -1) {
      // Add new
      setSyllabus((prev) => [...prev, { ...formState, id: formState.id || `mod-${Date.now()}` }]);
    } else if (editingIndex !== null && editingIndex >= 0) {
      // Update existing
      setSyllabus((prev) => prev.map((item, idx) => (idx === editingIndex ? { ...formState } : item)));
    }

    setEditingIndex(null);
  };

  const handleDeleteModule = (index: number) => {
    setSyllabus((prev) => prev.filter((_, idx) => idx !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleSaveAllToDatabase = async () => {
    setIsSaving(true);
    try {
      const res = await adminApi.updateCourseSyllabus(courseId, syllabus);
      if (res.success) {
        onSaveSyllabus(syllabus);
        showCustomToast?.("Syllabus synchronized to database successfully", "success");
        onClose();
      } else {
        showCustomToast?.("Failed to synchronize syllabus", "warning");
      }
    } catch (err: any) {
      console.error("Failed to save syllabus to database:", err);
      // Fallback local update
      onSaveSyllabus(syllabus);
      showCustomToast?.("Syllabus saved locally", "info");
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-3xl max-h-[90vh] bg-[#0c0c11] border border-white/10 rounded-2xl shadow-2xl flex flex-col text-white text-left overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Course Syllabus & Modules</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {courseTitle} &bull; {syllabus.length} Modules Defined
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Top Bar: Add Module button */}
            {editingIndex === null && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">
                  Manage chapters, lecture topics, and durations for this course curriculum.
                </span>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  <Plus size={14} />
                  <span>Add Module</span>
                </button>
              </div>
            )}

            {/* Inline Module Form (when adding or editing) */}
            {editingIndex !== null && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs font-bold text-indigo-400">
                    {editingIndex === -1 ? "Add New Curriculum Module" : `Edit Module: ${formState.title || "Untitled"}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Module Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 1: Reactive State Systems"
                      value={formState.title}
                      onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Est. Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 3.5 hrs"
                        value={formState.duration || ""}
                        onChange={(e) => setFormState({ ...formState, duration: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Total Lessons</label>
                      <input
                        type="number"
                        min="1"
                        value={formState.lessonsCount || 1}
                        onChange={(e) => setFormState({ ...formState, lessonsCount: parseInt(e.target.value, 10) || 1 })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Overview & Objectives</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of concepts mastered in this module..."
                    value={formState.description || ""}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Sub-Topics / Lessons breakdown */}
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Sub-topics / Lesson Points</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g. Setting up custom hook pipelines..."
                      value={newTopicText}
                      onChange={(e) => setNewTopicText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTopic();
                        }
                      }}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTopic}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      Add Point
                    </button>
                  </div>

                  {/* List of points */}
                  <div className="flex flex-wrap gap-1.5">
                    {(formState.topics || []).map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-zinc-300 flex items-center gap-1.5"
                      >
                        <span>{topic}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(tIdx)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModule}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    <Check size={14} />
                    <span>Save Module</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of existing syllabus modules */}
            {syllabus.length === 0 && editingIndex === null ? (
              <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/10 text-zinc-400 space-y-2">
                <BookOpen size={28} className="mx-auto text-zinc-600" />
                <h4 className="text-xs font-bold text-white">No Syllabus Modules Defined Yet</h4>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                  Click &ldquo;Add Module&rdquo; above to outline this course&apos;s curriculum, lectures, and topics.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {syllabus.map((item, index) => {
                  const isExpanded = expandedIndex === index;
                  return (
                    <div
                      key={item.id || index}
                      className="rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/15 transition-all overflow-hidden"
                    >
                      <div className="p-3.5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedIndex(isExpanded ? null : index)}>
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-white">{item.title}</h4>
                            <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono mt-0.5">
                              {item.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock size={10} /> {item.duration}
                                </span>
                              )}
                              {item.lessonsCount && (
                                <span>{item.lessonsCount} lessons</span>
                              )}
                              {item.topics && item.topics.length > 0 && (
                                <span>{item.topics.length} topics</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(index)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit Module"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(index)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Module"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedIndex(isExpanded ? null : index)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-white"
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="px-4 pb-3.5 pt-1 border-t border-white/[0.04] bg-black/20 text-xs text-zinc-300 space-y-2">
                          {item.description && (
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{item.description}</p>
                          )}
                          {item.topics && item.topics.length > 0 && (
                            <ul className="space-y-1 pl-4 list-disc text-[11px] text-zinc-300">
                              {item.topics.map((t, tIdx) => (
                                <li key={tIdx}>{t}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveAllToDatabase}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSaving ? "Saving to Database..." : "Save Syllabus to Database"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
