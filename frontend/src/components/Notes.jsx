import { useEffect, useState } from "react";
import api from "../api";

export default function Notes({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState("free");
  const [role, setRole] = useState("member");
  const [tenantSlug, setTenantSlug] = useState("");

  // invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteMessage, setInviteMessage] = useState(null);

  // modal state
  const [selectedNote, setSelectedNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const decodeToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data.notes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTenant = async () => {
    try {
      const payload = decodeToken();
      if (!payload) return;
      setRole(payload.role);
      setTenantSlug(payload.tenantSlug);
      const res = await api.get(`/tenants/${payload.tenantSlug}`);
      setPlan(res.data.tenant.plan);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchTenant();
  }, []);

  const createNote = async () => {
    try {
      await api.post("/notes", { title });
      setTitle("");
      setError(null);
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.error || "Error creating note");
    }
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`);
    fetchNotes();
  };

  const upgradePlan = async () => {
    try {
      await api.post(`/tenants/${tenantSlug}/upgrade`);
      setPlan("pro");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Upgrade failed");
    }
  };

  const inviteUser = async () => {
    try {
      await api.post(`/tenants/${tenantSlug}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteMessage(`✅ Invited ${inviteEmail} as ${inviteRole}`);
      setInviteEmail("");
      setInviteRole("member");
    } catch (err) {
      setInviteMessage(err.response?.data?.error || "Invite failed");
    }
  };

  // View + open modal
  const openNote = async (id) => {
    try {
      const res = await api.get(`/notes/${id}`);
      setSelectedNote(res.data.note);
      setEditTitle(res.data.note.title);
      setEditContent(res.data.note.content || "");
    } catch (err) {
      console.error("Error fetching note", err);
    }
  };

  // Update note
  const saveNote = async () => {
    try {
      await api.put(`/notes/${selectedNote._id}`, {
        title: editTitle,
        content: editContent,
      });
      setSelectedNote(null);
      fetchNotes();
    } catch (err) {
      console.error("Error updating note", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"></div>
                <span className="text-slate-600 font-medium">Plan:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  plan === 'pro' 
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' 
                    : 'bg-gradient-to-r from-gray-100 to-slate-100 text-slate-700'
                }`}>
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                <span className="text-slate-600 font-medium">Role:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  role === 'admin' 
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700' 
                    : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                }`}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-medium rounded-xl hover:from-slate-600 hover:to-slate-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Invite Users - Only Admin */}
        {role === "admin" && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-800">Invite Team Member <span className="text-sm font-light">(Default Password : "password")</span></h2>
            </div>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                  placeholder="colleague@company.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                onClick={inviteUser}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Send Invite
              </button>
            </div>
            {inviteMessage && (
              <div className={`mt-4 p-4 rounded-xl ${
                inviteMessage.includes('✅') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {inviteMessage}
              </div>
            )}
          </div>
        )}

        {/* Create Note Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800">Create New Note</h2>
          </div>
          <div className="flex gap-3">
            <input
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
              placeholder="Enter your note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              onClick={createNote}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Add Note
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-red-700 font-medium">{error}</span>
                {error.includes("Upgrade") && plan === "free" && (
                  <button
                    onClick={upgradePlan}
                    disabled={role === "member"}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      role === "member"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 shadow-lg"
                    }`}
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800">Your Notes</h2>
            <div className="flex-1"></div>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>
          
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-300 rounded-lg"></div>
              </div>
              <h3 className="text-slate-500 font-medium text-lg mb-2">No notes yet</h3>
              <p className="text-slate-400">Create your first note to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {notes.map((n, index) => (
                <div
                  key={n._id}
                  className="group flex justify-between items-center p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-r from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50"
                  onClick={() => openNote(n._id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                      index % 4 === 0 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                      index % 4 === 1 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                      index % 4 === 2 ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                      'bg-gradient-to-br from-orange-400 to-orange-600'
                    }`}>
                      {n.title.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-800 font-medium text-lg group-hover:text-blue-700 transition-colors">
                      {n.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(n._id);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for view/update */}
        {selectedNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  <span>Edit Note</span>
                </h2>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white text-lg font-medium"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                  <textarea
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white resize-none"
                    rows="8"
                    placeholder="Write your note content here..."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-medium rounded-xl hover:from-gray-500 hover:to-gray-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNote}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}