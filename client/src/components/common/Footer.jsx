import { Container, PrimaryButton, ProfileCard, Title } from "./Design";
import { FiPhone } from "react-icons/fi";
import { MdOutlineAttachEmail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { FaInstagram } from "react-icons/fa";
import { CiLinkedin, CiTwitter } from "react-icons/ci";
import { AiOutlineYoutube } from "react-icons/ai";
import { useLocation } from "react-router-dom";

export const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  return (
    <>
      <footer className="relative bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300 py-20 mt-16 overflow-hidden">
        {/* Decorative SVG/shape top left */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-20 z-0">
          {/* Add a playful SVG blob or cloud here */}
          {/* Example: <img src="/images/decor/blob-footer.svg" alt="decor" /> */}
        </div>
        {/* Decorative SVG/shape bottom right */}
        <div className="absolute bottom-0 right-0 w-40 h-40 opacity-20 z-0">
          {/* Add a playful SVG wave or cloud here */}
          {/* Example: <img src="/images/decor/wave-footer.svg" alt="decor" /> */}
        </div>
        <Container className={`${isHomePage ? "mt-32" : "mt-0"} flex flex-col md:flex-row justify-between gap-12 relative z-10`}>
          <div className="w-full md:w-1/3">
            <img src="../images/common/header-logo.png" alt="HolidayPackages Logo" />
            <br />
            <p className="text-gray-300">Your trusted partner in creating unforgettable holiday experiences. We specialize in crafting perfect travel packages for every type of traveler.</p>
            <div className="bg-gray-300 h-[1px] my-8"></div>
            <Title className="font-normal text-gray-100">Subscribe to Our Newsletter</Title>
            <div className="flex items-center justify-between mt-5">
              <input type="text" placeholder="Enter your email" className="w-full h-full p-3.5 py-[15px] text-sm border-none outline-none rounded-l-md" />
              <PrimaryButton className="rounded-none py-3.5 px-8 text-sm hover:bg-indigo-800 rounded-r-md">Subscribe</PrimaryButton>
            </div>
            <p className="text-gray-300 text-sm mt-3">Get the latest travel deals and updates.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-2/3">
            <div>
              <Title level={5} className="text-white font-normal">
                Popular Destinations
              </Title>
              <ul className="flex flex-col gap-5 mt-8 text-gray-200">
                <p>Beach Holidays</p>
                <p>City Breaks</p>
                <p>Adventure Tours</p>
                <p>Cultural Tours</p>
                <p>Honeymoon Packages</p>
                <p>Family Holidays</p>
                <p>Luxury Escapes</p>
                <p>Weekend Getaways</p>
              </ul>
            </div>
            <div>
              <Title level={5} className="text-white font-normal">
                About Us
              </Title>
              <ul className="flex flex-col gap-5 mt-8 text-gray-200">
                <p>Our Story</p>
                <p>Travel Blog</p>
                <p>Careers</p>
                <p>Press</p>
                <p>Testimonials</p>
                <p>Travel Insurance</p>
                <p>Terms & Conditions</p>
              </ul>
            </div>
            <div>
              <Title level={5} className="text-white font-normal">
                Customer Support
              </Title>
              <ul className="flex flex-col gap-5 mt-8 text-gray-200">
                <p>My Bookings</p>
                <p>Travel Guide</p>
                <p>FAQs</p>
                <p>Contact Us</p>
                <p>Privacy Policy</p>
              </ul>
            </div>
            <div>
              <Title level={5} className="text-white font-normal">
                Contact Us
              </Title>
              <ul className="flex flex-col gap-5 mt-8 text-gray-200">
                <div className="flex items-center gap-2">
                  <FiPhone size={19} />
                  <span>+1 (800) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdOutlineAttachEmail size={22} />
                  <span>support@holidaypackages.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoLocationOutline size={22} />
                  <span>123 Travel Street, City</span>
                </div>
              </ul>
              <div className="flex items-center mt-5 justify-between">
                <ProfileCard className="bg-white">
                  <AiOutlineYoutube size={22} />
                </ProfileCard>
                <ProfileCard className="bg-white">
                  <FaInstagram size={22} />
                </ProfileCard>
                <ProfileCard className="bg-white">
                  <CiTwitter size={22} />
                </ProfileCard>
                <ProfileCard className="bg-white">
                  <CiLinkedin size={22} />
                </ProfileCard>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
};