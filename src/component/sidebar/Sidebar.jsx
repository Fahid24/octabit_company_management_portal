import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LazyImage from "@/utils/LazyImage";
import logo from "/odl.gif";
import logo2 from "@/assets/companyLogo/logo_crop_no_bg.png";

import { useSelector } from "react-redux";
import { User as UserIcon, ChevronDown, LogOut } from "lucide-react";
import { navLinks } from "../../constant/navLinks";
import { companyName } from "@/constant/companyInfo";

function useIsLgUp() {
  const [isLgUp, setIsLgUp] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const check = () => setIsLgUp(window.innerWidth >= 1024);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }
  }, []);
  return isLgUp;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState([]);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const timeoutRef = useRef(null);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const loginUser = useSelector((state) => state.userSlice.user);
  const role = loginUser?.user?.role || "user";
  const navLinksList = navLinks(loginUser);

  const user = {
    role,
    username:
      loginUser?.user?.firstName && loginUser?.user?.lastName
        ? `${loginUser.user.firstName} ${loginUser.user.lastName}`
        : "Monkey man User",
    email: loginUser?.user?.email || "",
    image: loginUser?.user?.image || "",
    profileImage: loginUser?.user?.photoUrl || "",
  };

  const isLgUp = useIsLgUp();

  const getCurrentRouteDropdown = () => {
    const activeDropdown = navLinksList.find(
      (item) =>
        item.submenu &&
        item.submenu.some((subItem) => location.pathname === subItem.href)
    );
    return activeDropdown ? activeDropdown.label : null;
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const currentDropdown = getCurrentRouteDropdown();
    if (currentDropdown) {
      setOpenSubmenus([currentDropdown]);
    } else {
      setOpenSubmenus([]);
    }
  }, [location.pathname]);

  useEffect(() => {
    setCollapsed(!isLgUp);
  }, [isLgUp]);

  const handleMouseEnter = () => {
    if (isLgUp) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    if (isLgUp) return;
    timeoutRef.current = setTimeout(() => {
      setCollapsed(true);
      const currentDropdown = getCurrentRouteDropdown();
      if (currentDropdown) {
        setOpenSubmenus([currentDropdown]);
      } else {
        setOpenSubmenus([]);
      }
    }, 300);
  };

  const toggleSubmenu = (title) => {
    setOpenSubmenus((prev) => (prev.includes(title) ? [] : [title]));
  };

  const handleLogout = () => {
    localStorage.removeItem("MONKEY-MAN-USER");
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  // ✅ Final Role-safe Navigation Filtering
  const filteredNavLinks = navLinksList.filter((item) => {
    const userHasAccessToParent = item.roles.includes(role);
    const allowedSubmenuItems =
      item.submenu?.filter((sub) => sub.roles.includes(role)) || [];

    return item.submenu
      ? allowedSubmenuItems.length > 0 || userHasAccessToParent
      : userHasAccessToParent;
  });

  return (
    <div
      ref={sidebarRef}
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-md transition-all duration-300 z-[9999] ${
        collapsed ? "w-20" : "w-64"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center p-2 overflow-hidden">
        <div className={`${collapsed ? "w-4/4" : "w-1/4"}  flex-shrink-0`}>
          <LazyImage src={logo2} alt="Logo" imgClass={"h-12  w-12 p-2"} />
        </div>
        {!collapsed && (
          <div className="text-2xl font-bold w-full font-gilroy mt-1 truncate">
            {companyName.slice(0, -4)}
          </div>
        )}
      </div>

      <div className="overflow-y-auto h-[calc(100%-8rem)]">
        <nav className="px-2 py-4">
          <ul className="space-y-1">
            {filteredNavLinks.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.submenu &&
                  item.submenu.some(
                    (subItem) => location.pathname === subItem.href
                  ));
              const filteredSubmenu =
                item.submenu?.filter((sub) => sub.roles.includes(role)) || [];

              return (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className={`flex items-center text-nowrap px-3 py-2 rounded-md text-sm font-medium group transition-colors duration-200 ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    onClick={(e) => {
                      if (item.submenu) {
                        e.preventDefault();
                        toggleSubmenu(item.label);
                      }
                    }}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-600"
                      }`}
                    />
                    {!collapsed && (
                      <>
                        <span className="ml-3 flex-1">{item.label}</span>
                        {filteredSubmenu.length > 0 && (
                          <ChevronDown
                            className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${
                              openSubmenus.includes(item.label)
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        )}
                      </>
                    )}
                  </Link>

                  {!collapsed &&
                    filteredSubmenu.length > 0 &&
                    openSubmenus.includes(item.label) && (
                      <ul className="mt-1 ml-8 space-y-1">
                        {filteredSubmenu.map((subItem) => {
                          const isSubActive =
                            location.pathname === subItem.href;
                          return (
                            <li key={subItem.href}>
                              <Link
                                to={subItem.href}
                                className={`flex items-center text-nowrap px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                  isSubActive
                                    ? "bg-primary/20 text-primary font-semibold"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                              >
                                {subItem.icon && (
                                  <subItem.icon
                                    className={`h-4 w-4 mr-2 ${
                                      isSubActive
                                        ? "text-primary"
                                        : "text-gray-500 group-hover:text-gray-600"
                                    }`}
                                  />
                                )}
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center p-4 relative" ref={profileMenuRef}>
          <button
            className="focus:outline-none"
            // onClick={() => setProfileMenuOpen((v) => !v)}
            aria-label="Open profile menu"
            type="button"
          >
            {user.image || user.profileImage ? (
              <img
                src={user.image || user.profileImage}
                alt="User"
                className="rounded-full w-10 h-10 object-cover border border-primary p-0.5"
              />
            ) : (
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <UserIcon className="text-white w-5 h-5" />
              </div>
            )}
          </button>
          {!collapsed && (
            <>
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}

          {profileMenuOpen && !collapsed && (
            <div className="absolute left-0 bottom-14 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate(`/profile/${loginUser?.user?._id || "me"}`);
                }}
              >
                <UserIcon className="w-4 h-4" /> Profile
              </button>
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={() => {
                  setProfileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )} 
        </div>
      </div> */}
    </div>
  );
}
