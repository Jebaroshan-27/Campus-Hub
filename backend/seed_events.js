const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');

const seedEvents = async () => {
  try {
    await connectDB();
    console.log('[Seed Events]: Connected to MongoDB...');

    // Find or create faculty organizer
    let faculty = await User.findOne({ role: 'faculty' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Dr. Evelyn Reed',
        registerNumber: 'FAC-CSE-001',
        email: 'evelyn.reed@campushub.edu',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science & Engineering',
      });
    }

    // Upsert realistic campus events
    const now = new Date();
    const addDays = (d) => new Date(now.getTime() + d * 86400000);

    const initialEvents = [
      {
        title: 'National College Hackathon 2026',
        description:
          'Join over 300 engineering students in an intensive 36-hour sprint creating AI agents, Web3 protocols, and smart campus IoT systems. Mentors from Google, Microsoft, and top startups will guide teams with grand prizes worth ₹1,50,000.',
        eventType: 'Hackathon',
        venue: 'Campus Innovation Center, Hall A',
        eventDate: addDays(12),
        startTime: '08:30 AM',
        endTime: '08:30 PM',
        registrationDeadline: addDays(10),
        organizer: 'Campus Tech Council & ACM Student Chapter',
        department: 'Computer Science & Engineering',
        capacity: 120,
        isPaid: false,
        price: 0,
        status: 'upcoming',
        createdBy: faculty._id,
      },
      {
        title: 'Full-Stack Cloud & DevOps Masterclass',
        description:
          'Hands-on masterclass covering Docker containerization, Kubernetes orchestration, CI/CD with GitHub Actions, and AWS serverless architectures. Includes lab access and completion certificate.',
        eventType: 'Workshop',
        venue: 'Advanced Computing Lab 3, 2nd Floor',
        eventDate: addDays(7),
        startTime: '10:00 AM',
        endTime: '04:30 PM',
        registrationDeadline: addDays(5),
        organizer: 'Department of CSE & Cloud Club',
        department: 'Computer Science & Engineering',
        capacity: 60,
        isPaid: true,
        price: 199,
        status: 'upcoming',
        createdBy: faculty._id,
      },
      {
        title: 'AI in Healthcare & Biomedical Engineering Seminar',
        description:
          'Keynote symposium exploring deep learning models applied to diagnostic imaging, genomics, and electronic health records. Delivered by visiting researchers from AIIMS and MIT.',
        eventType: 'Seminar',
        venue: 'Sir C.V. Raman Memorial Auditorium',
        eventDate: addDays(14),
        startTime: '11:00 AM',
        endTime: '01:30 PM',
        registrationDeadline: addDays(13),
        organizer: 'Biotechnology & Computing Society',
        department: 'General',
        capacity: 200,
        isPaid: false,
        price: 0,
        status: 'upcoming',
        createdBy: faculty._id,
      },
      {
        title: 'Inter-Collegiate Cultural Fiesta: Resonance 2026',
        description:
          'The flagship cultural fest featuring battle of the bands, choreography showcases, stage drama, and literary competitions. Food stalls and celebrity guest performances on the final evening.',
        eventType: 'Cultural',
        venue: 'Open Air Amphitheatre & Sports Complex',
        eventDate: addDays(20),
        startTime: '04:00 PM',
        endTime: '10:00 PM',
        registrationDeadline: addDays(18),
        organizer: 'Campus Cultural Committee',
        department: 'General',
        capacity: 500,
        isPaid: true,
        price: 99,
        status: 'upcoming',
        createdBy: faculty._id,
      },
    ];

    for (const ev of initialEvents) {
      const existing = await Event.findOne({ title: ev.title });
      if (!existing) {
        await Event.create(ev);
        console.log(`  ✓ Created event: "${ev.title}" (Paid: ${ev.isPaid ? '₹' + ev.price : 'Free'})`);
      } else {
        console.log(`  ℹ Event already exists: "${ev.title}"`);
      }
    }

    console.log('[Seed Events]: Done seeding events.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Events Error]:', err);
    process.exit(1);
  }
};

seedEvents();
