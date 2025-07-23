/**
 * @file lib/auth/register-schema.ts
 * @description Registration form validation schema and types
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-07: Extracted from app/auth/register/page.tsx for CLAUDE.md compliance
 */

import { z } from 'zod'

// Form validation schema
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    company: z.string().optional(),
    terms: z
      .boolean()
      .refine(
        (val) => val === true,
        'You must accept the terms and conditions'
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterForm = z.infer<typeof registerSchema>

export const defaultFormData: RegisterForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  company: '',
  terms: false,
}

/**
 * Validate registration form data
 */
export const validateRegisterForm = (
  formData: RegisterForm
): {
  isValid: boolean
  errors: Partial<RegisterForm>
} => {
  try {
    registerSchema.parse(formData)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {}
      error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message
        }
      })
      return { isValid: false, errors: fieldErrors as Partial<RegisterForm> }
    }
    return { isValid: false, errors: {} }
  }
}
