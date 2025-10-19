// js/types.d.ts
// JSDoc/TypeScript style type definitions to aid IDE intellisense.

/** Organizational node representing a hierarchy level */
export interface OrgNode {
  id: string;
  type: 'university' | 'school' | 'cohort' | 'major' | 'course';
  name: string;
  parentId: string | null;
}

/** Employee entity */
export interface Employee {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'probation' | 'onleave' | 'resigned' | string; // allow future extension
  orgId: string | null;
}

/** Teaching module linked to a course */
export interface ModuleItem {
  id: string;
  code?: string;
  name: string;
  credits?: number;
  theoryCredits?: number;
  practiceCredits?: number;
  prerequisites?: string[];
  corequisites?: string[];
  previousCourses?: string[];
  departmentId?: string | null;
  courseId: string; // references OrgNode with type = 'course'
}

/** UI state persisted in localStorage */
export interface UIState {
  selectedOrgId?: string | null;
  selectedOrgType?: OrgNode['type'] | null;
  orgSearch?: string;
  empSearch?: string;
  empStatusFilter?: string; // 'all' | 'active' | ...
  sortBy?: 'name' | 'title' | 'status';
  moduleSearch?: string;
}

/** Root persisted application state */
export interface AppState {
  orgs: OrgNode[];
  employees: Employee[];
  modules: ModuleItem[];
  ui: UIState;
}

// These types are for tooling only and not imported at runtime.
export {};