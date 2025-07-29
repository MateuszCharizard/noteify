import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// This is a stand-in for Next.js's Head component for this environment.
const Head = ({ children }) => {
  useEffect(() => {
    const title = children.find(c => c.type === 'title')?.props.children;
    if (title) document.title = title;
  }, [children]);
  return null;
};

// This is a stand-in for Next.js's Link component for this environment.
const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [theme, setTheme] = useState('light');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Error fetching notes:', error);
        } else {
          setNotes(data);
        }
      }
      setLoading(false);
    };

    fetchNotes();
  }, []);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...newNote, user_id: user.id }])
        .select();
      if (error) {
        console.error('Error creating note:', error);
      } else {
        setNotes([data[0], ...notes]);
        setNewNote({ title: '', content: '' });
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen select-none ${theme === 'dark' ? 'bg-black text-gray-100' : 'bg-white text-gray-900'} transition-all duration-500 flex flex-col items-center relative overflow-hidden`}>
      <Head>
        <title>Noteify - Your Notes</title>
        <meta name="description" content="Create and manage your notes with ease." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none z-20"
        aria-label="Toggle theme"
      >
        <svg
          className="w-5 h-5 text-gray-900 dark:text-gray-100"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {theme === 'light' ? (
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.63-.14 2.39-.41-.56.24-1.15.41-1.77.41-3.31 0-6-2.69-6-6s2.69-6 6-6c.62 0 1.21.17 1.77.41-.76-.27-1.56-.41-2.39-.41zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" />
          ) : (
            <path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1 13h2v2h-2zm0-18h2v2h-2zm10 10h2v-2h-2zm-18 0h2v-2H3zm15.66 6.34l1.41 1.41 1.41-1.41-1.41-1.41-1.41 1.41zm-12.72 0l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zm12.72-12.72l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zm-12.72 0l-1.41-1.41-1.41 1.41 1.41 1.41 1.41-1.41z" />
          )}
        </svg>
      </button>

      <Link
        href="/profile"
        className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300 hover:scale-110 cursor-pointer z-20"
        title="Profile"
      >
        <svg
          className="w-5 h-5 text-gray-900 dark:text-gray-100"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </Link>

      <main className="w-full max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Notes</h1>
        <form onSubmit={handleCreateNote} className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <input
            type="text"
            placeholder="Note Title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full p-2 mb-4 bg-transparent border border-gray-400 dark:border-gray-600 rounded-md"
            required
          />
          <textarea
            placeholder="Note Content"
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full p-2 mb-4 bg-transparent border border-gray-400 dark:border-gray-600 rounded-md"
            rows="4"
          ></textarea>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full font-semibold"
          >
            Add Note
          </button>
        </form>
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h2 className="text-2xl font-bold">{note.title}</h2>
              <p>{note.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
