import { useEffect, useState } from "react";
import { ProductCard } from "../../components/cards/ProductCard";
import { Container, Heading } from "../../components/common/Design";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const ProductList = () => {
    const [data, setData] = useState({ packages: [], activities: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Change the default selected destination from 'langkawi' to 'tioman'
    const [selectedDestination, setSelectedDestination] = useState("tioman");

    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/api/packages?destination=${selectedDestination}`);
                if (response.data.success) {
                    // Ensure data structure is valid
                    const responseData = response.data.data || {};
                    setData({
                        packages: Array.isArray(responseData.packages) ? responseData.packages : [],
                        activities: Array.isArray(responseData.activities) ? responseData.activities : []
                    });
                } else {
                    setError("Failed to fetch packages.");
                    setData({ packages: [], activities: [] });
                }
            } catch (err) {
                console.error("Error fetching packages:", err);
                setError(err.message || "Failed to fetch packages.");
                setData({ packages: [], activities: [] });
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, [selectedDestination]);

    // Remove 'langkawi' from destinations
    const destinations = ["tioman", "redang", "perhentian"];

    return (
        <>
            <section className="product-home py-16 relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
                {/* Decorative SVG/shape top right */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20 z-0">
                    {/* Add a playful SVG blob or cloud here */}
                    {/* Example: <img src="/images/decor/blob2.svg" alt="decor" /> */}
                </div>
                {/* Decorative SVG/shape bottom left */}
                <div className="absolute bottom-0 left-0 w-40 h-40 opacity-20 z-0">
                    {/* Add a playful SVG wave or cloud here */}
                    {/* Example: <img src="/images/decor/wave2.svg" alt="decor" /> */}
                </div>
                <Container>
                    <div className="relative z-10">
                        <Heading 
                            title="Featured Holiday Packages" 
                            subtitle="Discover our handpicked selection of the best holiday packages. From exotic beach getaways to cultural city breaks, find your perfect vacation."
                        />

                        <div className="flex justify-center gap-4 my-8">
                            {destinations.map((dest) => (
                                <button
                                    key={dest}
                                    onClick={() => setSelectedDestination(dest)}
                                    className={`px-6 py-2 rounded-full shadow-md font-semibold text-lg transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-blue-300
                                        ${selectedDestination === dest
                                            ? "bg-blue-500 text-white border-blue-500 scale-105"
                                            : "bg-white text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-400"}
                                    `}
                                >
                                    {/* Optionally add an icon or image for each destination here */}
                                    {dest.charAt(0).toUpperCase() + dest.slice(1)}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-lg text-blue-700">Loading packages...</div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-500">{error}</div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mt-8 mb-4 text-blue-900">Holiday Packages</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 my-8">
                                    {!data.packages || data.packages.length === 0 ? (
                                        <div className="col-span-4 text-center text-gray-500">No packages found for {selectedDestination}.</div>
                                    ) : (
                                        data.packages.slice(0, 8).map((item, index) => (
                                            <ProductCard
                                                key={item._id || index}
                                                title={item.title || 'Untitled Package'}
                                                price={item.price}
                                                description={item.description}
                                                image={item.image}
                                                link={item.link || '#'}
                                                provider={item.source || item.provider}
                                            />
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
};