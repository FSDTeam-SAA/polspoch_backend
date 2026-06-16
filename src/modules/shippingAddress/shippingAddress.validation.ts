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
      .min(9, 'Phone number must be at least 9 characters'),
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
    company: z.string().optional(),
    landmark: z.string().optional(),
    isDefault: z.boolean().optional(),
    addressType: z.enum(['home', 'office', 'other']).optional(),
    deliveryInstructions: z.string().optional(),
    invoiceDetails: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      vat: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
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
      .min(9, 'Phone number must be at least 9 characters')
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
    company: z.string().optional(),
    landmark: z.string().optional(),
    isDefault: z.boolean().optional(),
    addressType: z.enum(['home', 'office', 'other']).optional(),
    deliveryInstructions: z.string().optional(),
    invoiceDetails: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      vat: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  }),
})

export const shippingAddressValidation = {
  createShippingAddressValidation,
  updateShippingAddressValidation,
}
