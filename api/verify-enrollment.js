/**
 * POST /api/verify-enrollment
 * Body: { courseId, idToken }
 * Return: { enrolled: true/false }
 */

const { db, auth } = require("./_firebase");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "POST only" });

  const { courseId, idToken } = req.body;

  if (!idToken || !courseId) {
    return res.status(200).json({ enrolled: false });
  }

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const snap    = await db
      .collection("enrollments")
      .doc(`${decoded.uid}_${courseId}`)
      .get();

    const enrolled = snap.exists && snap.data().status === "active";
    return res.status(200).json({ enrolled });

  } catch (err) {
    return res.status(200).json({ enrolled: false });
  }
};
