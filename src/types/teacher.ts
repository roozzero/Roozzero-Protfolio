export interface Course {
  id: string;
  title: string;
  code: string;
  studentsCount: number;
  sessionsCount: number;
  progress: number;
  status: "Active" | "Completed" | "Upcoming" | "Draft" | string;
  image?: string;
  description?: string;
  instructor?: string;
  department?: string;
  category?: string;
  price?: string | number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  attendance: number;
  avgGrade: number;
  status: "Active" | "Inactive" | "Suspended" | string;
  joinedDate: string;
  avatar?: string;
}

export interface Session {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  link?: string;
  status: "Scheduled" | "Completed" | "Cancelled" | string;
  studentCount: number;
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  githubUrl?: string;
  notes?: string;
  status: "Submitted" | "Graded" | "Late" | string;
  grade?: number | null;
  feedback?: string | null;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  publishDate: string;
  dueDate: string;
  maxPoints: number;
  status: "Published" | "Draft" | "Archived" | string;
  submissions: AssignmentSubmission[];
}

export interface DiscussionReply {
  id: string;
  sender?: string;
  authorName?: string;
  role?: string;
  authorRole?: string;
  time?: string;
  date?: string;
  text?: string;
  content?: string;
}

export interface DiscussionThread {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  title: string;
  text: string;
  time: string;
  status: "New" | "Replied" | "Resolved" | string;
  replies: DiscussionReply[];
}

export interface Resource {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  fileType: string;
  fileSize: string;
  uploadedAt: string;
  visibility?: string;
  url?: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  audience: string;
  publishedAt: string;
  status: "Published" | "Draft" | string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  assignmentId: string;
  assignmentTitle: string;
  score: number;
  maxPoints: number;
  letterGrade: string;
  publishedDate: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  gpa: number;
  status: "Approved" | "Waiting for Admin Approval" | "Draft" | "Rejected" | string;
  issueDate?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "Class" | "Exam" | "Assignment" | "Meeting" | string;
  courseId: string;
  time: string;
}

export interface CourseSeason {
  id: string;
  name: string;
  courseId: string;
  courseTitle: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  registrationStatus: "Open" | "Closed" | "Not Available" | "Waitlist" | string;
  notes?: string;
  status: "Active" | "Pending Admin Approval" | "Cancelled" | "Completed" | string;
}
