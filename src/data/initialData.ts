import type { Notebook, Note } from '../types';

export const INITIAL_NOTEBOOKS: Notebook[] = [
  {
    id: 'inbox',
    name: 'Unsorted / Inbox',
    color: '#E7DDF8',
    icon: '📥',
    description: 'Catch quick thoughts here before organizing.',
  },
  {
    id: 'nb-personal',
    name: 'Personal & Daily',
    color: '#FCE8E6',
    icon: '✨',
    description: 'Daily reflections, reminders, and thoughts.',
  },
  {
    id: 'nb-study',
    name: 'Study & Learning',
    color: '#E8F5E9',
    icon: '📚',
    description: 'Course notes, lecture takeaways, and cheat sheets.',
  },
  {
    id: 'nb-ideas',
    name: 'Ideas & Projects',
    color: '#FFF8E1',
    icon: '💡',
    description: 'Sparks of inspiration and creative plans.',
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-welcome',
    title: 'Welcome to Little Notes! 🌸',
    content:
      'A cozy, distraction-free space for your thoughts, ideas, and study sessions.\n\n✨ Things to try:\n• Use Quick Capture above to jot down instant thoughts.\n• Organize your thoughts by stage: Catch ➜ Shape ➜ Reuse.\n• Turn on Exam Mode 📖 to test yourself with flashcards.\n• Click "Sync" to pair your notes with your phone in seconds.\n\nYour notes are stored privately in your browser!',
    notebookId: 'inbox',
    color: 'paper',
    styleType: 'kawaii',
    kawaiiSticker: 'cat',
    stage: 'catch',
    isPinned: true,
    tags: ['welcome', 'guide'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-checklist',
    title: "Daily Priorities 📋",
    content: 'Keep track of small wins and focus on what matters today.',
    notebookId: 'nb-personal',
    color: 'blush',
    styleType: 'checklist',
    kawaiiSticker: 'strawberry',
    stage: 'shape',
    tags: ['daily', 'habits'],
    checklist: [
      { id: 'c-1', text: "Organize today's study plan ☕", done: true },
      { id: 'c-2', text: 'Revise flashcard questions 📖', done: false },
      { id: 'c-3', text: 'Take a 15-minute walk in the fresh air ☀️', done: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-flashcard',
    title: 'Active Recall Practice 💡',
    content: 'Use flashcards to test your knowledge before exams!',
    notebookId: 'nb-study',
    color: 'sage',
    styleType: 'classic',
    stage: 'reuse',
    tags: ['study', 'flashcard'],
    revisionQuestion: 'What is active recall and why is it effective?',
    revisionAnswer:
      'Active recall is the practice of actively retrieving information from memory during learning, which strengthens neural connections much faster than passive re-reading!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-code',
    title: 'Quick Snippet: Binary Search 💻',
    content: 'A clean reference template for fast lookups in sorted lists.',
    notebookId: 'nb-ideas',
    color: 'sky',
    styleType: 'code',
    stage: 'shape',
    tags: ['code', 'python'],
    codeBlock: {
      language: 'python',
      code: 'def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
