import fs from 'fs/promises';
import path from 'path';

/**
 * Item data types
 */
export interface WeaponSkin {
  id: number;
  paintId: number;
  name: string;
  imageUrl: string;
  rarity?: string;
  collection?: string;
  weaponType?: string;
}

export interface Glove {
  id: number;
  defindex: number;
  name: string;
  imageUrl: string;
}

export interface Agent {
  id: string;
  name: string;
  imageUrl: string;
  team?: 'T' | 'CT' | 'Both';
}

export interface MusicKit {
  id: number;
  name: string;
  artist?: string;
  previewUrl?: string;
}

export interface Pin {
  id: number;
  name: string;
  imageUrl: string;
  series?: string;
}

/**
 * Item data cache
 */
interface ItemDataCache {
  skins: WeaponSkin[] | null;
  gloves: Glove[] | null;
  agents: Agent[] | null;
  music: MusicKit[] | null;
  pins: Pin[] | null;
  lastLoaded: {
    skins: Date | null;
    gloves: Date | null;
    agents: Date | null;
    music: Date | null;
    pins: Date | null;
  };
}

const cache: ItemDataCache = {
  skins: null,
  gloves: null,
  agents: null,
  music: null,
  pins: null,
  lastLoaded: {
    skins: null,
    gloves: null,
    agents: null,
    music: null,
    pins: null,
  },
};

/**
 * Get the data directory path
 */
function getDataDir(): string {
  // Look for data directory in multiple locations
  const possiblePaths = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(__dirname, '..', '..', 'data'),
  ];

  return possiblePaths[0]; // Default to first path
}

/**
 * Load JSON file with error handling
 */
async function loadJsonFile<T>(filename: string): Promise<T> {
  const dataDir = getDataDir();
  const filePath = path.join(dataDir, filename);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Item data file not found: ${filename}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in file: ${filename}`);
      }
      throw new Error(`Failed to load item data file ${filename}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load weapon skins data
 */
export async function loadSkins(useCache: boolean = true): Promise<WeaponSkin[]> {
  if (useCache && cache.skins) {
    return cache.skins;
  }

  try {
    const data = await loadJsonFile<WeaponSkin[]>('skins_en.json');
    cache.skins = data;
    cache.lastLoaded.skins = new Date();
    console.log(`✓ Loaded ${data.length} weapon skins`);
    return data;
  } catch (error) {
    console.error('Failed to load weapon skins:', error);
    
    // Fallback to cache if available
    if (cache.skins) {
      console.warn('Using cached weapon skins data');
      return cache.skins;
    }
    
    throw error;
  }
}

/**
 * Load gloves data
 */
export async function loadGloves(useCache: boolean = true): Promise<Glove[]> {
  if (useCache && cache.gloves) {
    return cache.gloves;
  }

  try {
    const data = await loadJsonFile<Glove[]>('gloves_en.json');
    cache.gloves = data;
    cache.lastLoaded.gloves = new Date();
    console.log(`✓ Loaded ${data.length} gloves`);
    return data;
  } catch (error) {
    console.error('Failed to load gloves:', error);
    
    if (cache.gloves) {
      console.warn('Using cached gloves data');
      return cache.gloves;
    }
    
    throw error;
  }
}

/**
 * Load agents data
 */
export async function loadAgents(useCache: boolean = true): Promise<Agent[]> {
  if (useCache && cache.agents) {
    return cache.agents;
  }

  try {
    const data = await loadJsonFile<Agent[]>('agents_en.json');
    cache.agents = data;
    cache.lastLoaded.agents = new Date();
    console.log(`✓ Loaded ${data.length} agents`);
    return data;
  } catch (error) {
    console.error('Failed to load agents:', error);
    
    if (cache.agents) {
      console.warn('Using cached agents data');
      return cache.agents;
    }
    
    throw error;
  }
}

/**
 * Load music kits data
 */
export async function loadMusic(useCache: boolean = true): Promise<MusicKit[]> {
  if (useCache && cache.music) {
    return cache.music;
  }

  try {
    const data = await loadJsonFile<MusicKit[]>('music_en.json');
    cache.music = data;
    cache.lastLoaded.music = new Date();
    console.log(`✓ Loaded ${data.length} music kits`);
    return data;
  } catch (error) {
    console.error('Failed to load music kits:', error);
    
    if (cache.music) {
      console.warn('Using cached music kits data');
      return cache.music;
    }
    
    throw error;
  }
}

/**
 * Load pins data
 */
export async function loadPins(useCache: boolean = true): Promise<Pin[]> {
  if (useCache && cache.pins) {
    return cache.pins;
  }

  try {
    const data = await loadJsonFile<Pin[]>('collectibles_en.json');
    cache.pins = data;
    cache.lastLoaded.pins = new Date();
    console.log(`✓ Loaded ${data.length} pins`);
    return data;
  } catch (error) {
    console.error('Failed to load pins:', error);
    
    if (cache.pins) {
      console.warn('Using cached pins data');
      return cache.pins;
    }
    
    throw error;
  }
}

/**
 * Load all item data
 */
export async function loadAllItemData(): Promise<void> {
  console.log('Loading item data...');
  
  const results = await Promise.allSettled([
    loadSkins(false),
    loadGloves(false),
    loadAgents(false),
    loadMusic(false),
    loadPins(false),
  ]);

  const failures = results.filter((r) => r.status === 'rejected');
  
  if (failures.length > 0) {
    console.warn(`Failed to load ${failures.length} item data file(s)`);
    failures.forEach((failure, index) => {
      if (failure.status === 'rejected') {
        console.error(`  - ${['skins', 'gloves', 'agents', 'music', 'pins'][index]}: ${failure.reason}`);
      }
    });
  }

  const successes = results.filter((r) => r.status === 'fulfilled').length;
  console.log(`✓ Successfully loaded ${successes}/${results.length} item data files`);
}

/**
 * Clear item data cache
 */
export function clearCache(): void {
  cache.skins = null;
  cache.gloves = null;
  cache.agents = null;
  cache.music = null;
  cache.pins = null;
  cache.lastLoaded = {
    skins: null,
    gloves: null,
    agents: null,
    music: null,
    pins: null,
  };
  console.log('Item data cache cleared');
}

/**
 * Get cache status
 */
export function getCacheStatus() {
  return {
    skins: {
      cached: cache.skins !== null,
      count: cache.skins?.length || 0,
      lastLoaded: cache.lastLoaded.skins,
    },
    gloves: {
      cached: cache.gloves !== null,
      count: cache.gloves?.length || 0,
      lastLoaded: cache.lastLoaded.gloves,
    },
    agents: {
      cached: cache.agents !== null,
      count: cache.agents?.length || 0,
      lastLoaded: cache.lastLoaded.agents,
    },
    music: {
      cached: cache.music !== null,
      count: cache.music?.length || 0,
      lastLoaded: cache.lastLoaded.music,
    },
    pins: {
      cached: cache.pins !== null,
      count: cache.pins?.length || 0,
      lastLoaded: cache.lastLoaded.pins,
    },
  };
}
