import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  Phone,
  User,
  ArrowLeft
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase/config';

interface AccountRecoveryProps {
  onBack?: () => void;
}

export function AccountRecovery({ onBack }: AccountRecoveryProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setAttempts(prev => prev + 1);
      toast.success('Password reset email sent! Check your inbox and spam folder.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email. You may need to create a new account.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many reset attempts. Please wait before trying again.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else {
        toast.error('Failed to send reset email. Please check your email and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="mobile-container flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Reset Email Sent!</h2>
                <p className="text-muted-foreground mt-2">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                <h3 className="font-medium">Next steps:</h3>
                <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>Check your email inbox for the reset link</li>
                  <li>Check your spam/junk folder if not found</li>
                  <li>Click the link to reset your password</li>
                  <li>Return here to sign in with your new password</li>
                </ol>
              </div>

              <div className="flex flex-col gap-2">
                {attempts < 3 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setResetSent(false)}
                    className="w-full"
                  >
                    Send Another Reset Email
                  </Button>
                )}
                
                <Button onClick={onBack} className="w-full">
                  Back to Sign In
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Still having trouble? Try creating a new account with a different email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mobile-container flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-1"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Account Recovery
              </CardTitle>
              <CardDescription>
                Reset your password to regain access to your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Can't sign in?</strong> Enter your email below and we'll send you a password reset link.
            </AlertDescription>
          </Alert>

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email Address</Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="Enter the email you used to sign up"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                This should be the email you used when creating your Bix Mobil Vest account
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Password Reset Email
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Still having trouble?
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Troubleshooting Tips
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95%] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>Troubleshooting Tips</DialogTitle>
                    <DialogDescription>
                      Try these solutions if you're having trouble accessing your account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Check different email addresses</p>
                          <p className="text-xs text-muted-foreground">
                            You might have signed up with a different email (work, personal, etc.)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Try phone authentication</p>
                          <p className="text-xs text-muted-foreground">
                            If you signed up with your phone number, use the phone option instead
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Create a new account</p>
                          <p className="text-xs text-muted-foreground">
                            If nothing else works, you can create a fresh account
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Check spam folder</p>
                          <p className="text-xs text-muted-foreground">
                            Reset emails sometimes end up in spam or promotions folder
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground text-center">
            <p>
              <strong>New user?</strong> You might need to create an account first before you can reset your password.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}