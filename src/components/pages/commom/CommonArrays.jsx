import { 
    BookOpen, 
    Calendar,  
    ClipboardCheck,
    LayoutDashboard,  
    MessageSquare, 
    User, 
  } from 'lucide-react';
const studentTabs = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, path:'/dashboard' },
    { id: 'BrowseCourses', label: 'Browse Courses', icon: BookOpen, path:'/courses'},
    { id: 'LiveSessions', label: 'Live Sessions', icon: Calendar, path:'/liveSessions'},
    { id: 'Notes', label: 'Notes', icon: MessageSquare, path:'/notes' },
    { id: 'ProfileSettings', label: 'Student Profile', icon: User, path:'/profileSetting'}
  ];
const adminTabs = [
    { id: "adminDashboard", label: "Overview System", icon: LayoutDashboard, path:'/adminDashboard'},
    { id: 'allCourses', label: 'All Courses', icon: BookOpen, path:'/allCourses'},
    { id: 'allStudents', label: 'All Students', icon: User, path:'/allStudents'},
    { id: 'instructorApplications', label: 'Instructor Applications', icon: ClipboardCheck, path:'/admin/instructor-applications'},
    { id: 'allTeachers', label: 'All Teachers', icon: User, path:'/allTeachers'},
  ]
  const facultyTabs = [
    { id: "facultyDashboard", label: "Overview System", icon: LayoutDashboard, path:'/facultyDashboard'},
    { id: 'facultyCourses', label: 'Your Courses', icon: BookOpen, path:'/allCoursesByFaculty'},
    { id: 'batches', label: 'Your Batches', icon: User, path:'/allBatches'},
  ]

export {
    studentTabs, adminTabs, facultyTabs
}
