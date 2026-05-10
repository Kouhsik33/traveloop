/**
 * Curated transport data mimicking flight/train/bus APIs for India.
 * Can be replaced by Amadeus, Skyscanner, or MakeMyTrip APIs later.
 */

export const TRANSPORT_ROUTES = [
  {
    id: "flight_1",
    mode: "flight",
    provider: "IndiGo",
    providerLogo: "https://logos-world.net/wp-content/uploads/2023/01/IndiGo-Logo.png",
    from: "DEL",
    to: "BOM",
    fromCity: "New Delhi",
    toCity: "Mumbai",
    departureTime: "07:00 AM",
    arrivalTime: "09:15 AM",
    duration: "2h 15m",
    price: 4500,
    currency: "INR",
    type: "Non-stop",
    tags: ["Cheapest", "Eco"]
  },
  {
    id: "flight_2",
    mode: "flight",
    provider: "Vistara",
    providerLogo: "https://download.logo.wine/logo/Vistara/Vistara-Logo.wine.png",
    from: "DEL",
    to: "BOM",
    fromCity: "New Delhi",
    toCity: "Mumbai",
    departureTime: "10:30 AM",
    arrivalTime: "12:45 PM",
    duration: "2h 15m",
    price: 5800,
    currency: "INR",
    type: "Non-stop",
    tags: ["Premium"]
  },
  {
    id: "train_1",
    mode: "train",
    provider: "Vande Bharat Express",
    providerLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/45/IRCTC_Logo.svg/1200px-IRCTC_Logo.svg.png",
    from: "NDLS",
    to: "BSB",
    fromCity: "New Delhi",
    toCity: "Varanasi",
    departureTime: "06:00 AM",
    arrivalTime: "02:00 PM",
    duration: "8h 00m",
    price: 1750,
    currency: "INR",
    type: "Direct",
    tags: ["Fastest Train"]
  },
  {
    id: "train_2",
    mode: "train",
    provider: "Rajdhani Express",
    providerLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/45/IRCTC_Logo.svg/1200px-IRCTC_Logo.svg.png",
    from: "SBC",
    to: "MAS",
    fromCity: "Bengaluru",
    toCity: "Chennai",
    departureTime: "06:00 AM",
    arrivalTime: "10:50 AM",
    duration: "4h 50m",
    price: 950,
    currency: "INR",
    type: "Direct",
    tags: ["Popular"]
  },
  {
    id: "bus_1",
    mode: "bus",
    provider: "KSRTC Airavat",
    providerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ksrtc_logo.png/1200px-Ksrtc_logo.png",
    from: "BLR",
    to: "GOI",
    fromCity: "Bengaluru",
    toCity: "Goa",
    departureTime: "09:00 PM",
    arrivalTime: "08:30 AM (+1)",
    duration: "11h 30m",
    price: 1200,
    currency: "INR",
    type: "AC Sleeper",
    tags: ["Overnight"]
  },
  {
    id: "bus_2",
    mode: "bus",
    provider: "Zingbus",
    providerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Zingbus_logo.png/800px-Zingbus_logo.png",
    from: "DEL",
    to: "JAI",
    fromCity: "New Delhi",
    toCity: "Jaipur",
    departureTime: "11:00 PM",
    arrivalTime: "04:30 AM (+1)",
    duration: "5h 30m",
    price: 650,
    currency: "INR",
    type: "Volvo AC Seater",
    tags: ["Budget"]
  }
];

export const searchTransport = (origin, destination, mode = "all") => {
  return TRANSPORT_ROUTES.filter(route => {
    const matchesOrigin = route.fromCity.toLowerCase().includes(origin.toLowerCase()) || route.from.toLowerCase() === origin.toLowerCase();
    const matchesDest = route.toCity.toLowerCase().includes(destination.toLowerCase()) || route.to.toLowerCase() === destination.toLowerCase();
    const matchesMode = mode === "all" || route.mode === mode;
    return matchesOrigin && matchesDest && matchesMode;
  });
};
