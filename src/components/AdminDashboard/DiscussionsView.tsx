import React, { useState } from "react";
import { MessageSquare, Send, Search, CheckCircle2, User, Clock, Archive } from "lucide-react";
import { DiscussionThread } from "../../types/teacher";

interface DiscussionsViewProps {
  discussions: DiscussionThread[];
  adminName: string;
  onAddDiscussionReply: (threadId: string, content: string) => void;
  onCloseDiscussionThread: (threadId: string) => void;
}

export default function DiscussionsView({
  discussions,
  adminName,
  onAddDiscussionReply,
  onCloseDiscussionThread,
}: DiscussionsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const filteredThreads = discussions.filter((t) => {
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchTitle = t.title && t.title.toLowerCase().includes(term);
      const matchText = t.text && t.text.toLowerCase().includes(term);
      const matchStudent = t.studentName && t.studentName.toLowerCase().includes(term);
      const matchCourse = t.courseTitle && t.courseTitle.toLowerCase().includes(term);
      if (!matchTitle && !matchText && !matchStudent && !matchCourse) return false;
    }
    return true;
  });

  const handleSendReply = (threadId: string) => {
    const text = replyInputs[threadId]?.trim();
    if (!text) return;
    onAddDiscussionReply(threadId, text);
    setReplyInputs((prev) => ({ ...prev, [threadId]: "" }));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="text-cyan-400" size={20} />
            <span>Student QA &amp; Discussion Forum</span>
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Review academic questions from students, provide official administrative guidance, and manage forum threads
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono text-white/40">Active Threads</span>
          <span className="text-xs font-bold text-white">{discussions.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search discussion threads..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="text-xs text-white/40 font-mono">
          Showing: <span className="text-white font-bold">{filteredThreads.length}</span> threads
        </div>
      </div>

      {/* Threads List */}
      {filteredThreads.length === 0 ? (
        <div className="p-12 text-center bg-white/[0.015] border border-dashed border-white/10 rounded-3xl space-y-3">
          <MessageSquare className="mx-auto text-white/20" size={36} />
          <p className="text-xs text-white/40">
            {discussions.length === 0
              ? "No student discussion threads currently open."
              : "No discussions match your search query."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              className="p-5 rounded-2xl bg-[#090a0e] border border-white/[0.06] space-y-4 hover:border-cyan-500/20 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{thread.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-white/40">
                    <span>By <strong className="text-white/70">{thread.studentName}</strong></span>
                    <span>·</span>
                    <span className="text-cyan-400">{thread.courseTitle}</span>
                    {thread.time && (
                      <>
                        <span>·</span>
                        <span>{thread.time}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    thread.status === "Replied"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {thread.status || "Open"}
                  </span>
                  <button
                    onClick={() => onCloseDiscussionThread(thread.id)}
                    className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white transition-colors"
                    title="Archive thread"
                  >
                    <Archive size={13} />
                  </button>
                </div>
              </div>

              {/* Thread question body */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white/80 leading-relaxed">
                {thread.text}
              </div>

              {/* Existing Replies */}
              {thread.replies && thread.replies.length > 0 && (
                <div className="space-y-2.5 pl-4 border-l-2 border-cyan-500/30">
                  {thread.replies.map((rep) => (
                    <div key={rep.id} className="text-xs space-y-1 bg-white/[0.01] p-3 rounded-xl border border-white/[0.03]">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                          <User size={11} />
                          <span>{rep.authorName || rep.sender || "Admin"}</span>
                          <span className="text-white/30 font-normal">({rep.authorRole || rep.role || "Admin"})</span>
                        </div>
                        {rep.date && <span className="text-white/30">{rep.date}</span>}
                      </div>
                      <p className="text-white/80 leading-relaxed pt-1">{rep.content || rep.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input Box */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                <input
                  type="text"
                  value={replyInputs[thread.id] || ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({ ...prev, [thread.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendReply(thread.id);
                    }
                  }}
                  placeholder="Post an official answer or instructor feedback..."
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="button"
                  onClick={() => handleSendReply(thread.id)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-cyan-500/20 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
