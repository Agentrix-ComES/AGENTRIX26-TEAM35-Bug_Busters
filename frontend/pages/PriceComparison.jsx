import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import '../styles/PriceComparison.css';

const PriceComparison = ({ plan }) => {
    const navigate = useNavigate();

    if (!plan) return <EmptyState />;

    const comparisonData = plan.priceComparison || [
        { item: "Chicken", keells: 1350, cargills: 1290, arpico: 1310, best: "Cargills" },
        { item: "Rice", keells: 1250, cargills: 1180, arpico: 1200, best: "Cargills" },
        { item: "Tomato", keells: 480, cargills: 420, arpico: 450, best: "Cargills" }
    ];

    const summary = plan.summary || {
        estimatedTotal: 13450,
        budget: 15000,
        savings: 1550
    };

    return (
        <div className="container">
            <h1 className="page-header">Price Comparison & Savings</h1>

            <div className="table-responsive card">
                <table className="comparison-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Keells</th>
                            <th>Cargills</th>
                            <th>Arpico</th>
                            <th>Best Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparisonData.map((row, index) => (
                            <tr key={index}>
                                <td className="font-bold">{row.item}</td>
                                <td>{row.keells}</td>
                                <td>{row.cargills}</td>
                                <td>{row.arpico}</td>
                                <td className="best-price">{row.best}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="summary-grid">
                <div className="card summary-card">
                    <p className="summary-label">Estimated Total</p>
                    <p className="summary-value">Rs. {summary.estimatedTotal.toLocaleString()}</p>
                </div>
                <div className="card summary-card">
                    <p className="summary-label">Budget</p>
                    <p className="summary-value">Rs. {summary.budget.toLocaleString()}</p>
                </div>
                <div className="card summary-card highlight">
                    <p className="summary-label">Savings</p>
                    <p className="summary-value">Rs. {summary.savings.toLocaleString()}</p>
                </div>
            </div>

            <div className="button-group">
                <button className="btn btn-secondary">View Details</button>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Start New Plan
                </button>
            </div>
        </div>
    );
};

export default PriceComparison;
