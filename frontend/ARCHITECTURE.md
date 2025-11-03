# TutorHub Frontend Architecture

## Refactored Structure

```
/app/frontend/src/
├── api/                      # API client and service functions
│   └── axios.js             # Axios configuration
│
├── components/              # Reusable components
│   ├── ui/                  # Shadcn UI components (pre-built)
│   ├── shared/              # Custom shared components
│   │   ├── Layout.jsx
│   │   ├── ChangePasswordModal.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── NextClassCard.jsx
│   │   ├── StatusBadge.jsx
│   │   └── CountdownTimer.jsx
│   └── reusable/            # Tailwind-based reusable components
│       ├── Card.jsx
│       ├── DataTable.jsx
│       ├── FormInput.jsx
│       ├── Modal.jsx
│       ├── Button.jsx
│       └── Badge.jsx
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.js           # Authentication hook
│   ├── useForm.js           # Form management hook
│   ├── useApi.js            # API calls hook
│   └── useToast.js          # Toast notifications hook
│
├── pages/                   # Application pages
│   ├── auth/                # Authentication pages
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── admin/               # Admin dashboard pages
│   │   ├── Dashboard.jsx
│   │   ├── Batches.jsx
│   │   ├── Students.jsx
│   │   ├── Payments.jsx
│   │   ├── Tutors.jsx
│   │   ├── Enquiries.jsx
│   │   ├── Invites.jsx
│   │   └── Schedule.jsx
│   ├── tutor/               # Tutor dashboard pages
│   │   ├── Dashboard.jsx
│   │   ├── BatchesList.jsx
│   │   ├── StudentsList.jsx
│   │   ├── Classes.jsx
│   │   └── Materials.jsx
│   ├── student/             # Student dashboard pages
│   │   ├── Dashboard.jsx
│   │   ├── Homework.jsx
│   │   ├── Materials.jsx
│   │   └── Payments.jsx
│   └── shared/              # Shared pages (used by multiple roles)
│       └── BatchDetails.jsx
│
├── services/                # Business logic and API services
│   ├── authService.js       # Authentication API calls
│   ├── batchService.js      # Batch API calls
│   ├── studentService.js    # Student API calls
│   ├── paymentService.js    # Payment API calls
│   └── classService.js      # Class API calls
│
├── store/                   # Global state management (Zustand)
│   ├── authStore.js         # Authentication state
│   ├── batchStore.js        # Batch data state
│   └── uiStore.js           # UI state (modals, loading)
│
├── styles/                  # Organized styles
│   ├── components/          # Component-specific styles
│   ├── pages/               # Page-specific styles
│   ├── utilities.css        # Utility classes
│   └── themes.css           # Theme variables
│
├── utils/                   # Utility functions
│   ├── classHelpers.js      # Class status helpers
│   ├── dateFormatters.js    # Date formatting utilities
│   ├── validators.js        # Form validation
│   └── constants.js         # App constants
│
├── App.jsx                  # Main app component with routing
├── App.css                  # Global application styles
├── index.js                 # React entry point
└── index.css                # Global CSS and Tailwind imports
```

## Tailwind Design System

### Color Palette (Reusable Classes)

```css
/* Primary Colors */
.bg-primary { @apply bg-indigo-600; }
.bg-primary-hover { @apply bg-indigo-700; }
.text-primary { @apply text-indigo-600; }

/* Secondary Colors */
.bg-secondary { @apply bg-gray-600; }
.text-secondary { @apply text-gray-600; }

/* Status Colors */
.bg-success { @apply bg-green-500; }
.bg-warning { @apply bg-yellow-500; }
.bg-error { @apply bg-red-500; }
.bg-info { @apply bg-blue-500; }

/* Text Colors */
.text-success { @apply text-green-600; }
.text-warning { @apply text-yellow-600; }
.text-error { @apply text-red-600; }
.text-info { @apply text-blue-600; }
```

### Spacing System (Consistent Padding/Margin)

```css
/* Container Spacing */
.container-padding { @apply px-4 py-6 md:px-6 md:py-8; }
.section-spacing { @apply mb-6 md:mb-8; }
.card-padding { @apply p-4 md:p-6; }

/* Element Spacing */
.form-field-spacing { @apply mb-4; }
.button-spacing { @apply px-4 py-2; }
.input-spacing { @apply px-3 py-2; }
```

### Typography System

```css
/* Headings */
.heading-xl { @apply text-3xl font-bold text-gray-900; }
.heading-lg { @apply text-2xl font-bold text-gray-900; }
.heading-md { @apply text-xl font-semibold text-gray-900; }
.heading-sm { @apply text-lg font-medium text-gray-900; }

/* Body Text */
.body-text { @apply text-base text-gray-700; }
.body-text-sm { @apply text-sm text-gray-600; }
.caption-text { @apply text-xs text-gray-500; }

/* Labels */
.form-label { @apply text-sm font-medium text-gray-700 mb-1; }
```

### Component Classes (Reusable)

```css
/* Cards */
.card-base {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.card-interactive {
  @apply card-base transition-all duration-200 hover:shadow-md hover:border-indigo-300 cursor-pointer;
}

/* Buttons */
.btn-primary {
  @apply bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors duration-200;
}

.btn-danger {
  @apply bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200;
}

/* Form Elements */
.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all;
}

.form-textarea {
  @apply form-input min-h-[100px] resize-y;
}

.form-select {
  @apply form-input cursor-pointer;
}

/* Badges */
.badge-base {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.badge-success { @apply badge-base bg-green-100 text-green-800; }
.badge-warning { @apply badge-base bg-yellow-100 text-yellow-800; }
.badge-error { @apply badge-base bg-red-100 text-red-800; }
.badge-info { @apply badge-base bg-blue-100 text-blue-800; }

/* Tables */
.table-container {
  @apply overflow-x-auto rounded-lg border border-gray-200;
}

.table-base {
  @apply min-w-full divide-y divide-gray-200;
}

.table-header {
  @apply bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3;
}

.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
}

.table-row-hover {
  @apply hover:bg-gray-50 transition-colors;
}
```

## Reusable Component Library

### 1. Card Component

```jsx
// components/reusable/Card.jsx
import React from 'react';

export const Card = ({
  children,
  onClick,
  className = '',
  interactive = false
}) => {
  const baseClasses = interactive ? 'card-interactive' : 'card-base';
  
  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 px-6 py-4 ${className}`}>
    {children}
  </div>
);
```

### 2. DataTable Component

```jsx
// components/reusable/DataTable.jsx
import React from 'react';

export const DataTable = ({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available'
}) => {
  return (
    <div className="table-container">
      <table className="table-base">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="table-header">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={onRowClick ? 'table-row-hover cursor-pointer' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="table-cell">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
```

### 3. FormInput Component

```jsx
// components/reusable/FormInput.jsx
import React from 'react';

export const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  icon: Icon,
  ...props
}) => {
  return (
    <div className="form-field-spacing">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${Icon ? 'pl-10' : ''} ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

### 4. Button Component

```jsx
// components/reusable/Button.jsx
import React from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'hover:bg-gray-100 text-gray-700',
  link: 'text-indigo-600 hover:text-indigo-700 underline'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variantClass} ${sizeClass} inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Loading...
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
};
```

### 5. StatusBadge Component

```jsx
// components/reusable/StatusBadge.jsx
import React from 'react';

const statusStyles = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  default: 'badge-base bg-gray-100 text-gray-800'
};

export const StatusBadge = ({
  status,
  label,
  className = ''
}) => {
  const badgeClass = statusStyles[status] || statusStyles.default;
  
  return (
    <span className={`${badgeClass} ${className}`}>
      {label || status}
    </span>
  );
};
```

## Custom Hooks

### useApi Hook

```jsx
// hooks/useApi.js
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFunction, options = {}) => {
    const {
      onSuccess,
      onError,
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operation successful',
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};
```

### useForm Hook

```jsx
// hooks/useForm.js
import { useState, useCallback } from 'react';

export const useForm = (initialValues, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  const validate = useCallback(() => {
    if (!validationSchema) return true;
    
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validationSchema).forEach(field => {
      const rules = validationSchema[field];
      const value = values[field];
      
      if (rules.required && !value) {
        newErrors[field] = `${field} is required`;
        isValid = false;
      }
      
      if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `${field} must be at least ${rules.minLength} characters`;
        isValid = false;
      }
      
      if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.message || `Invalid ${field}`;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [values, validationSchema]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setValues,
    setErrors
  };
};
```

## Page Component Structure

Each page should follow this structure:

```jsx
// pages/admin/Students.jsx
import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { DataTable } from '@/components/reusable/DataTable';
import { Button } from '@/components/reusable/Button';
import { Card } from '@/components/reusable/Card';
import Layout from '@/components/shared/Layout';
import { studentService } from '@/services/studentService';

export default function Students() {
  // State management
  const [students, setStudents] = useState([]);
  const { loading, execute } = useApi();
  
  // Data fetching
  useEffect(() => {
    fetchStudents();
  }, []);
  
  const fetchStudents = async () => {
    await execute(
      () => studentService.getAllStudents(),
      {
        onSuccess: (data) => setStudents(data),
        showErrorToast: true
      }
    );
  };
  
  // Table configuration
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Status',
      accessor: 'payment_status',
      render: (row) => (
        <StatusBadge
          status={row.payment_status === 'paid' ? 'success' : 'warning'}
          label={row.payment_status}
        />
      )
    }
  ];
  
  // Render
  return (
    <Layout>
      <div className="container-padding">
        <div className="flex justify-between items-center section-spacing">
          <h1 className="heading-lg">Students</h1>
          <Button onClick={() => {/* Add student */}}>
            Add Student
          </Button>
        </div>
        
        <Card>
          <DataTable
            columns={columns}
            data={students}
            onRowClick={(student) => {/* View details */}}
            emptyMessage="No students found"
          />
        </Card>
      </div>
    </Layout>
  );
}
```

## Benefits

1. **Reusability**: Components can be used across the entire app
2. **Consistency**: Uniform design language
3. **Maintainability**: Easy to update styles globally
4. **Performance**: Minimal CSS, leveraging Tailwind's utility classes
5. **Type Safety**: Clear prop interfaces
6. **Accessibility**: Built-in ARIA attributes
7. **Responsiveness**: Mobile-first design
8. **Theme Support**: Easy to implement dark mode

## Future Enhancements

- Storybook for component documentation
- Theme customization system
- Animation library integration
- Internationalization (i18n)
- Advanced form validation
- Virtual scrolling for large datasets
