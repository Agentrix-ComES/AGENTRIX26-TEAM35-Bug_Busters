import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import '../styles/MealPlan.css';

const MealPlan = ({ plan }) => {
    const navigate = useNavigate();

    if (!plan) return <EmptyState />;

    const mealPlanData = plan.mealPlan || [];
    const priceContext = plan.priceContext || {};
    const personalization = plan.personalization || {};

    return (
        <div className="container">
            <div className="page-header-row">
                <div>
                    <p className="eyebrow">Meals</p>
                    <h1 className="page-header">Budget-Aware Meal Plan</h1>
                </div>
                <div className="context-pill">
                    {priceContext.affordableItemCount || 0} affordable items
                </div>
            </div>

            <div className="meal-grid">
                {mealPlanData.map((item, index) => (
                    <div key={index} className="card meal-card">
                        <div className="meal-card-header">
                            <h3 className="meal-type">{item.type || item.day}</h3>
                            <span>Rs. {Math.round(item.estimatedMealCost || 0).toLocaleString()}</span>
                        </div>
                        <p className="meal-name">{item.meal}</p>
                        <div className="ingredient-list">
                            {(item.ingredients || []).map((ingredient) => (
                                <div key={ingredient.name} className="ingredient-chip">
                                    {ingredient.name}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {personalization.email && (
                <div className="card memory-card">
                    <div>
                        <p className="eyebrow">Personalization Memory</p>
                        <h2>{personalization.profileLoaded ? 'Saved Profile Reused' : 'Profile Saved'}</h2>
                    </div>
                    <div className="memory-details">
                        <span>{personalization.email}</span>
                        <span>Budget {personalization.budgetRange || 'not set'}</span>
                        <span>
                            Favorites: {personalization.preferredMeals?.length
                                ? personalization.preferredMeals.join(', ')
                                : 'none'}
                        </span>
                    </div>
                </div>
            )}

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
