import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AuthFormFields } from "./AuthFormFields";

const phoneRegex = /^\+[1-9]\d{1,14}$/;

export const emailFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
});

export const phoneFormSchema = z.object({
  phone: z.string().regex(phoneRegex, "Please enter a valid phone number with country code (e.g., +1234567890)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
});

interface AuthFormProps {
  type: "email" | "phone";
  isSignUp: boolean;
  onSubmit: (values: z.infer<typeof emailFormSchema> | z.infer<typeof phoneFormSchema>) => Promise<void>;
  isLoading: boolean;
}

export const AuthForm = ({ type, isSignUp, onSubmit, isLoading }: AuthFormProps) => {
  const schema = type === "email" ? emailFormSchema : phoneFormSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...(type === "email" ? { email: "" } : { phone: "" }),
      password: "",
      fullName: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AuthFormFields type={type} isSignUp={isSignUp} form={form} />
        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90"
          disabled={isLoading}
        >
          {isLoading
            ? "Please wait..."
            : isSignUp
            ? `Sign Up with ${type === "email" ? "Email" : "Phone"}`
            : `Sign In with ${type === "email" ? "Email" : "Phone"}`}
        </Button>
      </form>
    </Form>
  );
};