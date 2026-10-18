import { z } from "zod";

/** Shared Zod schemas — used by React Hook Form and by pure tests. */

const email = z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.");

const password = z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[0-9]/, "Include at least one number.");

export const loginSchema = z.object({
    email,
    password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
    .object({
        name: z.string().trim().min(2, "Tell us your name."),
        email,
        password,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

export const addressSchema = z.object({
    fullName: z.string().trim().min(2, "Full name is required."),
    email,
    phone: z
        .string()
        .trim()
        .min(7, "Enter a phone number we can reach you on.")
        .regex(/^[0-9+()\-\s]+$/, "Enter a valid phone number."),
    address: z.string().trim().min(4, "Street address is required."),
    city: z.string().trim().min(2, "City is required."),
    postalCode: z.string().trim().min(3, "Postal code is required."),
    country: z.string().trim().min(2, "Country is required."),
});

export const checkoutContactSchema = addressSchema;

export const profileSchema = z.object({
    name: z.string().trim().min(2, "Tell us your name."),
    email,
    phone: z
        .string()
        .trim()
        .min(7, "Enter a phone number we can reach you on.")
        .regex(/^[0-9+()\-\s]+$/, "Enter a valid phone number."),
    address: z.string().trim().min(4, "Street address is required."),
    city: z.string().trim().min(2, "City is required."),
    postalCode: z.string().trim().min(3, "Postal code is required."),
    country: z.string().trim().min(2, "Country is required."),
});

export const contactSchema = z.object({
    name: z.string().trim().min(2, "Tell us your name."),
    email,
    subject: z.string().trim().min(3, "Add a short subject."),
    message: z
        .string()
        .trim()
        .min(10, "Tell us a little more (10 characters minimum)."),
});

export const newsletterSchema = z.object({
    email,
});

export const adminProductSchema = z.object({
    title: z.string().trim().min(2, "Title is required."),
    price: z.coerce.number().min(0, "Price must be zero or more."),
    category: z.string().trim().min(2, "Category is required."),
    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters."),
    discountPercentage: z.coerce
        .number()
        .min(0)
        .max(90, "Discount cannot exceed 90%."),
    stock: z.coerce.number().int("Stock must be a whole number.").min(0),
});
