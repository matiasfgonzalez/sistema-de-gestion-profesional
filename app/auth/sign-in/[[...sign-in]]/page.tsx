import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inicia sesion para acceder a tu cuenta
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-sm normal-case text-primary-foreground",
              card: "shadow-none bg-transparent",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border-border hover:bg-accent",
              socialButtonsBlockButtonText: "text-foreground",
              formFieldInput:
                "rounded-xl border-input bg-background text-foreground focus:ring-primary",
              formFieldLabel: "text-foreground",
              footerActionLink: "text-primary hover:text-primary/90",
            },
          }}
          routing="path"
          path="/auth/sign-in"
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
