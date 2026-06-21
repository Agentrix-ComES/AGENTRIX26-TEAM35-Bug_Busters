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

            {plan.finalRecommendation && (
                <div className="card" style={{marginTop: '20px', borderLeft: '4px solid #4ade80'}}>
                    <h2>{plan.finalRecommendation.title}</h2>
                    <p>{plan.finalRecommendation.summary}</p>
                    <p><strong>Next Action:</strong> {plan.finalRecommendation.nextBestAction}</p>
                </div>
            )}

            {plan.budgetHealth && (
                <div className="card" style={{marginTop: '20px'}}>
                    <h2>Budget Health: {plan.budgetHealth.status}</h2>
                    <p>{plan.budgetHealth.message}</p>
                    <p>Estimated Total: Rs. {plan.budgetHealth.estimatedTotal.toLocaleString()} / Budget: Rs. {plan.budgetHealth.budget.toLocaleString()}</p>
                </div>
            )}

            {plan.savingsExplanation && (
                <div className="card" style={{marginTop: '20px'}}>
                    <h2>Savings Explanation</h2>
                    <p>{plan.savingsExplanation.summary}</p>
                    <p><strong>Baseline Store:</strong> {plan.savingsExplanation.baselineStore} | <strong>Strategy:</strong> {plan.savingsExplanation.optimizedStrategy}</p>
                </div>
            )}

            {plan.pantryImpact && (
                <div className="card" style={{marginTop: '20px'}}>
                    <h2>Pantry Impact</h2>
                    <p>{plan.pantryImpact.note}</p>
                    <p><strong>Items Avoided:</strong> {plan.pantryImpact.combinedPantryItems.join(', ') || 'None'}</p>
                </div>
            )}

            {plan.receiptExtraction && plan.receiptExtraction.enabled && (
                <div className="card" style={{marginTop: '20px'}}>
                    <h2>Receipt Extraction</h2>
                    <p>{plan.receiptExtraction.note}</p>
                    <p><strong>Extracted:</strong> {plan.receiptExtraction.extractedItems.join(', ')}</p>
                </div>
            )}

            {plan.storeBasketStrategy && (
                <div className="card" style={{marginTop: '20px'}}>
                    <h2>Store Basket Strategy</h2>
                    {plan.storeBasketStrategy.map((basket, idx) => (
                        <div key={idx} style={{marginBottom: '10px'}}>
                            <h3>{basket.store} - Rs. {basket.estimatedStoreTotal.toLocaleString()}</h3>
                            <p>{basket.reason}</p>
                            <ul>
                                {basket.items.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

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
