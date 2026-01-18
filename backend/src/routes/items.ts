import { Router, Request, Response } from 'express';
import {
  getSkins,
  getGloves,
  getAgents,
  getMusic,
  getPins,
} from '../services/itemLoader';

const router = Router();

/**
 * GET /api/items/skins
 * Get all available weapon skins
 */
router.get('/skins', async (_req: Request, res: Response) => {
  try {
    const skins = await getSkins();
    res.json({ skins });
  } catch (error) {
    console.error('Error fetching skins:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch weapon skins',
    });
  }
});

/**
 * GET /api/items/gloves
 * Get all available gloves
 */
router.get('/gloves', async (_req: Request, res: Response) => {
  try {
    const gloves = await getGloves();
    res.json({ gloves });
  } catch (error) {
    console.error('Error fetching gloves:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch gloves',
    });
  }
});

/**
 * GET /api/items/agents
 * Get all available agents
 */
router.get('/agents', async (_req: Request, res: Response) => {
  try {
    const agents = await getAgents();
    res.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch agents',
    });
  }
});

/**
 * GET /api/items/music
 * Get all available music kits
 */
router.get('/music', async (_req: Request, res: Response) => {
  try {
    const music = await getMusic();
    res.json({ music });
  } catch (error) {
    console.error('Error fetching music kits:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch music kits',
    });
  }
});

/**
 * GET /api/items/pins
 * Get all available pins/collectibles
 */
router.get('/pins', async (_req: Request, res: Response) => {
  try {
    const pins = await getPins();
    res.json({ pins });
  } catch (error) {
    console.error('Error fetching pins:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch pins',
    });
  }
});

export default router;
