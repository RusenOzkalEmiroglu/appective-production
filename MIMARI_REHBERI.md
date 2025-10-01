# 🏗️ Mimari Rehberi - Modern Web Uygulaması

## 📋 Genel Mimari Bakış

Bu dokümantasyon, Appective projesinin mimari yapısını ve gelecekteki projeler için mimari kararları içerir.

## 🎯 Mimari Prensipler

### 1. Modüler Yapı
- **Separation of Concerns** - Her bileşenin tek sorumluluğu
- **Component-Based Architecture** - Yeniden kullanılabilir bileşenler
- **Layered Architecture** - Katmanlı mimari yaklaşımı

### 2. Scalability (Ölçeklenebilirlik)
- **Horizontal Scaling** - Yatay ölçekleme desteği
- **Code Splitting** - Kod parçalama
- **Lazy Loading** - Gecikmeli yükleme

### 3. Performance First
- **Server-Side Rendering** - Sunucu tarafı rendering
- **Static Generation** - Statik sayfa üretimi
- **Edge Computing** - Kenar hesaplama

## 🏛️ Katmanlı Mimari

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│         (React Components)          │
├─────────────────────────────────────┤
│            Business Logic           │
│         (Custom Hooks & Utils)      │
├─────────────────────────────────────┤
│             API Layer               │
│         (Next.js API Routes)        │
├─────────────────────────────────────┤
│            Data Layer               │
│      (Supabase & MongoDB)           │
└─────────────────────────────────────┘
```

## 📁 Dizin Yapısı ve Sorumluluklar

### `/src/app` - Next.js App Router
```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Ana sayfa
├── admin/                 # Admin paneli rotaları
│   ├── layout.tsx
│   └── page.tsx
├── api/                   # API endpoints
│   ├── auth/
│   ├── services/
│   ├── partners/
│   └── ...
└── [dynamic]/             # Dinamik rotalar
```

**Sorumluluklar:**
- Routing ve navigation
- Layout yönetimi
- API endpoint tanımları
- Metadata yönetimi

### `/src/components` - UI Bileşenleri
```
components/
├── ui/                    # Temel UI bileşenleri
├── admin/                 # Admin özel bileşenleri
├── forms/                 # Form bileşenleri
├── layout/                # Layout bileşenleri
└── feature/               # Özellik bazlı bileşenler
```

**Sorumluluklar:**
- Kullanıcı arayüzü
- Etkileşim mantığı
- State yönetimi (local)
- Animasyonlar

### `/src/lib` - Utility Katmanı
```
lib/
├── auth.ts               # Authentication logic
├── supabase.ts           # Supabase client
├── mongodb.ts            # MongoDB connection
├── data.ts               # Data fetching utilities
└── session.ts            # Session management
```

**Sorumluluklar:**
- Veritabanı bağlantıları
- Authentication logic
- Utility fonksiyonları
- Configuration management

### `/src/data` - Veri Katmanı
```
data/
├── types.ts              # Type definitions
├── projects.ts           # Project data
├── services.ts           # Service data
└── *.json               # Static data files
```

**Sorumluluklar:**
- Type definitions
- Static data management
- Data transformation
- Mock data

## 🔄 Veri Akışı Mimarisi

### 1. Client-Side Data Flow
```
Component → Custom Hook → API Call → Database → Response → State Update → Re-render
```

### 2. Server-Side Data Flow
```
Request → API Route → Database Query → Data Processing → Response → Client
```

### 3. Authentication Flow
```
Login → NextAuth → Session Creation → Protected Route Access → API Authorization
```

## 🗄️ Database Mimarisi

### Supabase (PostgreSQL) - Ana Veritabanı
```sql
-- Örnek tablo yapıları
services (
  id: uuid PRIMARY KEY,
  name: varchar,
  description: text,
  folder_name: varchar,
  icon: varchar,
  image_url: varchar,
  created_at: timestamp,
  updated_at: timestamp
)

partners (
  id: uuid PRIMARY KEY,
  category_id: uuid REFERENCES partner_categories(id),
  name: varchar,
  logo_url: varchar,
  website_url: varchar
)
```

### MongoDB - Yardımcı Veritabanı
```javascript
// Örnek schema yapıları
const NewsletterSchema = {
  email: String,
  subscribedAt: Date,
  isActive: Boolean
}

const JobApplicationSchema = {
  jobId: ObjectId,
  applicantInfo: Object,
  cvPath: String,
  status: String
}
```

## 🔐 Güvenlik Mimarisi

### Authentication Katmanları
1. **NextAuth.js** - Session management
2. **Iron Session** - Secure session storage
3. **Supabase Auth** - User authentication
4. **API Route Protection** - Endpoint güvenliği

### Authorization Stratejisi
```typescript
// Middleware pattern
export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return handler(req, res);
  };
}
```

## 🎨 UI/UX Mimarisi

### Component Hierarchy
```
App
├── Layout
│   ├── Header
│   ├── Navigation
│   └── Footer
├── Pages
│   ├── Hero
│   ├── Services
│   ├── WorkShowcase
│   └── Contact
└── Modals/Overlays
```

### State Management Strategi
- **Local State** - useState, useReducer
- **Server State** - SWR, React Query (önerilir)
- **Global State** - Context API, Zustand (gerekirse)

### Animation Architecture
```typescript
// Framer Motion variants pattern
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};
```

## 🚀 Performance Mimarisi

### Rendering Stratejileri
1. **SSG** - Static Generation (landing pages)
2. **SSR** - Server-Side Rendering (dynamic content)
3. **CSR** - Client-Side Rendering (interactive features)
4. **ISR** - Incremental Static Regeneration (hybrid)

### Caching Layers
```
CDN → Next.js Cache → API Cache → Database Cache
```

### Code Splitting Strategy
```typescript
// Route-based splitting
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <Spinner />,
  ssr: false
});

// Component-based splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

## 📡 API Mimarisi

### RESTful API Design
```
GET    /api/services          # Tüm servisleri getir
POST   /api/services          # Yeni servis oluştur
GET    /api/services/:id      # Belirli servisi getir
PUT    /api/services/:id      # Servisi güncelle
DELETE /api/services/:id      # Servisi sil
```

### Error Handling Pattern
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Business logic
    const result = await processRequest(req);
    return res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

## 🔄 Event-Driven Architecture

### Custom Events
```typescript
// Event system for component communication
const useEventBus = () => {
  const emit = (event: string, data: any) => {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  };
  
  const listen = (event: string, callback: (data: any) => void) => {
    const handler = (e: CustomEvent) => callback(e.detail);
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  };
  
  return { emit, listen };
};
```

## 📱 Responsive Architecture

### Breakpoint Strategy
```typescript
const breakpoints = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)'
};

// Hook for responsive behavior
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(breakpoints.mobile);
    setIsMobile(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return { isMobile };
};
```

## 🧪 Testing Architecture

### Test Pyramid
```
┌─────────────────┐
│   E2E Tests     │  ← Cypress
├─────────────────┤
│ Integration     │  ← React Testing Library
├─────────────────┤
│  Unit Tests     │  ← Jest
└─────────────────┘
```

### Testing Strategies
- **Unit Tests** - Utility fonksiyonları, hooks
- **Integration Tests** - Component interactions
- **E2E Tests** - User journeys

## 🔧 Configuration Architecture

### Environment Management
```typescript
// config/index.ts
export const config = {
  database: {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    },
    mongodb: {
      uri: process.env.MONGODB_URI!
    }
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET!
  }
};
```

## 📊 Monitoring Architecture

### Logging Strategy
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta);
    // Send to monitoring service
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service
  }
};
```

## 🚀 Deployment Architecture

### Vercel Deployment Strategy
```yaml
# vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

## 🎯 Gelecek Projeler İçin Mimari Öneriler

### 1. Microservices Hazırlığı
- API Gateway pattern
- Service mesh architecture
- Event-driven communication

### 2. Advanced State Management
- Redux Toolkit (complex state)
- Zustand (simple global state)
- Jotai (atomic state)

### 3. Real-time Features
- WebSocket integration
- Server-Sent Events
- Supabase Realtime

### 4. Advanced Caching
- Redis integration
- Service Worker caching
- GraphQL with Apollo Client

### 5. Monitoring ve Observability
- OpenTelemetry integration
- Custom metrics
- Performance monitoring

---

*Bu mimari rehberi, ölçeklenebilir ve maintainable web uygulamaları geliştirmek için kanıtlanmış patternleri içerir.*
