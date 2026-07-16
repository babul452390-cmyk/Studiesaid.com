// ─── YouTube OAuth2 Client ────────────────────────────────────────────────────
const { google } = require("googleapis");

const YT_CLIENT_ID     = "302021397403-0q94n6b17gfscuet61ikkoief1bru1i8.apps.googleusercontent.com";
const YT_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || "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";
const YT_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN || "1//04rNxNstecdTrCgYIARAAAQSNwF-L9Irn3nHBacMsycYgXhQECnR6uqeFrha0dQpulPhBIXpniV0VrhFYu8HOVx8sPwqMDn8OFU";

function getYouTubeClient() {
  const oauth2 = new google.auth.OAuth2(
    YT_CLIENT_ID,
    YT_CLIENT_SECRET,
    "https://oauth2.googleapis.com/token"
  );
  oauth2.setCredentials({ refresh_token: YT_REFRESH_TOKEN });
  return oauth2;
}

module.exports = { getYouTubeClient };
