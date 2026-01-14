import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSupplier } from '../../context/supplierContext.jsx';
import { verifyOtp } from '../../helpers/auth/auth.helper.js';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useSupplier();

  const initialEmail = location.state?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code) {
      toast.warning('Please enter both email and OTP.');
      return;
    }
    setLoading(true);
    const result = await verifyOtp({ email, code }).finally(() => setLoading(false));
    if (result.status === 200) {
      toast.success(result.message);
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className={`container my-5 d-flex justify-content-center align-items-center ${darkMode ? 'text-light bg-dark' : 'text-dark bg-light'}`} style={{ minHeight: '80vh' }}>
      <div className="col-md-8 col-lg-6 col-xl-5 p-5 shadow rounded">
        <h1 className={`display-5 mb-4 text-center ${darkMode ? 'text-light' : 'text-dark'}`}>Verify Email</h1>
        <p className="text-center mb-4">
          We&apos;ve sent a 6-digit OTP to your email. Enter it below to verify your account.
        </p>
        <form onSubmit={handleSubmit} className="w-100">
          <div className="form-group mb-3">
            <label htmlFor="email" className={darkMode ? 'text-light' : 'text-dark'}>Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="code" className={darkMode ? 'text-light' : 'text-dark'}>OTP Code</label>
            <input
              type="text"
              className="form-control"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
            />
          </div>
          <div className="d-grid gap-2 my-3">
            <button type="submit" disabled={loading} className={`btn btn-${darkMode ? 'light' : 'primary'}`}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
        <hr className={`my-4 ${darkMode ? 'border-light' : 'border-dark'}`} />
        <p className={`text-center ${darkMode ? 'text-light' : 'text-dark'}`}>
          Already verified?{' '}
          <Link to="/" className={darkMode ? 'text-light' : 'text-primary'}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;

