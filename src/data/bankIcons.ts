import { Bank } from '@/types/creditcard';

import axisBank from '@/assets/bank-icons/axis-bank.png';
import federalBank from '@/assets/bank-icons/federal-bank.png';
import hdfcBank from '@/assets/bank-icons/hdfc-bank.png';
import iciciBank from '@/assets/bank-icons/icici-bank.png';
import idfcFirstBank from '@/assets/bank-icons/idfc-first-bank.png';
import indusindBank from '@/assets/bank-icons/indusind-bank.png';
import rblBank from '@/assets/bank-icons/rbl-bank.png';
import sbiBank from '@/assets/bank-icons/sbi-bank.png';
import yesBank from '@/assets/bank-icons/yes-bank.png';

const BANK_ICONS: Record<string, string> = {
    [Bank.AXIS_BANK]: axisBank,
    [Bank.FEDERAL_BANK]: federalBank,
    [Bank.HDFC_BANK]: hdfcBank,
    [Bank.ICICI_BANK]: iciciBank,
    [Bank.IDFC_FIRST_BANK]: idfcFirstBank,
    [Bank.INDUSIND_BANK]: indusindBank,
    [Bank.RBL_BANK]: rblBank,
    [Bank.SBI_BANK]: sbiBank,
    [Bank.YES_BANK]: yesBank,
};

export function getBankIcon(bankName: string): string | undefined {
    return BANK_ICONS[bankName];
}

export default BANK_ICONS;
