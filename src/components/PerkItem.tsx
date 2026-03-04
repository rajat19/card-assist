import { Perk } from '@/types/creditcard';
import PerkItemIcon from './PerkItemIcon';

interface PerkItemProps {
    perk: Perk;
    showDescription?: boolean;
}

const PerkItem = ({ perk, showDescription = true }: PerkItemProps) => {
    return (
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground group">
            {<PerkItemIcon perk={perk} />}
            <div className="flex-1 min-w-0 space-y-1">
                <span className="leading-snug block text-foreground/90 font-medium">
                    {perk.title}
                </span>
                {showDescription && perk.description && (
                    <p className="leading-relaxed text-muted-foreground">
                        {perk.description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PerkItem;
