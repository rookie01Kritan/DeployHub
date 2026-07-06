import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { getMyTeams } from '../api/teams';
import { Task } from '../types';

const STATUSES: Task['status'][] = ['todo', 'in_progress', 'done'];

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function ProjectPage() {
  const { teamId, projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const teamIdNum = Number(teamId);
  const projectIdNum = Number(projectId);

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  // Query 1: tasks for this project
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery({
    queryKey: ['tasks', teamIdNum, projectIdNum],
    queryFn: () => getTasks(teamIdNum, projectIdNum),
  });

  // Query 2: my teams, to determine role in THIS team
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: getMyTeams,
  });

  const currentTeam = teams?.find((t) => t.id === teamIdNum);
  const isAdmin = currentTeam?.role === 'Admin';

  // Mutation: create task
  const createTaskMutation = useMutation({
    mutationFn: (title: string) =>
      createTask(teamIdNum, projectIdNum, title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', teamIdNum, projectIdNum],
      });
      setShowCreateTask(false);
      setTaskTitle('');
    },
  });

  // Mutation: update task status
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: Task['status'] }) =>
      updateTask(teamIdNum, projectIdNum, taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', teamIdNum, projectIdNum],
      });
    },
  });

  // Mutation: delete task
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) =>
      deleteTask(teamIdNum, projectIdNum, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', teamIdNum, projectIdNum],
      });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      createTaskMutation.mutate(taskTitle.trim());
    }
  };

  if (tasksLoading) {
    return <div className="text-gray-500 text-center py-12">Loading tasks...</div>;
  }

  if (tasksError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg m-6">
        Failed to load tasks. Please refresh.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate(`/teams/${teamIdNum}`)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Team
        </button>
        <button
          onClick={() => setShowCreateTask(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          + New Task
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {showCreateTask && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-blue-100">
            {createTaskMutation.isError && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                Failed to create task. Try again.
              </div>
            )}
            <form onSubmit={handleCreateTask} className="flex gap-3">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateTask(false);
                  setTaskTitle('');
                }}
                className="text-gray-500 hover:text-gray-700 text-sm px-3"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUSES.map((status) => (
            <div key={status} className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-4">
                {STATUS_LABELS[status]}
              </h3>
              <div className="space-y-3">
                {tasks
                  ?.filter((task) => task.status === status)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-md shadow-sm p-4 border border-gray-100"
                    >
                      <p className="font-medium text-gray-800 text-sm">
                        {task.title}
                      </p>
                      {task.assignee_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned to {task.assignee_name}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {STATUSES.filter((s) => s !== status).map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                taskId: task.id,
                                status: s,
                              })
                            }
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                          >
                            → {STATUS_LABELS[s]}
                          </button>
                        ))}

                        {isAdmin && (
                          <button
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}