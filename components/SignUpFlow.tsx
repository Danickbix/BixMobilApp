import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from '../lib/firebase/AuthContext';
import { toast } from 'sonner@2.0.3';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase/config';

interface SignUpFlowProps {
  onBackToSignIn: () => void;
  prefilledEmail?: string;
}

export function SignUpFlow({ onBackToSignIn, prefilledEmail }: SignUpFlowProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [showEmailExistsDialog, setShowEmailExistsDialog] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: prefilledEmail || '',
    password: '',
    confirmPassword: '',
    displayName: '',
    businessName: '',
    businessType: 'other' as 'cyber_cafe' | 'phone_shop' | 'retail_store' | 'other',
    phoneNumber: '',
    state: '',
    city: ''
  });

  const { signUp } = useAuth();

  // Update email when prefilled email changes
  useEffect(() => {
    if (prefilledEmail) {
      setFormData(prev => ({ ...prev, email: prefilledEmail }));
    }
  }, [prefilledEmail]);

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
    'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
    'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.displayName) {
      setSignUpError('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 6) {
      setSignUpError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setSignUpError('Passwords do not match');
      return false;
    }

    if (formData.email && !formData.email.includes('@')) {
      setSignUpError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      toast.success('Password reset email sent! Check your inbox.');
      setShowEmailExistsDialog(false);
      // Go back to sign in after successful reset
      setTimeout(() => {
        onBackToSignIn();
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address');
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSignUpError('');

    try {
      console.log('Starting sign up process with:', {
        email: formData.email,
        displayName: formData.displayName,
        businessName: formData.businessName
      });

      await signUp(formData.email, formData.password, {
        displayName: formData.displayName,
        businessName: formData.businessName,
        businessType: formData.businessType,
        location: formData.state && formData.city ? {
          state: formData.state,
          city: formData.city
        } : undefined
      });

      console.log('Sign up successful');
      setSignUpSuccess(true);
      toast.success('Account created successfully! Welcome to Bix Mobil Vest!');
      
      // Auto redirect to main app after success
      setTimeout(() => {
        // The AuthContext will automatically redirect to main app
      }, 2000);

    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle specific signup errors
      if (error.message.includes('email-already-in-use')) {
        setSignUpError('');
        setShowEmailExistsDialog(true);
      } else if (error.message.includes('weak-password')) {
        setSignUpError('Password is too weak. Please choose a stronger password.');
      } else if (error.message.includes('invalid-email')) {
        setSignUpError('Please enter a valid email address.');
      } else if (error.message.includes('network-request-failed')) {
        setSignUpError('Network error. Please check your internet connection.');
      } else {
        setSignUpError(error.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSignUpError(''); // Clear error when user types
  };

  if (signUpSuccess) {
    return (
      <div className="mobile-container flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Welcome to Bix Mobil Vest!</h2>
                <p className="text-muted-foreground mt-2">
                  Your account has been created successfully. You can now start managing your mobile business.
                </p>
              </div>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Setting up your account...</p>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToSignIn}
              className="p-1"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Join Bix Mobil Vest and start your mobile business
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {signUpError && (
            <Alert className="mb-4 border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{signUpError}</AlertDescription>
            </Alert>
          )}

          {prefilledEmail && (
            <Alert className="mb-4">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Creating account for: <strong>{prefilledEmail}</strong>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  required
                  className={prefilledEmail ? 'bg-muted' : ''}
                  readOnly={!!prefilledEmail}
                />
                {prefilledEmail && (
                  <p className="text-xs text-muted-foreground">
                    This email was detected from your sign-in attempt
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name *</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.displayName}
                  onChange={(e) => updateFormData('displayName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Your business name (optional)"
                  value={formData.businessName}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select 
                  value={formData.businessType} 
                  onValueChange={(value) => updateFormData('businessType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cyber_cafe">Cyber Café</SelectItem>
                    <SelectItem value="phone_shop">Phone Shop</SelectItem>
                    <SelectItem value="retail_store">Retail Store</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={(value) => updateFormData('state', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email Already Exists Dialog */}
      <Dialog open={showEmailExistsDialog} onOpenChange={setShowEmailExistsDialog}>
        <DialogContent className="w-[95%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Email Already Registered
            </DialogTitle>
            <DialogDescription>
              An account with <strong>{formData.email}</strong> already exists. 
              You may have forgotten your password.
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
                    <p className="text-xs text-muted-foreground">We'll send you a reset link to sign in</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-medium">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Try signing in</p>
                    <p className="text-xs text-muted-foreground">Go back to the sign-in page</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handlePasswordReset} 
                disabled={resetLoading}
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
                onClick={() => {
                  setShowEmailExistsDialog(false);
                  onBackToSignIn();
                }}
                className="w-full"
              >
                Go Back to Sign In
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => setShowEmailExistsDialog(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              <p><strong>Note:</strong> If you just created this account, check your email for a verification link or reset your password to access it.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}