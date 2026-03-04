import { CreditCard } from '@/types/creditcard';

import axisCards from './cards/axis.json';
import hdfcCards from './cards/hdfc.json';
import iciciCards from './cards/icici.json';
import idfcFirstCards from './cards/idfc-first.json';
import federalCards from './cards/federal.json';
import indusindCards from './cards/indusind.json';
import rblCards from './cards/rbl.json';
import sbiCards from './cards/sbi.json';
import yesCards from './cards/yes.json';

export const CREDIT_CARDS: CreditCard[] = [
  ...axisCards,
  ...hdfcCards,
  ...iciciCards,
  ...idfcFirstCards,
  ...federalCards,
  ...indusindCards,
  ...rblCards,
  ...sbiCards,
  ...yesCards,
].sort((a, b) => a.name.localeCompare(b.name)) as CreditCard[];