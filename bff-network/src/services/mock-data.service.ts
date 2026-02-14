/**
 * mock-data.service.ts
 * 
 * Description:
 *  - Generates fake data for all social networking features using Faker.
 *  - Simulates LinkedIn-like backend responses for development.
 * 
 * @module services/mock-data.service
 */
import { faker } from '@faker-js/faker';

// ─── Legacy Interfaces ───────────────────────────────────────────────

export interface UserDetails {
  address: { street: string; city: string; zipCode: string; country: string };
  phone: string;
  company: string;
  recentLogin: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: string;
  currency: string;
  merchant: string;
  type: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  department: string;
  material: string;
  description: string;
  inStock: boolean;
}

// ─── Social Networking Interfaces ────────────────────────────────────

export interface FeedPost {
  id: string;
  author: {
    id: string;
    name: string;
    headline: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    headline: string;
    online: boolean;
  };
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    headline: string;
    online: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Connection {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  mutualConnections: number;
  connected: boolean;
  pendingRequest: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'connection' | 'message' | 'job' | 'mention';
  actor: {
    name: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
}

export interface UserProfileExtended {
  id: string;
  name: string;
  headline: string;
  location: string;
  avatar: string;
  coverImage: string;
  about: string;
  connections: number;
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number;
  }[];
  skills: string[];
}

// ─── Mock Data Service ───────────────────────────────────────────────

export class MockDataService {

  // ── Legacy methods ──────────────────────────────────────

  static getUserDetails(): UserDetails {
    return {
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      phone: faker.phone.number(),
      company: faker.company.name(),
      recentLogin: faker.date.recent().toISOString()
    };
  }

  static getTransactions(count: number = 5): Transaction[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      date: faker.date.past().toISOString(),
      amount: faker.finance.amount({ min: 10, max: 1000, dec: 2 }),
      currency: faker.finance.currencyCode(),
      merchant: faker.company.name(),
      type: faker.helpers.arrayElement(['debit', 'credit'])
    }));
  }

  static getProducts(count: number = 8): Product[] {
    return Array.from({ length: count }, () => ({
      id: faker.commerce.isbn(),
      name: faker.commerce.productName(),
      price: faker.commerce.price({ min: 10, max: 500 }),
      department: faker.commerce.department(),
      material: faker.commerce.productMaterial(),
      description: faker.commerce.productDescription(),
      inStock: faker.datatype.boolean()
    }));
  }

  static getProfileExtensions() {
    return {
      fakeBio: faker.person.bio(),
      registeredAt: faker.date.past({ years: 2 }).toISOString(),
      avatar: faker.image.avatar(),
      socialMedia: {
        twitter: faker.internet.userName(),
        github: faker.internet.userName()
      }
    };
  }

  // ── Social Networking methods ───────────────────────────

  static getFeedPosts(count: number = 10): FeedPost[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      author: {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        headline: `${faker.person.jobTitle()} at ${faker.company.name()}`,
        avatar: faker.image.avatar(),
      },
      content: faker.lorem.paragraph({ min: 1, max: 4 }),
      image: faker.datatype.boolean({ probability: 0.4 })
        ? faker.image.urlPicsumPhotos({ width: 600, height: 400 })
        : undefined,
      likes: faker.number.int({ min: 0, max: 500 }),
      comments: faker.number.int({ min: 0, max: 80 }),
      shares: faker.number.int({ min: 0, max: 30 }),
      createdAt: faker.date.recent({ days: 7 }).toISOString(),
      liked: faker.datatype.boolean({ probability: 0.3 }),
    }));
  }

  static getConversations(count: number = 8): Conversation[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      participant: {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        avatar: faker.image.avatar(),
        headline: `${faker.person.jobTitle()} at ${faker.company.name()}`,
        online: faker.datatype.boolean({ probability: 0.3 }),
      },
      lastMessage: faker.lorem.sentence(),
      lastMessageTime: faker.date.recent({ days: 3 }).toISOString(),
      unreadCount: faker.number.int({ min: 0, max: 5 }),
    }));
  }

  static getMessages(conversationId: string, count: number = 15): Message[] {
    const partner = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      avatar: faker.image.avatar(),
      headline: `${faker.person.jobTitle()} at ${faker.company.name()}`,
      online: faker.datatype.boolean({ probability: 0.4 }),
    };
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      conversationId,
      sender: faker.datatype.boolean() ? partner : {
        id: 'current-user',
        name: 'You',
        avatar: '',
        headline: '',
        online: true,
      },
      content: faker.lorem.sentence({ min: 3, max: 15 }),
      timestamp: faker.date.recent({ days: 2 }).toISOString(),
      read: faker.datatype.boolean({ probability: 0.7 }),
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  static getConnections(count: number = 12): Connection[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      headline: `${faker.person.jobTitle()} at ${faker.company.name()}`,
      avatar: faker.image.avatar(),
      mutualConnections: faker.number.int({ min: 0, max: 50 }),
      connected: faker.datatype.boolean({ probability: 0.6 }),
      pendingRequest: faker.datatype.boolean({ probability: 0.15 }),
    }));
  }

  static getSuggestions(count: number = 6): Connection[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      headline: `${faker.person.jobTitle()} at ${faker.company.name()}`,
      avatar: faker.image.avatar(),
      mutualConnections: faker.number.int({ min: 1, max: 30 }),
      connected: false,
      pendingRequest: false,
    }));
  }

  static getNotifications(count: number = 10): Notification[] {
    const types: Notification['type'][] = ['like', 'comment', 'connection', 'message', 'job', 'mention'];
    return Array.from({ length: count }, () => {
      const type = faker.helpers.arrayElement(types);
      const actor = faker.person.fullName();
      const messages: Record<string, string> = {
        like: `${actor} liked your post`,
        comment: `${actor} commented on your post`,
        connection: `${actor} sent you a connection request`,
        message: `${actor} sent you a message`,
        job: `New job recommendation: ${faker.person.jobTitle()} at ${faker.company.name()}`,
        mention: `${actor} mentioned you in a comment`,
      };
      return {
        id: faker.string.uuid(),
        type,
        actor: { name: actor, avatar: faker.image.avatar() },
        message: messages[type],
        timestamp: faker.date.recent({ days: 5 }).toISOString(),
        read: faker.datatype.boolean({ probability: 0.5 }),
        link: '/feed',
      };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static getExtendedProfile(): UserProfileExtended {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      headline: `${faker.person.jobTitle()} at ${faker.company.name()}`,
      location: `${faker.location.city()}, ${faker.location.country()}`,
      avatar: faker.image.avatar(),
      coverImage: faker.image.urlPicsumPhotos({ width: 1200, height: 300 }),
      about: faker.lorem.paragraphs(2),
      connections: faker.number.int({ min: 50, max: 1500 }),
      experience: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => {
        const current = faker.datatype.boolean({ probability: 0.3 });
        return {
          title: faker.person.jobTitle(),
          company: faker.company.name(),
          location: `${faker.location.city()}, ${faker.location.country()}`,
          startDate: faker.date.past({ years: 8 }).toISOString(),
          endDate: current ? null : faker.date.past({ years: 2 }).toISOString(),
          current,
          description: faker.lorem.paragraph(),
        };
      }),
      education: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
        school: faker.company.name() + ' University',
        degree: faker.helpers.arrayElement(["Bachelor's", "Master's", 'PhD', 'MBA']),
        field: faker.helpers.arrayElement(['Computer Science', 'Business', 'Engineering', 'Mathematics', 'Finance']),
        startYear: faker.number.int({ min: 2005, max: 2015 }),
        endYear: faker.number.int({ min: 2016, max: 2023 }),
      })),
      skills: Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, () =>
        faker.helpers.arrayElement([
          'JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js', 'Python',
          'Java', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'SQL',
          'MongoDB', 'GraphQL', 'REST API', 'CI/CD', 'Agile', 'Scrum',
          'Machine Learning', 'DevOps', 'Microservices', 'Leadership',
        ])
      ),
    };
  }
}