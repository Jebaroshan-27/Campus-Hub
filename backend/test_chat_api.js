const http = require('http');
const { io } = require('socket.io-client');

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

async function runStep8Tests() {
  console.log('========================================================');
  console.log('  CAMPUSHUB STEP 8: CONNECTIONS & CHAT INTEGRATION TESTS ');
  console.log('========================================================\n');

  // 1. Authenticate / Register Student 1 (A)
  console.log('[Setup 1]: Authenticating Student 1 (22CS-CH-001)...');
  let stuA = await request('/api/auth/login', 'POST', {
    identifier: '22CS-CH-001',
    password: 'password123',
  });
  if (stuA.status !== 200) {
    stuA = await request('/api/auth/register', 'POST', {
      name: 'Rohan Sharma',
      registerNumber: '22CS-CH-001',
      email: 'rohan.sharma@campushub.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
    });
  }
  const tokenA = stuA.data?.token;
  const userAId = stuA.data?.user?.id || stuA.data?.user?._id;
  console.log('  -> Student 1 Token:', !!tokenA, 'ID:', userAId);

  // 2. Authenticate / Register Student 2 (B)
  console.log('[Setup 2]: Authenticating Student 2 (22IT-CH-002)...');
  let stuB = await request('/api/auth/login', 'POST', {
    identifier: '22IT-CH-002',
    password: 'password123',
  });
  if (stuB.status !== 200) {
    stuB = await request('/api/auth/register', 'POST', {
      name: 'Priya Patel',
      registerNumber: '22IT-CH-002',
      email: 'priya.patel@campushub.edu',
      password: 'password123',
      role: 'student',
      department: 'Information Technology',
      year: '3rd Year',
    });
  }
  const tokenB = stuB.data?.token;
  const userBId = stuB.data?.user?.id || stuB.data?.user?._id;
  console.log('  -> Student 2 Token:', !!tokenB, 'ID:', userBId);

  // 3. Authenticate / Register Student 3 (C) for reject testing
  console.log('[Setup 3]: Authenticating Student 3 (22EC-CH-003)...');
  let stuC = await request('/api/auth/login', 'POST', {
    identifier: '22EC-CH-003',
    password: 'password123',
  });
  if (stuC.status !== 200) {
    stuC = await request('/api/auth/register', 'POST', {
      name: 'Kavita Nair',
      registerNumber: '22EC-CH-003',
      email: 'kavita.nair@campushub.edu',
      password: 'password123',
      role: 'student',
      department: 'Electronics & Communication',
      year: '2nd Year',
    });
  }
  const tokenC = stuC.data?.token;
  const userCId = stuC.data?.user?.id || stuC.data?.user?._id;
  console.log('  -> Student 3 Token:', !!tokenC, 'ID:', userCId);

  // Clean up any previous test connections/messages between test students for test idempotency
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 0) {
    const dotenv = require('dotenv');
    dotenv.config();
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campushub');
  }
  const Connection = require('./models/Connection');
  const { Message } = require('./models/Message');

  const testUserIds = [userAId, userBId, userCId];
  await Connection.deleteMany({
    $or: [
      { requester: { $in: testUserIds }, receiver: { $in: testUserIds } },
    ],
  });
  await Message.deleteMany({
    sender: { $in: testUserIds },
    receiver: { $in: testUserIds },
  });
  console.log('  ✓ Test environment sanitized for repeatable execution.');

  console.log('\n--- PART A: STUDENT SEARCH & CONNECTION REQUESTS ---');

  // Test 4: Search Student by exact register number
  console.log('[Test 4]: Student A searches for Student B (22IT-CH-002)...');
  const searchRes = await request(
    '/api/connections/search/22IT-CH-002',
    'GET',
    null,
    tokenA
  );
  console.log('  -> Status:', searchRes.status, 'Name:', searchRes.data?.student?.name);
  console.log('  -> Connection Status:', searchRes.data?.connectionStatus);
  if (searchRes.status !== 200 || searchRes.data?.student?.name !== 'Priya Patel') {
    throw new Error('Search student failed: ' + JSON.stringify(searchRes.data));
  }

  // Test 5: Self search prevention
  console.log('[Test 5]: Student A searches for their own register number (22CS-CH-001)...');
  const selfSearchRes = await request(
    '/api/connections/search/22CS-CH-001',
    'GET',
    null,
    tokenA
  );
  console.log('  -> Connection Status:', selfSearchRes.data?.connectionStatus, selfSearchRes.data?.message);
  if (selfSearchRes.data?.connectionStatus !== 'self') {
    throw new Error('Self search status was not returned as self!');
  }

  // Test 6: Self request prevention
  console.log('[Test 6]: Student A attempts to send connection request to self (Expected 400)...');
  const selfReqRes = await request(
    '/api/connections/request',
    'POST',
    { registerNumber: '22CS-CH-001' },
    tokenA
  );
  console.log('  -> Status:', selfReqRes.status, selfReqRes.data?.message);
  if (selfReqRes.status !== 400) {
    throw new Error('Self connection request was not prevented!');
  }

  // Test 7: Send connection request A -> B
  console.log('[Test 7]: Student A sends connection request to Student B...');
  const sendRes = await request(
    '/api/connections/request',
    'POST',
    { registerNumber: '22IT-CH-002' },
    tokenA
  );
  console.log('  -> Status:', sendRes.status, sendRes.data?.message);
  if (sendRes.status !== 201 && !sendRes.data?.message?.includes('already')) {
    throw new Error('Send connection request failed: ' + JSON.stringify(sendRes.data));
  }
  const connectionId = sendRes.data?.connection?._id;

  // Test 8: Prevent duplicate request while pending
  console.log('[Test 8]: Student A tries sending duplicate request while pending (Expected 400)...');
  const dupReqRes = await request(
    '/api/connections/request',
    'POST',
    { registerNumber: '22IT-CH-002' },
    tokenA
  );
  console.log('  -> Status:', dupReqRes.status, dupReqRes.data?.message);
  if (dupReqRes.status !== 400) {
    throw new Error('Duplicate connection request was not blocked!');
  }

  // Test 9: Student B views pending received requests
  console.log('[Test 9]: Student B fetches connections list...');
  const listBRes = await request('/api/connections', 'GET', null, tokenB);
  console.log(
    '  -> Pending Received count:',
    listBRes.data?.counts?.pendingReceived,
    'Sender:',
    listBRes.data?.pendingReceived?.[0]?.requester?.name
  );
  const activeConnId =
    connectionId || listBRes.data?.pendingReceived?.[0]?._id;

  // Test 10: Unauthorized chat before acceptance (Expected 403)
  console.log('[Test 10]: Student A attempts to send chat before acceptance (Expected 403)...');
  const preAcceptChatRes = await request(
    '/api/messages',
    'POST',
    { receiverId: userBId, message: 'Hey Priya, can you see this?' },
    tokenA
  );
  console.log('  -> Status:', preAcceptChatRes.status, preAcceptChatRes.data?.message);
  if (preAcceptChatRes.status !== 403) {
    throw new Error('Unaccepted chat was erroneously allowed!');
  }

  // Test 11: Student B accepts connection
  console.log('[Test 11]: Student B accepts connection invitation...');
  const acceptRes = await request(
    `/api/connections/${activeConnId}/accept`,
    'POST',
    {},
    tokenB
  );
  console.log('  -> Status:', acceptRes.status, acceptRes.data?.message);
  if (acceptRes.status !== 200) {
    throw new Error('Failed to accept connection: ' + JSON.stringify(acceptRes.data));
  }

  // Test 12: Verify connection status is accepted for both
  console.log('[Test 12]: Verify both students have accepted connection in list...');
  const verifyListARes = await request('/api/connections', 'GET', null, tokenA);
  console.log(
    '  -> Student A accepted count:',
    verifyListARes.data?.counts?.accepted,
    'Partner:',
    verifyListARes.data?.accepted?.[0]?.partner?.name
  );

  console.log('\n--- PART B: REAL-TIME SOCKET.IO MESSAGING ---');

  // Test 13: Socket.IO Authentication & Real-time exchange
  console.log('[Test 13]: Connecting Socket.IO client for Student B...');
  const socketB = io('http://127.0.0.1:5000', {
    auth: { token: tokenB },
    transports: ['websocket'],
  });

  await new Promise((resolve, reject) => {
    socketB.on('connect', () => {
      console.log('  ✓ Socket B connected successfully! Socket ID:', socketB.id);
      resolve();
    });
    socketB.on('connect_error', (err) => {
      reject(err);
    });
    setTimeout(() => reject(new Error('Socket B connection timed out')), 5000);
  });

  // Student B joins conversation room
  socketB.emit('join_conversation', { partnerId: userAId });

  // Setup message listener on Student B
  const messageReceivedPromise = new Promise((resolve) => {
    socketB.on('new_message', (msg) => {
      console.log('  ✓ Student B received real-time socket message:');
      console.log('    Text:', msg.message, '| Sender:', msg.sender?.name);
      resolve(msg);
    });
  });

  // Test 14: Student A sends message via REST API
  console.log('[Test 14]: Student A sends message via POST /api/messages...');
  const sendMsgRes = await request(
    '/api/messages',
    'POST',
    {
      receiverId: userBId,
      message: 'Hello Priya! Are you working on the AI Campus Hub project?',
    },
    tokenA
  );
  console.log('  -> Send status:', sendMsgRes.status, sendMsgRes.data?.message);
  if (sendMsgRes.status !== 201) {
    throw new Error('Failed to send message: ' + JSON.stringify(sendMsgRes.data));
  }

  // Wait for Socket B to receive real-time emission
  const receivedMsg = await Promise.race([
    messageReceivedPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Socket real-time message timeout')), 5000)
    ),
  ]);

  if (receivedMsg.message !== 'Hello Priya! Are you working on the AI Campus Hub project?') {
    throw new Error('Received message content mismatch!');
  }

  // Test 15: Student B replies
  console.log('[Test 15]: Student B replies via POST /api/messages...');
  const replyRes = await request(
    '/api/messages',
    'POST',
    {
      receiverId: userAId,
      message: 'Hi Rohan! Yes, I am testing the real-time chat portal.',
    },
    tokenB
  );
  console.log('  -> Reply status:', replyRes.status);

  // Test 16: Fetch message history via GET /api/messages/:userId
  console.log('[Test 16]: Student A fetches chat history with Student B...');
  const historyRes = await request(
    `/api/messages/${userBId}`,
    'GET',
    null,
    tokenA
  );
  console.log(
    '  -> Total messages in history:',
    historyRes.data?.count,
    'ConversationKey:',
    historyRes.data?.conversationKey
  );
  if (historyRes.data?.count < 2) {
    throw new Error('History did not contain both messages!');
  }

  // Disconnect Socket B
  socketB.disconnect();

  console.log('\n--- PART C: BLOCK FEATURE & SECURITY ENFORCEMENT ---');

  // Test 17: Student A blocks Student B
  console.log('[Test 17]: Student A blocks Student B via POST /api/connections/:id/block...');
  const blockRes = await request(
    `/api/connections/${activeConnId}/block`,
    'POST',
    {},
    tokenA
  );
  console.log('  -> Block status:', blockRes.status, blockRes.data?.message);
  if (blockRes.status !== 200) {
    throw new Error('Failed to block connection: ' + JSON.stringify(blockRes.data));
  }

  // Test 18: Sending message while blocked (Expected 403)
  console.log('[Test 18]: Student B attempts to message Student A after block (Expected 403)...');
  const blockedSendRes = await request(
    '/api/messages',
    'POST',
    { receiverId: userAId, message: 'Can you hear me?' },
    tokenB
  );
  console.log('  -> Status:', blockedSendRes.status, blockedSendRes.data?.message);
  if (blockedSendRes.status !== 403) {
    throw new Error('Message sending was not blocked!');
  }

  // Test 19: Loading history while blocked (Expected 403)
  console.log('[Test 19]: Student B attempts to load chat history while blocked (Expected 403)...');
  const blockedHistRes = await request(
    `/api/messages/${userAId}`,
    'GET',
    null,
    tokenB
  );
  console.log('  -> Status:', blockedHistRes.status, blockedHistRes.data?.message);
  if (blockedHistRes.status !== 403) {
    throw new Error('History retrieval was not blocked!');
  }

  console.log('\n--- PART D: REJECTION & RE-REQUEST FLOW ---');

  // Test 20: Send request to Student C
  console.log('[Test 20]: Student A sends request to Student C...');
  const reqCRes = await request(
    '/api/connections/request',
    'POST',
    { registerNumber: '22EC-CH-003' },
    tokenA
  );
  const connCId = reqCRes.data?.connection?._id;
  console.log('  -> Request to C status:', reqCRes.status);

  // Test 21: Student C rejects
  console.log('[Test 21]: Student C declines request...');
  const rejectRes = await request(
    `/api/connections/${connCId}/reject`,
    'POST',
    {},
    tokenC
  );
  console.log('  -> Reject status:', rejectRes.status, rejectRes.data?.message);

  // Test 22: Student A re-requests Student C after rejection
  console.log('[Test 22]: Student A re-sends request after rejection (Preferred behavior)...');
  const reReqRes = await request(
    '/api/connections/request',
    'POST',
    { registerNumber: '22EC-CH-003' },
    tokenA
  );
  console.log('  -> Re-request status (Expected 201):', reReqRes.status, reReqRes.data?.message);
  if (reReqRes.status !== 201) {
    throw new Error('Re-request after rejection failed!');
  }

  console.log('\n========================================================');
  console.log('  ALL STEP 8 CONNECTION & CHAT TESTS PASSED! 🚀          ');
  console.log('========================================================\n');
  process.exit(0);
}

runStep8Tests().catch((err) => {
  console.error('\n[STEP 8 TEST SUITE FAILED]:', err);
  process.exit(1);
});
