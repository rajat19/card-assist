import { CreditCard } from '@/types/creditcard';
import { getBankIcon, getBankColorHSL } from '@/data/bankIcons';

interface CardImagePlaceholderProps {
    card: CreditCard;
}

const CardImagePlaceholder = ({ card }: CardImagePlaceholderProps) => {
    const hsl = getBankColorHSL(card.bankName);
    const bankIcon = getBankIcon(card.bankName);

    // Build a rich gradient from the bank's accent color
    const gradientDark = `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 15, 10)}%)`;
    const gradientMid = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    const gradientLight = `hsl(${hsl.h}, ${Math.max(hsl.s - 10, 20)}%, ${Math.min(hsl.l + 12, 65)}%)`;

    const cardType = card.cardType === 'premium' ? 'PLATINUM' :
        card.cardType === 'cobrand' ? 'SIGNATURE' :
            card.cardType === 'regular' ? 'CLASSIC' : 'CREDIT';

    return (
        <div className="relative w-full flex justify-center py-4">
            {/* Card container with 16:10 aspect ratio */}
            <div
                className="relative w-[340px] aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    background: `linear-gradient(135deg, ${gradientDark} 0%, ${gradientMid} 50%, ${gradientLight} 100%)`,
                }}
            >
                {/* Subtle pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
                                         radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%),
                                         radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)`,
                    }}
                />

                {/* Decorative arc */}
                <div
                    className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10"
                    style={{ background: `radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)` }}
                />
                <div
                    className="absolute -left-8 -bottom-20 w-48 h-48 rounded-full opacity-[0.07]"
                    style={{ background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)` }}
                />

                {/* Top row: Bank logo / Card type */}
                <div className="absolute top-4 left-5 right-5 flex items-start justify-between">
                    {bankIcon ? (
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5">
                            <img src={bankIcon} alt={card.bankName} className="h-5 w-5 object-contain brightness-0 invert" />
                        </div>
                    ) : (
                        <span className="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase">
                            {card.bankName}
                        </span>
                    )}
                    <span className="text-[10px] font-semibold text-white/70 tracking-[0.15em] uppercase">
                        {cardType}
                    </span>
                </div>

                {/* Chip */}
                <div className="absolute left-5 top-[38%]">
                    <div className="w-10 h-7 rounded-md overflow-hidden border border-white/10">
                        <div className="w-full h-full" style={{
                            background: `linear-gradient(145deg, #e8d5a3 0%, #c9a84c 30%, #f0e2a0 50%, #c9a84c 70%, #b8943e 100%)`,
                        }}>
                            {/* Chip lines */}
                            <div className="w-full h-full grid grid-cols-3 gap-[1px] p-[3px]">
                                <div className="bg-yellow-700/20 rounded-[1px]" />
                                <div className="bg-yellow-700/15 rounded-[1px]" />
                                <div className="bg-yellow-700/20 rounded-[1px]" />
                                <div className="bg-yellow-700/15 rounded-[1px]" />
                                <div className="bg-yellow-700/25 rounded-[1px]" />
                                <div className="bg-yellow-700/15 rounded-[1px]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contactless icon */}
                <div className="absolute right-5 top-[38%]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/50">
                        <path d="M12.5 6.5c3 1.5 5 4.5 5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M10.5 9.5c1.8 0.9 3 2.7 3 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M8.5 12.5c0.6 0.3 1 0.9 1 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Card name */}
                <div className="absolute bottom-10 left-5 right-5">
                    <p className="text-white font-bold text-base tracking-wide truncate drop-shadow-sm" style={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}>
                        {card.name.replace(card.bankName, '').replace('Credit Card', '').trim() || card.name}
                    </p>
                </div>

                {/* Bottom row: Bank name / Network hint */}
                <div className="absolute bottom-3.5 left-5 right-5 flex items-center justify-between">
                    <span className="text-[9px] text-white/50 tracking-wider uppercase">
                        {card.bankName}
                    </span>
                    {/* Network circles (Mastercard-style) */}
                    <div className="flex -space-x-1.5">
                        <div className="w-4 h-4 rounded-full opacity-50" style={{ background: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 25, 80)}%)` }} />
                        <div className="w-4 h-4 rounded-full opacity-40" style={{ background: `hsl(${(hsl.h + 30) % 360}, ${hsl.s}%, ${Math.min(hsl.l + 20, 75)}%)` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardImagePlaceholder;
