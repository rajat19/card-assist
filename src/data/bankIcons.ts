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

// Brand-inspired HSL accent colors per bank
const BANK_COLORS: Record<string, { h: number; s: number; l: number }> = {
    [Bank.AXIS_BANK]: { h: 340, s: 70, l: 55 },
    [Bank.FEDERAL_BANK]: { h: 210, s: 70, l: 50 },
    [Bank.HDFC_BANK]: { h: 210, s: 80, l: 45 },
    [Bank.ICICI_BANK]: { h: 20, s: 85, l: 50 },
    [Bank.IDFC_FIRST_BANK]: { h: 340, s: 75, l: 48 },
    [Bank.INDUSIND_BANK]: { h: 210, s: 55, l: 40 },
    [Bank.RBL_BANK]: { h: 25, s: 80, l: 50 },
    [Bank.SBI_BANK]: { h: 210, s: 90, l: 40 },
    [Bank.YES_BANK]: { h: 210, s: 65, l: 45 },
    [Bank.KOTAK_MAHINDRA_BANK]: { h: 340, s: 85, l: 45 },
    [Bank.BANK_OF_BARODA]: { h: 15, s: 80, l: 48 },
    [Bank.AU_BANK]: { h: 280, s: 60, l: 50 },
    [Bank.HSBC_BANK]: { h: 0, s: 75, l: 48 },
};

export interface BankColorStyle {
    bg: string;
    border: string;
    accent: string;
}

export function getBankColor(bankName: string): BankColorStyle {
    const color = BANK_COLORS[bankName] ?? { h: 213, s: 40, l: 50 };
    return {
        bg: `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.06)`,
        border: `hsl(${color.h}, ${color.s}%, ${color.l}%)`,
        accent: `hsl(${color.h}, ${color.s}%, ${color.l}%)`,
    };
}

export function getBankColorHSL(bankName: string): { h: number; s: number; l: number } {
    return BANK_COLORS[bankName] ?? { h: 213, s: 40, l: 50 };
}

export default BANK_ICONS;
