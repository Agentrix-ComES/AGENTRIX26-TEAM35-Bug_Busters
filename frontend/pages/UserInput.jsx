import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { generatePlan } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import '../styles/UserInput.css';

const budgetFromRange = (range) => {
    const match = String(range || '').match(/-(\d+)/);
    if (match) return Number(match[1]);
    return String(range || '').startsWith('20000') ? 22000 : 15000;
};

const UserInput = ({ user, profile, setPlanData }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const [formData, setFormData] = useState({
        familySize: profile?.familySize || 1,
        budget: 15000,
        budgetRange: profile?.budgetRange || '10000-15000',
        dietPreference: profile?.dietPreference || 'No Preference',
        preferredMeals: (profile?.preferredMeals || []).join(', '),
        pantryItems: '',
        location: profile?.location || 'Colombo'
    });

    useEffect(() => {
        if (!profile) return;
        const budgetRange = profile.budgetRange || '10000-15000';
        setFormData((prev) => ({
            ...prev,
            familySize: profile.familySize || prev.familySize,
            budget: budgetFromRange(budgetRange),
            budgetRange,
            dietPreference: profile.dietPreference || prev.dietPreference,
            preferredMeals: (profile.preferredMeals || []).join(', '),
            location: profile.location || prev.location,
        }));
    }, [profile]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (profile && !profile.onboarded) {
        return <Navigate to="/survey" replace />;
    }

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
                email: user.email,
                name: user.name,
                favoriteCuisines: profile?.favoriteCuisines || [],
                dislikedIngredients: profile?.dislikedIngredients || [],
                allergies: profile?.allergies || [],
                cookingTime: profile?.cookingTime,
                cookingSkill: profile?.cookingSkill,
                mealGoal: profile?.mealGoal,
                pantryItems: formData.pantryItems.split(',').map(item => item.trim()).filter(Boolean),
                preferredMeals: formData.preferredMeals.split(',').map(item => item.trim()).filter(Boolean)
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
        <main className="container planner-shell">
            <section className="planner-header">
                <div>
                    <p className="eyebrow">Meal planner</p>
                    <h1 className="title">Plan today’s groceries</h1>
                </div>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/survey')}>
                    Edit profile
                </button>
            </section>

            <section className="planner-panel">
                <form onSubmit={handleSubmit} className="input-form">
                        <div className="form-row">
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
                                <label>Budget (LKR)</label>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    placeholder="15000"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Budget Range</label>
                                <select name="budgetRange" value={formData.budgetRange} onChange={handleChange}>
                                    <option value="0-10000">0-10000</option>
                                    <option value="10000-15000">10000-15000</option>
                                    <option value="15000-20000">15000-20000</option>
                                    <option value="20000+">20000+</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Diet Preference</label>
                                <select name="dietPreference" value={formData.dietPreference} onChange={handleChange}>
                                    <option value="No Preference">No Preference</option>
                                    <option value="Halal">Halal</option>
                                    <option value="Vegetarian">Vegetarian</option>
                                    <option value="Vegan">Vegan</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Preferred Meals</label>
                                <input
                                    type="text"
                                    name="preferredMeals"
                                    value={formData.preferredMeals}
                                    onChange={handleChange}
                                    placeholder="rice, chicken"
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
                        </div>

                        <div className="form-group">
                            <label>Pantry Items</label>
                            <input
                                type="text"
                                name="pantryItems"
                                value={formData.pantryItems}
                                onChange={handleChange}
                                placeholder="rice, onion, coconut oil"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">Generate meal plan</button>
                </form>
            </section>
        </main>
    );
};

export default UserInput;
