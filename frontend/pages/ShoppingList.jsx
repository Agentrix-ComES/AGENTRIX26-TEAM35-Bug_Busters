import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import '../styles/ShoppingList.css';

const ShoppingList = ({ plan }) => {
    const navigate = useNavigate();
    const [checkedItems, setCheckedItems] = useState({});

    if (!plan) return <EmptyState />;

    const rawItems = plan.shoppingList || [];
    const shoppingListData = rawItems.reduce((sections, item) => {
        const section = item.category || 'Other';
        sections[section] = sections[section] || [];
        sections[section].push(item);
        return sections;
    }, {});

    const handleToggle = (section, index) => {
        const key = `${section}-${index}`;
        setCheckedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="container">
            <div className="page-header-row">
                <div>
                    <p className="eyebrow">Shopping</p>
                    <h1 className="page-header">Combined Grocery List</h1>
                </div>
                <div className="context-pill">{rawItems.length} items</div>
            </div>

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
                                    {item.usedIn?.length > 0 && (
                                        <span className="used-in">{item.usedIn.join(', ')}</span>
                                    )}
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
