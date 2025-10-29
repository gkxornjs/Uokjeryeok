
// frontend/types/records.ts
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  assigned? : string; // or assignedDay?: string; ← 프로젝트에 맞춰 사용
};

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
  order: number;
};

export type Habit = {
  id: string;
  text: string;
  completed: boolean;
};

export type TimeBlock = {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  color?: string;     // ⬅︎ 여기 **optional** 로 두면 로딩 시 값 없을 때도 OK
  day?: number;       // 일간에서는 안 써도 되니 optional
};

export type RecordContent = {
  dailyMotto?: string;                                        // ⬅︎ 정확한 키
  quickNotes?: { id: string; text: string; timestamp: string }[];
  timeBlocks?: TimeBlock[];
  checklist?: ChecklistItem[];
  habits?: Habit[];
  diary?: string;
  praise?: string;
  reflection?: string;
  inspiration?: string;
};

export type DailyRecord = {
  id: string;
  userId: string;
  date: string;             // ISO
  content: AnyContent | null;
  createdAt: string;
  updatedAt: string;
};

// Weekly
export type WeeklyContent = {
  goals: { id:string; title:string; theme:string; order:number }[];
  timeBlocks: TimeBlock[];
  quickMemos: string[];
  todos: { id:string; title:string; completed:boolean; assignedDay?: string }[];
  feedback: { evaluation:string; praise:string; criticism:string; insights:string };
};

// Monthly
export type MonthlyContent = {
  monthlyMotto: string;
  goals: { id:string; title:string; theme:string; order:number }[];
  quickMemos: string[];
  todos: { id:string; title:string; completed:boolean; assignedDay?: string }[];
  areaGoals: { id:string; title:string; completed:boolean; category:string }[];
  feedback: { evaluation:string; praise:string; criticism:string; insights:string };
};

// Yearly
export type YearlyContent = {
  yearlyMotto: string;
  goals: { id:string; title:string; theme:string; order:number }[];
  quickMemos: string[];
  todos: { id:string; title:string; completed:boolean; assignedDay?: string }[];
  areaGoals: { id:string; title:string; completed:boolean; category:string }[];
  feedback: { evaluation:string; praise:string; criticism:string; insights:string };
};
export type AnyContent = RecordContent | WeeklyContent | MonthlyContent | YearlyContent;

// ✅ 백엔드에서 돌아오는 레코드 응답 타입
export function isDailyContent(v: AnyContent | null | unknown): v is RecordContent {
  if (!v || typeof v !== 'object') return false;
  const o = v as RecordContent;
  // 일간 전용 키들 중 몇 개라도 맞으면 true (필요시 더 엄격히)
  if (o.dailyMotto !== undefined) return true;
  if (Array.isArray(o.timeBlocks) || Array.isArray(o.checklist) || Array.isArray(o.habits)) return true;
  return false;
}