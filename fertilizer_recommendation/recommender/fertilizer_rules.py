def _to_float(value):
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def rule_based_fertilizer_recommendation(data: dict) -> dict:
    n_value = _to_float(data.get("N"))
    p_value = _to_float(data.get("P"))
    k_value = _to_float(data.get("K"))
    ph_value = _to_float(data.get("ph", data.get("pH")))
    organic_matter = _to_float(data.get("organic_matter"))

    low_npk_threshold = 40
    low_organic_threshold = 3

    ph_note = ""
    if ph_value is not None:
        if ph_value < 5.5:
            ph_note = " Soil pH suggests the soil is acidic."
        elif ph_value > 7.5:
            ph_note = " Soil pH suggests the soil is alkaline."

    if (
        n_value is not None
        and p_value is not None
        and k_value is not None
        and n_value < low_npk_threshold
        and p_value < low_npk_threshold
        and k_value < low_npk_threshold
    ):
        return {
            "fertilizer": "NPK Fertilizer",
            "reason": "Nitrogen, phosphorus, and potassium levels are all low, so NPK Fertilizer is recommended." + ph_note,
            "strength": "strong",
        }

    if n_value is not None and n_value < low_npk_threshold:
        return {
            "fertilizer": "Urea",
            "reason": "Nitrogen level is low, so Urea is recommended." + ph_note,
            "strength": "strong",
        }

    if organic_matter is not None and organic_matter < low_organic_threshold:
        return {
            "fertilizer": "Compost",
            "reason": "Organic matter is low, so Compost is recommended to improve soil health." + ph_note,
            "strength": "medium",
        }

    return {
        "fertilizer": "Organic Manure",
        "reason": "Soil nutrients are not critically low, so Organic Manure is recommended as a balanced default." + ph_note,
        "strength": "weak",
    }
