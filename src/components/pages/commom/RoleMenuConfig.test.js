import { describe, expect, it } from 'vitest';
import { getRoleMenuItems } from './RoleMenuConfig';

describe('getRoleMenuItems', () => {
  it('uses the admin dashboard and no student profile for admins', () => {
    expect(getRoleMenuItems('ADMIN')).toEqual([
      { label: 'Dashboard', path: '/adminDashboard' },
    ]);
  });

  it('preserves the student profile and dashboard navigation', () => {
    expect(getRoleMenuItems('STUDENT')).toEqual([
      { label: 'Student Profile', path: '/profileSetting' },
      { label: 'Dashboard', path: '/dashboard' },
    ]);
  });

  it('uses the existing instructor dashboard', () => {
    expect(getRoleMenuItems('INSTRUCTOR')).toEqual([
      { label: 'Dashboard', path: '/facultyDashboard' },
    ]);
  });

  it('builds instructor applicant navigation without student links', () => {
    expect(getRoleMenuItems('INSTRUCTOR_APPLICANT', {
      label: 'Complete Application',
      path: '/completeFacultyApplication',
      showDocuments: true,
    })).toEqual([
      { label: 'Complete Application', path: '/completeFacultyApplication' },
      { label: 'Documents', path: '/completeFacultyApplication/documents' },
    ]);
  });

  it.each(['PARENT', 'UNKNOWN', undefined])('does not fall back to student navigation for %s', (role) => {
    expect(getRoleMenuItems(role)).toEqual([]);
  });
});
