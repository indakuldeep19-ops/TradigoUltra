import { API_BASE_URL } from '../config';

const deposit = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'create-order',
        data: { amount: 5000 * 100, currency: 'INR' }
      })
    });
    const order = await response.json();
    // Now open Razorpay checkout using order.id
    var options = {
      description: 'Add funds to wallet',
      currency: 'INR',
      amount: order.amount,
      key: 'YOUR_RAZORPAY_KEY_ID', // replace with actual key
      order_id: order.id,
      name: 'Tradigo Ultra',
      prefill: { email: auth.currentUser?.email },
      theme: { color: '#FFD700' }
    };
    RazorpayCheckout.open(options).then((data) => {
      alert(`Success: ${data.razorpay_payment_id}`);
    }).catch((err) => alert(err.code));
  } catch (error) {
    console.error(error);
  }
};
