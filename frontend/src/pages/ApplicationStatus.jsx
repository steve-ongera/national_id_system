// ApplicationStatus.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService, applicationService } from '../services/api'
import toast from 'react-hot-toast'

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

const getHistoryItemClass = (status) => {
    if (status === 'REJECTED') return 'rejected'
    if (status === 'PENDING')  return 'pending'
    return ''
}

const ApplicationStatus = () => {
    const navigate = useNavigate()
    const [status,      setStatus]      = useState(null)
    const [application, setApplication] = useState(null)
    const [history,     setHistory]     = useState([])
    const [loading,     setLoading]     = useState(true)

    useEffect(() => { fetchStatus() }, [])

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
        } catch {
            toast.error('Failed to load application status')
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
                    <p>Loading application status…</p>
                </div>
            </div>
        )
    }

    /* ── No application ── */
    if (!status?.has_applied) {
        return (
            <div className="page-wrapper animate-fade-in">
                <div className="page-header">
                    <div className="page-eyebrow">
                        <i className="bi bi-bar-chart-line"></i>
                        Application Status
                    </div>
                    <h2>No Application Found</h2>
                </div>

                <div className="empty-state gov-card">
                    <div className="empty-icon">
                        <i className="bi bi-file-earmark-x"></i>
                    </div>
                    <h5>You haven't submitted an application yet</h5>
                    <p>
                        Start your National ID application to track its progress here.
                    </p>
                    <button
                        className="btn-gov btn-gov-primary"
                        onClick={() => navigate('/apply-id')}
                    >
                        <i className="bi bi-file-earmark-plus"></i>
                        Apply for ID Now
                    </button>
                </div>
            </div>
        )
    }

    const currentStatus = status.status
    const appliedDate   = status.application_date
        ? new Date(status.application_date).toLocaleDateString('en-KE', {
              day: 'numeric', month: 'long', year: 'numeric'
          })
        : '—'

    return (
        <div className="page-wrapper animate-fade-in">

            {/* ── Page header ── */}
            <div className="page-header">
                <div className="gov-breadcrumb">
                    <a href="/dashboard">Dashboard</a>
                    <span className="breadcrumb-sep"><i className="bi bi-chevron-right"></i></span>
                    <span>Application Status</span>
                </div>
                <div className="page-eyebrow">
                    <i className="bi bi-bar-chart-line"></i>
                    Tracking
                </div>
                <h2>Application Status</h2>
                <p className="page-subtitle">
                    Real-time progress of your National ID application.
                </p>
            </div>

            {/* ── Status summary cards ── */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card animate-fade-in delay-1">
                    <div className="stat-top">
                        <div className="stat-icon-wrap">
                            <i className="bi bi-person-vcard"></i>
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                        <span className={`gov-badge ${getBadgeClass(currentStatus)}`}>
                            <i className="bi bi-circle-fill" style={{ fontSize: '0.45rem' }}></i>
                            {currentStatus}
                        </span>
                    </div>
                    <div className="stat-title">Current Status</div>
                </div>

                <div className="stat-card accent-gold animate-fade-in delay-2">
                    <div className="stat-top">
                        <div className="stat-icon-wrap" style={{ background: 'var(--gov-gold-light)' }}>
                            <i className="bi bi-calendar3" style={{ color: 'var(--gov-gold)' }}></i>
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.0625rem', fontFamily: 'var(--font-body)' }}>
                        {appliedDate}
                    </div>
                    <div className="stat-title">Date Submitted</div>
                </div>

                <div className="stat-card animate-fade-in delay-3">
                    <div className="stat-top">
                        <div className="stat-icon-wrap">
                            <i className="bi bi-patch-check"></i>
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.1875rem' }}>
                        {status.is_verified
                            ? <span style={{ color: 'var(--success)', fontSize: '1rem' }}><i className="bi bi-check-circle-fill me-1"></i>Verified</span>
                            : <span style={{ color: 'var(--warning)', fontSize: '1rem' }}><i className="bi bi-hourglass-split me-1"></i>Pending</span>
                        }
                    </div>
                    <div className="stat-title">Verification</div>
                </div>
            </div>

            {/* ── Pipeline progress ── */}
            <div className="gov-card animate-fade-in delay-2">
                <div className="gov-card-header">
                    <div className="gov-card-title">
                        <i className="bi bi-arrow-right-circle"></i>
                        Application Progress
                    </div>
                </div>
                <div className="gov-card-body">
                    {currentStatus === 'REJECTED' && (
                        <div className="gov-alert alert-danger mb-3" style={{ marginBottom: '1.25rem' }}>
                            <i className="bi bi-x-circle-fill alert-icon"></i>
                            <div className="alert-body">
                                <div className="alert-title">Application Rejected</div>
                                {status.rejection_reason && <p style={{ marginBottom: 0 }}>{status.rejection_reason}</p>}
                            </div>
                        </div>
                    )}
                    <div className="status-pipeline">
                        {PIPELINE_STAGES.map((stage) => {
                            const state = getStepState(stage.key, currentStatus)
                            return (
                                <div key={stage.key} className={`status-step ${state}`}>
                                    <div className="step-circle">
                                        {state === 'done'
                                            ? <i className="bi bi-check-lg"></i>
                                            : state === 'rejected'
                                            ? <i className="bi bi-x-lg"></i>
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

            {/* ── Application details ── */}
            {application && (
                <div className="gov-card animate-fade-in delay-3">
                    <div className="gov-card-header">
                        <div className="gov-card-title">
                            <i className="bi bi-file-earmark-text"></i>
                            Application Details
                        </div>
                        {application.application_number && (
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--grey-500)',
                                fontFamily: 'monospace',
                                background: 'var(--grey-50)',
                                border: '1px solid var(--grey-200)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.2rem 0.6rem',
                            }}>
                                #{application.application_number}
                            </span>
                        )}
                    </div>
                    <div className="gov-card-body" style={{ padding: 0 }}>
                        <div className="gov-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                            <table className="gov-table">
                                <tbody>
                                    <tr>
                                        <td className="col-label">Application Number</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {application.application_number}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="col-label">Parent / Guardian Name</td>
                                        <td>{application.parents_name || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td className="col-label">Marital Status</td>
                                        <td style={{ textTransform: 'capitalize' }}>
                                            {application.marital_status?.toLowerCase() || '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="col-label">Occupation</td>
                                        <td>{application.occupation || 'Not specified'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Application history timeline ── */}
            {history.length > 0 && (
                <div className="gov-card animate-fade-in">
                    <div className="gov-card-header">
                        <div className="gov-card-title">
                            <i className="bi bi-clock-history"></i>
                            Activity History
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--grey-400)' }}>
                            {history.length} event{history.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="gov-card-body">
                        <div className="history-timeline">
                            {history.map((item, index) => (
                                <div
                                    key={index}
                                    className={`history-item ${getHistoryItemClass(item.status)}`}
                                >
                                    <div className="history-dot"></div>
                                    <div className="history-header">
                                        <span className="history-status">
                                            <span className={`gov-badge ${getBadgeClass(item.status)}`}
                                                style={{ fontSize: '0.65rem' }}>
                                                {item.status}
                                            </span>
                                        </span>
                                        <span className="history-time">
                                            <i className="bi bi-clock me-1"></i>
                                            {new Date(item.changed_at).toLocaleString('en-KE', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    {item.comment && (
                                        <div className="history-comment">{item.comment}</div>
                                    )}
                                    {item.changed_by_name && (
                                        <div className="history-by">
                                            <i className="bi bi-person me-1"></i>
                                            {item.changed_by_name}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Ready for collection banner ── */}
            {currentStatus === 'READY' && (
                <div className="gov-alert alert-success animate-fade-in">
                    <i className="bi bi-bag-check-fill alert-icon"></i>
                    <div className="alert-body">
                        <div className="alert-title">ID Card Ready for Collection!</div>
                        <p style={{ marginBottom: 0 }}>
                            Your National ID card is ready. Visit the registration centre where you
                            applied, bringing your acknowledgement slip and a copy of your birth certificate.
                        </p>
                    </div>
                </div>
            )}

        </div>
    )
}

export default ApplicationStatus