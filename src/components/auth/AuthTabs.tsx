import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthForm } from "./AuthForm";
import { z } from "zod";
import { emailFormSchema, phoneFormSchema } from "./AuthForm";

interface AuthTabsProps {
  isSignUp: boolean;
  isLoading: boolean;
  onEmailSubmit: (values: z.infer<typeof emailFormSchema>) => Promise<void>;
  onPhoneSubmit: (values: z.infer<typeof phoneFormSchema>) => Promise<void>;
}

export const AuthTabs = ({ isSignUp, isLoading, onEmailSubmit, onPhoneSubmit }: AuthTabsProps) => {
  return (
    <Tabs defaultValue="email">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="phone">Phone</TabsTrigger>
      </TabsList>

      <TabsContent value="email">
        <AuthForm
          type="email"
          isSignUp={isSignUp}
          onSubmit={onEmailSubmit}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="phone">
        <AuthForm
          type="phone"
          isSignUp={isSignUp}
          onSubmit={onPhoneSubmit}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
};