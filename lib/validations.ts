import { z } from "zod";

const marathiRegex = /^[\u0900-\u097F\s]+$/;
const englishRegex = /^[a-zA-Z\s]+$/;
const mobileRegex = /^\d{10}$/;
const farmerIdRegex = /^\d{11}$/;
const numberRegex = /^\d+$/;

const textOnlyRegex = /^[a-zA-Z\u0900-\u097F\s]+$/;
const groupNumberRegex = /^[a-zA-Z0-9\u0900-\u097F\/,\s]+$/;

const landDetailSchema = z.object({
  village: z
    .string()
    .min(1, "Village is required")
    .regex(textOnlyRegex, "Please enter only text for Village."),
  taluka: z
    .string()
    .min(1, "Taluka is required")
    .regex(textOnlyRegex, "Please enter only text for Taluka."),
  district: z
    .string()
    .min(1, "District is required")
    .regex(textOnlyRegex, "Please enter only text for District."),
  state: z
    .string()
    .min(1, "State is required")
    .regex(textOnlyRegex, "Please enter only text for State."),
  groupNumber: z
    .string()
    .min(1, "Group number is required.")
    .regex(groupNumberRegex, "Invalid characters in Group Number."),
  area: z.coerce.number().positive("Area must be a positive number."),
});

export const farmerFormSchema = z.object({
  farmerId: z
    .string()
    .regex(farmerIdRegex, "Farmer ID must be exactly 11 digits."),
  mobileNumber: z
    .string()
    .regex(mobileRegex, "Mobile Number must be exactly 10 digits."),
  nameEnglish: z
    .string()
    .regex(
      englishRegex,
      "Name (English) must contain only letters and spaces."
    ),
  nameMarathi: z
    .string()
    .regex(
      marathiRegex,
      "Name (Marathi) must contain only Marathi letters and spaces."
    ),
  address: z.string().min(1, "Address is required."),
  landDetails: z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      const landDetailsArraySchema = z
        .array(landDetailSchema)
        .min(1, "At least one land detail is required.");
      return landDetailsArraySchema.parse(parsed);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Land details are not in the correct format.",
      });
      return z.NEVER;
    }
  }),
});
