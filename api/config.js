export default function handler(req, res) {
  res.status(200).json({
    LINE_LOGIN_CHANNEL_ID: process.env.LINE_LOGIN_CHANNEL_ID || ''
  });
}
