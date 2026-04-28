import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabels = { admin: 'Administrator', direktor: 'Direktor', oquvchi: "O'qituvchi" };

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname === '/') return 'Bosh sahifa';
    if (location.pathname.includes('/teachers/new')) return "Yangi o'qituvchi";
    if (location.pathname.includes('/edit')) return "Tahrirlash";
    if (location.pathname.includes('/teachers/')) return "O'qituvchi ma'lumotlari";
    if (location.pathname === '/teachers') return "O'qituvchilar ro'yxati";
    if (location.pathname === '/certificates') return "Sertifikatlar";
    if (location.pathname === '/documents') return "Hujjatlar";
    if (location.pathname === '/import') return "Excel/CSV Import";
    if (location.pathname === '/users') return "Foydalanuvchilar";
    return "Tizim";
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🏫 Maktab Tizimi</h2>
          <span>O'qituvchilar Ma'lumotlar Bazasi</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Asosiy</div>
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">📊</span> Bosh sahifa
            </NavLink>
            <NavLink to="/teachers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">👨‍🏫</span> O'qituvchilar
            </NavLink>
          </div>

          {(user?.role === 'admin' || user?.role === 'direktor') && (
            <div className="nav-section">
              <div className="nav-section-title">Boshqaruv</div>
              <NavLink to="/teachers/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="icon">➕</span> Yangi qo'shish
              </NavLink>
              <NavLink to="/import" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="icon">📥</span> Excel Import
              </NavLink>
            </div>
          )}

          <div className="nav-section">
            <div className="nav-section-title">Ma'lumot</div>
            <NavLink to="/certificates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">🏆</span> Sertifikatlar
            </NavLink>
            <NavLink to="/documents" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">📁</span> Hujjatlar
            </NavLink>
          </div>

          {user?.role === 'admin' && (
            <div className="nav-section">
              <div className="nav-section-title">Tizim</div>
              <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="icon">👥</span> Foydalanuvchilar
              </NavLink>
            </div>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">{user?.full_name?.[0] || 'A'}</div>
            <div>
              <div className="sidebar-user-name">{user?.full_name}</div>
              <div className="sidebar-user-role">{roleLabels[user?.role]}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>🚪 Chiqish</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <h1 className="topbar-title">{getTitle()}</h1>
          <div className="topbar-right">
            <span style={{fontSize:13, color:'var(--text-muted)', fontWeight:600}}>
              {new Date().toLocaleDateString('uz-UZ', { year:'numeric', month:'long', day:'numeric' })}
            </span>
          </div>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}