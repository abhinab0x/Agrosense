from recommender.fertilizer_ml import ml_fertilizer_prediction
from recommender.fertilizer_rules import rule_based_fertilizer_recommendation


REQUIRED_FIELDS = [
    "N",
    "P",
    "K",
    "ph",
    "soil_moisture",
    "temperature",
    "humidity",
]

ML_CONFIDENCE_THRESHOLD = 0.50


def _to_number(field_name: str, value):
    if value is None or value == "":
        raise ValueError(f"Missing required field: {field_name}")

    try:
        return float(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"Invalid value for {field_name}: must be a number") from error


def _build_ml_reason(fertilizer: str, confidence) -> str:
    confidence_text = "unknown confidence"
    if confidence is not None:
        confidence_text = f"confidence {confidence:.3f}"

    return (
        f"The Decision Tree model predicted {fertilizer} with {confidence_text}, "
        f"so {fertilizer} is recommended by the ML layer."
    )


def _ensure_reason_matches_recommendation(recommended_fertilizer: str, reason: str) -> str:
    if recommended_fertilizer.lower() in reason.lower():
        return reason

    return f"{recommended_fertilizer} is recommended. {reason}"


def recommend_fertilizer(data: dict) -> dict:
    if not isinstance(data, dict):
        return {
            "status": "error",
            "message": "Input data must be a dictionary.",
        }

    sanitized = dict(data)

    try:
        for field_name in REQUIRED_FIELDS:
            sanitized[field_name] = _to_number(field_name, data.get(field_name))

        if "organic_matter" in data and data.get("organic_matter") not in (None, ""):
            sanitized["organic_matter"] = _to_number("organic_matter", data.get("organic_matter"))
    except ValueError as error:
        return {
            "status": "error",
            "message": str(error),
        }

    rule_result = rule_based_fertilizer_recommendation(sanitized)
    ml_result = ml_fertilizer_prediction(sanitized)

    ml_prediction = ml_result.get("fertilizer")
    ml_confidence = ml_result.get("confidence")
    note = ""

    if rule_result["strength"] == "strong":
        recommended_fertilizer = rule_result["fertilizer"]
        reason = rule_result["reason"]
        decision_source = "rule_based"
        note = "Rule-based recommendation used because nutrient deficiency is clear."
    elif ml_result.get("status") == "success" and ml_confidence is not None and ml_confidence >= ML_CONFIDENCE_THRESHOLD:
        recommended_fertilizer = ml_prediction
        reason = _build_ml_reason(ml_prediction, ml_confidence)
        decision_source = "ml_model"
        note = "ML recommendation used because the model confidence met the minimum threshold."
    else:
        recommended_fertilizer = rule_result["fertilizer"]
        reason = rule_result["reason"]
        decision_source = "rule_fallback_due_to_low_ml_confidence"
        if ml_result.get("status") == "success":
            note = (
                f"ML prediction confidence ({ml_confidence:.3f}) was below the 0.50 threshold, "
                "so the rule-based recommendation was used as a safe fallback."
            )
        else:
            note = "ML prediction was unavailable, so the rule-based recommendation was used as a safe fallback."

    reason = _ensure_reason_matches_recommendation(recommended_fertilizer, reason)

    response = {
        "status": "success",
        "recommended_fertilizer": recommended_fertilizer,
        "reason": reason,
        "method": "hybrid",
        "decision_source": decision_source,
        "rule_prediction": rule_result["fertilizer"],
        "rule_strength": rule_result["strength"],
        "ml_prediction": ml_prediction,
        "confidence": ml_confidence,
        "note": note,
    }

    return response
