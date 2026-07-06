import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuiz, createQuestion, createOption, submitAttempt } from '../api/quiz';
import { getTeamMembers } from '../api/teams';
import { useAuth } from '../context/AuthContext';
import { QuizAttemptResult } from '../types';

export default function QuizPage() {
  const { teamId, moduleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const teamIdNum = Number(teamId);
  const moduleIdNum = Number(moduleId);

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionText, setQuestionText] = useState('');

  const [addingOptionFor, setAddingOptionFor] = useState<number | null>(null);
  const [optionText, setOptionText] = useState('');
  const [optionIsCorrect, setOptionIsCorrect] = useState(false);

  // Member-taking state: { [questionId]: selectedOptionId }
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [lastResult, setLastResult] = useState<QuizAttemptResult | null>(null);

  const {
    data: quiz,
    isLoading: quizLoading,
    isError: quizError,
  } = useQuery({
    queryKey: ['quiz', teamIdNum, moduleIdNum],
    queryFn: () => getQuiz(teamIdNum, moduleIdNum),
  });

  const { data: members } = useQuery({
    queryKey: ['members', teamIdNum],
    queryFn: () => getTeamMembers(teamIdNum),
  });

  const currentMember = members?.find((m) => m.id === user?.id);
  const isAdmin = currentMember?.role === 'Admin';

  // ── Admin mutations ──────────────────────────────────────
  const createQuestionMutation = useMutation({
    mutationFn: (text: string) => createQuestion(teamIdNum, moduleIdNum, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', teamIdNum, moduleIdNum] });
      setShowAddQuestion(false);
      setQuestionText('');
    },
  });

  const createOptionMutation = useMutation({
    mutationFn: (vars: { questionId: number; text: string; isCorrect: boolean }) =>
      createOption(teamIdNum, moduleIdNum, vars.questionId, vars.text, vars.isCorrect),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', teamIdNum, moduleIdNum] });
      setAddingOptionFor(null);
      setOptionText('');
      setOptionIsCorrect(false);
    },
  });

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionText.trim()) {
      createQuestionMutation.mutate(questionText.trim());
    }
  };

  const startAddingOption = (questionId: number) => {
    setAddingOptionFor(questionId);
    setOptionText('');
    setOptionIsCorrect(false);
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (addingOptionFor !== null && optionText.trim()) {
      createOptionMutation.mutate({
        questionId: addingOptionFor,
        text: optionText.trim(),
        isCorrect: optionIsCorrect,
      });
    }
  };

  // ── Member mutation: submit attempt ─────────────────────
  const submitMutation = useMutation({
    mutationFn: (answersArray: { questionId: number; optionId: number }[]) =>
      submitAttempt(teamIdNum, moduleIdNum, answersArray),
    onSuccess: (result) => {
      setLastResult(result);
    },
  });

  const selectAnswer = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;
    const answersArray = quiz.questions.map((q) => ({
      questionId: q.id,
      optionId: answers[q.id],
    }));
    submitMutation.mutate(answersArray);
  };

  const handleRetake = () => {
    setAnswers({});
    setLastResult(null);
  };

  const allQuestionsAnswered =
    quiz !== undefined && quiz.questions.every((q) => answers[q.id] !== undefined);

  if (quizLoading) {
    return <div className="text-gray-500 text-center py-12">Loading quiz...</div>;
  }

  if (quizError || !quiz) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg m-6">
        Failed to load quiz. Please refresh.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate(`/teams/${teamIdNum}/modules/${moduleIdNum}`)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Module
        </button>
        {isAdmin && (
          <button
            onClick={() => setShowAddQuestion(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + Add Question
          </button>
        )}
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
        </p>

        {/* ═══════════════ ADMIN VIEW ═══════════════ */}
        {isAdmin && (
          <>
            {showAddQuestion && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6 border border-blue-100">
                <h3 className="text-lg font-medium mb-4">Add Question</h3>
                {createQuestionMutation.isError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">
                    Failed to add question. Text must be at least 5 characters.
                  </div>
                )}
                <form onSubmit={handleAddQuestion} className="space-y-3">
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Question text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={createQuestionMutation.isPending}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createQuestionMutation.isPending ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddQuestion(false)}
                      className="text-gray-500 text-sm px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="mt-8 space-y-4">
              {quiz.questions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No questions yet.</p>
                  <p className="text-sm mt-1">Add one to get started.</p>
                </div>
              )}

              {quiz.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white rounded-lg shadow-sm p-5 border border-gray-100"
                >
                  <h3 className="font-semibold text-gray-800">
                    {index + 1}. {question.question_text}
                  </h3>

                  <div className="mt-3 space-y-2">
                    {question.options.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No options added yet.</p>
                    )}
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className={`text-sm px-3 py-2 rounded-md border ${
                          option.is_correct
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        {option.option_text}
                        {option.is_correct && (
                          <span className="ml-2 text-xs font-medium text-green-600">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {addingOptionFor === question.id ? (
                    <form onSubmit={handleAddOption} className="mt-3 space-y-2">
                      <input
                        type="text"
                        value={optionText}
                        onChange={(e) => setOptionText(e.target.value)}
                        placeholder="Option text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        required
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={optionIsCorrect}
                          onChange={() => setOptionIsCorrect(true)}
                        />
                        This is the correct answer
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={createOptionMutation.isPending}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          {createOptionMutation.isPending ? 'Adding...' : 'Add Option'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingOptionFor(null)}
                          className="text-gray-500 text-sm px-3"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => startAddingOption(question.id)}
                      className="mt-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══════════════ MEMBER VIEW ═══════════════ */}
        {!isAdmin && (
          <div className="mt-8">
            {quiz.questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>This quiz has no questions yet. Check back later.</p>
              </div>
            ) : lastResult ? (
              <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-2">Your score</p>
                <p className="text-4xl font-bold text-blue-600">{lastResult.percentage}%</p>
                <p className="text-sm text-gray-500 mt-2">
                  {lastResult.correctCount} of {lastResult.totalQuestions} correct
                </p>
                <button
                  onClick={handleRetake}
                  className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  Retake Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {quiz.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-lg shadow-sm p-5 border border-gray-100"
                  >
                    <h3 className="font-semibold text-gray-800">
                      {index + 1}. {question.question_text}
                    </h3>
                    <div className="mt-3 space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-2 text-sm text-gray-700 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`answer-${question.id}`}
                            checked={answers[question.id] === option.id}
                            onChange={() => selectAnswer(question.id, option.id)}
                          />
                          {option.option_text}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {submitMutation.isError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    Failed to submit quiz. Please try again.
                  </div>
                )}

                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allQuestionsAnswered || submitMutation.isPending}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitMutation.isPending
                    ? 'Submitting...'
                    : allQuestionsAnswered
                    ? 'Submit Quiz'
                    : `Answer all ${quiz.questions.length} questions to submit`}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}