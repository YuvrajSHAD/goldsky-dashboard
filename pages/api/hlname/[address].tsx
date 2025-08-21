import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const HLN_API_KEY = process.env.HLN_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    res.status(400).json({ error: 'Invalid address parameter' });
    return;
  }

  try {
    const response = await axios.get(
      `https://api.hlnames.xyz/resolve/primary_name/${address.toLowerCase()}`,
      {
        headers: {
          'X-API-Key': HLN_API_KEY,
        },
      }
    );
    // HLN returns { primaryName: "" } when not found
    const name = response.data?.primaryName;
    res.status(200).json({ name: name || null });
  } catch (error: any) {
    console.error('Failed to fetch HL name:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch HL name', details: error?.response?.data || error.message });
  }
}
