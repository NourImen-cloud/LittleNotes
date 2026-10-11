import type { NoteColor, ThoughtStage } from '../types';

export interface ColorScheme {
  bg: string;
  border: string;
  badge: string;
  text: string;
  headerBg: string;
}

export const NOTE_COLORS: Record<NoteColor, ColorScheme> = {
  paper: {
    bg: '#FAF6EF',
    border: '#E8DFC9',
    badge: '#EFE8D6',
    text: '#37343C',
    headerBg: '#F3ECDE',
  },
  lilac: {
    bg: '#F5F0FC',
    border: '#D8C6F2',
    badge: '#E7DDF8',
    text: '#352D42',
    headerBg: '#ECE2F9',
  },
  sage: {
    bg: '#F0F6F1',
    border: '#BED9C2',
    badge: '#DCE9DD',
    text: '#28382C',
    headerBg: '#E2EFE3',
  },
  blush: {
    bg: '#FDF3F0',
    border: '#ECC9C0',
    badge: '#F3DCD6',
    text: '#432C28',
    headerBg: '#F8E3DD',
  },
  butter: {
    bg: '#FEFCE8',
    border: '#FDE047',
    badge: '#FEF08A',
    text: '#423311',
    headerBg: '#FEF08A',
  },
  sky: {
    bg: '#F0F9FF',
    border: '#BAE6FD',
    badge: '#E0F2FE',
    text: '#1E3A5F',
    headerBg: '#E0F2FE',
  },
  peach: {
    bg: '#FFF7ED',
    border: '#FED7AA',
    badge: '#FFEDD5',
    text: '#43281C',
    headerBg: '#FFEDD5',
  },
};

export const STAGE_META: Record<
  ThoughtStage,
  { label: string; step: string; badgeClass: string; desc: string }
> = {
  catch: {
    label: 'Caught Thought',
    step: 'Step 1: Catch it',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Quick capture from lecture or impulse',
  },
  shape: {
    label: 'Shaped Note',
    step: 'Step 2: Shape it',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Enriched with code, checklist, or tags',
  },
  reuse: {
    label: 'Exam Ready',
    step: 'Step 3: Reuse it',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Turned into revision cards or reference',
  },
};
