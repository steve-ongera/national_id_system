import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applicationService } from '../services/api'
import toast from 'react-hot-toast'

const ApplyId = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        parents_name: '',
        marital_status: 'SINGLE',
        occupation: '',
        employer_name: '',
        is_declaration_signed: false
    })
    
    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setFormData({
            ...formData,
            [e.target.name]: value
        })
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.is_declaration_signed) {
            toast.error('Please sign the declaration')
            return
        }
        
        setLoading(true)
        
        try {
            await applicationService.submitApplication(formData)
            toast.success('Application submitted successfully!')
            navigate('/application-status')
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit application')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="container py-4">
            <div className="form-container">
                <h3 className="form-title">
                    <i className="fas fa-file-alt me-2"></i>
                    National ID Application Form
                </h3>
                
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-label">Parent's/Guardian's Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="parents_name"
                                    value={formData.parents_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-label">Marital Status</label>
                                <select
                                    className="form-control"
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
                    </div>
                    
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-label">Occupation</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-label">Employer Name (if applicable)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="employer_name"
                                    value={formData.employer_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="alert alert-info mt-3">
                        <i className="fas fa-info-circle me-2"></i>
                        Please ensure all information provided is accurate and truthful. False information may lead to rejection of your application.
                    </div>
                    
                    <div className="form-check mb-3">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            name="is_declaration_signed"
                            checked={formData.is_declaration_signed}
                            onChange={handleChange}
                            id="declaration"
                        />
                        <label className="form-check-label" htmlFor="declaration">
                            I hereby declare that all the information provided in this application is true and correct to the best of my knowledge. I understand that providing false information is an offense under the Kenya Citizenship and Immigration Act.
                        </label>
                    </div>
                    
                    <div className="d-flex gap-2">
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => navigate('/dashboard')}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ApplyId