import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserInput from './pages/UserInput';
import MealPlan from './pages/MealPlan';
import ShoppingList from './pages/ShoppingList';
import PriceComparison from './pages/PriceComparison';
import './styles/Shared.css';

function App() {
    const [planData, setPlanData] = useState(null);

    return (
        <Router>
            <Navbar />
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<UserInput setPlanData={setPlanData} />} />
                    <Route path="/mealplan" element={<MealPlan plan={planData} />} />
                    <Route path="/shoppinglist" element={<ShoppingList plan={planData} />} />
                    <Route path="/compare" element={<PriceComparison plan={planData} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
