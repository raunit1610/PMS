import React, { useState, useEffect } from "react";
import '../Styles/Profile.css';
import '../../Home/Styles/Home.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from "../../Home/Pages/Header";

function Profile(props) {
    const [activeTab, setActiveTab] = useState('about');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [formData, setFormData] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const status = (() => {
        // Get today's day of week (0=Sunday, 6=Saturday)
        const today = new Date();
        const day = today.getDay();
        if (day === 0 || day === 6) {
            return "Weekend";
        }
        return "Weekday";
    })();
    // Sample user data - replace with actual data from props or API
    const [userData, setUserData] = useState({
        // Personal Information
        name: "",
        displayName: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        bloodGroup: "",
        physicallyChallenged: "",
        emailPersonal: "",
        phone: "",
        phoneSecondary: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        profilePhoto: "",

        //Professional Details
        designation: "",
        businessUnit: "",
        department: "",
        workStation: "",
        reportingTo: "",
        employeeId: "",
        emailProfessional: "",
        dateOfJoining: "",
        degree: "",
        institution: "",
        year: "",
        percentage: "",
        paddress1: "",
        paddress2: "",
        pcity: "",
        pstate: "",
        pzipCode: "",
        pcountry: "",
    });
    const [profilePhoto, setProfilePhoto] = useState('');
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Check screen size and close sidebar when clicking outside on mobile
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Use a properly-scoped useEffect to avoid infinite loops and potential errors.
    useEffect(() => {
        // Safely read user name from localStorage once after mount
        try {
            const storedName = localStorage.getItem('userName') || '';
            const storedId = localStorage.getItem('userId') || '';
            setUserName(storedName);
            setUserId(storedId);
        } catch (error) {
            // Optionally handle localStorage access errors here
            setUserName('');
            setUserId('');
        }
    }, []);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    useEffect(() => {
        // Use an async function inside useEffect since await isn't allowed at the top level
        const fetchProfile = async () => {
            try {
                // Pass userId as a route parameter so backend can access via req.params
                const storedId = localStorage.getItem('userId');
                if (!storedId) {
                    console.error('No userId found in localStorage');
                    return;
                }
                const response = await axios.get(`${API_BASE_URL}/auth/profile/${storedId}`);
                // Check correct data path; assume API returns { profile: {...}, uid: "..." }
                if (response.data && response.data.profile) {
                    const profile = response.data.profile;
                    setUserData({
                        // Personal Information
                        name: profile.name,
                        displayName: profile.name,
                        dateOfBirth: profile.dateOfBirth,
                        gender: profile.gender,
                        maritalStatus: profile.maritalStatus,
                        bloodGroup: profile.bloodGroup,
                        physicallyChallenged: profile.physicallyChallenged,
                        emailPersonal: profile.email,
                        phone: profile.phone,
                        phoneSecondary: profile.phoneSecondary,
                        address1: profile.address1,
                        address2: profile.address2,
                        city: profile.city,
                        state: profile.state,
                        zipCode: profile.zipCode,
                        country: profile.country,
                        profilePhoto: profile.profilePhoto || '',

                        // Professional Details
                        designation: profile.designation,
                        businessUnit: profile.businessUnit,
                        department: profile.department,
                        workStation: profile.workStation,
                        reportingTo: profile.reportingTo,
                        employeeId: profile.employeeId,
                        emailProfessional: profile.emailProfessional,
                        dateOfJoining: profile.dateOfJoining,
                        degree: profile.degree,
                        institution: profile.institution,
                        year: profile.year,
                        percentage: profile.percentage,
                        paddress1: profile.paddress1,
                        paddress2: profile.paddress2,
                        pcity: profile.pcity,
                        pstate: profile.pstate,
                        pzipCode: profile.pzipCode,
                        pcountry: profile.pcountry,
                    });
                    if (profile.profilePhoto) {
                        setProfilePhoto(profile.profilePhoto);
                    }
                }
            } catch (err) {
                // Use 'data?.message' for error, fallback if needed
                console.error('Data Fetch error:', err);
            }
        };
        fetchProfile();
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    

    const handleEditClick = (type, initialData = {}) => {
        setModalType(type);
        setFormData(initialData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalType(null);
        setFormData({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setIsUploadingPhoto(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                try {
                    const storedId = localStorage.getItem('userId');
                    if (!storedId) {
                        alert('User ID not found');
                        return;
                    }
                    const response = await axios.post(`${API_BASE_URL}/auth/profile`, {
                        Id: storedId,
                        profilePhoto: base64String
                    });
                    
                    if (response.status === 200) {
                        setProfilePhoto(base64String);
                        setUserData(prev => ({ ...prev, profilePhoto: base64String }));
                        alert('Profile photo updated successfully!');
                    }
                } catch (err) {
                    console.error('Error uploading photo:', err);
                    alert('Failed to upload profile photo. Please try again.');
                } finally {
                    setIsUploadingPhoto(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading image file');
            setIsUploadingPhoto(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Here you would typically save the data to your backend
        
        try {
            const storedId = localStorage.getItem('userId');
            if (!storedId) {
                console.error('No userId found in localStorage');
                return;
            }
            const obj = { ...formData, Id: storedId };
            const response = await axios.post(`${API_BASE_URL}/auth/profile`, obj);
            
            if (response.status == 200) {
                setUserData(prev => ({ ...prev, ...formData }));
                alert('Profile updated successfully!');
            } else {
                console.error('Failed to update profile', response);
            }
        } catch (err) {
            console.error('Data Upload error:', err);
            alert('Failed to update profile. Please try again.');
        } 
        // Update userData state or make API call
        handleCloseModal();
    };

    const renderModalForm = () => {
        if (!isModalOpen) return null;

        const getFormFields = () => {
            switch(modalType) {
                case 'personal':
                    return [
                        { name: 'name', label: 'Name', type: 'text', value: userData.name },
                        { name: 'displayName', label: 'Display Name', type: 'text', value: userData.displayName },
                        { name: 'dateOfBirth', label: 'Date of Birth', type: 'text', value: userData.dateOfBirth },
                        { name: 'gender', label: 'Gender', type: 'select', value: userData.gender, options: ['Male', 'Female', 'Other'] },
                        { name: 'maritalStatus', label: 'Marital Status', type: 'select', value: userData.maritalStatus, options: ['Single', 'Married', 'Divorced', 'Widowed'] },
                        { name: 'bloodGroup', label: 'Blood Group', type: 'text', value: userData.bloodGroup },
                        { name: 'physicallyChallenged', label: 'Physically Challenged', type: 'select', value: userData.physicallyChallenged, options: ['Yes', 'No'] },
                        { name: 'emailPersonal', label: 'Personal Email', type: 'email', value: userData.emailPersonal },
                        { name: 'phone', label: 'Phone Number', type: 'tel', value: userData.phone },
                        { name: 'phoneSecondary', label: 'Secondary Phone', type: 'tel', value: userData.phoneSecondary || '' },
                        { name: 'address1', label: 'Address Line 1', type: 'text', value: userData.address1 || '' },
                        { name: 'address2', label: 'Address Line 2', type: 'text', value: userData.address2 || '' },
                        { name: 'city', label: 'City', type: 'text', value: userData.city || '' },
                        { name: 'state', label: 'State', type: 'text', value: userData.state || '' },
                        { name: 'zipCode', label: 'Zip Code', type: 'text', value: userData.zipCode || '' },
                        { name: 'country', label: 'Country', type: 'text', value: userData.country || '' }
                    ];
                case 'professional':
                    return [
                        { name: 'designation', label: 'Designation', type: 'text', value: userData.designation },
                        { name: 'businessUnit', label: 'Business Unit', type: 'text', value: userData.businessUnit },
                        { name: 'department', label: 'Department', type: 'text', value: userData.department },
                        { name: 'workStation', label: 'Work Station', type: 'text', value: userData.workStation },
                        { name: 'reportingTo', label: 'Reporting To', type: 'text', value: userData.reportingTo },
                        { name: 'employeeId', label: 'Employee ID', type: 'text', value: userData.employeeId },
                        { name: 'emailProfessional', label: 'Professional Email', type: 'email', value: userData.emailProfessional || '' },
                        { name: 'dateOfJoining', label: 'Date of Joining', type: 'text', value: userData.dateOfJoining },
                        { name: 'degree', label: 'Recent Degree', type: 'text', value: userData.degree || '' },
                        { name: 'institution', label: 'Recent Institution', type: 'text', value: userData.institution || '' },
                        { name: 'year', label: 'Passing Year', type: 'text', value: userData.year || '' },
                        { name: 'percentage', label: 'Percentage/CGPA', type: 'text', value: userData.percentage || '' },
                        { name: 'paddress1', label: 'Address Line 1', type: 'text', value: userData.paddress1 || '' },
                        { name: 'paddress2', label: 'Address Line 2', type: 'text', value: userData.paddress2 || '' },
                        { name: 'pcity', label: 'City', type: 'text', value: userData.pcity || '' },
                        { name: 'pstate', label: 'State', type: 'text', value: userData.pstate || '' },
                        { name: 'pzipCode', label: 'Zip Code', type: 'text', value: userData.pzipCode || '' },
                        { name: 'pcountry', label: 'Country', type: 'text', value: userData.pcountry || '' }
                    ];
                default:
                    return [];
            }
        };

        const fields = getFormFields();
        const getTitle = () => {
            switch(modalType) {
                case 'personal': return 'Edit Personal Information';
                case 'professional': return 'Edit Professional Information';
                default: return 'Edit Details';
            }
        };

        return (
            <div className="modal-overlay" onClick={handleCloseModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">{getTitle()}</h2>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>
                    <form className="modal-form" onSubmit={handleSubmit}>
                        {fields.map((field) => (
                            <div key={field.name} className="form-group">
                                <label className="form-label">{field.label}</label>
                                {field.type === 'select' ? (
                                    <select
                                        name={field.name}
                                        value={formData[field.name] !== undefined ? formData[field.name] : field.value}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    >
                                        {field.options.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        name={field.name}
                                        value={formData[field.name] !== undefined ? formData[field.name] : field.value}
                                        onChange={handleInputChange}
                                        className="form-input form-textarea"
                                        rows="4"
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name] !== undefined ? formData[field.name] : field.value}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                )}
                            </div>
                        ))}
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn-submit">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="profile-container">
            {/* Mobile Menu Toggle Button - Only show on mobile/tablet */}
            {isMobile && (
                <button 
                    className="mobile-menu-toggle" 
                    onClick={toggleSidebar}
                    aria-label="Toggle menu"
                >
                    ☰
                </button>
            )}

            {/* Sidebar Overlay - Only show on mobile/tablet */}
            {isMobile && (
                <div 
                    className={`sidebar ${sidebarOpen ? 'active' : ''}`}
                    onClick={(e) => {
                        // Only close if backdrop (not sidebar) is clicked
                        if (e.target === e.currentTarget) closeSidebar();
                    }}
                    style={{ pointerEvents: sidebarOpen ? 'auto' : 'none' }}
                ></div>
            )}

<div className="home-layout">
                <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-logo">PMS</div>
                    <nav className="sidebar-nav">
                        <Link to={`/feature/home/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">🏠</span>
                            <span className="sidebar-text">Home</span>
                        </Link>
                        <Link to={`/feature/money/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">💰</span>
                            <span className="sidebar-text">Money</span>
                        </Link>
                        <Link to={`/feature/Tasks/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">✅</span>
                            <span className="sidebar-text">Tasks</span>
                        </Link>
                        <Link to={`/feature/Todo/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">📝</span>
                            <span className="sidebar-text">To-Do</span>
                        </Link>
                        <Link to={`/feature/Diary/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">📔</span>
                            <span className="sidebar-text">Diary</span>
                        </Link>
                        <Link to={`/feature/Vault/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">🔐</span>
                            <span className="sidebar-text">Vault</span>
                        </Link>
                    </nav>
                    <div className="sidebar-menu" onClick={closeSidebar}>☰</div>
                </div>


                {/* Main Content Area */}
                <div className="profile-content">
                    {/* Sub Header */}
                    <Header userName={userName} />

                    {/* Banner Background */}
                    <div className="profile-banner"></div>

                    {/* User Summary Card */}
                    <div className="user-summary-card">
                        <div className="profile-picture-large">
                            <div className="profile-photo-container">
                                {profilePhoto ? (
                                    <img src={profilePhoto} alt={userData.name} />
                                ) : (
                                    <div className="profile-photo-placeholder">
                                        {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                                <label className="profile-photo-upload">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        style={{ display: 'none' }}
                                        disabled={isUploadingPhoto}
                                    />
                                    <span className="upload-icon">📷</span>
                                </label>
                            </div>
                        </div>
                        <div className="user-name-section">
                            <h2 className="user-name">{userData.name}</h2>
                        </div>
                        <div className="user-status-badge">
                            {status}
                        </div>

                        <div className="user-org-info">
                            <div className="org-item">
                                <span>{userData.businessUnit}</span>
                            </div>
                            <div className="org-item">
                                <span>{userData.department}</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">✉</span>
                                <span>{userData.emailPersonal}</span>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">📞</span>
                                <span>{userData.phone}</span>
                            </div>
                            <div className="work-item">
                                <span className="work-icon">🎂</span>
                                <span>{userData.dateOfBirth}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="profile-tabs">
                        <button 
                            className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
                            onClick={() => setActiveTab('about')}
                        >
                            About
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'job' ? 'active' : ''}`}
                            onClick={() => setActiveTab('job')}
                        >
                            Job
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'about' && (
                            <div className="about-content">
                                {/* Personal Information */}
                                <div className="info-section">
                                    <div className="section-header">
                                        <h3 className="section-title">Personal Information</h3>
                                        <button className="edit-button" onClick={() => handleEditClick('personal', userData)}>✏️</button>
                                    </div>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-icon">👤</span>
                                            <div className="info-details">
                                                <span className="info-label">Name</span>
                                                <span className="info-value">{userData.name}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">👤</span>
                                            <div className="info-details">
                                                <span className="info-label">Display Name</span>
                                                <span className="info-value">{userData.displayName}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🎂</span>
                                            <div className="info-details">
                                                <span className="info-label">Date of Birth</span>
                                                <span className="info-value">{userData.dateOfBirth}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">♂</span>
                                            <div className="info-details">
                                                <span className="info-label">Gender</span>
                                                <span className="info-value">{userData.gender}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">♿</span>
                                            <div className="info-details">
                                                <span className="info-label">Physically Challenged</span>
                                                <span className="info-value">{userData.physicallyChallenged}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">💍</span>
                                            <div className="info-details">
                                                <span className="info-label">Marital Status</span>
                                                <span className="info-value">{userData.maritalStatus}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🩸</span>
                                            <div className="info-details">
                                                <span className="info-label">Blood Group</span>
                                                <span className="info-value">{userData.bloodGroup}</span>
                                            </div>
                                        </div>
                                        <div className="contact-detail-item">
                                            <span className="contact-detail-icon">✉</span>
                                            <span className="contact-detail-value">{userData.emailPersonal}</span>
                                        </div>
                                        <div className="contact-detail-item">
                                            <span className="contact-detail-icon">📞</span>
                                            <span className="contact-detail-value">{userData.phone}</span>
                                        </div>
                                        <div className="contact-detail-item disabled">
                                            <span className="contact-detail-icon">📞</span>
                                            <span className="contact-detail-value">{userData.phoneSecondary}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">Address Line 1</span>
                                                <span className="info-value">{userData.address1}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">Address Line 2</span>
                                                <span className="info-value">{userData.address2}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">City</span>
                                                <span className="info-value">{userData.city}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">State</span>
                                                <span className="info-value">{userData.state}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">Zip Code</span>
                                                <span className="info-value">{userData.zipCode}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">Country</span>
                                                <span className="info-value">{userData.country}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'job' && (
                            <div className="job-content">
                                <div className="info-section">
                                    <div className="section-header">
                                        <h3 className="section-title">Job Information</h3>
                                        <button className="edit-button" onClick={() => handleEditClick('professional', userData)}>✏️</button>
                                    </div>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-icon">💼</span>
                                            <div className="info-details">
                                                <span className="info-label">Designation</span>
                                                <span className="info-value">{userData.designation}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏢</span>
                                            <div className="info-details">
                                                <span className="info-label">Business Unit</span>
                                                <span className="info-value">{userData.businessUnit}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">📁</span>
                                            <div className="info-details">
                                                <span className="info-label">Department</span>
                                                <span className="info-value">{userData.department}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">📍</span>
                                            <div className="info-details">
                                                <span className="info-label">Work Station</span>
                                                <span className="info-value">{userData.workStation}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">👤</span>
                                            <div className="info-details">
                                                <span className="info-label">Reporting To</span>
                                                <span className="info-value">{userData.reportingTo}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🆔</span>
                                            <div className="info-details">
                                                <span className="info-label">Employee ID</span>
                                                <span className="info-value">{userData.employeeId}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">📅</span>
                                            <div className="info-details">
                                                <span className="info-label">Date of Joining</span>
                                                <span className="info-value">{userData.dateOfJoining}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🎓</span>
                                            <div className="info-details">
                                                <span className="info-label">Recent Degree</span>
                                                <span className="info-value">{userData.degree}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏫</span>
                                            <div className="info-details">
                                                <span className="info-label">Recent Institution</span>
                                                <span className="info-value">{userData.institution}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🎓</span>
                                            <div className="info-details">
                                                <span className="info-label">Passing Year</span>
                                                <span className="info-value">{userData.year}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🎓</span>
                                            <div className="info-details">
                                                <span className="info-label">Percentage/CGPA</span>
                                                <span className="info-value">{userData.percentage}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">Address Line 1</span>
                                                <span className="info-value">{userData.paddress1}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">Address Line 2</span>
                                                <span className="info-value">{userData.paddress2}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">City</span>
                                                <span className="info-value">{userData.pcity}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">State</span>
                                                <span className="info-value">{userData.pstate}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">Zip Code</span>
                                                <span className="info-value">{userData.pzipCode}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-icon">🏠</span>
                                            <div className="info-details">
                                                <span className="info-label">Country</span>
                                                <span className="info-value">{userData.pcountry}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Edit Forms */}
            {renderModalForm()}
        </div>
    );
}

export default Profile;