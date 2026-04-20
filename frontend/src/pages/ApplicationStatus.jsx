import React, { useState, useEffect } from 'react'
import { userService, applicationService } from '../services/api'
import toast from 'react-hot-toast'

const ApplicationStatus = () => {
    const [status, setStatus] = useState(null)
    const [application, setApplication] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        fetchStatus()
    }, [])
    
    const fetchStatus = async () => {
        try {
            const statusData = await userService.getApplicationStatus()
            setStatus(statusData)
            
            if (statusData.has_applied) {
                const apps = await applicationService.getMyApplication()
                if (apps && apps.length > 0) {
                    setApplication(apps[0])
                    const historyData = await applicationService.getApplicationHistory(apps[0].id)
                    setHistory(historyData)
                }
            }
        } catch (error) {
            toast.error('Failed to load application status')
        } finally {
            setLoading(false)
        }
    }
    
    const getStatusIcon = (status) => {
        const icons = {
            'PENDING': 'fa-clock',
            'VERIFIED': 'fa-check-circle',
            'PROCESSING': 'fa-cogs',
            'APPROVED': 'fa-check-double',
            'REJECTED': 'fa-times-circle',
            'READY': 'fa-id-card',
            'COLLECTED': 'fa-hand-peace'
        }
        return icons[status] || 'fa-question-circle'
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
    
    if (!status?.has_applied) {
        return (
            <div className="container py-4">
                <div className="alert alert-info">
                    <h5><i className="fas fa-info-circle"></i> No Application Found</h5>
                    <p>You haven't submitted an ID application yet.</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => window.location.href = '/apply-id'}
                    >
                        Apply for ID Now
                    </button>
                </div>
            </div>
        )
    }
    
    return (
        <div className="container py-4">
            <div className="form-container">
                <h3 className="form-title">
                    <i className="fas fa-chart-line me-2"></i>
                    Application Status
                </h3>
                
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="stat-card text-center">
                            <div className="stat-icon">
                                <i className={`fas ${getStatusIcon(status.status)} fa-3x text-${getStatusColor(status.status)}`}></i>
                            </div>
                            <div className="stat-title">Current Status</div>
                            <div className="stat-value">
                                <span className={`badge bg-${getStatusColor(status.status)} fs-6`}>
                                    {status.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-md-6">
                        <div className="stat-card text-center">
                            <div className="stat-icon">
                                <i className="fas fa-calendar-alt fa-3x text-primary"></i>
                            </div>
                            <div className="stat-title">Application Date</div>
                            <div className="stat-value fs-5">
                                {new Date(status.application_date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
                
                {application && (
                    <div className="mt-4">
                        <h5>Application Details</h5>
                        <table className="table table-bordered">
                            <tbody>
                                <tr>
                                    <th width="30%">Application Number</th>
                                    <td>{application.application_number}</td>
                                </tr>
                                <tr>
                                    <th>Parent's/Guardian's Name</th>
                                    <td>{application.parents_name}</td>
                                </tr>
                                <tr>
                                    <th>Marital Status</th>
                                    <td>{application.marital_status}</td>
                                </tr>
                                <tr>
                                    <th>Occupation</th>
                                    <td>{application.occupation || 'Not specified'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
                
                {history.length > 0 && (
                    <div className="mt-4">
                        <h5>Application History</h5>
                        <div className="timeline">
                            {history.map((item, index) => (
                                <div key={index} className="card mb-2">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <strong className={`text-${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </strong>
                                            <small className="text-muted">
                                                {new Date(item.changed_at).toLocaleString()}
                                            </small>
                                        </div>
                                        {item.comment && (
                                            <p className="mb-0 mt-2">{item.comment}</p>
                                        )}
                                        {item.changed_by_name && (
                                            <small className="text-muted">By: {item.changed_by_name}</small>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {status.status === 'REJECTED' && status.rejection_reason && (
                    <div className="alert alert-danger mt-4">
                        <h5><i className="fas fa-exclamation-triangle"></i> Rejection Reason</h5>
                        <p>{status.rejection_reason}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ApplicationStatus