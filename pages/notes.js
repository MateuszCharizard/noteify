'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Search, Tag, Calendar, Download, Pin, Settings, ChevronLeft, ChevronRight, Eye, SortAsc, SortDesc } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument } from 'pdf-lib';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';
import { useDebounce } from 'use-debounce';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from '../lib/supabase';

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [activeNote, setActiveNote] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [categories] = useState(['General', 'Lectures', 'Assignments', 'Exams']);
  const [showNotes, setShowNotes] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterTag, setFilterTag] = useState('');
  const [previewNote, setPreviewNote] = useState(null);
  const [theme, setTheme] = useState('light');
  const notesPerPage = 5;
  const autoSaveTimeoutRef = useRef(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Initialize theme
  useEffect(() => {
    const initializeTheme = async () => {
      let savedTheme = 'light';
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('theme')
            .eq('id', user.id)
            .single();
          if (error && error.code !== 'PGRST116') throw error;
          if (data && data.theme) {
            savedTheme = data.theme;
          } else {
            await supabase.from('users').upsert([
              {
                id: user.id,
                display_name: user.user_metadata?.display_name || 'User',
                theme: savedTheme,
              },
            ]);
          }
        } catch (error) {
          toast.error('Failed to load theme preference.');
        }
      }
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(savedTheme);
    };
    if (!loading && user) {
      initializeTheme();
    }
  }, [user, loading]);

  useEffect(() => {
    const handler = (e) => {
      const newTheme = e.detail;
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
    };
    window.addEventListener('noteify-theme-change', handler);
    return () => window.removeEventListener('noteify-theme-change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Tiptap Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      if (activeNote) {
        clearTimeout(autoSaveTimeoutRef.current);
        setIsAutoSaving(true);
        autoSaveTimeoutRef.current = setTimeout(() => {
          updateNote(true);
          setIsAutoSaving(false);
        }, 1000);
      }
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load notes from Supabase
  useEffect(() => {
    if (user) {
      const fetchNotes = async () => {
        try {
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setNotes(data || []);
        } catch (error) {
          toast.error('Failed to load notes.');
        }
      };
      fetchNotes();
    }
  }, [user]);

  // Update editor content when active note changes
  useEffect(() => {
    if (editor && activeNote) {
      editor.commands.setContent(activeNote.content);
      setTitle(activeNote.title);
      setTags(activeNote.tags);
      setDate(activeNote.date);
      setCategory(activeNote.category);
    } else if (editor) {
      editor.commands.setContent('');
      setTitle('');
      setTags([]);
      setDate('');
      setCategory('');
    }
  }, [activeNote, editor]);

  const addNote = async () => {
    if (!title.trim() || !editor.getHTML().trim() || editor.getHTML() === '<p></p>') {
      toast.error('Title and content are required!');
      return;
    }
    const newNote = {
      title,
      content: editor.getHTML(),
      tags,
      date: date || new Date().toISOString().split('T')[0],
      category: category || 'General',
      created_at: new Date().toISOString(),
      pinned: false,
      user_id: user.id,
    };
    try {
      const { data, error } = await supabase.from('notes').insert([newNote]).select().single();
      if (error) throw error;
      setNotes([{ ...data }, ...notes]);
      toast.success('Note created!', { icon: '📝' });
      resetForm();
      setShowNotes(true);
    } catch (error) {
      toast.error('Failed to create note.');
    }
  };

  const updateNote = useCallback(async (isAutoSave = false) => {
    if (!title.trim() || !editor.getHTML().trim() || editor.getHTML() === '<p></p>') {
      if (!isAutoSave) toast.error('Title and content are required!');
      return;
    }
    const updatedNote = {
      title,
      content: editor.getHTML(),
      tags,
      date,
      category,
      updated_at: new Date().toISOString(),
      pinned: activeNote.pinned,
      user_id: user.id,
    };
    try {
      const { error } = await supabase
        .from('notes')
        .update(updatedNote)
        .eq('id', activeNote.id);
      if (error) throw error;
      setNotes(notes.map(note =>
        note.id === activeNote.id ? { ...note, ...updatedNote } : note
      ));
      if (!isAutoSave) {
        toast.success('Note updated!', { icon: '✅' });
        resetForm();
        setShowNotes(true);
      }
    } catch (error) {
      toast.error('Failed to update note.');
    }
  }, [title, tags, date, category, activeNote, notes, editor, user.id]);

  const deleteNote = async (id) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      setNotes(notes.filter(note => note.id !== id));
      if (activeNote?.id === id) resetForm();
      toast.success('Note deleted!', { icon: '🗑️' });
    } catch (error) {
      toast.error('Failed to delete note.');
    }
  };

  const pinNote = async (id) => {
    try {
      const note = notes.find(note => note.id === id);
      const { error } = await supabase
        .from('notes')
        .update({ pinned: !note.pinned })
        .eq('id', id);
      if (error) throw error;
      setNotes(notes.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
      toast.success(note.pinned ? 'Note unpinned!' : 'Note pinned!', { icon: '📌' });
    } catch (error) {
      toast.error('Failed to pin note.');
    }
  };

  const editNote = (note) => {
    setActiveNote(note);
    setShowNotes(false);
  };

  const resetForm = () => {
    setActiveNote(null);
    setTitle('');
    setTags([]);
    setDate('');
    setTagInput('');
    setCategory('');
    if (editor) editor.commands.setContent('');
  };

  const startNewNote = () => {
    resetForm();
    setShowNotes(false);
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (tags.includes(tagInput.trim())) {
        toast.error('Tag already exists!');
        return;
      }
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const exportNote = async (note, format = 'md') => {
    if (format === 'md') {
      const blob = new Blob([
        `# ${note.title}\n\n${note.content}\n\n**Tags**: ${note.tags.join(', ')}\n**Category**: ${note.category}\n**Date**: ${note.date}`
      ], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.replace(/\s+/g, '_')}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as Markdown!', { icon: '📄' });
    } else if (format === 'pdf') {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont('Helvetica');
      page.drawText(`Title: ${note.title}`, { x: 50, y: height - 50, size: 20, font });
      page.drawText(note.content.replace(/<[^>]+>/g, ''), { x: 50, y: height - 100, size: 12, font, maxWidth: width - 100 });
      page.drawText(`Tags: ${note.tags.join(', ')}`, { x: 50, y: 50, size: 10, font });
      page.drawText(`Category: ${note.category}`, { x: 50, y: 30, size: 10, font });
      page.drawText(`Date: ${note.date}`, { x: 50, y: 10, size: 10, font });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as PDF!', { icon: '📑' });
    }
  };

  const exportAllNotes = async () => {
    const zip = new JSZip();
    notes.forEach(note => {
      zip.file(
        `${note.title.replace(/\s+/g, '_')}.md`,
        `# ${note.title}\n\n${note.content}\n\n**Tags**: ${note.tags.join(', ')}\n**Category**: ${note.category}\n**Date**: ${note.date}`
      );
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'all_notes.zip');
    toast.success('All notes exported as ZIP!', { icon: '📦' });
  };

  const shareNote = (note) => {
    const shareData = btoa(JSON.stringify(note));
    const url = `${window.location.origin}/notes?note=${shareData}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied!', { icon: '🔗' });
  };

  const applyTemplate = (template) => {
    if (template === 'lecture') {
      editor.commands.setContent(`
        <h1>Lecture Notes</h1>
        <p><strong>Topic</strong>: </p>
        <p><strong>Key Points</strong>:</p>
        <ul><li></li><li></li></ul>
      `);
      setTitle('Lecture Notes');
    } else if (template === 'assignment') {
      editor.commands.setContent(`
        <h1>Assignment</h1>
        <p><strong>Title</strong>: </p>
        <p><strong>Requirements</strong>:</p>
        <ul><li></li><li></li></ul>
      `);
      setTitle('Assignment');
    }
    toast.success('Template applied!', { icon: '📋' });
  };

  const getWordCount = () => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadingTime = () => {
    const words = getWordCount();
    const minutes = Math.ceil(words / 200); // Average reading speed: 200 wpm
    return minutes;
  };

  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [notes]);

  const filteredNotes = useMemo(() =>
    notes
      .filter(note =>
        (note.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
         note.content.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
         note.tags.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))) &&
        (category ? note.category === category : true) &&
        (filterTag ? note.tags.includes(filterTag) : true)
      )
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        const order = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'title') return order * a.title.localeCompare(b.title);
        if (sortBy === 'date') return order * (new Date(a.date) - new Date(b.date));
        return order * (new Date(b.createdAt) - new Date(a.createdAt));
      }), [notes, debouncedSearchQuery, category, filterTag, sortBy, sortOrder]);

  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * notesPerPage,
    currentPage * notesPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100 dark:from-gray-900 dark:to-gray-800 font-sans transition-colors">
        <div className="text-gray-600 dark:text-gray-300 text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        :global(*) { user-select: none; }
        .note-content, .tiptap-editor, .prose { user-select: text; }
      `}</style>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-500">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2200,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '12px',
              fontWeight: 500,
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
            },
            dark: {
              background: '#1f2937',
              color: '#f9fafb',
            },
          }}
        />
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center mb-8"
            >
              <Link href="/">
                <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 transition-colors tracking-tight">
                  Noteify
                </h1>
              </Link>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={exportAllNotes}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 rounded-xl shadow transition"
                  title="Export All Notes"
                >
                  Export All
                </motion.button>
                <Link href="/settings">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl p-8 shadow-2xl">
              <AnimatePresence>
                {showNotes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <div className="flex items-center gap-2 flex-1">
                        <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search notes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none text-gray-800 dark:text-gray-100"
                      >
                        <option value="createdAt">Sort by Date Created</option>
                        <option value="title">Sort by Title</option>
                        <option value="date">Sort by Note Date</option>
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                      >
                        {sortOrder === 'asc' ? <SortAsc className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <SortDesc className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                      </motion.button>
                    </div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {categories.map(cat => (
                        <motion.button
                          key={cat}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCategory(cat === category ? '' : cat)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            category === cat
                              ? 'bg-blue-500 text-white dark:bg-blue-600'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {cat}
                        </motion.button>
                      ))}
                    </div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {allTags.map(tag => (
                        <motion.button
                          key={tag}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            filterTag === tag
                              ? 'bg-purple-500 text-white dark:bg-purple-600'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {tag}
                        </motion.button>
                      ))}
                    </div>
                    <div className="grid gap-4">
                      {paginatedNotes.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center">No notes found</p>
                      ) : (
                        paginatedNotes.map(note => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-start gap-3 note-card hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3
                                  className="font-semibold text-gray-800 dark:text-gray-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                  onClick={() => setPreviewNote(note)}
                                >
                                  {note.title}
                                </h3>
                                {note.pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                              </div>
                              <div
                                className="note-content text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: note.content }}
                              />
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{note.date}</p>
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setPreviewNote(note)}
                                className="p-2 text-blue-500 dark:text-blue-400"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => pinNote(note.id)}
                                className="p-2 text-yellow-500"
                                title={note.pinned ? 'Unpin' : 'Pin'}
                              >
                                <Pin className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => shareNote(note)}
                                className="p-2 text-purple-500 dark:text-purple-400"
                                title="Share"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C9.375 12.955 10.185 12.75 11 12.75s1.625.205 2.316.592m2.684-2.592l4-4m0 0l-4-4m4 4H7" />
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => exportNote(note, 'md')}
                                className="p-2 text-green-500 dark:text-green-400"
                                title="Export Markdown"
                              >
                                <Download className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => editNote(note)}
                                className="p-2 text-blue-500 dark:text-blue-400"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteNote(note.id)}
                                className="p-2 text-red-500 dark:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                    {filteredNotes.length > notesPerPage && (
                      <div className="flex justify-between mt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </motion.button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {currentPage} of {Math.ceil(filteredNotes.length / notesPerPage)}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredNotes.length / notesPerPage)))}
                          disabled={currentPage === Math.ceil(filteredNotes.length / notesPerPage)}
                          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!showNotes && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <input
                        type="text"
                        placeholder="Note Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-xl font-bold bg-transparent focus:outline-none placeholder-gray-300 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100"
                      />
                      <div className="flex items-center gap-4">
                        {isAutoSaving && (
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-sm text-gray-500 dark:text-gray-400"
                          >
                            Saving...
                          </motion.span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {getWordCount()} words (~{getReadingTime()} min)
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 mb-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-800 dark:text-gray-100"
                        >
                          <option value="">Category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          placeholder="Tag (Enter)"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={addTag}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-800 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {tags.map(tag => (
                        <motion.span
                          key={tag}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            ×
                          </button>
                        </motion.span>
                      ))}
                    </div>
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => applyTemplate('lecture')}
                          className="px-3 py-1 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                        >
                          Lecture
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => applyTemplate('assignment')}
                          className="px-3 py-1 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                        >
                          Assignment
                        </motion.button>
                      </div>
                    </div>
                    <EditorContent editor={editor} className="tiptap-editor h-64 border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                    <div className="flex justify-end gap-2 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { resetForm(); setShowNotes(true); }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={activeNote ? updateNote : addNote}
                        className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg flex items-center gap-2 font-semibold"
                      >
                        {activeNote ? (
                          <>
                            <Edit2 className="w-4 h-4" /> Save
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" /> Add
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {previewNote && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                  onClick={() => setPreviewNote(null)}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                  >
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{previewNote.title}</h2>
                    <div className="prose dark:prose-invert text-gray-800 dark:text-gray-100" dangerouslySetInnerHTML={{ __html: previewNote.content }} />
                    <div className="flex gap-2 mt-4">
                      {previewNote.tags.map(tag => (
                        <span key={tag} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Category: {previewNote.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date: {previewNote.date}</p>
                    <div className="flex justify-end gap-2 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPreviewNote(null)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold"
                      >
                        Close
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { editNote(previewNote); setPreviewNote(null); }}
                        className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg font-semibold"
                      >
                        Edit
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startNewNote}
              className="fixed bottom-6 right-6 p-4 bg-blue-500 text-white rounded-full shadow-lg dark:bg-blue-600"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              title="New Note"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
        </main>
        <footer className="bg-transparent py-6 mt-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">
              © {new Date().getFullYear()} Noteify. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}