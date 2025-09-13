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
    <div>
      <div className="flex justify-between items-center mb-4">
        <p>
          Current plan: <strong>{plan}</strong> | Role: <strong>{role}</strong>
        </p>
        <button
          onClick={onLogout}
          className="bg-gray-500 text-white px-2 py-1 rounded"
        >
          Logout
        </button>
      </div>
      
      {/* Invite Users - Only Admin */}
      {role === "admin" && (
        <div className="border p-3 mb-4">
          <h2 className="font-bold mb-2">Invite User</h2>
          <input
            className="border p-2 mr-2"
            placeholder="Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <select
            className="border p-2 mr-2"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={inviteUser}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Invite
          </button>
          {inviteMessage && <p className="mt-2">{inviteMessage}</p>}
        </div>
      )}

      {/* Notes creation */}
      <div className="flex gap-2 mb-2">
        <input
          className="border p-2 flex-1"
          placeholder="New note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          onClick={createNote}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Add
        </button>
      </div>

      {error && (
        <div className="mb-2 text-red-500">
          {error}{" "}
          {error.includes("Upgrade") && plan === "free" && (
            <button
              onClick={upgradePlan}
              disabled={role === "member"}
              className={`px-2 py-1 rounded ml-2 ${
                role === "member"
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-purple-500 text-white"
              }`}
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      )}


      {/* Notes list */}
      <ul className="space-y-2">
        {notes.map((n) => (
          <li
            key={n._id}
            className="flex justify-between items-center border p-2 cursor-pointer"
            onClick={() => openNote(n._id)}
          >
            <span>{n.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNote(n._id);
              }}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Modal for view/update */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96">
            <h2 className="font-bold mb-2">Edit Note</h2>
            <input
              className="border p-2 w-full mb-2"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              className="border p-2 w-full mb-2"
              rows="4"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedNote(null)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
