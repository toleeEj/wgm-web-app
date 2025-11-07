import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [role, setRole] = useState("Guest");
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Desktop hover handlers
  const handleMouseEnter = (groupTitle) => {
    setActiveDropdown(groupTitle);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  // Mobile click handlers
  const handleMobileDropdownToggle = (groupTitle) => {
    setActiveDropdown(activeDropdown === groupTitle ? null : groupTitle);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const fetchRole = async () => {
      if (!session) {
        setRole("Guest");
        return;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (error) throw error;
        setRole(data.role || "Member");
      } catch (err) {
        console.error("Error fetching role:", err);
        setRole("Guest");
      }
    };
    fetchRole();
  }, [session, supabase]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Navigation structure with icons
  const navGroups = [
    {
      title: "Community",
      icon: "👥",
      links: [
        { name: "Gallery", path: "/gallery", icon: "🖼️" },
        { name: "Chat", path: "/chat", icon: "💬" },
        { name: "Announcements", path: "/announcements", icon: "📢" },
        { name: "Q&A", path: role === "Admin" || role === "Super Admin" ? "/admin-qna" : "/member-qna", icon: "❓" },
      ],
    },
    {
      title: "Resources",
      icon: "📚",
      links: [
        { name: "Rules", path: "/rules", icon: "📜" },
        { name: "Payments", path: "/member-payments", icon: "💳" },
      ],
    },
    {
      title: "Admin Tools",
      icon: "⚙️",
      showFor: ["Admin", "Super Admin"],
      links: [
        { name: "Dashboard", path: "/admin", icon: "📊" },
        { name: "Create Meeting", path: "/meeting-form", icon: "➕" },
      ],
    },
    {
      title: "Profile",
      icon: "👤",
      links: session ? [
        { name: "My Profile", path: "/profile", icon: "👤" },
        { name: "Sign Out", path: "#", icon: "🚪", action: handleSignOut },
      ] : [
        { name: "Sign In", path: "/auth", icon: "🔐" },
      ],
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-gray-900 dark:to-gray-800 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 text-2xl font-bold hover:scale-105 transition-transform duration-300 cursor-default">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg font-bold">W</span>
            </div>
            <span>WGM</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1"> 
            {navGroups.map(
              (group) =>
                (!group.showFor || group.showFor.includes(role)) && (
                  <div 
                    key={group.title} 
                    className="relative dropdown-group"
                    onMouseEnter={() => handleMouseEnter(group.title)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button 
                      className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        activeDropdown === group.title 
                          ? "bg-white/20 backdrop-blur-sm" 
                          : "hover:bg-white/10"
                      }`}
                    >
                      <span>{group.icon}</span>
                      <span>{group.title}</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${
                        activeDropdown === group.title ? "rotate-180" : ""
                      }`} />
                    </button>

                    {/* Dropdown menu (gap fixed with -mt-[1px]) */}
                    <div className={`absolute left-0 -mt-[1px] w-56 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-lg transition-all duration-300 ${
                      activeDropdown === group.title 
                        ? "opacity-100 scale-100 translate-y-0" 
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}>
                      <div className="p-2">
                        {group.links.map((link) => (
                          <div key={link.name}>
                            {link.action ? (
                              <button
                                onClick={link.action}
                                className="flex items-center space-x-3 w-full px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors duration-200"
                              >
                                <span>{link.icon}</span>
                                <span>{link.name}</span>
                              </button>
                            ) : (
                              <NavLink
                                to={link.path}
                                className={({ isActive }) =>
                                  `flex items-center space-x-3 w-full px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                    isActive 
                                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold" 
                                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                  }`
                                }
                              >
                                <span>{link.icon}</span>
                                <span>{link.name}</span>
                              </NavLink>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
            )}

            {/* User Info */}
            {session && (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-white/20">
                <UserCircleIcon className="w-6 h-6" />
                <span className="text-sm font-medium">
                  {role}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>

            <button 
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-lg rounded-2xl mt-2 p-4 space-y-3 border border-white/20">
            {navGroups.map(
              (group) =>
                (!group.showFor || group.showFor.includes(role)) && (
                  <div key={group.title} className="space-y-2">
                    <button 
                      onClick={() => handleMobileDropdownToggle(group.title)}
                      className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg bg-white/5 text-left"
                    >
                      <span>{group.icon}</span>
                      <span className="font-semibold">{group.title}</span>
                      <ChevronDownIcon className={`w-4 h-4 ml-auto transition-transform duration-300 ${
                        activeDropdown === group.title ? "rotate-180" : ""
                      }`} />
                    </button>
                    
                    <div className={`space-y-1 pl-6 transition-all duration-300 ${
                      activeDropdown === group.title ? "block" : "hidden"
                    }`}>
                      {group.links.map((link) => (
                        <div key={link.name}>
                          {link.action ? (
                            <button
                              onClick={link.action}
                              className="flex items-center space-x-3 w-full px-3 py-2 text-sm rounded-lg hover:bg-white/10 transition-colors duration-200 text-red-300"
                            >
                              <span>{link.icon}</span>
                              <span>{link.name}</span>
                            </button>
                          ) : (
                            <NavLink
                              to={link.path}
                              onClick={toggleMenu}
                              className={({ isActive }) =>
                                `flex items-center space-x-3 w-full px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                  isActive 
                                    ? "bg-white/20 font-semibold" 
                                    : "hover:bg-white/10"
                                }`
                              }
                            >
                              <span>{link.icon}</span>
                              <span>{link.name}</span>
                            </NavLink>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}

            {session && (
              <div className="pt-3 mt-3 border-t border-white/20">
                <div className="flex items-center space-x-2 px-3 py-2 text-sm">
                  <UserCircleIcon className="w-5 h-5" />
                  <span>Signed in as {role}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
