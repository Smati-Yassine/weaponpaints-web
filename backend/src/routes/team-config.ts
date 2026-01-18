import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireOwnResource } from '../middleware/authorization';
import { getPool } from '../config/database';
import { validateTeam, ValidationError } from '../utils/validation';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

/**
 * KNIFE ENDPOINTS
 */

// GET /api/player/knife/:team
router.get('/knife/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);

    validateTeam(team);

    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM wp_player_knife WHERE steamid = ? AND weapon_team = ?',
      [steamId, team]
    );

    if (rows.length === 0) {
      res.json({ knife: null });
      return;
    }

    res.json({
      knife: {
        steamid: rows[0].steamid,
        team: rows[0].weapon_team,
        knife: rows[0].knife,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error fetching knife configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch knife configuration' });
  }
});

// PUT /api/player/knife/:team
router.put('/knife/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);
    const { knife } = req.body;

    validateTeam(team);

    if (!knife || typeof knife !== 'string') {
      res.status(400).json({ error: 'Validation error', message: 'Knife must be a string' });
      return;
    }

    const pool = getPool();
    await pool.query<ResultSetHeader>(
      `INSERT INTO wp_player_knife (steamid, weapon_team, knife)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE knife = VALUES(knife)`,
      [steamId, team, knife]
    );

    res.json({
      message: 'Knife configuration saved successfully',
      knife: { steamid: steamId, team, knife },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error saving knife configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to save knife configuration' });
  }
});

// DELETE /api/player/knife/:team
router.delete('/knife/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);

    validateTeam(team);

    const pool = getPool();
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM wp_player_knife WHERE steamid = ? AND weapon_team = ?',
      [steamId, team]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Not found', message: 'Knife configuration not found' });
      return;
    }

    res.json({ message: 'Knife configuration deleted successfully' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error deleting knife configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete knife configuration' });
  }
});

/**
 * GLOVE ENDPOINTS
 */

// GET /api/player/gloves/:team
router.get('/gloves/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);

    validateTeam(team);

    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM wp_player_gloves WHERE steamid = ? AND weapon_team = ?',
      [steamId, team]
    );

    if (rows.length === 0) {
      res.json({ gloves: null });
      return;
    }

    res.json({
      gloves: {
        steamid: rows[0].steamid,
        team: rows[0].weapon_team,
        defindex: rows[0].weapon_defindex,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error fetching gloves configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch gloves configuration' });
  }
});

// PUT /api/player/gloves/:team
router.put('/gloves/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);
    const { defindex } = req.body;

    validateTeam(team);

    if (typeof defindex !== 'number' || !Number.isInteger(defindex) || defindex < 0) {
      res.status(400).json({ error: 'Validation error', message: 'Defindex must be a non-negative integer' });
      return;
    }

    const pool = getPool();
    await pool.query<ResultSetHeader>(
      `INSERT INTO wp_player_gloves (steamid, weapon_team, weapon_defindex)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE weapon_defindex = VALUES(weapon_defindex)`,
      [steamId, team, defindex]
    );

    res.json({
      message: 'Gloves configuration saved successfully',
      gloves: { steamid: steamId, team, defindex },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error saving gloves configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to save gloves configuration' });
  }
});

// DELETE /api/player/gloves/:team
router.delete('/gloves/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);

    validateTeam(team);

    const pool = getPool();
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM wp_player_gloves WHERE steamid = ? AND weapon_team = ?',
      [steamId, team]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Not found', message: 'Gloves configuration not found' });
      return;
    }

    res.json({ message: 'Gloves configuration deleted successfully' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error deleting gloves configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete gloves configuration' });
  }
});

/**
 * AGENT ENDPOINTS
 */

// GET /api/player/agents
router.get('/agents', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;

    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM wp_player_agents WHERE steamid = ?',
      [steamId]
    );

    if (rows.length === 0) {
      res.json({ agents: { agentCT: null, agentT: null } });
      return;
    }

    res.json({
      agents: {
        steamid: rows[0].steamid,
        agentCT: rows[0].agent_ct,
        agentT: rows[0].agent_t,
      },
    });
  } catch (error) {
    console.error('Error fetching agents configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch agents configuration' });
  }
});

// PUT /api/player/agents/:team
router.put('/agents/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);
    const { agent } = req.body;

    validateTeam(team);

    if (!agent || typeof agent !== 'string') {
      res.status(400).json({ error: 'Validation error', message: 'Agent must be a string' });
      return;
    }

    const pool = getPool();
    const column = team === 3 ? 'agent_ct' : 'agent_t';

    await pool.query<ResultSetHeader>(
      `INSERT INTO wp_player_agents (steamid, ${column})
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE ${column} = VALUES(${column})`,
      [steamId, agent]
    );

    res.json({
      message: 'Agent configuration saved successfully',
      agent: { steamid: steamId, team, agent },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error saving agent configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to save agent configuration' });
  }
});

// DELETE /api/player/agents/:team
router.delete('/agents/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);

    validateTeam(team);

    const pool = getPool();
    const column = team === 3 ? 'agent_ct' : 'agent_t';

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE wp_player_agents SET ${column} = NULL WHERE steamid = ?`,
      [steamId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Not found', message: 'Agent configuration not found' });
      return;
    }

    res.json({ message: 'Agent configuration deleted successfully' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error deleting agent configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete agent configuration' });
  }
});

/**
 * MUSIC KIT ENDPOINTS
 */

// GET /api/player/music/:team
router.get('/music/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);

    validateTeam(team);

    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM wp_player_music WHERE steamid = ? AND weapon_team = ?',
      [steamId, team]
    );

    if (rows.length === 0) {
      res.json({ music: null });
      return;
    }

    res.json({
      music: {
        steamid: rows[0].steamid,
        team: rows[0].weapon_team,
        musicId: rows[0].music_id,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error fetching music configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch music configuration' });
  }
});

// PUT /api/player/music/:team
router.put('/music/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);
    const { musicId } = req.body;

    validateTeam(team);

    if (typeof musicId !== 'number' || !Number.isInteger(musicId) || musicId < 0) {
      res.status(400).json({ error: 'Validation error', message: 'Music ID must be a non-negative integer' });
      return;
    }

    const pool = getPool();
    await pool.query<ResultSetHeader>(
      `INSERT INTO wp_player_music (steamid, weapon_team, music_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE music_id = VALUES(music_id)`,
      [steamId, team, musicId]
    );

    res.json({
      message: 'Music configuration saved successfully',
      music: { steamid: steamId, team, musicId },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error saving music configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to save music configuration' });
  }
});

// DELETE /api/player/music/:team
router.delete('/music/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);

    validateTeam(team);

    const pool = getPool();
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM wp_player_music WHERE steamid = ? AND weapon_team = ?',
      [steamId, team]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Not found', message: 'Music configuration not found' });
      return;
    }

    res.json({ message: 'Music configuration deleted successfully' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error deleting music configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete music configuration' });
  }
});

/**
 * PIN ENDPOINTS
 */

// GET /api/player/pins/:team
router.get('/pins/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);

    validateTeam(team);

    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM wp_player_pins WHERE steamid = ? AND weapon_team = ?',
      [steamId, team]
    );

    if (rows.length === 0) {
      res.json({ pin: null });
      return;
    }

    res.json({
      pin: {
        steamid: rows[0].steamid,
        team: rows[0].weapon_team,
        pinId: rows[0].id,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error fetching pin configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch pin configuration' });
  }
});

// PUT /api/player/pins/:team
router.put('/pins/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);
    const { pinId } = req.body;

    validateTeam(team);

    if (typeof pinId !== 'number' || !Number.isInteger(pinId) || pinId < 0) {
      res.status(400).json({ error: 'Validation error', message: 'Pin ID must be a non-negative integer' });
      return;
    }

    const pool = getPool();
    await pool.query<ResultSetHeader>(
      `INSERT INTO wp_player_pins (steamid, weapon_team, id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE id = VALUES(id)`,
      [steamId, team, pinId]
    );

    res.json({
      message: 'Pin configuration saved successfully',
      pin: { steamid: steamId, team, pinId },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error saving pin configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to save pin configuration' });
  }
});

// DELETE /api/player/pins/:team
router.delete('/pins/:team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);

    validateTeam(team);

    const pool = getPool();
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM wp_player_pins WHERE steamid = ? AND weapon_team = ?',
      [steamId, team]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Not found', message: 'Pin configuration not found' });
      return;
    }

    res.json({ message: 'Pin configuration deleted successfully' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }
    console.error('Error deleting pin configuration:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete pin configuration' });
  }
});

export default router;
