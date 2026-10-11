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
    id: 'ai-ml',
    name: 'AI & ML',
    color: '#DCE9DD',
    icon: '🧠',
    description: 'Machine Learning theory, linear algebra, and neural nets.',
  },
  {
    id: 'my-labs',
    name: 'My Labs',
    color: '#F3DCD6',
    icon: '🧪',
    description: 'Weekly lab experiments, observations, and benchmarks.',
  },
  {
    id: 'code-corner',
    name: 'Code Corner',
    color: '#FEF3C7',
    icon: '💻',
    description: 'Useful algorithms, snippets, and terminal recipes.',
  },
  {
    id: 'japanese',
    name: 'Japanese Study',
    color: '#E0F2FE',
    icon: '🌸',
    description: 'Grammar notes, kanji drills, and conversational phrases.',
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Why does PCA maximize variance?',
    content: `When projecting high-dimensional data onto a lower-dimensional subspace, we want to lose as little information as possible.

Maximizing the variance of the projected points is mathematically equivalent to minimizing the reconstruction error (orthogonal projection distance).

The first principal component vector $v_1$ is the eigenvector corresponding to the largest eigenvalue of the sample covariance matrix $\\Sigma$:
$$ \\max_{||v||=1} v^T \\Sigma v $$`,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notebookId: 'ai-ml',
    color: 'sage',
    styleType: 'classic',
    stage: 'reuse',
    isPinned: true,
    tags: ['linear-algebra', 'dimensionality-reduction', 'exam-prep'],
    revisionQuestion: 'Why is maximizing variance in PCA equivalent to minimizing projection error?',
    revisionAnswer: 'By the Pythagorean theorem, the total variance of a data point is split into the variance along the projection subspace and the squared distance to it. Since total variance is constant, maximizing variance along the projection directly minimizes projection error.',
  },
  {
    id: 'note-2',
    title: 'Daily Study Checklist',
    content: 'Review vocabulary before evening seminar!',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notebookId: 'japanese',
    color: 'sky',
    styleType: 'checklist',
    kawaiiSticker: 'robot',
    stage: 'shape',
    isPinned: true,
    tags: ['routine', 'daily-goals'],
    checklist: [
      { id: 'c-1', text: 'Read passage (Chapter 4)', done: true },
      { id: 'c-2', text: 'Kanji practice (20 flashcards)', done: true },
      { id: 'c-3', text: 'Eat mochi & tea break 🍵', done: false },
      { id: 'c-4', text: 'Listen to podcast dialogue', done: false },
    ],
  },
  {
    id: 'note-3',
    title: 'Quick Sort in Python (Lomuto Partition)',
    content: 'Clean recursive implementation with average time complexity O(n log n). Remember to handle edge cases where the pivot equals array elements.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    notebookId: 'code-corner',
    color: 'butter',
    styleType: 'code',
    kawaiiSticker: 'duck',
    stage: 'shape',
    isPinned: false,
    tags: ['algorithms', 'python', 'sorting'],
    codeBlock: {
      language: 'python',
      code: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Test run
print(quicksort([3, 6, 8, 10, 1, 2, 1]))`,
    },
  },
  {
    id: 'note-4',
    title: 'Basic Japanese Greetings & Phrases',
    content: `お元気ですか？ (Ogenki desu ka?) → How are you?
はじめまして (Hajimemashite) → Nice to meet you.
どうぞ (Douzo) → Please / Go ahead.
いただきます (Itadakimasu) → Said before eating.
ごちそうさまでした (Gochisousama deshita) → Thank you for the meal.`,
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    notebookId: 'japanese',
    color: 'blush',
    styleType: 'kawaii',
    kawaiiSticker: 'panda',
    stage: 'shape',
    isPinned: false,
    tags: ['vocabulary', 'beginners'],
  },
  {
    id: 'note-5',
    title: 'Ask prof about learning rate warmup schedule',
    content: 'Why does CosineAnnealingLR often perform better than exponential decay on Transformer models with small batch sizes?',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    notebookId: 'inbox',
    color: 'lilac',
    styleType: 'classic',
    stage: 'catch',
    isPinned: false,
    tags: ['question', 'lecture'],
  },
  {
    id: 'note-6',
    title: 'Lab 4: Sensor calibration notes',
    content: 'Make sure to zero the baseline load cell at 22°C before recording voltage offsets. Thermal drift is ~0.4mV per degree.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    notebookId: 'my-labs',
    color: 'sage',
    styleType: 'checklist',
    kawaiiSticker: 'strawberry',
    stage: 'shape',
    isPinned: false,
    tags: ['hardware', 'lab-safety'],
    checklist: [
      { id: 'l-1', text: 'Calibrate load cell offset at 22°C', done: true },
      { id: 'l-2', text: 'Run 5 baseline sweep trials', done: true },
      { id: 'l-3', text: 'Export CSV to lab notebook', done: false },
    ],
  },
];
