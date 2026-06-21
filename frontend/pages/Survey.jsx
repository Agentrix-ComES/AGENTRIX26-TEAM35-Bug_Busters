import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { saveProfile } from '../services/api';
import '../styles/Account.css';

const Survey = ({ user, profile, setProfile }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        familySize: profile?.familySize || 2,
        dietPreference: profile?.dietPreference || 'No Preference',
        budgetRange: profile?.budgetRange || '10000-15000',
        location: profile?.location || 'Colombo',
        preferredMeals: (profile?.preferredMeals || []).join(', '),
        favoriteCuisines: (profile?.favoriteCuisines || []).join(', '),
        dislikedIngredients: (profile?.dislikedIngredients || []).join(', '),
        allergies: (profile?.allergies || []).join(', '),
        cookingTime: profile?.cookingTime || '30 minutes',
        cookingSkill: profile?.cookingSkill || 'Intermediate',
        mealGoal: profile?.mealGoal || 'Save money',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'familySize' ? Number(value) : value,
        }));
    };

    const listFromText = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            const saved = await saveProfile({
                ...profile,
                ...user,
                ...formData,
                preferredMeals: listFromText(formData.preferredMeals),
                favoriteCuisines: listFromText(formData.favoriteCuisines),
                dislikedIngredients: listFromText(formData.dislikedIngredients),
                allergies: listFromText(formData.allergies),
                onboarded: true,
            });
            setProfile(saved);
            navigate('/');
        } catch (err) {
            setError('Could not save your survey.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="survey-screen">
            <section className="survey-panel">
                <div className="survey-heading">
                    <p className="eyebrow">Taste profile</p>
                    <h1>Quick food survey</h1>
                </div>
                <form className="survey-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label>
                            Household size
                            <select name="familySize" value={formData.familySize} onChange={handleChange}>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5+</option>
                            </select>
                        </label>
                        <label>
                            Diet
                            <select name="dietPreference" value={formData.dietPreference} onChange={handleChange}>
                                <option>No Preference</option>
                                <option>Halal</option>
                                <option>Vegetarian</option>
                                <option>Vegan</option>
                            </select>
                        </label>
                    </div>

                    <div className="form-row">
                        <label>
                            Monthly food budget
                            <select name="budgetRange" value={formData.budgetRange} onChange={handleChange}>
                                <option value="0-10000">Under 10,000 LKR</option>
                                <option value="10000-15000">10,000-15,000 LKR</option>
                                <option value="15000-20000">15,000-20,000 LKR</option>
                                <option value="20000+">20,000+ LKR</option>
                            </select>
                        </label>
                        <label>
                            Location
                            <input name="location" value={formData.location} onChange={handleChange} />
                        </label>
                    </div>

                    <label>
                        Meals you like
                        <input
                            name="preferredMeals"
                            value={formData.preferredMeals}
                            onChange={handleChange}
                            placeholder="rice, curry, pasta"
                        />
                    </label>

                    <label>
                        Cuisines you enjoy
                        <input
                            name="favoriteCuisines"
                            value={formData.favoriteCuisines}
                            onChange={handleChange}
                            placeholder="Sri Lankan, Indian, Italian"
                        />
                    </label>

                    <div className="form-row">
                        <label>
                            Avoid ingredients
                            <input
                                name="dislikedIngredients"
                                value={formData.dislikedIngredients}
                                onChange={handleChange}
                                placeholder="brinjal, prawns"
                            />
                        </label>
                        <label>
                            Allergies
                            <input
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleChange}
                                placeholder="peanuts, dairy"
                            />
                        </label>
                    </div>

                    <div className="form-row">
                        <label>
                            Cooking time
                            <select name="cookingTime" value={formData.cookingTime} onChange={handleChange}>
                                <option>15 minutes</option>
                                <option>30 minutes</option>
                                <option>45 minutes</option>
                                <option>1 hour+</option>
                            </select>
                        </label>
                        <label>
                            Cooking skill
                            <select name="cookingSkill" value={formData.cookingSkill} onChange={handleChange}>
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </label>
                    </div>

                    <label>
                        Main goal
                        <select name="mealGoal" value={formData.mealGoal} onChange={handleChange}>
                            <option>Save money</option>
                            <option>Eat healthier</option>
                            <option>Cook faster</option>
                            <option>Reduce waste</option>
                        </select>
                    </label>

                    {error && <p className="form-error">{error}</p>}
                    <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save profile'}
                    </button>
                </form>
            </section>
        </main>
    );
};

export default Survey;
