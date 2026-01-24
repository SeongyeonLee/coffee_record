// REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
export const API_URL = 'https://script.google.com/macros/s/AKfycbwDfJXAj7I9GFGcj44Hudu35TXQCQwwDg_n_e3UodfMlTqemJ-fNDN7NRwgF2PGs_g/exec';

export const COUNTRY_FLAGS: Record<string, string> = {
  'Ethiopia': '🇪🇹',
  'Colombia': '🇨🇴',
  'Brazil': '🇧🇷',
  'Kenya': '🇰🇪',
  'Panama': '🇵🇦',
  'Costa Rica': '🇨🇷',
  'Guatemala': '🇬🇹',
  'Honduras': '🇭🇳',
  'El Salvador': '🇸🇻',
  'Rwanda': '🇷🇼',
  'Burundi': '🇧🇮',
  'Indonesia': '🇮🇩',
  'Vietnam': '🇻🇳',
  'Yemen': '🇾🇪',
  'Ecuador': '🇪🇨',
  'Peru': '🇵🇪',
  'Mexico': '🇲🇽',
  'USA': '🇺🇸',
  'Unknown': '🏳️',
};

export const FLAVOR_HIERARCHY: Record<string, string[]> = {
  'Fruity': ['Blackberry', 'Blueberry', 'Raspberry', 'Cherry', 'Strawberry', 'Green Apple', 'Red Apple', 'Peach', 'Apricot', 'Plum', 'Mango', 'Papaya', 'Lemon', 'Lime', 'Orange', 'Grapefruit'],
  'Floral': ['Jasmine', 'Rose', 'Lavender', 'Hibiscus', 'Orange Blossom'],
  'Sweet': ['Caramel', 'Honey', 'Vanilla', 'Maple Syrup', 'Molasses', 'Brown Sugar'],
  'Nutty': ['Almond', 'Hazelnut', 'Peanut', 'Walnut', 'Cashew'],
  'Chocolate': ['Dark Chocolate', 'Milk Chocolate', 'Cocoa Powder'],
  'Spicy': ['Cinnamon', 'Clove', 'Nutmeg', 'Black Pepper', 'Ginger'],
  'Earthy/Green': ['Cedar', 'Pine', 'Tobacco', 'Tea', 'Herbal', 'Grass'],
  'Fermented': ['Winey', 'Whiskey', 'Boosy', 'Yogurt'],
};

export const FLAVOR_COLORS: Record<string, string> = {
  'Fruity': 'from-pink-500 to-red-500',
  'Floral': 'from-purple-500 to-indigo-500',
  'Nutty': 'from-amber-700 to-brown-600',
  'Chocolate': 'from-stone-700 to-stone-900',
  'Sweet': 'from-yellow-400 to-orange-400',
  'Spicy': 'from-red-700 to-orange-800',
  'Fermented': 'from-rose-700 to-pink-800',
  'Earthy/Green': 'from-green-500 to-emerald-700',
};

export const COMMON_FLAVORS = Object.keys(FLAVOR_HIERARCHY);
