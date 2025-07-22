
// This is a mock data utility to add country information to users for demonstration purposes.
// In a real application, this data would come from your database.

interface User {
  id: string;
  fullName?: string;
  email?: string;
  plan?: string;
  status?: string;
  avatar?: string;
  role?: string;
  country?: string;
}

const countries = ['India', 'United States', 'United Kingdom', 'Germany', 'Australia'];

export function addCountryToUsers(users: User[]): User[] {
  return users.map((user, index) => ({
    ...user,
    country: countries[index % countries.length],
  }));
}
