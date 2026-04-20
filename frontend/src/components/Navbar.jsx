// Navbar.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/api'
import toast from 'react-hot-toast'

const Navbar = ({ onSidebarToggle }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const user = authService.getCurrentUser()

    const handleLogout = async () => {
        await authService.logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    const getInitials = () => {
        const first = user?.first_name?.[0] || ''
        const last  = user?.last_name?.[0]  || ''
        return (first + last).toUpperCase() || 'U'
    }

    const navLinks = [
        { to: '/dashboard',           icon: 'bi-speedometer2',  label: 'Dashboard' },
        { to: '/application-status',  icon: 'bi-bar-chart-line', label: 'Status' },
        { to: '/profile',             icon: 'bi-person',         label: 'Profile' },
    ]

    return (
        <nav className="navbar-gov">

            {/* Sidebar toggle (hamburger) */}
            <button
                className="sidebar-toggle-btn"
                onClick={onSidebarToggle}
                aria-label="Toggle sidebar"
            >
                <i className="bi bi-list"></i>
            </button>

            {/* Brand */}
            <Link className="navbar-brand-wrapper" to="/dashboard">
                <div className="brand-emblem">
                    <i className="bi bi-person-vcard-fill"></i>
                </div>
                <div className="brand-text">
                    <span className="brand-title">National ID System</span>
                    <span className="brand-subtitle">Republic of Kenya</span>
                </div>
            </Link>

            <div className="navbar-spacer" />

            {/* Desktop nav links */}
            <div className="d-none d-lg-flex align-items-center gap-1 me-3">
                {navLinks.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`nav-icon-btn d-flex align-items-center gap-2 px-3 ${
                            location.pathname === link.to ? 'active' : ''
                        }`}
                        style={{
                            width: 'auto',
                            fontSize: '0.8375rem',
                            fontWeight: location.pathname === link.to ? 600 : 500,
                            color: location.pathname === link.to
                                ? 'var(--gov-green)'
                                : 'var(--grey-600)',
                            background: location.pathname === link.to
                                ? 'var(--gov-green-light)'
                                : 'transparent',
                            borderColor: location.pathname === link.to
                                ? 'var(--gov-green-mid)'
                                : 'var(--grey-200)',
                            textDecoration: 'none',
                        }}
                    >
                        <i className={`bi ${link.icon}`}></i>
                        {link.label}
                    </Link>
                ))}
            </div>

            {/* Right actions */}
            <div className="nav-actions">

                {/* Notifications placeholder */}
                <button className="nav-icon-btn" aria-label="Notifications" title="Notifications">
                    <i className="bi bi-bell"></i>
                </button>

                {/* Help */}
                <button className="nav-icon-btn" aria-label="Help" title="Help">
                    <i className="bi bi-question-circle"></i>
                </button>

                {/* User pill */}
                <div
                    className="nav-user-pill"
                    title={`${user?.first_name} ${user?.last_name}`}
                    style={{ cursor: 'default' }}
                >
                    <div className="nav-avatar">{getInitials()}</div>
                    <span className="nav-user-name d-none d-sm-inline">
                        {user?.first_name} {user?.last_name}
                    </span>
                </div>

                {/* Logout */}
                <button
                    className="nav-icon-btn"
                    onClick={handleLogout}
                    aria-label="Logout"
                    title="Sign out"
                    style={{ color: 'var(--grey-500)' }}
                >
                    <i className="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </nav>
    )
}

export default Navbar