import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireOwnResource } from '../middleware/authorization';
import { getPool } from '../config/database';
import { validateTeam, ValidationError } from '../utils/validation';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const router = Router();

/**
 * POST /api/player/copy-team
 * Copy configuration from one team to another
 */
router.post('/copy-team', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const { sourceTeam, targetTeam, categories = [] } = req.body;

    // Validate teams
    validateTeam(sourceTeam);
    validateTeam(targetTeam);

    if (sourceTeam === targetTeam) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Source and target teams must be different',
      });
      return;
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Categories must be a non-empty array',
      });
      return;
    }

    const pool = getPool();
    const copiedCategories: string[] = [];

    // Copy weapons
    if (categories.includes('weapons')) {
      const [sourceWeapons] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM wp_player_skins WHERE steamid = ? AND weapon_team = ?',
        [steamId, sourceTeam]
      );

      for (const weapon of sourceWeapons) {
        await pool.query<ResultSetHeader>(
          `INSERT INTO wp_player_skins 
            (steamid, weapon_team, weapon_defindex, weapon_paint_id, weapon_wear, weapon_seed,
             weapon_nametag, weapon_stattrak, weapon_stattrak_count,
             weapon_sticker_0, weapon_sticker_1, weapon_sticker_2, weapon_sticker_3, weapon_sticker_4,
             weapon_keychain)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             weapon_paint_id = VALUES(weapon_paint_id),
             weapon_wear = VALUES(weapon_wear),
             weapon_seed = VALUES(weapon_seed),
             weapon_nametag = VALUES(weapon_nametag),
             weapon_stattrak = VALUES(weapon_stattrak),
             weapon_stattrak_count = VALUES(weapon_stattrak_count),
             weapon_sticker_0 = VALUES(weapon_sticker_0),
             weapon_sticker_1 = VALUES(weapon_sticker_1),
             weapon_sticker_2 = VALUES(weapon_sticker_2),
             weapon_sticker_3 = VALUES(weapon_sticker_3),
             weapon_sticker_4 = VALUES(weapon_sticker_4),
             weapon_keychain = VALUES(weapon_keychain)`,
          [
            steamId,
            targetTeam,
            weapon.weapon_defindex,
            weapon.weapon_paint_id,
            weapon.weapon_wear,
            weapon.weapon_seed,
            weapon.weapon_nametag,
            weapon.weapon_stattrak,
            weapon.weapon_stattrak_count,
            weapon.weapon_sticker_0,
            weapon.weapon_sticker_1,
            weapon.weapon_sticker_2,
            weapon.weapon_sticker_3,
            weapon.weapon_sticker_4,
            weapon.weapon_keychain,
          ]
        );
      }
      copiedCategories.push('weapons');
    }

    // Copy knife
    if (categories.includes('knife')) {
      const [sourceKnife] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM wp_player_knife WHERE steamid = ? AND weapon_team = ?',
        [steamId, sourceTeam]
      );

      if (sourceKnife.length > 0) {
        await pool.query<ResultSetHeader>(
          `INSERT INTO wp_player_knife (steamid, weapon_team, knife)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE knife = VALUES(knife)`,
          [steamId, targetTeam, sourceKnife[0].knife]
        );
        copiedCategories.push('knife');
      }
    }

    // Copy gloves
    if (categories.includes('gloves')) {
      const [sourceGloves] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM wp_player_gloves WHERE steamid = ? AND weapon_team = ?',
        [steamId, sourceTeam]
      );

      if (sourceGloves.length > 0) {
        await pool.query<ResultSetHeader>(
          `INSERT INTO wp_player_gloves (steamid, weapon_team, weapon_defindex)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE weapon_defindex = VALUES(weapon_defindex)`,
          [steamId, targetTeam, sourceGloves[0].weapon_defindex]
        );
        copiedCategories.push('gloves');
      }
    }

    // Copy music
    if (categories.includes('music')) {
      const [sourceMusic] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM wp_player_music WHERE steamid = ? AND weapon_team = ?',
        [steamId, sourceTeam]
      );

      if (sourceMusic.length > 0) {
        await pool.query<ResultSetHeader>(
          `INSERT INTO wp_player_music (steamid, weapon_team, music_id)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE music_id = VALUES(music_id)`,
          [steamId, targetTeam, sourceMusic[0].music_id]
        );
        copiedCategories.push('music');
      }
    }

    // Copy pins
    if (categories.includes('pins')) {
      const [sourcePins] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM wp_player_pins WHERE steamid = ? AND weapon_team = ?',
        [steamId, sourceTeam]
      );

      if (sourcePins.length > 0) {
        await pool.query<ResultSetHeader>(
          `INSERT INTO wp_player_pins (steamid, weapon_team, id)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE id = VALUES(id)`,
          [steamId, targetTeam, sourcePins[0].id]
        );
        copiedCategories.push('pins');
      }
    }

    res.json({
      message: 'Configuration copied successfully',
      copiedCategories,
      sourceTeam,
      targetTeam,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: 'Validation error',
        message: error.message,
      });
      return;
    }

    console.error('Error copying team configuration:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to copy team configuration',
    });
  }
});

/**
 * POST /api/player/reset
 * Reset (delete) configuration for specified categories
 */
router.post('/reset', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const { categories = [], team = null } = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Categories must be a non-empty array',
      });
      return;
    }

    // Validate team if provided
    if (team !== null) {
      validateTeam(team);
    }

    const pool = getPool();
    const resetCategories: string[] = [];

    // Reset weapons
    if (categories.includes('weapons')) {
      if (team !== null) {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_skins WHERE steamid = ? AND weapon_team = ?',
          [steamId, team]
        );
      } else {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_skins WHERE steamid = ?',
          [steamId]
        );
      }
      resetCategories.push('weapons');
    }

    // Reset knife
    if (categories.includes('knife')) {
      if (team !== null) {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_knife WHERE steamid = ? AND weapon_team = ?',
          [steamId, team]
        );
      } else {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_knife WHERE steamid = ?',
          [steamId]
        );
      }
      resetCategories.push('knife');
    }

    // Reset gloves
    if (categories.includes('gloves')) {
      if (team !== null) {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_gloves WHERE steamid = ? AND weapon_team = ?',
          [steamId, team]
        );
      } else {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_gloves WHERE steamid = ?',
          [steamId]
        );
      }
      resetCategories.push('gloves');
    }

    // Reset agents
    if (categories.includes('agents')) {
      if (team !== null) {
        const column = team === 3 ? 'agent_ct' : 'agent_t';
        await pool.query<ResultSetHeader>(
          `UPDATE wp_player_agents SET ${column} = NULL WHERE steamid = ?`,
          [steamId]
        );
      } else {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_agents WHERE steamid = ?',
          [steamId]
        );
      }
      resetCategories.push('agents');
    }

    // Reset music
    if (categories.includes('music')) {
      if (team !== null) {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_music WHERE steamid = ? AND weapon_team = ?',
          [steamId, team]
        );
      } else {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_music WHERE steamid = ?',
          [steamId]
        );
      }
      resetCategories.push('music');
    }

    // Reset pins
    if (categories.includes('pins')) {
      if (team !== null) {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_pins WHERE steamid = ? AND weapon_team = ?',
          [steamId, team]
        );
      } else {
        await pool.query<ResultSetHeader>(
          'DELETE FROM wp_player_pins WHERE steamid = ?',
          [steamId]
        );
      }
      resetCategories.push('pins');
    }

    res.json({
      message: 'Configuration reset successfully',
      resetCategories,
      team: team !== null ? team : 'all',
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: 'Validation error',
        message: error.message,
      });
      return;
    }

    console.error('Error resetting configuration:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reset configuration',
    });
  }
});

export default router;
