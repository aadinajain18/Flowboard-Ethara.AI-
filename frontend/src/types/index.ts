// ─── Enums ──────────────────────────────────────────────

export type UserRole = "ADMIN" | "MEMBER";
export type ProjectRole = "ADMIN" | "MEMBER";
export type ProjectStatus = "ACTIVE" | "ARCHIVED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ActivityAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "STATUS_CHANGED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "ASSIGNED"
  | "COMMENTED";

// ─── Models ─────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
  tasks?: Task[];
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  user?: User;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  position: number;
  projectId: string;
  assigneeId: string;
  createdById: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  assignee?: User;
  createdBy?: User;
  subtasks?: Task[];
  comments?: Comment[];
  labels?: TaskLabel[];
  overdue?: boolean;
  _count?: {
    comments: number;
    subtasks: number;
  };
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  taskId: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Activity {
  id: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  entityTitle: string;
  details: string | null;
  projectId: string;
  userId: string;
  createdAt: string;
  project?: Project;
  user?: User;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  entityId: string | null;
  userId: string;
  createdAt: string;
}

// ─── API Types ──────────────────────────────────────────

export interface DashboardData {
  stats: {
    total: number;
    inProgress: number;
    completed: number;
    overdue: number;
    teamMembers: number;
  };
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  recentTasks: Task[];
  recentActivities: Activity[];
  memberWorkload: { user: User; taskCount: number }[];
}
