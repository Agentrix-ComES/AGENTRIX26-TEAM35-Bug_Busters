import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, requestLoginCode, saveProfile, verifyLoginCode } from '../services/api';
import '../styles/Account.css';

const Login = ({ setUser, setProfile }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', code: '' });
    const [codeSent, setCodeSent] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRequestCode = async (event) => {
        event.preventDefault();
        setError('');
        setStatus('');
        setLoading(true);

        try {
            const email = formData.email.trim().toLowerCase();
            if (!email.endsWith('@gmail.com') && !email.endsWith('@googlemail.com')) {
                setError('Use a Google email address.');
                return;
            }

            await requestLoginCode(email);
            setCodeSent(true);
            setStatus('Verification code sent. Check your email.');
        } catch (err) {
            setError(err.message || 'Could not send verification email.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (event) => {
        event.preventDefault();
        setError('');
        setStatus('');
        setLoading(true);

        try {
            const email = formData.email.trim().toLowerCase();
            await verifyLoginCode(email, formData.code);

            const account = {
                name: formData.name.trim() || email.split('@')[0],
                email,
            };
            let profile = await getProfile(email);

            if (!profile) {
                profile = await saveProfile(account);
            }

            localStorage.setItem('grocermindUser', JSON.stringify(account));
            setUser(account);
            setProfile(profile);
            navigate(profile?.onboarded ? '/' : '/survey');
        } catch (err) {
            setError(err.message || 'Could not verify code.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="account-screen">
            <section className="account-panel">
                <p className="eyebrow">GrocerMind AI</p>
                <h1>Sign in</h1>
                <form className="account-form" onSubmit={codeSent ? handleVerifyCode : handleRequestCode}>
                    <label>
                        Name
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                        />
                    </label>
                    <label>
                        Google email
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@gmail.com"
                            disabled={codeSent}
                            required
                        />
                    </label>
                    {codeSent && (
                        <label>
                            Verification code
                            <input
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="6-digit code"
                                inputMode="numeric"
                                maxLength="6"
                                required
                            />
                        </label>
                    )}
                    {status && <p className="form-status">{status}</p>}
                    {error && <p className="form-error">{error}</p>}
                    <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                        {loading ? 'Please wait...' : codeSent ? 'Verify and continue' : 'Send verification code'}
                    </button>
                    {codeSent && (
                        <button
                            className="btn btn-secondary btn-block"
                            type="button"
                            disabled={loading}
                            onClick={handleRequestCode}
                        >
                            Resend code
                        </button>
                    )}
                </form>
            </section>
        </main>
    );
};

export default Login;
