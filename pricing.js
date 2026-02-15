const RATE_PER_TON = 1450;

const PROJECT_COMPLEXITY = {
  low: 0.9,
  medium: 1,
  high: 1.2,
  extreme: 1.4
};

const DELIVERY_SPEED = {
  standard: 1,
  rush: 1.18,
  urgent: 1.32
};

const CONNECTION_DENSITY = {
  low: 0.9,
  medium: 1,
  high: 1.15
};

const DEFAULT_INPUT = {
  tonnage: 20,
  complexity: "medium",
  delivery: "standard",
  connectionDensity: "medium",
  includeErectionDrawings: false,
  includeBOM: true,
  includeFabDrawings: true
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toNumber(input, fallback) {
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeInput(input = {}) {
  const tonnage = clamp(toNumber(input.tonnage, DEFAULT_INPUT.tonnage), 1, 5000);

  const complexity = PROJECT_COMPLEXITY[input.complexity]
    ? input.complexity
    : DEFAULT_INPUT.complexity;

  const delivery = DELIVERY_SPEED[input.delivery]
    ? input.delivery
    : DEFAULT_INPUT.delivery;

  const connectionDensity = CONNECTION_DENSITY[input.connectionDensity]
    ? input.connectionDensity
    : DEFAULT_INPUT.connectionDensity;

  return {
    tonnage,
    complexity,
    delivery,
    connectionDensity,
    includeErectionDrawings: Boolean(input.includeErectionDrawings),
    includeBOM: input.includeBOM !== false,
    includeFabDrawings: input.includeFabDrawings !== false
  };
}

function calculateTeklaQuote(rawInput) {
  const input = normalizeInput(rawInput);

  const basePrice = input.tonnage * RATE_PER_TON;
  const complexityMultiplier = PROJECT_COMPLEXITY[input.complexity];
  const deliveryMultiplier = DELIVERY_SPEED[input.delivery];
  const connectionMultiplier = CONNECTION_DENSITY[input.connectionDensity];

  const optionalServices = {
    erectionDrawings: input.includeErectionDrawings ? 1800 : 0,
    billOfMaterials: input.includeBOM ? 900 : 0,
    fabricationDrawings: input.includeFabDrawings ? 1500 : 0
  };

  const subtotal = basePrice * complexityMultiplier * deliveryMultiplier * connectionMultiplier;
  const optionalTotal =
    optionalServices.erectionDrawings +
    optionalServices.billOfMaterials +
    optionalServices.fabricationDrawings;

  const aiConfidence = clamp(
    0.78 + (input.complexity === "low" ? 0.08 : 0) - (input.delivery === "urgent" ? 0.1 : 0),
    0.65,
    0.95
  );

  const total = Math.round(subtotal + optionalTotal);

  return {
    currency: "USD",
    total,
    breakdown: {
      basePrice: Math.round(basePrice),
      multipliers: {
        complexity: complexityMultiplier,
        delivery: deliveryMultiplier,
        connectionDensity: connectionMultiplier
      },
      optionalServices,
      optionalTotal,
      subtotal: Math.round(subtotal)
    },
    assumptions: [
      "Quote is based on preliminary inputs and standard detailing productivity.",
      "Final commercial quote may vary after model quality and scope review.",
      "Engineering changes and client revisions are priced separately."
    ],
    aiConfidence: Number(aiConfidence.toFixed(2)),
    normalizedInput: input
  };
}

module.exports = {
  calculateTeklaQuote,
  normalizeInput,
  DEFAULT_INPUT
};
