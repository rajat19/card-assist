import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, CreditCard as CreditCardIcon } from 'lucide-react';
import { Benefit, BenefitType, Bank, CardType, CATEGORIES, CreditCard } from '@/types/creditcard';

export interface CardFormProps {
  mode: 'add' | 'edit';
  initial?: CreditCard;
  onSubmit: (card: CreditCard) => void | Promise<void>;
  onCancel?: () => void;
}

export default function CardForm({ mode, initial, onSubmit, onCancel }: CardFormProps) {
  const [formData, setFormData] = useState({
    name: initial?.name ?? '',
    bankName: (initial?.bankName ?? null) as Bank | null,
    cardType: initial?.cardType ?? CardType.REGULAR,
    description: initial?.description ?? '',
    link: initial?.link ?? '',
  });

  const [benefits, setBenefits] = useState<Benefit[]>(initial?.benefits ?? []);
  const [currentBenefit, setCurrentBenefit] = useState({
    category: '',
    type: BenefitType.CASHBACK as BenefitType,
    value: '',
    description: '',
  });

  const [fees, setFees] = useState({
    joiningValue: String(initial?.feesAndCharges.joining?.value ?? ''),
    joiningType: initial?.feesAndCharges.joining?.type ?? 'fixed',
    annualValue: String(initial?.feesAndCharges.annual?.value ?? ''),
    annualType: initial?.feesAndCharges.annual?.type ?? 'fixed',
    cashWithdrawal: String(initial?.feesAndCharges.cashWithdrawal?.value ?? '2.5'),
    forex: String(initial?.feesAndCharges.forex?.value ?? '3.5'),
    walletLoad: String(initial?.feesAndCharges.walletLoad?.value ?? ''),
    education: String(initial?.feesAndCharges.educationTransaction?.value ?? ''),
    utilities: String(initial?.feesAndCharges.utilityBillPayment?.value ?? ''),
    rent: String(initial?.feesAndCharges.rentTransaction?.value ?? ''),
    fuelValue: String(initial?.feesAndCharges.fuelTransaction?.value ?? ''),
    fuelType: initial?.feesAndCharges.fuelTransaction?.type ?? 'percentage',
    other: String(initial?.feesAndCharges.other?.value ?? ''),
  });

  const [lounge, setLounge] = useState({
    domesticQty: initial?.lounge?.domestic?.quantity ? String(initial.lounge.domestic.quantity) : '',
    domesticPre: initial?.lounge?.domestic?.precondition ?? '',
    intlQty: initial?.lounge?.international?.quantity ? String(initial.lounge.international.quantity) : '',
    intlPre: initial?.lounge?.international?.precondition ?? '',
  });

  const handleAddBenefit = () => {
    if (!currentBenefit.category || !currentBenefit.value) return;
    const valueNum = parseFloat(currentBenefit.value);
    if (!Number.isFinite(valueNum)) return;
    const newBenefit: Benefit = {
      category: currentBenefit.category,
      type: currentBenefit.type,
      value: valueNum,
      description: currentBenefit.description || undefined,
    };
    setBenefits([...benefits, newBenefit]);
    setCurrentBenefit({ category: '', type: BenefitType.CASHBACK, value: '', description: '' });
  };

  const removeBenefit = (index: number) => setBenefits(benefits.filter((_, i) => i !== index));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.bankName || benefits.length === 0) return;
    const payload: CreditCard = {
      name: formData.name,
      bankName: formData.bankName,
      cardType: formData.cardType,
      description: formData.description || undefined,
      benefits,
      link: formData.link || '#',
      feesAndCharges: {
        joining: { value: parseFloat(fees.joiningValue) || 0, type: fees.joiningType as 'fixed' | 'percentage' },
        annual: { value: parseFloat(fees.annualValue) || 0, type: fees.annualType as 'fixed' | 'percentage' },
        cashWithdrawal: { value: parseFloat(fees.cashWithdrawal) || 0, type: 'percentage' },
        forex: { value: parseFloat(fees.forex) || 0, type: 'percentage' },
        walletLoad: fees.walletLoad ? { value: parseFloat(fees.walletLoad) || 0, type: 'percentage' } : undefined,
        educationTransaction: fees.education ? { value: parseFloat(fees.education) || 0, type: 'percentage' } : undefined,
        utilityBillPayment: fees.utilities ? { value: parseFloat(fees.utilities) || 0, type: 'percentage' } : undefined,
        rentTransaction: fees.rent ? { value: parseFloat(fees.rent) || 0, type: 'percentage' } : undefined,
        fuelTransaction: fees.fuelValue ? { value: parseFloat(fees.fuelValue) || 0, type: fees.fuelType as 'fixed' | 'percentage' } : undefined,
        other: fees.other ? { value: parseFloat(fees.other) || 0, type: 'percentage' } : undefined,
      },
      lounge: (lounge.domesticQty || lounge.intlQty) ? {
        domestic: lounge.domesticQty ? { quantity: parseInt(lounge.domesticQty) || 0, precondition: lounge.domesticPre || '' } : undefined,
        international: lounge.intlQty ? { quantity: parseInt(lounge.intlQty) || 0, precondition: lounge.intlPre || '' } : undefined,
      } : undefined,
    };
    await onSubmit(payload);
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-financial-light rounded-lg">
            <CreditCardIcon className="h-5 w-5 text-financial-blue" />
          </div>
          <CardTitle className="text-xl text-card-foreground">{mode === 'add' ? 'Add New Credit Card' : 'Edit Credit Card'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Card Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Bank Name *</Label>
              <Select value={formData.bankName} required onValueChange={(value: Bank) => setFormData({ ...formData, bankName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
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
              <Label>Card Type</Label>
              <Select value={formData.cardType} onValueChange={(value: CardType) => setFormData({ ...formData, cardType: value })}>
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
              <Label>Card Link</Label>
              <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[80px]" />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-financial-light rounded-lg">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={currentBenefit.category} onValueChange={(value) => setCurrentBenefit({ ...currentBenefit, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={currentBenefit.type} onValueChange={(value: BenefitType) => setCurrentBenefit({ ...currentBenefit, type: value })}>
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
                <Input type="number" value={currentBenefit.value} onChange={(e) => setCurrentBenefit({ ...currentBenefit, value: e.target.value })} min="0" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={currentBenefit.description} onChange={(e) => setCurrentBenefit({ ...currentBenefit, description: e.target.value })} />
              </div>
            </div>
            <Button type="button" onClick={handleAddBenefit} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Benefit
            </Button>
            {benefits.length > 0 && (
              <div className="space-y-2">
                <Label>Added Benefits</Label>
                <div className="flex flex-wrap gap-2">
                  {benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                      {benefit.category}: {benefit.value}% {benefit.type === BenefitType.REWARD_POINTS ? 'RP' : 'CB'}
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeBenefit(index)} className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground">
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
            <div className="space-y-2">
              <Label>Wallet Load Fee (%)</Label>
              <Input type="number" value={fees.walletLoad} onChange={(e) => setFees({ ...fees, walletLoad: e.target.value })} step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>Education Transaction Fee (%)</Label>
              <Input type="number" value={fees.education} onChange={(e) => setFees({ ...fees, education: e.target.value })} step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>Utilities Fee (%)</Label>
              <Input type="number" value={fees.utilities} onChange={(e) => setFees({ ...fees, utilities: e.target.value })} step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>Rent Transaction Fee (%)</Label>
              <Input type="number" value={fees.rent} onChange={(e) => setFees({ ...fees, rent: e.target.value })} step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>Fuel Transaction</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" value={fees.fuelValue} onChange={(e) => setFees({ ...fees, fuelValue: e.target.value })} />
                <Select value={fees.fuelType} onValueChange={(v: 'fixed' | 'percentage') => setFees({ ...fees, fuelType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">₹</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Other Fee (%)</Label>
              <Input type="number" value={fees.other} onChange={(e) => setFees({ ...fees, other: e.target.value })} step="0.1" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-card-foreground">Lounge Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Domestic Visits</Label>
              <Input type="number" value={lounge.domesticQty} onChange={(e) => setLounge({ ...lounge, domesticQty: e.target.value })} placeholder="0" />
              <Input value={lounge.domesticPre} onChange={(e) => setLounge({ ...lounge, domesticPre: e.target.value })} placeholder="Precondition (e.g., minimum spend)" />
            </div>
            <div className="space-y-2">
              <Label>International Visits</Label>
              <Input type="number" value={lounge.intlQty} onChange={(e) => setLounge({ ...lounge, intlQty: e.target.value })} placeholder="0" />
              <Input value={lounge.intlPre} onChange={(e) => setLounge({ ...lounge, intlPre: e.target.value })} placeholder="Precondition" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button type="submit" className="w-full">{mode === 'add' ? 'Add Credit Card' : 'Save Changes'}</Button>
            {onCancel && (
              <Button type="button" variant="outline" className="w-full" onClick={onCancel}>Cancel</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


