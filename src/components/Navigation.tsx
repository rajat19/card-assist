import { Button } from '@/components/ui/button';
import { Search, CreditCard, Plus, Grid3X3, Pencil } from 'lucide-react';

interface NavigationProps {
  activeTab: 'search' | 'cards' | 'add' | 'edit';
  onTabChange: (tab: 'search' | 'cards' | 'add' | 'edit') => void;
  isEditing?: boolean;
}

const Navigation = ({ activeTab, onTabChange, isEditing }: NavigationProps) => {
  const base = [
    { id: 'search', label: 'Find Best Card', icon: Search },
    { id: 'cards', label: 'All Cards', icon: Grid3X3 },
    { id: 'add', label: 'Add Card', icon: Plus },
  ] as const;
  const navItems = (isEditing
    ? ([...base, { id: 'edit', label: 'Edit Card', icon: Pencil }] as const)
    : base);

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-financial rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CardAssist</h1>
              <p className="text-sm text-muted-foreground">Smart Credit Card Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
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