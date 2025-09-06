import { useEffect, useState } from 'react';
import { CreditCard } from '@/types/creditcard';
import Navigation from '@/components/Navigation';
import SearchCards from '@/components/SearchCards';
import CreditCardItem from '@/components/CreditCardItem';
import AddCreditCardForm from '@/components/AddCreditCardForm';
import CardForm from '@/components/CardForm';
import heroImage from '@/assets/hero-credit-cards.jpg';
import { subscribeToCards, addCard, updateCard } from '@/services/cards';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'cards' | 'add' | 'edit'>('search');
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCards((remoteCards) => setCards(remoteCards));
    return () => unsubscribe();
  }, []);

  // Initialize history state and handle browser back/forward to switch tabs
  useEffect(() => {
    // Set or update state to current tab without adding a new entry when tab changes
    window.history.replaceState({ tab: activeTab }, '');

    const onPopState = (e: PopStateEvent) => {
      const tab = (e.state && typeof e.state.tab === 'string') ? e.state.tab : 'search';
      if (tab !== 'edit') {
        setEditingCard(null);
      }
      setActiveTab(tab as 'search' | 'cards' | 'add' | 'edit');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeTab]);

  const navigateTab = (tab: 'search' | 'cards' | 'add' | 'edit', opts?: { replace?: boolean }) => {
    // Do not create a back-stop on edit; replace instead so back skips edit
    const shouldReplace = opts?.replace || tab === 'edit';
    const state = { tab };
    if (shouldReplace) {
      window.history.replaceState(state, '');
    } else {
      window.history.pushState(state, '');
    }
    setActiveTab(tab);
  };

  const handleAddCard = async (newCard: CreditCard) => {
    await addCard(newCard);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={(t) => navigateTab(t)} isEditing={!!editingCard} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - only show on search tab */}
        {activeTab === 'search' && (
          <div className="mb-8 relative">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-financial">
              <img 
                src={heroImage} 
                alt="Credit Cards" 
                className="w-full h-64 object-cover opacity-20"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Find Your Perfect Credit Card
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
                    Compare benefits across {cards.length} credit cards and discover which one gives you the best rewards for your spending
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'search' && (
          <SearchCards cards={cards} />
        )}
        
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">All Credit Cards</h2>
                <p className="text-muted-foreground">Browse all {cards.length} available credit cards</p>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div key={card.name}>
                  <CreditCardItem card={card} />
                  <div className="mt-2">
                    <button
                      type="button"
                      className="text-xs underline text-financial-blue"
                      onClick={() => {
                        setEditingCard(card);
                        navigateTab('edit', { replace: true });
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'add' && (
          <div className="max-w-4xl mx-auto">
            <CardForm
              mode="add"
              onSubmit={async (payload) => {
                await handleAddCard(payload);
                navigateTab('cards');
              }}
            />
          </div>
        )}

        {activeTab === 'edit' && editingCard && (
          <div className="max-w-4xl mx-auto">
            <CardForm
              mode="edit"
              initial={editingCard}
              onSubmit={async (payload) => {
                await updateCard(payload);
                navigateTab('cards');
                setEditingCard(null);
              }}
              onCancel={() => {
                navigateTab('cards');
                setEditingCard(null);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
