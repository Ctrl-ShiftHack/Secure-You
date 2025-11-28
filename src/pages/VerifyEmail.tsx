import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log('🔍 VerifyEmail: Starting verification');
        console.log('  - Full URL:', window.location.href);
        console.log('  - Hash:', window.location.hash);
        
        // Check URL hash for Supabase auth tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const tokenType = hashParams.get('token_type');
        
        console.log('  - Parameters found:');
        console.log('    - access_token:', accessToken ? '✓ Present' : '✗ Missing');
        console.log('    - refresh_token:', refreshToken ? '✓ Present' : '✗ Missing');
        console.log('    - type:', type || 'none');
        console.log('    - token_type:', tokenType || 'none');

        // Check if we have the required tokens
        if (accessToken && refreshToken) {
          console.log('✓ Tokens found, setting session...');
          
          // Set the session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          console.log('  - Session result:', { data, error });

          if (error) {
            console.error('❌ Session error:', error);
            throw error;
          }

          if (data?.session) {
            console.log('✅ Session established!');
            console.log('  - User:', data.user?.email);
            
            setStatus('success');
            setMessage('Email verified successfully! 🎉');
            
            toast({
              title: "Email Verified! 🎉",
              description: "Let's set up your profile to get started.",
              duration: 5000,
            });

            // Redirect to setup page after 1.5 seconds
            setTimeout(() => {
              console.log('➡️  Redirecting to /setup');
              navigate('/setup', { replace: true });
            }, 1500);
          } else {
            throw new Error('Session created but no session data returned');
          }
        } else if (type === 'recovery') {
          // Password recovery link
          console.log('🔑 Password recovery link detected');
          setStatus('success');
          setMessage('Password reset link verified!');
          setTimeout(() => {
            navigate('/reset-password');
          }, 1000);
        } else {
          console.error('❌ Invalid verification link');
          console.log('  - Missing required tokens');
          throw new Error('Invalid verification link - missing authentication tokens');
        }
      } catch (error: any) {
        console.error('❌ Email verification error:', error);
        console.error('  - Message:', error?.message);
        console.error('  - Code:', error?.code);
        console.error('  - Stack:', error?.stack);
        
        setStatus('error');
        
        let errorMessage = 'Failed to verify email. ';
        
        if (error?.message?.includes('expired')) {
          errorMessage += 'The verification link has expired. Please sign up again.';
        } else if (error?.message?.includes('invalid')) {
          errorMessage += 'The verification link is invalid. Please check your email or sign up again.';
        } else {
          errorMessage += error?.message || 'Please try again or contact support.';
        }
        
        setMessage(errorMessage);
        
        toast({
          title: "Verification Failed",
          description: errorMessage,
          variant: "destructive",
          duration: 8000,
        });
      }
    };

    verifyEmail();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Verifying Email</h1>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-bold mb-2 text-green-600">Success!</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <p className="text-sm text-muted-foreground">
                Redirecting to setup page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h1 className="text-2xl font-bold mb-2 text-destructive">Verification Failed</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/signup')}
                  className="w-full gradient-primary text-white"
                >
                  Sign Up Again
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? Contact support
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
