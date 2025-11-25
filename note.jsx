import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import EmptyState from './components/EmptyState';
import { Plus } from 'lucide-react';

export default function App() {
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
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const updateNote = (id, updates) => {
    const updatedNotes = notes.map(note =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    setSelectedNote({ ...selectedNote, ...updates });
  };

  const toggleTagFilter = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        notes={filteredNotes}
        selectedNote={selectedNote}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        allTags={allTags}
        selectedTags={selectedTags}
        toggleTagFilter={toggleTagFilter}
        onSelectNote={(note) => {
          setSelectedNote(note);
          setIsEditing(false);
        }}
        onCreateNote={createNewNote}
        onDeleteNote={deleteNote}
      />

      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            isEditing={isEditing}
            onStartEdit={() => setIsEditing(true)}
            onSave={(updates) => {
              updateNote(selectedNote.id, updates);
              setIsEditing(false);
            }}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
