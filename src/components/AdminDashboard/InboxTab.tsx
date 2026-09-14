import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail, Send, Search, Filter, AlertTriangle, Check, Trash2, Archive,
  Reply, Forward, Eye, EyeOff, Paperclip, ChevronDown, CheckSquare, Square,
  Clock, Plus, MessageSquare, Info, Shield, Users, Megaphone, User, BookOpen,
  Calendar, Award, ArrowLeft, ArrowUpRight, Copy, CheckCircle, RefreshCw, X
} from "lucide-react";

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

export interface SentMessage {
  id: string;
  recipients: string[]; // List of recipient names
  recipientRole: string; // e.g., "Individual Student", "All Students", "Multiple Users", "React Course Students"
  subject: string;
  content: string;
  timestamp: string;
  attachments?: { name: string; size: string; type: string }[];
  deliveryStats: {
    delivered: number;
    read: number;
    unread: number;
  };
  isRead: boolean; // General read status or first recipient read status
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
  const [activeTab, setActiveTab] = useState<"inbox" | "compose" | "announcements" | "sent">("inbox");

  // Persistent States in Local Storage for High Fidelity
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem("admin_conversations");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "conv-1",
        subject: "Medical Leave Request Extension",
        senderId: "stu-1",
        senderName: "Cody Fisher",
        senderRole: "student",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
        isRead: false,
        isArchived: false,
        status: "open",
        courseId: "react-adv",
        courseTitle: "Advanced React & Architecture",
        lastUpdated: "2026-07-04T10:15:00Z",
        messages: [
          {
            id: "msg-1-1",
            senderId: "stu-1",
            senderName: "Cody Fisher",
            senderRole: "student",
            senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
            subject: "Medical Leave Request Extension",
            content: "Dear Admin, I have been advised bed rest due to severe flu. I would like to request an extension of my medical leave for another 3 days until July 8. Attached is my diagnostic certificate. Thank you.",
            timestamp: "2026-07-04T10:15:00Z",
            attachments: [{ name: "medical_report_signed.pdf", size: "1.4 MB", type: "pdf" }]
          }
        ]
      },
      {
        id: "conv-2",
        subject: "Swiss Typography Reference Books Allocations",
        senderId: "usr-3",
        senderName: "Sarah Vance",
        senderRole: "teacher",
        senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
        isRead: true,
        isArchived: false,
        status: "open",
        courseId: "swiss-typo",
        courseTitle: "Swiss Typography & Editorial Layout",
        lastUpdated: "2026-07-03T14:30:00Z",
        messages: [
          {
            id: "msg-2-1",
            senderId: "usr-3",
            senderName: "Sarah Vance",
            senderRole: "teacher",
            senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
            subject: "Swiss Typography Reference Books Allocations",
            content: "Hello Jaden, we have an influx of students registering for the Autumn Typography season. We need to allocate 5 more physical reference copies of Josef Müller-Brockmann's 'Grid Systems in Graphic Design' to the digital reserve archive. Let me know if we have the system licenses.",
            timestamp: "2026-07-03T14:30:00Z"
          },
          {
            id: "msg-2-2",
            senderId: "usr-1",
            senderName: "Jaden Smith",
            senderRole: "super-admin",
            senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
            subject: "Re: Swiss Typography Reference Books Allocations",
            content: "Hi Sarah, I will look into licensing codes and dispatch an approval notice to the library reserve department today.",
            timestamp: "2026-07-03T16:00:00Z"
          }
        ]
      },
      {
        id: "conv-3",
        subject: "Framer Motion custom canvas engine evaluation criteria",
        senderId: "stu-2",
        senderName: "Esther Howard",
        senderRole: "student",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
        isRead: false,
        isArchived: false,
        status: "open",
        courseId: "react-adv",
        courseTitle: "Advanced React & Architecture",
        lastUpdated: "2026-07-02T09:45:00Z",
        messages: [
          {
            id: "msg-3-1",
            senderId: "stu-2",
            senderName: "Esther Howard",
            senderRole: "student",
            senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
            subject: "Framer Motion custom canvas engine evaluation criteria",
            content: "Hello, regarding our Framer Motion Canvas assignment, is GPU acceleration layout constraints weighted in the final marks? I want to optimize my matrix transforms beforehand. Thanks!",
            timestamp: "2026-07-02T09:45:00Z"
          }
        ]
      }
    ];
  });

  const [sentMessages, setSentMessages] = useState<SentMessage[]>(() => {
    const saved = localStorage.getItem("admin_sent_messages");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "sent-1",
        recipients: ["Sarah Vance"],
        recipientRole: "Teacher",
        subject: "Dispatched Library Reserve License Keys",
        content: "Hi Sarah, the library reserve licenses for Swiss Typography have been issued. 5 extra digital keys are now fully live on the student dashboards.",
        timestamp: "2026-07-03T18:00:00Z",
        attachments: [{ name: "digital_reserve_keys.zip", size: "2.8 MB", type: "zip" }],
        deliveryStats: { delivered: 1, read: 1, unread: 0 },
        isRead: true
      },
      {
        id: "sent-2",
        recipients: ["Cody Fisher", "Esther Howard"],
        recipientRole: "Multiple Students (Advanced React)",
        subject: "Pre-Midterm Study Guides Dispatch",
        content: "Hello team, please find attached the layout study guides covering modern rendering cycles and custom GPU matrix optimization tips.",
        timestamp: "2026-07-01T11:00:00Z",
        attachments: [{ name: "react_gpu_rendering.pdf", size: "4.5 MB", type: "pdf" }],
        deliveryStats: { delivered: 2, read: 1, unread: 1 },
        isRead: false
      }
    ];
  });

  // Save states to local storage
  useEffect(() => {
    localStorage.setItem("admin_conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("admin_sent_messages", JSON.stringify(sentMessages));
  }, [sentMessages]);

  // --- INBOX SUBTAB STATE ---
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [inboxSearch, setInboxSearch] = useState("");
  const [inboxRoleFilter, setInboxRoleFilter] = useState<string>("All");
  const [inboxStatusFilter, setInboxStatusFilter] = useState<string>("All");
  const [inboxCourseFilter, setInboxCourseFilter] = useState<string>("All");
  const [replyText, setReplyText] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<{ name: string; size: string; type: string }[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const [inboxPage, setInboxPage] = useState(1);
  const itemsPerPage = 5;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll thread
  useEffect(() => {
    if (selectedConv) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConv, selectedConv?.messages.length]);

  // Handle Thread Reply Action
  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && replyAttachments.length === 0) return;

    setIsReplying(true);

    // Mock network lag
    setTimeout(() => {
      const newMsg: AdminMessage = {
        id: "msg-rep-" + Date.now(),
        senderId: "usr-1",
        senderName: "Jaden Smith",
        senderRole: "super-admin",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
        subject: `Re: ${selectedConv?.subject}`,
        content: replyText,
        timestamp: new Date().toISOString(),
        attachments: replyAttachments.length > 0 ? replyAttachments : undefined
      };

      if (selectedConv) {
        const updatedConv: Conversation = {
          ...selectedConv,
          messages: [...selectedConv.messages, newMsg],
          isRead: true,
          lastUpdated: new Date().toISOString()
        };

        setConversations(prev =>
          prev.map(c => c.id === selectedConv.id ? updatedConv : c)
        );
        setSelectedConv(updatedConv);
        showCustomToast("Message reply dispatched successfully!", "success");
      }

      setReplyText("");
      setReplyAttachments([]);
      setIsReplying(false);
    }, 600);
  };

  const handleForwardMessage = (msg: AdminMessage) => {
    // Fill compose tab with forward information
    setComposeSubject(`Fwd: ${msg.subject}`);
    setComposeContent(`---------- Forwarded message ---------\nFrom: ${msg.senderName} (${msg.senderRole})\nDate: ${new Date(msg.timestamp).toLocaleString()}\nSubject: ${msg.subject}\n\n${msg.content}`);
    setActiveTab("compose");
    showCustomToast("Message populated into Composer.", "info");
  };

  const handleMarkReadStatus = (conv: Conversation, status: boolean) => {
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
    if (confirm("Are you sure you want to delete this entire conversation thread? This action is irreversible.")) {
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (selectedConv && selectedConv.id === convId) {
        setSelectedConv(null);
      }
      showCustomToast("Conversation thread deleted permanently.", "success");
    }
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

  // --- COMPOSE TAB STATE ---
  const [recipientType, setRecipientType] = useState<
    "Individual" | "Multiple" | "AllStudents" | "AllTeachers" | "AllAdmins" | "Course" | "Season"
  >("Individual");
  const [selectedIndividual, setSelectedIndividual] = useState("");
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeContent, setComposeContent] = useState("");
  const [composeAttachments, setComposeAttachments] = useState<{ name: string; size: string; type: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  const handleComposeAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate file upload progress bars
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
            showCustomToast(`Uploaded ${file.name} successfully.`, "success");
            return 100;
          }
          return prev + 20;
        });
      }, 150);
    }
  };

  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeContent.trim()) {
      showCustomToast("Subject and message content are required.", "warning");
      return;
    }

    // Determine Recipients list
    let recList: string[] = [];
    let recRoleLabel = "";

    if (recipientType === "Individual") {
      const userObj = users.find(u => u.id === selectedIndividual) || students.find(s => s.id === selectedIndividual);
      if (!userObj) {
        showCustomToast("Please select a recipient first.", "warning");
        return;
      }
      recList = [userObj.name];
      recRoleLabel = `Individual (${userObj.role || "student"})`;
    } else if (recipientType === "Multiple") {
      if (selectedMultiple.length === 0) {
        showCustomToast("Please select at least one recipient.", "warning");
        return;
      }
      recList = selectedMultiple.map(mid => {
        const u = users.find(usr => usr.id === mid) || students.find(std => std.id === mid);
        return u ? u.name : "System User";
      });
      recRoleLabel = "Multiple Recipients";
    } else if (recipientType === "AllStudents") {
      recList = students.map(s => s.name);
      recRoleLabel = "All Students";
    } else if (recipientType === "AllTeachers") {
      recList = users.filter(u => u.role === "teacher").map(t => t.name);
      recRoleLabel = "All Teachers";
    } else if (recipientType === "AllAdmins") {
      recList = users.filter(u => u.role === "admin" || u.role === "super-admin").map(a => a.name);
      recRoleLabel = "All Administrators";
    } else if (recipientType === "Course") {
      const course = courses.find(c => c.id === selectedCourseId);
      if (!course) {
        showCustomToast("Please select a course first.", "warning");
        return;
      }
      // Target students enrolled in that course
      recList = students.filter(s => s.courseId === selectedCourseId).map(s => s.name);
      recRoleLabel = `Course Student Roster: ${course.title}`;
    } else if (recipientType === "Season") {
      const season = courseSeasons.find(s => s.id === selectedSeasonId);
      if (!season) {
        showCustomToast("Please select a course season first.", "warning");
        return;
      }
      recList = students.filter(s => s.seasonId === selectedSeasonId || s.courseId === season.courseId).map(s => s.name);
      recRoleLabel = `Season Student Intake: ${season.name}`;
    }

    setIsSending(true);

    setTimeout(() => {
      const newSent: SentMessage = {
        id: "sent-" + Date.now(),
        recipients: recList,
        recipientRole: recRoleLabel,
        subject: composeSubject,
        content: composeContent,
        timestamp: new Date().toISOString(),
        attachments: composeAttachments.length > 0 ? composeAttachments : undefined,
        deliveryStats: {
          delivered: recList.length,
          read: 0,
          unread: recList.length
        },
        isRead: false
      };

      setSentMessages(prev => [newSent, ...prev]);
      showCustomToast(`Central message sent safely to ${recList.length} recipient(s)!`, "success");

      // Reset
      setComposeSubject("");
      setComposeContent("");
      setComposeAttachments([]);
      setSelectedIndividual("");
      setSelectedMultiple([]);
      setIsSending(false);
      setActiveTab("sent");
    }, 800);
  };

  // --- ANNOUNCEMENTS TAB STATE ---
  const [annAudience, setAnnAudience] = useState<"Everyone" | "All Students" | "All Teachers" | "Specific Course" | "Specific Season" | "Individual User">("Everyone");
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
        // Edit Action
        onDeleteAnnouncement(isEditingAnnId);
        onAddAnnouncement(announcementPayload);
        showCustomToast("Academy announcement synchronized and updated successfully!", "success");
      } else {
        // Create Action
        onAddAnnouncement(announcementPayload);
        showCustomToast("Central academy announcement published to recipient screens!", "success");
      }

      // Reset Form
      setAnnTitle("");
      setAnnDesc("");
      setAnnTargetId("");
      setAnnPublishImmediately(true);
      setAnnScheduleDate("");
      setAnnExpirationDate("");
      setAnnAttachments([]);
      setIsEditingAnnId(null);
      setIsCreatingAnn(false);
    }, 600);
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

  // --- SENT SUBTAB STATE ---
  const [selectedSent, setSelectedSent] = useState<SentMessage | null>(null);
  const [sentSearch, setSentSearch] = useState("");

  // Helpers
  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin": return "text-red-400 bg-red-500/5 border-red-500/10";
      case "admin": return "text-amber-400 bg-amber-500/5 border-amber-500/10";
      case "teacher": return "text-indigo-400 bg-indigo-500/5 border-indigo-500/10";
      default: return "text-emerald-400 bg-emerald-500/5 border-emerald-500/10";
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

  // Search Sent Messages
  const filteredSentMessages = sentMessages.filter(s =>
    s.subject.toLowerCase().includes(sentSearch.toLowerCase()) ||
    s.content.toLowerCase().includes(sentSearch.toLowerCase()) ||
    s.recipients.some(r => r.toLowerCase().includes(sentSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* SECTION HEADER */}
      <div className="space-y-1.5 text-left border-b border-white/[0.04] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">Communications Hub</span>
          <h2 className="font-sans text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Mail className="text-indigo-400 animate-pulse" size={24} />
            <span>Central Communication Center</span>
          </h2>
          <p className="text-xs text-white/40 max-w-2xl leading-relaxed">
            Manage student-teacher inquiries, compose group alerts, deploy targeted announcements, and examine delivery statistics from a cohesive portal.
          </p>
        </div>

        {/* Global Statistics Banner */}
        <div className="flex gap-2 shrink-0">
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Mail size={16} /></div>
            <div>
              <span className="text-[9px] text-white/40 font-bold block uppercase">Unread Thread</span>
              <span className="text-sm font-extrabold text-white">{conversations.filter(c => !c.isRead && !c.isArchived).length}</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400"><Send size={16} /></div>
            <div>
              <span className="text-[9px] text-white/40 font-bold block uppercase">Sent Out</span>
              <span className="text-sm font-extrabold text-white">{sentMessages.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="border-b border-white/[0.04] flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 select-none">
        {[
          { id: "inbox" as const, label: "Inbox Messages", icon: Mail, badge: conversations.filter(c => !c.isRead && !c.isArchived).length },
          { id: "compose" as const, label: "Compose Message", icon: Plus },
          { id: "announcements" as const, label: "Publish Announcements", icon: Megaphone, badge: announcements.length },
          { id: "sent" as const, label: "Sent Messages Archive", icon: Send }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedConv(null);
                setSelectedSent(null);
              }}
              className="relative px-5 py-3 text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer flex items-center gap-2"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeInboxIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-md"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={14} className={isActive ? "text-indigo-400 animate-pulse" : "text-white/40"} />
              <span className={isActive ? "text-white" : "text-white/40 hover:text-white/80"}>
                {tab.label}
              </span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${
                  isActive ? "bg-indigo-500 text-white" : "bg-white/5 text-white/40"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Viewpanels */}
      <div className="min-h-[500px]">
        
        {/* ==================== 1. INBOX TAB ==================== */}
        {activeTab === "inbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Conversation Threads List */}
            <div className={`space-y-4 ${selectedConv ? "lg:col-span-5 hidden lg:block" : "lg:col-span-12"}`}>
              
              {/* AJAX Search & Filter Controls */}
              <div className="bg-[#08080c] border border-white/[0.05] rounded-3xl p-4 md:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Search size={14} /></span>
                    <input
                      type="text"
                      placeholder="Search inbox sender, subject, body..."
                      value={inboxSearch}
                      onChange={(e) => { setInboxSearch(e.target.value); setInboxPage(1); }}
                      className="w-full bg-[#030304] border border-white/15 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>

                  {/* Role filter */}
                  <div className="relative shrink-0">
                    <select
                      value={inboxRoleFilter}
                      onChange={(e) => { setInboxRoleFilter(e.target.value); setInboxPage(1); }}
                      className="bg-[#030304] border border-white/15 rounded-2xl px-4 py-3 text-xs text-white/80 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                    >
                      <option value="All">All Roles</option>
                      <option value="Student">Students</option>
                      <option value="Teacher">Teachers</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/[0.04]">
                  {/* Status Filter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/40 uppercase font-bold font-mono">Status criteria</label>
                    <select
                      value={inboxStatusFilter}
                      onChange={(e) => { setInboxStatusFilter(e.target.value); setInboxPage(1); }}
                      className="bg-[#030304] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-indigo-500/30 cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Unread">Unread Threads</option>
                      <option value="Read">Read Threads</option>
                      <option value="Open">Open Conversations</option>
                      <option value="Closed">Closed Conversations</option>
                    </select>
                  </div>

                  {/* Course Context Filter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/40 uppercase font-bold font-mono">Course Scope</label>
                    <select
                      value={inboxCourseFilter}
                      onChange={(e) => { setInboxCourseFilter(e.target.value); setInboxPage(1); }}
                      className="bg-[#030304] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-indigo-500/30 cursor-pointer"
                    >
                      <option value="All">All Course Contexts</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Conversations Stack */}
              <div className="space-y-3">
                {paginatedConversations.length === 0 ? (
                  <div className="p-12 text-center bg-[#08080c] border border-dashed border-white/10 rounded-3xl space-y-3">
                    <Mail className="mx-auto text-white/20" size={32} />
                    <p className="text-xs text-white/40">No matching conversations found matching search or filter constraints.</p>
                  </div>
                ) : (
                  paginatedConversations.map((conv) => {
                    const isSelected = selectedConv?.id === conv.id;
                    const latestMsg = conv.messages[conv.messages.length - 1];
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          // Mark as read immediately on click
                          const updated = { ...conv, isRead: true };
                          setConversations(prev => prev.map(c => c.id === conv.id ? updated : c));
                          setSelectedConv(updated);
                        }}
                        className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden group ${
                          isSelected 
                            ? "bg-indigo-500/[0.04] border-indigo-500/40 shadow-xl" 
                            : conv.isRead 
                              ? "bg-[#08080c] border-white/[0.05] hover:border-white/15" 
                              : "bg-[#0b0c16] border-indigo-500/10 hover:border-indigo-500/25"
                        }`}
                      >
                        {/* Glow accent for unread messages */}
                        {!conv.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                        )}

                        <div className="flex items-start gap-3">
                          <img
                            src={conv.senderAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"}
                            alt={conv.senderName}
                            className="h-9 w-9 rounded-full object-cover border border-white/10 shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-white text-xs truncate">{conv.senderName}</span>
                              <span className="text-[9px] font-mono text-white/30 shrink-0">
                                {new Date(conv.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase font-sans border ${getRoleColor(conv.senderRole)}`}>
                                {conv.senderRole}
                              </span>
                              {conv.courseTitle && (
                                <span className="text-[9px] text-indigo-400 font-semibold truncate max-w-[150px]">
                                  {conv.courseTitle}
                                </span>
                              )}
                            </div>

                            <h4 className={`text-xs tracking-tight truncate ${!conv.isRead ? "font-black text-white" : "font-semibold text-white/80"}`}>
                              {conv.subject}
                            </h4>

                            <p className="text-[11px] text-white/40 line-clamp-1">
                              {latestMsg ? latestMsg.content : "No messages."}
                            </p>
                          </div>
                        </div>

                        {/* Hover Quick actions overlay */}
                        <div className="flex items-center justify-end gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMarkReadStatus(conv, !conv.isRead); }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px]"
                            title={conv.isRead ? "Mark Unread" : "Mark Read"}
                          >
                            {conv.isRead ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleArchiveConv(conv); }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                            title="Archive"
                          >
                            <Archive size={11} />
                          </button>
                          <button
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
                <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 select-none">
                  <span className="text-[10px] text-white/40 font-bold">
                    Showing {paginatedConversations.length} of {filteredConversations.length} items
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setInboxPage(prev => Math.max(1, prev - 1))}
                      disabled={inboxPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#08080c] text-[10px] text-white/60 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInboxPage(idx + 1)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] ${
                          inboxPage === idx + 1 ? "bg-indigo-600 text-white font-extrabold" : "border border-white/10 bg-[#08080c] text-white/60 hover:text-white"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setInboxPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={inboxPage === totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#08080c] text-[10px] text-white/60 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Thread Message Panel */}
            <div className={`space-y-4 lg:col-span-7 ${!selectedConv ? "hidden lg:block lg:col-span-7" : "col-span-12"}`}>
              {selectedConv ? (
                <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[550px]">
                  
                  {/* Thread Header */}
                  <div className="p-4 md:p-5 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between gap-4">
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
                        className="h-9 w-9 rounded-full object-cover border border-white/10"
                      />
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white leading-none">{selectedConv.senderName}</h4>
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase font-sans border ${getRoleColor(selectedConv.senderRole)}`}>
                            {selectedConv.senderRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/40 block mt-0.5 font-sans">
                          Subject: <strong className="text-white/60">{selectedConv.subject}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Thread Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCloseConv(selectedConv)}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                          selectedConv.status === "closed"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border-white/10 hover:bg-white/5 text-white/40 hover:text-white"
                        }`}
                        title={selectedConv.status === "closed" ? "Reopen Inquiry" : "Close Thread"}
                      >
                        {selectedConv.status === "closed" ? "Closed" : "Open"}
                      </button>
                      <button
                        onClick={() => handleArchiveConv(selectedConv)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
                        title="Archive Thread"
                      >
                        <Archive size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteConv(selectedConv.id)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        title="Delete Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Messages Bubble Stack */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 max-h-[380px] scrollbar-thin scrollbar-thumb-white/10">
                    {selectedConv.messages.map((msg) => {
                      const isMe = msg.senderId === "usr-1";
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                        >
                          {!isMe && (
                            <img
                              src={msg.senderAvatar}
                              alt={msg.senderName}
                              className="h-8 w-8 rounded-full object-cover border border-white/5 shrink-0"
                            />
                          )}
                          <div className="space-y-1">
                            <div className={`text-[10px] text-white/30 flex items-center gap-1.5 ${isMe ? "justify-end" : ""}`}>
                              <span>{msg.senderName}</span>
                              <span>•</span>
                              <span>{new Date(msg.timestamp).toLocaleString()}</span>
                            </div>
                            <div className={`p-4 rounded-3xl text-xs text-left leading-relaxed ${
                              isMe 
                                ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/15" 
                                : "bg-white/[0.02] border border-white/5 text-white/80 rounded-tl-none"
                            }`}>
                              <p className="whitespace-pre-line">{msg.content}</p>

                              {/* Message Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                                  {msg.attachments.map((att, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 transition-colors border border-white/5 text-[10px]"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Paperclip size={12} className="text-indigo-400 shrink-0" />
                                        <span className="text-white/80 truncate max-w-[150px]">{att.name}</span>
                                        <span className="text-white/30 font-mono">({att.size})</span>
                                      </div>
                                      <button
                                        onClick={() => showCustomToast(`Downloading asset: ${att.name}`, "info")}
                                        className="text-indigo-400 hover:text-indigo-300 font-extrabold uppercase text-[9px] cursor-pointer"
                                      >
                                        Get
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Extra Micro Message Actions */}
                            <div className={`flex items-center gap-2 mt-1 ${isMe ? "justify-end" : ""}`}>
                              <button
                                onClick={() => handleForwardMessage(msg)}
                                className="text-[10px] text-white/30 hover:text-white flex items-center gap-1 transition-colors"
                              >
                                <Forward size={11} />
                                <span>Forward</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Composer box */}
                  <div className="p-4 md:p-5 border-t border-white/[0.05] bg-white/[0.01]">
                    {selectedConv.status === "closed" ? (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl text-center text-xs text-amber-400">
                        This inquiry thread is closed. Reopen the thread at the header actions to submit reply messages.
                      </div>
                    ) : (
                      <form onSubmit={handleReply} className="space-y-4">
                        <div className="relative">
                          <textarea
                            rows={3}
                            placeholder="Type a professional administrator response..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full bg-[#030304] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40 transition-all pr-12"
                          />
                          <button
                            type="submit"
                            disabled={isReplying || (!replyText.trim() && replyAttachments.length === 0)}
                            className="absolute right-3.5 bottom-3.5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 cursor-pointer disabled:cursor-not-allowed transition-all"
                          >
                            <Send size={14} className={isReplying ? "animate-spin" : ""} />
                          </button>
                        </div>

                        {/* Attachments preview & upload triggers */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-white/[0.02]">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <label className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer">
                              <Paperclip size={13} />
                              <span>Attach Local File</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const f = e.target.files[0];
                                    setReplyAttachments(prev => [
                                      ...prev,
                                      {
                                        name: f.name,
                                        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                                        type: f.name.split(".").pop() || "doc"
                                      }
                                    ]);
                                    showCustomToast(`Attached ${f.name} mock payload.`, "info");
                                  }
                                }}
                              />
                            </label>

                            {/* Added list */}
                            {replyAttachments.map((at, idx) => (
                              <div
                                key={idx}
                                className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px] flex items-center gap-1.5"
                              >
                                <span className="truncate max-w-[80px]">{at.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setReplyAttachments(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-rose-400 hover:text-rose-300 font-extrabold"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="text-[10px] text-white/30 font-sans">
                            Signatures appended automatically as: <strong>Super Admin</strong>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>

                </div>
              ) : (
                <div className="h-full bg-[#08080c] border border-white/[0.05] border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-white/[0.01] border border-white/5 flex items-center justify-center text-white/25">
                    <MessageSquare size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-sans text-sm font-bold text-white">No Message Selected</h3>
                    <p className="text-xs text-white/40 max-w-xs leading-relaxed">
                      Select any conversation thread from the left list block to explore diagnostic history or dispatch reply alerts.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== 2. COMPOSE MESSAGE TAB ==================== */}
        {activeTab === "compose" && (
          <div className="max-w-3xl mx-auto bg-[#08080c] border border-white/[0.06] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            
            <div className="border-b border-white/[0.05] pb-4 text-left">
              <h3 className="font-sans text-base font-black text-white">New Message Dispatcher</h3>
              <p className="text-xs text-white/40">Dispatch formal notifications or media attachments targeting custom cohorts</p>
            </div>

            <form onSubmit={handleSendCompose} className="space-y-5 text-left">
              
              {/* Recipient Type Row */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Recipient Criteria</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "Individual" as const, label: "Individual User" },
                    { id: "Multiple" as const, label: "Multiple Users" },
                    { id: "AllStudents" as const, label: "All Students" },
                    { id: "AllTeachers" as const, label: "All Teachers" },
                    { id: "AllAdmins" as const, label: "All Administrators" },
                    { id: "Course" as const, label: "Course Roster" },
                    { id: "Season" as const, label: "Course Season Intake" }
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
                          setSelectedSeasonId("");
                        }}
                        className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                            : "bg-white/[0.01] hover:bg-white/[0.03] border-white/5 text-white/50 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient SELECTORS Conditionally Rendered */}
              <AnimatePresence mode="wait">
                
                {/* 1. Individual User Search */}
                {recipientType === "Individual" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-1.5"
                  >
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Search & Select Individual</label>
                    <div className="relative">
                      <select
                        value={selectedIndividual}
                        onChange={(e) => setSelectedIndividual(e.target.value)}
                        className="w-full bg-[#030304] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                      >
                        <option value="">-- Choose User --</option>
                        {/* Users & Students combine */}
                        <optgroup label="LMS Instructors / Admins">
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role}) - {u.email}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Students">
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (student) - {s.email}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* 2. Multiple Users Multi-Select list */}
                {recipientType === "Multiple" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-1.5"
                  >
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Select Recipients (Multiple Checkboxes)</label>
                    
                    {/* Tiny AJAX Search Filter for checkboxes */}
                    <div className="relative mb-2">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Search size={13} /></span>
                      <input
                        type="text"
                        placeholder="Search users to add..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full bg-[#030304] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="bg-[#030304] border border-white/10 rounded-2xl p-4 max-h-[160px] overflow-y-auto space-y-2 scrollbar-thin">
                      {/* Loop combine list */}
                      {[...users, ...students]
                        .filter(u => !userSearchTerm || u.name.toLowerCase().includes(userSearchTerm.toLowerCase()))
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
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-colors"
                            >
                              <button type="button" className="text-indigo-400 shrink-0">
                                {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
                              </button>
                              <span className="text-xs text-white/80 font-bold">{user.name}</span>
                              <span className={`text-[9px] font-mono uppercase px-1.5 rounded border ${getRoleColor(user.role || "student")}`}>
                                {user.role || "student"}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    <span className="text-[10px] text-white/30 font-sans block pt-1">
                      Selected: <strong>{selectedMultiple.length}</strong> recipients.
                    </span>
                  </motion.div>
                )}

                {/* 3. Course-based selector */}
                {recipientType === "Course" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-1.5"
                  >
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Select Target Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full bg-[#030304] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title} ({c.code}) - {students.filter(s => s.courseId === c.id).length} students</option>
                      ))}
                    </select>
                  </motion.div>
                )}

                {/* 4. Season-based selector */}
                {recipientType === "Season" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-1.5"
                  >
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Select Course Season Intake</label>
                    <select
                      value={selectedSeasonId}
                      onChange={(e) => setSelectedSeasonId(e.target.value)}
                      className="w-full bg-[#030304] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                    >
                      <option value="">-- Choose Season Cohort --</option>
                      {courseSeasons.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.status}</option>
                      ))}
                    </select>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Message Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Enter dynamic subject line..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              {/* Content Body */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Message Content</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Draft your detailed administrator notification or instructions..."
                  value={composeContent}
                  onChange={(e) => setComposeContent(e.target.value)}
                  className="w-full bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              {/* Files attachment and Progress bar simulation */}
              <div className="space-y-3 bg-[#0c0c14]/50 border border-white/[0.03] p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Media Attachments</span>
                  <span className="text-[9px] text-white/30">PDF, IMAGES, ZIP, DOC</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <label className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-2 select-none">
                    <Paperclip size={13} />
                    <span>Upload Documents</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleComposeAttachmentUpload}
                    />
                  </label>

                  {/* Progress bar simulation */}
                  {isUploading && (
                    <div className="flex-1 w-full space-y-1.5">
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-indigo-400 font-mono block text-right">Uploading... {uploadProgress}%</span>
                    </div>
                  )}

                  {/* Attachment list */}
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    {composeAttachments.map((att, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 text-[10px] flex items-center gap-2"
                      >
                        <span className="font-bold truncate max-w-[120px]">{att.name}</span>
                        <span className="text-white/30 font-mono">({att.size})</span>
                        <button
                          type="button"
                          onClick={() => setComposeAttachments(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-rose-400 font-extrabold hover:text-rose-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Row */}
              <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => {
                    setComposeSubject("");
                    setComposeContent("");
                    setComposeAttachments([]);
                    showCustomToast("Draft cleared successfully.", "info");
                  }}
                  className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.01] hover:bg-white/[0.04] text-xs font-bold text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  Clear Draft
                </button>
                <button
                  type="submit"
                  disabled={isSending || isUploading}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-extrabold text-[11px] tracking-widest uppercase transition-all shadow-[0_4px_15px_rgba(79,70,229,0.25)] cursor-pointer disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send size={13} className={isSending ? "animate-spin" : ""} />
                  <span>{isSending ? "Dispatched..." : "Send Message"}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ==================== 3. ANNOUNCEMENTS TAB ==================== */}
        {activeTab === "announcements" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Create / Edit Announcement panel */}
            <div className="lg:col-span-5 bg-[#08080c] border border-white/[0.05] rounded-3xl p-5 md:p-6 space-y-5 text-left">
              <div className="border-b border-white/[0.05] pb-3">
                <h3 className="font-sans text-sm font-black text-white">
                  {isEditingAnnId ? "Modify Announcement" : "Publish Global Alert"}
                </h3>
                <p className="text-xs text-white/40">Broadcasting notification updates automatically synchronized on student screens</p>
              </div>

              <form onSubmit={handleAddOrEditAnnouncement} className="space-y-4 text-xs text-white">
                
                {/* Audience Selection */}
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
                    <option value="Specific Season">Specific Season Intake</option>
                    <option value="Individual User">Individual Academic User</option>
                  </select>
                </div>

                {/* Sub target input fields */}
                {annAudience === "Specific Course" && (
                  <div className="space-y-1.5 animate-fade-in">
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

                {annAudience === "Specific Season" && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] text-white/40 block">Season Selection</label>
                    <select
                      value={annTargetId}
                      onChange={(e) => setAnnTargetId(e.target.value)}
                      className="w-full bg-[#030304] border border-white/10 rounded-xl px-3 py-2 text-white/80"
                    >
                      <option value="">-- Choose Season Cohort --</option>
                      {courseSeasons.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {annAudience === "Individual User" && (
                  <div className="space-y-1.5 animate-fade-in">
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

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Title Heading</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter urgent title statement..."
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full bg-[#030304] border border-white/10 rounded-xl px-3 py-2.5 text-white"
                  />
                </div>

                {/* Description Textarea */}
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

                {/* Priority Levels */}
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

                {/* Expiration date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[9px] text-white/40 uppercase block">Expiration Date (Optional)</label>
                    <input
                      type="date"
                      value={annExpirationDate}
                      onChange={(e) => setAnnExpirationDate(e.target.value)}
                      className="w-full bg-[#030304] border border-white/10 rounded-xl px-3 py-2 text-white/80"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-white/40 uppercase block">Publishing schedule</label>
                    <div className="flex items-center gap-2 mt-1 select-none">
                      <button
                        type="button"
                        onClick={() => setAnnPublishImmediately(!annPublishImmediately)}
                        className="text-indigo-400"
                      >
                        {annPublishImmediately ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                      <span className="text-[10px] text-white/60">Publish Instantly</span>
                    </div>
                  </div>
                </div>

                {/* Scheduling timestamp if not immediately */}
                {!annPublishImmediately && (
                  <div className="space-y-1.5 animate-fade-in bg-[#030304] border border-white/5 p-3 rounded-xl">
                    <label className="text-[9px] text-white/40 uppercase block">Schedule Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={annScheduleDate}
                      onChange={(e) => setAnnScheduleDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                )}

                {/* Creation buttons */}
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
              
              <div className="bg-[#08080c] border border-white/[0.05] rounded-3xl p-4 md:p-5 flex items-center justify-between gap-4">
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

              {/* Announcements list */}
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
                        className={`p-4 rounded-3xl border text-left bg-[#08080c] transition-all relative overflow-hidden group ${
                          isUrgent 
                            ? "border-rose-500/20 bg-rose-500/[0.01]" 
                            : ann.priority === "Important"
                              ? "border-amber-500/20 bg-amber-500/[0.01]"
                              : "border-white/[0.04]"
                        }`}
                      >
                        {/* Priority Badge Indicator */}
                        {ann.priority && ann.priority !== "Normal" && (
                          <div className={`absolute top-0 right-0 px-2.5 py-0.5 text-[8px] font-mono font-bold rounded-bl-xl ${
                            ann.priority === "Urgent" ? "bg-rose-500 text-white" : "bg-amber-500 text-black"
                          }`}>
                            {ann.priority}
                          </div>
                        )}

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
                          <p className="text-[11px] text-white/40 leading-relaxed whitespace-pre-wrap">{ann.description}</p>

                          {/* Action overlay strip */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.03] select-none">
                            <button
                              onClick={() => handleTogglePublishAnn(ann)}
                              className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                              title="Toggle Publish state"
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
                                if (confirm("Deleting this announcement removes it permanently from all recipient dashboards. Continue?")) {
                                  onDeleteAnnouncement(ann.id);
                                  showCustomToast("Announcement deleted permanently.", "success");
                                }
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
                  <div className="p-12 text-center bg-[#08080c] border border-dashed border-white/10 rounded-3xl space-y-3">
                    <Megaphone className="mx-auto text-white/25" size={28} />
                    <p className="text-xs text-white/40">No academy-wide announcements live yet.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ==================== 4. SENT MESSAGES TAB ==================== */}
        {activeTab === "sent" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sent Mail list */}
            <div className={`space-y-4 ${selectedSent ? "lg:col-span-5 hidden lg:block" : "lg:col-span-12"}`}>
              
              {/* Sent Mail Search bar */}
              <div className="bg-[#08080c] border border-white/[0.05] rounded-3xl p-4">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Search size={14} /></span>
                  <input
                    type="text"
                    placeholder="Search sent message subjects or recipients..."
                    value={sentSearch}
                    onChange={(e) => setSentSearch(e.target.value)}
                    className="w-full bg-[#030304] border border-white/15 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              {/* List */}
              <div className="space-y-3">
                {filteredSentMessages.length === 0 ? (
                  <div className="p-12 text-center bg-[#08080c] border border-dashed border-white/10 rounded-3xl space-y-3">
                    <Send className="mx-auto text-white/20" size={32} />
                    <p className="text-xs text-white/40">No sent messages match criteria.</p>
                  </div>
                ) : (
                  filteredSentMessages.map((sent) => {
                    const isSel = selectedSent?.id === sent.id;
                    return (
                      <div
                        key={sent.id}
                        onClick={() => setSelectedSent(sent)}
                        className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative group ${
                          isSel
                            ? "bg-indigo-500/[0.04] border-indigo-500/40 shadow-xl"
                            : "bg-[#08080c] border-white/[0.05] hover:border-white/15"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold text-indigo-400 truncate max-w-[200px]">
                              To: {sent.recipients.join(", ")}
                            </span>
                            <span className="text-[9px] font-mono text-white/30 shrink-0">
                              {new Date(sent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 border border-white/5 text-white/50">
                            {sent.recipientRole}
                          </span>

                          <h4 className="text-xs font-bold text-white truncate">{sent.subject}</h4>
                          <p className="text-[11px] text-white/40 line-clamp-1">{sent.content}</p>

                          {/* Mini metrics bar if sent to multiple recipients */}
                          {sent.recipients.length > 1 && (
                            <div className="pt-2 border-t border-white/[0.03] flex items-center gap-3.5 text-[10px] font-semibold text-white/30 select-none">
                              <span className="text-emerald-400">Delivered: {sent.deliveryStats.delivered}</span>
                              <span className="text-indigo-400">Read: {sent.deliveryStats.read}</span>
                              <span>Unread: {sent.deliveryStats.unread}</span>
                            </div>
                          )}
                        </div>

                        {/* Hover Quick delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this sent message from your admin archive?")) {
                              setSentMessages(prev => prev.filter(s => s.id !== sent.id));
                              if (selectedSent?.id === sent.id) setSelectedSent(null);
                              showCustomToast("Sent message record deleted.", "success");
                            }
                          }}
                          className="absolute right-3.5 bottom-3.5 p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Sent Mail Detail View */}
            <div className={`space-y-4 lg:col-span-7 ${!selectedSent ? "hidden lg:block lg:col-span-7" : "col-span-12"}`}>
              {selectedSent ? (
                <div className="bg-[#08080c] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[480px] p-5 text-left space-y-5">
                  
                  {/* Header Row */}
                  <div className="border-b border-white/[0.05] pb-4 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedSent(null)}
                          className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer lg:hidden"
                        >
                          <ArrowLeft size={14} />
                        </button>
                        <h3 className="font-sans text-sm font-black text-white truncate max-w-[280px]">
                          To: {selectedSent.recipients.join(", ")}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-white/40 block">
                          Dispatched: <strong>{new Date(selectedSent.timestamp).toLocaleString()}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                          {selectedSent.recipientRole}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setComposeSubject(`Fwd: ${selectedSent.subject}`);
                          setComposeContent(`---------- Forwarded sent message ---------\nDate: ${new Date(selectedSent.timestamp).toLocaleString()}\nSubject: ${selectedSent.subject}\n\n${selectedSent.content}`);
                          setActiveTab("compose");
                          showCustomToast("Sent message populated in Composer.", "info");
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                        title="Forward"
                      >
                        <Forward size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this sent record completely?")) {
                            setSentMessages(prev => prev.filter(s => s.id !== selectedSent.id));
                            setSelectedSent(null);
                            showCustomToast("Sent message record deleted.", "success");
                          }
                        }}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Subject and Content */}
                  <div className="space-y-4 flex-1">
                    <div className="space-y-1">
                      <span className="text-[9px] text-white/40 font-mono block uppercase">Subject heading</span>
                      <h4 className="text-xs font-black text-white">{selectedSent.subject}</h4>
                    </div>

                    <div className="space-y-1 bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                      <span className="text-[9px] text-white/40 font-mono block uppercase mb-2">Message body</span>
                      <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">{selectedSent.content}</p>
                    </div>

                    {/* Delivery metrics visualization */}
                    {selectedSent.recipients.length > 1 && (
                      <div className="bg-[#030304] border border-white/10 p-4 rounded-2xl space-y-3">
                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono">Recipient Engagement Delivery Statistics</span>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-white/30 font-bold block uppercase">Delivered</span>
                            <span className="text-sm font-black text-emerald-400">{selectedSent.deliveryStats.delivered}</span>
                          </div>
                          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-white/30 font-bold block uppercase">Read</span>
                            <span className="text-sm font-black text-indigo-400">{selectedSent.deliveryStats.read}</span>
                          </div>
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-white/30 font-bold block uppercase">Unread</span>
                            <span className="text-sm font-black text-white/40">{selectedSent.deliveryStats.unread}</span>
                          </div>
                        </div>

                        {/* Interactive visualization progress bar */}
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${(selectedSent.deliveryStats.read / selectedSent.deliveryStats.delivered) * 100}%` }}
                          />
                          <div
                            className="bg-indigo-500 h-full animate-pulse"
                            style={{ width: `${((selectedSent.deliveryStats.delivered - selectedSent.deliveryStats.read) / selectedSent.deliveryStats.delivered) * 100}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-white/40 font-mono block text-right">
                          Estimated recipient read accuracy rate: {Math.round((selectedSent.deliveryStats.read / selectedSent.deliveryStats.delivered) * 100)}%
                        </span>
                      </div>
                    )}

                    {/* Render attachments info */}
                    {selectedSent.attachments && selectedSent.attachments.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-white/40 font-mono block uppercase">Dispatched attachments</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedSent.attachments.map((att, i) => (
                            <div key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-white/80 flex items-center gap-1.5">
                              <Paperclip size={11} className="text-indigo-400" />
                              <span>{att.name}</span>
                              <span className="text-white/30 font-mono">({att.size})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                <div className="h-full bg-[#08080c] border border-white/[0.05] border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-white/[0.01] border border-white/5 flex items-center justify-center text-white/25">
                    <Send size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-sans text-sm font-bold text-white">No Message Selected</h3>
                    <p className="text-xs text-white/40 max-w-xs leading-relaxed">
                      Select any outgoing dispatched message from the left list block to inspect recipient delivery quotas.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
