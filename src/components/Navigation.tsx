import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="p-2 bg-gradient-financial rounded-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">CardAssist</h1>
              <p className="text-xs text-muted-foreground leading-tight">Smart Credit Card Assistant</p>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;