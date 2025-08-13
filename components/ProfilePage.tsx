'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { 
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Award,
  Printer,
  Moon,
  Sun
} from 'lucide-react';

interface ProfilePageProps {
  onOpenPrinterSetup: () => void;
}

export function ProfilePage({ onOpenPrinterSetup }: ProfilePageProps) {
  const profileMenuItems = [
    {
      id: 'business-info',
      title: 'Business Information',
      subtitle: 'Update your business details',
      icon: User,
      action: () => console.log('Open business info')
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      subtitle: 'Password, PIN, and privacy settings',
      icon: Shield,
      action: () => console.log('Open security settings')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      icon: Bell,
      action: () => console.log('Open notification settings')
    },
    {
      id: 'printer',
      title: 'Bluetooth Printer',
      subtitle: 'Connect and manage receipt printer',
      icon: Printer,
      action: () => onOpenPrinterSetup()
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
      action: () => console.log('Open help center')
    }
  ];
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const userInfo = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+234 801 234 5678',
    businessName: 'John\'s Cyber Cafe',
    memberSince: 'January 2024',
    tier: 'Gold'
  };

  const stats = [
    { label: 'Total Sales', value: '₦2.5M', icon: Award },
    { label: 'Commission Earned', value: '₦50K', icon: Star },
    { label: 'Active Days', value: '45', icon: User }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {userInfo.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-bold">{userInfo.name}</h3>
              <p className="text-sm text-muted-foreground">{userInfo.businessName}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {userInfo.tier} Member
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Since {userInfo.memberSince}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{userInfo.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span>{userInfo.phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-bold text-sm">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <p className="font-medium text-sm">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch to dark theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive transaction alerts</p>
              </div>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Daily sales summary</p>
              </div>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card>
        <CardContent className="p-0">
          {profileMenuItems.map((item, index) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={item.action}
              className={`w-full justify-between h-auto p-4 ${
                index !== profileMenuItems.length - 1 ? 'border-b' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="p-0">
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-4 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Logout</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}