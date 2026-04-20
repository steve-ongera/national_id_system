// Profile.jsx
import React, { useState, useEffect } from 'react'
import { userService } from '../services/api'
import toast from 'react-hot-toast'

const READONLY_FIELDS = [
    { key: 'id_number',          label: 'ID Number',            icon: 'bi-person-badge'     },
    { key: 'full_name',          label: 'Full Name',            icon: 'bi-person'            },
    { key: 'date_of_birth',      label: 'Date of Birth',        icon: 'bi-calendar3'         },
    { key: 'age',                label: 'Age',                  icon: 'bi-hourglass-split'   },
    { key: 'gender',             label: 'Gender',               icon: 'bi-gender-ambiguous'  },
    { key: 'place_of_birth',     label: 'Place of Birth',       icon: 'bi-geo'               },
]

const CONTACT_FIELDS = [
    { key: 'phone_number',       label: 'Phone Number',         icon: 'bi-telephone'         },
    { key: 'email',              label: 'Email Address',        icon: 'bi-envelope'          },
]

const ADDRESS_FIELDS = [
    { key: 'county_of_residence',label: 'County of Residence',  icon: 'bi-map'               },
    { key: 'sub_county',         label: 'Sub-County',           icon: 'bi-signpost-split'    },
    { key: 'ward',               label: 'Ward',                 icon: 'bi-signpost'          },
    { key: 'village',            label: 'Village',              icon: 'bi-houses'            },
    { key: 'postal_address',     label: 'Postal Address',       icon: 'bi-mailbox'           },
]

const formatValue = (key, val) => {
    if (!val) return <span style={{ color: 'var(--grey-300)', fontStyle: 'italic' }}>Not provided</span>
    if (key === 'date_of_birth') return new Date(val).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
    if (key === 'age')           return `${val} years`
    if (key === 'gender')        return val === 'M' ? 'Male' : 'Female'
    return val
}

const InfoRow = ({ icon, label, value, fieldKey }) => (
    <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--grey-100)',
    }}>
        <div style={{
            width: 32, height: 32,
            background: 'var(--gov-green-light)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            <i className={`bi ${icon}`} style={{ color: 'var(--gov-green)', fontSize: '0.8rem' }}></i>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--grey-400)', marginBottom: '0.15rem' }}>
                {label}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--grey-800)', fontWeight: 500 }}>
                {formatValue(fieldKey, value)}
            </div>
        </div>
    </div>
)

const Profile = () => {
    const [profile,   setProfile]   = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData,  setFormData]  = useState({})
    const [loading,   setLoading]   = useState(true)
    const [saving,    setSaving]    = useState(false)

    useEffect(() => { fetchProfile() }, [])

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile()
            setProfile(data)
            setFormData(data)
        } catch {
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const updated = await userService.updateProfile(formData)
            setProfile(updated)
            setIsEditing(false)
            toast.success('Profile updated successfully')
        } catch {
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setFormData(profile)
    }

    const getInitials = () => {
        const parts = (profile?.full_name || '').trim().split(' ')
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : (parts[0]?.[0] || 'U').toUpperCase()
    }

    /* ── Loading ── */
    if (loading && !profile) {
        return (
            <div className="page-wrapper">
                <div className="page-loader">
                    <div className="loader-ring"></div>
                    <p>Loading profile…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-wrapper animate-fade-in">

            {/* ── Page header ── */}
            <div className="page-header">
                <div className="gov-breadcrumb">
                    <a href="/dashboard">Dashboard</a>
                    <span className="breadcrumb-sep"><i className="bi bi-chevron-right"></i></span>
                    <span>My Profile</span>
                </div>
                <div className="page-eyebrow">
                    <i className="bi bi-person-circle"></i>
                    Account
                </div>
                <h2>My Profile</h2>
                <p className="page-subtitle">
                    Your personal information as registered with the civil registry.
                </p>
            </div>

            <div className="row g-4">

                {/* ── Left column: avatar card + read-only bio ── */}
                <div className="col-lg-4">

                    {/* Avatar card */}
                    <div className="gov-card animate-fade-in delay-1" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                        <div style={{
                            width: 80, height: 80,
                            background: 'var(--gov-green)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem',
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            color: 'var(--white)',
                            fontFamily: 'var(--font-display)',
                            boxShadow: '0 4px 16px rgba(0,107,63,0.25)',
                        }}>
                            {getInitials()}
                        </div>

                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--grey-900)', marginBottom: '0.25rem' }}>
                            {profile?.full_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--grey-500)', marginBottom: '1.25rem' }}>
                            ID No. {profile?.id_number}
                        </div>

                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            background: 'var(--gov-green-light)',
                            color: 'var(--gov-green-dark)',
                            fontSize: '0.72rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.07em',
                            padding: '0.3rem 0.75rem',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid var(--gov-green-mid)',
                        }}>
                            <i className="bi bi-shield-check"></i>
                            Registered Citizen
                        </div>

                        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--grey-100)', textAlign: 'left' }}>
                            {[
                                { icon: 'bi-calendar3',       val: profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' }) : '—' },
                                { icon: 'bi-gender-ambiguous', val: profile?.gender === 'M' ? 'Male' : profile?.gender === 'F' ? 'Female' : '—' },
                                { icon: 'bi-geo-alt',          val: profile?.county_of_residence || '—' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8125rem', color: 'var(--grey-600)', padding: '0.3rem 0' }}>
                                    <i className={`bi ${item.icon}`} style={{ color: 'var(--gov-green)', width: 14, textAlign: 'center' }}></i>
                                    {item.val}
                                </div>
                            ))}
                        </div>

                        {!isEditing && (
                            <button
                                className="btn-gov btn-gov-ghost"
                                style={{ width: '100%', marginTop: '1.25rem' }}
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="bi bi-pencil"></i>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Right column: detail sections / edit form ── */}
                <div className="col-lg-8">

                    {!isEditing ? (
                        <>
                            {/* Personal Info */}
                            <div className="gov-card animate-fade-in delay-2" style={{ marginBottom: '1.25rem' }}>
                                <div className="gov-card-header">
                                    <div className="gov-card-title">
                                        <i className="bi bi-person-lines-fill"></i>
                                        Personal Information
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>
                                        <i className="bi bi-lock-fill me-1"></i>Read-only
                                    </span>
                                </div>
                                <div className="gov-card-body">
                                    {READONLY_FIELDS.map(f => (
                                        <InfoRow
                                            key={f.key}
                                            icon={f.icon}
                                            label={f.label}
                                            value={profile?.[f.key]}
                                            fieldKey={f.key}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="gov-card animate-fade-in delay-3" style={{ marginBottom: '1.25rem' }}>
                                <div className="gov-card-header">
                                    <div className="gov-card-title">
                                        <i className="bi bi-telephone"></i>
                                        Contact Details
                                    </div>
                                    <button
                                        className="btn-gov btn-gov-secondary btn-gov-sm"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="bi bi-pencil"></i>
                                        Edit
                                    </button>
                                </div>
                                <div className="gov-card-body">
                                    {CONTACT_FIELDS.map(f => (
                                        <InfoRow
                                            key={f.key}
                                            icon={f.icon}
                                            label={f.label}
                                            value={profile?.[f.key]}
                                            fieldKey={f.key}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Address Info */}
                            <div className="gov-card animate-fade-in delay-4">
                                <div className="gov-card-header">
                                    <div className="gov-card-title">
                                        <i className="bi bi-geo-alt"></i>
                                        Residential Address
                                    </div>
                                </div>
                                <div className="gov-card-body">
                                    {ADDRESS_FIELDS.map(f => (
                                        <InfoRow
                                            key={f.key}
                                            icon={f.icon}
                                            label={f.label}
                                            value={profile?.[f.key]}
                                            fieldKey={f.key}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (

                        /* ── Edit form ── */
                        <div className="gov-card animate-scale-in">
                            <div className="gov-card-header">
                                <div className="gov-card-title">
                                    <i className="bi bi-pencil-square"></i>
                                    Edit Profile
                                </div>
                                <button
                                    className="nav-icon-btn"
                                    onClick={handleCancel}
                                    title="Discard changes"
                                    style={{ width: 32, height: 32 }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="gov-card-body">

                                    {/* Note */}
                                    <div className="gov-alert alert-info" style={{ marginBottom: '1.5rem' }}>
                                        <i className="bi bi-info-circle-fill alert-icon"></i>
                                        <div className="alert-body">
                                            <div className="alert-title">Editable Fields Only</div>
                                            <p style={{ marginBottom: 0 }}>
                                                Fields such as ID Number, Full Name, Date of Birth, and Gender
                                                are locked and managed by the civil registry.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Contact section */}
                                    <div className="form-section-label">Contact Information</div>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="gov-label" htmlFor="first_name">
                                                First Name <span className="required-mark">*</span>
                                            </label>
                                            <input
                                                id="first_name"
                                                type="text"
                                                className="gov-input"
                                                name="first_name"
                                                value={formData.first_name || ''}
                                                onChange={handleChange}
                                                required
                                                placeholder="First name"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="gov-label" htmlFor="last_name">
                                                Last Name <span className="required-mark">*</span>
                                            </label>
                                            <input
                                                id="last_name"
                                                type="text"
                                                className="gov-input"
                                                name="last_name"
                                                value={formData.last_name || ''}
                                                onChange={handleChange}
                                                required
                                                placeholder="Last name"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="gov-label" htmlFor="phone_number">
                                                Phone Number <span className="required-mark">*</span>
                                            </label>
                                            <input
                                                id="phone_number"
                                                type="tel"
                                                className="gov-input"
                                                name="phone_number"
                                                value={formData.phone_number || ''}
                                                onChange={handleChange}
                                                required
                                                placeholder="+254 7XX XXX XXX"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="gov-label" htmlFor="email">
                                                Email Address
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                className="gov-input"
                                                name="email"
                                                value={formData.email || ''}
                                                onChange={handleChange}
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Address section */}
                                    <div className="form-section-label">Postal Address</div>
                                    <div className="row g-3">
                                        <div className="col-md-8">
                                            <label className="gov-label" htmlFor="postal_address">
                                                Postal Address
                                            </label>
                                            <input
                                                id="postal_address"
                                                type="text"
                                                className="gov-input"
                                                name="postal_address"
                                                value={formData.postal_address || ''}
                                                onChange={handleChange}
                                                placeholder="P.O. Box XXXX"
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="gov-label" htmlFor="postal_code">
                                                Postal Code
                                            </label>
                                            <input
                                                id="postal_code"
                                                type="text"
                                                className="gov-input"
                                                name="postal_code"
                                                value={formData.postal_code || ''}
                                                onChange={handleChange}
                                                placeholder="00100"
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer actions */}
                                <div className="gov-card-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        className="btn-gov btn-gov-secondary"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        <i className="bi bi-x"></i>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-gov btn-gov-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-sm" style={{
                                                    width: 14, height: 14,
                                                    border: '2px solid rgba(255,255,255,0.4)',
                                                    borderTopColor: '#fff',
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                    animation: 'spin 0.7s linear infinite',
                                                }}></span>
                                                Saving…
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check2"></i>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile