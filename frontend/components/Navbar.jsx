import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">GrocerMind AI</Link>
                <div className="navbar-links">
                    <Link to="/">Input</Link>
                    <Link to="/mealplan">Meal Plan</Link>
                    <Link to="/shoppinglist">List</Link>
                    <Link to="/compare">Compare</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
