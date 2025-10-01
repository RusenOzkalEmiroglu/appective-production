# 🪟 Modal ve Popup Rehberi - Interactive UI Components

## 📋 Genel Bakış

Bu dokümantasyon, modern web uygulamalarında modal, popup, dialog ve overlay bileşenlerinin tasarımı, implementasyonu ve kullanıcı deneyimi best practice'lerini içerir. Accessibility, performance ve UX odaklı yaklaşımlar sunar.

## 🎯 Modal Türleri ve Kullanım Alanları

### 1. Modal Kategorileri

#### Confirmation Modals (Onay Modalları)
```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel
}) => {
  const variantStyles = {
    danger: {
      icon: '⚠️',
      confirmButton: 'bg-red-600 hover:bg-red-700',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: '⚡',
      confirmButton: 'bg-orange-600 hover:bg-orange-700',
      iconColor: 'text-orange-600'
    },
    info: {
      icon: 'ℹ️',
      confirmButton: 'bg-blue-600 hover:bg-blue-700',
      iconColor: 'text-blue-600'
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4`}>
          <span className="text-2xl">{variantStyles[variant].icon}</span>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            className={variantStyles[variant].confirmButton}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

#### Form Modals (Form Modalları)
```typescript
interface FormModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  children: React.ReactNode;
  submitText?: string;
  loading?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  children,
  submitText = 'Save',
  loading = false
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setErrors(error.fieldErrors || {});
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
        </div>
        
        <div className="mb-6">
          {children}
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
```

#### Information Modals (Bilgi Modalları)
```typescript
const InformationModal: React.FC<{
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
}> = ({ isOpen, title, content, onClose, actions }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
        <InformationCircleIcon className="h-6 w-6 text-blue-600" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {title}
      </h3>
      
      <div className="text-sm text-gray-500 mb-6">
        {content}
      </div>
      
      {actions || (
        <Button onClick={onClose}>
          Got it
        </Button>
      )}
    </div>
  </Modal>
);
```

### 2. Specialized Modals

#### Image Gallery Modal
```typescript
const ImageGalleryModal: React.FC<{
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}> = ({ isOpen, images, currentIndex, onClose, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="fullscreen"
      className="bg-black bg-opacity-90"
    >
      <div className="relative h-full flex items-center justify-center">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Image */}
        <div className="relative max-w-full max-h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          )}
          
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Thumbnails */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                index === currentIndex ? 'border-white' : 'border-transparent opacity-60'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};
```

#### Video Modal
```typescript
const VideoModal: React.FC<{
  isOpen: boolean;
  videoUrl: string;
  title?: string;
  onClose: () => void;
}> = ({ isOpen, videoUrl, title, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full h-full"
          poster="/video-placeholder.jpg"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      
      {title && (
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
        </div>
      )}
    </Modal>
  );
};
```

## 🎨 Modal Base Component

### Core Modal Implementation
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    fullscreen: 'max-w-none w-full h-full m-0'
  };

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element in modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      // Return focus to previous element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap
  useEffect(() => {
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleTabKey);
    }

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        {/* Modal Content */}
        <motion.div
          ref={modalRef}
          className={`
            relative bg-white rounded-xl shadow-2xl 
            ${sizeClasses[size]} 
            ${size !== 'fullscreen' ? 'max-h-[90vh] overflow-y-auto' : ''} 
            ${className}
          `}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30,
            duration: 0.2 
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
```

## 🎭 Animation Patterns

### 1. Entry/Exit Animations

#### Slide Animations
```typescript
const slideAnimations = {
  slideUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 }
  },
  slideDown: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 }
  },
  slideRight: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  }
};
```

#### Scale Animations
```typescript
const scaleAnimations = {
  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  scaleDown: {
    initial: { opacity: 0, scale: 1.2 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 }
  },
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 15
      }
    },
    exit: { opacity: 0, scale: 0.3 }
  }
};
```

### 2. Staggered Animations

```typescript
const StaggeredModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  items: any[];
}> = ({ isOpen, onClose, items }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
          }
        }
      }}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="mb-4 p-4 bg-gray-50 rounded-lg"
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  </Modal>
);
```

## 🎪 Toast Notifications

### Toast System Implementation
```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    <AnimatePresence>
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </AnimatePresence>
  </div>
);

const ToastItem: React.FC<{
  toast: Toast;
  onRemove: () => void;
}> = ({ toast, onRemove }) => {
  const typeStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: '✅',
      iconColor: 'text-green-600'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: '❌',
      iconColor: 'text-red-600'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: '⚠️',
      iconColor: 'text-yellow-600'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'ℹ️',
      iconColor: 'text-blue-600'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        max-w-sm w-full shadow-lg rounded-lg pointer-events-auto 
        border ${typeStyles[toast.type].bg}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-xl">
              {typeStyles[toast.type].icon}
            </span>
          </div>
          
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {toast.title}
            </p>
            {toast.message && (
              <p className="mt-1 text-sm text-gray-500">
                {toast.message}
              </p>
            )}
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onRemove}
              className="rounded-md inline-flex text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
```

## 🎯 Tooltip System

### Advanced Tooltip Implementation
```typescript
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  arrow?: boolean;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500,
  arrow = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      calculatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Viewport boundary checks
    if (x < 8) x = 8;
    if (x + tooltipRect.width > viewportWidth - 8) {
      x = viewportWidth - tooltipRect.width - 8;
    }
    if (y < 8) y = 8;
    if (y + tooltipRect.height > viewportHeight - 8) {
      y = viewportHeight - tooltipRect.height - 8;
    }

    setTooltipPosition({ x, y });
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>

      {isVisible && createPortal(
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 
            rounded-lg shadow-lg pointer-events-none max-w-xs
            ${className}
          `}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y
          }}
        >
          {content}
          
          {arrow && (
            <div
              className={`
                absolute w-2 h-2 bg-gray-900 transform rotate-45
                ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
              `}
            />
          )}
        </motion.div>,
        document.body
      )}
    </>
  );
};
```

## 🎪 Dropdown ve Select Components

### Advanced Dropdown
```typescript
const Dropdown: React.FC<{
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  closeOnClick?: boolean;
}> = ({ 
  trigger, 
  children, 
  position = 'bottom-left', 
  closeOnClick = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const positionClasses = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2'
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 min-w-48 bg-white rounded-lg shadow-lg 
              border border-gray-200 py-1 ${positionClasses[position]}
            `}
            onClick={closeOnClick ? () => setIsOpen(false) : undefined}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}> = ({ children, onClick, disabled = false, icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      w-full text-left px-4 py-2 text-sm flex items-center gap-3
      ${disabled 
        ? 'text-gray-400 cursor-not-allowed' 
        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }
    `}
  >
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children}
  </button>
);
```

## 🔧 Accessibility Best Practices

### ARIA Implementation
```typescript
// Accessible modal with proper ARIA attributes
const AccessibleModal: React.FC<ModalProps & {
  ariaLabel?: string;
  ariaDescribedBy?: string;
}> = ({ ariaLabel, ariaDescribedBy, ...props }) => (
  <Modal
    {...props}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    role="dialog"
    aria-modal="true"
  >
    {props.children}
  </Modal>
);

// Screen reader announcements
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};
```

### Keyboard Navigation
```typescript
// Enhanced keyboard navigation
const useKeyboardNavigation = (
  items: any[], 
  onSelect: (item: any) => void,
  isOpen: boolean
) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0) {
            onSelect(items[focusedIndex]);
          }
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, focusedIndex, onSelect]);

  return focusedIndex;
};
```

---

## 📝 Modal Best Practices Checklist

### Design Guidelines
- [ ] **Clear Purpose**: Her modal'ın net bir amacı olmalı
- [ ] **Minimal Content**: Sadece gerekli bilgi gösterilmeli
- [ ] **Visual Hierarchy**: Önemli elementler vurgulanmalı
- [ ] **Consistent Styling**: Design system'e uygun olmalı

### Accessibility Requirements
- [ ] **Keyboard Navigation**: Tab, Enter, Escape desteği
- [ ] **Screen Reader**: ARIA labels ve descriptions
- [ ] **Focus Management**: Proper focus trap ve restoration
- [ ] **Color Contrast**: WCAG 2.1 AA compliance

### Performance Considerations
- [ ] **Lazy Loading**: Modal content lazy load edilmeli
- [ ] **Animation Performance**: GPU-accelerated animations
- [ ] **Memory Management**: Proper cleanup on unmount
- [ ] **Bundle Size**: Code splitting for large modals

### User Experience
- [ ] **Loading States**: Async operations için loading göstergesi
- [ ] **Error Handling**: Graceful error states
- [ ] **Confirmation**: Destructive actions için confirmation
- [ ] **Mobile Optimization**: Touch-friendly design

---

*Bu modal ve popup rehberi, modern web uygulamalarında interactive UI components için comprehensive bir guide'dır.*
