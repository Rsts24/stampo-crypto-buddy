import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { LanguagePreferences } from "./LanguagePreferences";

export const profileFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  mobile_number: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Please enter a valid phone number with country code")
    .or(z.literal("")),
  date_of_birth: z.date().optional(),
  address: z.string().min(5, "Address must be at least 5 characters").or(z.literal("")),
  preferred_language: z.string(),
  notification_preferences: z.object({
    email: z.boolean(),
    sms: z.boolean(),
  }),
});

interface PersonalInfoFormProps {
  initialData: z.infer<typeof profileFormSchema>;
  onSubmit: (values: z.infer<typeof profileFormSchema>) => void;
  isLoading: boolean;
}

export const PersonalInfoForm = ({ initialData, onSubmit, isLoading }: PersonalInfoFormProps) => {
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoFields form={form} />
        <LanguagePreferences form={form} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};