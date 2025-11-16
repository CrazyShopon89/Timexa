export enum Role {
  Admin = 'Admin',
  Member = 'Member',
}

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

// Department enum is removed to support dynamic departments from the API.

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be sent to frontend in real app
  role: Role;
  avatarUrl: string;
  designation?: string;
  workPhone?: string;
  personalMobile?: string;
  department?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  memberIds: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  dueDate: string;
  status: TaskStatus;
  department: string; // Changed from enum to string
}

export interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  startTime: number; // Unix timestamp for current running interval
  endTime: number | null; // Unix timestamp or null if running
  duration: number; // in seconds, total accumulated
  isPaused: boolean;
}