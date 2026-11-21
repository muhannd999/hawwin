import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SpicinessLevel, TaskNode } from '../types/hawwin';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// دالة مساعدة متداخلة لتحديث أي عقدة في أي عمق داخل الشجرة
function updateNodeRecursive(
  nodes: TaskNode[],
  targetId: string,
  updater: (node: TaskNode) => TaskNode
): TaskNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return updater(node);
    }
    if (node.children.length > 0) {
      return {
        ...node,
        children: updateNodeRecursive(node.children, targetId, updater),
      };
    }
    return node;
  });
}

// دالة مساعدة متداخلة لحذف أي عقدة في أي عمق
function deleteNodeRecursive(nodes: TaskNode[], targetId: string): TaskNode[] {
  return nodes
    .filter((node) => node.id !== targetId)
    .map((node) => ({
      ...node,
      children: deleteNodeRecursive(node.children, targetId),
    }));
}

interface TaskStoreState {
  tasks: TaskNode[];
  defaultSpiciness: SpicinessLevel;
  setDefaultSpiciness: (level: SpicinessLevel) => void;
  addRootTask: (text: string) => void;
  addMultipleRootTasks: (texts: string[]) => void; // تُستخدم من أداة مفرّغ الأفكار (Compiler)
  toggleTask: (id: string) => void;
  toggleExpand: (id: string) => void;
  deleteTask: (id: string) => void;
  setNodeLoading: (id: string, field: 'isBreakingDown' | 'isEstimating', value: boolean) => void;
  attachSubtasks: (parentId: string, subtasks: { text: string; minutes?: number }[]) => void;
  setNodeEstimate: (id: string, minutes: number) => void;
  clearCompleted: () => void;
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set) => ({
      tasks: [],
      defaultSpiciness: 3,

      setDefaultSpiciness: (level) => set({ defaultSpiciness: level }),

      addRootTask: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const newTask: TaskNode = {
          id: generateId(),
          text: trimmed,
          completed: false,
          isExpanded: true,
          children: [],
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
      },

      addMultipleRootTasks: (texts) => {
        const newTasks: TaskNode[] = texts
          .map((t) => t.trim())
          .filter(Boolean)
          .map((text) => ({
            id: generateId(),
            text,
            completed: false,
            isExpanded: true,
            children: [],
          }));
        set((state) => ({ tasks: [...newTasks, ...state.tasks] }));
      },

      toggleTask: (id) =>
        set((state) => ({
          tasks: updateNodeRecursive(state.tasks, id, (node) => ({
            ...node,
            completed: !node.completed,
          })),
        })),

      toggleExpand: (id) =>
        set((state) => ({
          tasks: updateNodeRecursive(state.tasks, id, (node) => ({
            ...node,
            isExpanded: !node.isExpanded,
          })),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: deleteNodeRecursive(state.tasks, id),
        })),

      setNodeLoading: (id, field, value) =>
        set((state) => ({
          tasks: updateNodeRecursive(state.tasks, id, (node) => ({
            ...node,
            [field]: value,
          })),
        })),

      attachSubtasks: (parentId, subtasks) =>
        set((state) => ({
          tasks: updateNodeRecursive(state.tasks, parentId, (node) => ({
            ...node,
            isExpanded: true,
            isBreakingDown: false,
            children: [
              ...node.children,
              ...subtasks.map((sub) => ({
                id: generateId(),
                text: sub.text,
                estimatedMinutes: sub.minutes,
                completed: false,
                isExpanded: true,
                children: [],
              })),
            ],
          })),
        })),

      setNodeEstimate: (id, minutes) =>
        set((state) => ({
          tasks: updateNodeRecursive(state.tasks, id, (node) => ({
            ...node,
            estimatedMinutes: minutes,
            isEstimating: false,
          })),
        })),

      clearCompleted: () =>
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
        })),
    }),
    {
      name: 'hawwin-tasks-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);