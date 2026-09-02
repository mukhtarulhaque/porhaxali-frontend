import React, {useState, useEffect, useRef, useContext} from "react";
import { useNavigate,Link } from "react-router-dom";
import UseAuth from "../../Hooks/UseAuth";
//import AuthContext from "../../context/AuthProvider";
import { LOGOUT } from "../../../api/Urls";
import Axios from "../../../api/Axios";
import {BellPlus, GraduationCap} from 'lucide-react';
import SearchBox from "./SearchBox";
import { BarLoader } from "react-spinners";
import NotificationBell from "./NotificationBell";
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);
    const avatarDropDownRef = useRef(null);
    const { auth } = UseAuth();
    //const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(()=> {
        const handleClickOutsideAvatarDropDown = (event) => {
            if(avatarDropDownRef.current && !avatarDropDownRef.current.contains(event.target)) {
                setIsAvatarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideAvatarDropDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideAvatarDropDown);
        };
    },[]);
    const logout = async () => {
      setIsLoading(true);
      try {
        const response = await Axios.post(
          LOGOUT, 
          {}, // 2nd parameter: request body
          {
            headers: {
              'Authorization': `Bearer ${auth.jwtToken}`, // Ensure space after Bearer
              'Accept': 'application/json'
            }
          } // 3rd parameter: config
        );
        console.log('Logged out successfully', response.data);
        if(response.data.success) {
          setIsLoading(false);
          navigate('/');
        }
      } catch (error) {
        console.error('Logout failed', error.response?.status);
        setIsLoading(false);
      }         
    }
   
    return(
        <>
        {isLoading ? 
            <div className="flex items-center justify-center h-screen">
                <BarLoader 
                    color="#36d7b7" 
                    loading={isLoading} 
                    width={200}
                    aria-label="Loading Bar"
                />
        </div> : 
            <nav className="bg-white font-montserrat shadow-md w-full sticky top-0 z-50">
                <div className="max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo Section */}
                        <div className="shrink-0 flex items-center gap-2 ">
                          <GraduationCap className="h-8 w-8 -ml-3.5 text-[rgba(244,87,128)]" />
                          <span className="text-2xl font-bold tracking-tight text-gray-800">Porhaxali</span>
                        </div>
                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center w-[80%]">
                        {/* {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-gray-600 hover:text-[rgba(244,87,128)] font-medium transition duration-200"
                            >
                                {link.name}
                            </a>
                        ))} */}
                        {/* Avatar / Profile Dropdown */}
                        <div className="w-full -ml-5">
                          <span className="text-sm font-medium text-gray-500">Welcome back,</span>
                          <span className="text-sm font-semibold text-gray-800">&nbsp;{auth.userName} 👋</span> 
                        </div>
                        <div className="w-full -ml-10">
                          <SearchBox/>
                        </div>
                        <NotificationBell/>
                        {/* <div className=" bg-stone-200 p-2 rounded-4xl hover:cursor-pointer hover:bg-slate-800  text-stone-800 hover:text-blue-400">
                          <BellPlus className="h-5 w-5"/>
                          <span className="absolute top-5 right-30 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                            
                          </span>
                        </div> */}
                        <div ref={avatarDropDownRef} className="ml-3">
                            <button
                                type="button"
                                className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(244,87,128)] focus:ring-offset-2 duration-150"
                                onClick={() => setIsAvatarOpen(!isOpen)}
                            >
                                <span className="sr-only">Open user menu</span>
                                    <img
                                    className="h-10 w-20 rounded-4xl object-cover border border-gray-300 hover:cursor-pointer"
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
                                    alt="User Avatar"
                                    />
                            </button>
                            {/* Dropdown Menu */}
                            {isAvatarOpen && (
                            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-gray-200 ring-opacity-5 focus:outline-none dark:bg-gray-800">
                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{auth.userName}</p>
                                    <p className="text-xs text-gray-500 truncate dark:text-gray-400">{auth.userEmail}</p>
                                </div>
                                <Link className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">Your Profile</Link>
                                <Link className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">Settings</Link>
                                <hr className="border-gray-100 dark:border-gray-700" />
                                <Link className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={logout}>Sign out</Link>
                            </div>
                            )}
                        </div>
                    </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-gray-600 hover:text-pink-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-100 shadow-inner duration-200`}>
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 duration-200">
          {/* {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition duration-150"
            >
              {link.name}
            </a>
          ))} */}
          <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2 px-3">
            <button className="w-full text-center text-gray-600 hover:text-pink-600 font-medium py-2">
              Login
            </button>
            <button className="w-full text-center bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 rounded-md transition duration-150">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>}
        </>
    );
}

export default Navbar;