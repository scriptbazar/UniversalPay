
export type PaymentLink = {
  id: string;
  slug: string;
  title: string;
  description: string;
  url: string;
  type: 'Fixed' | 'Dynamic';
  amount: number | null;
  isActive: boolean;
  createdAt: string;
  payments: number;
  brandColor: string;
  collectPhone: boolean;
};

const generateRandomId = (prefix: string) => {
    const randomNum = Math.floor(1000000 + Math.random() * 9000000);
    return `${prefix}${randomNum}`;
};

let links: PaymentLink[] = [
  {
    id: generateRandomId('UVPAYLINK'),
    slug: 't-shirt-sale',
    title: 'T-Shirt Sale',
    description: 'High-quality cotton t-shirts available in all sizes. Grab yours now!',
    url: '/pay/t-shirt-sale',
    type: 'Fixed',
    amount: 25.00,
    isActive: true,
    createdAt: '2023-10-26T10:00:00Z',
    payments: 120,
    brandColor: '#29ABE2',
    collectPhone: false,
  },
  {
    id: generateRandomId('UVPAYLINK'),
    slug: 'donation',
    title: 'General Donation',
    description: 'Support our cause by making a donation. Every bit helps!',
    url: '/pay/donation',
    type: 'Dynamic',
    amount: null,
    isActive: true,
    createdAt: '2023-10-25T11:00:00Z',
    payments: 50,
    brandColor: '#34D399',
    collectPhone: true,
  },
  {
    id: generateRandomId('UVPAYLINK'),
    slug: 'workshop',
    title: 'Workshop Registration',
    description: 'Join our exclusive workshop on modern web development.',
    url: '/pay/workshop',
    type: 'Fixed',
    amount: 100.00,
    isActive: false,
    createdAt: '2023-10-22T12:00:00Z',
    payments: 75,
    brandColor: '#F59E0B',
    collectPhone: true,
  },
];

export const getPaymentLinks = (): PaymentLink[] => {
  return [...links].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPaymentLinkBySlug = (slug: string): PaymentLink | undefined => {
  return links.find(link => link.slug === slug);
};

export const getPaymentLinkById = (id: string): PaymentLink | undefined => {
  return links.find(link => link.id === id);
};


export const addPaymentLink = (newLinkData: Omit<PaymentLink, 'id'>): void => {
  const newLink: PaymentLink = {
    ...newLinkData,
    id: generateRandomId('UVPAYLINK'),
  };
  links.unshift(newLink);
};
