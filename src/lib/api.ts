// Production API Client for Roozzero Academy
// Handles all communication with the Express + MySQL backend

const API_BASE = "/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include" // sends & receives HttpOnly session cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || "Request failed";
    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.code = data?.error?.code;
    error.fields = data?.error?.fields;
    throw error;
  }

  return data;
}

// -------------------------------------------------------------
// Authentication API
// -------------------------------------------------------------
export const authApi = {
  async register(data: { name: string; email: string; password: string; confirmPassword?: string; phone?: string }) {
    return request<{ success: boolean; data: { user: any } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async login(data: { email: string; password: string; rememberMe?: boolean }) {
    return request<{ success: boolean; data: { user: any } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async logout() {
    return request<{ success: boolean; message: string }>("/auth/logout", {
      method: "POST"
    });
  },

  async getMe() {
    return request<{ success: boolean; data: { user: any } }>("/auth/me");
  },

  async forgotPassword(email: string) {
    return request<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return request<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword })
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return request<{ success: boolean; message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }
};

// -------------------------------------------------------------
// Courses & Registration API
// -------------------------------------------------------------
export const coursesApi = {
  async getAll() {
    return request<{ success: boolean; data: any[] }>("/courses");
  },

  async getById(id: string) {
    return request<{ success: boolean; data: any }>(`/courses/${id}`);
  },

  async enroll(courseId: string, seasonId?: string) {
    return request<{ success: boolean; data: any }>(`/courses/${courseId}/enroll`, {
      method: "POST",
      body: JSON.stringify({ seasonId })
    });
  },

  async registerCourse(courseId: string, data: { studentName: string; studentEmail: string; studentPhone?: string; experienceLevel?: string; notes?: string }) {
    return request<{ success: boolean; data: any }>(`/courses/${courseId}/registrations`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
};

// -------------------------------------------------------------
// Student Portal API
// -------------------------------------------------------------
export const studentApi = {
  async getProfile() {
    return request<{ success: boolean; data: any }>("/student/profile");
  },

  async updateProfile(data: any) {
    return request<{ success: boolean; data: any }>("/student/profile", {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async getCourses() {
    return request<{ success: boolean; data: any[] }>("/student/courses");
  },

  async getSessions() {
    return request<{ success: boolean; data: any[] }>("/student/sessions");
  },

  async getAssignments() {
    return request<{ success: boolean; data: any[] }>("/student/assignments");
  },

  async submitAssignment(assignmentId: string, formData: FormData) {
    return request<{ success: boolean; data: any }>(`/student/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: formData
    });
  },

  async getGrades() {
    return request<{ success: boolean; data: any[] }>("/student/grades");
  },

  async getResources() {
    return request<{ success: boolean; data: any[] }>("/student/resources");
  },

  async getDiscussions() {
    return request<{ success: boolean; data: any[] }>("/student/discussions");
  },

  async createDiscussion(data: { courseId: string; title: string; text: string }) {
    return request<{ success: boolean; data: any }>("/student/discussions", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async replyDiscussion(threadId: string, text: string) {
    return request<{ success: boolean; data: any }>(`/student/discussions/${threadId}/replies`, {
      method: "POST",
      body: JSON.stringify({ text })
    });
  },

  async getAnnouncements() {
    return request<{ success: boolean; data: any[] }>("/student/announcements");
  },

  async getCertificates() {
    return request<{ success: boolean; data: any[] }>("/student/certificates");
  },

  async getCalendar() {
    return request<{ success: boolean; data: any[] }>("/student/calendar");
  },

  async getNotifications() {
    return request<{ success: boolean; data: any[] }>("/student/notifications");
  },

  async markNotificationRead(id: number) {
    return request<{ success: boolean }>(`/student/notifications/${id}/read`, {
      method: "PATCH"
    });
  }
};

// -------------------------------------------------------------
// Teacher Dashboard API
// -------------------------------------------------------------
export const teacherApi = {
  async getDashboard() {
    return request<{ success: boolean; data: any }>("/teacher/dashboard");
  },

  async getCourses() {
    return request<{ success: boolean; data: any[] }>("/teacher/courses");
  },

  async getStudents(courseId: string) {
    return request<{ success: boolean; data: any[] }>(`/teacher/courses/${courseId}/students`);
  },

  async createSession(courseId: string, data: any) {
    return request<{ success: boolean; data: any }>(`/teacher/courses/${courseId}/sessions`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async updateSession(id: string, data: any) {
    return request<{ success: boolean }>(`/teacher/sessions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async deleteSession(id: string) {
    return request<{ success: boolean }>(`/teacher/sessions/${id}`, {
      method: "DELETE"
    });
  },

  async createAssignment(courseId: string, data: any) {
    return request<{ success: boolean; data: any }>(`/teacher/courses/${courseId}/assignments`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async gradeSubmission(submissionId: string, grade: number, feedback?: string) {
    return request<{ success: boolean }>(`/teacher/submissions/${submissionId}/grade`, {
      method: "PUT",
      body: JSON.stringify({ grade, feedback })
    });
  },

  async uploadResource(courseId: string, formData: FormData) {
    return request<{ success: boolean; data: any }>(`/teacher/courses/${courseId}/resources`, {
      method: "POST",
      body: formData
    });
  }
};

// -------------------------------------------------------------
// Administrator Dashboard API
// -------------------------------------------------------------
export const adminApi = {
  async getDashboard() {
    return request<{ success: boolean; data: any }>("/admin/dashboard");
  },

  async getUsers(params?: { page?: number; limit?: number; search?: string; roleId?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.roleId) query.set("roleId", params.roleId.toString());

    return request<{ success: boolean; data: { users: any[]; total: number; totalPages: number } }>(`/admin/users?${query.toString()}`);
  },

  async createUser(data: any) {
    return request<{ success: boolean; data: any }>("/admin/users", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async updateUser(id: string, data: any) {
    return request<{ success: boolean }>(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async deleteUser(id: string) {
    return request<{ success: boolean }>(`/admin/users/${id}`, {
      method: "DELETE"
    });
  },

  async getMessages() {
    return request<{ success: boolean; data: any[] }>("/admin/messages");
  },

  async markMessageRead(id: number) {
    return request<{ success: boolean }>(`/admin/messages/${id}/read`, {
      method: "PATCH"
    });
  },

  async replyMessage(id: number, replyText: string) {
    return request<{ success: boolean }>(`/admin/messages/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ replyText })
    });
  },

  async getActivityLogs() {
    return request<{ success: boolean; data: any[] }>("/admin/activity-logs");
  },

  async getLoginHistory() {
    return request<{ success: boolean; data: any[] }>("/admin/login-history");
  }
};

// -------------------------------------------------------------
// CMS API
// -------------------------------------------------------------
export const cmsApi = {
  async getCms() {
    return request<{ success: boolean; data: any }>("/cms");
  },

  async updateSection(section: string, data: any) {
    return request<{ success: boolean; message: string }>(`/cms/${section}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async uploadMedia(formData: FormData) {
    return request<{ success: boolean; data: any }>("/cms/media/upload", {
      method: "POST",
      body: formData
    });
  },

  async getMediaFiles() {
    return request<{ success: boolean; data: any[] }>("/cms/media/files");
  }
};

// -------------------------------------------------------------
// Contact & Certificates API
// -------------------------------------------------------------
export const contactApi = {
  async sendMessage(data: { name: string; email: string; phone?: string; subject?: string; message: string }) {
    return request<{ success: boolean; message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
};

export const certificateApi = {
  async verify(token: string) {
    return request<{ success: boolean; data: any }>(`/certificates/verify/${token}`);
  }
};
