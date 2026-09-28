export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "super-admin" | "admin" | "teacher" | "student" | string;
  status: "Active" | "Inactive" | "Suspended" | string;
  lastLogin?: string;
  joinedDate?: string;
  avatar?: string;
}

export interface CourseRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  type: string;
  title: string;
  details: string;
  status: "Pending" | "Approved" | "Rejected" | "Revision Needed" | string;
  date: string;
  notes?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  seasonId: string;
  seasonName: string;
  enrollmentDate: string;
  paymentStatus: "Paid" | "Pending" | "Unpaid" | string;
  courseStatus: "Enrolled" | "Completed" | "Dropped" | string;
}

export interface Exam {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  dueDate: string;
  maxPoints: number;
  passRate?: number;
  avgScore?: number;
  status: "Published" | "Draft" | "Graded" | string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  username: string;
  role: string;
  action: string;
  module: string;
  status: "Success" | "Warning" | "Error" | string;
}

export interface RolePermission {
  role: "super-admin" | "admin" | "teacher" | "student" | string;
  permissions: {
    certificateApproval?: boolean;
    courseManagement?: boolean;
    userManagement?: boolean;
    systemSettings?: boolean;
    [key: string]: boolean | undefined;
  };
}
