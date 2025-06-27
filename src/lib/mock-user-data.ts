export interface MockUserProfile {
  id: string;
  fullName: string;
  state: string;
  phoneNumber?: string;
  email: string;
  age: number;
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
