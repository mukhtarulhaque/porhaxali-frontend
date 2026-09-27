import { useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import { X, Menu } from 'lucide-react';

const Sidebar = ({pageId, tabs}) => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();
    const toggleSidebar = () => setIsOpen(!isOpen);
    
    
    return(<>
        <aside className={`inset-y-0 border transform transition-transition duration-300 ease-in-out left-0 font-montserrat flex flex-col border-r border-gray-200 bg-white px-4 py-6 ${isOpen ? 'w-72' : 'w-16'}`}>
        
            <button 
            onClick={toggleSidebar} 
            type="button"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={isOpen}
            className={`cursor-pointer rounded-lg ${isOpen ? 'p-2': 'p-1 border border-gray-200 shadow-sm'} hover:bg-gray-100 text-gray-500`}
          >
            {isOpen? <X className="w-5 h-5" /> : <Menu className="w-5 h-5"/>}
          </button>
        
                {tabs?.map((tab) => {
                    const isActive = pageId === tab.id || location.pathname === tab.path
                        || (tab.path === '/admin/instructor-applications'
                            && location.pathname.startsWith('/admin/instructor-applications/'));
                    return(
                        <nav key={tab.id} className="w-64">
                        <Link
                            to={tab.path} 
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex items-center hover:bg-pink-200 gap-3 rounded-lg px-4 py-3 text-sm font-medium
                            ${isActive ? 'bg-pink-50 text-pink-700'
                             : 'text-gray-600 bg-white'} ${!isOpen && 'scale-0 opacity-0'}
                             overflow-hidden whitespace-nowrap ease-in-out duration-300`}>
                            <tab.icon className="h-5 w-5"/>{tab.label}
                        </Link>
                        </nav>
                    );   
                })}
                
        {/* <div className="border-t border-gray-100 pt-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut className="h-5 w-5" /> Log Out
          </button>
        </div> */}
      </aside>
      </> 
    );
}
export default Sidebar;
