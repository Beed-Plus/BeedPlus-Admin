export const POST_RANKINGS_STATS = {
  totalPostsRanked: 12840,
  avgBeedPlusScore: 84.2,
  topPerformingCategory: 'Technology',
}

// change: 'up' | 'down' | 'neutral'
export const MOCK_POST_RANKINGS = [
  { id: 1,  title: 'Top 10 AI tools for 2024',          username: '@techguru',    category: 'Technology', clicks: 142502, score: 98.4, change: 'up',      thumbnailColor: '#1a1a1a' },
  { id: 2,  title: 'Best vegan recipes for...',          username: '@chef_jane',   category: 'Lifestyle',  clicks: 98211,  score: 96.2, change: 'up',      thumbnailColor: '#4a5a3a' },
  { id: 3,  title: 'Market Analysis: Q1...',             username: '@fin_pro',     category: 'Finance',    clicks: 87403,  score: 94.8, change: 'down',    thumbnailColor: '#1a1a1a' },
  { id: 4,  title: 'Hiking Patagonia: A Guide',          username: '@nomad_will',  category: 'Travel',     clicks: 76194,  score: 92.1, change: 'up',      thumbnailColor: '#d0d0c8' },
  { id: 5,  title: 'MacOS vs Windows in...',             username: '@techguru',    category: 'Technology', clicks: 72005,  score: 91.5, change: 'neutral', thumbnailColor: '#f0f0f0' },
  { id: 6,  title: 'Mindfulness for Beginners',          username: '@calm_life',   category: 'Lifestyle',  clicks: 65400,  score: 89.3, change: 'up',      thumbnailColor: '#3a4a5a' },
  { id: 7,  title: 'Global Market Trends 2024',          username: '@fin_pro',     category: 'Finance',    clicks: 58700,  score: 87.6, change: 'down',    thumbnailColor: '#2a2a2a' },
  { id: 8,  title: 'Solo Travel Southeast Asia',         username: '@nomad_will',  category: 'Travel',     clicks: 51200,  score: 85.9, change: 'up',      thumbnailColor: '#3a5a4a' },
  { id: 9,  title: 'Build a React App in 1 Hour',        username: '@techguru',    category: 'Technology', clicks: 47800,  score: 84.1, change: 'neutral', thumbnailColor: '#1a2a3a' },
  { id: 10, title: 'Plant-Based Protein Guide',          username: '@chef_jane',   category: 'Lifestyle',  clicks: 43100,  score: 82.7, change: 'down',    thumbnailColor: '#4a3a2a' },
  { id: 11, title: 'Crypto Portfolio Strategy',          username: '@fin_pro',     category: 'Finance',    clicks: 39500,  score: 80.4, change: 'up',      thumbnailColor: '#2a1a1a' },
  { id: 12, title: 'Europe on a Budget',                 username: '@nomad_will',  category: 'Travel',     clicks: 35800,  score: 78.9, change: 'neutral', thumbnailColor: '#3a3a4a' },
  { id: 13, title: 'CSS Grid Masterclass',               username: '@techguru',    category: 'Technology', clicks: 31200,  score: 77.2, change: 'up',      thumbnailColor: '#1a1a3a' },
  { id: 14, title: 'Intermittent Fasting Results',       username: '@chef_jane',   category: 'Lifestyle',  clicks: 27600,  score: 75.5, change: 'down',    thumbnailColor: '#4a4a2a' },
  { id: 15, title: 'Stock Market for Beginners',         username: '@fin_pro',     category: 'Finance',    clicks: 24100,  score: 73.8, change: 'up',      thumbnailColor: '#2a3a2a' },
]

export const CATEGORY_BADGE_STYLES = {
  Technology: 'border-blue-200   bg-blue-50   text-blue-600',
  Lifestyle:  'border-orange-200 bg-orange-50 text-orange-500',
  Finance:    'border-green-200  bg-green-50  text-green-600',
  Travel:     'border-purple-200 bg-purple-50 text-purple-600',
}
