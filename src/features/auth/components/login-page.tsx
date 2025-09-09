import { LoginForm } from "./login-form";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Car, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImage from "@/assets/images/auth-image.webp";
export function LoginPage() {
  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-3 lg:p-2 bg-background">
        <div className="w-full max-w-md space-y-2 sm:space-y-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              WeLink Cargo
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Parking Reservation System
            </p>
          </div>

          {/* Public Access Options */}
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Continue as Guest</CardTitle>
              <CardDescription>
                Access parking without an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/gate/gate_1" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 text-base"
                  size="lg"
                >
                  <div className="flex items-center gap-3">
                    <Car height={8} width={8} />
                    <span>Continue as Visitor/Subscriber</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or login as staff
              </span>
            </div>
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
