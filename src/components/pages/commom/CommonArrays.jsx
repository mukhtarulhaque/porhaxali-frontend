import { 
    BookOpen, 
    Calendar,  
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
    { id: 'allTeachers', label: 'All Teachers', icon: User, path:'/allTeachers'},
  ]

export {
    studentTabs, adminTabs,
}
