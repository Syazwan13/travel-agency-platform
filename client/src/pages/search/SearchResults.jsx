import { Container, Title } from "../../components/common/Design";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ProductCard } from "../../components/cards/ProductCard";

const fallbackImg = 'https://via.placeholder.com/300x180?text=No+Image';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState({ packages: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState("all");
    const [availableProviders, setAvailableProviders] = useState(["All Providers"]);
    const searchTerm = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchTerm) {
                navigate('/');
                return;
            }
            setLoading(true);
            setError(null);
            
            try {
                console.log("Searching for:", searchTerm);
                
                // Call the search endpoint with provider filter if selected
                const searchUrl = `${import.meta.env.VITE_API_URL}/api/packages/search?query=${encodeURIComponent(searchTerm)}${selectedProvider !== 'all' ? `&provider=${encodeURIComponent(selectedProvider)}` : ''}`;
                const response = await axios.get(searchUrl);
                
                if (response.data.success) {
                    setData({ packages: response.data.data.packages });
                        
                    // Update available providers from the response
                    const uniqueProviders = [...new Set(response.data.data.packages.map(pkg => pkg.source))];
                    const providers = ['all', ...uniqueProviders];
                    setAvailableProviders(providers);
                    } else {
                    setError(response.data.message || 'Error fetching results');
                    setData({ packages: [] });
                }
            } catch (err) {
                console.error("Error fetching search results:", err);
                setError("Error searching packages. Please try again.");
                setData({ packages: [] });
            } finally {
                setLoading(false);
            }
        };
        
        fetchResults();
    }, [searchTerm, selectedProvider, navigate]);

    // Get destination name from search term for display
    const getDestinationName = () => {
        if (/tioman/i.test(searchTerm)) return "Tioman Island";
        if (/langkawi/i.test(searchTerm)) return "Langkawi Island";
        if (/pangkor/i.test(searchTerm)) return "Pangkor Island";
        if (/kapas/i.test(searchTerm)) return "Kapas Island";
        if (/rawa/i.test(searchTerm)) return "Rawa Island";
        if (/redang/i.test(searchTerm)) return "Redang Island";
        if (/perhentian/i.test(searchTerm)) return "Perhentian Islands";
        return searchTerm;
    };

    // Format provider name for display
    const formatProviderName = (provider) => {
        if (provider === "all") return "All Providers";
        if (provider === 'AmiTravel') return "AMI Travel";
        if (provider === 'HolidayGoGo') return "HolidayGoGoGo";
        if (provider === 'PulauMalaysia') return "PulauMalaysia";
        if (provider === 'Package') return "Package";
        return provider;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24">
                <Container>
                    <div className="text-center">
                        <Title>Searching for {getDestinationName()} packages...</Title>
                    </div>
                </Container>
            </div>
        );
    }

    const destinationName = getDestinationName();

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <Container>
                <div className="mb-8">
                    <Title>{destinationName} Travel Packages</Title>
                    
                    {/* Provider Filter */}
                    <div className="flex gap-2 mt-4">
                        <select
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                        >
                            {availableProviders.map(provider => (
                                <option key={provider} value={provider}>
                                    {formatProviderName(provider)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="text-red-600 mb-4">
                        {error}
                    </div>
                )}
                
                {!error && data.packages.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No packages found for {destinationName}.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.packages.map((item, index) => (
                            <ProductCard
                                key={`${item.title}-${index}`}
                                title={item.title}
                                price={item.price}
                                description={item.description}
                                image={item.image || fallbackImg}
                                link={item.link}
                                provider={formatProviderName(item.provider)}
                            />
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
};

export default SearchResults; 