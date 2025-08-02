import { Container, CustomNavLinkList } from "./Design"
import { IoSearchOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const menuRef = useRef(null);
    const profileMenuRef = useRef(null);
  
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };
  
    const closeMenuOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false);
        }
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
            setIsProfileMenuOpen(false);
        }
    };
  
    useEffect(() => {
        document.addEventListener("mousedown", closeMenuOutside);
        return () => {
            document.removeEventListener("mousedown", closeMenuOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="header bg-gradient-to-r from-blue-200 via-blue-100 to-blue-300 py-4 fixed w-full top-0 z-50 shadow-md rounded-b-3xl overflow-hidden">
            {/* Decorative SVG/shape top right */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-20 z-0">
                {/* Add a playful SVG wave or icon here */}
                {/* Example: <img src="/images/decor/wave-header.svg" alt="decor" /> */}
            </div>
            <Container>
                <nav className="flex justify-between items-center relative">
                    <div className="flex items-center gap-14">
                        <Link to="/" className="text-white text-2xl font-bold">
                            HolidayPackages
                        </Link>

                        <div className="hidden lg:flex items-center justify-between gap-8">
                            <CustomNavLinkList href="/" isActive={location.pathname === "/"} className="text-white">
                                Home
                            </CustomNavLinkList>
                            <CustomNavLinkList href="/packages" isActive={location.pathname === "/packages"} className="text-white">
                                Packages
                            </CustomNavLinkList>
                            <CustomNavLinkList href="/map" isActive={location.pathname === "/map"} className="text-white">
                                Map
                            </CustomNavLinkList>
                            <CustomNavLinkList href="/destinations" isActive={location.pathname === "/destinations"} className="text-white">
                                Destinations
                            </CustomNavLinkList>
                            <CustomNavLinkList href="/scraper-tools" isActive={location.pathname === "/scraper-tools"} className="text-white">
                                Scraper Tools
                            </CustomNavLinkList>
                            <CustomNavLinkList href="/about" isActive={location.pathname === "/about"} className="text-white">
                                About
                            </CustomNavLinkList>
                            <CustomNavLinkList href="/contact" isActive={location.pathname === "/contact"} className="text-white">
                                Contact
                            </CustomNavLinkList>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={toggleProfileMenu}
                                    className="flex items-center space-x-2 bg-primary-dark rounded-full p-1 hover:bg-primary-darker focus:outline-none"
                                >
                                    <img
                                        className="h-8 w-8 rounded-full object-cover"
                                        src={user.photo || '/default-avatar.png'}
                                        alt={user.name}
                                    />
                                    <span className="text-white text-sm px-2">{user.name}</span>
                                </button>
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            Your Profile
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin/users"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                User Management
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-white hover:bg-primary-dark px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-white text-primary hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Join
                                </Link>
                            </>
                        )}

                        <button onClick={toggleMenu} className="lg:hidden w-10 h-10 flex justify-center items-center bg-primary-dark text-white focus:outline-none rounded">
                            {isOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
                        </button>
                    </div>
                </nav>

                {/* Mobile menu */}
                {isOpen && (
                    <div ref={menuRef} className="lg:hidden mt-4 py-2 bg-primary-dark rounded-lg">
                        <Link to="/" className="block px-4 py-2 text-white hover:bg-primary">Home</Link>
                        <Link to="/packages" className="block px-4 py-2 text-white hover:bg-primary">Packages</Link>
                        <Link to="/map" className="block px-4 py-2 text-white hover:bg-primary">Map</Link>
                        <Link to="/destinations" className="block px-4 py-2 text-white hover:bg-primary">Destinations</Link>
                        <Link to="/scraper-tools" className="block px-4 py-2 text-white hover:bg-primary">Scraper Tools</Link>
                        <Link to="/about" className="block px-4 py-2 text-white hover:bg-primary">About</Link>
                        <Link to="/contact" className="block px-4 py-2 text-white hover:bg-primary">Contact</Link>
                    </div>
                )}
            </Container>
        </header>
    );
};