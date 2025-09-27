// Store middleware flow steps in memory (will reset on server restart)
let middlewareFlow = [];

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Add a new step to the flow
    const { step } = req.body;
    if (step) {
      middlewareFlow.push(step);
    }
    return res.status(200).json({ success: true });
  } else if (req.method === 'GET') {
    // Return the current flow
    return res.status(200).json(middlewareFlow);
  } else if (req.method === 'DELETE') {
    // Clear the flow
    middlewareFlow = [];
    return res.status(200).json({ success: true });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}