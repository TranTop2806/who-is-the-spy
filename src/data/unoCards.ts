export type UnoColor = "RED" | "YELLOW" | "GREEN" | "BLUE" | "WILD";
export type UnoCardType = "NUMBER" | "SKIP" | "REVERSE" | "DRAW_TWO" | "WILD_CHOOSE" | "WILD_DRAW_FOUR";

export interface UnoCard {
  id: string;
  color: UnoColor;
  type: UnoCardType;
  value?: number; // 0-9
}

export const UNO_COLORS: Exclude<UnoColor, "WILD">[] = ["RED", "YELLOW", "GREEN", "BLUE"];

export const getCardName = (card: UnoCard): string => {
  switch (card.type) {
    case "NUMBER":
      return `${card.value}`;
    case "SKIP":
      return "Cấm lượt";
    case "REVERSE":
      return "Đổi chiều";
    case "DRAW_TWO":
      return "+2 Lá";
    case "WILD_CHOOSE":
      return "Đổi màu";
    case "WILD_DRAW_FOUR":
      return "+4 Đổi màu";
    default:
      return "";
  }
};

export const getCardColorHex = (color: UnoColor): string => {
  switch (color) {
    case "RED":
      return "#ef4444"; // red-500
    case "YELLOW":
      return "#eab308"; // yellow-500
    case "GREEN":
      return "#22c55e"; // green-500
    case "BLUE":
      return "#3b82f6"; // blue-500
    case "WILD":
      return "linear-gradient(45deg, #ef4444, #eab308, #22c55e, #3b82f6)";
    default:
      return "#71717a";
  }
};

export const generateUnoDeck = (): UnoCard[] => {
  const deck: UnoCard[] = [];
  let idCounter = 0;

  const addCard = (color: UnoColor, type: UnoCardType, value?: number) => {
    deck.push({
      id: `uno-${type}-${color}-${value !== undefined ? value : ""}-${idCounter++}`,
      color,
      type,
      value
    });
  };

  // Standard colors
  UNO_COLORS.forEach((color) => {
    // Number 0 (1 card per color)
    addCard(color, "NUMBER", 0);

    // Numbers 1-9 (2 cards per color)
    for (let i = 1; i <= 9; i++) {
      addCard(color, "NUMBER", i);
      addCard(color, "NUMBER", i);
    }

    // Skip, Reverse, Draw Two (2 cards per color)
    for (let i = 0; i < 2; i++) {
      addCard(color, "SKIP");
      addCard(color, "REVERSE");
      addCard(color, "DRAW_TWO");
    }
  });

  // Wild cards (4 cards of each)
  for (let i = 0; i < 4; i++) {
    addCard("WILD", "WILD_CHOOSE");
    addCard("WILD", "WILD_DRAW_FOUR");
  }

  // Shuffle deck
  return deck.sort(() => Math.random() - 0.5);
};

// Check if a card can be played on top of another card
export const isPlayable = (card: UnoCard, topCard: UnoCard, currentActiveColor: UnoColor): boolean => {
  // Wild cards can always be played
  if (card.color === "WILD") return true;

  // Match by color (using the chosen active color for previous wild cards)
  if (card.color === currentActiveColor) return true;

  // Match by type (e.g., Skip on Skip)
  if (card.type === topCard.type && card.type !== "NUMBER") return true;

  // Match by value (e.g., RED 5 on BLUE 5)
  if (card.type === "NUMBER" && topCard.type === "NUMBER" && card.value === topCard.value) return true;

  return false;
};
