import fs from 'fs/promises';
import {
  loadSkins,
  loadGloves,
  loadAgents,
  loadMusic,
  loadPins,
  loadAllItemData,
  clearCache,
  getCacheStatus,
} from './itemLoader';

// Mock fs module
jest.mock('fs/promises');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('Item Data Loader', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearCache();
    jest.clearAllMocks();
  });

  describe('loadSkins', () => {
    it('should load weapon skins from file', async () => {
      const mockSkins = [
        { id: 1, paintId: 100, name: 'Test Skin', imageUrl: 'test.jpg' },
        { id: 2, paintId: 101, name: 'Test Skin 2', imageUrl: 'test2.jpg' },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockSkins));

      const skins = await loadSkins(false);
      
      expect(skins).toEqual(mockSkins);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('skins_en.json'),
        'utf-8'
      );
    });

    it('should use cache when available', async () => {
      const mockSkins = [
        { id: 1, paintId: 100, name: 'Test Skin', imageUrl: 'test.jpg' },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockSkins));

      // First call loads from file
      await loadSkins(false);
      
      // Second call should use cache
      const cachedSkins = await loadSkins(true);
      
      expect(cachedSkins).toEqual(mockSkins);
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should throw error for missing file', async () => {
      const error: NodeJS.ErrnoException = new Error('File not found');
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);

      await expect(loadSkins(false)).rejects.toThrow('Item data file not found');
    });

    it('should throw error for invalid JSON', async () => {
      mockFs.readFile.mockResolvedValue('invalid json');

      await expect(loadSkins(false)).rejects.toThrow('Invalid JSON in file');
    });

    it('should fallback to cache on error', async () => {
      const mockSkins = [
        { id: 1, paintId: 100, name: 'Test Skin', imageUrl: 'test.jpg' },
      ];

      // First load succeeds
      mockFs.readFile.mockResolvedValueOnce(JSON.stringify(mockSkins));
      await loadSkins(false);

      // Second load fails but should return cached data
      mockFs.readFile.mockRejectedValueOnce(new Error('Network error'));
      const cachedSkins = await loadSkins(false);

      expect(cachedSkins).toEqual(mockSkins);
    });
  });

  describe('loadGloves', () => {
    it('should load gloves from file', async () => {
      const mockGloves = [
        { id: 1, defindex: 5027, name: 'Test Gloves', imageUrl: 'gloves.jpg' },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockGloves));

      const gloves = await loadGloves(false);
      
      expect(gloves).toEqual(mockGloves);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('gloves_en.json'),
        'utf-8'
      );
    });

    it('should use cache when available', async () => {
      const mockGloves = [
        { id: 1, defindex: 5027, name: 'Test Gloves', imageUrl: 'gloves.jpg' },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockGloves));

      await loadGloves(false);
      const cachedGloves = await loadGloves(true);
      
      expect(cachedGloves).toEqual(mockGloves);
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadAgents', () => {
    it('should load agents from file', async () => {
      const mockAgents = [
        { id: 'agent1', name: 'Test Agent', imageUrl: 'agent.jpg', team: 'CT' as const },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockAgents));

      const agents = await loadAgents(false);
      
      expect(agents).toEqual(mockAgents);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('agents_en.json'),
        'utf-8'
      );
    });
  });

  describe('loadMusic', () => {
    it('should load music kits from file', async () => {
      const mockMusic = [
        { id: 1, name: 'Test Music', artist: 'Test Artist' },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockMusic));

      const music = await loadMusic(false);
      
      expect(music).toEqual(mockMusic);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('music_en.json'),
        'utf-8'
      );
    });
  });

  describe('loadPins', () => {
    it('should load pins from file', async () => {
      const mockPins = [
        { id: 1, name: 'Test Pin', imageUrl: 'pin.jpg', series: 'Series 1' },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPins));

      const pins = await loadPins(false);
      
      expect(pins).toEqual(mockPins);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('collectibles_en.json'),
        'utf-8'
      );
    });
  });

  describe('loadAllItemData', () => {
    it('should load all item data files', async () => {
      mockFs.readFile.mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.includes('skins_en.json')) {
          return Promise.resolve(JSON.stringify([{ id: 1, paintId: 100, name: 'Skin', imageUrl: 'skin.jpg' }]));
        }
        if (pathStr.includes('gloves_en.json')) {
          return Promise.resolve(JSON.stringify([{ id: 1, defindex: 5027, name: 'Gloves', imageUrl: 'gloves.jpg' }]));
        }
        if (pathStr.includes('agents_en.json')) {
          return Promise.resolve(JSON.stringify([{ id: 'agent1', name: 'Agent', imageUrl: 'agent.jpg' }]));
        }
        if (pathStr.includes('music_en.json')) {
          return Promise.resolve(JSON.stringify([{ id: 1, name: 'Music' }]));
        }
        if (pathStr.includes('collectibles_en.json')) {
          return Promise.resolve(JSON.stringify([{ id: 1, name: 'Pin', imageUrl: 'pin.jpg' }]));
        }
        return Promise.reject(new Error('Unknown file'));
      });

      await loadAllItemData();

      expect(mockFs.readFile).toHaveBeenCalledTimes(5);
    });

    it('should handle partial failures gracefully', async () => {
      mockFs.readFile.mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.includes('skins_en.json')) {
          return Promise.resolve(JSON.stringify([{ id: 1, paintId: 100, name: 'Skin', imageUrl: 'skin.jpg' }]));
        }
        return Promise.reject(new Error('File not found'));
      });

      // Should not throw even if some files fail
      await expect(loadAllItemData()).resolves.not.toThrow();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      const mockSkins = [
        { id: 1, paintId: 100, name: 'Test Skin', imageUrl: 'test.jpg' },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockSkins));

      // Load data to populate cache
      await loadSkins(false);
      
      // Verify cache is populated
      let status = getCacheStatus();
      expect(status.skins.cached).toBe(true);

      // Clear cache
      clearCache();

      // Verify cache is cleared
      status = getCacheStatus();
      expect(status.skins.cached).toBe(false);
    });
  });

  describe('getCacheStatus', () => {
    it('should return cache status for all item types', async () => {
      const status = getCacheStatus();

      expect(status).toHaveProperty('skins');
      expect(status).toHaveProperty('gloves');
      expect(status).toHaveProperty('agents');
      expect(status).toHaveProperty('music');
      expect(status).toHaveProperty('pins');

      expect(status.skins).toHaveProperty('cached');
      expect(status.skins).toHaveProperty('count');
      expect(status.skins).toHaveProperty('lastLoaded');
    });

    it('should show correct cache status after loading', async () => {
      const mockSkins = [
        { id: 1, paintId: 100, name: 'Test Skin', imageUrl: 'test.jpg' },
        { id: 2, paintId: 101, name: 'Test Skin 2', imageUrl: 'test2.jpg' },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockSkins));

      await loadSkins(false);

      const status = getCacheStatus();
      expect(status.skins.cached).toBe(true);
      expect(status.skins.count).toBe(2);
      expect(status.skins.lastLoaded).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('Permission denied'));

      await expect(loadSkins(false)).rejects.toThrow();
    });

    it('should handle JSON parse errors', async () => {
      mockFs.readFile.mockResolvedValue('{ invalid json }');

      await expect(loadSkins(false)).rejects.toThrow('Invalid JSON in file');
    });

    it('should provide descriptive error messages', async () => {
      const error: NodeJS.ErrnoException = new Error('File not found');
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);

      await expect(loadSkins(false)).rejects.toThrow('Item data file not found: skins_en.json');
    });
  });
});
