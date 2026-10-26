export type NoteColor = 'paper' | 'lilac' | 'sage' | 'blush' | 'butter' | 'sky' | 'peach';

export type NoteStyle = 'classic' | 'kawaii' | 'checklist' | 'code' | 'minimal';

export type KawaiiSticker = 'cat' | 'panda' | 'duck' | 'strawberry' | 'robot' | 'carrot' | 'none';

export type ThoughtStage = 'catch' | 'shape' | 'reuse';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface AudioNote {
  duration: number;
  date: string;
  transcript?: string;
  audioBlobUrl?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  notebookId: string; // 'inbox' | custom notebook id
  color: NoteColor;
  styleType: NoteStyle;
  kawaiiSticker?: KawaiiSticker;
  checklist?: ChecklistItem[];
  codeBlock?: CodeSnippet;
  stage: ThoughtStage;
  isPinned?: boolean;
  tags: string[];
  revisionQuestion?: string;
  revisionAnswer?: string;
  drawingDataUrl?: string; // Handwritten sketch / doodle
  photos?: string[]; // Attached photos / images (data URLs or remote URLs)
  audioNote?: AudioNote; // Voice quick capture
}

export interface Notebook {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
}
