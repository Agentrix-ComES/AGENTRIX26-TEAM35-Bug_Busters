import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Shared.css';

const EmptyState = () => {
    const navigate = useNavigate();
    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📋</div>
                <h2>No plan generated yet.</h2>
                <p style={{ marginBottom: '20px' }}>Fill your details to create a plan.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Go to Input
                </button>
            </div>
        </div>
    );
};

export default EmptyState;
