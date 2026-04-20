// ApplyId.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applicationService } from '../services/api'
import toast from 'react-hot-toast'

const STEPS = ['Personal Details', 'Employment', 'Declaration']

const ApplyId = () => {
    const navigate  = useNavigate()
    const [step,    setStep]    = useState(0)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        parents_name:          '',
        marital_status:        'SINGLE',
        occupation:            '',
        employer_name:         '',
        is_declaration_signed: false,
    })

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    const handleNext = (e) => {
        e.preventDefault()
        setStep(s => Math.min(s + 1, STEPS.length - 1))
    }

    const handleBack = () => setStep(s => Math.max(s - 1, 0))

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.is_declaration_signed) {
            toast.error('Please accept the declaration to proceed.')
            return
        }

        setLoading(true)
        try {
            await applicationService.submitApplication(formData)
            toast.success('Application submitted successfully!')
            navigate('/application-status')
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit application.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-wrapper animate-fade-in">

            {/* ── Page header ── */}
            <div className="page-header">
                <div className="gov-breadcrumb">
                    <a href="/dashboard">Dashboard</a>
                    <span className="breadcrumb-sep"><i className="bi bi-chevron-right"></i></span>
                    <span>Apply for National ID</span>
                </div>
                <div className="page-eyebrow">
                    <i className="bi bi-file-earmark-plus"></i>
                    New Application
                </div>
                <h2>National ID Application Form</h2>
                <p className="page-subtitle">
                    Complete all sections accurately. Incorrect information may result in rejection.
                </p>
            </div>

            <div className="row g-4">

                {/* ── Left: step sidebar ── */}
                <div className="col-lg-3">
                    <div className="gov-card animate-fade-in delay-1" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 1.5rem)' }}>
                        <div className="gov-card-header">
                            <div className="gov-card-title">
                                <i className="bi bi-list-check"></i>
                                Form Steps
                            </div>
                        </div>
                        <div className="gov-card-body" style={{ padding: '0.75rem' }}>
                            {STEPS.map((label, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.625rem 0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '0.25rem',
                                        background: step === i
                                            ? 'var(--gov-green-light)'
                                            : i < step
                                            ? 'var(--success-light)'
                                            : 'transparent',
                                        transition: 'background var(--transition-fast)',
                                    }}
                                >
                                    <div style={{
                                        width: 28, height: 28,
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                        background: step === i
                                            ? 'var(--gov-green)'
                                            : i < step
                                            ? 'var(--success)'
                                            : 'var(--grey-200)',
                                        color: step === i || i < step ? 'var(--white)' : 'var(--grey-500)',
                                        transition: 'all var(--transition-fast)',
                                    }}>
                                        {i < step
                                            ? <i className="bi bi-check-lg"></i>
                                            : i + 1
                                        }
                                    </div>
                                    <span style={{
                                        fontSize: '0.8125rem',
                                        fontWeight: step === i ? 600 : 400,
                                        color: step === i
                                            ? 'var(--gov-green-dark)'
                                            : i < step
                                            ? 'var(--success)'
                                            : 'var(--grey-500)',
                                    }}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Help note */}
                        <div className="gov-card-footer">
                            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                                <i className="bi bi-telephone" style={{ color: 'var(--gov-green)', fontSize: '0.8rem', marginTop: 2 }}></i>
                                <p style={{ fontSize: '0.75rem', color: 'var(--grey-500)', margin: 0, lineHeight: 1.5 }}>
                                    Need help? Call <strong>0800 723 777</strong> (toll-free) or visit your nearest Huduma Centre.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: form steps ── */}
                <div className="col-lg-9">
                    <div className="gov-card animate-fade-in delay-2">

                        {/* Step header bar */}
                        <div className="gov-card-header">
                            <div className="gov-card-title">
                                <i className={`bi ${
                                    step === 0 ? 'bi-person-lines-fill'
                                    : step === 1 ? 'bi-briefcase'
                                    : 'bi-shield-check'
                                }`}></i>
                                Step {step + 1} — {STEPS[step]}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>
                                {step + 1} of {STEPS.length}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: 3, background: 'var(--grey-100)' }}>
                            <div style={{
                                height: '100%',
                                width: `${((step + 1) / STEPS.length) * 100}%`,
                                background: 'var(--gov-green)',
                                borderRadius: '0 2px 2px 0',
                                transition: 'width var(--transition-slow)',
                            }} />
                        </div>

                        <form onSubmit={step < STEPS.length - 1 ? handleNext : handleSubmit}>
                            <div className="gov-card-body">

                                {/* ══ STEP 0 — Personal Details ══ */}
                                {step === 0 && (
                                    <div className="animate-fade-in">
                                        <div className="form-section-label">Guardian Information</div>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-6">
                                                <label className="gov-label" htmlFor="parents_name">
                                                    Parent's / Guardian's Full Name
                                                    <span className="required-mark"> *</span>
                                                </label>
                                                <input
                                                    id="parents_name"
                                                    type="text"
                                                    className="gov-input"
                                                    name="parents_name"
                                                    value={formData.parents_name}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Jane Wanjiku Mwangi"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="gov-label" htmlFor="marital_status">
                                                    Marital Status
                                                    <span className="required-mark"> *</span>
                                                </label>
                                                <select
                                                    id="marital_status"
                                                    className="gov-select"
                                                    name="marital_status"
                                                    value={formData.marital_status}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="SINGLE">Single</option>
                                                    <option value="MARRIED">Married</option>
                                                    <option value="DIVORCED">Divorced</option>
                                                    <option value="WIDOWED">Widowed</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="gov-alert alert-info">
                                            <i className="bi bi-info-circle-fill alert-icon"></i>
                                            <div className="alert-body">
                                                <div className="alert-title">What is this for?</div>
                                                <p style={{ marginBottom: 0 }}>
                                                    Your parent's or guardian's name is required for identity
                                                    verification purposes as part of civil registration records.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ══ STEP 1 — Employment ══ */}
                                {step === 1 && (
                                    <div className="animate-fade-in">
                                        <div className="form-section-label">Employment Details</div>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-6">
                                                <label className="gov-label" htmlFor="occupation">
                                                    Occupation
                                                </label>
                                                <input
                                                    id="occupation"
                                                    type="text"
                                                    className="gov-input"
                                                    name="occupation"
                                                    value={formData.occupation}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Teacher, Engineer, Student"
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="gov-label" htmlFor="employer_name">
                                                    Employer Name
                                                    <span style={{ fontWeight: 400, color: 'var(--grey-400)', marginLeft: '0.3rem', fontSize: '0.75rem' }}>
                                                        (if applicable)
                                                    </span>
                                                </label>
                                                <input
                                                    id="employer_name"
                                                    type="text"
                                                    className="gov-input"
                                                    name="employer_name"
                                                    value={formData.employer_name}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Ministry of Education"
                                                />
                                            </div>
                                        </div>

                                        <div className="gov-alert alert-warning">
                                            <i className="bi bi-exclamation-triangle-fill alert-icon"></i>
                                            <div className="alert-body">
                                                <div className="alert-title">Optional but Recommended</div>
                                                <p style={{ marginBottom: 0 }}>
                                                    Employment information is optional. If you are a student,
                                                    enter your school or institution name as the employer.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ══ STEP 2 — Declaration ══ */}
                                {step === 2 && (
                                    <div className="animate-fade-in">
                                        <div className="form-section-label">Review & Declaration</div>

                                        {/* Summary table */}
                                        <div className="gov-table-wrap mb-4">
                                            <table className="gov-table">
                                                <thead>
                                                    <tr>
                                                        <th colSpan={2}>Application Summary</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="col-label">Parent / Guardian</td>
                                                        <td>{formData.parents_name || <em style={{ color: 'var(--grey-300)' }}>Not provided</em>}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="col-label">Marital Status</td>
                                                        <td style={{ textTransform: 'capitalize' }}>{formData.marital_status.toLowerCase()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="col-label">Occupation</td>
                                                        <td>{formData.occupation || <em style={{ color: 'var(--grey-300)' }}>Not specified</em>}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="col-label">Employer</td>
                                                        <td>{formData.employer_name || <em style={{ color: 'var(--grey-300)' }}>Not specified</em>}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Declaration box */}
                                        <div style={{
                                            background: formData.is_declaration_signed ? 'var(--success-light)' : 'var(--grey-50)',
                                            border: `1.5px solid ${formData.is_declaration_signed ? 'var(--success-border)' : 'var(--grey-200)'}`,
                                            borderRadius: 'var(--radius-md)',
                                            padding: '1.25rem',
                                            transition: 'all var(--transition-base)',
                                            marginBottom: '1rem',
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                gap: '0.875rem',
                                                alignItems: 'flex-start',
                                            }}>
                                                {/* Custom checkbox */}
                                                <div style={{ flexShrink: 0, marginTop: '1px' }}>
                                                    <input
                                                        type="checkbox"
                                                        id="declaration"
                                                        name="is_declaration_signed"
                                                        checked={formData.is_declaration_signed}
                                                        onChange={handleChange}
                                                        style={{
                                                            width: 18, height: 18,
                                                            accentColor: 'var(--gov-green)',
                                                            cursor: 'pointer',
                                                        }}
                                                    />
                                                </div>
                                                <label htmlFor="declaration" style={{ cursor: 'pointer', flex: 1 }}>
                                                    <div style={{
                                                        fontWeight: 700,
                                                        fontSize: '0.875rem',
                                                        color: 'var(--grey-800)',
                                                        marginBottom: '0.35rem',
                                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                    }}>
                                                        <i className="bi bi-shield-check" style={{ color: 'var(--gov-green)' }}></i>
                                                        Statutory Declaration
                                                    </div>
                                                    <p style={{ fontSize: '0.8125rem', color: 'var(--grey-600)', lineHeight: 1.6, margin: 0 }}>
                                                        I hereby declare that all information provided in this application is
                                                        <strong> true, accurate, and complete</strong> to the best of my knowledge.
                                                        I understand that providing false information constitutes an offence under the
                                                        <em> Kenya Citizenship and Immigration Act, Cap. 170</em>, and may result in
                                                        criminal prosecution.
                                                    </p>
                                                </label>
                                            </div>

                                            {formData.is_declaration_signed && (
                                                <div style={{
                                                    marginTop: '0.875rem',
                                                    paddingTop: '0.875rem',
                                                    borderTop: '1px solid var(--success-border)',
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600,
                                                }}>
                                                    <i className="bi bi-check-circle-fill"></i>
                                                    Declaration accepted — you may submit your application.
                                                </div>
                                            )}
                                        </div>

                                        <div className="gov-alert alert-danger">
                                            <i className="bi bi-exclamation-octagon-fill alert-icon"></i>
                                            <div className="alert-body">
                                                <div className="alert-title">Important Notice</div>
                                                <p style={{ marginBottom: 0 }}>
                                                    Ensure all information is accurate before submitting. Once submitted,
                                                    your application will be reviewed by a civil registration officer.
                                                    Amendments after submission require a physical visit to a registration centre.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* ── Form footer / navigation ── */}
                            <div className="gov-card-footer" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem',
                            }}>
                                <button
                                    type="button"
                                    className="btn-gov btn-gov-secondary"
                                    onClick={step === 0 ? () => navigate('/dashboard') : handleBack}
                                >
                                    <i className={`bi ${step === 0 ? 'bi-x' : 'bi-arrow-left'}`}></i>
                                    {step === 0 ? 'Cancel' : 'Back'}
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {/* Dot progress */}
                                    {STEPS.map((_, i) => (
                                        <div key={i} style={{
                                            width: i === step ? 20 : 7,
                                            height: 7,
                                            borderRadius: 99,
                                            background: i <= step ? 'var(--gov-green)' : 'var(--grey-200)',
                                            transition: 'all var(--transition-base)',
                                        }} />
                                    ))}
                                </div>

                                {step < STEPS.length - 1 ? (
                                    <button type="submit" className="btn-gov btn-gov-primary">
                                        Continue
                                        <i className="bi bi-arrow-right"></i>
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="btn-gov btn-gov-primary"
                                        disabled={loading || !formData.is_declaration_signed}
                                    >
                                        {loading ? (
                                            <>
                                                <span style={{
                                                    width: 14, height: 14,
                                                    border: '2px solid rgba(255,255,255,0.4)',
                                                    borderTopColor: '#fff',
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                    animation: 'spin 0.7s linear infinite',
                                                }}></span>
                                                Submitting…
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-send-check"></i>
                                                Submit Application
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ApplyId