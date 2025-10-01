# 🎨 UI/UX Tasarım Rehberi - Modern Web Design

## 📋 Genel Bakış

Bu dokümantasyon, modern web uygulamaları için UI/UX tasarım prensiplerini, design system'leri ve kullanıcı deneyimi best practice'lerini içerir. Appective projesinin başarılı tasarım yaklaşımları temel alınarak hazırlanmıştır.

## 🎯 Tasarım Prensipleri

### 1. User-Centered Design

#### Kullanıcı Öncelikli Yaklaşım
```
Kullanıcı İhtiyaçları → Tasarım Kararları → Implementation → Test → İyileştirme
```

**Temel Prensipler:**
- **Empathy First**: Kullanıcı perspektifinden düşünme
- **Accessibility**: Herkes için erişilebilir tasarım
- **Usability**: Kolay ve sezgisel kullanım
- **Consistency**: Tutarlı deneyim
- **Feedback**: Anında geri bildirim

#### User Journey Mapping
```typescript
// User journey example
const userJourney = {
  awareness: {
    touchpoints: ['Landing page', 'Hero section'],
    emotions: ['Curious', 'Interested'],
    actions: ['Browse services', 'Read about company'],
    painPoints: ['Information overload', 'Slow loading']
  },
  consideration: {
    touchpoints: ['Services page', 'Portfolio'],
    emotions: ['Evaluating', 'Comparing'],
    actions: ['View projects', 'Check testimonials'],
    painPoints: ['Missing details', 'No clear CTA']
  },
  conversion: {
    touchpoints: ['Contact form', 'Quote request'],
    emotions: ['Confident', 'Ready'],
    actions: ['Fill form', 'Submit request'],
    painPoints: ['Complex form', 'No confirmation']
  }
};
```

### 2. Visual Hierarchy

#### Information Architecture
```css
/* Visual hierarchy implementation */
.heading-primary {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--primary);
}

.heading-secondary {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
}

.body-text {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.6;
  color: var(--text-secondary);
}

.caption {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--text-tertiary);
}
```

#### Z-Pattern ve F-Pattern Layout
```typescript
// Layout patterns for different content types
const layoutPatterns = {
  zPattern: {
    usage: 'Landing pages, hero sections',
    elements: ['Logo (top-left)', 'CTA (top-right)', 'Content (center)', 'Action (bottom-right)'],
    implementation: `
      .z-layout {
        display: grid;
        grid-template-areas: 
          "logo nav cta"
          "hero hero hero"
          "content content content"
          "action action action";
      }
    `
  },
  fPattern: {
    usage: 'Content-heavy pages, blogs',
    elements: ['Header bar', 'Content blocks', 'Sidebar'],
    implementation: `
      .f-layout {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-template-areas:
          "header header"
          "content sidebar"
          "content sidebar";
      }
    `
  }
};
```

### 3. Color Psychology ve Accessibility

#### Color System
```css
:root {
  /* Primary Colors - Brand Identity */
  --primary: #8A2BE2;          /* Purple - Innovation, Creativity */
  --primary-light: #9D4EDD;    /* Light Purple - Friendly, Approachable */
  --primary-dark: #6A0DAD;     /* Dark Purple - Premium, Professional */
  
  /* Secondary Colors - Supporting Palette */
  --secondary: #0EA5E9;        /* Blue - Trust, Reliability */
  --accent: #10B981;           /* Green - Success, Growth */
  --warning: #F59E0B;          /* Orange - Attention, Energy */
  --error: #EF4444;            /* Red - Error, Urgency */
  
  /* Neutral Colors - Content Hierarchy */
  --text-primary: #1F2937;     /* Dark Gray - Main content */
  --text-secondary: #6B7280;   /* Medium Gray - Supporting text */
  --text-tertiary: #9CA3AF;    /* Light Gray - Captions, labels */
  
  /* Background Colors */
  --bg-primary: #FFFFFF;       /* White - Main background */
  --bg-secondary: #F9FAFB;     /* Light Gray - Sections */
  --bg-tertiary: #F3F4F6;      /* Lighter Gray - Cards */
  
  /* Semantic Colors */
  --success: #10B981;
  --info: #3B82F6;
  --warning: #F59E0B;
  --danger: #EF4444;
}
```

#### Accessibility Compliance (WCAG 2.1 AA)
```css
/* Color contrast ratios */
.text-primary { color: var(--text-primary); } /* 4.5:1 ratio */
.text-secondary { color: var(--text-secondary); } /* 4.5:1 ratio */
.text-on-primary { color: white; } /* 4.5:1 on purple background */

/* Focus states for accessibility */
.focusable:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --primary: #000000;
    --text-primary: #000000;
    --bg-primary: #FFFFFF;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🎨 Design System

### 1. Typography System

#### Font Hierarchy
```css
/* Font families */
@font-face {
  font-family: 'Library 3 am';
  src: url('/fonts/Library-3-am.otf') format('opentype');
  font-display: swap;
}

.font-primary { font-family: 'Inter', system-ui, sans-serif; }
.font-display { font-family: 'Montserrat', sans-serif; }
.font-brand { font-family: 'Library 3 am', sans-serif; }

/* Type scale */
.text-xs { font-size: 0.75rem; line-height: 1rem; }      /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }  /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }     /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }  /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }   /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }      /* 24px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }   /* 36px */
.text-5xl { font-size: 3rem; line-height: 1; }           /* 48px */
.text-6xl { font-size: 3.75rem; line-height: 1; }        /* 60px */

/* Responsive typography */
.heading-hero {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.heading-section {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}
```

#### Reading Experience Optimization
```css
/* Optimal reading experience */
.prose {
  max-width: 65ch; /* Optimal line length */
  line-height: 1.6; /* Comfortable line spacing */
  font-size: 1.125rem; /* Readable font size */
  color: var(--text-primary);
}

.prose p + p {
  margin-top: 1.25em; /* Paragraph spacing */
}

.prose h2 {
  margin-top: 2em;
  margin-bottom: 0.75em;
  font-weight: 600;
}

.prose ul, .prose ol {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  padding-left: 1.5em;
}
```

### 2. Spacing System

#### Consistent Spacing Scale
```css
/* Spacing scale based on 4px grid */
:root {
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
  --space-32: 8rem;    /* 128px */
}

/* Component spacing */
.section-padding {
  padding-top: var(--space-16);
  padding-bottom: var(--space-16);
}

.container-padding {
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 768px) {
  .section-padding {
    padding-top: var(--space-24);
    padding-bottom: var(--space-24);
  }
  
  .container-padding {
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}
```

### 3. Component Library

#### Button System
```typescript
// Button component with variants
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-blue-600 focus:ring-secondary',
    ghost: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white',
    danger: 'bg-error text-white hover:bg-red-600 focus:ring-error'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </motion.button>
  );
};
```

#### Card System
```typescript
// Flexible card component
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick
}) => {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    outlined: 'bg-transparent border-2 border-primary',
    gradient: 'bg-gradient-to-br from-primary to-secondary text-white'
  };
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};
```

## 🎭 Animation ve Micro-interactions

### 1. Animation Principles

#### Disney's 12 Principles Applied to Web
```typescript
// Animation principles implementation
const animationPrinciples = {
  // 1. Squash and Stretch
  squashStretch: {
    hover: { scale: [1, 1.05, 1] },
    tap: { scale: [1, 0.95, 1] }
  },
  
  // 2. Anticipation
  anticipation: {
    beforeAction: { scale: 0.95, transition: { duration: 0.1 } },
    action: { scale: 1.1, transition: { duration: 0.2 } }
  },
  
  // 3. Staging (Clear presentation)
  staging: {
    focusElement: {
      scale: 1.05,
      boxShadow: '0 0 0 4px rgba(138, 43, 226, 0.2)',
      zIndex: 10
    }
  },
  
  // 4. Follow Through and Overlapping Action
  followThrough: {
    stagger: {
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  },
  
  // 5. Ease In and Ease Out
  easing: {
    natural: [0.25, 0.1, 0.25, 1], // Cubic bezier for natural feel
    bounce: [0.68, -0.55, 0.265, 1.55],
    smooth: [0.4, 0, 0.2, 1]
  }
};
```

#### Performance-Optimized Animations
```typescript
// GPU-accelerated animations
const performantAnimations = {
  // Use transform instead of changing layout properties
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  
  // Use opacity for fade effects
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  
  // Use scale for size changes
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  }
};

// Animation with will-change optimization
const OptimizedAnimation = ({ children }) => (
  <motion.div
    style={{ willChange: 'transform, opacity' }}
    initial="initial"
    animate="animate"
    variants={performantAnimations.slideIn}
  >
    {children}
  </motion.div>
);
```

### 2. Micro-interactions

#### Hover States
```css
/* Sophisticated hover effects */
.interactive-element {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.interactive-element::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.interactive-element:hover::before {
  left: 100%;
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

#### Loading States
```typescript
// Skeleton loading component
const SkeletonLoader = ({ width, height, className }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    style={{ width, height }}
  >
    <div className="shimmer-effect"></div>
  </div>
);

// Shimmer effect CSS
const shimmerCSS = `
  .shimmer-effect {
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.4) 50%, 
      transparent 100%
    );
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;
```

#### Success Feedback
```typescript
// Success animation component
const SuccessAnimation = ({ onComplete }) => (
  <motion.div
    className="success-checkmark"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ 
      type: 'spring', 
      stiffness: 300, 
      damping: 20,
      duration: 0.6
    }}
    onAnimationComplete={onComplete}
  >
    <motion.svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
    >
      <motion.circle
        cx="32"
        cy="32"
        r="30"
        stroke="#10B981"
        strokeWidth="4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M20 32l8 8 16-16"
        stroke="#10B981"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />
    </motion.svg>
  </motion.div>
);
```

## 📱 Responsive Design

### 1. Mobile-First Approach

#### Breakpoint System
```css
/* Mobile-first breakpoints */
:root {
  --breakpoint-sm: 640px;   /* Small devices */
  --breakpoint-md: 768px;   /* Medium devices */
  --breakpoint-lg: 1024px;  /* Large devices */
  --breakpoint-xl: 1280px;  /* Extra large devices */
  --breakpoint-2xl: 1536px; /* 2X large devices */
}

/* Mobile-first media queries */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}
```

#### Touch-Friendly Design
```css
/* Touch target optimization */
.touch-target {
  min-height: 44px; /* iOS minimum */
  min-width: 44px;
  padding: 12px 16px;
  margin: 8px;
}

/* Touch feedback */
.touch-feedback {
  -webkit-tap-highlight-color: rgba(138, 43, 226, 0.2);
  user-select: none;
  touch-action: manipulation;
}

/* Prevent zoom on input focus (iOS) */
input, select, textarea {
  font-size: 16px; /* Prevents zoom on iOS */
}
```

### 2. Adaptive Components

#### Responsive Navigation
```typescript
// Adaptive navigation component
const ResponsiveNavigation = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <nav className="navigation">
      {isMobile ? (
        <MobileNavigation 
          isOpen={isMenuOpen} 
          onToggle={() => setIsMenuOpen(!isMenuOpen)} 
        />
      ) : (
        <DesktopNavigation />
      )}
    </nav>
  );
};
```

#### Responsive Images
```typescript
// Responsive image component
const ResponsiveImage = ({ src, alt, sizes }) => (
  <picture>
    <source
      media="(min-width: 1024px)"
      srcSet={`${src}?w=1200 1x, ${src}?w=2400 2x`}
    />
    <source
      media="(min-width: 768px)"
      srcSet={`${src}?w=800 1x, ${src}?w=1600 2x`}
    />
    <img
      src={`${src}?w=400`}
      srcSet={`${src}?w=400 1x, ${src}?w=800 2x`}
      alt={alt}
      sizes={sizes}
      loading="lazy"
      className="responsive-image"
    />
  </picture>
);
```

## 🎪 Layout Patterns

### 1. Grid Systems

#### CSS Grid Layout
```css
/* Flexible grid system */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

/* Named grid areas */
.page-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 250px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* Responsive grid areas */
@media (max-width: 768px) {
  .page-layout {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

#### Flexbox Utilities
```css
/* Flexbox utility classes */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-evenly { justify-content: space-evenly; }

.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.items-stretch { align-items: stretch; }
.items-baseline { align-items: baseline; }

.flex-1 { flex: 1 1 0%; }
.flex-auto { flex: 1 1 auto; }
.flex-initial { flex: 0 1 auto; }
.flex-none { flex: none; }
```

### 2. Container Queries (Future-Ready)

```css
/* Container queries for component-based responsive design */
.card-container {
  container-type: inline-size;
}

@container (min-width: 300px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}

@container (min-width: 500px) {
  .card {
    padding: 2rem;
  }
  
  .card-image {
    width: 40%;
  }
  
  .card-content {
    width: 60%;
  }
}
```

## 🎨 Visual Effects

### 1. Modern CSS Effects

#### Glassmorphism
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

#### Neumorphism
```css
.neomorphism {
  background: #f0f0f0;
  border-radius: 20px;
  box-shadow: 
    20px 20px 60px #d1d1d1,
    -20px -20px 60px #ffffff;
}

.neomorphism-inset {
  background: #f0f0f0;
  border-radius: 20px;
  box-shadow: 
    inset 20px 20px 60px #d1d1d1,
    inset -20px -20px 60px #ffffff;
}
```

#### Gradient Effects
```css
/* Animated gradients */
.animated-gradient {
  background: linear-gradient(-45deg, #8A2BE2, #0EA5E9, #10B981, #F59E0B);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Text gradients */
.gradient-text {
  background: linear-gradient(135deg, #8A2BE2, #0EA5E9);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}
```

### 2. SVG Animations

#### Icon Animations
```typescript
// Animated SVG icon component
const AnimatedIcon = ({ isActive, size = 24 }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <motion.path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      initial={{ pathLength: 0, fill: 'none' }}
      animate={{ 
        pathLength: isActive ? 1 : 0,
        fill: isActive ? '#F59E0B' : 'none'
      }}
      transition={{ duration: 0.5 }}
    />
  </motion.svg>
);
```

#### Loading Animations
```typescript
// SVG loading spinner
const LoadingSpinner = ({ size = 40, color = '#8A2BE2' }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="31.416"
    >
      <animate
        attributeName="stroke-dasharray"
        dur="2s"
        values="0 31.416;15.708 15.708;0 31.416"
        repeatCount="indefinite"
      />
      <animate
        attributeName="stroke-dashoffset"
        dur="2s"
        values="0;-15.708;-31.416"
        repeatCount="indefinite"
      />
    </circle>
  </motion.svg>
);
```

---

## 📝 Design System Maintenance

### Documentation Standards
- **Component Documentation**: Props, usage examples, variants
- **Design Tokens**: Colors, typography, spacing values
- **Pattern Library**: Reusable design patterns
- **Accessibility Guidelines**: WCAG compliance checklist

### Version Control
- **Semantic Versioning**: Major.Minor.Patch for design system
- **Change Logs**: Detailed change documentation
- **Migration Guides**: Upgrade instructions
- **Deprecation Notices**: Advance warning for changes

---

*Bu UI/UX tasarım rehberi, modern web uygulamaları için comprehensive bir design system ve best practices koleksiyonudur.*
