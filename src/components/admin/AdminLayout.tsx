"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Newspaper, 
  Handshake, 
  Briefcase, 
  Settings, 
  LogOut, 
  LayoutGrid, 
  ChevronDown, 
  Share2, 
  Contact,
  Image,
  FileText,
  Users
} from 'lucide-react';

// Define colors based on Appective theme
const primaryTextColor = 'text-white';
const secondaryTextColor = 'text-gray-300';
const accentBgColor = 'bg-purple-600';
const darkBg = 'bg-gray-900';
const sidebarBg = 'bg-gray-800';

interface AdminLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-sm font-medium cursor-pointer ${
        active
          ? `${accentBgColor} ${primaryTextColor}`
          : `text-gray-300 hover:bg-gray-700 hover:text-white`
      } rounded-md mx-2 transition-colors`}
    >
      {icon}
      <span className="ml-3">{text}</span>
    </div>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeSection, onSectionChange, onLogout }) => {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', path: 'dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Top Banner', path: 'top-banner', icon: <Image size={20} /> },
    { name: 'Our Services', path: 'our-services', icon: <Settings size={20} /> },
    { name: 'Partners', path: 'partners', icon: <Handshake size={20} /> },
    { name: 'Team Members', path: 'team-members', icon: <Users size={20} /> },
    { name: 'Job Openings', path: 'job-openings', icon: <Briefcase size={20} /> },
    { name: 'Job Applications', path: 'job-applications', icon: <FileText size={20} /> },
    { name: 'Newsletter Subscribers', path: 'newsletter', icon: <Newspaper size={20} /> },
    { name: 'Social Media', path: 'social-links', icon: <Share2 size={20} /> },
    { name: 'Contacts', path: 'contacts', icon: <Contact size={20} /> },
  ];

  const ourWorksSubMenu = [
    { name: 'Rich Media', path: 'mastheads', icon: <LayoutGrid size={18} /> },
    { name: 'Applications', path: 'applications', icon: <LayoutGrid size={18} /> },
    { name: 'Games', path: 'games', icon: <LayoutGrid size={18} /> },
    { name: 'Digital Marketing', path: 'digital-marketing', icon: <LayoutGrid size={18} /> },
    { name: 'Web Portal', path: 'web-portal', icon: <LayoutGrid size={18} /> },
  ];

  const [isOurWorksOpen, setIsOurWorksOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (ourWorksSubMenu.some(item => item.path === activeSection) || activeSection === 'our-works') {
      setIsOurWorksOpen(true);
    }
  }, [activeSection]);

  return (
    <div className={`flex h-screen ${darkBg}`}>
      {/* Mobile backdrop — closes drawer when tapped */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar — drawer on phone, static on md+ */}
      <aside
        className={`w-64 ${sidebarBg} flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 md:static md:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-700">
          <Link href="/" legacyBehavior>
            <a className={`text-2xl font-bold ${primaryTextColor}`}>Appective Admin</a>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <SidebarItem
                  icon={item.icon}
                  text={item.name}
                  active={activeSection === item.path}
                  onClick={() => {
                    onSectionChange(item.path);
                    setDrawerOpen(false);
                  }}
                />
              </li>
            ))}

            <li>
              <div>
                <button
                  className={`w-full flex items-center justify-between p-3 rounded-md transition-colors ${isOurWorksOpen ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}
                  onClick={() => setIsOurWorksOpen(!isOurWorksOpen)}
                >
                  <div className="flex items-center">
                    <LayoutGrid size={20} />
                    <span className="ml-4">Our Works</span>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${isOurWorksOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOurWorksOpen && (
                  <div className="mt-2 pl-6 space-y-1">
                    {ourWorksSubMenu.map(item => (
                      <button
                        key={item.path}
                        className={`w-full flex items-center p-2 rounded-md transition-colors text-sm ${activeSection === item.path ? 'bg-purple-500 text-white' : 'hover:bg-gray-700'}`}
                        onClick={() => {
                          onSectionChange(item.path);
                          setDrawerOpen(false);
                        }}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <SidebarItem
            icon={<LogOut size={20} />}
            text="Logout"
            active={false}
            onClick={() => {
              setDrawerOpen(false);
              onLogout();
            }}
          />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Phone-only top bar with hamburger */}
        <div className="md:hidden flex items-center gap-3 p-4 bg-gray-800 sticky top-0 z-20">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-md bg-gray-700 text-white"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-white font-semibold">Admin</span>
        </div>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
