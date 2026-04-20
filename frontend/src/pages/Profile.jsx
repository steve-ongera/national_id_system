import React, { useState, useEffect } from 'react'
import { userService, authService } from '../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
    const [profile, setProfile] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({})
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        fetchProfile()
    }, [])
    
    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile()
            setProfile(data)
            setFormData(data)
        } catch (error) {
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }
    
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
            const updated = await userService.updateProfile(formData)
            setProfile(updated)
            setIsEditing(false)
            toast.success('Profile updated successfully')
        } catch (error) {
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }
    
    if (loading && !profile) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }
    
    return (
        <div className="container py-4">
            <div className="form-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="form-title mb-0">
                        <i className="fas fa-user-circle me-2"></i>
                        My Profile
                    </h3>
                    {!isEditing && (
                        <button 
                            className="btn btn-primary"
                            onClick={() => setIsEditing(true)}
                        >
                            <i className="fas fa-edit me-1"></i> Edit Profile
                        </button>
                    )}
                </div>
                
                {!isEditing ? (
                    <div className="row">
                        <div className="col-md-6">
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th width="40%">ID Number</th>
                                        <td>{profile?.id_number}</td>
                                    </tr>
                                    <tr>
                                        <th>Full Name</th>
                                        <td>{profile?.full_name}</td>
                                    </tr>
                                    <tr>
                                        <th>Date of Birth</th>
                                        <td>{new Date(profile?.date_of_birth).toLocaleDateString()}</td>
                                    </tr>
                                    <tr>
                                        <th>Age</th>
                                        <td>{profile?.age} years</td>
                                    </tr>
                                    <tr>
                                        <th>Gender</th>
                                        <td>{profile?.gender === 'M' ? 'Male' : 'Female'}</td>
                                    </tr>
                                    <tr>
                                        <th>Place of Birth</th>
                                        <td>{profile?.place_of_birth}</td>
                                    </tr>
                                    <tr>
                                        <th>Phone Number</th>
                                        <td>{profile?.phone_number}</td>
                                    </tr>
                                    <tr>
                                        <th>Email</th>
                                        <td>{profile?.email || 'Not provided'}</td>
                                    </tr>
                                    <tr>
                                        <th>County of Residence</th>
                                        <td>{profile?.county_of_residence}</td>
                                    </tr>
                                    <tr>
                                        <th>Sub-County</th>
                                        <td>{profile?.sub_county}</td>
                                    </tr>
                                    <tr>
                                        <th>Ward</th>
                                        <td>{profile?.ward}</td>
                                    </tr>
                                    <tr>
                                        <th>Village</th>
                                        <td>{profile?.village || 'Not provided'}</td>
                                    </tr>
                                    <tr>
                                        <th>Postal Address</th>
                                        <td>{profile?.postal_address || 'Not provided'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="first_name"
                                        value={formData.first_name || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="last_name"
                                        value={formData.last_name || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="phone_number"
                                        value={formData.phone_number || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Postal Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="postal_address"
                                        value={formData.postal_address || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Postal Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="postal_code"
                                        value={formData.postal_code || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-flex gap-2 mt-3">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => {
                                    setIsEditing(false)
                                    setFormData(profile)
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Profile