import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Film, PlusCircle, Settings, ArrowLeft } from 'lucide-react';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/movies', icon: Film, label: 'Movies' },
  { path: '/admin/add', icon: PlusCircle, label: 'Add Movie' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <Film size={24} style={{ color: 'var(--color-accent-primary)' }} />
        <span>CineVault</span>
        <small>Admin</small>
      </div>

      <nav className="admin-sidebar__nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <NavLink to="/" className="admin-sidebar__link">
          <ArrowLeft size={18} />
          <span>Back to Site</span>
        </NavLink>
      </div>
    </aside>
  );
}
