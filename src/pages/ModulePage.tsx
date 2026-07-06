import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getModule, createLesson, updateLesson, deleteLesson } from '../api/modules';
import { getTeamMembers } from '../api/teams';
import { useAuth } from '../context/AuthContext';
import { getQuiz, createQuiz } from '../api/quiz';

export default function ModulePage() {
  const { teamId, moduleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const teamIdNum = Number(teamId);
  const moduleIdNum = Number(moduleId);

  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');

  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');

  // Query 1: module + its lessons
  const {
    data: moduleData,
    isLoading: moduleLoading,
    isError: moduleError,
  } = useQuery({
    queryKey: ['module', teamIdNum, moduleIdNum],
    queryFn: () => getModule(teamIdNum, moduleIdNum),
  });

  // Query 2: team members, to determine role (same pattern as TeamPage.tsx)
  const { data: members } = useQuery({
    queryKey: ['members', teamIdNum],
    queryFn: () => getTeamMembers(teamIdNum),
  });

  // Query 3: quiz for this module (may not exist yet — 404 is expected, not an error to retry)
  const { data: quiz } = useQuery({
    queryKey: ['quiz', teamIdNum, moduleIdNum],
    queryFn: () => getQuiz(teamIdNum, moduleIdNum),
    retry: false,
  });

  const currentMember = members?.find((m) => m.id === user?.id);
  const isAdmin = currentMember?.role === 'Admin';

  // Mutation: add lesson
  const createLessonMutation = useMutation({
    mutationFn: (vars: { title: string; content: string }) =>
      createLesson(teamIdNum, moduleIdNum, vars.title, vars.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', teamIdNum, moduleIdNum] });
      setShowAddLesson(false);
      setLessonTitle('');
      setLessonContent('');
    },
  });

  // Mutation: update lesson
  const updateLessonMutation = useMutation({
    mutationFn: (vars: { lessonId: number; title: string; content: string }) =>
      updateLesson(teamIdNum, moduleIdNum, vars.lessonId, {
        title: vars.title,
        content: vars.content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', teamIdNum, moduleIdNum] });
      setEditingLessonId(null);
    },
  });

  // Mutation: delete lesson
  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: number) => deleteLesson(teamIdNum, moduleIdNum, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', teamIdNum, moduleIdNum] });
    },
  });

  // Mutation: create quiz
  const createQuizMutation = useMutation({
    mutationFn: (title: string) => createQuiz(teamIdNum, moduleIdNum, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', teamIdNum, moduleIdNum] });
      setShowCreateQuiz(false);
      setQuizTitle('');
    },
  });

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (lessonTitle.trim()) {
      createLessonMutation.mutate({
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
      });
    }
  };

  const startEditing = (lessonId: number, currentTitle: string, currentContent: string | null) => {
    setEditingLessonId(lessonId);
    setEditTitle(currentTitle);
    setEditContent(currentContent || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLessonId !== null && editTitle.trim()) {
      updateLessonMutation.mutate({
        lessonId: editingLessonId,
        title: editTitle.trim(),
        content: editContent.trim(),
      });
    }
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizTitle.trim()) {
      createQuizMutation.mutate(quizTitle.trim());
    }
  };

  if (moduleLoading) {
    return <div className="text-gray-500 text-center py-12">Loading module...</div>;
  }

  if (moduleError || !moduleData) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg m-6">
        Failed to load module. Please refresh.
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
        {isAdmin && (
          <button
            onClick={() => setShowAddLesson(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + Add Lesson
          </button>
        )}
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">{moduleData.title}</h1>
        {moduleData.description && (
          <p className="text-gray-500 mt-2">{moduleData.description}</p>
        )}

        {showAddLesson && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6 border border-blue-100">
            <h3 className="text-lg font-medium mb-4">Add Lesson</h3>
            {createLessonMutation.isError && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">
                Failed to add lesson. Try again.
              </div>
            )}
            <form onSubmit={handleAddLesson} className="space-y-3">
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Lesson title"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                required
              />
              <textarea
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                placeholder="Lesson content (optional)"
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createLessonMutation.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {createLessonMutation.isPending ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddLesson(false)}
                  className="text-gray-500 text-sm px-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {moduleData.lessons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No lessons yet.</p>
              {isAdmin && <p className="text-sm mt-1">Add one to get started.</p>}
            </div>
          )}

          {moduleData.lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="bg-white rounded-lg shadow-sm p-5 border border-gray-100"
            >
              {editingLessonId === lesson.id ? (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={updateLessonMutation.isPending}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateLessonMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingLessonId(null)}
                      className="text-gray-500 text-sm px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800">
                      {index + 1}. {lesson.title}
                    </h3>
                    {isAdmin && (
                      <div className="flex gap-2 shrink-0 ml-3">
                        <button
                          onClick={() => startEditing(lesson.id, lesson.title, lesson.content)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteLessonMutation.mutate(lesson.id)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {lesson.content ? (
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                      {lesson.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic mt-2">No content added yet.</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Quiz section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Quiz</h2>

          {quiz ? (
            <button
              onClick={() => navigate(`/teams/${teamIdNum}/modules/${moduleIdNum}/quiz`)}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all w-full text-left"
            >
              <p className="font-medium text-gray-800">{quiz.title}</p>
              <p className="text-xs text-gray-400 mt-1">
                {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} · Manage quiz →
              </p>
            </button>
          ) : (
            <>
              {isAdmin && !showCreateQuiz && (
                <button
                  onClick={() => setShowCreateQuiz(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  + Create Quiz
                </button>
              )}

              {!isAdmin && (
                <p className="text-sm text-gray-500">No quiz has been created for this module yet.</p>
              )}

              {showCreateQuiz && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-100">
                  {createQuizMutation.isError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">
                      Failed to create quiz. Try again.
                    </div>
                  )}
                  <form onSubmit={handleCreateQuiz} className="flex gap-3">
                    <input
                      type="text"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Quiz title"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      required
                    />
                    <button
                      type="submit"
                      disabled={createQuizMutation.isPending}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createQuizMutation.isPending ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateQuiz(false)}
                      className="text-gray-500 text-sm px-3"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}