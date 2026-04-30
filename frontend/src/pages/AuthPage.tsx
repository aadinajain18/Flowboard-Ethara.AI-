import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, User } from "lucide-react";
import { z } from "zod";
import { api, unwrap } from "../lib/api";
import { loginSchema, signupSchema } from "../lib/schemas";
import { useAuthStore } from "../store/auth";
import { AuthBranding } from "../components/auth/AuthBranding";
import { PasswordStrength } from "../components/auth/PasswordStrength";
import type { User as UserType } from "../types";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const schema = mode === "login" ? loginSchema : signupSchema;
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === "signup" ? { name: "" } : {}),
    } as FormData,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  // Reset form when switching modes
  useEffect(() => {
    form.reset();
    setServerError("");
    setShowPassword(false);
  }, [mode]);

  const password = form.watch("password");

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError("");
    try {
      const data = await unwrap<{ token: string; user: UserType }>(
        api.post(`/api/auth/${mode}`, values)
      );
      setAuth(data.user, data.token);
      navigate("/dashboard");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Authentication failed";
      setServerError(msg);
      setShakeKey((k) => k + 1);
    }
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — Branding Panel */}
      <AuthBranding />

      {/* Right — Form Panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-10 gradient-mesh">
        {/* Subtle top-right glow on mobile */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-brand-500/5 blur-3xl lg:hidden" />

        <AnimatePresence mode="wait">
          <motion.div
            key={mode + shakeKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              x: serverError && shakeKey > 0 ? [0, -6, 6, -4, 4, 0] : 0,
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 0.3 },
              x: { duration: 0.4, ease: "easeInOut" },
            }}
            className="w-full max-w-md relative z-10"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-500">
                <motion.span
                  className="text-white text-sm font-bold"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  ⚡
                </motion.span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                FlowBoard
              </span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-[var(--text-secondary)]">
                {mode === "login"
                  ? "Sign in to your workspace to continue."
                  : "Start managing projects with your team."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Name field (signup only) */}
              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                      />
                      <input
                        className="input pl-10"
                        placeholder="Alex Morgan"
                        {...form.register("name" as any)}
                      />
                    </div>
                    {(form.formState.errors as any).name && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {(form.formState.errors as any).name.message}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    className="input pl-10"
                    type="email"
                    placeholder="you@example.com"
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    className="input pl-10 pr-12"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "signup" ? "Min 8 chars, 1 uppercase, 1 number" : "Enter your password"}
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {form.formState.errors.password.message}
                  </p>
                )}
                {mode === "signup" && <PasswordStrength password={password || ""} />}
              </div>

              {/* Server error */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="btn w-full group"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign in" : "Create account"}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-glass" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface-base px-4 text-xs text-[var(--text-muted)]">
                  {mode === "login" ? "New to FlowBoard?" : "Already have an account?"}
                </span>
              </div>
            </div>

            {/* Switch mode link */}
            <Link
              to={mode === "login" ? "/signup" : "/login"}
              className="btn-ghost w-full text-center block"
            >
              {mode === "login" ? "Create an account" : "Sign in instead"}
            </Link>

            {/* Demo credentials hint */}
            {mode === "login" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 glass rounded-lg p-4 text-xs text-[var(--text-muted)]"
              >
                <p className="font-medium text-[var(--text-secondary)] mb-2">
                  Demo Credentials
                </p>
                <div className="space-y-1">
                  <p>
                    <span className="text-brand-400">Admin:</span>{" "}
                    admin@example.com / Admin123!
                  </p>
                  <p>
                    <span className="text-purple-400">Member:</span>{" "}
                    member@example.com / Member123!
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
