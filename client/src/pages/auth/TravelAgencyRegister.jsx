import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? "http://localhost:5001" : "http://167.172.66.203:5001");

const TravelAgencyRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        companyName: '',
        businessRegistrationNumber: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: 'Malaysia',
            postalCode: ''
        },
        website: '',
        description: '',
        specializations: [],
        contactPerson: '',
        whatsappNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const specializations = [
        'Domestic Tours', 'International Tours', 'Adventure Travel', 'Luxury Travel',
        'Budget Travel', 'Family Packages', 'Honeymoon Packages', 'Group Tours',
        'Corporate Travel', 'Educational Tours', 'Religious Tours', 'Eco Tourism'
    ];

    const malaysianStates = [
        'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
        'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor',
        'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSpecializationChange = (specialization) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations.includes(specialization)
                ? prev.specializations.filter(item => item !== specialization)
                : [...prev.specializations, specialization]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation
        if (!formData.name || !formData.email || !formData.password || !formData.companyName) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const registrationData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                role: 'travel_agency',
                companyName: formData.companyName,
                businessRegistrationNumber: formData.businessRegistrationNumber,
                address: formData.address,
                website: formData.website,
                description: formData.description,
                specializations: formData.specializations,
                contactPerson: formData.contactPerson,
                whatsappNumber: formData.whatsappNumber
            };

            const response = await axios.post(`${API_URL}/api/users/register`, registrationData, {
                withCredentials: true
            });

            if (response.status === 201) {
                navigate('/login', { 
                    state: { 
                        message: 'Travel agency registration submitted successfully! Your account is pending admin approval. You will be notified once approved.',
                        type: 'pending',
                        role: 'travel_agency'
                    }
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Register Travel Agency
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join our platform to showcase your travel packages
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Full Name *
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                                        Contact Person
                                    </label>
                                    <input
                                        id="contactPerson"
                                        name="contactPerson"
                                        type="text"
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Primary contact person"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address *
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Enter your email address"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                        Phone Number *
                                    </label>
                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Enter your phone number"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700">
                                        WhatsApp Number
                                    </label>
                                    <input
                                        id="whatsappNumber"
                                        name="whatsappNumber"
                                        type="tel"
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="WhatsApp number for customer contact"
                                        value={formData.whatsappNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Company Information */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                                        Company Name *
                                    </label>
                                    <input
                                        id="companyName"
                                        name="companyName"
                                        type="text"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Enter your company name"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="businessRegistrationNumber" className="block text-sm font-medium text-gray-700">
                                        Business Registration Number
                                    </label>
                                    <input
                                        id="businessRegistrationNumber"
                                        name="businessRegistrationNumber"
                                        type="text"
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="SSM registration number"
                                        value={formData.businessRegistrationNumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                        Website
                                    </label>
                                    <input
                                        id="website"
                                        name="website"
                                        type="url"
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="https://www.yourcompany.com"
                                        value={formData.website}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Company Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Brief description of your travel agency"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Business Address</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                                        Street Address
                                    </label>
                                    <input
                                        id="address.street"
                                        name="address.street"
                                        type="text"
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Enter street address"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                                        City
                                    </label>
                                    <input
                                        id="address.city"
                                        name="address.city"
                                        type="text"
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Enter city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                                        State
                                    </label>
                                    <select
                                        id="address.state"
                                        name="address.state"
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select State</option>
                                        {malaysianStates.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                                        Postal Code
                                    </label>
                                    <input
                                        id="address.postalCode"
                                        name="address.postalCode"
                                        type="text"
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Enter postal code"
                                        value={formData.address.postalCode}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                                        Country
                                    </label>
                                    <input
                                        id="address.country"
                                        name="address.country"
                                        type="text"
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-gray-100"
                                        value={formData.address.country}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Specializations */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Specializations</h3>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {specializations.map((specialization) => (
                                    <label key={specialization} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={formData.specializations.includes(specialization)}
                                            onChange={() => handleSpecializationChange(specialization)}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{specialization}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password *
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password *
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Creating Account...' : 'Register Travel Agency'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link to="/register" className="text-sm text-primary hover:text-primary-dark">
                                ← Back to role selection
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TravelAgencyRegister;
