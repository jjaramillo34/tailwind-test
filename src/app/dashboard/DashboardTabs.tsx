'use client';

import { useState } from 'react';
import { Calendar, FileText, Settings } from 'lucide-react';

type Tab = 'events' | 'registrations' | 'settings';

interface DashboardTabsProps {
  eventsContent: React.ReactNode;
  registrationsContent: React.ReactNode;
  settingsContent: React.ReactNode;
}

export default function DashboardTabs({
  eventsContent,
  registrationsContent,
  settingsContent,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('events');

  const tabs = [
    { id: 'events' as Tab, label: 'Events Management', icon: Calendar },
    { id: 'registrations' as Tab, label: 'Registrations', icon: FileText },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return eventsContent;
      case 'registrations':
        return registrationsContent;
      case 'settings':
        return settingsContent;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}
