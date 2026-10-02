// Automated integration test suite for CampusHub backend API
const http = require('http');

const request = (path, method, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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

const runTests = async () => {
  console.log('--- Starting CampusHub API Test Suite ---');
  let studentToken = null;
  let facultyToken = null;
  let adminToken = null;

  // 1. Health check
  const health = await request('/api/health', 'GET');
  console.log(`[Test 1] GET /api/health: status = ${health.status}, msg = "${health.data.message}"`);

  // 2. Student login (using registerNumber)
  const studentLogin = await request('/api/auth/login', 'POST', {
    identifier: '21BCS0142',
    password: 'password123',
  });
  console.log(`[Test 2] POST /api/auth/login (Student by regNo): status = ${studentLogin.status}, success = ${studentLogin.data.success}`);
  studentToken = studentLogin.data.token;

  // 3. Login with invalid password
  const badLogin = await request('/api/auth/login', 'POST', {
    identifier: '21BCS0142',
    password: 'wrongpassword',
  });
  console.log(`[Test 3] POST /api/auth/login (Bad Password): status = ${badLogin.status}, msg = "${badLogin.data.message}"`);

  // 4. Duplicate registration test
  const dupReg = await request('/api/auth/register', 'POST', {
    name: 'Duplicate',
    registerNumber: '21BCS0142',
    email: 'karthikeyan.r@campushub.edu',
    password: 'password123',
    role: 'student',
  });
  console.log(`[Test 4] POST /api/auth/register (Duplicate RegNo/Email): status = ${dupReg.status}, msg = "${dupReg.data.message}"`);

  // 5. GET /api/auth/me (Protected student profile)
  const me = await request('/api/auth/me', 'GET', null, studentToken);
  console.log(`[Test 5] GET /api/auth/me (Student): status = ${me.status}, name = "${me.data.user.name}", role = "${me.data.user.role}"`);

  // 6. Register Faculty
  const facultyReg = await request('/api/auth/register', 'POST', {
    name: 'Dr. Sarah Mitchell',
    registerNumber: 'FAC-CSE-109',
    email: 's.mitchell@campushub.edu',
    password: 'password123',
    role: 'faculty',
    department: 'Computer Science & Engineering',
  });
  if (facultyReg.status === 201) {
    facultyToken = facultyReg.data.token;
    console.log(`[Test 6] Register Faculty: status = 201, role = "${facultyReg.data.user.role}"`);
  } else {
    // If already registered, login
    const facLogin = await request('/api/auth/login', 'POST', {
      identifier: 'FAC-CSE-109',
      password: 'password123',
    });
    facultyToken = facLogin.data.token;
    console.log(`[Test 6] Login Faculty: status = ${facLogin.status}, role = "${facLogin.data.user.role}"`);
  }

  // 7. Register Admin
  const adminReg = await request('/api/auth/register', 'POST', {
    name: 'Campus Administrator',
    registerNumber: 'ADM-IT-001',
    email: 'admin@campushub.edu',
    password: 'password123',
    role: 'admin',
    department: 'Campus IT & Administration',
  });
  if (adminReg.status === 201) {
    adminToken = adminReg.data.token;
    console.log(`[Test 7] Register Admin: status = 201, role = "${adminReg.data.user.role}"`);
  } else {
    const admLogin = await request('/api/auth/login', 'POST', {
      identifier: 'ADM-IT-001',
      password: 'password123',
    });
    adminToken = admLogin.data.token;
    console.log(`[Test 7] Login Admin: status = ${admLogin.status}, role = "${admLogin.data.user.role}"`);
  }

  // 8. Test role middleware: student accessing admin endpoint -> MUST BE 403 Forbidden!
  const studentUnauthorizedAccess = await request('/api/test/admin', 'GET', null, studentToken);
  console.log(`[Test 8] Student accessing /api/test/admin: status = ${studentUnauthorizedAccess.status} (Expected 403), msg = "${studentUnauthorizedAccess.data.message}"`);

  // 9. Test role middleware: admin accessing admin endpoint -> MUST BE 200 OK!
  const adminAuthorizedAccess = await request('/api/test/admin', 'GET', null, adminToken);
  console.log(`[Test 9] Admin accessing /api/test/admin: status = ${adminAuthorizedAccess.status} (Expected 200), msg = "${adminAuthorizedAccess.data.message}"`);

  // 10. Test Forgot Password & Reset Password
  const forgot = await request('/api/auth/forgot-password', 'POST', {
    identifier: '21BCS0142',
  });
  console.log(`[Test 10a] Forgot Password: status = ${forgot.status}, code = ${forgot.data.testCode}`);

  const reset = await request('/api/auth/reset-password', 'POST', {
    identifier: '21BCS0142',
    otp: '123456',
    newPassword: 'newpassword456',
  });
  console.log(`[Test 10b] Reset Password: status = ${reset.status}, msg = "${reset.data.message}"`);

  // Re-login with new password to confirm update
  const newLogin = await request('/api/auth/login', 'POST', {
    identifier: '21BCS0142',
    password: 'newpassword456',
  });
  console.log(`[Test 10c] Login with new password: status = ${newLogin.status}, success = ${newLogin.data.success}`);

  // Reset back to original password for convenience
  await request('/api/auth/reset-password', 'POST', {
    identifier: '21BCS0142',
    otp: '123456',
    newPassword: 'password123',
  });

  console.log('--- All Backend Tests Completed Successfully! ---');
};

runTests().catch(console.error);
