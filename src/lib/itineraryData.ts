// Icons will now be referenced by string names for database seeding

export const itineraries: any = {
  "4-day": [
    {
      id: "alleppey-4",
      tabLabel: "Day 1",
      title: "The Backwater Bliss",
      events: [
        { icon: "Train", time: "09:30 AM", cardTitle: "Alleppey Arrival", desc: "Arrival at Alleppey Station. Private transfer to the jetty for houseboat boarding.", photoIndex: 0 },
        { icon: "Ship", time: "11:30 AM", cardTitle: "Private Villa Boarding", desc: "Check-in to your 4-bedroom houseboat.", photoIndex: 1 },
        { icon: "Utensils", time: "01:30 PM", cardTitle: "Monsoon Cruise", desc: "Navigate Vembanad Lake. The covered deck is perfect for music and seafood lunch.", photoIndex: 2 },
        { icon: "Sunset", time: "05:30 PM", cardTitle: "Hidden Canal Shikara", desc: "A 1-hour sunset cruise through the narrowest backwater arteries.", photoIndex: 3 },
      ],
      photos: ["https://images.unsplash.com/photo-1593693397690-362cb9666fc2", "https://images.unsplash.com/photo-1593693411515-c202e93fe3f1", "https://images.unsplash.com/photo-1593693411515-c202e93fe3f1", "https://images.unsplash.com/photo-1593693411515-c202e93fe3f1"]
    },
    {
      id: "munnar-4",
      tabLabel: "Day 2",
      title: "The Tea Highlands",
      events: [
        { icon: "Car", time: "10:00 AM", cardTitle: "Self-Drive Pickup", desc: "Pick up two rental cars at the jetty. Begin the 5-hour scenic climb to Munnar.", photoIndex: 0 },
        { icon: "Utensils", time: "01:30 PM", cardTitle: "Highland Lunch", desc: "Roadside stop for Kerala Beef Fry or Spicy Chicken Curry.", photoIndex: 1 },
        { icon: "Landmark", time: "04:30 PM", cardTitle: "KDHP Tea Museum", desc: "Indoor history tour of the tea estates—perfect for the afternoon mist.", photoIndex: 2 },
        { icon: "Home", time: "07:00 PM", cardTitle: "Munnar Stay", desc: "Check-in at a cozy homestay surrounded by tea gardens.", photoIndex: 3 },
      ],
      photos: ["https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20"]
    },
    {
      id: "adventure-4",
      tabLabel: "Day 3",
      title: "Adventure & Shift",
      events: [
        { icon: "Mountain", time: "11:30 AM", cardTitle: "Ripple Adventures", desc: "Ziplining and river crossing through the drizzle. Epic valley views.", photoIndex: 0 },
        { icon: "Car", time: "02:30 PM", cardTitle: "The Big Shift", desc: "Drive from Munnar down to the coast of Kochi. Stop by sights along the way.", photoIndex: 1 },
        { icon: "Landmark", time: "07:30 PM", cardTitle: "Kochi Arrival", desc: "Check-in at the heritage stay followed by dinner and walk.", photoIndex: 2 },
      ],
      photos: ["https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20"]
    },
    {
      id: "kochi-4",
      tabLabel: "Day 4",
      title: "Heritage & Return",
      events: [
        { icon: "Landmark", time: "11:30 AM", cardTitle: "Fort Kochi Tour", desc: "Chinese Fishing Nets and St. Francis Church. Last-minute Jew Town shopping.", photoIndex: 0 },
        { icon: "Utensils", time: "01:00 PM", cardTitle: "Seafood Lunch", desc: "Spicy local seafood at Fusion Bay or Kerala Cafe.", photoIndex: 1 },
        { icon: "Landmark", time: "06:00 PM", cardTitle: "Mattanchery Palace", desc: "Explore the historic palace and its surroundings.", photoIndex: 2 },
        { icon: "Train", time: "06:45 PM", cardTitle: "Station Departure", desc: "Board Train for the overnight journey back home.", photoIndex: 3 },
      ],
      photos: ["https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20"]
    }
  ],
  "5-day": [
    {
      id: "day1-5",
      tabLabel: "Day 1",
      title: "The Backwater Bliss (Alleppey)",
      events: [
        { icon: "Train", time: "09:30 AM", cardTitle: "Alleppey Arrival", desc: "Arrival at Alleppey Station. Transfer to Jetty.", photoIndex: 0 },
        { icon: "Ship", time: "11:30 AM", cardTitle: "Houseboat Check-in", desc: "Your private 4-bedroom floating villa.", photoIndex: 1 },
        { icon: "Utensils", time: "01:30 PM", cardTitle: "Traditional Sadhya Lunch", desc: "Traditional Sadhya Lunch (with spicy Karimeen & Prawns).", photoIndex: 2 },
        { icon: "Waves", time: "05:30 PM", cardTitle: "Sunset Shikara Ride", desc: "Navigate the tiny canals where the houseboat can't go.", photoIndex: 3 },
      ],
      photos: ["https://images.unsplash.com/photo-1593693397690-362cb9666fc2", "https://images.unsplash.com/photo-1593693411515-c202e93fe3f1", "https://images.unsplash.com/photo-1586500036706-41963de24d8b", "https://images.unsplash.com/photo-1627894483216-2138af692e32"]
    },
    {
      id: "day2-5",
      tabLabel: "Day 2",
      title: "Into the Clouds (Drive to Munnar)",
      events: [
        { icon: "Coffee", time: "10:00 AM", cardTitle: "Late Breakfast", desc: "Late breakfast & checkout. Car Pickup at the jetty.", photoIndex: 0 },
        { icon: "Car", time: "10:30 AM", cardTitle: "Drive to Munnar", desc: "Scenic 5-hour drive with a spicy lunch stop.", photoIndex: 1 },
        { icon: "Landmark", time: "04:30 PM", cardTitle: "Tea Museum (KDHP)", desc: "Perfect indoor start to the hill station experience.", photoIndex: 2 },
        { icon: "Home", time: "07:30 PM", cardTitle: "Estate Check-in", desc: "Check into your tea estate homestay.", photoIndex: 3 },
        { icon: "Utensils", time: "08:30 PM", cardTitle: "Ginger Chicken Dinner", desc: "Dinner at Hotel Gurubhavan (Try the spicy Ginger Chicken).", photoIndex: 0 },
      ],
      photos: ["https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23", "https://images.unsplash.com/photo-1552465011-b4e21bd6e79a", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23"]
    },
    {
      id: "day3-5",
      tabLabel: "Day 3",
      title: "The Emerald Circuit (Munnar)",
      events: [
        { icon: "Coffee", time: "10:00 AM", cardTitle: "Heavy Breakfast", desc: "Sleep in. Heavy breakfast at the estate.", photoIndex: 0 },
        { icon: "Mountain", time: "11:30 AM", cardTitle: "Ripple Adventures", desc: "Ziplining and river crossing through the highlands.", photoIndex: 1 },
        { icon: "Car", time: "02:00 PM", cardTitle: "Lakeside Drive", desc: "Mattupetty Dam & Echo Point exploration.", photoIndex: 2 },
        { icon: "Camera", time: "04:00 PM", cardTitle: "Lockhart Gap", desc: "Dramatic monsoon photography (mist-covered valleys).", photoIndex: 3 },
      ],
      photos: ["https://images.unsplash.com/photo-1552465011-b4e21bd6e79a", "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23"]
    },
    {
      id: "day4-5",
      tabLabel: "Day 4",
      title: "The Monsoon Spectacle",
      events: [
        { icon: "Car", time: "09:00 AM", cardTitle: "Athirappilly Drive", desc: "Checkout and drive to Athirappilly Waterfalls (approx. 4 hours).", photoIndex: 0 },
        { icon: "Utensils", time: "01:30 PM", cardTitle: "Falls Lunch", desc: "Arrival & Lunch near the falls.", photoIndex: 1 },
        { icon: "Waves", time: "02:30 PM", cardTitle: "Athirappilly Falls", desc: "In June, the 'Niagara of India' is at its most powerful.", photoIndex: 2 },
        { icon: "Car", time: "05:00 PM", cardTitle: "Kochi Drive", desc: "Drive to Kochi (approx. 2 hours).", photoIndex: 3 },
        { icon: "Utensils", time: "07:30 PM", cardTitle: "Seafood Dinner", desc: "Check into Kochi stay and head out for a Spicy Seafood Dinner.", photoIndex: 1 },
      ],
      photos: ["https://images.unsplash.com/photo-1590603740183-980e7f98e25e", "https://images.unsplash.com/photo-1590603740183-980e7f98e25e", "https://images.unsplash.com/photo-1590603740183-980e7f98e25e", "https://images.unsplash.com/photo-1590603740183-980e7f98e25e"]
    },
    {
      id: "day5-5",
      tabLabel: "Day 5",
      title: "Heritage & The Big Mall",
      events: [
        { icon: "Coffee", time: "10:00 AM", cardTitle: "Colonial Breakfast", desc: "Last sleep-in. Breakfast at a colonial cafe.", photoIndex: 0 },
        { icon: "Landmark", time: "11:30 AM", cardTitle: "Fort Kochi Heritage", desc: "Chinese Fishing Nets, Mattancherry Palace, and Jew Town shopping.", photoIndex: 1 },
        { icon: "Utensils", time: "01:30 PM", cardTitle: "Final Lunch", desc: "Fish mango curry at Fusion Bay.", photoIndex: 2 },
        { icon: "Navigation", time: "03:00 PM", cardTitle: "LuLu Mall Kochi", desc: "3 hours of high-end shopping, arcade games, and a dry refuge.", photoIndex: 3 },
        { icon: "Car", time: "06:00 PM", cardTitle: "Station Drop", desc: "Car Return & Station Drop at Tripunithura Station (TRTR).", photoIndex: 0 },
        { icon: "Train", time: "06:45 PM", cardTitle: "Board Train", desc: "Board Train 12624 (Chennai Mail) back home.", photoIndex: 0 },
      ],
      photos: ["https://images.unsplash.com/photo-1582531633534-f89617267104", "https://images.unsplash.com/photo-1627883383204-c570b22a5789", "https://images.unsplash.com/photo-1582531633534-f89617267104", "https://images.unsplash.com/photo-1627883383204-c570b22a5789"]
    }
  ],
  "places": {
    "4-day": [
       { id: "p1", name: "Alleppey Jetty", category: "Nature", coords: [76.3329, 9.4981], image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2", desc: "Starting point of the houseboat cruise.", isRouteStop: true },
       { id: "p2", name: "Munnar Tea Museum", category: "Landmark", coords: [77.0507, 10.0955], image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", desc: "History of tea in the high range.", isRouteStop: true },
       { id: "p3", name: "Ripple Adventures", category: "Adventure", coords: [76.9900, 10.0400], image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", desc: "Ziplining through the highlands.", isRouteStop: true },
       { id: "p4", name: "Fort Kochi", category: "Landmark", coords: [76.2421, 9.9658], image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", desc: "Heritage walks and colonial architecture.", isRouteStop: true }
    ],
    "5-day": [
       { id: "p1", name: "Alleppey Jetty", category: "Nature", coords: [76.3329, 9.4981], image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2", desc: "Starting point.", isRouteStop: true },
       { id: "p2", name: "Munnar Tea Museum", category: "Landmark", coords: [77.0507, 10.0955], image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23", desc: "Classic highlands stop.", isRouteStop: true },
       { id: "p3", name: "Ripple Adventures", category: "Adventure", coords: [76.9900, 10.0400], image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23", desc: "Hill station thrills.", isRouteStop: true },
       { id: "p4", name: "Athirappilly Falls", category: "Nature", coords: [76.5686, 10.2847], image: "https://images.unsplash.com/photo-1590603740183-980e7f98e25e", desc: "The Niagara of India.", isRouteStop: true },
       { id: "p5", name: "LuLu Mall Kochi", category: "Shopping", coords: [76.3078, 10.0256], image: "https://images.unsplash.com/photo-1582531633534-f89617267104", desc: "Final shopping and refuge.", isRouteStop: true }
    ]
  }
};

export const masterPlaces: any = [
  { id: "alleppey-jetty", name: "Alleppey Jetty", category: "Nature", coords: [76.3329, 9.4981], image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2", desc: "Starting point of the houseboat cruise." },
  { id: "munnar-tea-museum", name: "Munnar Tea Museum", category: "Landmark", coords: [77.0507, 10.0955], image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", desc: "History of tea in the high range." },
  { id: "ripple-adventures", name: "Ripple Adventures", category: "Adventure", coords: [76.9900, 10.0400], image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", desc: "Ziplining through the highlands." },
  { id: "fort-kochi", name: "Fort Kochi", category: "Landmark", coords: [76.2421, 9.9658], image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20", desc: "Heritage walks and colonial architecture." },
  { id: "athirappilly-falls", name: "Athirappilly Falls", category: "Nature", coords: [76.5686, 10.2847], image: "https://images.unsplash.com/photo-1590603740183-980e7f98e25e", desc: "The Niagara of India." },
  { id: "lulu-mall", name: "LuLu Mall Kochi", category: "Shopping", coords: [76.3078, 10.0256], image: "https://images.unsplash.com/photo-1582531633534-f89617267104", desc: "Final shopping and refuge." }
];
