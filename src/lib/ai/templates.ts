/**
 * Fallback template blueprints when AI is unavailable.
 * Served within 3 seconds as specified in Requirement 4.5.
 */

export interface TemplateBlueprintItem {
  name: string
  description: string
}

export interface TemplateCategory {
  category: string
  items: TemplateBlueprintItem[]
}

export interface TemplateBlueprint {
  categories: TemplateCategory[]
  climate_info: null
  cultural_norms: null
}

const baseItems: Record<string, TemplateBlueprintItem[]> = {
  climate_kit: [
    { name: 'Weather-appropriate outerwear', description: 'Check destination climate for the month you arrive' },
    { name: 'Umbrella / rain gear', description: 'Compact travel umbrella' },
    { name: 'Layering basics', description: 'T-shirts, long sleeves, light jacket for temperature changes' },
    { name: 'Comfortable walking shoes', description: 'You will walk a lot in your first weeks' },
  ],
  housing_essentials: [
    { name: 'Bedding set', description: 'Pillow, sheets, duvet/blanket in local bed size' },
    { name: 'Towels (2-3)', description: 'Bath and hand towels' },
    { name: 'Basic cleaning supplies', description: 'All-purpose cleaner, sponges, trash bags' },
    { name: 'Hangers (10-15)', description: 'For wardrobe organization' },
    { name: 'Desk lamp', description: 'For late-night studying' },
  ],
  electronics_adapters: [
    { name: 'Universal power adapter', description: 'Check destination country plug type' },
    { name: 'Power strip / extension cord', description: 'Local plug type with multiple outlets' },
    { name: 'Phone charger + cable', description: 'Backup charging cable' },
    { name: 'Laptop + charger', description: 'Essential for coursework' },
  ],
  kitchen_essentials: [
    { name: 'Plate, bowl, mug set', description: 'At least one of each for daily use' },
    { name: 'Cutlery set', description: 'Fork, knife, spoon, chopsticks' },
    { name: 'Small pot + pan', description: 'For basic cooking' },
    { name: 'Water bottle', description: 'Reusable, for campus carry' },
  ],
  local_setup_tasks: [
    { name: 'Get a local SIM card', description: 'Research providers before arrival or buy at airport' },
    { name: 'Open a bank account', description: 'Check which banks have student accounts' },
    { name: 'Get transport card', description: 'Public transit pass or card for your city' },
    { name: 'Register with university', description: 'Complete enrollment and ID card pickup' },
    { name: 'Explore local grocery options', description: 'Find nearest supermarket and budget stores' },
  ],
}

const dormitoryExtras: TemplateBlueprintItem[] = [
  { name: 'Shower caddy', description: 'For shared bathroom essentials' },
  { name: 'Earplugs / sleep mask', description: 'Shared living can be noisy' },
  { name: 'Mini fan or space heater', description: 'Dorms may not have ideal temperature control' },
]

const apartmentExtras: TemplateBlueprintItem[] = [
  { name: 'Basic toolkit', description: 'Screwdriver, hammer, tape measure for furniture setup' },
  { name: 'Cookware set', description: 'More comprehensive than dorm — pots, pans, baking sheet' },
  { name: 'Iron / steamer', description: 'For keeping clothes presentable' },
]

/**
 * Returns a fallback template blueprint based on housing type.
 */
export function getTemplateBluprint(housingType: string): TemplateBlueprint {
  const categories: TemplateCategory[] = Object.entries(baseItems).map(([category, items]) => ({
    category,
    items: [...items],
  }))

  // Add housing-specific extras
  if (housingType === 'dormitory') {
    const housingCat = categories.find((c) => c.category === 'housing_essentials')
    if (housingCat) housingCat.items.push(...dormitoryExtras)
  } else if (housingType.includes('apartment')) {
    const housingCat = categories.find((c) => c.category === 'housing_essentials')
    if (housingCat) housingCat.items.push(...apartmentExtras)
  }

  return {
    categories,
    climate_info: null,
    cultural_norms: null,
  }
}
