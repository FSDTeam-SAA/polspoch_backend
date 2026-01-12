import { z } from 'zod'

const createShippingAddressValidation = z.object({
  body: z.object({
    orderId: z.string().optional(),
    fullName: z
      .string({
        required_error: 'Full name is required',
      })
      .min(2, 'Full name must be at least 2 characters'),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
    phone: z
      .string({
        required_error: 'Phone number is required',
      })
      .min(10, 'Phone number must be at least 10 characters'),
    street: z
      .string({
        required_error: 'Street address is required',
      })
      .min(5, 'Street address must be at least 5 characters'),
    city: z
      .string({
        required_error: 'City is required',
      })
      .min(2, 'City must be at least 2 characters'),
    province: z
      .string({
        required_error: 'Province is required',
      })
      .min(2, 'Province must be at least 2 characters'),
    postalCode: z
      .string({
        required_error: 'Postal code is required',
      })
      .min(3, 'Postal code must be at least 3 characters'),
    country: z
      .string({
        required_error: 'Country is required',
      })
      .min(2, 'Country must be at least 2 characters'),
    landmark: z.string().optional(),
    isDefault: z.boolean().optional(),
    addressType: z.enum(['home', 'office', 'other']).optional(),
    deliveryInstructions: z.string().optional(),
  }),
})

const updateShippingAddressValidation = z.object({
  body: z.object({
    orderId: z.string().optional(),
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z
      .string()
      .min(10, 'Phone number must be at least 10 characters')
      .optional(),
    street: z
      .string()
      .min(5, 'Street address must be at least 5 characters')
      .optional(),
    city: z.string().min(2, 'City must be at least 2 characters').optional(),
    province: z
      .string()
      .min(2, 'Province must be at least 2 characters')
      .optional(),
    postalCode: z
      .string()
      .min(3, 'Postal code must be at least 3 characters')
      .optional(),
    country: z
      .string()
      .min(2, 'Country must be at least 2 characters')
      .optional(),
    landmark: z.string().optional(),
    isDefault: z.boolean().optional(),
    addressType: z.enum(['home', 'office', 'other']).optional(),
    deliveryInstructions: z.string().optional(),
  }),
})

export const shippingAddressValidation = {
  createShippingAddressValidation,
  updateShippingAddressValidation,
}
