import React, { createContext, useContext, useState } from "react";

// Utility function for merging class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Create context for tabs state management
const TabsContext = createContext({
  selectedTab: "",
  setSelectedTab: () => {},
});

// Main Tabs container component
const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  className,
  orientation = "horizontal",
  children,
  ...props
}) => {
  const [selectedTabState, setSelectedTabState] = useState(defaultValue || "");
  
  const selectedTab = value !== undefined ? value : selectedTabState;
  const handleTabChange = onValueChange || setSelectedTabState;

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab: handleTabChange }}>
      <div
        className={cn(
          "w-full",
          orientation === "vertical" ? "flex flex-row space-x-2" : "",
          className
        )}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// TabsList component - container for tab triggers
const TabsList = ({ className, orientation = "horizontal", children, ...props }) => {
  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={cn(
        "flex",
        orientation === "horizontal"
          ? "flex-row space-x-1 rounded-lg bg-muted p-1"
          : "flex-col space-y-1 rounded-lg bg-muted p-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// TabsTrigger component - the clickable tab button
const TabsTrigger = ({ className, value, disabled = false, children, ...props }) => {
  const { selectedTab, setSelectedTab } = useContext(TabsContext);
  const isSelected = selectedTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      data-state={isSelected ? "active" : "inactive"}
      onClick={() => setSelectedTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// TabsContent component - the content panel for each tab
const TabsContent = ({ className, value, children, ...props }) => {
  const { selectedTab } = useContext(TabsContext);
  const isSelected = selectedTab === value;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      data-state={isSelected ? "active" : "inactive"}
      tabIndex={0}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Export all components
export { Tabs, TabsList, TabsTrigger, TabsContent };