import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService, authService } from '../services/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
    const navigate = useNavigate()
    const [userData, setUserData] = useState(null)
    const [applicationStatus, setApplicationStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        fetchDashboardData()
    }, [])
    
    const fetchDashboardData = async () => {
        try {
            const user = authService.getCurrentUser()
            setUserData(user)
            
            const status = await userService.getApplicationStatus()
            setApplicationStatus(status)
        } catch (error) {
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }
    
    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'warning',
            'VERIFIED': 'info',
            'PROCESSING': 'primary',
            'APPROVED': 'success',
            'REJECTED': 'danger',
            'READY': 'success',
            'COLLECTED': 'secondary'
        }
        return colors[status] || 'secondary'
    }
    
    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }
    
    return (
        <div className="dashboard-container">
            <div className="container">
                <div className="row mb-4">
                    <div className="col-12">
                        <h2 className="text-white">
                            Welcome back, {userData?.first_name} {userData?.last_name}
                        </h2>
                        <p className="text-white-50">Track your ID application progress</p>
                    </div>
                </div>
                
                <div className="row">
                    <div className="col-md-6 mb-4">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="fas fa-id-card"></i>
                            </div>
                            <div className="stat-title">Application Status</div>
                            <div className="stat-value">
                                <span className={`badge bg-${getStatusColor(applicationStatus?.status)}`}>
                                    {applicationStatus?.status || 'Not Applied'}
                                </span>
                            </div>
                            {applicationStatus?.application_date && (
                                <small className="text-muted d-block mt-2">
                                    Applied on: {new Date(applicationStatus.application_date).toLocaleDateString()}
                                </small>
                            )}
                        </div>
                    </div>
                    
                    <div className="col-md-6 mb-4">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div className="stat-title">Verification Status</div>
                            <div className="stat-value">
                                {applicationStatus?.is_verified ? (
                                    <span className="text-success">Verified ✓</span>
                                ) : (
                                    <span className="text-warning">Pending Verification</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {!applicationStatus?.has_applied && (
                    <div className="row">
                        <div className="col-12">
                            <div className="alert alert-info">
                                <h5><i className="fas fa-info-circle"></i> Start Your Application</h5>
                                <p>You haven't applied for your National ID yet. Click the button below to start your application.</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate('/apply-id')}
                                >
                                    Apply for ID Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {applicationStatus?.status === 'REJECTED' && applicationStatus?.rejection_reason && (
                    <div className="row">
                        <div className="col-12">
                            <div className="alert alert-danger">
                                <h5><i className="fas fa-exclamation-triangle"></i> Application Rejected</h5>
                                <p><strong>Reason:</strong> {applicationStatus.rejection_reason}</p>
                                <p>Please visit your nearest registration center for assistance.</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {applicationStatus?.status === 'READY' && (
                    <div className="row">
                        <div className="col-12">
                            <div className="alert alert-success">
                                <h5><i className="fas fa-check-circle"></i> ID Card Ready for Collection!</h5>
                                <p>Your National ID card is ready. Please visit the registration center where you applied to collect it.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard