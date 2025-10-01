# ⭐ En İyi Uygulamalar Rehberi - Modern Web Development

## 📋 Genel Bakış

Bu dokümantasyon, Appective projesinde uygulanan en iyi pratikleri ve gelecekteki projeler için önerilen yaklaşımları içerir.

## 🎯 Kod Kalitesi ve Standartlar

### 1. TypeScript Best Practices

#### Strict Type Checking
```typescript
// ✅ İyi - Strict typing
interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  folderName: string;
  imageUrl: string;
}

// ❌ Kötü - Any kullanımı
const service: any = fetchService();
```

#### Type Guards ve Validation
```typescript
// ✅ İyi - Type guard kullanımı
function isServiceCategory(obj: unknown): obj is ServiceCategory {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    typeof (obj as ServiceCategory).id === 'string'
  );
}

// API response validation
const validateApiResponse = (data: unknown): ServiceCategory[] => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format');
  }
  
  return data.filter(isServiceCategory);
};
```

#### Generic Types
```typescript
// ✅ İyi - Generic hook
function useApi<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Implementation...
  
  return { data, loading, error };
}
```

### 2. React Component Best Practices

#### Component Composition
```typescript
// ✅ İyi - Composition pattern
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => (
  <div className={`card ${className}`} onClick={onClick}>
    {children}
  </div>
);

// Usage
<Card className="service-card" onClick={handleClick}>
  <CardHeader title="Service" />
  <CardContent>Content here</CardContent>
</Card>
```

#### Custom Hooks
```typescript
// ✅ İyi - Custom hook for reusable logic
const useServiceData = () => {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setServices(validateApiResponse(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refetch: fetchServices };
};
```

#### Memoization Strategies
```typescript
// ✅ İyi - Proper memoization
const ServiceCard = React.memo<ServiceCardProps>(({ 
  service, 
  onClick, 
  index 
}) => {
  const gradient = useMemo(() => getCardGradient(index), [index]);
  
  const handleClick = useCallback(() => {
    onClick(service);
  }, [service, onClick]);

  return (
    <motion.div
      className={`card ${gradient}`}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
    >
      {/* Card content */}
    </motion.div>
  );
});

ServiceCard.displayName = 'ServiceCard';
```

### 3. Performance Optimization

#### Image Optimization
```typescript
// ✅ İyi - Next.js Image component
import Image from 'next/image';

const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width: number;
  height: number;
}> = ({ src, alt, width, height }) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    priority={false}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
);
```

#### Code Splitting
```typescript
// ✅ İyi - Dynamic imports
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// Component-level splitting
const HeavyChart = lazy(() => 
  import('./HeavyChart').then(module => ({ 
    default: module.HeavyChart 
  }))
);
```

#### Bundle Analysis
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Next.js config
});
```

## 🎨 UI/UX Best Practices

### 1. Responsive Design

#### Mobile-First Approach
```css
/* ✅ İyi - Mobile first */
.container {
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
  
  @media (min-width: 1024px) {
    padding: 3rem;
  }
}
```

#### Flexible Grid Systems
```typescript
// ✅ İyi - Responsive grid
const ResponsiveGrid: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
    {children}
  </div>
);
```

### 2. Animation Best Practices

#### Framer Motion Patterns
```typescript
// ✅ İyi - Reusable animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Usage
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  {items.map((item, index) => (
    <motion.div key={item.id} variants={fadeInUp}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

#### Performance-Conscious Animations
```typescript
// ✅ İyi - GPU-accelerated animations
const optimizedAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 0.3,
    ease: "easeInOut"
  }
};

// ❌ Kötü - Layout-triggering animations
const badAnimation = {
  width: [100, 120, 100],
  height: [100, 120, 100]
};
```

### 3. Accessibility (A11y)

#### Semantic HTML
```typescript
// ✅ İyi - Semantic structure
const Navigation: React.FC = () => (
  <nav role="navigation" aria-label="Main navigation">
    <ul>
      {menuItems.map(item => (
        <li key={item.id}>
          <Link 
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);
```

#### Keyboard Navigation
```typescript
// ✅ İyi - Keyboard support
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus trap implementation
      const focusableElements = modal.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Implementation...
};
```

## 🔐 Security Best Practices

### 1. Input Validation

#### Client-Side Validation
```typescript
// ✅ İyi - Zod validation
import { z } from 'zod';

const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

const useContactForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (data: Partial<ContactFormData>) => {
    try {
      ContactFormSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };
  
  return { validate, errors };
};
```

#### Server-Side Validation
```typescript
// ✅ İyi - API route validation
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate input
    const validatedData = ContactFormSchema.parse(req.body);
    
    // Sanitize input
    const sanitizedData = {
      name: validatedData.name.trim(),
      email: validatedData.email.toLowerCase().trim(),
      message: validatedData.message.trim()
    };
    
    // Process request
    await processContactForm(sanitizedData);
    
    res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 2. Authentication & Authorization

#### Protected API Routes
```typescript
// ✅ İyi - Middleware pattern
import { withAuth } from '@/lib/withAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Protected logic here
  const user = req.user; // Added by middleware
  
  if (!user.isAdmin) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  // Admin-only logic
}

export default withAuth(handler);
```

#### Session Management
```typescript
// ✅ İyi - Secure session handling
import { getIronSession } from 'iron-session';

export const getSession = (req: NextApiRequest, res: NextApiResponse) => {
  return getIronSession(req, res, {
    password: process.env.SESSION_SECRET!,
    cookieName: 'app-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }
  });
};
```

## 📊 Data Management Best Practices

### 1. API Design

#### RESTful Conventions
```typescript
// ✅ İyi - RESTful API structure
// GET /api/services - List all services
// GET /api/services/:id - Get specific service
// POST /api/services - Create new service
// PUT /api/services/:id - Update service
// DELETE /api/services/:id - Delete service

// Consistent response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const createApiResponse = <T>(
  data?: T, 
  error?: string, 
  message?: string
): ApiResponse<T> => ({
  success: !error,
  data,
  error,
  message
});
```

#### Error Handling
```typescript
// ✅ İyi - Centralized error handling
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleApiError = (error: unknown, res: NextApiResponse) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
  
  console.error('Unexpected error:', error);
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

### 2. Database Best Practices

#### Supabase Patterns
```typescript
// ✅ İyi - Type-safe database operations
import { Database } from '@/types/supabase';

type Service = Database['public']['Tables']['services']['Row'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

class ServiceRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(error.message, 500);
    return data || [];
  }

  async create(service: ServiceInsert): Promise<Service> {
    const { data, error } = await this.supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) throw new ApiError(error.message, 400);
    return data;
  }
}
```

#### Connection Management
```typescript
// ✅ İyi - Connection pooling
let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
}
```

## 🚀 Performance Best Practices

### 1. Rendering Optimization

#### Server Components vs Client Components
```typescript
// ✅ İyi - Server component for static content
// app/services/page.tsx
import { getServices } from '@/lib/services';

export default async function ServicesPage() {
  const services = await getServices(); // Server-side fetch
  
  return (
    <div>
      <h1>Our Services</h1>
      <ServicesList services={services} />
    </div>
  );
}

// ✅ İyi - Client component for interactivity
'use client';

import { useState } from 'react';

export function ServicesList({ services }: { services: Service[] }) {
  const [filter, setFilter] = useState('');
  
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <>
      <input 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter services..."
      />
      {filteredServices.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </>
  );
}
```

### 2. Caching Strategies

#### API Route Caching
```typescript
// ✅ İyi - Response caching
export async function GET() {
  const services = await getServices();
  
  return NextResponse.json(services, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

#### Client-Side Caching
```typescript
// ✅ İyi - SWR for client-side caching
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useServices() {
  const { data, error, mutate } = useSWR('/api/services', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000 // 1 minute
  });

  return {
    services: data,
    loading: !error && !data,
    error,
    refresh: mutate
  };
}
```

## 🧪 Testing Best Practices

### 1. Unit Testing

#### Component Testing
```typescript
// ✅ İyi - Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceCard } from '@/components/ServiceCard';

const mockService = {
  id: '1',
  name: 'Web Development',
  description: 'Custom web solutions',
  icon: '🌐',
  folderName: 'web-dev',
  imageUrl: '/images/web-dev.png'
};

describe('ServiceCard', () => {
  it('renders service information correctly', () => {
    const onClickMock = jest.fn();
    
    render(
      <ServiceCard 
        service={mockService} 
        onClick={onClickMock} 
        index={0} 
      />
    );
    
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Custom web solutions')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClickMock = jest.fn();
    
    render(
      <ServiceCard 
        service={mockService} 
        onClick={onClickMock} 
        index={0} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClickMock).toHaveBeenCalledWith(mockService);
  });
});
```

### 2. API Testing

#### API Route Testing
```typescript
// ✅ İyi - API test
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/services';

describe('/api/services', () => {
  it('returns services list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('success', true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

## 📈 Monitoring ve Logging

### 1. Error Tracking

#### Client-Side Error Boundary
```typescript
// ✅ İyi - Error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to error tracking service
    if (typeof window !== 'undefined') {
      // Sentry, LogRocket, etc.
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Performance Monitoring

#### Web Vitals Tracking
```typescript
// ✅ İyi - Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to analytics service
  console.log(metric);
}

// Track Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 🎯 Gelecek Projeler İçin Öneriler

### 1. Code Quality Tools
- **ESLint** - Kod kalitesi kontrolü
- **Prettier** - Kod formatlama
- **Husky** - Git hooks
- **Lint-staged** - Staged dosyalar için linting

### 2. Testing Strategy
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Cypress** - E2E testing
- **MSW** - API mocking

### 3. Performance Tools
- **Lighthouse CI** - Performance monitoring
- **Bundle Analyzer** - Bundle size analysis
- **Web Vitals** - Core metrics tracking

### 4. Security Tools
- **OWASP ZAP** - Security testing
- **Snyk** - Dependency vulnerability scanning
- **SonarQube** - Code security analysis

---

*Bu en iyi uygulamalar rehberi, sürdürülebilir ve kaliteli kod yazmak için kanıtlanmış yöntemleri içerir.*
