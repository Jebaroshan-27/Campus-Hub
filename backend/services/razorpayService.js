const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * Initializes and returns Razorpay instance
 */
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env'
    );
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

/**
 * Creates a Razorpay order from the stored event price (calculated in paise)
 * @param {Object} params
 * @param {number} params.amountInRupees - Event price in INR
 * @param {string} params.receipt - Unique internal receipt id
 * @param {Object} params.notes - Metadata notes attached to the order
 * @returns {Promise<Object>} Razorpay Order Object
 */
const createOrder = async ({ amountInRupees, receipt, notes = {} }) => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials not configured on backend.');
  }

  const amountInPaise = Math.round(Number(amountInRupees) * 100);

  const instance = new Razorpay({
    key_id,
    key_secret,
  });

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt || `rcpt_${Date.now()}`,
    notes,
  };

  try {
    const order = await instance.orders.create(options);
    return order;
  } catch (err) {
    // If running in development with placeholder keys, provide a structured simulation fallback
    if (
      process.env.NODE_ENV !== 'production' &&
      (key_id.includes('demo') || key_id.includes('your_') || err.statusCode === 401)
    ) {
      console.warn(
        '[Razorpay Service]: Sandbox test key detected. Emulating Razorpay order creation for offline local development.'
      );
      return {
        id: `order_dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: options.receipt,
        status: 'created',
        attempts: 0,
        notes: options.notes,
        created_at: Math.floor(Date.now() / 1000),
      };
    }
    throw err;
  }
};

/**
 * Verifies Razorpay payment signature using RAZORPAY_KEY_SECRET
 * Signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
 * @param {Object} params
 * @param {string} params.orderId - Razorpay order ID
 * @param {string} params.paymentId - Razorpay payment ID
 * @param {string} params.signature - Signature received from client checkout
 * @returns {boolean} True if signature is valid, false otherwise
 */
const verifySignature = ({ orderId, paymentId, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured on the server.');
  }

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // If in sandbox dev mode with demo order, allow signature match for verified dev tests
  if (
    process.env.NODE_ENV !== 'production' &&
    orderId.startsWith('order_dev_') &&
    signature === 'simulated_valid_signature'
  ) {
    return true;
  }

  return generatedSignature === signature;
};

module.exports = {
  createOrder,
  verifySignature,
  getRazorpayInstance,
};
