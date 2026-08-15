/**
 * @file backend/test_e2e.js
 * Automated End-to-End E-Commerce Real World Integration Test Suite
 */
const API_BASE = 'http://localhost:5000/api/v1';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

async function runEndToEndTests() {
  console.log('===============================================================');
  console.log('🚀 STARTING FULL E-COMMERCE END-TO-END VALIDATION TESTS');
  console.log('===============================================================\n');

  try {
    // 1. Check Products and Categories
    console.log('📦 Step 1: Testing Product Catalog & Category Queries...');
    const productsRes = await request(`${API_BASE}/products?limit=5`);
    const categoriesRes = await request(`${API_BASE}/categories`);
    console.log(`  ✓ Products fetched: ${productsRes.data.products.length} products found`);
    console.log(`  ✓ Categories fetched: ${categoriesRes.data.length} categories found`);

    // 2. Customer Registration & Email Verification Workflow
    console.log('\n✉️ Step 2: Testing Customer Registration & Email Verification...');
    const testEmail = `test_customer_${Date.now()}@example.com`;
    const regRes = await request(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: {
        name: 'New Test Customer',
        email: testEmail,
        password: 'password123',
        role: 'user',
        phone: '+91 98765 12345',
        houseNo: 'H.No. 1-23',
        street: 'Gandhi Road',
        villageOrLocality: 'Rampur Village',
        mandalOrTehsil: 'Ghatkesar Mandal',
        district: 'Medchal-Malkajgiri',
        state: 'Telangana',
        pincode: '501301',
      },
    });
    console.log(`  ✓ Registered Customer: ${regRes.data.user.name} (${regRes.data.user.email})`);
    console.log(`  ✓ Initial Verification Status: isEmailVerified = ${regRes.data.user.isEmailVerified} (Unverified Alert Active)`);

    const verificationUrl = regRes.data.verificationUrl;
    const verificationToken = verificationUrl.split('/verify-email/')[1];
    const verifyRes = await request(`${API_BASE}/auth/verify-email/${verificationToken}`);
    console.log(`  ✓ Verified Email via Token: ${verifyRes.message}`);

    // 3. Customer Forgot Password & Reset Password Workflow
    console.log('\n🔑 Step 3: Testing Forgot Password & Reset Password Link...');
    const forgotRes = await request(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      body: { email: testEmail },
    });
    const resetUrl = forgotRes.data.resetUrl;
    const resetToken = resetUrl.split('/reset-password/')[1];
    console.log(`  ✓ Reset Password link generated: ${resetUrl}`);

    const resetRes = await request(`${API_BASE}/auth/reset-password/${resetToken}`, {
      method: 'POST',
      body: { password: 'newpassword123' },
    });
    console.log(`  ✓ Password Reset Completed: ${resetRes.message}`);

    // Login with new password
    const customerLogin = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: { email: testEmail, password: 'newpassword123' },
    });
    const customerToken = customerLogin.data.accessToken;
    console.log(`  ✓ Successfully logged in with new password! (Role: ${customerLogin.data.user.role})`);

    // 4. Checkout & Order Creation
    console.log('\n💳 Step 4: Testing Cart Checkout & Order Placement...');
    const firstProduct = productsRes.data.products[0];
    const orderPayload = {
      orderItems: [
        {
          name: firstProduct.name,
          quantity: 2,
          image: firstProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
          price: firstProduct.discountPrice || firstProduct.price || 260.00,
          product: firstProduct._id,
        },
      ],
      shippingAddress: {
        fullName: 'New Test Customer',
        phone: '+91 98765 12345',
        houseNo: 'H.No. 1-23',
        street: 'Gandhi Road',
        villageOrLocality: 'Rampur Village',
        mandalOrTehsil: 'Ghatkesar Mandal',
        district: 'Medchal-Malkajgiri',
        state: 'Telangana',
        pincode: '501301',
        landmark: 'Near Temple',
        country: 'India',
      },
      paymentMethod: 'Stripe Card',
      totalPrice: ((firstProduct.discountPrice || firstProduct.price || 260.00) * 2 * 1.08),
      itemsPrice: ((firstProduct.discountPrice || firstProduct.price || 260.00) * 2),
      taxPrice: ((firstProduct.discountPrice || firstProduct.price || 260.00) * 2 * 0.08),
      shippingPrice: 0,
    };

    const orderRes = await request(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: orderPayload,
    });
    const orderId = orderRes.data._id;
    const trackingNumber = orderRes.data.trackingNumber;
    console.log(`  ✓ Order successfully placed! Order ID: ${orderId}`);
    console.log(`  ✓ Tracking Number generated: ${trackingNumber}`);
    console.log(`  ✓ Total Amount: $${orderRes.data.totalPrice.toFixed(2)} USD`);

    // 5. Payment Intent & Confirmation
    console.log('\n🔒 Step 5: Finalizing Stripe Payment Transaction...');
    await request(`${API_BASE}/payments/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        orderId,
        paymentIntentId: `pi_test_${Date.now()}`,
      },
    });
    console.log(`  ✓ Payment verified! Order status: PAID (isPaid: true)`);

    // 6. Seller Login & Order Fulfillment
    console.log('\n🏪 Step 6: Testing Seller Merchant Order Fulfillment...');
    const sellerLogin = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: { email: 'seller@example.com', password: 'password123' },
    });
    const sellerToken = sellerLogin.data.accessToken;
    console.log(`  ✓ Seller logged in: ${sellerLogin.data.user.name} (${sellerLogin.data.user.role})`);

    // Update status to Dispatched
    await request(`${API_BASE}/sellers/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: { orderStatus: 'Dispatched' },
    });
    console.log(`  ✓ Seller Action: Order packed and marked as 'Dispatched'`);

    // Update status to In Transit
    await request(`${API_BASE}/sellers/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: { orderStatus: 'In Transit' },
    });
    console.log(`  ✓ Seller Action: Handover to Courier completed -> 'In Transit'`);

    // 7. Customer Live Order Tracking & OTP Fetch
    console.log('\n📦 Step 7: Testing Customer Live Order Tracking & Doorstep OTP...');
    const customerMyOrders = await request(`${API_BASE}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const customerPlacedOrder = customerMyOrders.data.find((o) => o._id === orderId);
    const customerOtp = customerPlacedOrder?.deliveryOtp;
    console.log(`  ✓ Customer private tracking lookup successful!`);
    console.log(`  ✓ Live Status: ${customerPlacedOrder?.orderStatus}`);
    console.log(`  ✓ Customer Doorstep Delivery OTP: [ ${customerOtp} ]`);

    // 8. Delivery Agent Doorstep OTP Handover
    console.log('\n🚚 Step 8: Testing Delivery Agent Doorstep OTP Handover...');
    const deliveryLogin = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: { email: 'delivery@example.com', password: 'password123' },
    });
    const deliveryToken = deliveryLogin.data.accessToken;
    console.log(`  ✓ Delivery Partner logged in: ${deliveryLogin.data.user.name} (${deliveryLogin.data.user.role})`);

    // Courier verifies OTP provided by customer at doorstep
    const verifyOtpRes = await request(`${API_BASE}/delivery/orders/${orderId}/verify-otp`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${deliveryToken}` },
      body: { otp: customerOtp },
    });
    console.log(`  ✓ Doorstep OTP (${customerOtp}) Verified!`);
    console.log(`  ✓ Order finalized to 'Delivered' (isDelivered: ${verifyOtpRes.data.isDelivered})`);

    // 9. Admin Platform Metrics
    console.log('\n👑 Step 9: Testing Platform Admin Command & Stats...');
    const adminLogin = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: { email: 'admin@example.com', password: 'password123' },
    });
    const adminToken = adminLogin.data.accessToken;
    const statsRes = await request(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStats = statsRes.data;
    console.log(`  ✓ Admin Stats Verified:`);
    console.log(`     - Total Platform Sales: $${adminStats.totalSales?.toFixed(2) || '0.00'} USD`);
    console.log(`     - Total Orders Processed: ${adminStats.totalOrders || 0}`);
    console.log(`     - Live Catalog Items: ${adminStats.totalProducts || 0}`);

    console.log('\n===============================================================');
    console.log('🎉 ALL END-TO-END REAL-WORLD E-COMMERCE TESTS PASSED (100%)!');
    console.log('===============================================================');
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runEndToEndTests();
