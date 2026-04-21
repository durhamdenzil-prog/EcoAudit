CBAM_CARBON_PRICE_PER_TON_EUR = 65.0

EMISSION_FACTORS = {
    "steel": 1.85, "iron": 1.75, "aluminium": 8.24, "aluminum": 8.24,
    "cement": 0.83, "fertilizer": 2.20, "urea": 0.67, "electricity": 0.43,
    "chemicals": 1.50, "plastic": 2.80, "default": 1.0,
}

CBAM_SECTORS = {"steel", "iron", "aluminium", "aluminum", "cement", "fertilizer", "urea", "electricity"}

def get_emission_factor(product_name: str) -> float:
    for material, factor in EMISSION_FACTORS.items():
        if material in product_name.lower():
            return factor
    return EMISSION_FACTORS["default"]

def calculate_cbam_cost(emission_kg: float) -> float:
    return round((emission_kg / 1000) * CBAM_CARBON_PRICE_PER_TON_EUR, 2)

def is_cbam_applicable(product_name: str) -> bool:
    return any(s in product_name.lower() for s in CBAM_SECTORS)

def calculate_cbam_liability(emission_records: list) -> dict:
    total_kg = 0
    cbam_kg = 0
    breakdown = []
    for r in emission_records:
        total_kg += r.emission_value
        cbam = is_cbam_applicable(r.product_name)
        if cbam:
            cbam_kg += r.emission_value
        breakdown.append({
            "supplier": r.supplier_name,
            "product": r.product_name,
            "emission_kg": r.emission_value,
            "cbam_applicable": cbam,
            "cbam_cost_eur": calculate_cbam_cost(r.emission_value) if cbam else 0,
        })
    return {
        "total_emission_kg": round(total_kg, 2),
        "total_emission_tons": round(total_kg / 1000, 4),
        "cbam_emission_kg": round(cbam_kg, 2),
        "total_cbam_cost_eur": calculate_cbam_cost(cbam_kg),
        "cbam_carbon_price_eur_per_ton": CBAM_CARBON_PRICE_PER_TON_EUR,
        "breakdown": breakdown,
    }