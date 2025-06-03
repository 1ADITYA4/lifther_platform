const Donation = require('../models/donation');

// Get all donations for a user
exports.getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donations', error: error.message });
  }
};

// Create new donation
exports.createDonation = async (req, res) => {
  try {
    const { amount, category, paymentId, message } = req.body;
    
    const donation = new Donation({
      userId: req.user.id,
      amount,
      category,
      paymentId,
      message,
      status: 'completed' // For now setting as completed, later integrate with payment gateway
    });

    const savedDonation = await donation.save();
    res.status(201).json(savedDonation);
  } catch (error) {
    res.status(400).json({ message: 'Error creating donation', error: error.message });
  }
};

// Get donation by ID
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    if (donation.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this donation' });
    }
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donation', error: error.message });
  }
}; 