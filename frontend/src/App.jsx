import { useState, useEffect } from "react";

// ================== App ==================
function App() {
  const [notes, setNotes] = useState([]);

  const baseUrl = "https://backend-rho-one-69.vercel.app/"

  // Fetch semua notes
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${baseUrl}/notes`);
      const result = await res.json();
      setNotes(result.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Tambah note baru
  const addNote = async (title, content) => {
    try {
      const res = await fetch(`${baseUrl}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const result = await res.json();

      if (res.ok) {
        setNotes((prev) => [...prev, result.data]);
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Update note
  const handleUpdateNote = async (id, title, content) => {
    try {
      const res = await fetch(`${baseUrl}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const result = await res.json();

      if (res.ok) {
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? result.data : note))
        );
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  // Hapus note
  const handleDeleteNote = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/notes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== id));
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col mt-24 items-center">
        <NoteForm onAddNote={addNote} />
        <NoteList
          notes={notes}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
        />
      </main>
    </>
  );
}

export default App;

// ================== Komponen ==================

const Navbar = () => (
  <nav className="fixed top-0 w-full flex justify-center bg-white shadow">
    <div className="container flex justify-between px-5 py-5">
      <img src="/logo.svg" alt="Logo" />
    </div>
  </nav>
);

const NoteForm = ({ onAddNote }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onAddNote(title, content);
    setTitle("");
    setContent("");
  };

  return (
    <section className="container max-w-xl px-5 mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title"
          className="rounded-sm border border-gray-400 p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          className="resize-y min-h-14 rounded-sm border border-gray-400 p-3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white font-semibold rounded-lg py-3 hover:bg-blue-600 transition"
        >
          Add Note
        </button>
      </form>
    </section>
  );
};

const NoteItem = ({ note, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleEdited, setTitleEdited] = useState(note.title);
  const [contentEdited, setContentEdited] = useState(note.content);

  const handleSave = () => {
    onUpdate(note.id, titleEdited, contentEdited);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitleEdited(note.title);
    setContentEdited(note.content);
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg shadow-md bg-white w-[300px] p-5">
      {isEditing ? (
        <>
          <input
            type="text"
            value={titleEdited}
            className="rounded-sm border border-gray-400 p-2 w-full"
            onChange={(e) => setTitleEdited(e.target.value)}
          />
          <textarea
            value={contentEdited}
            className="rounded-sm border border-gray-400 p-2 w-full mt-2"
            onChange={(e) => setContentEdited(e.target.value)}
          />
          <div className="mt-4 flex gap-2">
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="font-medium text-xl">{note.title}</p>
          <p className="text-sm text-gray-500">
            ~{showFormattedDate(note.created_at)}
          </p>
          <p className="mt-2 text-gray-700">{note.content}</p>
          <div className="mt-4 flex gap-2">
            <button
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={() => onDelete(note.id)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const NoteList = ({ notes, onUpdate, onDelete }) => (
  <section className="container py-8">
    <h2 className="inline-flex items-center gap-2 text-2xl font-medium mb-6">
      <img src="/note.svg" alt="note icon" className="w-8 h-8" />
      Notes
    </h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {notes.length > 0 ? (
        notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))
      ) : (
        <h1 className="text-gray-400">Data Kosong</h1>
      )}
    </div>
  </section>
);

// ================== Helper ==================
const showFormattedDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    weekday: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("id-ID", options);
};
