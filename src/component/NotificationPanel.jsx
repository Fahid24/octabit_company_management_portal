import React, { useState } from 'react';

const filters = [
  { label: 'Critical', value: 'critical' },
  { label: 'Important', value: 'important' },
  { label: 'Info', value: 'info' },
  { label: 'Unread', value: 'unread' },
];

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Things to Do', value: 'todo' },
  { label: 'Messages', value: 'messages' },
];

export default function NotificationPanel({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]);

  const toggleFilter = (value) => {
    setActiveFilters((prev) =>
      prev.includes(value)
        ? prev.filter((f) => f !== value)
        : [...prev, value]
    );
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ minWidth: 350 }}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button onClick={onClose} className="text-2xl">&times;</button>
      </div>
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`flex-1 py-2 text-center ${activeTab === tab.value ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 p-4 border-b flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`px-3 py-1 rounded-full border text-sm ${activeFilters.includes(filter.value) ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-600'}`}
            onClick={() => toggleFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center h-2/3 text-center text-gray-500">
        <div className="mb-4">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#E5E7EB"/><rect x="8" y="11" width="8" height="2" rx="1" fill="#9CA3AF"/><rect x="11" y="8" width="2" height="6" rx="1" fill="#9CA3AF"/></svg>
        </div>
        <div className="font-semibold mb-1">Nice! it looks like you’re all caught up</div>
        <div className="text-sm">We’ll let you know as soon as there’s anything new here</div>
      </div>
    </div>
  );
}
