import React from 'react';

const ContactPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 relative overflow-hidden">
    {/* Decorative SVG/shape top left */}
    <div className="absolute top-0 left-0 w-40 h-40 opacity-20 z-0">
      {/* Add a playful SVG blob or cloud here */}
      {/* Example: <img src="/images/decor/blob-contact.svg" alt="decor" /> */}
    </div>
    {/* Decorative SVG/shape bottom right */}
    <div className="absolute bottom-0 right-0 w-56 h-56 opacity-20 z-0">
      {/* Add a playful SVG wave or cloud here */}
      {/* Example: <img src="/images/decor/wave-contact.svg" alt="decor" /> */}
    </div>
    <div className="relative z-10 py-8">
      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
      <p className="mb-6">For any inquiries, please fill out the form below or email us at <a href="mailto:support@holidaypackages.com" className="text-primary underline">support@holidaypackages.com</a>.</p>
      <form className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input type="text" className="w-full border rounded px-3 py-2" placeholder="Your Name" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" className="w-full border rounded px-3 py-2" placeholder="Your Email" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Message</label>
          <textarea className="w-full border rounded px-3 py-2" rows="4" placeholder="Your Message"></textarea>
        </div>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Send</button>
      </form>
    </div>
  </div>
);

export default ContactPage; 