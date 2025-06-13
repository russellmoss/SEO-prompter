import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '@/lib/googleSheetsService';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sheetId } = req.query;
  const accessToken = req.headers['authorization']?.replace('Bearer ', '');

  if (!sheetId || typeof sheetId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid sheetId' });
  }
  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    // Optionally, you could look up the sheet URL from your Supabase sheet_connections table
    // const { data: sheetConn } = await supabase
    //   .from('sheet_connections')
    //   .select('sheet_url')
    //   .eq('sheet_id', sheetId)
    //   .single();
    // if (!sheetConn) throw new Error('Sheet connection not found');

    // Fetch sheet data using the GoogleSheetsService
    const sheetsService = new GoogleSheetsService(accessToken);
    const data = await sheetsService.getSheetData(sheetId);
    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch sheet data' });
  }
} 