import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../lib/firebase/AuthContext';
import { authService } from '../lib/firebase/auth';
import { databaseService } from '../lib/firebase/database';
import { Badge } from './ui/badge';
import { 
  User, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';

export function AuthDebug() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const runDiagnostics = async () => {
    setChecking(true);
    const info: any = {
      timestamp: new Date().toISOString(),
      authState: {
        hasUser: !!user,
        hasProfile: !!userProfile,
        loading: loading
      },
      user: user ? {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      } : null,
      profile: userProfile ? {
        uid: userProfile.uid,
        email: userProfile.email,
        displayName: userProfile.displayName,
        walletBalance: userProfile.walletBalance,
        isVerified: userProfile.isVerified
      } : null
    };

    // Test database connection
    if (user) {
      try {
        const testProfile = await authService.getUserProfile(user.uid);
        info.databaseTest = {
          success: !!testProfile,
          profileExists: !!testProfile,
          error: null
        };
      } catch (error: any) {
        info.databaseTest = {
          success: false,
          profileExists: false,
          error: error.message
        };
      }
    }

    setDebugInfo(info);
    setChecking(false);
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={condition ? "default" : "destructive"}>
        {condition ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Authentication Debug
        </CardTitle>
        <CardDescription>
          Check your authentication status and troubleshoot issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={checking}
            size="sm"
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Info className="h-4 w-4 mr-2" />
            )}
            {checking ? 'Checking...' : 'Run Diagnostics'}
          </Button>
          
          <Button 
            onClick={refreshUserProfile} 
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Profile
          </Button>
        </div>

        {/* Quick Status */}
        <div className="space-y-2 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm">Authentication:</span>
            {getStatusIcon(!!user)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">User Profile:</span>
            {getStatusIcon(!!userProfile)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Loading:</span>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>

        {/* Current Status */}
        {user && (
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              Signed in as: {user.email || user.phoneNumber || 'Unknown'}
              <br />
              UID: {user.uid.slice(0, 8)}...
              {userProfile && (
                <>
                  <br />
                  Wallet: ₦{userProfile.walletBalance?.toLocaleString() || '0'}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!user && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No user is currently signed in. Please sign in or create an account.
            </AlertDescription>
          </Alert>
        )}

        {user && !userProfile && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              User is authenticated but profile is missing. This may indicate a database issue.
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Debug Info */}
        {debugInfo && (
          <div className="space-y-3">
            <h4 className="font-medium">Diagnostic Results</h4>
            
            <div className="text-xs space-y-2 p-3 bg-muted rounded font-mono">
              <div className="grid grid-cols-2 gap-2">
                <span>Auth State:</span>
                {getStatusBadge(debugInfo.authState.hasUser, 'Authenticated', 'Not Authenticated')}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span>Profile Loaded:</span>
                {getStatusBadge(debugInfo.authState.hasProfile, 'Yes', 'No')}
              </div>

              {debugInfo.databaseTest && (
                <div className="grid grid-cols-2 gap-2">
                  <span>Database Test:</span>
                  {getStatusBadge(debugInfo.databaseTest.success, 'Connected', 'Failed')}
                </div>
              )}

              {debugInfo.user && (
                <div className="mt-2 pt-2 border-t">
                  <div>Email: {debugInfo.user.email || 'None'}</div>
                  <div>Phone: {debugInfo.user.phoneNumber || 'None'}</div>
                  <div>Verified: {debugInfo.user.emailVerified ? 'Yes' : 'No'}</div>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Last checked: {new Date(debugInfo.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Common Issues:</strong></p>
          <ul className="space-y-1">
            <li>• Check your email/password combination</li>
            <li>• Ensure you have an account (try signing up)</li>
            <li>• Check your internet connection</li>
            <li>• Try refreshing your profile</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}