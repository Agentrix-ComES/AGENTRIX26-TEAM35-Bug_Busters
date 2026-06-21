import React from 'react';
import '../styles/Shared.css';

const ErrorState = ({ onRetry }) => {
    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <div className="card" style={{ textAlign: 'center', maxWidth: '400px', border: '1px solid #ffcdd2', backgroundColor: '#ffebee' }}>
                <h2 style={{ color: '#d32f2f' }}>Something went wrong.</h2>
                <p style={{ marginBottom: '20px' }}>Please try again.</p>
                <button className="btn btn-primary" onClick={onRetry} style={{ backgroundColor: '#d32f2f' }}>
                    Try Again
                </button>
            </div>
        </div>
    );
};

export default ErrorState;
