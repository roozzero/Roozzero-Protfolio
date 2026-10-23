import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail, Send, Search, Filter, AlertTriangle, Check, Trash2, Archive,
  Reply, Forward, Eye, EyeOff, Paperclip, ChevronDown, CheckSquare, Square,
  Clock, Plus, MessageSquare, Info, Shield, Users, Megaphone, User, BookOpen,
  Calendar, Award, ArrowLeft, ArrowUpRight, Copy, CheckCircle, RefreshCw, X,
  AlertCircle, Sparkles
} from "lucide-react";
import { adminApi } from "../../lib/api";
import DeleteConfirmModal from "../common/DeleteConfirmModal";

// Types
export interface AdminMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "student" | "teacher" | "admin" | "super-admin";
  senderAvatar?: string;
  subject: string;
  content: string;
  timestamp: string;
  attachments?: { name: string; size: string; type: string }[];
}

export interface Conversation {
  id: string;
  backendId?: number | string;
  subject: string;
  senderId: string;
  senderName: string;
  senderRole: "student" | "teacher" | "admin" | "super-admin";
  senderAvatar?: string;
  messages: AdminMessage[];
  isRead: boolean;
  isArchived: boolean;
  status: "open" | "closed";
  courseId?: string;
  courseTitle?: string;
  lastUpdated: string;
}

interface InboxTabProps {
  users: any[];
  students: any[];
  courses: any[];
  courseSeasons: any[];
  announcements: any[];
  onAddAnnouncement: (ann: any) => void;
  onDeleteAnnouncement: (id: string) => void;
  showCustomToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function InboxTab({
  users,
  students,
  courses,
  courseSeasons,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
  showCustomToast
}: InboxTabProps) {
  const [activeTab, setActiveTab] = useState<"inbox" | "announcements">("inbox");
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);

  // Backend-backed conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Load authoritative messages from backend API
  const fetchMessages = () => {
    setIsLoadingMessages(true);
    adminApi.getMessages()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const loaded: Conversation[] = res.data.map((r: any) => {
            const isInternal = Boolean(r.isInternal);
            const senderRole = r.sender_role === "teacher" ? ("teacher" as const) : r.sender_role === "admin" ? ("admin" as const) : ("student" as const);
            const senderAvatar = r.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.sender_name || "User")}&background=4f46e5&color=fff`;

            const threadMessages: AdminMessage[] = [
              {
                id: `msg-${r.id}-root`,
                senderId: r.sender_id || `inq-${r.id}`,
                senderName: r.sender_name || (isInternal ? "Academy User" : "Website Visitor"),
                senderRole: senderRole,
                senderAvatar: senderAvatar,
                subject: r.subject || "Message",
                content: r.message || "",
                timestamp: r.created_at ? (r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at)) : new Date().toISOString(),
                attachments: r.attachments
              },
              ...(Array.isArray(r.replies) ? r.replies.map((rep: any) => {
                const repRole = rep.sender_role === "teacher" ? ("teacher" as const) : rep.sender_role === "admin" ? ("admin" as const) : ("student" as const);
                return {
                  id: `msg-rep-${rep.id}`,
                  senderId: rep.sender_id || "admin-1",
                  senderName: rep.sender_name || (repRole === "admin" ? "Administrator" : "User"),
                  senderRole: repRole,
                  senderAvatar: rep.sender_avatar,
                  subject: `Re: ${r.subject}`,
                  content: rep.content,
                  timestamp: rep.created_at ? (rep.created_at instanceof Date ? rep.created_at.toISOString() : String(rep.created_at)) : new Date().toISOString()
                };
              }) : (r.reply_text ? [{
                id: `msg-${r.id}-rep`,
                senderId: r.replied_by || "admin-1",
                senderName: "Administrator",
                senderRole: "admin" as const,
                subject: `Re: ${r.subject || "Message"}`,
                content: r.reply_text,
                timestamp: r.replied_at ? (r.replied_at instanceof Date ? r.replied_at.toISOString() : String(r.replied_at)) : new Date().toISOString()
              }] : []))
            ];

            return {
              id: `conv-msg-${r.id}`,
              backendId: r.id,
              subject: r.subject || (isInternal ? "User Inquiry" : "Website Inquiry"),
              senderId: r.sender_id || `inq-${r.id}`,
              senderName: r.sender_name || (isInternal ? "Academy User" : "Website Visitor"),
              senderRole: senderRole,
              senderAvatar: senderAvatar,
              messages: threadMessages,
              isRead: Boolean(r.is_read),
              isArchived: false,
              status: r.reply_text || (r.replies && r.replies.length > 0) ? ("closed" as const) : ("open" as const),
              lastUpdated: (r.replied_at || r.created_at || new Date().toISOString())
            };
          });
          setConversations(loaded);
          if (selectedConv) {
            const refreshed = loaded.find(c => c.id === selectedConv.id);
            if (refreshed) setSelectedConv(refreshed);
          }
        } else {
          setConversations([]);
        }
      })
      .catch((err) => {
        if (err?.status !== 401 && !err?.message?.includes("Authentication required")) {
          console.warn("Could not load messages from backend:", err?.message || err);
        }
        setConversations([]);
      })
      .finally(() => {
        setIsLoadingMessages(false);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // --- INBOX SUBTAB STATE ---
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [inboxSearch, setInboxSearch] = useState("");
  const [inboxRoleFilter, setInboxRoleFilter] = useState<string>("All");
  const [inboxStatusFilter, setInboxStatusFilter] = useState<string>("All");
  const [inboxCourseFilter, setInboxCourseFilter] = useState<string>("All");
  const [replyText, setReplyText] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<{ name: string; size: string; type: string }[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [inboxPage, setInboxPage] = useState(1);
  const itemsPerPage = 7;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2nd Confirmation Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: "conv" | "announcement";
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: "conv",
    id: "",
    name: ""
  });
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeletingItem(true);
    try {
      if (deleteModalState.type === "conv") {
        const conv = conversations.find(c => c.id === deleteModalState.id);
        const targetId = conv?.backendId ? String(conv.backendId) : deleteModalState.id.replace("conv-msg-", "");
        await adminApi.deleteMessage(targetId);
        setConversations(prev => prev.filter(c => c.id !== deleteModalState.id));
        if (selectedConv && selectedConv.id === deleteModalState.id) {
          setSelectedConv(null);
        }
        showCustomToast("Conversation thread deleted permanently from database.", "success");
      } else if (deleteModalState.type === "announcement") {
        await adminApi.deleteAnnouncement(deleteModalState.id);
        onDeleteAnnouncement(deleteModalState.id);
        showCustomToast("Announcement deleted permanently from database.", "success");
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      showCustomToast(err.message || "Failed to delete item from database.", "warning");
    } finally {
      setIsDeletingItem(false);
      setDeleteModalState(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Auto Scroll thread
  useEffect(() => {
    if (selectedConv) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConv, selectedConv?.messages.length]);

  // Handle Thread Reply Action with authoritative backend
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplyFeedback(null);
    if (!replyText.trim() && replyAttachments.length === 0) {
      setReplyFeedback({ type: "error", text: "Please enter a reply message before sending." });
      return;
    }

    setIsReplying(true);

    try {
      const msgId = selectedConv?.backendId || selectedConv?.id?.replace("conv-msg-", "");
      if (msgId) {
        await adminApi.replyMessage(msgId, replyText.trim());
      }

      setReplyFeedback({ type: "success", text: "Reply sent and saved to conversation history." });
      showCustomToast("Message reply dispatched and stored in database!", "success");
      setReplyText("");
      setReplyAttachments([]);
      fetchMessages();
    } catch (err: any) {
      setReplyFeedback({ type: "error", text: err?.message || "Failed to dispatch reply." });
      showCustomToast(err.message || "Failed to dispatch reply.", "warning");
    } finally {
      setIsReplying(false);
    }
  };

  const handleForwardMessage = (msg: AdminMessage) => {
    setComposeSubject(`Fwd: ${msg.subject}`);
    setComposeContent(`---------- Forwarded message ---------\nFrom: ${msg.senderName} (${msg.senderRole})\nDate: ${new Date(msg.timestamp).toLocaleString()}\nSubject: ${msg.subject}\n\n${msg.content}`);
    setComposeAlert(null);
    setIsComposeModalOpen(true);
  };

  const handleMarkReadStatus = (conv: Conversation, status: boolean) => {
    if (conv.backendId && status) {
      adminApi.markMessageRead(conv.backendId).catch(console.error);
    }
    setConversations(prev =>
      prev.map(c => c.id === conv.id ? { ...c, isRead: status } : c)
    );
    if (selectedConv && selectedConv.id === conv.id) {
      setSelectedConv(prev => prev ? { ...prev, isRead: status } : null);
    }
    showCustomToast(`Conversation marked as ${status ? "read" : "unread"}.`, "success");
  };

  const handleArchiveConv = (conv: Conversation) => {
    setConversations(prev =>
      prev.map(c => c.id === conv.id ? { ...c, isArchived: !c.isArchived } : c)
    );
    if (selectedConv && selectedConv.id === conv.id) {
      setSelectedConv(null);
    }
    showCustomToast(`Conversation ${conv.isArchived ? "moved back to inbox" : "archived safely"}.`, "success");
  };

  const handleDeleteConv = (convId: string) => {
    const conv = conversations.find(c => c.id === convId);
    setDeleteModalState({
      isOpen: true,
      type: "conv",
      id: convId,
      name: conv?.subject || "Conversation Thread"
    });
  };

  const handleCloseConv = (conv: Conversation) => {
    const newStatus = conv.status === "open" ? "closed" : "open";
    setConversations(prev =>
      prev.map(c => c.id === conv.id ? { ...c, status: newStatus } : c)
    );
    if (selectedConv && selectedConv.id === conv.id) {
      setSelectedConv(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showCustomToast(`Conversation is now marked as ${newStatus}.`, "success");
  };

  // --- COMPOSE MODAL STATE ---
  const [recipientType, setRecipientType] = useState<
    "Individual" | "Multiple" | "AllStudents" | "AllTeachers" | "AllAdmins" | "Course"
  >("Individual");
  const [selectedIndividual, setSelectedIndividual] = useState("");
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeContent, setComposeContent] = useState("");
  const [composeAttachments, setComposeAttachments] = useState<{ name: string; size: string; type: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [composeAlert, setComposeAlert] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleComposeAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setComposeAttachments(prevAtt => [
              ...prevAtt,
              {
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                type: file.name.split(".").pop() || "doc"
              }
            ]);
            showCustomToast(`Attached ${file.name} successfully.`, "success");
            return 100;
          }
          return prev + 25;
        });
      }, 100);
    }
  };

  const handleSendCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    setComposeAlert(null);

    if (!composeSubject.trim() || !composeContent.trim()) {
      setComposeAlert({ type: "error", text: "Both message subject and content are required." });
      showCustomToast("Subject and message content are required.", "warning");
      return;
    }

    if (recipientType === "Individual" && !selectedIndividual) {
      setComposeAlert({ type: "error", text: "Please select an individual recipient from the dropdown." });
      showCustomToast("Please select a recipient first.", "warning");
      return;
    }
    if (recipientType === "Multiple" && selectedMultiple.length === 0) {
      setComposeAlert({ type: "error", text: "Please check at least one recipient from the user list." });
      showCustomToast("Please select at least one recipient.", "warning");
      return;
    }
    if (recipientType === "Course" && !selectedCourseId) {
      setComposeAlert({ type: "error", text: "Please select a target course." });
      showCustomToast("Please select a course first.", "warning");
      return;
    }

    setIsSending(true);

    try {
      const res = await adminApi.sendMessage({
        recipientType,
        targetUserId: recipientType === "Individual" ? selectedIndividual : undefined,
        targetUserIds: recipientType === "Multiple" ? selectedMultiple : undefined,
        courseId: recipientType === "Course" ? selectedCourseId : undefined,
        subject: composeSubject.trim(),
        content: composeContent.trim(),
        attachments: composeAttachments
      });

      if (res.success) {
        setComposeAlert({
          type: "success",
          text: `Message dispatched to ${res.data?.recipientLabel || "recipients"} and saved to database!`
        });
        showCustomToast(`Message sent successfully to ${res.data?.recipientLabel || "recipients"}!`, "success");
        setComposeSubject("");
        setComposeContent("");
        setComposeAttachments([]);
        setSelectedIndividual("");
        setSelectedMultiple([]);
        setSelectedCourseId("");
        fetchMessages();
        setTimeout(() => {
          setIsComposeModalOpen(false);
          setComposeAlert(null);
        }, 700);
      }
    } catch (err: any) {
      setComposeAlert({ type: "error", text: err?.message || "Failed to send message. Please try again." });
      showCustomToast(err.message || "Failed to dispatch message.", "warning");
    } finally {
      setIsSending(false);
    }
  };

  // --- ANNOUNCEMENTS TAB STATE ---
  const [annAudience, setAnnAudience] = useState<"Everyone" | "All Students" | "All Teachers" | "Specific Course" | "Individual User">("Everyone");
  const [annTargetId, setAnnTargetId] = useState("");
  const [annTitle, setAnnTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");
  const [annPriority, setAnnPriority] = useState<"Normal" | "Important" | "Urgent">("Normal");
  const [annPublishImmediately, setAnnPublishImmediately] = useState(true);
  const [annScheduleDate, setAnnScheduleDate] = useState("");
  const [annExpirationDate, setAnnExpirationDate] = useState("");
  const [annAttachments, setAnnAttachments] = useState<{ name: string; size: string }[]>([]);
  const [isCreatingAnn, setIsCreatingAnn] = useState(false);
  const [isEditingAnnId, setIsEditingAnnId] = useState<string | null>(null);
  const [annFilterAudience, setAnnFilterAudience] = useState("All");

  const handleAddOrEditAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annDesc.trim()) {
      showCustomToast("Announcement title and description are required.", "warning");
      return;
    }

    setIsCreatingAnn(true);

    setTimeout(() => {
      const statusValue = annPublishImmediately ? "Published" : "Scheduled";

      const announcementPayload = {
        id: isEditingAnnId || "ann-" + Date.now(),
        title: annTitle,
        description: annDesc,
        courseId: annAudience === "Specific Course" ? annTargetId : "all",
        courseTitle: annAudience === "Specific Course" ? courses.find(c => c.id === annTargetId)?.title || "Selected Course" : "All Courses",
        audience: annAudience,
        priority: annPriority,
        publishedAt: new Date().toISOString().split("T")[0],
        status: statusValue,
        scheduleDate: annPublishImmediately ? undefined : annScheduleDate,
        expirationDate: annExpirationDate || undefined,
        attachments: annAttachments.length > 0 ? annAttachments : undefined
      };

      if (isEditingAnnId) {
        onDeleteAnnouncement(isEditingAnnId);
        onAddAnnouncement(announcementPayload);
        showCustomToast("Academy announcement synchronized and updated successfully!", "success");
      } else {
        onAddAnnouncement(announcementPayload);
        showCustomToast("Central academy announcement published to recipient screens!", "success");
      }

      setAnnTitle("");
      setAnnDesc("");
      setAnnTargetId("");
      setAnnPublishImmediately(true);
      setAnnScheduleDate("");
      setAnnExpirationDate("");
      setAnnAttachments([]);
      setIsEditingAnnId(null);
      setIsCreatingAnn(false);
    }, 400);
  };

  const handleEditAnnTrigger = (ann: any) => {
    setIsEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnDesc(ann.description);
    setAnnAudience(ann.audience || "Everyone");
    setAnnPriority(ann.priority || "Normal");
    setAnnPublishImmediately(ann.status !== "Scheduled");
    setAnnScheduleDate(ann.scheduleDate || "");
    setAnnExpirationDate(ann.expirationDate || "");
    setAnnAttachments(ann.attachments || []);
    showCustomToast("Loaded announcement parameters into editor.", "info");
  };

  const handleDuplicateAnn = (ann: any) => {
    const duplicatedPayload = {
      ...ann,
      id: "ann-dup-" + Date.now(),
      title: `${ann.title} (Copy)`,
      publishedAt: new Date().toISOString().split("T")[0],
      status: "Draft"
    };
    onAddAnnouncement(duplicatedPayload);
    showCustomToast("Announcement duplicated successfully.", "success");
  };

  const handleTogglePublishAnn = (ann: any) => {
    const updatedPayload = {
      ...ann,
      status: ann.status === "Published" ? "Draft" : "Published"
    };
    onDeleteAnnouncement(ann.id);
    onAddAnnouncement(updatedPayload);
    showCustomToast(`Announcement status is now ${updatedPayload.status}.`, "success");
  };

  const handleArchiveAnn = (ann: any) => {
    const updatedPayload = {
      ...ann,
      status: "Archived"
    };
    onDeleteAnnouncement(ann.id);
    onAddAnnouncement(updatedPayload);
    showCustomToast("Announcement moved to system archives.", "success");
  };

  // Helpers
  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "admin": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "teacher": return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
      default: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  // Filter Conversations
  const filteredConversations = conversations
    .filter(c => !c.isArchived)
    .filter(c => {
      const matchSearch = c.subject.toLowerCase().includes(inboxSearch.toLowerCase()) ||
        c.senderName.toLowerCase().includes(inboxSearch.toLowerCase()) ||
        c.messages.some(m => m.content.toLowerCase().includes(inboxSearch.toLowerCase()));

      const matchRole = inboxRoleFilter === "All" || c.senderRole.toLowerCase() === inboxRoleFilter.toLowerCase();
      const matchStatus = inboxStatusFilter === "All" ||
        (inboxStatusFilter === "Unread" && !c.isRead) ||
        (inboxStatusFilter === "Read" && c.isRead) ||
        (inboxStatusFilter === "Open" && c.status === "open") ||
        (inboxStatusFilter === "Closed" && c.status === "closed");

      const matchCourse = inboxCourseFilter === "All" || c.courseId === inboxCourseFilter;

      return matchSearch && matchRole && matchStatus && matchCourse;
    });

  // Pagination for Inbox
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const paginatedConversations = filteredConversations.slice(
    (inboxPage - 1) * itemsPerPage,
    inboxPage * itemsPerPage
  );

  const unreadCount = conversations.filter(c => !c.isRead && !c.isArchived).length;

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* REDESIGNED MODERN HEADER */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0d0e17] via-[#090a10] to-[#060609] border border-white/[0.07] shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase tracking-widest">
            <Sparkles size={11} />
            <span>Unified Messaging & Broadcast Center</span>
          </div>
          <h2 className="font-sans text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Academy Inbox & Communications</span>
          </h2>
          <p className="text-xs text-white/45 max-w-2xl leading-relaxed">
            View and respond to student and instructor conversations in real time, or compose direct and group messages via modal.
          </p>
        </div>

        {/* Action & Quick Stats */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Mail size={16} /></div>
            <div>
              <span className="text-[9px] text-white/40 font-bold block uppercase font-mono">Unread</span>
              <span className="text-sm font-black text-white">{unreadCount}</span>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400"><MessageSquare size={16} /></div>
            <div>
              <span className="text-[9px] text-white/40 font-bold block uppercase font-mono">Total Threads</span>
              <span className="text-sm font-black text-white">{conversations.length}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setComposeAlert(null);
              setIsComposeModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide transition-all flex items-center gap-2 shadow-[0_8px_25px_rgba(79,70,229,0.35)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus size={16} />
            <span>Compose Message</span>
          </button>
        </div>
      </div>

      {/* Navigation Bar (Only Inbox & Announcements — Compose is a Modal button, Sent tab removed) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: "inbox" as const, label: "Inbox Conversations", icon: Mail, badge: unreadCount },
            { id: "announcements" as const, label: "Academy Announcements", icon: Megaphone, badge: announcements.length }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedConv(null);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? "bg-indigo-600/15 border-indigo-500/40 text-white shadow-lg"
                    : "bg-white/[0.02] border-white/[0.05] text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-indigo-400" : "text-white/40"} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono ${
                    isActive ? "bg-indigo-500 text-white" : "bg-white/10 text-white/50"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMessages}
            className="px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs text-white/70 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            title="Refresh Inbox"
          >
            <RefreshCw size={13} className={isLoadingMessages ? "animate-spin text-indigo-400" : ""} />
            <span>Sync Inbox</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setComposeAlert(null);
              setIsComposeModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send size={13} />
            <span>New Message</span>
          </button>
        </div>
      </div>

      {/* Main Tab Viewpanels */}
      <div className="min-h-[540px]">
        
        {/* ==================== 1. INBOX TAB ==================== */}
        {activeTab === "inbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Conversation Threads List */}
            <div className={`space-y-4 lg:col-span-5 ${selectedConv ? "hidden lg:block" : "col-span-12"}`}>
              
              {/* Search & Quick Filter Controls */}
              <div className="bg-[#090a10] border border-white/[0.07] rounded-3xl p-4 space-y-3.5 shadow-xl">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Search size={14} /></span>
                  <input
                    type="text"
                    placeholder="Search sender, subject, or message content..."
                    value={inboxSearch}
                    onChange={(e) => { setInboxSearch(e.target.value); setInboxPage(1); }}
                    className="w-full bg-[#040407] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>

                {/* Quick Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                  {[
                    { label: "All", role: "All", status: "All" },
                    { label: `Unread (${unreadCount})`, role: "All", status: "Unread" },
                    { label: "Teachers", role: "Teacher", status: "All" },
                    { label: "Students", role: "Student", status: "All" },
                    { label: "Sent by Admin", role: "Admin", status: "All" }
                  ].map((chip, idx) => {
                    const active = inboxRoleFilter === chip.role && inboxStatusFilter === chip.status;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setInboxRoleFilter(chip.role);
                          setInboxStatusFilter(chip.status);
                          setInboxPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer border ${
                          active
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                            : "bg-white/[0.02] text-white/50 border-white/5 hover:text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conversations Stack */}
              <div className="space-y-2.5">
                {paginatedConversations.length === 0 ? (
                  <div className="p-12 text-center bg-[#090a10] border border-dashed border-white/10 rounded-3xl space-y-3">
                    <Mail className="mx-auto text-white/20" size={32} />
                    <p className="text-xs text-white/40">No conversations match your current filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setComposeAlert(null);
                        setIsComposeModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Compose First Message</span>
                    </button>
                  </div>
                ) : (
                  paginatedConversations.map((conv) => {
                    const isSelected = selectedConv?.id === conv.id;
                    const latestMsg = conv.messages[conv.messages.length - 1];
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          if (!conv.isRead && conv.backendId) {
                            adminApi.markMessageRead(conv.backendId).catch(console.error);
                          }
                          const updated = { ...conv, isRead: true };
                          setConversations(prev => prev.map(c => c.id === conv.id ? updated : c));
                          setSelectedConv(updated);
                          setReplyFeedback(null);
                        }}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden group ${
                          isSelected 
                            ? "bg-indigo-500/[0.08] border-indigo-500/50 shadow-xl" 
                            : conv.isRead 
                              ? "bg-[#090a10] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]" 
                              : "bg-[#0d0f1d] border-indigo-500/30 hover:border-indigo-500/50"
                        }`}
                      >
                        {!conv.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                        )}

                        <div className="flex items-start gap-3">
                          <img
                            src={conv.senderAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"}
                            alt={conv.senderName}
                            className="h-10 w-10 rounded-2xl object-cover border border-white/10 shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold text-white text-xs truncate">{conv.senderName}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border shrink-0 ${getRoleColor(conv.senderRole)}`}>
                                  {conv.senderRole}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-white/35 shrink-0">
                                {new Date(conv.lastUpdated).toLocaleDateString([], { month: "short", day: "numeric" })}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`text-xs tracking-tight truncate ${!conv.isRead ? "font-black text-white" : "font-semibold text-white/85"}`}>
                                {conv.subject}
                              </h4>
                              {conv.messages.length > 1 && (
                                <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-indigo-300 shrink-0">
                                  {conv.messages.length} msgs
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-white/45 line-clamp-1">
                              {latestMsg ? latestMsg.content : "No message content."}
                            </p>
                          </div>
                        </div>

                        {/* Quick Action Icons */}
                        <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-white/[0.04] opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleMarkReadStatus(conv, !conv.isRead); }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px]"
                            title={conv.isRead ? "Mark Unread" : "Mark Read"}
                          >
                            {conv.isRead ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleArchiveConv(conv); }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                            title="Archive"
                          >
                            <Archive size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteConv(conv.id); }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title="Delete Permanently"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 select-none">
                  <span className="text-[10px] text-white/40 font-mono">
                    Page {inboxPage} of {totalPages} ({filteredConversations.length} threads)
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setInboxPage(prev => Math.max(1, prev - 1))}
                      disabled={inboxPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#090a10] text-[10px] text-white/60 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setInboxPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={inboxPage === totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#090a10] text-[10px] text-white/60 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Thread Message Panel */}
            <div className={`lg:col-span-7 ${!selectedConv ? "hidden lg:block" : "col-span-12"}`}>
              {selectedConv ? (
                <div className="bg-[#090a10] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[560px]">
                  
                  {/* Thread Header */}
                  <div className="p-4 md:p-5 border-b border-white/[0.06] bg-white/[0.015] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedConv(null)}
                        className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer lg:hidden"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <img
                        src={selectedConv.senderAvatar}
                        alt={selectedConv.senderName}
                        className="h-10 w-10 rounded-2xl object-cover border border-white/10"
                      />
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white leading-none">{selectedConv.senderName}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${getRoleColor(selectedConv.senderRole)}`}>
                            {selectedConv.senderRole}
                          </span>
                        </div>
                        <span className="text-xs text-white/50 block mt-1">
                          {selectedConv.subject}
                        </span>
                      </div>
                    </div>

                    {/* Thread Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCloseConv(selectedConv)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          selectedConv.status === "closed"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {selectedConv.status === "closed" ? "Resolved / Closed" : "Active Thread"}
                      </button>
                      <button
                        onClick={() => handleDeleteConv(selectedConv.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                        title="Delete Thread Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Messages Bubble Stack */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[380px]">
                    {selectedConv.messages.map((msg) => {
                      const isMe = msg.senderId === "usr-1" || msg.senderId === "admin-1" || msg.senderRole === "admin" || msg.senderRole === "super-admin";
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                        >
                          {!isMe && (
                            <img
                              src={msg.senderAvatar || selectedConv.senderAvatar}
                              alt={msg.senderName}
                              className="h-8 w-8 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                          )}
                          <div className="space-y-1">
                            <div className={`text-[10px] text-white/35 flex items-center gap-1.5 ${isMe ? "justify-end" : ""}`}>
                              <span className="font-semibold text-white/60">{msg.senderName}</span>
                              <span>•</span>
                              <span>{new Date(msg.timestamp).toLocaleString()}</span>
                            </div>
                            <div className={`p-4 rounded-2xl text-xs text-left leading-relaxed ${
                              isMe 
                                ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/15" 
                                : "bg-white/[0.04] border border-white/10 text-white/90 rounded-tl-none"
                            }`}>
                              <p className="whitespace-pre-line">{msg.content}</p>

                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                                  {msg.attachments.map((att, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/10 text-[10px]"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Paperclip size={12} className="text-indigo-300 shrink-0" />
                                        <span className="text-white/90 truncate max-w-[160px]">{att.name}</span>
                                        <span className="text-white/40 font-mono">({att.size})</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className={`flex items-center gap-2 mt-1 ${isMe ? "justify-end" : ""}`}>
                              <button
                                type="button"
                                onClick={() => handleForwardMessage(msg)}
                                className="text-[10px] text-white/35 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Forward size={11} />
                                <span>Forward in Modal</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Composer box */}
                  <div className="p-4 md:p-5 border-t border-white/[0.06] bg-white/[0.01]">
                    {replyFeedback && (
                      <div className={`mb-3 p-3 rounded-xl border text-xs flex items-center justify-between ${
                        replyFeedback.type === "error"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      }`}>
                        <div className="flex items-center gap-2">
                          <AlertCircle size={14} />
                          <span>{replyFeedback.text}</span>
                        </div>
                        <button type="button" onClick={() => setReplyFeedback(null)} className="text-white/40 hover:text-white">
                          <X size={13} />
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleReply} className="space-y-3">
                      <div className="relative">
                        <textarea
                          rows={3}
                          placeholder="Write your reply to this conversation..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full bg-[#040407] border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 transition-all pr-24"
                        />
                        <button
                          type="submit"
                          disabled={isReplying || (!replyText.trim() && replyAttachments.length === 0)}
                          className="absolute right-3 bottom-3 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer transition-all shadow-lg shadow-indigo-600/20"
                        >
                          <Send size={13} className={isReplying ? "animate-spin" : ""} />
                          <span>Reply</span>
                        </button>
                      </div>
                    </form>
                  </div>

                </div>
              ) : (
                <div className="h-full min-h-[540px] bg-[#090a10] border border-white/[0.06] border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <MessageSquare size={28} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-sans text-base font-bold text-white">Select a Conversation</h3>
                    <p className="text-xs text-white/40 max-w-xs leading-relaxed">
                      Click any message thread on the left to view the full chat history and reply, or start a new conversation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setComposeAlert(null);
                      setIsComposeModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
                  >
                    <Plus size={15} />
                    <span>Compose New Message</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== 2. ANNOUNCEMENTS TAB ==================== */}
        {activeTab === "announcements" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Create / Edit Announcement panel */}
            <div className="lg:col-span-5 bg-[#090a10] border border-white/[0.07] rounded-3xl p-5 md:p-6 space-y-5 text-left">
              <div className="border-b border-white/[0.05] pb-3">
                <h3 className="font-sans text-sm font-black text-white">
                  {isEditingAnnId ? "Modify Announcement" : "Publish Global Alert"}
                </h3>
                <p className="text-xs text-white/40">Broadcast notification updates synchronized to student and instructor portals</p>
              </div>

              <form onSubmit={handleAddOrEditAnnouncement} className="space-y-4 text-xs text-white">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Target Audience Cohort</label>
                  <select
                    value={annAudience}
                    onChange={(e) => {
                      setAnnAudience(e.target.value as any);
                      setAnnTargetId("");
                    }}
                    className="w-full bg-[#030304] border border-white/10 rounded-xl px-3 py-2.5 text-white/80 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                  >
                    <option value="Everyone">Everyone (All Users)</option>
                    <option value="All Students">All Students</option>
                    <option value="All Teachers">All Teachers</option>
                    <option value="Specific Course">Specific Course Roster</option>
                    <option value="Individual User">Individual Academic User</option>
                  </select>
                </div>

                {annAudience === "Specific Course" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 block">Course Selection</label>
                    <select
                      value={annTargetId}
                      onChange={(e) => setAnnTargetId(e.target.value)}
                      className="w-full bg-[#030304] border border-white/10 rounded-xl px-3 py-2 text-white/80"
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {annAudience === "Individual User" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 block">User Selection</label>
                    <select
                      value={annTargetId}
                      onChange={(e) => setAnnTargetId(e.target.value)}
                      className="w-full bg-[#030304] border border-white/10 rounded-xl px-3 py-2 text-white/80"
                    >
                      <option value="">-- Choose Individual User --</option>
                      {[...users, ...students].map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role || "student"})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Title Heading</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter announcement headline..."
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full bg-[#030304] border border-white/10 rounded-xl px-3 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Detailed Alert Body</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Draft public notice..."
                    value={annDesc}
                    onChange={(e) => setAnnDesc(e.target.value)}
                    className="w-full bg-[#030304] border border-white/10 rounded-xl p-3 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Alert Priority Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Normal" as const, label: "Normal", color: "border-indigo-500/10 hover:bg-indigo-500/5 hover:text-indigo-400" },
                      { id: "Important" as const, label: "Important", color: "border-amber-500/10 hover:bg-amber-500/5 hover:text-amber-400" },
                      { id: "Urgent" as const, label: "Urgent", color: "border-rose-500/10 hover:bg-rose-500/5 hover:text-rose-400" }
                    ].map((p) => {
                      const isSel = annPriority === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAnnPriority(p.id)}
                          className={`py-2 rounded-xl text-center font-bold tracking-wide transition-all border text-[10px] cursor-pointer ${
                            isSel
                              ? p.id === "Urgent"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/40"
                                : p.id === "Important"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                                  : "bg-indigo-500/10 text-indigo-400 border-indigo-500/40"
                              : `bg-white/[0.01] text-white/40 border-white/5 ${p.color}`
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {isEditingAnnId && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingAnnId(null);
                        setAnnTitle("");
                        setAnnDesc("");
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isCreatingAnn}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide shadow-md cursor-pointer disabled:opacity-40"
                  >
                    <Megaphone size={12} className={isCreatingAnn ? "animate-bounce" : ""} />
                    <span>{isCreatingAnn ? "Publishing..." : isEditingAnnId ? "Update Alert" : "Publish Broadcast"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Announcements board */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#090a10] border border-white/[0.07] rounded-3xl p-4 md:p-5 flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-white">Live Academy Broadcast Board ({announcements.length})</span>
                <select
                  value={annFilterAudience}
                  onChange={(e) => setAnnFilterAudience(e.target.value)}
                  className="bg-[#030304] border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-white/60 cursor-pointer"
                >
                  <option value="All">All Audience types</option>
                  <option value="Everyone">Everyone</option>
                  <option value="All Students">All Students</option>
                  <option value="All Teachers">All Teachers</option>
                  <option value="Specific Course">Course-specific</option>
                </select>
              </div>

              <div className="space-y-3">
                {announcements
                  .filter(a => annFilterAudience === "All" || a.audience === annFilterAudience)
                  .map((ann) => {
                    const isDraft = ann.status === "Draft";
                    const isScheduled = ann.status === "Scheduled";
                    const isArchived = ann.status === "Archived";
                    const isUrgent = ann.priority === "Urgent";
                    return (
                      <div
                        key={ann.id}
                        className={`p-4 rounded-3xl border text-left bg-[#090a10] transition-all relative overflow-hidden group ${
                          isUrgent 
                            ? "border-rose-500/20 bg-rose-500/[0.01]" 
                            : ann.priority === "Important"
                              ? "border-amber-500/20 bg-amber-500/[0.01]"
                              : "border-white/[0.06]"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-mono text-white/40 block">
                              Published: <strong>{ann.publishedAt}</strong>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                              isDraft 
                                ? "bg-white/10 text-white/60" 
                                : isScheduled 
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                  : isArchived
                                    ? "bg-white/5 text-white/30"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {ann.status}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide">
                              To: {ann.audience || "Everyone"}
                            </span>
                          </div>

                          <h4 className="text-xs font-black text-white">{ann.title}</h4>
                          <p className="text-[11px] text-white/45 leading-relaxed whitespace-pre-wrap">{ann.description}</p>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.04] select-none">
                            <button
                              onClick={() => handleTogglePublishAnn(ann)}
                              className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <CheckCircle size={11} className={ann.status === "Published" ? "text-emerald-400" : ""} />
                              <span>{ann.status === "Published" ? "Unpublish" : "Publish"}</span>
                            </button>
                            <span className="text-white/10">•</span>
                            <button
                              onClick={() => handleEditAnnTrigger(ann)}
                              className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Plus size={11} />
                              <span>Edit</span>
                            </button>
                            <span className="text-white/10">•</span>
                            <button
                              onClick={() => handleDuplicateAnn(ann)}
                              className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Copy size={11} />
                              <span>Copy</span>
                            </button>
                            <span className="text-white/10">•</span>
                            <button
                              onClick={() => handleArchiveAnn(ann)}
                              className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Archive size={11} />
                              <span>Archive</span>
                            </button>
                            <span className="text-white/10">•</span>
                            <button
                              onClick={() => {
                                setDeleteModalState({
                                  isOpen: true,
                                  type: "announcement",
                                  id: ann.id,
                                  name: ann.title || "Announcement"
                                });
                              }}
                              className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 size={11} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {announcements.length === 0 && (
                  <div className="p-12 text-center bg-[#090a10] border border-dashed border-white/10 rounded-3xl space-y-3">
                    <Megaphone className="mx-auto text-white/25" size={28} />
                    <p className="text-xs text-white/40">No academy-wide announcements live yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== COMPOSE MESSAGE MODAL ==================== */}
      <AnimatePresence>
        {isComposeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="w-full max-w-2xl max-h-[90vh] bg-[#0b0c14] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Send size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Compose New Message</h3>
                    <p className="text-xs text-white/45">Send direct or group messages to students, teachers, or course cohorts</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsComposeModalOpen(false)}
                  className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSendCompose} className="p-6 overflow-y-auto space-y-5 flex-1">
                {composeAlert && (
                  <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                    composeAlert.type === "error"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  }`}>
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{composeAlert.text}</span>
                    </div>
                    <button type="button" onClick={() => setComposeAlert(null)} className="text-white/40 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Recipient Type Row */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Select Recipient Group</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "Individual" as const, label: "Individual User" },
                      { id: "Multiple" as const, label: "Multiple Users" },
                      { id: "AllStudents" as const, label: "All Students" },
                      { id: "AllTeachers" as const, label: "All Teachers" },
                      { id: "AllAdmins" as const, label: "All Admins" },
                      { id: "Course" as const, label: "Course Roster" }
                    ].map((opt) => {
                      const isSelected = recipientType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setRecipientType(opt.id);
                            setSelectedIndividual("");
                            setSelectedMultiple([]);
                            setSelectedCourseId("");
                          }}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                              : "bg-white/[0.02] hover:bg-white/[0.05] border-white/10 text-white/60 hover:text-white"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Recipient Selectors */}
                {recipientType === "Individual" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Recipient User *</label>
                    <select
                      value={selectedIndividual}
                      onChange={(e) => setSelectedIndividual(e.target.value)}
                      className="w-full bg-[#040407] border border-white/15 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Choose User --</option>
                      <optgroup label="Instructors & Staff">
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role}) - {u.email}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Students">
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (Student) - {s.email}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                )}

                {recipientType === "Multiple" && (
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Select Multiple Users *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Search size={13} /></span>
                      <input
                        type="text"
                        placeholder="Filter users by name..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full bg-[#040407] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="bg-[#040407] border border-white/10 rounded-2xl p-3 max-h-[150px] overflow-y-auto space-y-1.5">
                      {[...users, ...students]
                        .filter(u => !userSearchTerm || u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()))
                        .map(user => {
                          const isChecked = selectedMultiple.includes(user.id);
                          return (
                            <div
                              key={user.id}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedMultiple(prev => prev.filter(id => id !== user.id));
                                } else {
                                  setSelectedMultiple(prev => [...prev, user.id]);
                                }
                              }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors"
                            >
                              <span className="text-indigo-400 shrink-0">
                                {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
                              </span>
                              <span className="text-xs text-white/85 font-bold">{user.name}</span>
                              <span className={`text-[9px] font-mono uppercase px-1.5 rounded border ${getRoleColor(user.role || "student")}`}>
                                {user.role || "student"}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {recipientType === "Course" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Target Course *</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full bg-[#040407] border border-white/15 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Subject Line *</label>
                  <input
                    type="text"
                    placeholder="Enter message subject..."
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full bg-[#040407] border border-white/15 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/25 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Message Body *</label>
                  <textarea
                    rows={5}
                    placeholder="Write your message here..."
                    value={composeContent}
                    onChange={(e) => setComposeContent(e.target.value)}
                    className="w-full bg-[#040407] border border-white/15 rounded-2xl p-4 text-xs text-white placeholder-white/25 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Attachments */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80 hover:text-white cursor-pointer flex items-center gap-2">
                      <Paperclip size={13} />
                      <span>Attach File</span>
                      <input type="file" className="hidden" onChange={handleComposeAttachmentUpload} />
                    </label>
                    {composeAttachments.map((att, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] flex items-center gap-1.5">
                        <span className="truncate max-w-[120px]">{att.name}</span>
                        <button type="button" onClick={() => setComposeAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-400">×</button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsComposeModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSending || isUploading}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-40"
                    >
                      <Send size={13} className={isSending ? "animate-spin" : ""} />
                      <span>{isSending ? "Sending..." : "Send Message"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2ND CONFIRMATION DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title={
          deleteModalState.type === "conv"
            ? "Permanently Delete Conversation"
            : "Permanently Delete Announcement"
        }
        message="This action will permanently delete this record from the database. Are you sure you want to proceed?"
        itemName={deleteModalState.name}
        isDeleting={isDeletingItem}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
