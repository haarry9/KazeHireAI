import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { 
  Zap, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Briefcase, 
  Users, 
  Calendar 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const navItems = user?.role === 'HR' ? [
    { href: '/dashboard', label: 'Dashboard', icon: Briefcase },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/candidates', label: 'Candidates', icon: Users },
    { href: '/interviews', label: 'Interviews', icon: Calendar },
  ] : [
    { href: '/interviews/assigned', label: 'My Interviews', icon: Calendar },
  ];

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user?.role === 'HR' ? '/dashboard' : '/interviews/assigned'} className="flex items-center">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">KazeHireAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || router.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-700">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium">{user?.name}</span>
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                {user?.role}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href || router.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center px-3 py-2 text-sm text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">{user?.name}</span>
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                    {user?.role}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="mx-3 mt-2 w-auto flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 