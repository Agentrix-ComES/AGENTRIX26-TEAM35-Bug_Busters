import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Survey from './pages/Survey';
import UserInput from './pages/UserInput';
import MealPlan from './pages/MealPlan';
import ShoppingList from './pages/ShoppingList';
import PriceComparison from './pages/PriceComparison';
import { getProfile } from './services/api';
import './styles/Shared.css';

function App() {
    const [planData, setPlanData] = useState(null);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('grocermindUser');
        return saved ? JSON.parse(saved) : null;
    });
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!user?.email) {
            setProfile(null);
            return;
        }

        getProfile(user.email).then(setProfile).catch(() => setProfile(null));
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('grocermindUser');
        setUser(null);
        setProfile(null);
        setPlanData(null);
    };

    return (
        <Router>
            <Navbar user={user} onLogout={handleLogout} />
            <div className="app-container">
                <Routes>
                    <Route path="/login" element={<Login setUser={setUser} setProfile={setProfile} />} />
                    <Route path="/survey" element={<Survey user={user} profile={profile} setProfile={setProfile} />} />
                    <Route path="/" element={<UserInput user={user} profile={profile} setPlanData={setPlanData} />} />
                    <Route path="/mealplan" element={<MealPlan plan={planData} />} />
                    <Route path="/shoppinglist" element={<ShoppingList plan={planData} />} />
                    <Route path="/compare" element={<PriceComparison plan={planData} />} />
                    <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
