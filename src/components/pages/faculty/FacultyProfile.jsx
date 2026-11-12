import React ,{useState, useEffect} from "react";
import Sidebar from "../student/Sidebar";
import { facultyTabs } from "../commom/CommonArrays";
import {
    Camera,
    Mail,
    Phone,
    Building,
    GraduationCap,
    BookOpen,
    Award,
    Edit3,
    Check,
    X,
    Plus,
  } from "lucide-react";
import {GET_INSTRUCTOR_PROFILE_PHOTO_URL, GET_LOGIN_INSTRUCTOR} from '../../../api/Urls';
import UseAuth from "../../Hooks/UseAuth";
import Axios from '../../../api/Axios';

const FacultyProfile = () => {
    const {auth} = UseAuth(); 
    const [instructorPhotoUrl, setInstructorPhotoUrl] = useState(null);
    const [instructorDetails, setInstructorDetails] = useState([]);
    useEffect(()=>{
        const getInstructorPhotoUrl = async() => {
            try{
                await Axios.get(GET_INSTRUCTOR_PROFILE_PHOTO_URL,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.jwtToken}`, // Ensure space after Bearer
                        'Accept': 'application/json'
                    }
                }
                )
                .then(function (response) {
                    setInstructorPhotoUrl(response.data.data.url);
                   //console.log(response.data.data);
                })
            } catch (error){
                console.log(error);
                
            }
        };
        getInstructorPhotoUrl();
    },[]);
    useEffect(()=>{
        const getInstructorById = async() => {
            try{
                await Axios.get(GET_LOGIN_INSTRUCTOR,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.jwtToken}`, // Ensure space after Bearer
                        'Accept': 'application/json'
                    }
                }
                )
                .then(function (response) {
                   //console.log(response.data.data);
                   setInstructorDetails(response.data.data);
                })
            } catch (error){
                console.log(error);
                
            }
        };
        getInstructorById();
    },[]);
    const [isEditing, setIsEditing] = useState(false);

  // Initial faculty profile state
  const initialData = {
    name: "Dr. Sarah Connor",
    title: "Professor & Associate Dean",
    department: "Department of Computer Science & Engineering",
    institution: "Porhaxali Institute of Technology",
    email: "sarah.connor@porhaxali.edu",
    phone: "+1 (555) 234-5678",
    office: "Room 408, Alan Turing Block",
    bio: "Dr. Sarah Connor has over 14 years of research and teaching experience specializing in Distributed Systems and Artificial Intelligence. She leads the Autonomous Systems Research Lab and has authored over 45 peer-reviewed publications.",
    researchInterests: [
      "Distributed Computing",
      "Federated Learning",
      "Explainable AI (XAI)",
      "High-Performance Computing",
    ],
    education: [
      {
        degree: "Ph.D. in Computer Science",
        institution: "Stanford University",
        year: "2012",
      },
      {
        degree: "M.S. in Software Engineering",
        institution: "Carnegie Mellon University",
        year: "2008",
      },
      {
        degree: "B.Tech in Computer Engineering",
        institution: "MIT",
        year: "2006",
      },
    ],
  };

  const [profile, setProfile] = useState(initialData);
  const [formData, setFormData] = useState(initialData);
  const [newInterest, setNewInterest] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.researchInterests.includes(newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        researchInterests: [...prev.researchInterests, newInterest.trim()],
      }));
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (tag) => {
    setFormData((prev) => ({
      ...prev,
      researchInterests: prev.researchInterests.filter((item) => item !== tag),
    }));
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };
    return(
        <>
        <div className="min-h-screen  font-montserrat bg-gray-50  text-gray-800 flex">
            <Sidebar pageId="facultyProfile" tabs={facultyTabs}/>
            <div className="w-full transition-transform duration-300 ease-in-out p-4">
            
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Faculty Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your academic credentials, office hours, and public directory details.
          </p>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-4">
        {/* Decorative Institutional Header Band */}
        <div className="h-28 sm:h-36 bg-linear-to-r from-indigo-100 via-indigo-50 to-slate-100" />

        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-16 gap-4 mb-6">
            {/* Avatar with Optional Upload */}
            <div className="relative group self-start">
              <img
                //src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&crop=face"
                src={instructorPhotoUrl}
                alt={profile.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
              />
              {isEditing && (
                <button
                  type="button"
                  className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white text-xs font-medium opacity-90 hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  Change
                </button>
              )}
            </div>

            {/* Quick Status Tag */}
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Faculty • Fall 2026
              </span>
            </div>
          </div>

          {/* Primary Name & Designation */}
          <div className="space-y-3">
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Full Name & Title
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {instructorDetails.displayName}
                </h1>
                <p className="text-sm sm:text-base font-semibold text-indigo-600 mt-0.5">
                  {profile.title}
                </p>
                <p className="text-sm sm:text-base text-slate-900 mt-0.5">
                  Total teaching experience {instructorDetails.teachingExperienceYears} years
                </p>
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  {profile.department} • {profile.institution}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Layout: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Office Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Contact Details
            </h3>

            <div className="space-y-4 text-sm">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Institutional Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <a
                    href={`mailto:${instructorDetails.email}`}
                    className="flex text-slate-800 font-medium hover:text-indigo-600 transition-colors truncate"
                  >
                    <Mail size={14} className="mt-1 mr-1 text-blue-800"/>{instructorDetails.email}
                  </a>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Direct Line / Phone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-slate-800 font-medium flex"><Phone size={14} className="mt-1 mr-1 text-blue-800"/>{instructorDetails.phoneNumber}</p>
                )}
              </div>

              {/* Office Location */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Office Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.office}
                    onChange={(e) => handleInputChange("office", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-slate-800 font-medium">{profile.office}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Academic Footprint
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-2 border-indigo-500 pl-3">
                <span className="text-2xl font-extrabold text-white">48</span>
                <p className="text-xs text-slate-400 mt-0.5">Publications</p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-3">
                <span className="text-2xl font-extrabold text-white">1,820</span>
                <p className="text-xs text-slate-400 mt-0.5">Citations</p>
              </div>
              <div className="border-l-2 border-amber-500 pl-3">
                <span className="text-2xl font-extrabold text-white">18</span>
                <p className="text-xs text-slate-400 mt-0.5">h-index</p>
              </div>
              <div className="border-l-2 border-purple-500 pl-3">
                <span className="text-2xl font-extrabold text-white">6</span>
                <p className="text-xs text-slate-400 mt-0.5">Ph.D. Advisees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bio, Research Areas, Education */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biography */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Biography & Summary
            </h3>
            {isEditing ? (
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-normal"
              />
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed">{instructorDetails.bio}</p>
            )}
          </div>

          {/* Research Interests */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Research & Specialization
            </h3>

            <div className="flex flex-wrap gap-2">
              {(isEditing ? formData.researchInterests : profile.researchInterests).map(
                (interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {interest}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="text-indigo-400 hover:text-indigo-700 focus:outline-none"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                )
              )}
            </div>

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add new research domain..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInterest())}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Education & Credentials */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Academic Degrees & Education
            </h3>

            <div className="space-y-4 divide-y divide-slate-100">
              {/* {profile.education.map((edu, index) => (
                <div key={index} className={index !== 0 ? "pt-4" : ""}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-semibold text-slate-900">{edu.degree}</h4>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start sm:self-auto">
                      {edu.year}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{edu.institution}</p>
                </div>
              ))} */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-semibold text-slate-900">{instructorDetails.qualificationSummary}</h4>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start sm:self-auto">
                      2014
                    </span>
                  </div>
            </div>
          </div>
        </div>
      </div>
    
  
           </div>
        </div>



        </>
    );
}

export default FacultyProfile;

