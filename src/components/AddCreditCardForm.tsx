import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, CreditCard } from 'lucide-react';
import { CreditCard as CreditCardType, CATEGORIES, Benefit, Bank, CardType, BenefitType } from '@/types/creditcard';
import { useToast } from '@/hooks/use-toast';

interface AddCreditCardFormProps {
  onAddCard: (card: CreditCardType) => void | Promise<void>;
}

const AddCreditCardForm = ({ onAddCard }: AddCreditCardFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    bankName: null,
    cardType: CardType.REGULAR as CardType,
    description: '',
    link: '',
  });

  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [currentBenefit, setCurrentBenefit] = useState({
    category: '',
    type: BenefitType.CASHBACK as BenefitType,
    value: '',
    description: '',
  });

  const [fees, setFees] = useState({
    joiningValue: '',
    joiningType: 'fixed' as 'fixed' | 'percentage',
    annualValue: '',
    annualType: 'fixed' as 'fixed' | 'percentage',
    cashWithdrawal: '2.5',
    forex: '3.5',
    walletLoad: '',
    education: '',
    utilities: '',
    rent: '',
    fuelValue: '',
    fuelType: 'percentage' as 'fixed' | 'percentage',
    other: '',
  });

  const [lounge, setLounge] = useState({
    domesticQty: '',
    domesticPre: '',
    intlQty: '',
    intlPre: '',
  });

  const handleAddBenefit = () => {
    if (!currentBenefit.category || !currentBenefit.value) {
      toast({
        title: "Missing Information",
        description: "Please fill in category and value for the benefit.",
        variant: "destructive"
      });
      return;
    }

    const newBenefit: Benefit = {
      category: currentBenefit.category,
      type: currentBenefit.type,
      value: parseFloat(currentBenefit.value),
      description: currentBenefit.description || undefined,
    };

    setBenefits([...benefits, newBenefit]);
    setCurrentBenefit({
      category: '',
      type: BenefitType.CASHBACK,
      value: '',
      description: '',
    });
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.bankName || benefits.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and add at least one benefit.",
        variant: "destructive"
      });
      return;
    }

    const newCard: CreditCardType = {
      name: formData.name,
      bankName: formData.bankName,
      cardType: formData.cardType,
      description: formData.description || undefined,
      benefits,
      feesAndCharges: {
        joining: { value: parseFloat(fees.joiningValue) || 0, type: fees.joiningType },
        annual: { value: parseFloat(fees.annualValue) || 0, type: fees.annualType },
        cashWithdrawal: { value: parseFloat(fees.cashWithdrawal) || 0, type: 'percentage' },
        forex: { value: parseFloat(fees.forex) || 0, type: 'percentage' },
        walletLoad: fees.walletLoad ? { value: parseFloat(fees.walletLoad) || 0, type: 'percentage' } : undefined,
        educationTransaction: fees.education ? { value: parseFloat(fees.education) || 0, type: 'percentage' } : undefined,
        utilityBillPayment: fees.utilities ? { value: parseFloat(fees.utilities) || 0, type: 'percentage' } : undefined,
        rentTransaction: fees.rent ? { value: parseFloat(fees.rent) || 0, type: 'percentage' } : undefined,
        fuelTransaction: fees.fuelValue ? { value: parseFloat(fees.fuelValue) || 0, type: fees.fuelType } : undefined,
        other: fees.other ? { value: parseFloat(fees.other) || 0, type: 'percentage' } : undefined,
      },
      link: formData.link || '#',
      lounge: (lounge.domesticQty || lounge.intlQty) ? {
        domestic: lounge.domesticQty ? { quantity: parseInt(lounge.domesticQty) || 0, precondition: lounge.domesticPre || '' } : undefined,
        international: lounge.intlQty ? { quantity: parseInt(lounge.intlQty) || 0, precondition: lounge.intlPre || '' } : undefined,
      } : undefined,
    };

    await onAddCard(newCard);
    
    // Reset form
    setFormData({
      name: '',
      bankName: Bank.AXIS_BANK,
      cardType: CardType.REGULAR,
      description: '',
      link: '',
    });
    setBenefits([]);
    setFees({ joiningValue: '', joiningType: 'fixed', annualValue: '', annualType: 'fixed', cashWithdrawal: '2.5', forex: '3.5', walletLoad: '', education: '', utilities: '', rent: '', fuelValue: '', fuelType: 'percentage', other: '' });
    setLounge({ domesticQty: '', domesticPre: '', intlQty: '', intlPre: '' });
    
    toast({
      title: "Success!",
      description: "Credit card added successfully.",
    });
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-financial-light rounded-lg">
            <CreditCard className="h-5 w-5 text-financial-blue" />
          </div>
          <CardTitle className="text-xl text-card-foreground">Add New Credit Card</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Card Name *</Label>
              <Input
                id="cardName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., HDFC Regalia Credit Card"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Select 
                value={formData.bankName}
                onValueChange={(value: Bank) => setFormData({ ...formData, bankName: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Bank).map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardType">Card Type</Label>
              <Select 
                value={formData.cardType} 
                onValueChange={(value: CardType) => 
                  setFormData({ ...formData, cardType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CardType.ENTRY}>Entry Level</SelectItem>
                  <SelectItem value={CardType.REGULAR}>Regular</SelectItem>
                  <SelectItem value={CardType.PREMIUM}>Premium</SelectItem>
                  <SelectItem value={CardType.COBRAND}>Co-brand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link">Card Link</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the card's key features"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Benefits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-financial-light rounded-lg">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={currentBenefit.category} 
                  onValueChange={(value) => setCurrentBenefit({ ...currentBenefit, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={currentBenefit.type} 
                  onValueChange={(value: BenefitType) => 
                    setCurrentBenefit({ ...currentBenefit, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BenefitType.CASHBACK}>Cashback</SelectItem>
                    <SelectItem value={BenefitType.REWARD_POINTS}>Reward Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Value (%)</Label>
                <Input
                  type="number"
                  value={currentBenefit.value}
                  onChange={(e) => setCurrentBenefit({ ...currentBenefit, value: e.target.value })}
                  placeholder="5"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={currentBenefit.description}
                  onChange={(e) => setCurrentBenefit({ ...currentBenefit, description: e.target.value })}
                  placeholder="Optional details"
                />
              </div>
            </div>
            
            <Button 
              type="button" 
              onClick={handleAddBenefit}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit
            </Button>

            {benefits.length > 0 && (
              <div className="space-y-2">
                <Label>Added Benefits</Label>
                <div className="flex flex-wrap gap-2">
                  {benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                      {benefit.category}: {benefit.value}% {benefit.type === BenefitType.REWARD_POINTS ? 'RP' : 'CB'}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-card-foreground">Fees & Charges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Joining Fee</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" value={fees.joiningValue} onChange={(e) => setFees({ ...fees, joiningValue: e.target.value })} placeholder="500" />
                <Select value={fees.joiningType} onValueChange={(v: 'fixed' | 'percentage') => setFees({ ...fees, joiningType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">₹</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Annual Fee</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" value={fees.annualValue} onChange={(e) => setFees({ ...fees, annualValue: e.target.value })} placeholder="500" />
                <Select value={fees.annualType} onValueChange={(v: 'fixed' | 'percentage') => setFees({ ...fees, annualType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">₹</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cash Withdrawal Fee (%)</Label>
              <Input type="number" value={fees.cashWithdrawal} onChange={(e) => setFees({ ...fees, cashWithdrawal: e.target.value })} placeholder="2.5" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>Forex Markup (%)</Label>
              <Input type="number" value={fees.forex} onChange={(e) => setFees({ ...fees, forex: e.target.value })} placeholder="3.5" step="0.1" />
            </div>
          </div>

          <Button type="submit" className="w-full mt-4">
            Add Credit Card
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCreditCardForm;