import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Title, Container } from '../../components/common/Design';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';
import { BiCamera, BiSend, BiUser } from 'react-icons/bi';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';

function StarRating({ value, onChange, label }) {
  return (
    <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
      <span className="text-gray-700 font-medium text-lg min-w-[120px]">{label}</span>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`transition-all duration-200 hover:scale-110 ${
              star <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
            }`}
          >
            {star <= value ? <AiFillStar size={28} /> : <AiOutlineStar size={28} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function FeedbackPage() {
  const params = new URLSearchParams(window.location.search);
  const inquiryId = params.get('inquiryId');
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [criteria, setCriteria] = useState({ service: 0, accommodation: 0, value: 0 });
  const [feedback, setFeedback] = useState('');
  const [photos, setPhotos] = useState([]);
  const [recommend, setRecommend] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInquiry() {
      try {
        const res = await axios.get(`/api/inquiries/${inquiryId}`);
        setInquiry(res.data.data);
      } catch (err) {
        setInquiry(null);
      } finally {
        setLoading(false);
      }
    }
    if (inquiryId) fetchInquiry();
  }, [inquiryId]);

  const handlePhotoUpload = (e) => {
    setPhotos([...photos, ...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !criteria.service || !criteria.accommodation || !criteria.value || !recommend || !feedback) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    const formData = new FormData();
    formData.append('inquiryId', inquiryId);
    formData.append('rating', rating);
    formData.append('feedback', feedback);
    formData.append('recommend', recommend);
    formData.append('anonymous', anonymous);
    Object.entries(criteria).forEach(([key, value]) => formData.append(key, value));
    photos.forEach(photo => formData.append('photos', photo));
    await fetch('/api/feedback', { method: 'POST', body: formData });
    setSubmitted(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 flex justify-center items-center">
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-600 mt-4 text-center">Loading your feedback form...</p>
      </div>
    </div>
  );
  
  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-20 z-0">
        <div className="w-full h-full bg-green rounded-full"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-56 h-56 opacity-20 z-0">
        <div className="w-full h-full bg-primary rounded-full"></div>
      </div>
      <div className="relative z-10 flex justify-center items-center min-h-screen">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-green rounded-full flex items-center justify-center mx-auto mb-6">
            <BiSend size={40} className="text-white" />
          </div>
          <Title level={3} className="text-gray-800 mb-4">Thank You!</Title>
          <p className="text-gray-600 text-lg">Your feedback has been submitted successfully. We appreciate your time and input!</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-20 z-0">
        <div className="w-full h-full bg-primary rounded-full blur-3xl"></div>
      </div>
      <div className="absolute top-20 right-20 w-32 h-32 opacity-15 z-0">
        <AiFillStar size={128} className="text-yellow-400" />
      </div>
      <div className="absolute bottom-0 right-0 w-56 h-56 opacity-20 z-0">
        <div className="w-full h-full bg-green rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-20 left-20 w-24 h-24 opacity-30 z-0">
        <BiCamera size={96} className="text-blue-300" />
      </div>
      
      <div className="relative z-10 py-12">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Title level={2} className="text-gray-800 mb-4">Share Your Experience</Title>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Your feedback helps us improve our services and helps other travelers make informed decisions. 
                We'd love to hear about your recent travel experience!
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Package Summary Header */}
              {inquiry && (
                <div className="bg-gradient-to-r from-primary to-blue-600 p-8 text-white">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                      <img 
                        src={inquiry.packageInfo?.packageImage || '/default-package.jpg'} 
                        alt="Package" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{inquiry.packageInfo?.packageTitle}</h2>
                      <div className="text-blue-100 flex items-center gap-4">
                        <span>📅 {inquiry.travelDetails?.preferredDates?.startDate?.slice(0,10)}</span>
                        <span>→</span>
                        <span>{inquiry.travelDetails?.preferredDates?.endDate?.slice(0,10)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Overall Rating Section */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <AiFillStar className="text-yellow-400" />
                      Overall Rating
                    </h3>
                    <StarRating value={rating} onChange={setRating} label="Your overall experience" />
                  </div>

                  {/* Detailed Ratings */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Rate Different Aspects</h3>
                    <div className="space-y-2">
                      <StarRating 
                        value={criteria.service} 
                        onChange={v => setCriteria(c => ({...c, service: v}))} 
                        label="Service Quality" 
                      />
                      <StarRating 
                        value={criteria.accommodation} 
                        onChange={v => setCriteria(c => ({...c, accommodation: v}))} 
                        label="Accommodation" 
                      />
                      <StarRating 
                        value={criteria.value} 
                        onChange={v => setCriteria(c => ({...c, value: v}))} 
                        label="Value for Money" 
                      />
                    </div>
                  </div>

                  {/* Recommendation Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Would you recommend us?</h3>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                          recommend === 'yes' 
                            ? 'bg-green text-white shadow-lg scale-105' 
                            : 'bg-white border-2 border-green text-green hover:bg-green-50'
                        }`}
                        onClick={() => setRecommend('yes')}
                      >
                        <FiThumbsUp size={20} />
                        Yes, absolutely!
                      </button>
                      <button
                        type="button"
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                          recommend === 'no' 
                            ? 'bg-red-500 text-white shadow-lg scale-105' 
                            : 'bg-white border-2 border-red-500 text-red-500 hover:bg-red-50'
                        }`}
                        onClick={() => setRecommend('no')}
                      >
                        <FiThumbsDown size={20} />
                        Not really
                      </button>
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Tell us more about your experience</h3>
                    <div className="relative">
                      <textarea
                        className="w-full border-2 border-gray-200 rounded-2xl p-6 text-gray-700 focus:border-primary focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 resize-none"
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        maxLength={500}
                        rows={6}
                        placeholder="Share your thoughts, highlights, or suggestions for improvement..."
                        required
                      />
                      <div className="absolute bottom-3 right-4 text-xs text-gray-400 bg-white px-2 rounded">
                        {feedback.length}/500
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <BiCamera className="text-blue-600" />
                      Share Your Photos (Optional)
                    </h3>
                    <div className="space-y-4">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-xl cursor-pointer bg-blue-25 hover:bg-blue-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <BiCamera size={32} className="text-blue-400 mb-2" />
                          <p className="text-sm text-blue-600 font-medium">Click to upload photos</p>
                          <p className="text-xs text-blue-400">PNG, JPG or JPEG (MAX. 5MB each)</p>
                        </div>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          onChange={handlePhotoUpload} 
                          className="hidden"
                        />
                      </label>
                      
                      {photos.length > 0 && (
                        <div className="flex gap-3 flex-wrap">
                          {Array.from(photos).map((file, idx) => (
                            <div key={idx} className="relative group">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt="preview" 
                                className="w-20 h-20 object-cover rounded-xl shadow-md border-2 border-white"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium">Preview</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Privacy Option */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={anonymous} 
                        onChange={e => setAnonymous(e.target.checked)}
                        className="w-5 h-5 text-primary bg-white border-2 border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                      <div className="flex items-center gap-2">
                        <BiUser className="text-gray-600" />
                        <span className="text-gray-700 font-medium">Submit feedback anonymously</span>
                      </div>
                    </label>
                    <p className="text-sm text-gray-500 mt-2 ml-8">
                      Your personal information won't be displayed with your review
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <p className="text-red-600 font-medium">⚠️ {error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                      <BiSend size={24} />
                      Submit Your Feedback
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default FeedbackPage; 