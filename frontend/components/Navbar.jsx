import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">GrocerMind AI</Link>
                {user ? (
                    <div className="navbar-account">
                        <Link to="/survey">Profile</Link>
                        <span>{user.name}</span>
                        <button type="button" onClick={onLogout}>Log out</button>
                    </div>
                ) : (
                    <Link to="/login" className="navbar-login">Log in</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
