const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Connection = require('./models/Connection');
const { Message, getConversationKey } = require('./models/Message');

const seedConnections = async () => {
  try {
    await connectDB();
    console.log('[Seed Connections]: Connected to MongoDB...');

    // 1. Ensure primary demo student exists
    let studentA = await User.findOne({ registerNumber: '21BCS0142' });
    if (!studentA) {
      studentA = await User.create({
        name: 'Karthikeyan R',
        registerNumber: '21BCS0142',
        email: 'karthikeyan.r@campushub.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science & Engineering',
        year: 'Final Year',
      });
      console.log('  ✓ Created primary student Karthikeyan R (21BCS0142)');
    }

    // 2. Ensure classmate 1 exists (Priya Patel)
    let studentB = await User.findOne({ registerNumber: '22IT-CH-002' });
    if (!studentB) {
      studentB = await User.create({
        name: 'Priya Patel',
        registerNumber: '22IT-CH-002',
        email: 'priya.patel@campushub.edu',
        password: 'password123',
        role: 'student',
        department: 'Information Technology',
        year: '3rd Year',
      });
      console.log('  ✓ Created student Priya Patel (22IT-CH-002)');
    }

    // 3. Ensure classmate 2 exists (Kavita Nair)
    let studentC = await User.findOne({ registerNumber: '22EC-CH-003' });
    if (!studentC) {
      studentC = await User.create({
        name: 'Kavita Nair',
        registerNumber: '22EC-CH-003',
        email: 'kavita.nair@campushub.edu',
        password: 'password123',
        role: 'student',
        department: 'Electronics & Communication',
        year: '2nd Year',
      });
      console.log('  ✓ Created student Kavita Nair (22EC-CH-003)');
    }

    // 4. Create or update accepted connection between Student A and Student B
    let connAB = await Connection.findBetween(studentA._id, studentB._id);
    if (!connAB) {
      connAB = await Connection.create({
        requester: studentB._id,
        receiver: studentA._id,
        status: 'accepted',
      });
      console.log('  ✓ Created accepted connection: Priya Patel <-> Karthikeyan R');
    } else {
      connAB.status = 'accepted';
      connAB.blockedBy = null;
      await connAB.save();
      console.log('  ✓ Reset active connection: Priya Patel <-> Karthikeyan R');
    }

    // 5. Seed greeting message in conversation
    const convKey = getConversationKey(studentA._id, studentB._id);
    const existingMsg = await Message.findOne({ conversationKey: convKey });
    if (!existingMsg) {
      await Message.create({
        conversationKey: convKey,
        sender: studentB._id,
        receiver: studentA._id,
        message: 'Hey Karthikeyan! Are you participating in the Campus Hackathon this weekend?',
        status: 'delivered',
      });
      console.log('  ✓ Seeded initial greeting chat message.');
    }

    // 6. Create pending invitation from Student C to Student A
    let connAC = await Connection.findBetween(studentA._id, studentC._id);
    if (!connAC) {
      await Connection.create({
        requester: studentC._id,
        receiver: studentA._id,
        status: 'pending',
      });
      console.log('  ✓ Seeded pending received invitation: Kavita Nair -> Karthikeyan R');
    } else if (connAC.status !== 'accepted') {
      connAC.requester = studentC._id;
      connAC.receiver = studentA._id;
      connAC.status = 'pending';
      await connAC.save();
      console.log('  ✓ Reset pending invitation from Kavita Nair.');
    }

    console.log('[Seed Connections]: Done seeding connections.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Connections Error]:', err);
    process.exit(1);
  }
};

seedConnections();
