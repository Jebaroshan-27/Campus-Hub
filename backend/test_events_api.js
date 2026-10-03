const http = require('http');

const request = (path, method, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }

    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', (chunk) => (resBody += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runStep7Tests() {
  console.log('========================================================');
  console.log('  CAMPUSHUB STEP 7: EVENTS & REGISTRATION MODULE TESTS   ');
  console.log('========================================================\n');

  let adminToken = null;
  let facultyTokenA = null;
  let facultyTokenB = null;
  let studentTokenA = null;
  let studentTokenB = null;

  // 1. Setup Admin Account
  console.log('[Setup 1]: Authenticating Admin...');
  let adm = await request('/api/auth/login', 'POST', {
    identifier: 'ADM-EV-001',
    password: 'password123',
  });
  if (adm.status !== 200) {
    adm = await request('/api/auth/register', 'POST', {
      name: 'Event Administrator',
      registerNumber: 'ADM-EV-001',
      email: 'admin_events@campushub.edu',
      password: 'password123',
      role: 'admin',
    });
  }
  adminToken = adm.data?.token;
  console.log('  -> Admin Token Acquired:', !!adminToken);

  // 2. Setup Faculty A
  console.log('[Setup 2]: Authenticating Faculty A (CSE Lead)...');
  let facA = await request('/api/auth/login', 'POST', {
    identifier: 'FAC-EV-001',
    password: 'password123',
  });
  if (facA.status !== 200) {
    facA = await request('/api/auth/register', 'POST', {
      name: 'Dr. Evelyn Reed',
      registerNumber: 'FAC-EV-001',
      email: 'evelyn.reed@campushub.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science & Engineering',
    });
  }
  facultyTokenA = facA.data?.token;
  console.log('  -> Faculty A Token Acquired:', !!facultyTokenA);

  // 3. Setup Faculty B
  console.log('[Setup 3]: Authenticating Faculty B (ECE Lead)...');
  let facB = await request('/api/auth/login', 'POST', {
    identifier: 'FAC-EV-002',
    password: 'password123',
  });
  if (facB.status !== 200) {
    facB = await request('/api/auth/register', 'POST', {
      name: 'Prof. David Vance',
      registerNumber: 'FAC-EV-002',
      email: 'david.vance@campushub.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Electronics & Communication',
    });
  }
  facultyTokenB = facB.data?.token;
  console.log('  -> Faculty B Token Acquired:', !!facultyTokenB);

  // 4. Setup Student A
  console.log('[Setup 4]: Authenticating Student A...');
  let stuA = await request('/api/auth/login', 'POST', {
    identifier: '22CS-EV-001',
    password: 'password123',
  });
  if (stuA.status !== 200) {
    stuA = await request('/api/auth/register', 'POST', {
      name: 'Alex Rivera',
      registerNumber: '22CS-EV-001',
      email: 'alex.rivera@campushub.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
    });
  }
  studentTokenA = stuA.data?.token;
  console.log('  -> Student A Token Acquired:', !!studentTokenA);

  // 5. Setup Student B
  console.log('[Setup 5]: Authenticating Student B...');
  let stuB = await request('/api/auth/login', 'POST', {
    identifier: '22CS-EV-002',
    password: 'password123',
  });
  if (stuB.status !== 200) {
    stuB = await request('/api/auth/register', 'POST', {
      name: 'Sara Khan',
      registerNumber: '22CS-EV-002',
      email: 'sara.khan@campushub.edu',
      password: 'password123',
      role: 'student',
      department: 'Information Technology',
      year: '2nd Year',
    });
  }
  studentTokenB = stuB.data?.token;
  console.log('  -> Student B Token Acquired:', !!studentTokenB);

  console.log('\n--- PART A: FREE EVENT CREATION & REGISTRATION ---');

  // Test 6: Create Free Event as Faculty A
  console.log('[Test 6]: Faculty A creates a Free Hackathon Event...');
  const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];

  const freeEventPayload = {
    title: 'Campus Hackathon 2026',
    description: '48-hour build sprint on AI and Distributed Cloud Applications.',
    eventType: 'Hackathon',
    venue: 'Main Academic Quad & Lab 4',
    eventDate: dayAfter,
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    registrationDeadline: tomorrow,
    organizer: 'CSE Student Chapter',
    department: 'Computer Science & Engineering',
    capacity: 50,
    isPaid: false,
    price: 0,
    status: 'upcoming',
  };

  const createFreeRes = await request(
    '/api/events',
    'POST',
    freeEventPayload,
    facultyTokenA
  );
  console.log('  -> Status:', createFreeRes.status, createFreeRes.data?.message);
  if (createFreeRes.status !== 201) {
    throw new Error('Failed to create free event: ' + JSON.stringify(createFreeRes.data));
  }
  const freeEventId = createFreeRes.data.event._id;

  // Test 7: Student A views events
  console.log('[Test 7]: Student A lists events with filter isPaid=false...');
  const listFreeRes = await request(
    '/api/events?isPaid=false',
    'GET',
    null,
    studentTokenA
  );
  console.log('  -> Found free events count:', listFreeRes.data?.count);
  const foundFree = listFreeRes.data?.events?.find((e) => e._id === freeEventId);
  console.log('  -> Free event in list:', !!foundFree);

  // Test 8: Student A views event details
  console.log('[Test 8]: Student A fetches event details by ID...');
  const detailRes = await request(
    `/api/events/${freeEventId}`,
    'GET',
    null,
    studentTokenA
  );
  console.log(
    '  -> Status:',
    detailRes.status,
    'Title:',
    detailRes.data?.event?.title,
    'IsUserRegistered:',
    detailRes.data?.event?.isUserRegistered
  );

  // Test 9: Student A registers for free event
  console.log('[Test 9]: Student A registers for the free event...');
  const regFreeRes = await request(
    `/api/events/${freeEventId}/register`,
    'POST',
    {},
    studentTokenA
  );
  console.log('  -> Status:', regFreeRes.status, regFreeRes.data?.message);
  if (regFreeRes.status !== 201) {
    throw new Error('Free registration failed: ' + JSON.stringify(regFreeRes.data));
  }

  // Test 10: Duplicate Registration Prevention
  console.log('[Test 10]: Student A attempts duplicate registration...');
  const dupRegRes = await request(
    `/api/events/${freeEventId}/register`,
    'POST',
    {},
    studentTokenA
  );
  console.log(
    '  -> Status (Expected 400):',
    dupRegRes.status,
    dupRegRes.data?.message
  );
  if (dupRegRes.status !== 400) {
    throw new Error('Duplicate registration was not blocked!');
  }

  // Test 11: Verify Student A in My Registrations
  console.log('[Test 11]: Student A checks /api/my-registrations...');
  const myRegsRes = await request(
    '/api/my-registrations',
    'GET',
    null,
    studentTokenA
  );
  console.log('  -> My registrations count:', myRegsRes.data?.count);
  const hasReg = myRegsRes.data?.registrations?.some(
    (r) => r.event?._id === freeEventId
  );
  console.log('  -> Free event present in student bookings:', hasReg);

  // Test 12: Faculty A views attendee roster
  console.log('[Test 12]: Faculty A checks attendee roster for their event...');
  const rosterRes = await request(
    `/api/events/${freeEventId}/registrations`,
    'GET',
    null,
    facultyTokenA
  );
  console.log(
    '  -> Total attendees:',
    rosterRes.data?.count,
    'First attendee:',
    rosterRes.data?.registrations?.[0]?.student?.name
  );

  console.log('\n--- PART B: PAID EVENT CREATION & RAZORPAY CHECKOUT FLOW ---');

  // Test 13: Create Paid Event as Faculty A
  console.log('[Test 13]: Faculty A creates a Paid Cloud Workshop (₹150)...');
  const paidEventPayload = {
    title: 'Cloud Architecture & DevOps Masterclass',
    description: 'Hands-on certification workshop with AWS & Docker practicals.',
    eventType: 'Workshop',
    venue: 'Seminar Hall 2',
    eventDate: dayAfter,
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    registrationDeadline: tomorrow,
    organizer: 'Cloud Computing Club',
    department: 'Computer Science & Engineering',
    capacity: 2, // low capacity to test seat limits later
    isPaid: true,
    price: 150,
    status: 'upcoming',
  };

  const createPaidRes = await request(
    '/api/events',
    'POST',
    paidEventPayload,
    facultyTokenA
  );
  console.log('  -> Status:', createPaidRes.status, createPaidRes.data?.message);
  if (createPaidRes.status !== 201) {
    throw new Error('Failed to create paid event: ' + JSON.stringify(createPaidRes.data));
  }
  const paidEventId = createPaidRes.data.event._id;

  // Test 14: Try free register on paid event -> should be rejected
  console.log('[Test 14]: Student B attempts to bypass payment via free endpoint...');
  const bypassRes = await request(
    `/api/events/${paidEventId}/register`,
    'POST',
    {},
    studentTokenB
  );
  console.log(
    '  -> Status (Expected 400):',
    bypassRes.status,
    bypassRes.data?.message
  );
  if (bypassRes.status !== 400) {
    throw new Error('Paid event allowed free registration!');
  }

  // Test 15: Create Razorpay Order from Backend
  console.log('[Test 15]: Student B creates Razorpay order via POST /create-order...');
  const orderRes = await request(
    `/api/events/${paidEventId}/create-order`,
    'POST',
    {},
    studentTokenB
  );
  console.log(
    '  -> Order created:',
    orderRes.status,
    'OrderId:',
    orderRes.data?.orderId,
    'Amount (paise):',
    orderRes.data?.amount
  );
  if (orderRes.status !== 200 || !orderRes.data?.orderId) {
    throw new Error('Razorpay order creation failed: ' + JSON.stringify(orderRes.data));
  }
  const orderId = orderRes.data.orderId;

  // Test 16: Verify payment with INVALID signature -> should reject
  console.log('[Test 16]: Student B submits invalid payment signature...');
  const invalidVerifyRes = await request(
    `/api/events/${paidEventId}/verify-payment`,
    'POST',
    {
      razorpayOrderId: orderId,
      razorpayPaymentId: 'pay_tampered_123',
      razorpaySignature: 'invalid_fraudulent_signature',
    },
    studentTokenB
  );
  console.log(
    '  -> Status (Expected 400):',
    invalidVerifyRes.status,
    invalidVerifyRes.data?.message
  );
  if (invalidVerifyRes.status !== 400) {
    throw new Error('Invalid signature was erroneously accepted!');
  }

  // Test 17: Verify payment with VALID signature -> should confirm registration
  console.log('[Test 17]: Student B submits valid payment verification...');
  const paymentId = `pay_test_${Date.now()}`;
  const validVerifyRes = await request(
    `/api/events/${paidEventId}/verify-payment`,
    'POST',
    {
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: 'simulated_valid_signature',
    },
    studentTokenB
  );
  console.log('  -> Status:', validVerifyRes.status, validVerifyRes.data?.message);
  if (validVerifyRes.status !== 200) {
    throw new Error('Valid payment verification failed: ' + JSON.stringify(validVerifyRes.data));
  }

  // Test 18: Payment Replay / Duplicate Prevention
  console.log('[Test 18]: Student submits the same payment ID again (Replay Attack test)...');
  const replayRes = await request(
    `/api/events/${paidEventId}/verify-payment`,
    'POST',
    {
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: 'simulated_valid_signature',
    },
    studentTokenB
  );
  console.log(
    '  -> Status (Expected 400):',
    replayRes.status,
    replayRes.data?.message
  );
  if (replayRes.status !== 400) {
    throw new Error('Duplicate paymentId replay attack was not prevented!');
  }

  console.log('\n--- PART C: SECURITY, AUTHORIZATION & VALIDATION TESTS ---');

  // Test 19: Student cannot create event
  console.log('[Test 19]: Student attempts to create an event (Expected 403)...');
  const studentCreateRes = await request(
    '/api/events',
    'POST',
    freeEventPayload,
    studentTokenA
  );
  console.log('  -> Status:', studentCreateRes.status, studentCreateRes.data?.message);
  if (studentCreateRes.status !== 403) {
    throw new Error('Student was allowed to create event!');
  }

  // Test 20: Faculty B cannot modify Faculty A's event
  console.log('[Test 20]: Faculty B attempts to edit Faculty A event (Expected 403)...');
  const crossEditRes = await request(
    `/api/events/${freeEventId}`,
    'PUT',
    { title: 'Unauthorized Modification' },
    facultyTokenB
  );
  console.log('  -> Status:', crossEditRes.status, crossEditRes.data?.message);
  if (crossEditRes.status !== 403) {
    throw new Error('Cross-faculty unauthorized edit was not prevented!');
  }

  // Test 21: Faculty A can successfully edit their own event
  console.log('[Test 21]: Faculty A updates their own event...');
  const ownEditRes = await request(
    `/api/events/${freeEventId}`,
    'PUT',
    { title: 'Campus Hackathon 2026 - Updated Hall' },
    facultyTokenA
  );
  console.log(
    '  -> Status:',
    ownEditRes.status,
    'Updated Title:',
    ownEditRes.data?.event?.title
  );
  if (ownEditRes.status !== 200) {
    throw new Error('Faculty could not update own event!');
  }

  // Test 22: Reject invalid pricing (isPaid: true with price: 0)
  console.log('[Test 22]: Attempt to create paid event with ₹0 fee (Expected 400)...');
  const invalidPriceRes = await request(
    '/api/events',
    'POST',
    {
      ...freeEventPayload,
      title: 'Invalid Paid Event',
      isPaid: true,
      price: 0,
    },
    facultyTokenA
  );
  console.log('  -> Status:', invalidPriceRes.status, invalidPriceRes.data?.message);
  if (invalidPriceRes.status !== 400) {
    throw new Error('Invalid price <= 0 was erroneously allowed for paid event!');
  }

  // Test 23: Reject registration deadline after event date
  console.log('[Test 23]: Attempt to create event where deadline > eventDate (Expected 400)...');
  const invalidDateRes = await request(
    '/api/events',
    'POST',
    {
      ...freeEventPayload,
      title: 'Invalid Date Sequence',
      eventDate: tomorrow,
      registrationDeadline: dayAfter, // after event date!
    },
    facultyTokenA
  );
  console.log('  -> Status:', invalidDateRes.status, invalidDateRes.data?.message);
  if (invalidDateRes.status !== 400) {
    throw new Error('Deadline after event date was not rejected!');
  }

  // Test 24: Admin can manage/delete any event
  console.log('[Test 24]: Admin deletes the test event...');
  const adminDelRes = await request(
    `/api/events/${freeEventId}`,
    'DELETE',
    null,
    adminToken
  );
  console.log('  -> Status:', adminDelRes.status, adminDelRes.data?.message);
  if (adminDelRes.status !== 200) {
    throw new Error('Admin delete failed: ' + JSON.stringify(adminDelRes.data));
  }

  console.log('\n--- PART D: REGRESSION TESTING EXISTING MODULES ---');

  // Test 25: Notes API health
  console.log('[Test 25]: Regression test - GET /api/notes...');
  const notesRes = await request('/api/notes', 'GET', null, studentTokenA);
  console.log('  -> Status:', notesRes.status, 'Notes count:', notesRes.data?.count);

  // Test 26: Placements API health
  console.log('[Test 26]: Regression test - GET /api/placements...');
  const placementsRes = await request('/api/placements', 'GET', null, studentTokenA);
  console.log(
    '  -> Status:',
    placementsRes.status,
    'Placements count:',
    placementsRes.data?.count
  );

  console.log('\n========================================================');
  console.log('  ALL STEP 7 EVENT & REGISTRATION TESTS PASSED! 🚀       ');
  console.log('========================================================\n');
}

runStep7Tests().catch((err) => {
  console.error('\n[STEP 7 TEST SUITE FAILED]:', err);
  process.exit(1);
});
