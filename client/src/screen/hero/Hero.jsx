import { AiOutlinePropertySafety } from "react-icons/ai";
import { Container, Title, Body, PrimaryButton, Caption } from "../../components/common/Design";
import { IoSearchOutline } from "react-icons/io5";
import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdMap } from "react-icons/md";
import SearchBar from '../../components/packages/SearchBar';
import ProductionImage from '../../components/common/ProductionImage';

export const User1 = "https://cdn-icons-png.flaticon.com/128/6997/6997662.png";
export const User2 = "https://cdn-icons-png.flaticon.com/128/236/236832.png";
export const User3 = "https://cdn-icons-png.flaticon.com/128/236/236831.png";
export const User4 = "https://cdn-icons-png.flaticon.com/128/1154/1154448.png";

export const Hero = () => {
    const navigate = useNavigate();

    const handleMapClick = () => {
        navigate('/map');
    };

    // Remove the searchBar from the hero section
    const mapButton = (
        <button 
            onClick={handleMapClick}
            className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-full shadow-lg hover:bg-blue-50 border border-blue-200 transition-colors font-semibold"
        >
            <MdMap size={20} />
            <span>Explore Malaysia Map</span>
        </button>
    );

    return (
        <>
            <section
                className="hero py-20 relative overflow-hidden bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200"
                style={{
                    // Remove old background image for now, use a blank or guide for image placement
                    // backgroundImage: "url('/images/home/beach.jpg')",
                    // backgroundSize: 'cover',
                    // backgroundPosition: 'center',
                }}
            >
                {/* Decorative SVG/shape top left */}
                <div className="absolute top-0 left-0 w-40 h-40 opacity-30 z-0">
                    {/* Add a playful SVG blob or cloud here */}
                    {/* Example: <img src="/images/decor/blob1.svg" alt="decor" /> */}
                </div>
                {/* Decorative SVG/shape bottom right */}
                <div className="absolute bottom-0 right-0 w-56 h-56 opacity-20 z-0">
                    {/* Add a playful SVG wave or cloud here */}
                    {/* Example: <img src="/images/decor/wave1.svg" alt="decor" /> */}
                </div>
                {/* Decorative travel icon (plane, compass, etc.) */}
                <div className="absolute top-10 right-1/3 w-16 h-16 opacity-40 z-0">
                    {/* Add a travel icon SVG here */}
                    {/* Example: <img src="/images/decor/plane.svg" alt="plane" /> */}
                </div>
                <Container>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20 lg:gap-32">
                        {/* Left: Headline, subtext, search, stats */}
                        <div className="flex-1 flex flex-col gap-8 justify-center">
                            <div className="text-blue-900">
                                <Title level={3} className="text-blue-900 font-extrabold drop-shadow-md">
                                    Discover Your Perfect Holiday Package
                                </Title>
                                <p className="mt-6 text-lg text-blue-700 max-w-xl">
                                    Explore our curated collection of holiday packages, from exotic beach getaways to cultural city breaks. Find your dream vacation at the best prices.
                                </p>
                            </div>
                            <div className="mt-4">
                                {/* Map button */}
                                {mapButton}
                            </div>
                            <div className="flex gap-12 mt-8">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-900">500+</div>
                                    <div className="text-blue-700">Holiday Packages</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-900">100+</div>
                                    <div className="text-blue-700">Destinations</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-900">50k+</div>
                                    <div className="text-blue-700">Happy Travelers</div>
                                </div>
                            </div>
                        </div>
                        {/* Right: Hero image and feature boxes */}
                        <div className="flex-1 flex flex-col items-center gap-8 justify-center">
                            <div className="rounded-3xl bg-blue-200 bg-opacity-40 shadow-lg flex items-center justify-center w-[340px] h-[320px] md:w-[400px] md:h-[360px] lg:w-[440px] lg:h-[400px] border-4 border-blue-100">
                                <ProductionImage
                                    src="/images/home/hero-travel.jpg"
                                    alt="Travel Hero"
                                    fallbackSrc="/images/home/beach.jpg"
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="flex flex-col gap-4 w-full max-w-[440px]">
                                <Box title="Best Price Guarantee" desc="We offer the best prices for your dream holiday" />
                                <Box title="24/7 Support" desc="Our travel experts are always here to help" />
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
};

export const SearchBox = () => { 
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        } catch (err) {
            console.error('Navigation error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSearch}>
                <label htmlFor="search" className="mb-2 text-sm font-medium text-gray-800 sr-only">
                    Search
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-2 flex items-center p-3 pointer-events-none">
                        <IoSearchOutline color="black" size={25} />
                    </div>
                    <input 
                        type="text" 
                        className="block shadow-md w-full p-6 ps-16 text-sm text-gray-800 rounded-full bg-gray-50 outline-none" 
                        placeholder="Search destinations or packages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <PrimaryButton 
                        type="submit"
                        className="absolute end-2.5 bottom-2"
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </PrimaryButton>
                </div>
            </form>
        </>
    );
};

export const Box = ({ title, desc }) => { 
    return (
        <>
            <div className="px-5 py-4 bg-white shadow-md flex items-center gap-5 rounded-xl w-auto">
                <div className="w-14 h-14 bg-green_100 flex items-center justify-center rounded-full">
                    <AiOutlinePropertySafety size={27} className="text-primary"/>
                </div>
                <div>
                    <Title>{title}</Title>
                    <Caption>{desc}</Caption>
                </div>
            </div>
        </>
    );
};

Box.propTypes = {
    title: PropTypes.string,
    desc: PropTypes.string
};