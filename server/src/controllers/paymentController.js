const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
});

// @desc    Create Razorpay Order for VIP Upgrade
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const amount = 999 * 100; // ₹999 in paise (or $9.99 in cents if using USD, but Razorpay defaults to INR mostly)
    
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_vip_${req.user._id}`,
    };

    const order = await razorpayInstance.orders.create(options);
    if (!order) return res.status(500).send("Some error occurred");

    // Create a pending payment record
    await Payment.create({
      user: req.user._id,
      stripePaymentIntentId: order.id, // Reusing field for order ID to save schema changes
      amount: amount / 100,
      status: 'pending'
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Signature and Upgrade User
// @route   POST /api/payment/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock_secret')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      user.isPremium = true;
      await user.save();

      // Update payment record
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: razorpay_order_id },
        { status: 'succeeded' }
      );

      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });

      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid signature sent!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
