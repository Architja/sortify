import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();
const db = admin.firestore();

// 1. Simulate Bin Levels (Runs every 5 minutes)
export const simulateBinLevels = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const binsSnapshot = await db.collection('bins').where('isActive', '==', true).get();
  
  const batch = db.batch();
  
  for (const doc of binsSnapshot.docs) {
    const bin = doc.data();
    if (bin.fillPercentage >= 100) continue;

    // Increment fill by random 2-8%
    const increment = Math.floor(Math.random() * 7) + 2;
    let newFill = bin.fillPercentage + increment;
    if (newFill > 100) newFill = 100;

    let newStatus = 'empty';
    if (newFill >= 40) newStatus = 'medium';
    if (newFill >= 80) newStatus = 'full';

    batch.update(doc.ref, {
      fillPercentage: newFill,
      status: newStatus,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create alerts if thresholds crossed
    if (bin.fillPercentage < 80 && newFill >= 80 && newFill < 100) {
      const alertRef = db.collection('alerts').doc();
      batch.set(alertRef, {
        type: 'bin_full',
        binId: doc.id,
        message: `Bin ${bin.name} is almost full (${newFill}%).`,
        severity: 'warning',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else if (bin.fillPercentage < 100 && newFill === 100) {
      const alertRef = db.collection('alerts').doc();
      batch.set(alertRef, {
        type: 'bin_overflow',
        binId: doc.id,
        message: `Bin ${bin.name} is overflowing (100%). Immediate collection required!`,
        severity: 'critical',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  await batch.commit();
  console.log(`Simulated ${binsSnapshot.size} active bins.`);
  return null;
});

// Manual HTTPS trigger for Admin Panel
export const manualSimulateBins = functions.https.onCall(async (data, context) => {
  // Add admin check if needed
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }
  
  // Reuse logic or trigger pub/sub (simplified for demo)
  console.log('Manual simulation triggered');
  return { status: 'Simulation queued' };
});

// 2. Send Email on Critical Alert
export const sendHazardAlertEmail = functions.firestore
  .document('alerts/{alertId}')
  .onCreate(async (snap, context) => {
    const alert = snap.data();

    if (alert.severity === 'critical') {
      // In production, configure with functions.config().gmail.email and functions.config().gmail.password
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_EMAIL || 'dummy@example.com',
          pass: process.env.GMAIL_PASSWORD || 'dummy_password'
        }
      });

      const mailOptions = {
        from: 'Sortify Alerts <alerts@sortify.com>',
        to: process.env.ADMIN_EMAIL || 'admin@example.com',
        subject: `CRITICAL ALERT: ${alert.type === 'hazardous_waste' ? 'Hazardous Waste Detected' : 'Bin Overflow'}`,
        html: `
          <h2>Critical Alert Triggered</h2>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Message:</strong> ${alert.message}</p>
          <br/>
          <p>Please check the Sortify dashboard for more details.</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Alert email sent successfully.');
      } catch (error) {
        console.error('Error sending alert email:', error);
      }
    }
    return null;
  });
