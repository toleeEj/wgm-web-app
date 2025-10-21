import { NavLink } from 'react-router-dom';

const Footer = () => {
  const quickLinks = [
    { name: 'Rules', path: '/rules' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Announcements', path: '/announcements' },
  ];

  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Branding */}
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-bold">Waldaa Gaaddisa Maatii</h2>
            <p className="text-sm">Building a stronger community together</p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            {quickLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className="text-sm hover:text-blue-400"
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Contact */}
          <div className="text-sm">
            <p>Contact: info@wgm.org</p>
            <p>&copy; {new Date().getFullYear()} WGM. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;