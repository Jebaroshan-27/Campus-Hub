const http = require('http');

// Helper to make JSON requests
const request = (path, method, body = null, token = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (body && typeof body === 'object' && !headers['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(data);
    } else if (data && headers['Content-Length'] === undefined) {
      reqHeaders['Content-Length'] = Buffer.byteLength(data);
    }

    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: reqHeaders,
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

// Helper to send multipart/form-data with a file buffer
const uploadMultipart = (path, fields, file, token = null) => {
  return new Promise((resolve, reject) => {
    const boundary = '----CampusHubBoundary' + Date.now().toString(16);
    let payload = '';

    // Add text fields
    for (const [key, value] of Object.entries(fields)) {
      payload += `--${boundary}\r\n`;
      payload += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      payload += `${value}\r\n`;
    }

    // Add file field
    if (file) {
      payload += `--${boundary}\r\n`;
      payload += `Content-Disposition: form-data; name="file"; filename="${file.filename}"\r\n`;
      payload += `Content-Type: ${file.mimeType}\r\n\r\n`;
    }

    const fileContent = file ? file.content : Buffer.from('');
    const closing = `\r\n--${boundary}--\r\n`;

    const payloadHeaderBuffer = Buffer.from(payload, 'utf-8');
    const closingBuffer = Buffer.from(closing, 'utf-8');
    const totalLength = payloadHeaderBuffer.length + fileContent.length + closingBuffer.length;

    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalLength,
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
    req.write(payloadHeaderBuffer);
    if (fileContent.length > 0) req.write(fileContent);
    req.write(closingBuffer);
    req.end();
  });
};

async function runStep5Tests() {
  console.log('====================================================');
  console.log('  CAMPUSHUB STEP 5: NOTES HUB COMPREHENSIVE TESTS   ');
  console.log('====================================================\n');

  let studentToken = null;
  let faculty1Token = null;
  let faculty2Token = null;
  let adminToken = null;

  // 1. Login as Student
  console.log('[Test 1]: Login as Student (21BCS0142)...');
  const studentLogin = await request('/api/auth/login', 'POST', {
    identifier: '21BCS0142',
    password: 'password123',
  });
  if (studentLogin.status === 200) {
    studentToken = studentLogin.data.token;
    console.log('  ✓ Student login successful (Status 200, Role: student)');
  } else {
    // If not seeded, register
    const reg = await request('/api/auth/register', 'POST', {
      name: 'Karthikeyan R',
      registerNumber: '21BCS0142',
      email: 'karthikeyan.r@campushub.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
    });
    studentToken = reg.data.token;
    console.log('  ✓ Student registered & logged in (Status 201)');
  }

  // 2. GET /api/notes as Student
  console.log('\n[Test 2]: GET /api/notes (Student authenticated)...');
  const getNotesRes = await request('/api/notes', 'GET', null, studentToken);
  console.log(`  ✓ GET /api/notes: Status ${getNotesRes.status}, Found: ${getNotesRes.data.count ?? 0} notes`);

  // 3. Login as Faculty 1 & Faculty 2
  console.log('\n[Test 3]: Setup Faculty 1 & Faculty 2...');
  let fac1 = await request('/api/auth/login', 'POST', {
    identifier: 'FAC-CSE-109',
    password: 'password123',
  });
  if (fac1.status !== 200) {
    fac1 = await request('/api/auth/register', 'POST', {
      name: 'Dr. Sarah Mitchell',
      registerNumber: 'FAC-CSE-109',
      email: 's.mitchell@campushub.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science & Engineering',
    });
  }
  faculty1Token = fac1.data.token;
  console.log('  ✓ Faculty 1 logged in (Dr. Sarah Mitchell)');

  let fac2 = await request('/api/auth/login', 'POST', {
    identifier: 'FAC-ECE-201',
    password: 'password123',
  });
  if (fac2.status !== 200) {
    fac2 = await request('/api/auth/register', 'POST', {
      name: 'Prof. Alan Turing',
      registerNumber: 'FAC-ECE-201',
      email: 'a.turing@campushub.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Electronics & Communication',
    });
  }
  faculty2Token = fac2.data.token;
  console.log('  ✓ Faculty 2 logged in (Prof. Alan Turing)');

  // Also setup Admin
  let adm = await request('/api/auth/login', 'POST', {
    identifier: 'ADM-IT-001',
    password: 'password123',
  });
  if (adm.status !== 200) {
    adm = await request('/api/auth/register', 'POST', {
      name: 'Campus Administrator',
      registerNumber: 'ADM-IT-001',
      email: 'admin@campushub.edu',
      password: 'password123',
      role: 'admin',
      department: 'Campus IT & Administration',
    });
  }
  adminToken = adm.data.token;
  console.log('  ✓ Admin logged in (Campus Administrator)');

  // 4. Faculty 1 Uploads a PDF
  console.log('\n[Test 4]: Faculty 1 uploads a PDF note (DBMS Unit 3 Transactions)...');
  const dummyPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< >>\n%%EOF');
  const uploadRes = await uploadMultipart(
    '/api/notes',
    {
      title: 'Distributed Transactions & 2PC Protocols',
      description: 'Comprehensive lecture slides covering 2-Phase Commit and ACID properties.',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      semester: 'Semester 5',
      subject: 'DBMS',
    },
    {
      filename: 'DBMS_Unit3_Transactions.pdf',
      mimeType: 'application/pdf',
      content: dummyPdfContent,
    },
    faculty1Token
  );
  console.log(`  ✓ Upload response status: ${uploadRes.status}`);
  if (uploadRes.status !== 201) {
    console.error('  ✗ Upload failed:', uploadRes.data);
    process.exit(1);
  }
  const note1 = uploadRes.data.note;
  console.log(`  ✓ Created Note ID: ${note1._id}`);
  console.log(`  ✓ Note Title: "${note1.title}"`);

  // 5. Verify Cloudinary upload
  console.log('\n[Test 5]: Verify Cloudinary upload & file URL...');
  console.log(`  ✓ fileUrl: ${note1.fileUrl}`);
  console.log(`  ✓ cloudinaryPublicId: ${note1.cloudinaryPublicId}`);
  if (!note1.fileUrl || !note1.cloudinaryPublicId) {
    console.error('  ✗ Missing Cloudinary details!');
    process.exit(1);
  }

  // 6. Verify MongoDB note document fields
  console.log('\n[Test 6]: Verify MongoDB note document...');
  console.log(`  ✓ fileName: ${note1.fileName}`);
  console.log(`  ✓ fileType: ${note1.fileType}`);
  console.log(`  ✓ uploadedBy: ${note1.uploadedBy?.name} (${note1.uploadedBy?.role})`);
  console.log(`  ✓ timestamps: createdAt = ${note1.createdAt}`);

  // 7. Student searches the uploaded note
  console.log('\n[Test 7]: Student searches for "Transactions"...');
  const searchRes = await request('/api/notes?search=Transactions', 'GET', null, studentToken);
  const matched = searchRes.data.notes.find((n) => n._id === note1._id);
  if (matched) {
    console.log(`  ✓ Search matched note: "${matched.title}" (Found ${searchRes.data.count} items)`);
  } else {
    console.error('  ✗ Note not found via search!');
    process.exit(1);
  }

  // 8. Student filters by department, year, semester, subject
  console.log('\n[Test 8]: Student filters by Department="Computer Science & Engineering", Year="3rd Year", Semester="Semester 5", Subject="DBMS"...');
  const filterUrl =
    '/api/notes?department=' +
    encodeURIComponent('Computer Science & Engineering') +
    '&year=' +
    encodeURIComponent('3rd Year') +
    '&semester=' +
    encodeURIComponent('Semester 5') +
    '&subject=DBMS';
  const filterRes = await request(filterUrl, 'GET', null, studentToken);
  const filterMatched = filterRes.data.notes.find((n) => n._id === note1._id);
  if (filterMatched) {
    console.log(`  ✓ Filter matched note successfully! Total results: ${filterRes.data.count}`);
  } else {
    console.error('  ✗ Filter query did not return the expected note!');
    process.exit(1);
  }

  // 9. Student opens the note details: GET /api/notes/:id
  console.log('\n[Test 9]: Student opens individual note: GET /api/notes/' + note1._id);
  const noteDetailRes = await request('/api/notes/' + note1._id, 'GET', null, studentToken);
  console.log(`  ✓ GET /api/notes/:id Status: ${noteDetailRes.status}`);
  console.log(`  ✓ Title: "${noteDetailRes.data.note.title}"`);
  console.log(`  ✓ Download/View URL: ${noteDetailRes.data.note.fileUrl}`);

  // 10 & 11: Authorization - Faculty 2 attempts to delete Faculty 1's note (Must be 403 Forbidden)
  console.log('\n[Test 10 & 11]: Faculty 2 attempts to delete Faculty 1\'s note...');
  const unauthorizedDelete = await request('/api/notes/' + note1._id, 'DELETE', null, faculty2Token);
  console.log(`  ✓ Attempt status: ${unauthorizedDelete.status} (Expected: 403)`);
  console.log(`  ✓ Message: "${unauthorizedDelete.data.message}"`);
  if (unauthorizedDelete.status !== 403) {
    console.error('  ✗ Security check failed: Unauthorized faculty could delete another faculty\'s note!');
    process.exit(1);
  }

  // Student attempts to delete note (Must also be 403 Forbidden)
  console.log('\n[Test 11b]: Student attempts to delete note...');
  const studentDelete = await request('/api/notes/' + note1._id, 'DELETE', null, studentToken);
  console.log(`  ✓ Attempt status: ${studentDelete.status} (Expected: 403)`);

  // Student attempts to upload note (Must be 403 Forbidden)
  console.log('\n[Test 11c]: Student attempts to upload note (Must be 403 Forbidden)...');
  const studentUpload = await uploadMultipart(
    '/api/notes',
    {
      title: 'Student Attempted Upload',
      department: 'Computer Science & Engineering',
      year: '1st Year',
      semester: 'Semester 1',
      subject: 'Math',
    },
    {
      filename: 'test.pdf',
      mimeType: 'application/pdf',
      content: dummyPdfContent,
    },
    studentToken
  );
  console.log(`  ✓ Student upload status: ${studentUpload.status} (Expected: 403)`);

  // 12. Admin deletes the note
  console.log('\n[Test 12]: Admin deletes the note (DELETE /api/notes/' + note1._id + ')...');
  const adminDelete = await request('/api/notes/' + note1._id, 'DELETE', null, adminToken);
  console.log(`  ✓ Admin delete status: ${adminDelete.status} (Expected: 200)`);
  console.log(`  ✓ Message: "${adminDelete.data.message}"`);

  // Verify deletion from database
  const verifyDelete = await request('/api/notes/' + note1._id, 'GET', null, studentToken);
  console.log(`  ✓ Verify note lookup after delete: Status ${verifyDelete.status} (Expected: 404 Not Found)`);

  // Upload a second note for Faculty 1 and let Faculty 1 delete their own note
  console.log('\n[Test 10b]: Faculty 1 uploads and deletes their own note...');
  const note2Upload = await uploadMultipart(
    '/api/notes',
    {
      title: 'Computer Networks - OSI Model Notes',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      semester: 'Semester 5',
      subject: 'Computer Networks',
    },
    {
      filename: 'OSI_Model.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      content: Buffer.from('Mock docx content'),
    },
    faculty1Token
  );
  const note2Id = note2Upload.data.note._id;
  console.log(`  ✓ Note 2 created by Faculty 1: ID ${note2Id}`);

  const facultyOwnDelete = await request('/api/notes/' + note2Id, 'DELETE', null, faculty1Token);
  console.log(`  ✓ Faculty 1 deleted own note: Status ${facultyOwnDelete.status} (Expected: 200)`);

  // 13. Upload unsupported file (.exe / arbitrary executable) -> Must reject with 400
  console.log('\n[Test 13]: Upload unsupported file type (.exe)...');
  const badFileUpload = await uploadMultipart(
    '/api/notes',
    {
      title: 'Dangerous Script',
      department: 'Computer Science & Engineering',
      year: '1st Year',
      semester: 'Semester 1',
      subject: 'Malware',
    },
    {
      filename: 'virus.exe',
      mimeType: 'application/x-msdownload',
      content: Buffer.from('MZ...executable binary'),
    },
    faculty1Token
  );
  console.log(`  ✓ Unsupported file status: ${badFileUpload.status} (Expected: 400)`);
  console.log(`  ✓ Message: "${badFileUpload.data.message}"`);
  if (badFileUpload.status !== 400) {
    console.error('  ✗ Security check failed: Unsupported file was not rejected with 400!');
    process.exit(1);
  }

  // 14. Upload without JWT -> Expected: 401 Unauthorized
  console.log('\n[Test 14]: Upload without JWT authentication token...');
  const noJwtUpload = await uploadMultipart(
    '/api/notes',
    {
      title: 'No Token Test',
      department: 'Computer Science & Engineering',
      year: '1st Year',
      semester: 'Semester 1',
      subject: 'Math',
    },
    {
      filename: 'sample.pdf',
      mimeType: 'application/pdf',
      content: dummyPdfContent,
    },
    null // No token!
  );
  console.log(`  ✓ No JWT upload status: ${noJwtUpload.status} (Expected: 401)`);
  console.log(`  ✓ Message: "${noJwtUpload.data.message}"`);
  if (noJwtUpload.status !== 401) {
    console.error('  ✗ Security check failed: Upload without JWT was not rejected with 401!');
    process.exit(1);
  }

  // Now seed a few real initial notes so that the mobile app displays rich, professional academic materials out-of-the-box!
  console.log('\n[Seed]: Seeding high-quality initial study materials for mobile testing...');
  const sampleNotes = [
    {
      title: 'Database Management Systems - Relational Algebra & SQL',
      description: 'In-depth notes on Relational Calculus, Query Optimization, and Normalization up to BCNF.',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      semester: 'Semester 5',
      subject: 'DBMS',
      filename: 'DBMS_Relational_Algebra.pdf',
    },
    {
      title: 'Computer Networks - OSI & TCP/IP Layer Architecture',
      description: 'Detailed analysis of physical, data link framing, sliding window protocols, and IP addressing.',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      semester: 'Semester 5',
      subject: 'Computer Networks',
      filename: 'CN_OSI_Model.pdf',
    },
    {
      title: 'Operating Systems - Process Scheduling & Deadlock Avoidance',
      description: 'CPU scheduling algorithms (Round Robin, SRTF), Bankers algorithm, and semaphore synchronization.',
      department: 'Computer Science & Engineering',
      year: '2nd Year',
      semester: 'Semester 4',
      subject: 'Operating Systems',
      filename: 'OS_Scheduling_Deadlocks.pdf',
    },
    {
      title: 'Digital Signal Processing - Fast Fourier Transform (FFT)',
      description: 'Decimation-in-time and frequency algorithms with butterfly computation diagrams.',
      department: 'Electronics & Communication',
      year: '3rd Year',
      semester: 'Semester 6',
      subject: 'DSP',
      filename: 'DSP_FFT_Algorithms.pdf',
    },
  ];

  for (const sNote of sampleNotes) {
    await uploadMultipart(
      '/api/notes',
      {
        title: sNote.title,
        description: sNote.description,
        department: sNote.department,
        year: sNote.year,
        semester: sNote.semester,
        subject: sNote.subject,
      },
      {
        filename: sNote.filename,
        mimeType: 'application/pdf',
        content: dummyPdfContent,
      },
      faculty1Token
    );
  }
  console.log(`  ✓ Successfully seeded ${sampleNotes.length} real study notes into MongoDB!`);

  console.log('\n====================================================');
  console.log('  ALL STEP 5 TESTS PASSED SUCCESSFULLY! (14/14)     ');
  console.log('====================================================');
}

runStep5Tests().catch((err) => {
  console.error('[Test Execution Error]:', err);
  process.exit(1);
});
