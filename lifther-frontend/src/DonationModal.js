import React, { useState } from 'react';
import './DonationModal.css';

const categories = [
  'Education',
  'Housing',
  'Medical',
  'Food',
  'General Support',
];

const DonationModal = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDonate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1200); // Dummy payment delay
  };

  return (
    <div className="donation-modal-backdrop">
      <div className="donation-modal">
        <button className="donation-modal-close" onClick={onClose}>&times;</button>
        {!success ? (
          <>
            <h2>Support a Mother</h2>
            <form className="donation-modal-form" onSubmit={handleDonate}>
              <label>Amount (INR)</label>
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                disabled={loading}
              />
              <label>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={loading}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button type="submit" className="donation-modal-btn" disabled={loading || !amount}>
                {loading ? 'Processing...' : 'Donate Now'}
              </button>
            </form>
          </>
        ) : (
          <div className="donation-modal-success">
            <h3>Thank you for your support! ❤️</h3>
            <p>Your donation has been received and will help a single mother in need.</p>
            <button className="donation-modal-btn" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationModal; 