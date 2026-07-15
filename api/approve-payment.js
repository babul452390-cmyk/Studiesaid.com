/**
 * POST /api/approve-payment
 * Body: { paymentId, idToken }
 * Admin only — payment approve করে user enroll করে
 */

const { db, auth } = require("./_firebase");
const { FieldValue } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "POST only" });

  const { paymentId, idToken } = req.body;

  if (!idToken)    return res.status(401).json({ error: "লগইন করুন।" });
  if (!paymentId)  return res.status(400).json({ error: "paymentId দরকার।" });

  try {
    // ── Admin check ────────────────────────────────────────────────────────
    const decoded   = await auth.verifyIdToken(idToken);
    const adminSnap = await db.collection("admins").doc(decoded.uid).get();

    if (!adminSnap.exists) {
      return res.status(403).json({ error: "Admin access নেই।" });
    }

    // ── Payment পড়ুন ──────────────────────────────────────────────────────
    const paySnap = await db.collection("payments").doc(paymentId).get();
    if (!paySnap.exists) {
      return res.status(404).json({ error: "Payment পাওয়া যায়নি।" });
    }

    const pay = paySnap.data();
    if (pay.status === "paid") {
      return res.status(409).json({ error: "এই payment আগেই approve হয়েছে।" });
    }

    const { userId, courseId, amount } = pay;
    const batch = db.batch();

    // Enrollment তৈরি করুন
    batch.set(db.collection("enrollments").doc(`${userId}_${courseId}`), {
      userId, courseId,
      txnId: paymentId,
      amount: amount || 0,
      status: "active",
      enrolledAt: FieldValue.serverTimestamp(),
      expiresAt: null,
    });

    // User enrolledCourses আপডেট
    batch.update(db.collection("users").doc(userId), {
      enrolledCourses: FieldValue.arrayUnion(courseId),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Payment status paid
    batch.update(db.collection("payments").doc(paymentId), {
      status: "paid",
      confirmedAt: FieldValue.serverTimestamp(),
      confirmedBy: decoded.uid,
    });

    await batch.commit();
    return res.status(200).json({ success: true, message: "User enrolled ✅" });

  } catch (err) {
    console.error("approve-payment error:", err);
    return res.status(500).json({ error: "সমস্যা হয়েছে।" });
  }
};
