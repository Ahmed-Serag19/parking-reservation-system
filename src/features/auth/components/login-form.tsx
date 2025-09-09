import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Loader2, Lock, User, Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginFormData } from "../schemas";
import { useLogin } from "../hooks/use-login";

export function LoginForm() {
  const { handleLogin, isLoading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    handleLogin(data);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">
          Enter your credentials to access the parking system
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 sm:space-y-4"
          role="form"
          aria-label="Login form"
        >
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="username" className="text-sm sm:text-base">
              Username
            </Label>
            <div className="relative">
              <User
                className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                disabled={isLoading}
                aria-describedby={
                  errors.username ? "username-error" : undefined
                }
                aria-invalid={!!errors.username}
                {...register("username")}
              />
            </div>
            {errors.username && (
              <p
                id="username-error"
                className="text-xs sm:text-sm text-destructive"
                role="alert"
              >
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base">
              Password
            </Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10 h-10 sm:h-11 text-sm sm:text-base"
                disabled={isLoading}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="text-xs sm:text-sm text-destructive"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 sm:h-11 text-sm sm:text-base"
            disabled={isLoading}
            aria-describedby="login-status"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                <span aria-live="polite">Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <div
            id="login-status"
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {isLoading ? "Signing in, please wait" : "Ready to sign in"}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
