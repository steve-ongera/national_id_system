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
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <i className="fas fa-id-card fa-3x mb-3"></i>
                    <h2>Kenya National ID System</h2>
                    <p>Apply for your National ID Card</p>
                </div>
                <div className="login-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">ID Number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="id_number"
                                value={formData.id_number}
                                onChange={handleChange}
                                placeholder="Enter your ID Number"
                                required
                                pattern="\d{8}"
                                title="ID Number must be 8 digits"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Password (Birth Certificate Number)</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your Birth Certificate Number"
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    
                    <hr className="my-4" />
                    
                    <div className="text-center">
                        <p className="text-muted mb-0">
                            <i className="fas fa-info-circle me-1"></i>
                            First time? Visit your nearest registration center to register.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login