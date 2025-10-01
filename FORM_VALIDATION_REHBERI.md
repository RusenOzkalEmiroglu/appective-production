# 📝 Form ve Validation Rehberi - Interactive Forms

## 📋 Genel Bakış

Bu dokümantasyon, modern web uygulamalarında form tasarımı, validation, user experience ve accessibility best practice'lerini içerir. React Hook Form, Zod validation ve advanced form patterns odaklıdır.

## 🎯 Form Design Principles

### 1. User-Centered Form Design

#### Cognitive Load Reduction
```typescript
// Progressive disclosure pattern
const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    { id: 1, title: 'Personal Info', fields: ['firstName', 'lastName', 'email'] },
    { id: 2, title: 'Company Details', fields: ['company', 'position', 'website'] },
    { id: 3, title: 'Preferences', fields: ['newsletter', 'notifications'] },
    { id: 4, title: 'Review', fields: [] }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }`}
            >
              {currentStep > step.id ? '✓' : step.id}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent(currentStep)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
```

#### Visual Hierarchy in Forms
```css
/* Form visual hierarchy */
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-section-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-field:last-child {
  margin-bottom: 0;
}
```

### 2. Input Field Design

#### Comprehensive Input Component
```typescript
interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  icon,
  value,
  onChange,
  onBlur,
  validation
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputId = `input-${name}`;
  const errorId = `error-${name}`;
  const helperId = `helper-${name}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Real-time validation
    if (validation) {
      if (validation.pattern && !validation.pattern.test(newValue)) {
        // Pattern validation feedback
      }
      if (validation.maxLength && newValue.length > validation.maxLength) {
        return; // Prevent input
      }
    }
    
    onChange?.(newValue);
  };

  return (
    <div className="form-field">
      {/* Label */}
      <label 
        htmlFor={inputId}
        className={`block text-sm font-medium mb-2 transition-colors
          ${error ? 'text-red-600' : 'text-gray-700'}
          ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''}
        `}
      >
        {label}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          aria-invalid={!!error}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
          className={`
            w-full px-4 py-3 border rounded-lg transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${type === 'password' ? 'pr-10' : ''}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
            ${disabled 
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
              : 'bg-white text-gray-900'
            }
            focus:outline-none focus:ring-2
          `}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        )}

        {/* Character Count */}
        {validation?.maxLength && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
            {value?.length || 0}/{validation.maxLength}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <motion.p
          id={errorId}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-600 flex items-center gap-1"
        >
          <ExclamationCircleIcon className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
};
```

#### Specialized Input Components

##### Phone Number Input
```typescript
const PhoneInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}> = ({ label, value, onChange, error }) => {
  const [country, setCountry] = useState('US');
  
  const formatPhoneNumber = (input: string) => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, '');
    
    // Format based on country
    if (country === 'US') {
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
    
    return numbers;
  };

  return (
    <div className="form-field">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="flex">
        {/* Country Selector */}
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-sm"
        >
          <option value="US">🇺🇸 +1</option>
          <option value="TR">🇹🇷 +90</option>
          <option value="GB">🇬🇧 +44</option>
        </select>
        
        {/* Phone Input */}
        <input
          type="tel"
          value={formatPhoneNumber(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder="(555) 123-4567"
          className={`
            flex-1 px-4 py-3 border rounded-r-lg
            ${error ? 'border-red-300' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-blue-200
          `}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

##### File Upload Component
```typescript
const FileUpload: React.FC<{
  label: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFilesChange: (files: File[]) => void;
  error?: string;
}> = ({ 
  label, 
  accept = '*', 
  multiple = false, 
  maxSize = 10,
  onFilesChange,
  error 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const newFiles = Array.from(fileList).filter(file => {
      // Size validation
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return false;
      }
      return true;
    });
    
    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="form-field">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-blue-600 hover:text-blue-500">
            Click to upload
          </span>
          {' '}or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          {accept !== '*' && `${accept.toUpperCase()} files, `}
          up to {maxSize}MB each
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <DocumentIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

## 🔍 Validation System

### 1. Zod Schema Validation

#### Comprehensive Validation Schema
```typescript
import { z } from 'zod';

// Custom validation functions
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits');

// Main form schema
const contactFormSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),
  
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  phone: phoneSchema.optional(),
  
  // Company Information
  company: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  
  position: z
    .string()
    .min(2, 'Position must be at least 2 characters')
    .max(100, 'Position must be less than 100 characters'),
  
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  
  // Project Details
  projectType: z.enum(['web-development', 'mobile-app', 'digital-marketing', 'consulting'], {
    errorMap: () => ({ message: 'Please select a project type' })
  }),
  
  budget: z.enum(['5k-10k', '10k-25k', '25k-50k', '50k+'], {
    errorMap: () => ({ message: 'Please select a budget range' })
  }),
  
  timeline: z.enum(['asap', '1-3-months', '3-6-months', '6+ months'], {
    errorMap: () => ({ message: 'Please select a timeline' })
  }),
  
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  
  // File uploads
  attachments: z
    .array(z.instanceof(File))
    .max(5, 'Maximum 5 files allowed')
    .optional(),
  
  // Agreements
  newsletter: z.boolean().optional(),
  
  privacy: z
    .boolean()
    .refine(val => val === true, 'You must accept the privacy policy'),
  
  terms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms of service')
});

// Conditional validation
const conditionalSchema = contactFormSchema.superRefine((data, ctx) => {
  // If project type is consulting, budget is required
  if (data.projectType === 'consulting' && !data.budget) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Budget is required for consulting projects',
      path: ['budget']
    });
  }
  
  // If timeline is ASAP, add warning
  if (data.timeline === 'asap') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Rush projects may incur additional costs',
      path: ['timeline'],
      fatal: false // Warning, not error
    });
  }
});

type ContactFormData = z.infer<typeof contactFormSchema>;
```

### 2. React Hook Form Integration

#### Form Hook with Validation
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const useContactForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, dirtyFields },
    watch,
    setValue,
    trigger,
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange', // Validate on change
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      website: '',
      message: '',
      newsletter: false,
      privacy: false,
      terms: false
    }
  });

  // Real-time validation for specific fields
  const watchedFields = watch(['email', 'phone', 'website']);
  
  useEffect(() => {
    // Debounced validation for expensive operations
    const timeoutId = setTimeout(() => {
      if (watchedFields[0]) trigger('email'); // Validate email
      if (watchedFields[1]) trigger('phone'); // Validate phone
      if (watchedFields[2]) trigger('website'); // Validate website
    }, 300);

    return () => clearTimeout(timeoutId);
  }, watchedFields);

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Transform data before submission
      const transformedData = {
        ...data,
        email: data.email.toLowerCase(),
        phone: data.phone?.replace(/\D/g, ''), // Remove formatting
        attachments: data.attachments?.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      };

      // Submit to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData)
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      // Success handling
      reset();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    isValid,
    dirtyFields,
    setValue,
    watch,
    reset
  };
};
```

#### Form Component Implementation
```typescript
const ContactForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    isValid
  } = useContactForm();

  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const onSubmit = async (data: ContactFormData) => {
    const result = await handleSubmit(data);
    
    if (result.success) {
      setSubmitStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.'
      });
    } else {
      setSubmitStatus({
        type: 'error',
        message: result.error || 'Something went wrong. Please try again.'
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Personal Information Section */}
      <div className="form-section">
        <h3 className="form-section-title">Personal Information</h3>
        <p className="form-section-description">
          Tell us about yourself so we can get in touch.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                label="First Name"
                {...field}
                error={errors.firstName?.message}
                required
              />
            )}
          />
          
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                label="Last Name"
                {...field}
                error={errors.lastName?.message}
                required
              />
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                label="Email Address"
                type="email"
                {...field}
                error={errors.email?.message}
                required
                icon={<EnvelopeIcon className="w-5 h-5" />}
              />
            )}
          />
          
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label="Phone Number"
                {...field}
                error={errors.phone?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Company Information Section */}
      <div className="form-section">
        <h3 className="form-section-title">Company Information</h3>
        <p className="form-section-description">
          Help us understand your business context.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="company"
            control={control}
            render={({ field }) => (
              <Input
                label="Company Name"
                {...field}
                error={errors.company?.message}
                required
              />
            )}
          />
          
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <Input
                label="Your Position"
                {...field}
                error={errors.position?.message}
                required
              />
            )}
          />
        </div>
        
        <Controller
          name="website"
          control={control}
          render={({ field }) => (
            <Input
              label="Company Website"
              type="url"
              {...field}
              error={errors.website?.message}
              placeholder="https://example.com"
              helperText="Optional: Your company's website URL"
            />
          )}
        />
      </div>

      {/* Project Details Section */}
      <div className="form-section">
        <h3 className="form-section-title">Project Details</h3>
        <p className="form-section-description">
          Tell us about your project requirements.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="projectType"
            control={control}
            render={({ field }) => (
              <Select
                label="Project Type"
                {...field}
                error={errors.projectType?.message}
                required
                options={[
                  { value: 'web-development', label: 'Web Development' },
                  { value: 'mobile-app', label: 'Mobile App' },
                  { value: 'digital-marketing', label: 'Digital Marketing' },
                  { value: 'consulting', label: 'Consulting' }
                ]}
              />
            )}
          />
          
          <Controller
            name="budget"
            control={control}
            render={({ field }) => (
              <Select
                label="Budget Range"
                {...field}
                error={errors.budget?.message}
                required
                options={[
                  { value: '5k-10k', label: '$5K - $10K' },
                  { value: '10k-25k', label: '$10K - $25K' },
                  { value: '25k-50k', label: '$25K - $50K' },
                  { value: '50k+', label: '$50K+' }
                ]}
              />
            )}
          />
          
          <Controller
            name="timeline"
            control={control}
            render={({ field }) => (
              <Select
                label="Timeline"
                {...field}
                error={errors.timeline?.message}
                required
                options={[
                  { value: 'asap', label: 'ASAP' },
                  { value: '1-3-months', label: '1-3 Months' },
                  { value: '3-6-months', label: '3-6 Months' },
                  { value: '6+ months', label: '6+ Months' }
                ]}
              />
            )}
          />
        </div>
        
        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Project Description"
              {...field}
              error={errors.message?.message}
              required
              rows={5}
              placeholder="Please describe your project requirements, goals, and any specific features you need..."
              helperText="Minimum 10 characters, maximum 1000 characters"
            />
          )}
        />
        
        <Controller
          name="attachments"
          control={control}
          render={({ field }) => (
            <FileUpload
              label="Project Files"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              multiple
              maxSize={10}
              onFilesChange={field.onChange}
              error={errors.attachments?.message}
            />
          )}
        />
      </div>

      {/* Agreements Section */}
      <div className="form-section">
        <h3 className="form-section-title">Preferences & Agreements</h3>
        
        <div className="space-y-4">
          <Controller
            name="newsletter"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Subscribe to our newsletter for updates and insights"
                {...field}
              />
            )}
          />
          
          <Controller
            name="privacy"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={
                  <span>
                    I agree to the{' '}
                    <a href="/privacy-policy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                }
                {...field}
                error={errors.privacy?.message}
                required
              />
            )}
          />
          
          <Controller
            name="terms"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={
                  <span>
                    I agree to the{' '}
                    <a href="/terms-of-service" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>
                  </span>
                }
                {...field}
                error={errors.terms?.message}
                required
              />
            )}
          />
        </div>
      </div>

      {/* Submit Status */}
      {submitStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            submitStatus.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {submitStatus.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5" />
            )}
            {submitStatus.message}
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
          className="min-w-32"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
};
```

## 🎨 Advanced Form Patterns

### 1. Dynamic Form Fields

#### Conditional Field Rendering
```typescript
const DynamicForm: React.FC = () => {
  const { control, watch } = useForm();
  const projectType = watch('projectType');
  const hasExistingWebsite = watch('hasExistingWebsite');

  return (
    <form>
      {/* Base Fields */}
      <Controller
        name="projectType"
        control={control}
        render={({ field }) => (
          <Select
            label="Project Type"
            {...field}
            options={projectTypeOptions}
          />
        )}
      />

      {/* Conditional Fields Based on Project Type */}
      {projectType === 'web-development' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Controller
            name="hasExistingWebsite"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Do you have an existing website?"
                {...field}
                options={[
                  { value: 'yes', label: 'Yes, redesign existing' },
                  { value: 'no', label: 'No, build from scratch' }
                ]}
              />
            )}
          />

          {hasExistingWebsite === 'yes' && (
            <Controller
              name="currentWebsite"
              control={control}
              render={({ field }) => (
                <Input
                  label="Current Website URL"
                  type="url"
                  {...field}
                />
              )}
            />
          )}
        </motion.div>
      )}

      {projectType === 'mobile-app' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Controller
            name="platforms"
            control={control}
            render={({ field }) => (
              <CheckboxGroup
                label="Target Platforms"
                {...field}
                options={[
                  { value: 'ios', label: 'iOS' },
                  { value: 'android', label: 'Android' },
                  { value: 'web', label: 'Web App' }
                ]}
              />
            )}
          />
        </motion.div>
      )}
    </form>
  );
};
```

#### Field Array Management
```typescript
const TeamMembersForm: React.FC = () => {
  const { control, watch } = useForm({
    defaultValues: {
      teamMembers: [{ name: '', email: '', role: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'teamMembers'
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Team Members</h3>
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ name: '', email: '', role: '' })}
        >
          Add Member
        </Button>
      </div>

      <AnimatePresence>
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Member {index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name={`teamMembers.${index}.name`}
                control={control}
                render={({ field }) => (
                  <Input
                    label="Full Name"
                    {...field}
                    required
                  />
                )}
              />

              <Controller
                name={`teamMembers.${index}.email`}
                control={control}
                render={({ field }) => (
                  <Input
                    label="Email"
                    type="email"
                    {...field}
                    required
                  />
                )}
              />

              <Controller
                name={`teamMembers.${index}.role`}
                control={control}
                render={({ field }) => (
                  <Select
                    label="Role"
                    {...field}
                    required
                    options={[
                      { value: 'developer', label: 'Developer' },
                      { value: 'designer', label: 'Designer' },
                      { value: 'manager', label: 'Project Manager' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                )}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
```

### 2. Real-time Validation Feedback

#### Live Validation Indicators
```typescript
const LiveValidationInput: React.FC<{
  name: string;
  label: string;
  validation: (value: string) => Promise<boolean>;
}> = ({ name, label, validation }) => {
  const [value, setValue] = useState('');
  const [validationState, setValidationState] = useState<{
    status: 'idle' | 'validating' | 'valid' | 'invalid';
    message?: string;
  }>({ status: 'idle' });

  const debouncedValidation = useMemo(
    () => debounce(async (val: string) => {
      if (!val) {
        setValidationState({ status: 'idle' });
        return;
      }

      setValidationState({ status: 'validating' });
      
      try {
        const isValid = await validation(val);
        setValidationState({
          status: isValid ? 'valid' : 'invalid',
          message: isValid ? 'Looks good!' : 'This value is not available'
        });
      } catch (error) {
        setValidationState({
          status: 'invalid',
          message: 'Validation failed'
        });
      }
    }, 500),
    [validation]
  );

  useEffect(() => {
    debouncedValidation(value);
  }, [value, debouncedValidation]);

  const getValidationIcon = () => {
    switch (validationState.status) {
      case 'validating':
        return <Spinner className="w-4 h-4 text-gray-400" />;
      case 'valid':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="form-field">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`
            w-full px-4 py-3 pr-10 border rounded-lg transition-all
            ${validationState.status === 'valid' 
              ? 'border-green-300 focus:border-green-500 focus:ring-green-200' 
              : validationState.status === 'invalid'
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
            focus:outline-none focus:ring-2
          `}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>
      
      {validationState.message && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-1 text-sm ${
            validationState.status === 'valid' 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}
        >
          {validationState.message}
        </motion.p>
      )}
    </div>
  );
};
```

## 🎯 Form Accessibility

### ARIA Implementation
```typescript
const AccessibleForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;

  return (
    <form
      role="form"
      aria-label="Contact form"
      aria-describedby="form-description"
    >
      {/* Form Description */}
      <div id="form-description" className="sr-only">
        Multi-step contact form with {totalSteps} steps. 
        Currently on step {currentStep + 1} of {totalSteps}.
      </div>

      {/* Progress Indicator */}
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
        className="mb-8"
      >
        {/* Progress visual */}
      </div>

      {/* Form Fields with Proper ARIA */}
      <fieldset>
        <legend className="text-lg font-medium mb-4">
          Personal Information
        </legend>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2">
              First Name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              aria-required="true"
              aria-describedby="firstName-error firstName-help"
              aria-invalid={!!errors.firstName}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <div id="firstName-help" className="text-sm text-gray-500 mt-1">
              Enter your first name as it appears on official documents
            </div>
            {errors.firstName && (
              <div
                id="firstName-error"
                role="alert"
                className="text-sm text-red-600 mt-1"
              >
                {errors.firstName.message}
              </div>
            )}
          </div>
        </div>
      </fieldset>

      {/* Live Region for Dynamic Updates */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="form-status"
      >
        {/* Dynamic status updates */}
      </div>
    </form>
  );
};
```

### Keyboard Navigation
```typescript
const useFormKeyboardNavigation = (formRef: RefObject<HTMLFormElement>) => {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Get all focusable elements
      const focusableElements = form.querySelectorAll(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
      );
      
      const focusableArray = Array.from(focusableElements) as HTMLElement[];
      const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = Math.min(currentIndex + 1, focusableArray.length - 1);
          focusableArray[nextIndex]?.focus();
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = Math.max(currentIndex - 1, 0);
          focusableArray[prevIndex]?.focus();
          break;
          
        case 'Enter':
          // Handle form submission or field activation
          if (document.activeElement?.tagName === 'BUTTON') {
            // Let button handle its own click
            return;
          }
          
          // Move to next field for other elements
          e.preventDefault();
          const nextFieldIndex = Math.min(currentIndex + 1, focusableArray.length - 1);
          focusableArray[nextFieldIndex]?.focus();
          break;
      }
    };

    form.addEventListener('keydown', handleKeyDown);
    return () => form.removeEventListener('keydown', handleKeyDown);
  }, [formRef]);
};
```

---

## 📝 Form Best Practices Checklist

### Design Guidelines
- [ ] **Clear Labels**: Descriptive and concise field labels
- [ ] **Logical Grouping**: Related fields grouped together
- [ ] **Visual Hierarchy**: Important fields emphasized
- [ ] **Progress Indication**: Multi-step forms show progress

### Validation Standards
- [ ] **Real-time Feedback**: Immediate validation on blur/change
- [ ] **Clear Error Messages**: Specific and actionable errors
- [ ] **Success Indicators**: Positive feedback for valid inputs
- [ ] **Accessibility**: Screen reader compatible validation

### User Experience
- [ ] **Auto-save**: Draft saving for long forms
- [ ] **Smart Defaults**: Pre-filled reasonable values
- [ ] **Conditional Logic**: Show/hide relevant fields
- [ ] **Mobile Optimization**: Touch-friendly inputs

### Performance
- [ ] **Debounced Validation**: Avoid excessive API calls
- [ ] **Lazy Loading**: Load validation rules on demand
- [ ] **Optimistic Updates**: Immediate UI feedback
- [ ] **Error Recovery**: Graceful error handling

---

*Bu form ve validation rehberi, modern web uygulamalarında user-friendly ve accessible form experiences için comprehensive bir guide'dır.*
