export const SUBJECTS_6TH_SEM = [
  {
    id: 'numerical_methods',
    name: 'Numerical Methods',
    shortName: 'Numerical',
    icon: 'Calculator',
    color: 'from-blue-500 to-cyan-600',
    semester: 6,
  },
  {
    id: 'cloud_computing',
    name: 'Cloud Computing',
    shortName: 'Cloud',
    icon: 'Cloud',
    color: 'from-sky-500 to-blue-600',
    semester: 6,
  },
  {
    id: 'full_stack_dev_2',
    name: 'Full Stack Development - II',
    shortName: 'Full Stack II',
    icon: 'Code2',
    color: 'from-emerald-500 to-teal-600',
    semester: 6,
  },
  {
    id: 'system_design',
    name: 'System Design',
    shortName: 'System Design',
    icon: 'Network',
    color: 'from-orange-500 to-amber-600',
    semester: 6,
  },
  {
    id: 'competitive_coding_2',
    name: 'Competitive Coding - II',
    shortName: 'Comp Coding II',
    icon: 'Trophy',
    color: 'from-rose-500 to-pink-600',
    semester: 6,
  },
] as const;

export const SUBJECTS_7TH_SEM = [
  {
    id: 'competitive_coding_3',
    name: 'Competitive Coding - III',
    shortName: 'Comp Coding III',
    icon: 'Trophy',
    color: 'from-violet-500 to-purple-600',
    semester: 7,
  },
] as const;

export const SUBJECTS = [...SUBJECTS_6TH_SEM, ...SUBJECTS_7TH_SEM] as const;

export type SubjectId = typeof SUBJECTS[number]['id'];

export const getSubjectById = (id: string) => SUBJECTS.find(s => s.id === id);
