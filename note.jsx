import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Tag, Trash2, Edit2, X, Bold, Italic, Underline, List, ListOrdered, Save } from 'lucide-react';

export default function SmartNotesApp() {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Welcome to Smart Notes',
      content: '<p>This is a <strong>rich text</strong> note with <em>formatting</em> support!</p>',
      tags: ['welcome', 'tutorial'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [editTags, setEditTags] = useState([]);
  const editorRef = useRef(null);

  const allTags = [...new Set(notes.flatMap(note => note.tags))];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => note.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '<p>Start writing...</p>',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setEditTags([]);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    if (selectedNote) {
      setIsEditing(true);
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
      setEditTags([...selectedNote.tags]);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = selectedNote.content;
        }
      }, 0);
    }
  };

  const saveNote = () => {
    if (selectedNote && editorRef.current) {
      const updatedContent = editorRef.current.innerHTML;
      const updatedNotes = notes.map(note =>
        note.id === selectedNote.id
          ? {
              ...note,
              title: editTitle,
              content: updatedContent,
              tags: editTags,
              updatedAt: new Date().toISOString()
            }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({
        ...selectedNote,
        title: editTitle,
        content: updatedContent,
        tags: editTags
      });
      setIsEditing(false);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const addTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  const toggleTagFilter = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h1 className="text-2xl font-bold text-white mb-4">Smart Notes</h1>
          <button
            onClick={createNewNote}
            className="w-full bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Plus size={20} />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-slate-600" />
              <span className="text-sm font-semibold text-slate-600">Filter by tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => {
                setSelectedNote(note);
                setIsEditing(false);
              }}
              className={`p-4 border-b border-slate-200 cursor-pointer transition-all hover:bg-slate-50 ${
                selectedNote?.id === note.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-800 truncate flex-1">{note.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div
                className="text-sm text-slate-600 line-clamp-2 mb-2"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className="p-6 border-b border-slate-200 bg-white shadow-sm">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-3xl font-bold w-full border-b-2 border-slate-300 focus:border-indigo-600 outline-none pb-2"
                  />
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        placeholder="Add tag..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={addTag}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editTags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button onClick={() => removeTag(tag)}>
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-bold text-slate-800">{selectedNote.title}</h2>
                    <button
                      onClick={startEditing}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Edit2 size={18} />
                      Edit
                    </button>
                  </div>
                  {selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Editor Toolbar */}
            {isEditing && (
              <div className="p-4 border-b border-slate-200 bg-white flex gap-2 shadow-sm">
                <button
                  onClick={() => execCommand('bold')}
                  className="p-2 hover:bg-slate-100 rounded transition-colors"
                  title="Bold"
                >
                  <Bold size={18} />
                </button>
                <button
                  onClick={() => execCommand('italic')}
                  className="p-2 hover:bg-slate-100 rounded transition-colors"
                  title="Italic"
                >
                  <Italic size={18} />
                </button>
                <button
                  onClick={() => execCommand('underline')}
                  className="p-2 hover:bg-slate-100 rounded transition-colors"
                  title="Underline"
                >
                  <Underline size={18} />
                </button>
                <div className="w-px bg-slate-300 mx-2" />
                <button
                  onClick={() => execCommand('insertUnorderedList')}
                  className="p-2 hover:bg-slate-100 rounded transition-colors"
                  title="Bullet List"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => execCommand('insertOrderedList')}
                  className="p-2 hover:bg-slate-100 rounded transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered size={18} />
                </button>
                <div className="flex-1" />
                <button
                  onClick={saveNote}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  Save
                </button>
              </div>
            )}

            {/* Note Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {isEditing ? (
                <div
                  ref={editorRef}
                  contentEditable
                  className="prose max-w-none focus:outline-none min-h-full"
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              ) : (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Edit2 size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl">Select a note to view or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
