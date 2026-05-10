/**
 * Realistic Indian travel community data.
 * Used to populate the community feed until the backend integration is complete.
 */

export const COMMUNITY_POSTS = [
  {
    id: "post_1",
    author: {
      name: "Ananya Sharma",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
      bio: "Mountain lover | Weekend explorer",
      verified: true
    },
    tripId: "trip_kashmir",
    location: "Srinagar, Jammu & Kashmir",
    caption: "Waking up on a houseboat on Dal Lake was a dream come true! 🛶 The morning mist over the water and the floating vegetable market is something I'll never forget. Highly recommend spending at least two days just soaking in the peaceful vibes here.",
    image: "https://images.unsplash.com/photo-1597074866923-dc0589150458?w=1200&q=80",
    likes: 342,
    comments: 28,
    tags: ["KashmirDiaries", "DalLake", "IncredibleIndia"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: "post_2",
    author: {
      name: "Vikram Singh",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
      bio: "Backpacker | Photography enthusiast",
      verified: false
    },
    tripId: "trip_hampi",
    location: "Hampi, Karnataka",
    caption: "The ruins of the Vijayanagara Empire are breathtaking at sunset from Matanga Hill. 🌅 It’s a steep climb but the panoramic view of the boulder-strewn landscape and the Tungabhadra river winding through it is worth every step.",
    image: "https://images.unsplash.com/photo-1590050751759-db52da741c41?w=1200&q=80",
    likes: 856,
    comments: 45,
    tags: ["Hampi", "HeritageWalk", "SunsetViews"],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
  },
  {
    id: "post_3",
    author: {
      name: "Neha Desai",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
      bio: "Foodie & Beach bum 🌴",
      verified: true
    },
    tripId: "trip_gokarna",
    location: "Gokarna, Karnataka",
    caption: "Skipped Goa this time and headed to Gokarna instead. Best decision ever! The beach trek from Kudle to Paradise beach is stunning, and the cafes here serve the most amazing seafood. 🌊🍤",
    image: "https://images.unsplash.com/photo-1590766940554-634853c6e181?w=1200&q=80",
    likes: 1205,
    comments: 89,
    tags: ["Gokarna", "BeachTrek", "Wanderlust"],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
  },
  {
    id: "post_4",
    author: {
      name: "Arjun Reddy",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
      bio: "Chasing waterfalls in Northeast India",
      verified: false
    },
    tripId: "trip_meghalaya",
    location: "Cherrapunji, Meghalaya",
    caption: "The living root bridges of Meghalaya are an architectural marvel by the Khasi tribe. Trekking down 3000 steps to the double-decker root bridge was exhausting but the crystal clear pools underneath made for the perfect dip. 🌿💧",
    image: "https://images.unsplash.com/photo-1625046633788-6a1d03f7b04f?w=1200&q=80",
    likes: 2140,
    comments: 132,
    tags: ["Meghalaya", "RootBridges", "Trekking"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: "post_5",
    author: {
      name: "Priya Patel",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80",
      bio: "Heritage lover ✨",
      verified: true
    },
    tripId: "trip_jaipur",
    location: "Jaipur, Rajasthan",
    caption: "Lost in the intricate details of the Hawa Mahal. It’s amazing to think the royal ladies used these 953 windows to watch the street festivals unnoticed. The pink city is truly magical! 🌸🕌",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80",
    likes: 678,
    comments: 34,
    tags: ["Jaipur", "PinkCity", "RajasthanTourism"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
];
