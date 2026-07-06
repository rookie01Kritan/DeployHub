import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject } from '../api/projects';
import { getTeamMembers, inviteMember } from '../api/teams';
import { getModules, createModule } from '../api/modules';
import { useAuth } from '../context/AuthContext';

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const id = parseInt(teamId || '0');

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'modules'>('projects');

  const [showCreateModule, setShowCreateModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');

  // Fetch projects
  const {
    data: projects,
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProjects(id),
    enabled: !!id,
  });

  // Fetch members
  const {
    data: members,
  } = useQuery({
    queryKey: ['members', id],
    queryFn: () => getTeamMembers(id),
    enabled: !!id,
  });

  // Fetch modules
  const {
    data: modules,
    isLoading: modulesLoading,
  } = useQuery({
    queryKey: ['modules', id],
    queryFn: () => getModules(id),
    enabled: !!id,
  });

  // Create project
  const createProjectMutation = useMutation({
    mutationFn: () => createProject(id, projectName, projectDesc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      setShowCreateProject(false);
      setProjectName('');
      setProjectDesc('');
    },
  });

  // Invite member
  const inviteMutation = useMutation({
    mutationFn: () => inviteMember(id, inviteEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', id] });
      setShowInvite(false);
      setInviteEmail('');
    },
  });

  // Create module
  const createModuleMutation = useMutation({
    mutationFn: () => createModule(id, moduleTitle, moduleDesc || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', id] });
      setShowCreateModule(false);
      setModuleTitle('');
      setModuleDesc('');
    },
  });

  // Check if current user is Admin
  const currentMember = members?.find((m) => m.id === user?.id);
  const isAdmin = currentMember?.role === 'Admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Dashboard
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-semibold text-gray-800">Team</h1>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Members ({members?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'modules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Learning Modules ({modules?.length || 0})
          </button>
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  + New Project
                </button>
              )}
            </div>

            {showCreateProject && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-blue-100">
                <h3 className="text-lg font-medium mb-4">Create Project</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createProjectMutation.mutate();
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={createProjectMutation.isPending}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createProjectMutation.isPending ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateProject(false)}
                      className="text-gray-500 text-sm px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {projectsLoading && (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            )}

            {projects && projects.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No projects yet.</p>
                {isAdmin && (
                  <p className="text-sm mt-1">Create one to get started.</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects?.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/teams/${id}/projects/${project.id}`)}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {project.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    Click to view Kanban board →
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Members</h2>
              {isAdmin && (
                <button
                  onClick={() => setShowInvite(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  + Invite Member
                </button>
              )}
            </div>

            {showInvite && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-blue-100">
                {inviteMutation.isError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">
                    Failed to invite. Check the email and try again.
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    inviteMutation.mutate();
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Email address"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={inviteMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {inviteMutation.isPending ? 'Inviting...' : 'Invite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvite(false)}
                    className="text-gray-500 text-sm px-3"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              {members?.map((member, index) => (
                <div
                  key={member.id}
                  className={`flex justify-between items-center px-6 py-4 ${
                    index !== (members.length - 1)
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    member.role === 'Admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Learning Modules</h2>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateModule(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  + New Module
                </button>
              )}
            </div>

            {showCreateModule && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-blue-100">
                <h3 className="text-lg font-medium mb-4">Create Module</h3>
                {createModuleMutation.isError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">
                    Failed to create module. Try again.
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createModuleMutation.mutate();
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="Module title"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={moduleDesc}
                    onChange={(e) => setModuleDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={createModuleMutation.isPending}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createModuleMutation.isPending ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModule(false)}
                      className="text-gray-500 text-sm px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {modulesLoading && (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            )}

            {modules && modules.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No learning modules yet.</p>
                {isAdmin && (
                  <p className="text-sm mt-1">Create one to get started.</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules?.map((module) => (
                <div
                  key={module.id}
                  onClick={() => navigate(`/teams/${id}/modules/${module.id}`)}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {module.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    Click to view lessons →
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}