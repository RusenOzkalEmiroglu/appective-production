# 🤖 Prompt Stratejileri ve AI İşbirliği Rehberi

## 📋 Genel Bakış

Bu dokümantasyon, Appective projesinde başarılı olan prompt stratejilerini, AI ile etkili işbirliği yöntemlerini ve gelecekteki projeler için önerilen yaklaşımları içerir.

## 🎯 Başarılı Prompt Stratejileri

### 1. Proje Başlangıcı İçin Etkili Promptlar

#### Comprehensive Project Setup
```
Prompt Örneği:
"Next.js 14, TypeScript, Tailwind CSS ve Supabase kullanarak modern bir dijital ajans websitesi oluşturmak istiyorum. 

Gereksinimler:
- Responsive tasarım
- Admin paneli
- Animasyonlar (Framer Motion)
- Database entegrasyonu
- Modern UI/UX

Lütfen proje yapısını, temel konfigürasyonları ve başlangıç bileşenlerini oluştur."
```

**Neden Başarılı:**
- Spesifik teknolojiler belirtilmiş
- Net gereksinimler tanımlanmış
- Kapsamlı ama odaklanmış talep

#### Component Development Prompts
```
Prompt Örneği:
"Bir ServiceCard bileşeni oluştur:

Özellikler:
- TypeScript ile type-safe
- Framer Motion animasyonları
- Hover efektleri
- Responsive tasarım
- Tailwind CSS styling
- Gradient backgrounds
- Click handler support

Props: service object, onClick function, index number"
```

### 2. Problem Çözme Promptları

#### Debugging ve Optimization
```
Prompt Örneği:
"Bu React bileşeninde performans problemi var. Component her render'da yeniden oluşturuluyor:

[Kod bloğu]

Lütfen:
1. Performans problemlerini tespit et
2. React.memo, useMemo, useCallback optimizasyonları uygula
3. Best practices açıkla
4. Optimize edilmiş versiyonu sağla"
```

#### Complex Feature Implementation
```
Prompt Örneği:
"Bir image magnifier component'i geliştirmek istiyorum:

Gereksinimler:
- Mouse hover ile zoom efekti
- Smooth cursor tracking
- Responsive behavior
- TypeScript support
- Performance optimized

Lütfen complete implementation ve usage examples sağla."
```

### 3. Architecture ve Design Promptları

#### System Architecture
```
Prompt Örneği:
"Modern web uygulaması için scalable architecture tasarla:

Teknolojiler: Next.js, Supabase, MongoDB
Gereksinimler: 
- Modular structure
- Type safety
- Performance optimization
- Security best practices

Lütfen folder structure, data flow, ve best practices öner."
```

#### Database Design
```
Prompt Örneği:
"Dijital ajans websitesi için database schema tasarla:

Entities: Services, Partners, Team Members, Projects, Job Openings
İlişkiler: One-to-many, many-to-many relationships
Platform: Supabase (PostgreSQL)

Lütfen SQL schema, TypeScript types ve API patterns sağla."
```

## 🔄 Iterative Development Approach

### 1. Incremental Feature Building

#### Step-by-Step Development
```
1. İlk Prompt: "Temel ServiceCard component oluştur"
2. İkinci Prompt: "Animasyonlar ekle (Framer Motion)"
3. Üçüncü Prompt: "Responsive design optimize et"
4. Dördüncü Prompt: "Performance optimizasyonları uygula"
5. Beşinci Prompt: "Accessibility features ekle"
```

**Avantajları:**
- Her adımda kontrol ve gözden geçirme
- Gradual complexity increase
- Better understanding ve learning
- Easier debugging

#### Refinement Process
```
Prompt Örneği:
"Önceki ServiceCard implementasyonunu geliştir:

Mevcut kod: [kod bloğu]

İyileştirmeler:
- Loading states ekle
- Error handling geliştir
- Animation performance optimize et
- TypeScript types güçlendir
- Accessibility artır"
```

### 2. Code Review ve Optimization

#### Code Quality Improvement
```
Prompt Örneği:
"Bu kodu review et ve iyileştir:

[Kod bloğu]

Lütfen kontrol et:
- TypeScript best practices
- React performance patterns
- Code readability
- Security considerations
- Maintainability

Önerilerle birlikte improved version sağla."
```

#### Refactoring Requests
```
Prompt Örneği:
"Bu component'i modern React patterns ile refactor et:

[Eski kod]

Hedefler:
- Custom hooks kullan
- Composition pattern uygula
- Memoization optimize et
- Props interface iyileştir
- Reusability artır"
```

## 🎨 UI/UX Development Prompts

### 1. Design System Creation

#### Component Library Building
```
Prompt Örneği:
"Consistent design system için base components oluştur:

Gerekli Components:
- Button (variants: primary, secondary, ghost)
- Card (with gradient options)
- Modal (with animations)
- Form elements (Input, Select, Textarea)

Her component için:
- TypeScript interfaces
- Tailwind CSS styling
- Framer Motion animations
- Responsive behavior"
```

#### Animation System
```
Prompt Örneği:
"Reusable animation library oluştur:

Animation Types:
- Page transitions
- Component entrance/exit
- Hover effects
- Loading states
- Micro-interactions

Framer Motion variants kullanarak consistent animation system tasarla."
```

### 2. Responsive Design Prompts

#### Mobile-First Development
```
Prompt Örneği:
"Bu desktop component'i mobile-first approach ile responsive yap:

[Component kodu]

Gereksinimler:
- Mobile: Stack layout
- Tablet: 2-column grid
- Desktop: 4-column grid
- Touch-friendly interactions
- Performance optimized"
```

#### Cross-Browser Compatibility
```
Prompt Örneği:
"Bu CSS/JavaScript kodu için cross-browser compatibility sağla:

[Kod bloğu]

Desteklenmesi gereken browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

Fallbacks ve polyfills ekle."
```

## 🔧 Technical Implementation Prompts

### 1. API Development

#### RESTful API Design
```
Prompt Örneği:
"Services management için complete API system tasarla:

Endpoints:
- GET /api/services (list with pagination)
- GET /api/services/:id (single service)
- POST /api/services (create)
- PUT /api/services/:id (update)
- DELETE /api/services/:id (delete)

Her endpoint için:
- TypeScript types
- Input validation
- Error handling
- Authentication
- Response formatting"
```

#### Database Integration
```
Prompt Örneği:
"Supabase ile type-safe database operations oluştur:

Table: services
Operations: CRUD
Features:
- Row Level Security
- Real-time subscriptions
- File upload handling
- Optimistic updates

TypeScript types ve React hooks sağla."
```

### 2. Performance Optimization

#### Bundle Optimization
```
Prompt Örneği:
"Next.js uygulaması için comprehensive performance optimization:

Hedefler:
- Bundle size < 200KB
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

Optimizasyon teknikleri:
- Code splitting
- Image optimization
- Font loading
- Caching strategies"
```

#### Memory Management
```
Prompt Örneği:
"React uygulamasında memory leaks önle:

Problem alanları:
- Event listeners
- Timers/intervals
- Subscriptions
- Large objects

Cleanup strategies ve best practices sağla."
```

## 🔐 Security ve Quality Prompts

### 1. Security Implementation

#### Authentication System
```
Prompt Örneği:
"Secure authentication system implement et:

Features:
- JWT tokens
- Session management
- Password hashing
- Rate limiting
- CSRF protection

NextAuth.js ve Supabase kullanarak complete solution."
```

#### Input Validation
```
Prompt Örneği:
"Comprehensive input validation system:

Validation layers:
- Client-side (Zod)
- Server-side (API routes)
- Database constraints
- Sanitization

XSS ve SQL injection prevention ile."
```

### 2. Testing Strategies

#### Test Implementation
```
Prompt Örneği:
"Complete testing strategy implement et:

Test types:
- Unit tests (Jest)
- Component tests (React Testing Library)
- Integration tests
- E2E tests (Cypress)

Her component için test examples sağla."
```

#### Quality Assurance
```
Prompt Örneği:
"Code quality tools setup et:

Tools:
- ESLint configuration
- Prettier setup
- Husky pre-commit hooks
- TypeScript strict mode
- SonarQube integration

Complete configuration files sağla."
```

## 📊 Analytics ve Monitoring Prompts

### 1. Performance Monitoring

#### Web Vitals Tracking
```
Prompt Örneği:
"Web Vitals monitoring system implement et:

Metrics:
- Core Web Vitals (LCP, FID, CLS)
- Custom metrics
- User experience tracking
- Performance budgets

Real-time monitoring ve alerting ile."
```

#### Error Tracking
```
Prompt Örneği:
"Comprehensive error tracking system:

Features:
- Client-side error boundary
- Server-side error handling
- User feedback collection
- Error categorization
- Performance impact analysis

Sentry integration ile complete solution."
```

### 2. User Analytics

#### Behavior Tracking
```
Prompt Örneği:
"User behavior analytics implement et:

Tracking points:
- Page views
- Click events
- Form submissions
- User journeys
- Conversion funnels

Privacy-compliant implementation."
```

## 🎯 Advanced Prompting Techniques

### 1. Context-Rich Prompts

#### Providing Complete Context
```
Etkili Prompt Yapısı:

1. Background: "Mevcut proje durumu..."
2. Objective: "Hedeflenen sonuç..."
3. Constraints: "Teknik kısıtlamalar..."
4. Requirements: "Spesifik gereksinimler..."
5. Expected Output: "Beklenen çıktı formatı..."
```

#### Code Context Sharing
```
Prompt Template:

"Mevcut kod yapısı:
[Relevant code snippets]

Problem:
[Specific issue description]

Hedef:
[Desired outcome]

Kısıtlamalar:
[Technical constraints]

Lütfen step-by-step solution sağla."
```

### 2. Collaborative Development

#### Pair Programming Approach
```
Prompt Örneği:
"Pair programming session başlatalım:

Feature: User authentication
Approach: TDD (Test-Driven Development)

1. Önce test cases yazalım
2. Minimum viable implementation
3. Refactor ve optimize
4. Edge cases handle et

Her adımda code review yapalım."
```

#### Knowledge Transfer
```
Prompt Örneği:
"Bu complex feature'ı açıkla ve dokümante et:

[Code implementation]

Lütfen sağla:
- Architecture explanation
- Design decisions rationale
- Usage examples
- Maintenance guidelines
- Future enhancement possibilities"
```

## 🔄 Feedback Loop Optimization

### 1. Iterative Improvement

#### Continuous Refinement
```
Feedback Cycle:

1. Initial Implementation
2. Test ve Review
3. Feedback Collection
4. Refinement Prompt
5. Improved Version
6. Validation
7. Documentation Update
```

#### Version Comparison
```
Prompt Örneği:
"Bu iki implementation'ı karşılaştır:

Version 1: [kod]
Version 2: [kod]

Karşılaştırma kriterleri:
- Performance
- Maintainability
- Readability
- Scalability
- Security

Hangi approach daha iyi ve neden?"
```

### 2. Learning Integration

#### Knowledge Building
```
Prompt Örneği:
"Bu implementation'dan öğrenilen lessons learned:

[Code example]

Lütfen analiz et:
- Best practices used
- Potential improvements
- Reusable patterns
- Common pitfalls avoided
- Future applications"
```

## 🎯 Gelecek Projeler İçin Prompt Önerileri

### 1. Project Planning Prompts

#### Comprehensive Project Setup
```
Template:
"[Proje türü] için complete development plan oluştur:

Tech Stack: [teknolojiler]
Timeline: [süre]
Team Size: [kişi sayısı]
Budget: [bütçe]

Lütfen sağla:
- Architecture design
- Development phases
- Risk assessment
- Resource allocation
- Quality gates"
```

### 2. Advanced Feature Development

#### Complex System Design
```
Template:
"[Feature adı] için scalable system tasarla:

Requirements: [gereksinimler]
Constraints: [kısıtlamalar]
Performance targets: [hedefler]

Lütfen include et:
- System architecture
- Database design
- API specifications
- Security considerations
- Testing strategy"
```

### 3. Maintenance ve Scaling

#### System Evolution
```
Template:
"Mevcut sistemi [yeni gereksinim] için evolve et:

Current state: [mevcut durum]
New requirements: [yeni gereksinimler]
Migration constraints: [kısıtlamalar]

Lütfen plan et:
- Migration strategy
- Backward compatibility
- Performance impact
- Risk mitigation
- Rollback plan"
```

---

*Bu prompt stratejileri rehberi, AI ile etkili işbirliği yaparak kaliteli yazılım geliştirmek için kanıtlanmış yöntemleri içerir.*
