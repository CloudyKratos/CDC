
interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'course' | 'tool';
  author: string;
  tags: string[];
  duration: string;
  views: number;
  rating: number;
  url: string;
}

export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Mastering React Hooks',
    description: 'Learn how to use React hooks to manage state and side effects in your functional components.',
    type: 'video',
    author: 'John Doe',
    tags: ['react', 'hooks', 'javascript'],
    duration: '2 hours',
    views: 1234,
    rating: 4.5,
    url: 'https://example.com/react-hooks'
  },
  {
    id: '2',
    title: 'The Ultimate Guide to CSS Grid',
    description: 'A comprehensive guide to CSS Grid, covering everything from basic concepts to advanced techniques.',
    type: 'article',
    author: 'Jane Smith',
    tags: ['css', 'grid', 'layout'],
    duration: '15 minutes',
    views: 5678,
    rating: 4.8,
    url: 'https://example.com/css-grid'
  },
  {
    id: '3',
    title: 'Node.js for Beginners',
    description: 'Get started with Node.js and learn how to build server-side applications with JavaScript.',
    type: 'course',
    author: 'David Johnson',
    tags: ['node.js', 'javascript', 'backend'],
    duration: '4 hours',
    views: 9012,
    rating: 4.2,
    url: 'https://example.com/node-js'
  },
  {
    id: '4',
    title: 'Figma for UI Design',
    description: 'Learn how to use Figma to create beautiful and functional user interfaces.',
    type: 'tool',
    author: 'Emily Brown',
    tags: ['figma', 'ui', 'design'],
    duration: '30 minutes',
    views: 3456,
    rating: 4.7,
    url: 'https://example.com/figma'
  },
  {
    id: '5',
    title: 'Vue.js Crash Course',
    description: 'A quick and easy introduction to Vue.js, the progressive JavaScript framework.',
    type: 'video',
    author: 'Michael Green',
    tags: ['vue.js', 'javascript', 'frontend'],
    duration: '1.5 hours',
    views: 6789,
    rating: 4.6,
    url: 'https://example.com/vue-js'
  },
  {
    id: '6',
    title: 'JavaScript Design Patterns',
    description: 'Explore common design patterns in JavaScript and learn how to apply them to your projects.',
    type: 'article',
    author: 'Sarah White',
    tags: ['javascript', 'design patterns', 'programming'],
    duration: '20 minutes',
    views: 2345,
    rating: 4.9,
    url: 'https://example.com/javascript-patterns'
  },
  {
    id: '7',
    title: 'React Native Mobile Development',
    description: 'Build native mobile apps with JavaScript and React Native.',
    type: 'course',
    author: 'Robert Black',
    tags: ['react native', 'mobile', 'javascript'],
    duration: '6 hours',
    views: 7890,
    rating: 4.3,
    url: 'https://example.com/react-native'
  },
  {
    id: '8',
    title: 'Sketch for UX Design',
    description: 'Learn how to use Sketch to create user-centered designs.',
    type: 'tool',
    author: 'Jessica Gray',
    tags: ['sketch', 'ux', 'design'],
    duration: '45 minutes',
    views: 4567,
    rating: 4.4,
    url: 'https://example.com/sketch'
  }
];

export const resourceTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
  { value: 'course', label: 'Course' },
  { value: 'tool', label: 'Tool' }
];
