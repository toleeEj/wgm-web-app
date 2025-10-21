import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("Guest");
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

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

  // --- Grouped Navigation Structure ---
  const navGroups = [
    {
      title: "Community",
      links: [
        { name: "Gallery", path: "/gallery" },
        { name: "Chat", path: "/chat" },
        { name: "Announcements", path: "/announcements" },
        { name: "Q&A", path: role === "Admin" || role === "Super Admin" ? "/admin-qna" : "/member-qna" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Rules", path: "/rules" },
        { name: "Payments", path: "/member-payments" },
      ],
    },
    {
      title: "Admin Tools",
      showFor: ["Admin", "Super Admin"],
      links: [
        { name: "Dashboard", path: "/admin" },
        { name: "create Meeting", path: "/meeting-form" },
      ],
    },
    {
      title: "profile",
      links: [
        { name: "Profile", path: "/profile" },
        { name: "logout", path: "/logout" },
      ],
    },
  ];

  return (
    <nav className="bg-gray-800 dark:bg-gray-900 text-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="text-2xl font-bold">
            WGM
          </NavLink>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navGroups.map(
              (group) =>
                (!group.showFor || group.showFor.includes(role)) && (
                  <div key={group.title} className="relative group">
                    <button className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-blue-600 transition">
                      {group.title} ▾
                    </button>

                    {/* Dropdown menu */}
                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transform scale-y-0 group-hover:scale-y-100 origin-top transition-all duration-200">
                      {group.links.map((link) => (
                        <NavLink
                          key={link.name}
                          to={link.path}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm hover:bg-blue-100 dark:hover:bg-gray-700 rounded ${
                              isActive ? "font-semibold text-blue-600 dark:text-blue-400" : ""
                            }`
                          }
                        >
                          {link.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )
            )}

          
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="p-2">
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
          <div className="md:hidden bg-gray-700 rounded-lg mt-2 p-3 space-y-2">
            {navGroups.map(
              (group) =>
                (!group.showFor || group.showFor.includes(role)) && (
                  <div key={group.title}>
                    <p className="font-semibold text-gray-200">{group.title}</p>
                    {group.links.map((link) => (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={toggleMenu}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-md text-sm ${
                            isActive ? "bg-blue-600" : "hover:bg-blue-500"
                          }`
                        }
                      >
                        {link.name}
                      </NavLink>
                    ))}
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
