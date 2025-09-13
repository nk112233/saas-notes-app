import { useEffect, useState } from "react";
import api from "../api";

export default function Notes({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState("free");

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
      // decode token payload to get tenantSlug
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const slug = payload.tenantSlug;
      const res = await api.get(`/tenants/${slug}`);
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
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const slug = payload.tenantSlug;
      await api.post(`/tenants/${slug}/upgrade`);
      setPlan("pro");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Upgrade failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p>
          Current plan: <strong>{plan}</strong>
        </p>
        <button
          onClick={onLogout}
          className="bg-gray-500 text-white px-2 py-1 rounded"
        >
          Logout
        </button>
      </div>

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
              className="bg-purple-500 text-white px-2 py-1 rounded ml-2"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      )}

      <ul className="space-y-2">
        {notes.map((n) => (
          <li
            key={n._id}
            className="flex justify-between items-center border p-2"
          >
            <span>{n.title}</span>
            <button
              onClick={() => deleteNote(n._id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
