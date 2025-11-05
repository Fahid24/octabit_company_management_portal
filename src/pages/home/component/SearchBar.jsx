import { navLinks } from "@/constant/navLinks";
import { ArrowRight, Search, X } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const user = useSelector((state) => state.userSlice.user);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const itemRefs = useRef([]);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  const flattenNavItems = useMemo(() => {
    const role = user?.user?.role || "user";
    const items = [];
    const links = navLinks(user);

    links.forEach((item) => {
      const userHasAccessToParent = item.roles.includes(role);
      const allowedSubmenu =
        item.submenu?.filter((sub) => sub.roles.includes(role)) || [];

      if (item.href && userHasAccessToParent) {
        items.push({
          ...item,
          category: null,
          isMainItem: true,
        });
      }

      allowedSubmenu.forEach((subItem) => {
        items.push({
          ...subItem,
          category: item.label,
          parentLabel: item.label,
          isMainItem: false,
        });
      });
    });

    return items;
  }, [user]); // Only recompute when user changes

  const allItems = useMemo(() => {
    return flattenNavItems.filter((item) => item.label !== "Home"); // Exclude "Home" from the list
  }, [flattenNavItems]);

  // Reset itemRefs when filtered results change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredResults.length);
  }, [filteredResults]);

  // Filter results based on search query
  useEffect(() => {
    // Exclude "Home" from the list
    const itemsWithoutHome = allItems.filter((item) => item.label !== "Home");

    if (searchQuery.trim() === "") {
      setFilteredResults(itemsWithoutHome.slice(0, 8)); // Show first 8 items when no search
    } else {
      const filtered = itemsWithoutHome.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.category &&
            item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredResults(filtered.slice(0, 8));
    }
    setSelectedIndex(-1);
  }, [searchQuery, allItems]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex =
              prev < filteredResults.length - 1 ? prev + 1 : prev;
            // Ensure the newly selected item is visible
            ensureItemIsVisible(newIndex);
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : -1;
            // Ensure the newly selected item is visible
            if (newIndex >= 0) {
              ensureItemIsVisible(newIndex);
            }
            return newIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
            handleNavigation(filteredResults[selectedIndex].href);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearchQuery("");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults]);

  // Function to ensure the selected item is visible
  const ensureItemIsVisible = (index) => {
    if (index >= 0 && itemRefs.current[index] && resultsRef.current) {
      const item = itemRefs.current[index];
      const container = resultsRef.current;
      const headerHeight = headerRef.current
        ? headerRef.current.offsetHeight
        : 0;

      // Special case for the first few items - scroll to top
      if (index <= 1) {
        container.scrollTop = 0;
        return;
      }

      // Get positions
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.offsetHeight;

      // Check if item is not fully visible
      if (itemTop < containerTop + headerHeight) {
        // Item is above visible area or under header, scroll up to show it
        container.scrollTop = itemTop - headerHeight - 10; // Add padding to account for header
      } else if (itemBottom > containerBottom) {
        // Item is below visible area, scroll down to show it
        container.scrollTop = itemBottom - container.offsetHeight + 10; // Add a small padding
      }
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (href) => {
    if (href) {
      navigate(href);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchFocus = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleItemClick = (item) => {
    handleNavigation(item.href);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div
          className={`relative flex items-center bg-white rounded-2xl shadow-lg border transition-all duration-500 transform ${
            isOpen
              ? "border-primary/30 shadow-[0_12px_40px_-8px_rgba(138,102,66,0.25)] scale-105"
              : "border-gray-200/50 hover:border-primary/20 hover:shadow-lg"
          }`}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative flex items-center w-full">
            <div
              className={`absolute left-5 transition-all duration-300 ${
                isOpen ? "scale-110" : ""
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isOpen
                    ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Search className="w-5 h-5" />
              </div>
            </div>

            <input
              type="text"
              placeholder="How can we help you today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              className="w-full pl-20 pr-6 md:pr-16 py-4 text-gray-700 placeholder-gray-400 bg-transparent rounded-2xl focus:outline-none text-lg font-medium"
            />

            {isOpen && (
              <button
                onClick={handleClose}
                className="absolute right-5 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50">
          {/* Animated gradient header */}
          <div
            ref={headerRef}
            className="top-0 z-10 relative px-8 py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            <h3 className="relative text-sm font-bold text-primary uppercase tracking-wider">
              {searchQuery
                ? `Found ${filteredResults.length} results`
                : "Quick Actions"}
            </h3>
          </div>

          {/* Results */}
          <div
            className="py-3 max-h-[400px] overflow-y-auto overflow-x-hidden"
            ref={resultsRef}
          >
            {filteredResults.length > 0 ? (
              filteredResults.map((item, index) => {
                // if (index === 0) return null;
                const IconComponent = item.icon;
                return (
                  <button
                    ref={(el) => (itemRefs.current[index] = el)}
                    key={`${item.label}-${index}`}
                    onClick={() => handleItemClick(item)}
                    className={`group w-full flex items-start px-8 py-3 text-left transition-all duration-300 ${
                      selectedIndex === index
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 border-r-4 border-primary transform translate-x-1"
                        : "hover:bg-gray-50/80 hover:translate-x-1"
                    }`}
                  >
                    {/* Icon with gradient background */}
                    <div className="relative mr-5 flex-shrink-0">
                      <div
                        className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                          selectedIndex === index
                            ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg scale-110"
                            : "bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary"
                        }`}
                      >
                        <IconComponent className="w-7 h-7" />
                      </div>
                      {/* Subtle glow effect */}
                      {selectedIndex === index && (
                        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl scale-150 -z-10" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center mb-2">
                        <h4
                          className={`font-bold text-md transition-colors duration-200 ${
                            selectedIndex === index
                              ? "text-primary"
                              : "text-gray-900 group-hover:text-primary"
                          }`}
                        >
                          {item.label}
                        </h4>
                        {item.category && (
                          <span className="px-3 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed -mt-1 group-hover:text-gray-700">
                        {item.description}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <div
                      className={`flex-shrink-0 ml-4 transition-all duration-300 ${
                        selectedIndex === index
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0"
                      }`}
                    >
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-8 py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-gray-600 text-xl font-semibold mb-2">
                  No results found
                </h3>
                <p className="text-gray-400 text-sm">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Footer */}
          {filteredResults.length > 0 && (
            <div className="px-8 py-4 bg-gradient-to-r from-gray-50/80 to-gray-50/40 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-xs text-gray-500">
                  <span className="flex items-center gap-2">
                    <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono shadow-sm">
                      ↑↓
                    </kbd>
                    <span className="font-medium">Navigate</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono shadow-sm">
                      Enter
                    </kbd>
                    <span className="font-medium">Select</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono shadow-sm">
                      Esc
                    </kbd>
                    <span className="font-medium">Close</span>
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {filteredResults.length} of {allItems.length} items
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/20 backdrop-blur-sm -z-10 transition-all duration-300" />
      )}
    </div>
  );
};

export default SearchBar;
