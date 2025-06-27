export interface MockUserProfile {
  id: string;
  fullName: string;
  state: string;
  phoneNumber?: string;
  email: string;
  age: number;
  gender: string;
  location: {
    country: string;
    state: string;
    city: string;
  };
  demographics: {
    income: number;
    education: string;
    employmentStatus: string;
    householdSize: number;
    maritalStatus: string;
  };
  interests: string[];
  dataAvailable: {
    netflix: boolean;
    spotify: boolean;
    instagram: boolean;
    appleMusic: boolean;
    facebook: boolean;
  };
  privacy: {
    hasOptedOut: boolean;
    dataSharing: boolean;
  };
  walletAddress: string;
  createdAt: string;
}

export const mockUserProfiles: MockUserProfile[] = [
  {
    id: "user-001",
    fullName: "John Smith",
    state: "CA",
    phoneNumber: "(555) 123-4567",
    email: "john.smith@example.com",
    age: 28,
    gender: "male",
    location: {
      country: "US",
      state: "California",
      city: "Los Angeles",
    },
    demographics: {
      income: 75000,
      education: "Bachelor's Degree",
      employmentStatus: "Employed Full-time",
      householdSize: 2,
      maritalStatus: "Single",
    },
    interests: ["Technology", "Gaming", "Sports", "Travel"],
    dataAvailable: {
      netflix: true,
      spotify: true,
      instagram: true,
      appleMusic: false,
      facebook: true,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x1234567890123456789012345678901234567890",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "user-002",
    fullName: "Sarah Johnson",
    state: "NY",
    phoneNumber: "(555) 987-6543",
    email: "sarah.johnson@example.com",
    age: 34,
    gender: "female",
    location: {
      country: "US",
      state: "New York",
      city: "New York City",
    },
    demographics: {
      income: 95000,
      education: "Master's Degree",
      employmentStatus: "Employed Full-time",
      householdSize: 1,
      maritalStatus: "Single",
    },
    interests: ["Fashion", "Art & Culture", "Health", "Books"],
    dataAvailable: {
      netflix: true,
      spotify: false,
      instagram: true,
      appleMusic: true,
      facebook: false,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x2345678901234567890123456789012345678901",
    createdAt: "2024-01-16T14:00:00Z",
  },
  {
    id: "user-003",
    fullName: "Michael Davis",
    state: "TX",
    phoneNumber: "(555) 456-7890",
    email: "michael.davis@example.com",
    age: 25,
    gender: "male",
    location: {
      country: "US",
      state: "Texas",
      city: "Austin",
    },
    demographics: {
      income: 45000,
      education: "Some College",
      employmentStatus: "Employed Part-time",
      householdSize: 3,
      maritalStatus: "Single",
    },
    interests: ["Music", "Food & Dining", "Entertainment", "Gaming"],
    dataAvailable: {
      netflix: false,
      spotify: true,
      instagram: true,
      appleMusic: true,
      facebook: true,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x3456789012345678901234567890123456789012",
    createdAt: "2024-01-17T09:30:00Z",
  },
  {
    id: "user-004",
    fullName: "Emily Wilson",
    state: "FL",
    phoneNumber: "(555) 234-5678",
    email: "emily.wilson@example.com",
    age: 31,
    gender: "female",
    location: {
      country: "US",
      state: "Florida",
      city: "Miami",
    },
    demographics: {
      income: 85000,
      education: "Bachelor's Degree",
      employmentStatus: "Self-employed",
      householdSize: 2,
      maritalStatus: "Married",
    },
    interests: ["Travel", "Fitness", "Beauty", "Fashion"],
    dataAvailable: {
      netflix: true,
      spotify: true,
      instagram: false,
      appleMusic: false,
      facebook: true,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x4567890123456789012345678901234567890123",
    createdAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "user-005",
    fullName: "David Brown",
    state: "WA",
    phoneNumber: "(555) 345-6789",
    email: "david.brown@example.com",
    age: 42,
    gender: "male",
    location: {
      country: "US",
      state: "Washington",
      city: "Seattle",
    },
    demographics: {
      income: 120000,
      education: "Master's Degree",
      employmentStatus: "Employed Full-time",
      householdSize: 4,
      maritalStatus: "Married",
    },
    interests: ["Technology", "Business", "Home & Garden", "Education"],
    dataAvailable: {
      netflix: true,
      spotify: false,
      instagram: true,
      appleMusic: true,
      facebook: false,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x5678901234567890123456789012345678901234",
    createdAt: "2024-01-19T11:20:00Z",
  },
  {
    id: "user-006",
    fullName: "Jessica Garcia",
    state: "CO",
    phoneNumber: "(555) 567-8901",
    email: "jessica.garcia@example.com",
    age: 29,
    gender: "female",
    location: {
      country: "US",
      state: "Colorado",
      city: "Denver",
    },
    demographics: {
      income: 65000,
      education: "Bachelor's Degree",
      employmentStatus: "Employed Full-time",
      householdSize: 1,
      maritalStatus: "Single",
    },
    interests: ["Fitness", "Environmental", "Travel", "Health"],
    dataAvailable: {
      netflix: true,
      spotify: true,
      instagram: true,
      appleMusic: true,
      facebook: true,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x6789012345678901234567890123456789012345",
    createdAt: "2024-01-20T13:15:00Z",
  },
  {
    id: "user-007",
    fullName: "Robert Martinez",
    state: "AZ",
    phoneNumber: "(555) 678-9012",
    email: "robert.martinez@example.com",
    age: 55,
    gender: "male",
    location: {
      country: "US",
      state: "Arizona",
      city: "Phoenix",
    },
    demographics: {
      income: 110000,
      education: "Professional Degree",
      employmentStatus: "Employed Full-time",
      householdSize: 3,
      maritalStatus: "Married",
    },
    interests: ["Sports", "Politics", "Finance", "Automotive"],
    dataAvailable: {
      netflix: true,
      spotify: false,
      instagram: false,
      appleMusic: false,
      facebook: true,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x7890123456789012345678901234567890123456",
    createdAt: "2024-01-21T08:45:00Z",
  },
  {
    id: "user-008",
    fullName: "Lisa Thompson",
    state: "OR",
    phoneNumber: "(555) 789-0123",
    email: "lisa.thompson@example.com",
    age: 38,
    gender: "female",
    location: {
      country: "US",
      state: "Oregon",
      city: "Portland",
    },
    demographics: {
      income: 72000,
      education: "Master's Degree",
      employmentStatus: "Employed Full-time",
      householdSize: 2,
      maritalStatus: "Married",
    },
    interests: ["Art & Culture", "Books", "Environmental", "Food & Dining"],
    dataAvailable: {
      netflix: true,
      spotify: true,
      instagram: true,
      appleMusic: true,
      facebook: false,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x8901234567890123456789012345678901234567",
    createdAt: "2024-01-22T12:30:00Z",
  },
  {
    id: "user-009",
    fullName: "James Lee",
    state: "IL",
    phoneNumber: "(555) 890-1234",
    email: "james.lee@example.com",
    age: 23,
    gender: "male",
    location: {
      country: "US",
      state: "Illinois",
      city: "Chicago",
    },
    demographics: {
      income: 35000,
      education: "Some College",
      employmentStatus: "Student",
      householdSize: 1,
      maritalStatus: "Single",
    },
    interests: ["Gaming", "Technology", "Music", "Entertainment"],
    dataAvailable: {
      netflix: true,
      spotify: true,
      instagram: true,
      appleMusic: true,
      facebook: true,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x9012345678901234567890123456789012345678",
    createdAt: "2024-01-23T15:00:00Z",
  },
  {
    id: "user-010",
    fullName: "Amanda Rodriguez",
    state: "NC",
    phoneNumber: "(555) 901-2345",
    email: "amanda.rodriguez@example.com",
    age: 45,
    gender: "female",
    location: {
      country: "US",
      state: "North Carolina",
      city: "Charlotte",
    },
    demographics: {
      income: 88000,
      education: "Bachelor's Degree",
      employmentStatus: "Employed Full-time",
      householdSize: 4,
      maritalStatus: "Married",
    },
    interests: ["Health", "Family", "Education", "Home & Garden"],
    dataAvailable: {
      netflix: true,
      spotify: false,
      instagram: true,
      appleMusic: false,
      facebook: true,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x0123456789012345678901234567890123456789",
    createdAt: "2024-01-24T09:15:00Z",
  },
  {
    id: "user-011",
    fullName: "Kevin Wang",
    state: "CA",
    phoneNumber: "(555) 012-3456",
    email: "kevin.wang@example.com",
    age: 32,
    gender: "male",
    location: {
      country: "US",
      state: "California",
      city: "San Francisco",
    },
    demographics: {
      income: 145000,
      education: "Master's Degree",
      employmentStatus: "Employed Full-time",
      householdSize: 2,
      maritalStatus: "Married",
    },
    interests: ["Technology", "Finance", "Travel", "Business"],
    dataAvailable: {
      netflix: true,
      spotify: true,
      instagram: false,
      appleMusic: true,
      facebook: false,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x1123456789012345678901234567890123456789",
    createdAt: "2024-01-25T11:30:00Z",
  },
  {
    id: "user-012",
    fullName: "Rachel Green",
    state: "MA",
    phoneNumber: "(555) 123-4567",
    email: "rachel.green@example.com",
    age: 27,
    gender: "female",
    location: {
      country: "US",
      state: "Massachusetts",
      city: "Boston",
    },
    demographics: {
      income: 68000,
      education: "Bachelor's Degree",
      employmentStatus: "Employed Full-time",
      householdSize: 1,
      maritalStatus: "Single",
    },
    interests: ["Fashion", "Beauty", "Fitness", "Entertainment"],
    dataAvailable: {
      netflix: true,
      spotify: true,
      instagram: true,
      appleMusic: true,
      facebook: true,
    },
    privacy: {
      hasOptedOut: false,
      dataSharing: true,
    },
    walletAddress: "0x2234567890123456789012345678901234567890",
    createdAt: "2024-01-26T14:45:00Z",
  },
];

export function searchUserProfiles(searchParams: {
  fullName: string;
  state: string;
  phoneNumber?: string;
}): MockUserProfile[] {
  return mockUserProfiles.filter((profile) => {
    // Case-insensitive name matching
    const nameMatch = profile.fullName
      .toLowerCase()
      .includes(searchParams.fullName.toLowerCase());

    // Exact state matching
    const stateMatch =
      profile.state.toLowerCase() === searchParams.state.toLowerCase();

    // Optional phone number matching
    const phoneMatch =
      !searchParams.phoneNumber ||
      profile.phoneNumber?.includes(
        searchParams.phoneNumber.replace(/\D/g, ""),
      );

    return nameMatch && stateMatch && phoneMatch && profile.privacy.dataSharing;
  });
}

export function calculateDataValue(
  profile: MockUserProfile,
  selectedSources: string[],
): number {
  const basePrices = {
    netflix: 1.25,
    spotify: 1.0,
    instagram: 1.75,
    appleMusic: 0.75,
    facebook: 2.0,
  };

  let total = 0;
  selectedSources.forEach((source) => {
    const sourceKey = source
      .replace("-", "")
      .toLowerCase() as keyof typeof basePrices;
    if (profile.dataAvailable[sourceKey]) {
      total += basePrices[sourceKey] ?? 0;
    }
  });

  return total;
}
