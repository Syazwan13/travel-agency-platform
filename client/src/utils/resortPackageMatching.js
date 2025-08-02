// Utility functions for matching resorts with packages

/**
 * Improved matching logic to find packages for a specific resort
 * @param {Object} resort - Resort object with name and island
 * @param {Array} allPackages - Array of all available packages
 * @returns {Array} - Array of matching packages
 */
export const findPackagesForResort = (resort, allPackages) => {
  console.log('🏨 Finding packages for resort:', resort.name, 'Island:', resort.island);
  
  const resortPackages = allPackages.filter(pkg => {
    if (!pkg.resort) return false;
    
    const resortName = resort.name.toLowerCase();
    const packageResort = pkg.resort.toLowerCase();
    
    // Skip generic entries
    if (resortName === 'destinations' || packageResort === 'destinations') {
      return false;
    }
    
    // Direct match
    if (packageResort.includes(resortName) || resortName.includes(packageResort)) {
      return true;
    }
    
    // Extract key words from resort names for fuzzy matching
    const resortWords = resortName.split(/\s+/).filter(word => 
      word.length > 3 && !['resort', 'hotel', 'beach', 'island', 'spa', 'view', 'bay'].includes(word)
    );
    const packageWords = packageResort.split(/\s+/).filter(word => 
      word.length > 3 && !['resort', 'hotel', 'beach', 'island', 'spa', 'view', 'bay'].includes(word)
    );
    
    // Check if any significant words match
    const hasWordMatch = resortWords.some(word => 
      packageWords.some(pWord => pWord.includes(word) || word.includes(pWord))
    );
    
    // Match by island/destination
    const islandMatch = resort.island && pkg.destination && 
      (resort.island.toLowerCase().includes(pkg.destination.toLowerCase()) ||
       pkg.destination.toLowerCase().includes(resort.island.toLowerCase()));
    
    // For island matches, also check if the package title contains resort-like words
    if (islandMatch && pkg.title) {
      const titleLower = pkg.title.toLowerCase();
      const hasResortInTitle = resortWords.some(word => titleLower.includes(word));
      return hasResortInTitle;
    }
    
    return hasWordMatch;
  });

  console.log('📦 Found packages for', resort.name, ':', resortPackages.length);
  resortPackages.forEach(pkg => {
    console.log('  - Package:', pkg.resort, '| Title:', pkg.title?.substring(0, 50));
  });

  return resortPackages;
};

/**
 * Normalize resort name for better matching
 * @param {string} name - Resort name to normalize
 * @returns {string} - Normalized name
 */
export const normalizeResortName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/\b(resort|hotel|beach|island|spa|view|bay)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Calculate similarity score between two resort names
 * @param {string} name1 - First resort name
 * @param {string} name2 - Second resort name
 * @returns {number} - Similarity score (0-1)
 */
export const calculateNameSimilarity = (name1, name2) => {
  const norm1 = normalizeResortName(name1);
  const norm2 = normalizeResortName(name2);
  
  if (norm1 === norm2) return 1;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8;
  
  const words1 = norm1.split(/\s+/).filter(w => w.length > 2);
  const words2 = norm2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(w => words2.some(w2 => w2.includes(w) || w.includes(w2)));
  return commonWords.length / Math.max(words1.length, words2.length);
};
