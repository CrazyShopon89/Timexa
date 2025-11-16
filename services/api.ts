import type { User, Project, Task, TimeLog } from '../types';
import { Role, TaskStatus } from '../types';

// --- SEED DATA ---

const SEED_DEPARTMENTS: string[] = [
    'Web Development',
    'SEO',
    'Sales',
    'Digital Marketing',
    'Creative',
];

const SEED_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password',
    role: Role.Admin,
    avatarUrl: 'https://i.pravatar.cc/150?u=admin@example.com',
    designation: 'Project Manager',
    workPhone: '123-456-7890',
    personalMobile: '098-765-4321',
    department: 'Web Development',
  },
  {
    id: 'user-2',
    name: 'Team Member',
    email: 'member@example.com',
    password: 'password',
    role: Role.Member,
    avatarUrl: 'https://i.pravatar.cc/150?u=member@example.com',
    designation: 'Frontend Developer',
    workPhone: '123-456-7891',
    personalMobile: '098-765-4322',
    department: 'Web Development',
  },
];

const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the corporate website.',
    startDate: '2024-08-01',
    endDate: '2024-12-31',
    memberIds: ['user-1', 'user-2'],
  },
  {
    id: 'proj-2',
    name: 'Marketing Campaign Q3',
    description: 'Digital marketing campaign for the new product launch.',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    memberIds: ['user-1', 'user-2'],
  },
];

const SEED_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design Homepage Mockup',
    description: 'Create a high-fidelity mockup in Figma for the new homepage.',
    projectId: 'proj-1',
    assigneeId: 'user-2',
    dueDate: '2024-09-15',
    status: TaskStatus.ToDo,
    department: 'Creative',
  },
  {
    id: 'task-2',
    title: 'Develop User Authentication',
    description: 'Implement login and registration functionality.',
    projectId: 'proj-1',
    assigneeId: 'user-2',
    dueDate: '2024-09-30',
    status: TaskStatus.InProgress,
    department: 'Web Development',
  },
  {
    id: 'task-3',
    title: 'Create Social Media Ads',
    description: 'Design and write copy for Facebook and Instagram ads.',
    projectId: 'proj-2',
    assigneeId: 'user-2',
    dueDate: '2024-08-20',
    status: TaskStatus.Done,
    department: 'Digital Marketing',
  },
];

const SEED_TIME_LOGS: TimeLog[] = [
    {
        id: 'log-1',
        taskId: 'task-3',
        userId: 'user-2',
        startTime: new Date('2024-08-10T09:00:00Z').getTime(),
        endTime: new Date('2024-08-10T11:30:00Z').getTime(),
        duration: 9000, // 2.5 hours in seconds
        isPaused: false,
    }
];


// --- DATA MANAGEMENT ---

let data: {
  users: User[];
  projects: Project[];
  tasks: Task[];
  timeLogs: TimeLog[];
  departments: string[];
} = { users: [], projects: [], tasks: [], timeLogs: [], departments: [] };

const LOCAL_STORAGE_KEY = 'bizTimeTrackerData';

function saveData() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage", error);
  }
}

function loadData() {
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    // Ensure departments array exists for backward compatibility
    data = { ...parsedData, departments: parsedData.departments || SEED_DEPARTMENTS };
  } else {
    // Initialize with seed data if nothing is in storage
    data = {
      users: SEED_USERS,
      projects: SEED_PROJECTS,
      tasks: SEED_TASKS,
      timeLogs: SEED_TIME_LOGS,
      departments: SEED_DEPARTMENTS,
    };
    saveData();
  }
}

// --- API METHODS ---

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // --- AUTH ---
  async login(email: string, pass: string): Promise<User | null> {
    await sleep(300); // Simulate network delay
    const user = data.users.find(u => u.email === email && u.password === pass);
    if (user) {
      localStorage.setItem('loggedInUserId', user.id);
      return { ...user }; // Return a copy
    }
    return null;
  },

  logout() {
    localStorage.removeItem('loggedInUserId');
  },

  async getLoggedInUser(): Promise<User | null> {
    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) return null;
    const user = data.users.find(u => u.id === userId);
    return user ? { ...user } : null;
  },

  // --- DATA GETTERS ---
  async getUsers(): Promise<User[]> {
    return structuredClone(data.users);
  },

  async getProjects(): Promise<Project[]> {
    return structuredClone(data.projects);
  },

  async getTasks(): Promise<Task[]> {
    return structuredClone(data.tasks);
  },
  
  async getTask(id: string): Promise<Task | null> {
    const task = data.tasks.find(t => t.id === id);
    return task ? structuredClone(task) : null;
  },

  async getTasksForUser(userId: string): Promise<Task[]> {
    return structuredClone(data.tasks.filter(task => task.assigneeId === userId));
  },
  
  async getAllTimeLogs(): Promise<TimeLog[]> {
    return structuredClone(data.timeLogs);
  },
  
  async getTimeLogsForUser(userId: string): Promise<TimeLog[]> {
    return structuredClone(data.timeLogs.filter(log => log.userId === userId));
  },

  // --- DEPARTMENTS ---
  async getDepartments(): Promise<string[]> {
    return structuredClone(data.departments);
  },

  async addDepartment(name: string): Promise<string> {
    if (!data.departments.includes(name)) {
        data.departments.push(name);
        saveData();
    }
    return name;
  },

  async deleteDepartment(name: string): Promise<boolean> {
      const initialLength = data.departments.length;
      data.departments = data.departments.filter(d => d !== name);
      if (data.departments.length < initialLength) {
          saveData();
          return true;
      }
      return false;
  },

  // --- TIMER ---
  async getActiveLogForTask(taskId: string, userId: string): Promise<TimeLog | null> {
    const log = data.timeLogs.find(l => l.taskId === taskId && l.userId === userId && l.endTime === null);
    return log ? { ...log } : null;
  },

  async startTimer(taskId: string, userId: string): Promise<TimeLog> {
    // Ensure no other timer is active for this task/user
    const existingActiveLog = await this.getActiveLogForTask(taskId, userId);
    if (existingActiveLog) {
      await this.stopTimer(existingActiveLog.id);
    }

    const newLog: TimeLog = {
      id: `log-${Date.now()}`,
      taskId,
      userId,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      isPaused: false,
    };
    data.timeLogs.push(newLog);
    saveData();
    return { ...newLog };
  },

  async pauseTimer(logId: string): Promise<TimeLog | null> {
    const log = data.timeLogs.find(l => l.id === logId);
    if (log && log.endTime === null && !log.isPaused) {
      log.duration += Math.floor((Date.now() - log.startTime) / 1000);
      log.isPaused = true;
      saveData();
      return { ...log };
    }
    return null;
  },

  async resumeTimer(logId: string): Promise<TimeLog | null> {
    const log = data.timeLogs.find(l => l.id === logId);
    if (log && log.endTime === null && log.isPaused) {
      log.startTime = Date.now();
      log.isPaused = false;
      saveData();
      return { ...log };
    }
    return null;
  },

  async stopTimer(logId: string): Promise<TimeLog | null> {
    const log = data.timeLogs.find(l => l.id === logId);
    if (log && log.endTime === null) {
      log.endTime = Date.now();
      if (!log.isPaused) {
        log.duration += Math.floor((log.endTime - log.startTime) / 1000);
      }
      log.isPaused = false;
      saveData();
      return { ...log };
    }
    return null;
  },

  // --- DATA MUTATIONS ---
  async updateUser(updatedUser: User): Promise<User | null> {
    const userIndex = data.users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      // Don't update password from profile page
      const { password, ...rest } = updatedUser;
      data.users[userIndex] = { ...data.users[userIndex], ...rest };
      saveData();
      return { ...data.users[userIndex] };
    }
    return null;
  },

   async addMember(memberData: Omit<User, 'id'>): Promise<User> {
    const newMember: User = {
        id: `user-${Date.now()}`,
        ...memberData
    };
    data.users.push(newMember);
    saveData();
    return structuredClone(newMember);
  },

  async updateMember(updatedMember: User): Promise<User | null> {
    const userIndex = data.users.findIndex(u => u.id === updatedMember.id);
    if (userIndex !== -1) {
      const originalUser = data.users[userIndex];
      data.users[userIndex] = { 
        ...originalUser, 
        ...updatedMember,
        // Ensure password is not erased if not provided in update
        password: updatedMember.password || originalUser.password
      };
      saveData();
      return { ...data.users[userIndex] };
    }
    return null;
  },

  async deleteMember(userId: string): Promise<boolean> {
      // Prevent deleting the last admin
      const userToDelete = data.users.find(u => u.id === userId);
      if (userToDelete?.role === Role.Admin) {
          const adminCount = data.users.filter(u => u.role === Role.Admin).length;
          if (adminCount <= 1) {
              console.error("Cannot delete the last admin.");
              return false;
          }
      }

      const initialLength = data.users.length;
      data.users = data.users.filter(u => u.id !== userId);
      if (data.users.length < initialLength) {
          // Optional: Re-assign tasks or handle cleanup
          data.tasks.forEach(task => {
              if (task.assigneeId === userId) {
                  // Re-assign to first admin or leave unassigned
                  const firstAdmin = data.users.find(u => u.role === Role.Admin);
                  task.assigneeId = firstAdmin ? firstAdmin.id : ''; 
              }
          });
          data.timeLogs = data.timeLogs.filter(log => log.userId !== userId);
          saveData();
          return true;
      }
      return false;
  },

  async addTask(taskData: Omit<Task, 'id'>): Promise<Task> {
    const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskData,
    };
    data.tasks.push(newTask);
    saveData();
    return structuredClone(newTask);
  },

  async updateTask(updatedTask: Task): Promise<Task | null> {
    const taskIndex = data.tasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex > -1) {
        data.tasks[taskIndex] = updatedTask;
        saveData();
        return structuredClone(updatedTask);
    }
    return null;
  },

  async deleteTask(taskId: string): Promise<boolean> {
    const initialLength = data.tasks.length;
    data.tasks = data.tasks.filter(t => t.id !== taskId);
    if (data.tasks.length < initialLength) {
        // Also delete associated time logs
        data.timeLogs = data.timeLogs.filter(log => log.taskId !== taskId);
        saveData();
        return true;
    }
    return false;
  }
};

// --- INITIALIZATION ---
loadData();