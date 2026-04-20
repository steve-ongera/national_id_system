import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import toast from 'react-hot-toast'

const Navbar = () => {
    const navigate = useNavigate()
    const user = authService.getCurrentUser()
    
    const handleLogout = async () => {
        await authService.logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }
    
    return (
        <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
            <div className="container">
                <Link className="navbar-brand" to="/dashboard">
                    <i className="fas fa-id-card me-2"></i>
                    National ID System
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/dashboard">
                                <i className="fas fa-tachometer-alt me-1"></i> Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/application-status">
                                <i className="fas fa-chart-line me-1"></i> Status
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/profile">
                                <i className="fas fa-user me-1"></i> Profile
                            </Link>
                        </li>
                        <li className="nav-item">
                            <button className="btn btn-link nav-link" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt me-1"></i> Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar