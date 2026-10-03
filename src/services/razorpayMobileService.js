import { Alert, Platform } from 'react-native';

let RazorpayCheckout = null;

try {
  // Dynamically require to avoid crash in environments where native module is not bundled
  const razorpayModule = require('react-native-razorpay');
  RazorpayCheckout = razorpayModule.default || razorpayModule;
} catch (err) {
  RazorpayCheckout = null;
}

/**
 * Checks if the native Razorpay SDK is linked and available
 */
export const isRazorpayNativeAvailable = () => {
  return (
    RazorpayCheckout !== null &&
    typeof RazorpayCheckout.open === 'function'
  );
};

/**
 * Initiates Razorpay checkout
 * @param {Object} orderData - Response from /api/events/:id/create-order
 * @returns {Promise<{ razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }>}
 */
export const launchRazorpayCheckout = async (orderData) => {
  const { orderId, amount, currency, keyId, event, prefill } = orderData;

  const options = {
    description: `Registration Fee for ${event?.title || 'Campus Event'}`,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=128&q=80',
    currency: currency || 'INR',
    key: keyId,
    amount: amount,
    name: 'CampusHub Events',
    order_id: orderId,
    prefill: {
      email: prefill?.email || '',
      contact: prefill?.contact || '',
      name: prefill?.name || '',
    },
    theme: { color: '#1E3A8A' },
  };

  // 1. Native Build Environment (Development Build / Standalone APK/IPA)
  if (isRazorpayNativeAvailable()) {
    try {
      const data = await RazorpayCheckout.open(options);
      return {
        razorpayOrderId: data.razorpay_order_id || orderId,
        razorpayPaymentId: data.razorpay_payment_id,
        razorpaySignature: data.razorpay_signature,
      };
    } catch (err) {
      const errorMsg =
        err?.description ||
        err?.message ||
        'Payment was cancelled or could not be completed.';
      throw new Error(errorMsg);
    }
  }

  // 2. Standard Expo Go / Web / Sandbox Environment Handling
  // Expo Go does not contain custom native Android/iOS SDK binaries like Razorpay.
  // We provide a prompt allowing the student in development mode to complete the test payment
  // flow using the verified backend cryptographic signature pipeline.
  return new Promise((resolve, reject) => {
    Alert.alert(
      'Razorpay Sandbox Checkout',
      `Event: ${event?.title}\nAmount: ₹${(amount / 100).toFixed(2)}\nOrder ID: ${orderId}\n\nNotice: Real Razorpay SDK native modal opens in an Expo Development Build (npx expo run:android). Proceed with sandbox test verification?`,
      [
        {
          text: 'Cancel Payment',
          style: 'cancel',
          onPress: () => reject(new Error('Payment was cancelled by user.')),
        },
        {
          text: 'Simulate Paid Success',
          onPress: () => {
            const simulatedPaymentId = `pay_sim_${Date.now()}`;
            resolve({
              razorpayOrderId: orderId,
              razorpayPaymentId: simulatedPaymentId,
              razorpaySignature: 'simulated_valid_signature',
            });
          },
        },
      ]
    );
  });
};

export default {
  isRazorpayNativeAvailable,
  launchRazorpayCheckout,
};
