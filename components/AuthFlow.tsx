import React, { useState } from 'react';
import { SignUpFlow } from './SignUpFlow';
import { AccountRecovery } from './AccountRecovery';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from '../lib/firebase/AuthContext';
import { toast } from 'sonner@2.0.3';
import { Eye, EyeOff, Mail, Phone, AlertCircle, HelpCircle, Key, RefreshCw } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase/config';

export function AuthFlow() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [showAccountExistsDialog, setShowAccountExistsDialog] = useState(false);
  const [existingEmail, setExistingEmail] = useState('');
  
  // Email/Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  // Phone auth states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Error state
  const [authError, setAuthError] = useState<string>('');

  const { signIn, sendOTP, verifyOTP } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setAuthError('');
    
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific authentication errors
      if (error.message.includes('invalid-credential') || 
          error.message.includes('user-not-found') || 
          error.message.includes('wrong-password')) {
        setAuthError('');
        setExistingEmail(email);
        setResetEmail(email);
        setShowAccountExistsDialog(true);
      } else if (error.message.includes('too-many-requests')) {
        setAuthError('Too many failed attempts. Please reset your password or try again later.');
      } else if (error.message.includes('network-request-failed')) {
        setAuthError('Network error. Please check your internet connection.');
      } else {
        setAuthError(error.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPasswordReset = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset email sent! Check your inbox and spam folder.');
      setShowAccountExistsDialog(false);
      setResetEmail('');
      setExistingEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email. Try creating a new account instead.');
        setShowAccountExistsDialog(false);
        setIsSignUp(true);
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many reset attempts. Please wait before trying again.');
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setAuthError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setAuthError('');
    
    try {
      const result = await sendOTP(phoneNumber);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success('OTP sent to your phone');
    } catch (error: any) {
      console.error('Send OTP error:', error);
      setAuthError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) {
      setAuthError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setAuthError('');
    
    try {
      await verifyOTP(confirmationResult, otp);
      toast.success('Phone verified successfully!');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setAuthError(error.message || 'Invalid OTP. Please try again.');
      // Reset OTP flow on error
      setOtpSent(false);
      setConfirmationResult(null);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleTrySignUp = () => {
    setShowAccountExistsDialog(false);
    setIsSignUp(true);
    // Pre-fill the signup form with the email
    if (existingEmail) {
      // This will be handled by passing the email to SignUpFlow
    }
  };

  if (isSignUp) {
    return <SignUpFlow 
      onBackToSignIn={() => {
        setIsSignUp(false);
        setExistingEmail('');
        setResetEmail('');
      }} 
      prefilledEmail={existingEmail}
    />;
  }

  if (showRecovery) {
    return <AccountRecovery onBack={() => setShowRecovery(false)} />;
  }

  return (
    <div className="mobile-container flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Bix Mobil Vest</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert className="mb-4 border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as 'email' | 'phone')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail size={16} />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone size={16} />
                Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAuthError(''); // Clear error when user types
                    }}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setAuthError(''); // Clear error when user types
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08012345678 or +2348012345678"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setAuthError(''); // Clear error when user types
                      }}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your Nigerian phone number
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setAuthError(''); // Clear error when user types
                      }}
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the code sent to {phoneNumber}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOtpSent(false);
                        setConfirmationResult(null);
                        setOtp('');
                        setAuthError('');
                      }}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Don't have an account?
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsSignUp(true)}
              className="w-full"
            >
              Create New Account
            </Button>

            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecovery(true)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <HelpCircle size={14} className="mr-1" />
                Can't access your account?
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Exists Dialog */}
      <Dialog open={showAccountExistsDialog} onOpenChange={setShowAccountExistsDialog}>
        <DialogContent className="w-[95%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Account Found
            </DialogTitle>
            <DialogDescription>
              We found an account with the email <strong>{existingEmail}</strong>. 
              It looks like you might have forgotten your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">What would you like to do?</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-medium">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Reset your password</p>
                    <p className="text-xs text-muted-foreground">We'll send you a reset link</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-medium">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Try a different email</p>
                    <p className="text-xs text-muted-foreground">Create a new account instead</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-email">Confirm your email address</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleQuickPasswordReset} 
                disabled={resetLoading || !resetEmail}
                className="w-full"
              >
                {resetLoading ? (
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
              
              <Button 
                variant="outline" 
                onClick={handleTrySignUp}
                className="w-full"
              >
                Try Creating New Account Instead
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => setShowAccountExistsDialog(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p><strong>Note:</strong> If you recently created this account, check your email for a verification link.</p>
              <p>Reset emails may take a few minutes to arrive and could be in your spam folder.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add reCAPTCHA container for phone auth */}
      <div id="recaptcha-container"></div>
    </div>
  );
}