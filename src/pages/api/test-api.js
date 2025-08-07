// pages/api/test-api.js

export default async function handler(req, res) {
  try {
    const response = await fetch('https://admin.sportsbuz.com/api/get-country-code/');
    const json = await response.json();
    res.status(200).json({ success: true, data: json });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}
