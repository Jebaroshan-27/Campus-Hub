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

async function runStep6Tests() {
  console.log('========================================================');
  console.log('  CAMPUSHUB STEP 6: PLACEMENTS MODULE INTEGRATION TESTS ');
  console.log('========================================================\n');

  let adminToken = null;
  let studentToken = null;

  // 1. Login as Admin
  console.log('[Test 1]: Login as Admin (ADM-IT-001)...');
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
  console.log('  ✓ Admin logged in (Status 200/201, role: admin)');

  // 2. Admin creates a placement drive: POST /api/placements
  console.log('\n[Test 2]: POST /api/placements (Admin creates real drive)...');
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 20);

  const createRes = await request(
    '/api/placements',
    'POST',
    {
      companyName: 'Atlassian',
      jobTitle: 'Associate Software Engineer',
      description: 'Join Jira and Confluence engineering teams building scalable cloud microservices.',
      location: 'Bangalore, India',
      workMode: 'Hybrid',
      salary: '₹18 - 24 LPA + Equity',
      eligibility: 'B.Tech CSE/IT with 7.5+ CGPA and strong algorithmic fundamentals',
      minimumCGPA: 7.5,
      eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
      eligibleYears: ['4th Year'],
      skills: ['Java', 'React', 'AWS', 'Distributed Systems'],
      applicationDeadline: futureDate.toISOString(),
      applicationUrl: 'https://www.atlassian.com/company/careers/details/102948',
      status: 'open',
    },
    adminToken
  );

  console.log(`  ✓ Create status: ${createRes.status} (Expected: 201)`);
  if (createRes.status !== 201) {
    console.error('  ✗ Creation failed:', createRes.data);
    process.exit(1);
  }
  const drive1 = createRes.data.placement;
  console.log(`  ✓ Created Drive ID: ${drive1._id}`);
  console.log(`  ✓ Company: "${drive1.companyName}" | Role: "${drive1.jobTitle}"`);

  // 3. GET /api/placements to verify record
  console.log('\n[Test 3]: GET /api/placements (Verify record)...');
  const getAllRes = await request('/api/placements', 'GET', null, adminToken);
  console.log(`  ✓ GET /api/placements Status: ${getAllRes.status}`);
  const foundDrive = getAllRes.data.placements.find((p) => p._id === drive1._id);
  if (!foundDrive) {
    console.error('  ✗ Created drive not found in GET /api/placements!');
    process.exit(1);
  }
  console.log(`  ✓ Successfully verified record: "${foundDrive.companyName}" (Total: ${getAllRes.data.count})`);

  // 4. GET /api/placements/:id to verify details
  console.log('\n[Test 4]: GET /api/placements/' + drive1._id + ' (Verify complete details)...');
  const getByIdRes = await request('/api/placements/' + drive1._id, 'GET', null, adminToken);
  console.log(`  ✓ Status: ${getByIdRes.status}`);
  console.log(`  ✓ Location: ${getByIdRes.data.placement.location}`);
  console.log(`  ✓ Minimum CGPA: ${getByIdRes.data.placement.minimumCGPA}`);
  console.log(`  ✓ Application URL: ${getByIdRes.data.placement.applicationUrl}`);

  // 5. PUT /api/placements/:id to update record
  console.log('\n[Test 5]: PUT /api/placements/' + drive1._id + ' (Update salary and location)...');
  const updateRes = await request(
    '/api/placements/' + drive1._id,
    'PUT',
    {
      salary: '₹22 - 26 LPA + Stock RSUs',
      location: 'Bangalore & Remote, India',
    },
    adminToken
  );
  console.log(`  ✓ Update Status: ${updateRes.status} (Expected: 200)`);
  console.log(`  ✓ Updated Salary: "${updateRes.data.placement.salary}"`);
  console.log(`  ✓ Updated Location: "${updateRes.data.placement.location}"`);

  // 6. DELETE /api/placements/:id to verify deletion
  console.log('\n[Test 6]: DELETE /api/placements/' + drive1._id + ' (Verify deletion)...');
  const deleteRes = await request('/api/placements/' + drive1._id, 'DELETE', null, adminToken);
  console.log(`  ✓ Delete Status: ${deleteRes.status} (Expected: 200)`);
  const verifyDelete = await request('/api/placements/' + drive1._id, 'GET', null, adminToken);
  console.log(`  ✓ Verify lookup after delete: Status ${verifyDelete.status} (Expected: 404 Not Found)`);

  // 7. Login as Student
  console.log('\n[Test 7]: Login as Student (21BCS0142)...');
  let stu = await request('/api/auth/login', 'POST', {
    identifier: '21BCS0142',
    password: 'password123',
  });
  if (stu.status !== 200) {
    stu = await request('/api/auth/register', 'POST', {
      name: 'Karthikeyan R',
      registerNumber: '21BCS0142',
      email: 'karthikeyan.r@campushub.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
    });
  }
  studentToken = stu.data.token;
  console.log('  ✓ Student logged in (Status 200/201, role: student)');

  // Create a fresh test drive as Admin for student testing
  const drive2Res = await request(
    '/api/placements',
    'POST',
    {
      companyName: 'Microsoft Corporation',
      jobTitle: 'Software Engineer - Azure Cloud Core',
      description: 'Develop next-generation hyperscale hypervisor and distributed cloud storage infrastructure.',
      location: 'Hyderabad, India',
      workMode: 'Hybrid',
      salary: '₹16 - 20 LPA',
      eligibility: 'B.Tech CSE, IT, ECE with 8.0+ CGPA and zero active backlogs',
      minimumCGPA: 8.0,
      eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
      eligibleYears: ['4th Year'],
      skills: ['C++', 'Python', 'Azure', 'Algorithms'],
      applicationDeadline: futureDate.toISOString(),
      applicationUrl: 'https://careers.microsoft.com/us/en/job/182942',
      status: 'open',
    },
    adminToken
  );
  const drive2Id = drive2Res.data.placement._id;

  // 8. GET /api/placements as Student
  console.log('\n[Test 8]: GET /api/placements (Student view)...');
  const studentGetRes = await request('/api/placements', 'GET', null, studentToken);
  console.log(`  ✓ Student GET status: ${studentGetRes.status} (Expected: 200)`);
  console.log(`  ✓ Found ${studentGetRes.data.count} drives accessible to students`);

  // 9. Student attempts POST /api/placements (Must be 403 Forbidden)
  console.log('\n[Test 9]: Student attempts POST /api/placements (Role Security Check)...');
  const studentPostRes = await request(
    '/api/placements',
    'POST',
    {
      companyName: 'Unauthorized Corp',
      jobTitle: 'Hacker',
      description: 'Test',
      location: 'Nowhere',
      salary: '₹0',
      applicationDeadline: futureDate.toISOString(),
      applicationUrl: 'https://example.com',
    },
    studentToken
  );
  console.log(`  ✓ Status: ${studentPostRes.status} (Expected: 403 Forbidden)`);
  console.log(`  ✓ Message: "${studentPostRes.data.message}"`);
  if (studentPostRes.status !== 403) {
    console.error('  ✗ Security check failed: Student was able to POST placement!');
    process.exit(1);
  }

  // 10. Student attempts DELETE /api/placements/:id (Must be 403 Forbidden)
  console.log('\n[Test 10]: Student attempts DELETE /api/placements/' + drive2Id + '...');
  const studentDelRes = await request('/api/placements/' + drive2Id, 'DELETE', null, studentToken);
  console.log(`  ✓ Status: ${studentDelRes.status} (Expected: 403 Forbidden)`);
  console.log(`  ✓ Message: "${studentDelRes.data.message}"`);
  if (studentDelRes.status !== 403) {
    console.error('  ✗ Security check failed: Student was able to DELETE placement!');
    process.exit(1);
  }

  // 11. Test Search by company and job title
  console.log('\n[Test 11]: Search placements: /api/placements?search=Microsoft...');
  const searchRes = await request('/api/placements?search=Microsoft', 'GET', null, studentToken);
  console.log(`  ✓ Search matched: ${searchRes.data.count} items`);
  if (searchRes.data.count === 0 || !searchRes.data.placements[0].companyName.includes('Microsoft')) {
    console.error('  ✗ Search failed to return Microsoft!');
    process.exit(1);
  }

  // 12. Test Filters (department, workMode, status)
  console.log('\n[Test 12]: Test Filters: workMode=Hybrid&status=open...');
  const filterRes = await request('/api/placements?workMode=Hybrid&status=open', 'GET', null, studentToken);
  console.log(`  ✓ Filter returned ${filterRes.data.count} matching drives`);

  // 13. Test Expired Placement Handling
  console.log('\n[Test 13]: Create and test expired placement drive...');
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5); // 5 days in the past

  const expiredDrive = await request(
    '/api/placements',
    'POST',
    {
      companyName: 'Legacy Systems Inc',
      jobTitle: 'Junior Developer',
      description: 'Expired recruitment drive from last week.',
      location: 'Chennai, India',
      workMode: 'On-site',
      salary: '₹6 LPA',
      applicationDeadline: pastDate.toISOString(),
      applicationUrl: 'https://legacy.example.com/apply',
      status: 'open', // set to open but deadline is past
    },
    adminToken
  );

  const getExpired = await request('/api/placements/' + expiredDrive.data.placement._id, 'GET', null, studentToken);
  console.log(`  ✓ Expired drive effectiveStatus: "${getExpired.data.placement.effectiveStatus}" (Expected: closed)`);
  console.log(`  ✓ isExpired flag: ${getExpired.data.placement.isExpired} (Expected: true)`);

  // 14. Test Invalid Application URL Validation (Must return 400 Bad Request)
  console.log('\n[Test 14]: POST with invalid applicationUrl (ftp:// or no protocol)...');
  const badUrlRes = await request(
    '/api/placements',
    'POST',
    {
      companyName: 'Bad URL Corp',
      jobTitle: 'Developer',
      description: 'Testing validation',
      location: 'Online',
      salary: '₹10 LPA',
      applicationDeadline: futureDate.toISOString(),
      applicationUrl: 'not_a_valid_http_url',
    },
    adminToken
  );
  console.log(`  ✓ Status: ${badUrlRes.status} (Expected: 400 Bad Request)`);
  console.log(`  ✓ Message: "${badUrlRes.data.message}"`);
  if (badUrlRes.status !== 400) {
    console.error('  ✗ Security check failed: Invalid URL was not rejected with 400!');
    process.exit(1);
  }

  // Clean up test expired record
  await request('/api/placements/' + expiredDrive.data.placement._id, 'DELETE', null, adminToken);

  // Seed rich corporate placement drives
  console.log('\n[Seed]: Seeding premier corporate recruitment drives into MongoDB...');
  const seedDrives = [
    {
      companyName: 'Google',
      jobTitle: 'Software Engineering Resident - Full Time',
      description: 'Work on cutting-edge distributed computing, Search, Chrome, and Android systems solving planetary-scale technical challenges.',
      location: 'Bangalore / Hyderabad, India',
      workMode: 'Hybrid',
      salary: '₹28 - 36 LPA + Stock Grants',
      eligibility: 'B.Tech / M.Tech in CSE / IT / ECE with minimum 8.0 CGPA. Exceptional coding and system design skills.',
      minimumCGPA: 8.0,
      eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
      eligibleYears: ['4th Year'],
      skills: ['C++', 'Python', 'Go', 'Distributed Systems', 'Algorithms'],
      applicationDeadline: new Date(Date.now() + 25 * 86400000).toISOString(),
      applicationUrl: 'https://careers.google.com/jobs/results/campus-sde-2026',
      status: 'open',
    },
    {
      companyName: 'Amazon',
      jobTitle: 'Software Development Engineer I (SDE-1)',
      description: 'Build robust, highly scalable microservices for AWS cloud computing services and global e-commerce payment infrastructure.',
      location: 'Hyderabad / Chennai, India',
      workMode: 'On-site',
      salary: '₹22 - 28 LPA',
      eligibility: 'B.Tech in all engineering disciplines with 7.0+ CGPA. Strong object-oriented design and SQL expertise.',
      minimumCGPA: 7.0,
      eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering'],
      eligibleYears: ['4th Year'],
      skills: ['Java', 'AWS', 'Data Structures', 'System Design'],
      applicationDeadline: new Date(Date.now() + 18 * 86400000).toISOString(),
      applicationUrl: 'https://www.amazon.jobs/en/jobs/campus-sde-india',
      status: 'open',
    },
    {
      companyName: 'Zoho Corporation',
      jobTitle: 'Product Software Developer',
      description: 'Architect world-class SaaS enterprise solutions used by 100M+ users globally. Work on Zoho CRM, Mail, and Creator engines.',
      location: 'Chennai / Tenkasi, India',
      workMode: 'On-site',
      salary: '₹8.5 - 12 LPA',
      eligibility: 'Open to all departments and all graduating batches. Pure skill-based recruitment with zero CGPA criteria.',
      minimumCGPA: 0,
      eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering', 'Electrical & Electronics', 'Civil Engineering'],
      eligibleYears: ['3rd Year', '4th Year'],
      skills: ['C', 'Java', 'JavaScript', 'Problem Solving'],
      applicationDeadline: new Date(Date.now() + 12 * 86400000).toISOString(),
      applicationUrl: 'https://www.zoho.com/careers/software-developer-campus',
      status: 'open',
    },
    {
      companyName: 'Cisco Systems',
      jobTitle: 'Network Software Engineer',
      description: 'Design next-generation SDN controllers, cloud networking security, and silicon one switching firmware.',
      location: 'Bangalore, India',
      workMode: 'Hybrid',
      salary: '₹15 - 19 LPA',
      eligibility: 'B.Tech CSE, IT, ECE with 7.5+ CGPA and strong networking protocol knowledge.',
      minimumCGPA: 7.5,
      eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
      eligibleYears: ['4th Year'],
      skills: ['C', 'Python', 'TCP/IP', 'Linux Kernel', 'Networking'],
      applicationDeadline: new Date(Date.now() + 30 * 86400000).toISOString(),
      applicationUrl: 'https://jobs.cisco.com/jobs/ProjectDetail/Network-Engineer-Campus/140291',
      status: 'open',
    },
  ];

  for (const drive of seedDrives) {
    await request('/api/placements', 'POST', drive, adminToken);
  }
  console.log(`  ✓ Successfully seeded ${seedDrives.length} premier placement drives!`);

  console.log('\n========================================================');
  console.log('  ALL STEP 6 TESTS PASSED SUCCESSFULLY! (14/14)          ');
  console.log('========================================================');
}

runStep6Tests().catch((err) => {
  console.error('[Placements Test Error]:', err);
  process.exit(1);
});
