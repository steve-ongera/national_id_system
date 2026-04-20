// Login.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import toast from 'react-hot-toast'

const Login = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        id_number: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await authService.login(formData.id_number, formData.password)
            toast.success('Login successful!')
            navigate('/dashboard')
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">

            {/* ── Left decorative panel ── */}
            <div className="login-panel-left">
                <div className="panel-content animate-fade-in">

                    <div className="coat-of-arms">
                        <i className="bi bi-shield-fill-check"></i>
                    </div>

                    <h1>Kenya National<br />ID System</h1>
                    <p className="panel-tagline">Republic of Kenya · Civil Registration</p>
                    <div className="panel-divider"></div>

                    <ul className="panel-info-list">
                        <li>
                            <i className="bi bi-person-vcard"></i>
                            Apply for your National Identity Card online
                        </li>
                        <li>
                            <i className="bi bi-clock-history"></i>
                            Track your application status in real time
                        </li>
                        <li>
                            <i className="bi bi-shield-lock"></i>
                            Secure, government-verified portal
                        </li>
                        <li>
                            <i className="bi bi-geo-alt"></i>
                            Visit any registration center to register
                        </li>
                    </ul>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="login-panel-right">
                <div className="login-form-wrapper animate-scale-in">

                    {/* Header */}
                    <div className="login-form-header">
                        <div className="login-eyebrow">
                            <i className="bi bi-globe2"></i>
                            Official Government Portal
                        </div>
                        <h2>Sign In</h2>
                        <p>Enter your registered ID number and password to continue.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate>

                        {/* ID Number */}
                        <div className="login-field">
                            <label className="field-label" htmlFor="id_number">
                                National ID Number
                            </label>
                            <div className="field-input-wrapper">
                                <i className="bi bi-person field-icon"></i>
                                <input
                                    id="id_number"
                                    type="text"
                                    className="field-input has-toggle"
                                    name="id_number"
                                    value={formData.id_number}
                                    onChange={handleChange}
                                    placeholder="e.g. 12345678"
                                    required
                                    pattern="\d{8}"
                                    title="ID Number must be 8 digits"
                                    autoComplete="username"
                                    inputMode="numeric"
                                    maxLength={8}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="login-field">
                            <label className="field-label" htmlFor="password">
                                Password
                                <span style={{ fontWeight: 400, color: 'var(--grey-400)', marginLeft: '0.35rem', fontSize: '0.75rem' }}>
                                    (Birth Certificate Number)
                                </span>
                            </label>
                            <div className="field-input-wrapper">
                                <i className="bi bi-lock field-icon"></i>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="field-input has-toggle"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Birth Certificate Number"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="btn-eye-toggle"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    tabIndex={-1}
                                >
                                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn-login"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-sm"></span>
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-box-arrow-in-right"></i>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info note */}
                    <div className="login-note">
                        <i className="bi bi-info-circle-fill"></i>
                        <p>
                            First time accessing the portal? Visit your nearest
                            <strong> Huduma Centre</strong> or registration office to
                            register and receive your login credentials.
                        </p>
                    </div>

                </div>

                {/* Footer bar */}
                <div className="login-footer-bar">
                    <span>© {new Date().getFullYear()} Republic of Kenya. All rights reserved.</span>
                    <span>
                        <i className="bi bi-shield-check" style={{ color: 'var(--gov-green)', marginRight: '0.3rem' }}></i>
                        Secure Connection
                    </span>
                </div>
            </div>

        </div>
    )
}

export default Login