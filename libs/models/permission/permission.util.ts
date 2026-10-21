export const PERMISSION_ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'] as const;

const READ_ACTIONS = ['READ', 'VIEW', 'GET', 'LIST'];

export function permissionModule(name: string): string {
  const i = name.lastIndexOf('_');
  return i > 0 ? name.slice(0, i) : 'OTHER';
}

export function permissionAction(name: string): string {
  const i = name.lastIndexOf('_');
  return i > 0 ? name.slice(i + 1) : '';
}

export function isReadAction(name: string): boolean {
  return READ_ACTIONS.includes(permissionAction(name).toUpperCase());
}

export function actionBadge(action: string): string {
  switch (action.toUpperCase()) {
    case 'READ':
    case 'VIEW':
    case 'GET':
    case 'LIST':
      return 'bg-sky-50 text-sky-700 ring-sky-200';
    case 'CREATE':
    case 'ADD':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'UPDATE':
    case 'EDIT':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'DELETE':
    case 'REMOVE':
      return 'bg-rose-50 text-rose-700 ring-rose-200';
    case 'MANAGE':
      return 'bg-violet-50 text-violet-700 ring-violet-200';
    default:
      return 'bg-slate-50 text-slate-600 ring-slate-200';
  }
}
