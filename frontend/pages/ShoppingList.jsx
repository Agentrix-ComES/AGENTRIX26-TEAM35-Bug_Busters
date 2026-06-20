import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import '../styles/ShoppingList.css';

const ShoppingList = ({ plan }) => {
    const navigate = useNavigate();
    const [checkedItems, setCheckedItems] = useState({});

    if (!plan) return <EmptyState />;

    const shoppingListData = plan.shoppingList || {
        "Vegetables": [
            { name: "Tomato", quantity: "1kg" },
            { name: "Potato", quantity: "1kg" },
            { name: "Cucumber", quantity: "500g" }
        ],
        "Meat & Fish": [
            { name: "Chicken", quantity: "1.5kg" },
            { name: "Fish", quantity: "500g" }
        ],
        "Pantry Essentials": [
            { name: "Oil", quantity: "" },
            { name: "Salt", quantity: "" },
            { name: "Sugar", quantity: "" }
        ]
    };

    const handleToggle = (section, index) => {
        const key = `${section}-${index}`;
        setCheckedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="container">
            <h1 className="page-header">Your Shopping List</h1>

            <div className="shopping-list-container">
                {Object.entries(shoppingListData).map(([section, items]) => (
                    <div key={section} className="shopping-section">
                        <h2 className="section-title">{section}</h2>
                        <div className="card list-card">
                            {items.map((item, index) => (
                                <div key={index} className="list-item">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            checked={!!checkedItems[`${section}-${index}`]}
                                            onChange={() => handleToggle(section, index)}
                                        />
                                        <span className="checkmark"></span>
                                        <span className={`item-name ${checkedItems[`${section}-${index}`] ? 'strikethrough' : ''}`}>
                                            {item.name} {item.quantity && <span className="item-qty">({item.quantity})</span>}
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="button-group">
                <button className="btn btn-primary" onClick={() => navigate('/compare')}>
                    Compare Prices
                </button>
            </div>
        </div>
    );
};

export default ShoppingList;
