import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  X,
  ChevronRight,
  MoreHorizontal,
  Handshake,
  Fingerprint,
} from "lucide-react";
import { useSelector } from "react-redux";
import { navLinks } from "@/constant/navLinks";
import { cn } from "@/utils/cn";

export const Bottombar = () => {
  const [activeItemIndex, setActiveItemIndex] = useState(2);
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [selectedDropdownItems, setSelectedDropdownItems] = useState([]);
  const [selectedDropdownTitle, setSelectedDropdownTitle] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const lastClickedIndexRef = useRef(2); // Default to Check In/Out

  const loginUser = useSelector((state) => state.userSlice.user);
  const role = loginUser?.user?.role || "User";
  const navLinksList = navLinks(loginUser);

  const filteredLinks = navLinksList
    .map((item) => {
      const allowedSubmenu =
        item.submenu?.filter((sub) => sub.roles.includes(role)) || [];
      const userHasAccessToParent = item.roles.includes(role);
      if (!userHasAccessToParent && allowedSubmenu.length === 0) return null;
      return {
        ...item,
        submenu: allowedSubmenu.length > 0 ? allowedSubmenu : undefined,
      };
    })
    .filter(Boolean);

  const handleLogout = () => {
    localStorage.removeItem("MONKEY-MAN-USER");
    navigate("/login");
  };

  const createBottomNavItems = () => {
    const dashboardItem = filteredLinks.find(
      (item) =>
        item.label.toLowerCase().includes("dashboard") ||
        item.href?.includes("dashboard")
    );

    const checkInOutItem = {
      label: "Check In/Out",
      href: "/attendance",
      icon: Fingerprint,
      roles: ["Admin", "Manager", "DepartmentHead", "Employee"],
    };

    const otherItems = filteredLinks.filter(
      (item) => !item.label.toLowerCase().includes("dashboard")
    );

    const bottomItems = [
      otherItems[0],
      otherItems[1],
      checkInOutItem,
      otherItems[2],
      {
        label: "More",
        icon: MoreHorizontal,
        isMore: true,
      },
    ].filter(Boolean);

    const moreItems = [dashboardItem, ...otherItems.slice(3)].filter(Boolean);

    return { bottomItems, moreItems };
  };

  const { bottomItems, moreItems } = createBottomNavItems();

  const findActiveBottomNavIndex = (currentPath) => {
    if (currentPath === "/attendance") return 2;

    for (let i = 0; i < bottomItems.length; i++) {
      const item = bottomItems[i];
      if (item?.href === currentPath) return i;
      if (item?.submenu?.some((sub) => sub.href === currentPath)) return i;
    }

    const isInMore = moreItems.some((item) => {
      if (item?.href === currentPath) return true;
      return item?.submenu?.some((sub) => sub.href === currentPath);
    });

    if (isInMore) return 4; // More

    return 2; // default Check In/Out
  };

  const handleItemClick = (index, item) => {
    lastClickedIndexRef.current = index;
    if (item?.isMore) {
      setSelectedDropdownItems(moreItems);
      setSelectedDropdownTitle("More Options");
      setShowDropdownModal(true);
    } else if (item?.submenu) {
      setSelectedDropdownItems(item.submenu);
      setSelectedDropdownTitle(item.label);
      setShowDropdownModal(true);
    } else if (item?.href) {
      navigate(item.href);
    }
    setActiveItemIndex(index);
  };

  const handleSubmenuClick = (submenuItem, parentIndex) => {
    lastClickedIndexRef.current = parentIndex;
    setActiveItemIndex(parentIndex);
    setShowDropdownModal(false);
    navigate(submenuItem.href);
  };

  const handleMoreItemClick = (item) => {
    if (item?.submenu) {
      setSelectedDropdownItems(
        item.submenu.map((sub) => ({
          ...sub,
          _parentIndex: bottomItems.findIndex((b) =>
            b?.submenu?.some((s) => s.href === sub.href)
          ),
        }))
      );
      setSelectedDropdownTitle(item.label);
    } else if (item?.href) {
      const parentIndex = bottomItems.findIndex((b) =>
        b?.submenu?.some((sub) => sub.href === item.href)
      );
      lastClickedIndexRef.current = parentIndex !== -1 ? parentIndex : 4;
      setActiveItemIndex(parentIndex !== -1 ? parentIndex : 4);
      setShowDropdownModal(false);
      navigate(item.href);
    } else if (item?.label === "Logout") {
      handleLogout();
      setShowDropdownModal(false);
    }
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = findActiveBottomNavIndex(currentPath);

    const isMatch =
      bottomItems.some(
        (item) =>
          item?.href === currentPath ||
          item?.submenu?.some((s) => s.href === currentPath)
      ) ||
      moreItems.some(
        (item) =>
          item?.href === currentPath ||
          item?.submenu?.some((s) => s.href === currentPath)
      );

    if (isMatch) {
      setActiveItemIndex(activeIndex);
    } else {
      setActiveItemIndex(lastClickedIndexRef.current);
    }
  }, [location.pathname, bottomItems, moreItems]);

  const ActiveIcon = bottomItems[activeItemIndex]?.icon;

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full bg-white shadow-lg flex justify-center z-[999] md:hidden">
        <div className="w-full bg-white rounded-t-3xl shadow-2xl">
          <ul className="flex relative h-16 items-end pb-2">
            <div
              className={cn(
                "absolute w-1/5 flex justify-center pointer-events-none transition-transform duration-300 ease-out",
                "transform -translate-y-2"
              )}
              style={{
                transform: `translate(${activeItemIndex * 100}%, -0.5rem)`,
              }}
            >
              <div className="w-12 h-12 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-white text-xl">
                  {ActiveIcon && <ActiveIcon size={20} />}
                </span>
              </div>
            </div>

            {bottomItems.map((item, index) => {
              const isActive = activeItemIndex === index;
              return (
                <li key={index} className="flex-1">
                  <button
                    onClick={() => handleItemClick(index, item)}
                    className={cn(
                      "w-full h-14 flex flex-col items-center justify-center gap-1 text-xs font-light transition-all duration-200 z-10 relative",
                      isActive
                        ? "text-transparent"
                        : "text-[#56688a] hover:text-primary"
                    )}
                  >
                    <span
                      className={cn(
                        "transition-all duration-300 ease-out",
                        isActive ? "text-white transform -translate-y-2" : ""
                      )}
                    >
                      {!isActive && item?.icon && <item.icon size={20} />}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] leading-none transition-all duration-300",
                        isActive && "transform translate-y-1"
                      )}
                    >
                      {item?.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {showDropdownModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden"
            style={{ bottom: "4rem" }}
            onClick={() => setShowDropdownModal(false)}
          />
          <div className="fixed bottom-16 left-0 right-0 z-[61] flex justify-center md:hidden">
            <div className="dropdown-modal w-full bg-white rounded-t-2xl max-h-[60vh] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-[#1e2133]">
                  {selectedDropdownTitle}
                </h3>
                <button
                  onClick={() => setShowDropdownModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(60vh-80px)] pb-4">
                <div className="p-4 space-y-2 pb-6">
                  {selectedDropdownItems.map((item, index) => {
                    const isActive = location.pathname === item?.href;
                    const parentIndex =
                      item?._parentIndex ??
                      bottomItems.findIndex((b) =>
                        b?.submenu?.some((s) => s.href === item?.href)
                      );

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (item?.submenu) {
                            handleMoreItemClick(item);
                          } else {
                            handleSubmenuClick(item, parentIndex);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 p-3 rounded-lg transition-colors text-left",
                          isActive
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {item?.icon && <item.icon size={20} />}
                          </span>
                          <span className="font-medium">{item?.label}</span>
                        </div>
                        {item?.submenu && (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
