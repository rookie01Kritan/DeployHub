// src/pages/DashboardPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyTeams, createTeam } from '../api/teams';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState('');

  // Fetch teams
  const {
    data: teams,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['teams'],
    queryFn: getMyTeams,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: (name: string) => createTeam(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowCreateTeam(false);
      setTeamName('');
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      createTeamMutation.mutate(teamName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">DeployHub</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Your Teams</h2>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + New Team
          </button>
        </div>

        {/* Create team form */}
        {showCreateTeam && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-blue-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Create a new team
            </h3>
            {createTeamMutation.isError && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                Failed to create team. Try again.
              </div>
            )}
            <form onSubmit={handleCreateTeam} className="flex gap-3">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={createTeamMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {createTeamMutation.isPending ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateTeam(false);
                  setTeamName('');
                }}
                className="text-gray-500 hover:text-gray-700 text-sm px-3"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Teams list */}
        {isLoading && (
          <div className="text-gray-500 text-center py-12">
            Loading teams...
          </div>
        )}

        {isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Failed to load teams. Please refresh.
          </div>
        )}

        {teams && teams.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">You're not part of any team yet.</p>
            <p className="text-sm mt-2">Create a team to get started.</p>
          </div>
        )}

        {teams && teams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {team.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    team.role === 'Admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {team.role}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Click to view projects →
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}