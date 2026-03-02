import Navigation from '@/components/Navigation';
import SearchCards from '@/components/SearchCards';
import heroImage from '@/assets/hero-credit-cards.jpg';
import { CREDIT_CARDS } from '@/data/creditCards';

const Index = () => {
  const cards = CREDIT_CARDS;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
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

        <SearchCards cards={cards} />
      </main>
    </div>
  );
};

export default Index;
