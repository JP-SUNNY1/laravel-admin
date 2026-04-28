import { IconFacebook, IconGithub } from '@/assets/brand-icons';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from '@inertiajs/react';
import { Loader2, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    email: z.email({
        error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
    }),
    password: z.string().min(1, 'Please enter your password').min(7, 'Password must be at least 7 characters long'),
});

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
    redirectTo?: string;
}

export function UserAuthForm({ className, redirectTo, ...props }: UserAuthFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { auth } = useAuthStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.message || result.errors?.email?.[0] || 'Login failed. Please try again.';
                toast.error(errorMessage);
                setIsLoading(false);
                return;
            }

            // Store user and token from backend response
            const mockUser = {
                accountNo: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: ['user'],
                exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
            };

            // Set user and access token
            auth.setUser(mockUser);
            auth.setAccessToken(result.token);

            // Store token in localStorage for API requests
            localStorage.setItem('auth-token', result.token);

            toast.success(`Welcome back, ${result.user.name}!`);

            // Redirect to the stored location or default to dashboard
            const targetPath = redirectTo || '/';
            router.visit(targetPath, { replace: true });
        } catch (error) {
            console.error('Login error:', error);
            toast.error('An error occurred during login. Please try again.');
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-3', className)} {...props}>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="relative">
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <PasswordInput placeholder="********" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                            <Link
                                href="/forgot-password"
                                className="absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75"
                            >
                                Forgot password?
                            </Link>
                        </FormItem>
                    )}
                />
                <Button className="mt-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
                    Sign in
                </Button>

                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" type="button" disabled={isLoading}>
                        <IconGithub className="h-4 w-4" /> GitHub
                    </Button>
                    <Button variant="outline" type="button" disabled={isLoading}>
                        <IconFacebook className="h-4 w-4" /> Facebook
                    </Button>
                </div>
            </form>
        </Form>
    );
}
