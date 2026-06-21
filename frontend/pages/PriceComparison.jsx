import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import '../styles/PriceComparison.css';

const PriceComparison = ({ plan }) => {
    const navigate = useNavigate();

    if (!plan) return <EmptyState />;

    const comparisonData = plan.vendorTable || [];
    const estimatedTotal = plan.totalEstimatedCost ? plan.totalEstimatedCost : 0;
    const savings = plan.estimatedSavings ? plan.estimatedSavings : 0;
    const baseline = plan.baselineCost ? plan.baselineCost : estimatedTotal;

    const formatCurrency = (value) => (
        Number.isFinite(Number(value)) ? `Rs. ${Math.round(Number(value)).toLocaleString()}` : '-'
    );

    return (
        <div className="container">
            <div className="page-header-row">
                <div>
                    <p className="eyebrow">Savings</p>
                    <h1 className="page-header">Vendor Table & Savings</h1>
                </div>
                <div className="context-pill">{comparisonData.length} matched items</div>
            </div>

            <div className="table-responsive card">
                <table className="comparison-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Keells</th>
                            <th>Cargills</th>
                            <th>Cheapest Vendor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparisonData.map((row, index) => (
                            <tr key={index}>
                                <td className="font-bold">{row.item}</td>
                                <td>{row.quantity || '-'}</td>
                                <td>{formatCurrency(row.prices?.Keells)}</td>
                                <td>{formatCurrency(row.prices?.Cargills)}</td>
                                <td className="best-price">
                                    {row.recommendedStore ? `${row.recommendedStore} (${formatCurrency(row.recommendedPrice)})` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="summary-grid">
                <div className="card summary-card">
                    <p className="summary-label">Optimized Total</p>
                    <p className="summary-value">{formatCurrency(estimatedTotal)}</p>
                </div>
                <div className="card summary-card">
                    <p className="summary-label">Baseline Total</p>
                    <p className="summary-value">{formatCurrency(baseline)}</p>
                </div>
                <div className="card summary-card highlight">
                    <p className="summary-label">Savings</p>
                    <p className="summary-value">{formatCurrency(savings)}</p>
                </div>
            </div>

            <div className="button-group">
                <button className="btn btn-secondary" onClick={() => navigate('/shoppinglist')}>
                    Back to List
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Start New Plan
                </button>
            </div>
        </div>
    );
};

export default PriceComparison;
