import React from 'react';
import '../styles/Shared.css';

const LoadingState = () => {
    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
                <div className="spinner"></div>
                <h2 style={{ marginTop: '20px' }}>Generating your plan...</h2>
                <p>This may take a few seconds.</p>
                <style>{`
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #2e7d32;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        </div>
    );
};

export default LoadingState;
