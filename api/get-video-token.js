/**
 * POST /api/get-video-token
 * Body: { videoUrl, idToken }        ← simple mode (URL থেকে ID বের করে)
 *    OR { courseId, videoId, idToken } ← strict mode (Firestore check করে)
 * Return: { embedUrl }
 */

const { db, auth }         = require("./_firebase");
const { getYouTubeClient } = require("./_youtube");
const { FieldValue }       = require("firebase-admin/firestore");

function getYouTubeId(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([-\w]{11})/);
  return m ? m[1] : null;
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "POST only" });

  const { videoUrl, courseId, videoId, idToken } = req.body;
  if (!idToken) return res.status(401).json({ error: "লগইন করুন।" });

  try {
    // Auth verify
    const decoded = await auth.verifyIdToken(idToken);
    const uid     = decoded.uid;

    let youtubeVideoId;

    if (videoUrl) {
      // Simple mode — URL থেকে ID বের করি
      youtubeVideoId = getYouTubeId(videoUrl);
      if (!youtubeVideoId) return res.status(400).json({ error: "YouTube URL সঠিক নয়।" });

    } else if (courseId && videoId) {
      // Strict mode — Firestore enrollment check
      const enrollSnap = await db
        .collection("enrollments").doc(`${uid}_${courseId}`).get();
      if (!enrollSnap.exists || enrollSnap.data().status !== "active") {
        return res.status(403).json({ error: "আপনি এই কোর্সে ভর্তি নন।" });
      }
      const videoSnap = await db
        .collection("courses").doc(courseId)
        .collection("videos").doc(videoId).get();
      if (!videoSnap.exists) return res.status(404).json({ error: "ভিডিও পাওয়া যায়নি।" });
      youtubeVideoId = videoSnap.data().youtubeId;

    } else {
      return res.status(400).json({ error: "videoUrl অথবা courseId+videoId দরকার।" });
    }

    // YouTube OAuth token
    const oauth2Client = getYouTubeClient();
    const { token }    = await oauth2Client.getAccessToken();

    // Log (optional)
    await db.collection("videoTokens").doc(`${uid}_${youtubeVideoId}_${Date.now()}`).set({
      uid, youtubeVideoId,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 3600 * 1000),
    }).catch(() => {}); // log fail হলেও video দেখাবে

    const embedUrl =
      `https://www.youtube.com/embed/${youtubeVideoId}` +
      `?rel=0&modestbranding=1&token=${token}`;

    return res.status(200).json({ embedUrl, expiresIn: 3600 });

  } catch (err) {
    console.error("get-video-token error:", err);
    if (err.code === "auth/id-token-expired")
      return res.status(401).json({ error: "Session শেষ। আবার লগইন করুন।" });
    return res.status(500).json({ error: "সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
  }
};
