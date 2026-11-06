const NAMES = {
    shield: "Shield",
    double: "Double Down",
    freeze: "Freeze",
    reverse: "Reverse",
};

export function describeRoll(r) {
    if (r.shielded) return "Your shield saved you from the 1!";
    if (r.busted) return "You rolled a 1. Turn lost.";
    if (r.won) return `You rolled a ${r.value} and won the game!`;
    const parts = [`You rolled a ${r.value}`];
    if (r.gained && r.gained !== r.value) parts.push(`(doubled to ${r.gained})`);
    if (r.earned) parts.push(`and earned ${NAMES[r.earned]}!`);
    return parts.join(" ");
}