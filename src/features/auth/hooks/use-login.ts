import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useLogin as useLoginMutation } from "../../../lib/react-query";
import { useAuthStore } from "../../../store/auth-store";
import type { LoginFormData } from "../schemas";

export const useLogin = () => {
  const navigate = useNavigate();
  const authLogin = useAuthStore((state) => state.login);
  const setLoading = useAuthStore((state) => state.setLoading);
  const authIsLoading = useAuthStore((state) => state.isLoading);

  const loginMutation = useLoginMutation();

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoading(true);

      const response = await loginMutation.mutateAsync(data);

      // Store user and token in auth store
      authLogin(response.user, response.token);

      // Redirect based on user role
      if (response.user.role === "admin") {
        navigate("/admin");
      } else if (response.user.role === "employee") {
        navigate("/checkpoint");
      } else {
        // Fallback for unknown roles
        navigate("/");
      }

      toast.success(`Welcome back, ${response.user.username}!`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    isLoading: loginMutation.isPending || authIsLoading,
  };
};
