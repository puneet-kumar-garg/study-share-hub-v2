export const SUBJECTS = [
  {
    id: 'principles_of_ai',
    name: 'Principles of Artificial Intelligence',
    shortName: 'AI Principles',
    icon: 'Brain',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'numerical_methods',
    name: 'Numerical Methods',
    shortName: 'Numerical',
    icon: 'Calculator',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'cloud_computing',
    name: 'Cloud Computing',
    shortName: 'Cloud',
    icon: 'Cloud',
    color: 'from-sky-500 to-blue-600',
  },
  {
    id: 'full_stack_dev_2',
    name: 'Full Stack Development - II',
    shortName: 'Full Stack II',
    icon: 'Code2',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'system_design',
    name: 'System Design',
    shortName: 'System Design',
    icon: 'Network',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'competitive_coding_2',
    name: 'Competitive Coding-II',
    shortName: 'Comp Coding II',
    icon: 'Trophy',
    color: 'from-rose-500 to-pink-600',
  },
] as const;

export type SubjectId = typeof SUBJECTS[number]['id'];

export const getSubjectById = (id: string) => SUBJECTS.find(s => s.id === id);
