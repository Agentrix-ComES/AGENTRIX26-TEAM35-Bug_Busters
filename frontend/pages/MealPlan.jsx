import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import '../styles/MealPlan.css';

const MealPlan = ({ plan }) => {
    const navigate = useNavigate();

    if (!plan) return <EmptyState />;

    // Mock data if API response doesn't match the format exactly
    const mealPlanData = plan.mealPlan || [
        { type: 'Breakfast', meal: 'Chicken Paratha with Yogurt' },
        { type: 'Lunch', meal: 'Chicken Biryani with Salad' },
        { type: 'Dinner', meal: 'Lentil Curry with Rice' }
    ];

    return (
        <div className="container">
            <h1 className="page-header">Your Meal Plan</h1>

            <div className="meal-grid">
                {mealPlanData.map((item, index) => (
                    <div key={index} className="card meal-card">
                        <h3 className="meal-type">{item.type}</h3>
                        <p className="meal-name">{item.meal}</p>
                    </div>
                ))}
            </div>

            <div className="button-group">
                <button className="btn btn-secondary" onClick={() => navigate('/')}>
                    Edit Preferences
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/shoppinglist')}>
                    Next: Shopping List
                </button>
            </div>
        </div>
    );
};

export default MealPlan;
