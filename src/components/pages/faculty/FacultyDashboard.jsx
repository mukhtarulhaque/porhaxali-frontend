import React from "react";
import Sidebar from "../student/Sidebar";
import { facultyTabs } from "../commom/CommonArrays";

const FacultyDashboard = () => {
return(
    <>
        <div className="min-h-screen  font-montserrat bg-gray-50  text-gray-800 flex">
            <Sidebar pageId="Dashboard" tabs={facultyTabs}/>
            <div className="w-full transition-transform duration-300 ease-in-out">
                Hi all
            </div>
        </div>
            
    </>
        
);

}

export default FacultyDashboard;