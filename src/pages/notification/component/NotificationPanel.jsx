import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/tabs";
import React, { useState, useCallback } from "react";
import {
  useGetUserNotificationsQuery,
  useMarkAsReadMutation,
} from "@/redux/features/notification/notificationApiSlice";
import useSocket from "@/hook/useSocket";
import { useNavigate } from "react-router-dom";

const filters = [
  { label: "Critical", value: "critical" },
  { label: "Important", value: "important" },
  { label: "Info", value: "info" },
  { label: "Unread", value: "unread" },
];

export default function NotificationPanel({ open, onClose, userId }) {
  const [activeFilters, setActiveFilters] = useState([]);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const navigate = useNavigate();
  const [markAsRead] = useMarkAsReadMutation();

  // Real-time notification handler
  const handleSocketNotification = useCallback((notification) => {
    // Ensure createdAt is a valid ISO string for live notifications
    let createdAt = notification.createdAt;
    if (!createdAt || isNaN(new Date(createdAt).getTime())) {
      createdAt = new Date().toISOString();
    }
    setLiveNotifications((prev) => [{ ...notification, createdAt }, ...prev]);
  }, []);

  useSocket(userId, handleSocketNotification);

  // Determine filter params for API
  const typeFilter = activeFilters.find((f) =>
    ["critical", "important", "info"].includes(f)
  );
  const isReadFilter = activeFilters.includes("unread") ? "false" : undefined;

  const { data, error, isLoading } = useGetUserNotificationsQuery(
    {
      userId,
      type: typeFilter || undefined,
      isRead: isReadFilter,
      page: 1,
      limit: 10,
      sort: "-createdAt",
    },
    { skip: !userId }
  );

  // Add isRead property to each notification based on readBy array
  const processedNotifications = (data?.notifications || []).map((n) => ({
    ...n,
    isRead: Array.isArray(n.readBy)
      ? n.readBy.some((rb) =>
          typeof rb === "string" ? rb === userId : rb.user === userId
        )
      : false,
  }));

  // Merge live notifications with processed notifications (avoid duplicates)
  const allNotifications = [
    ...liveNotifications,
    ...processedNotifications.filter(
      (n) => !liveNotifications.some((live) => live.notificationId === n._id)
    ),
  ];

  const toggleFilter = (value) => {
    setActiveFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  // Handler to mark notification as read
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead({ id: notification._id, userId });
      } catch {
        // Optionally handle error
      }
    }
    if (
      notification.type === "LMS_COURSE_ADD" ||
      notification.type === "LMS_COURSE_UPDATE"
    ) {
      navigate(`/lms/my-courses`);
    }
    if (
      notification.type === "DepartmentChange" ||
      notification.type === "RoleChange"
    ) {
      navigate(`/profile/:employeeId`);
    }
    if (notification.type === "leave") {
      navigate(`/my-leave-requests`);
    }
    if (notification.type === "short_leave") {
      navigate(`/short-leave-requests`);
    }

    // Add any additional logic for marking as read or other actions
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-gradient-to-b from-[#fcf9f6] to-white shadow-xl z-50 transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ minWidth: 380 }}
    >
      <div className="flex items-center justify-between p-5 border-b border-[#e9d8c4] bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h2 className="text-xl font-bold text-primary tracking-wide">
            Notifications
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <Tabs defaultValue="all">
        <TabsList className="flex border-b bg-[#f9f4ee] px-2">
          <TabsTrigger
            value="all"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold rounded-none h-14 px-4 flex-shrink-0 transition-all duration-200"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="todo"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold rounded-none h-14 px-4 flex-shrink-0 transition-all duration-200"
          >
            Things to Do
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-14 px-4 flex-shrink-0"
          >
            Messages
          </TabsTrigger>
          <TabsTrigger
            value="office"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-14 px-4 flex-shrink-0"
          >
            Email
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="flex gap-2 p-4 border-b flex-wrap bg-[#f9f4ee]/50">
            {filters.map((filter) => {
              const iconMap = {
                critical: (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                ),
                important: (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
                info: (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                unread: (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                ),
              };
              return (
                <button
                  key={filter.value}
                  className={`px-3 py-1.5 rounded-full border shadow-sm text-sm font-medium flex items-center gap-1.5 transition-all duration-200 ${
                    activeFilters.includes(filter.value)
                      ? "bg-primary border-primary text-white scale-105 transform"
                      : "bg-white border-[#e9d8c4] text-primary hover:bg-[#f9f4ee]"
                  }`}
                  onClick={() => toggleFilter(filter.value)}
                >
                  {iconMap[filter.value]}
                  {filter.label}
                </button>
              );
            })}
          </div>
          {/* Make this div scrollable with a fixed height and hidden scrollbar */}
          <div
            className="p-4 overflow-y-auto h-[calc(100vh-300px)]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
            <div className="hide-scrollbar">
              {isLoading && (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-red-600 font-medium">
                      Error loading notifications.
                    </span>
                  </div>
                </div>
              )}
              {allNotifications && allNotifications.length > 0 ? (
                <ul className="space-y-4">
                  {allNotifications.map((notification) => {
                    // Define notification styles based on type
                    const getNotificationStyles = (type, isRead) => {
                      const styles = {
                        critical: {
                          border: isRead ? "border-red-200" : "border-red-500",
                          bg: isRead ? "bg-gray-100" : "bg-red-50",
                          icon: (
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-full ${
                                isRead ? "bg-red-50" : "bg-red-100"
                              } flex items-center justify-center mr-3`}
                            >
                              <svg
                                className={`w-5 h-5 ${
                                  isRead ? "text-red-300" : "text-red-500"
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                            </div>
                          ),
                          highlight: isRead ? "text-red-300" : "text-red-600",
                        },
                        important: {
                          border: isRead
                            ? "border-yellow-200"
                            : "border-yellow-500",
                          bg: isRead ? "bg-gray-100" : "bg-yellow-50",
                          icon: (
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-full ${
                                isRead ? "bg-yellow-50" : "bg-yellow-100"
                              } flex items-center justify-center mr-3`}
                            >
                              <svg
                                className={`w-5 h-5 ${
                                  isRead ? "text-yellow-300" : "text-yellow-600"
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                            </div>
                          ),
                          highlight: isRead
                            ? "text-yellow-300"
                            : "text-yellow-600",
                        },
                        info: {
                          border: isRead
                            ? "border-blue-200"
                            : "border-blue-500",
                          bg: isRead ? "bg-gray-100" : "bg-blue-50",
                          icon: (
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-full ${
                                isRead ? "bg-blue-50" : "bg-blue-100"
                              } flex items-center justify-center mr-3`}
                            >
                              <svg
                                className={`w-5 h-5 ${
                                  isRead ? "text-blue-300" : "text-blue-600"
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                          ),
                          highlight: isRead ? "text-blue-300" : "text-blue-600",
                        },
                        default: {
                          border: isRead
                            ? "border-[#e9d8c4]"
                            : "border-primary",
                          bg: isRead ? "bg-gray-100" : "bg-[#f9f4ee]",
                          icon: (
                            <div
                              className={`flex-shrink-0 w-5 h-10 rounded-full ${
                                isRead ? "bg-[#f9f4ee]" : "bg-[#f9f4ee]"
                              } flex items-center justify-center mr-3`}
                            >
                              <svg
                                className={`w-5 h-5 ${
                                  isRead ? "text-[#e9d8c4]" : "text-primary"
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                            </div>
                          ),
                          highlight: isRead ? "text-primary" : "text-primary",
                        },
                      };
                      return styles[type] || styles.default;
                    };
                    const style = getNotificationStyles(
                      notification.type,
                      notification.isRead
                    );
                    return (
                      <li
                        key={notification._id}
                        className={`flex items-start p-4 rounded-lg border-l-4 ${style.border} ${style.bg} shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {style.icon}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`font-bold ${style.highlight} text-base truncate`}
                            >
                              {notification.title}
                            </span>
                            {!notification.isRead && (
                              <span className="ml-1 px-2 py-0.5 bg-primary text-white text-xs rounded-full animate-pulse">
                                New
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 mb-2 leading-relaxed">
                            {notification.message}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                            </svg> */}
                            <span>
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                !isLoading && (
                  <div className="flex flex-col items-center justify-center h-2/3 text-center text-gray-500">
                    <div className="mb-4">
                      <svg
                        width="48"
                        height="48"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" fill="#E5E7EB" />
                        <rect
                          x="8"
                          y="11"
                          width="8"
                          height="2"
                          rx="1"
                          fill="#9CA3AF"
                        />
                        <rect
                          x="11"
                          y="8"
                          width="2"
                          height="6"
                          rx="1"
                          fill="#9CA3AF"
                        />
                      </svg>
                    </div>
                    <div className="font-semibold mb-1">
                      Nice! it looks like you’re all caught up
                    </div>
                    <div className="text-sm">
                      We’ll let you know as soon as there’s anything new here
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="todo">
          <div className="p-4">Things to Do content goes here.</div>
        </TabsContent>
        <TabsContent value="messages">
          <div className="p-4">Messages content goes here.</div>
        </TabsContent>
        <TabsContent value="office">
          <div className="p-4">Haque Digital Mail content goes here.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
