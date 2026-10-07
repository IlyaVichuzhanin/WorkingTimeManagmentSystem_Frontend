export interface Task {
  name: string;
  project: string;
  startDate: string;
  endDate: string;
  planedHours: number;
  currentHours: number;
  isActing: boolean;
}

export const tasks: Task[] = [
  { name: 'Разработка API авторизации', project: 'Backend система', startDate: '2026-10-01', endDate: '2026-10-15', planedHours: 24, currentHours: 18 , isActing: true},
  { name: 'Вёрстка главной страницы', project: 'Frontend', startDate: '2026-10-05', endDate: '2026-10-12', planedHours: 16, currentHours: 10 , isActing: true},
  { name: 'Написание unit-тестов', project: 'QA и тестирование', startDate: '2026-10-08', endDate: '2026-10-20', planedHours: 20, currentHours: 5 , isActing: true},
  { name: 'Интеграция платёжной системы', project: 'Backend система', startDate: '2026-10-10', endDate: '2026-10-25', planedHours: 32, currentHours: 12 , isActing: true},
  { name: 'Дизайн мобильного приложения', project: 'UX/UI дизайн', startDate: '2026-09-28', endDate: '2026-10-08', planedHours: 40, currentHours: 38 , isActing: true},
  { name: 'Рефакторинг модуля отчётов', project: 'Frontend', startDate: '2026-10-12', endDate: '2026-10-18', planedHours: 12, currentHours: 4 , isActing: false},
  { name: 'Настройка CI/CD', project: 'DevOps', startDate: '2026-10-03', endDate: '2026-10-10', planedHours: 8, currentHours: 8 , isActing: false},
  { name: 'Документация API Swagger', project: 'Backend система', startDate: '2026-10-14', endDate: '2026-10-20', planedHours: 10, currentHours: 2 , isActing: false},
  { name: 'Оптимизация запросов к БД', project: 'Backend система', startDate: '2026-10-09', endDate: '2026-10-16', planedHours: 14, currentHours: 9 , isActing: false},
  { name: 'Собеседование кандидатов', project: 'Управление командой', startDate: '2026-10-07', endDate: '2026-10-09', planedHours: 6, currentHours: 4 , isActing: false}
];