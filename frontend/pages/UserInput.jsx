import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePlan } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import '../styles/UserInput.css';

const UserInput = ({ setPlanData }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const [formData, setFormData] = useState({
        familySize: 1,
        budget: 15000,
        dietPreference: 'No Preference',
        pantryItems: '',
        location: 'Colombo',
        receiptText: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'familySize' || name === 'budget' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        try {
            const payload = {
                ...formData,
                weeklyBudgetLKR: formData.budget,
                pantryItems: formData.pantryItems.split(',').map(item => item.trim()).filter(item => item !== '')
            };
            const response = await generatePlan(payload);
            setPlanData(response);
            navigate('/mealplan');
        } catch (err) {
            setError(true);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState onRetry={() => setError(false)} />;

    return (
        <div className="container">
            <div className="card user-input-card">
                <h1 className="title">GrocerMind AI</h1>
                <p className="subtitle">Create Your Plan</p>

                <form onSubmit={handleSubmit} className="input-form">
                    <div className="form-group">
                        <label>Family Size</label>
                        <select name="familySize" value={formData.familySize} onChange={handleChange}>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5+</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Monthly Budget</label>
                        <input
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            placeholder="15000"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Diet Preference</label>
                        <select name="dietPreference" value={formData.dietPreference} onChange={handleChange}>
                            <option value="Halal">Halal</option>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Vegan">Vegan</option>
                            <option value="No Preference">No Preference</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Pantry Items</label>
                        <input
                            type="text"
                            name="pantryItems"
                            value={formData.pantryItems}
                            onChange={handleChange}
                            placeholder="rice, onion"
                        />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Colombo"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Receipt Text (Optional)</label>
                        <textarea
                            name="receiptText"
                            value={formData.receiptText}
                            onChange={handleChange}
                            placeholder="Paste your receipt text here..."
                            rows="4"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">Generate Plan</button>
                </form>
            </div>
        </div>
    );
};

export default UserInput;
