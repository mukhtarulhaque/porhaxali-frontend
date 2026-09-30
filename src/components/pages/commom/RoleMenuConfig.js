const staticRoleMenuConfig = {
  ADMIN: [
    { label: 'Dashboard', path: '/adminDashboard' },
  ],
  STUDENT: [
    { label: 'Student Profile', path: '/profileSetting' },
    { label: 'Dashboard', path: '/dashboard' },
  ],
  PARENT: [],
  INSTRUCTOR: [
    { label: 'Dashboard', path: '/facultyDashboard' },
  ],
};

export const getRoleMenuItems = (role, applicantNavigation = {}) => {
  if (role === 'INSTRUCTOR_APPLICANT') {
    const items = applicantNavigation.path && applicantNavigation.label
      ? [{ label: applicantNavigation.label, path: applicantNavigation.path }]
      : [];

    if (applicantNavigation.showDocuments) {
      items.push({ label: 'Documents', path: '/completeFacultyApplication/documents' });
    }

    return items;
  }

  return staticRoleMenuConfig[role] ?? [];
};
