import { LoginForm } from "./login-form";
import AuthImage from "@/assets/images/auth-image.webp";
export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              WeLink Cargo
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Parking Reservation System
            </p>
          </div>
          <LoginForm />
        </div>
      </div>

      {/* Right side - Auth Image */}
      <div className="hidden lg:flex flex-1 bg-muted">
        <img
          src={AuthImage}
          alt="Parking System"
          className="max-w-full max-h-full object-cover rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}
