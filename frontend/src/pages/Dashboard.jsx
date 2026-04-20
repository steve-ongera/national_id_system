// Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService, authService } from '../services/api'
import toast from 'react-hot-toast'

// Application pipeline stages in order
const PIPELINE_STAGES = [
    { key: 'PENDING',    label: 'Submitted',  icon: 'bi-send'           },
    { key: 'VERIFIED',   label: 'Verified',   icon: 'bi-patch-check'    },
    { key: 'PROCESSING', label: 'Processing', icon: 'bi-gear'           },
    { key: 'APPROVED',   label: 'Approved',   icon: 'bi-check2-all'     },
    { key: 'READY',      label: 'Ready',      icon: 'bi-person-vcard'   },
    { key: 'COLLECTED',  label: 'Collected',  icon: 'bi-bag-check'      },
]

const STATUS_ORDER = PIPELINE_STAGES.map(s => s.key)

const getBadgeClass = (status) => {
    const map = {
        PENDING:    'badge-pending',
        VERIFIED:   'badge-verified',
        PROCESSING: 'badge-processing',
        APPROVED:   'badge-approved',
        REJECTED:   'badge-rejected',
        READY:      'badge-ready',
        COLLECTED:  'badge-collected',
    }
    return map[status] || 'badge-collected'
}

const getStepState = (stageKey, currentStatus) => {
    if (currentStatus === 'REJECTED') {
        const currentIdx = STATUS_ORDER.indexOf('PROCESSING')
        const stageIdx   = STATUS_ORDER.indexOf(stageKey)
        if (stageIdx < currentIdx) return 'done'
        if (stageKey === 'PROCESSING') return 'rejected'
        return ''
    }
    const currentIdx = STATUS_ORDER.indexOf(currentStatus)
    const stageIdx   = STATUS_ORDER.indexOf(stageKey)
    if (stageIdx < currentIdx)  return 'done'
    if (stageIdx === currentIdx) return 'active'
    return ''
}

const Dashboard = () => {
    const navigate = useNavigate()
    const [userData, setUserData]               = useState(null)
    const [applicationStatus, setApplicationStatus] = useState(null)
    const [loading, setLoading]                 = useState(true)

    useEffect(() => { fetchDashboardData() }, [])

    const fetchDashboardData = async () => {
        try {
            const user   = authService.getCurrentUser()
            setUserData(user)
            const status = await userService.getApplicationStatus()
            setApplicationStatus(status)
        } catch {
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="page-loader">
                    <div className="loader-ring"></div>
                    <p>Loading your dashboard…</p>
                </div>
                {/* Skeleton cards */}
                <div className="stats-grid">
                    {[1,2,3].map(i => (
                        <div key={i} className="gov-card p-4">
                            <div className="skeleton skeleton-heading mb-3"></div>
                            <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const hasApplied  = applicationStatus?.has_applied
    const status      = applicationStatus?.status
    const isVerified  = applicationStatus?.is_verified
    const appliedDate = applicationStatus?.application_date
        ? new Date(applicationStatus.application_date).toLocaleDateString('en-KE', {
              day: 'numeric', month: 'long', year: 'numeric'
          })
        : null

    return (
        <div className="page-wrapper animate-fade-in">

            {/* ── Page header ── */}
            <div className="page-header">
                <div className="page-eyebrow">
                    <i className="bi bi-house"></i>
                    Dashboard
                </div>
                <h2>
                    Welcome back, {userData?.first_name} {userData?.last_name}
                </h2>
                <p className="page-subtitle">
                    Track and manage your National ID application from here.
                </p>
            </div>

            {/* ── Stat cards ── */}
            <div className="stats-grid">

                {/* Application status card */}
                <div className="stat-card animate-fade-in delay-1">
                    <div className="stat-top">
                        <div className="stat-icon-wrap">
                            <i className="bi bi-person-vcard"></i>
                        </div>
                        {hasApplied && status && (
                            <span className={`gov-badge ${getBadgeClass(status)}`}>
                                {status}
                            </span>
                        )}
                    </div>
                    <div className="stat-value">
                        {hasApplied ? status : '—'}
                    </div>
                    <div className="stat-title">Application Status</div>
                    {appliedDate && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)', marginTop: '0.4rem' }}>
                            <i className="bi bi-calendar3 me-1"></i>
                            Applied {appliedDate}
                        </div>
                    )}
                </div>

                {/* Verification card */}
                <div className={`stat-card animate-fade-in delay-2 ${isVerified ? '' : 'accent-gold'}`}>
                    <div className="stat-top">
                        <div className="stat-icon-wrap" style={isVerified ? {} : { background: 'var(--gov-gold-light)' }}>
                            <i
                                className={`bi ${isVerified ? 'bi-patch-check-fill' : 'bi-patch-question'}`}
                                style={{ color: isVerified ? 'var(--gov-green)' : 'var(--gov-gold)' }}
                            ></i>
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.375rem' }}>
                        {isVerified ? 'Verified' : 'Not Verified'}
                    </div>
                    <div className="stat-title">Identity Verification</div>
                </div>

                {/* Quick info card */}
                <div className="stat-card accent-info animate-fade-in delay-3">
                    <div className="stat-top">
                        <div className="stat-icon-wrap" style={{ background: 'var(--info-light)' }}>
                            <i className="bi bi-info-circle" style={{ color: 'var(--info)' }}></i>
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.375rem' }}>
                        {hasApplied ? 'Submitted' : 'Not Started'}
                    </div>
                    <div className="stat-title">Application</div>
                </div>
            </div>

            {/* ── Application pipeline ── */}
            {hasApplied && status !== 'REJECTED' && (
                <div className="gov-card animate-fade-in delay-2">
                    <div className="gov-card-header">
                        <div className="gov-card-title">
                            <i className="bi bi-arrow-right-circle"></i>
                            Application Progress
                        </div>
                    </div>
                    <div className="gov-card-body">
                        <div className="status-pipeline">
                            {PIPELINE_STAGES.map((stage) => {
                                const state = getStepState(stage.key, status)
                                return (
                                    <div key={stage.key} className={`status-step ${state}`}>
                                        <div className="step-circle">
                                            {state === 'done'
                                                ? <i className="bi bi-check-lg"></i>
                                                : <i className={`bi ${stage.icon}`}></i>
                                            }
                                        </div>
                                        <div className="step-label">{stage.label}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Quick actions ── */}
            <div className="gov-card animate-fade-in delay-3">
                <div className="gov-card-header">
                    <div className="gov-card-title">
                        <i className="bi bi-lightning"></i>
                        Quick Actions
                    </div>
                </div>
                <div className="gov-card-body">
                    <div className="quick-actions">
                        {!hasApplied && (
                            <button
                                className="quick-action-card"
                                onClick={() => navigate('/apply-id')}
                            >
                                <div className="qa-icon">
                                    <i className="bi bi-file-earmark-plus"></i>
                                </div>
                                <span className="qa-label">Apply for ID</span>
                            </button>
                        )}
                        <button
                            className="quick-action-card"
                            onClick={() => navigate('/application-status')}
                        >
                            <div className="qa-icon">
                                <i className="bi bi-bar-chart-line"></i>
                            </div>
                            <span className="qa-label">View Status</span>
                        </button>
                        <button
                            className="quick-action-card"
                            onClick={() => navigate('/profile')}
                        >
                            <div className="qa-icon">
                                <i className="bi bi-person-gear"></i>
                            </div>
                            <span className="qa-label">My Profile</span>
                        </button>
                        <button className="quick-action-card" disabled>
                            <div className="qa-icon">
                                <i className="bi bi-download"></i>
                            </div>
                            <span className="qa-label">Download Receipt</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Context-sensitive alerts ── */}

            {/* Not yet applied */}
            {!hasApplied && (
                <div className="gov-alert alert-info animate-fade-in">
                    <i className="bi bi-info-circle-fill alert-icon"></i>
                    <div className="alert-body">
                        <div className="alert-title">Start Your Application</div>
                        <p>You haven't applied for your National ID yet.</p>
                        <button
                            className="btn-gov btn-gov-primary btn-gov-sm"
                            onClick={() => navigate('/apply-id')}
                        >
                            <i className="bi bi-file-earmark-plus"></i>
                            Apply for ID Now
                        </button>
                    </div>
                </div>
            )}

            {/* Rejected */}
            {status === 'REJECTED' && applicationStatus?.rejection_reason && (
                <div className="gov-alert alert-danger animate-fade-in">
                    <i className="bi bi-exclamation-triangle-fill alert-icon"></i>
                    <div className="alert-body">
                        <div className="alert-title">Application Rejected</div>
                        <p>
                            <strong>Reason:</strong> {applicationStatus.rejection_reason}
                        </p>
                        <p style={{ marginBottom: 0 }}>
                            Please visit your nearest Huduma Centre or registration office for assistance.
                        </p>
                    </div>
                </div>
            )}

            {/* Ready for collection */}
            {status === 'READY' && (
                <div className="gov-alert alert-success animate-fade-in">
                    <i className="bi bi-bag-check-fill alert-icon"></i>
                    <div className="alert-body">
                        <div className="alert-title">ID Card Ready for Collection!</div>
                        <p style={{ marginBottom: 0 }}>
                            Your National ID card is ready. Please visit the registration centre
                            where you applied with your acknowledgement slip to collect it.
                        </p>
                    </div>
                </div>
            )}

            {/* Approved — not yet ready */}
            {status === 'APPROVED' && (
                <div className="gov-alert alert-info animate-fade-in">
                    <i className="bi bi-check2-circle alert-icon"></i>
                    <div className="alert-body">
                        <div className="alert-title">Application Approved</div>
                        <p style={{ marginBottom: 0 }}>
                            Your application has been approved and your ID card is being printed.
                            You will be notified when it is ready for collection.
                        </p>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Dashboard