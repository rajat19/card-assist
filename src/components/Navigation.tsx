import { Button } from '@/components/ui/button';
import { Search, CreditCard, Grid3X3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const isAllCards = location.pathname === '/all';

  const navItems = [
    { label: 'Find Best Card', icon: Search, to: '/', active: !isAllCards },
    { label: 'All Cards', icon: Grid3X3, to: '/all', active: isAllCards },
  ];

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="p-2 bg-gradient-financial rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CardAssist</h1>
              <p className="text-sm text-muted-foreground">Smart Credit Card Assistant</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.to}
                  variant={item.active ? "default" : "ghost"}
                  asChild
                  className={`flex items-center gap-2 ${item.active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Link to={item.to}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;