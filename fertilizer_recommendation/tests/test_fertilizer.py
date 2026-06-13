import pytest

from recommender.fertilizer_service import recommend_fertilizer


VALID_INPUT = {
    "N": 30,
    "P": 45,
    "K": 40,
    "ph": 6.5,
    "soil_moisture": 35,
    "temperature": 28,
    "humidity": 70,
}


def test_valid_input_returns_success():
    result = recommend_fertilizer(VALID_INPUT)
    assert result["status"] == "success"


def test_missing_input_returns_error():
    invalid_input = dict(VALID_INPUT)
    invalid_input.pop("N")
    result = recommend_fertilizer(invalid_input)
    assert result["status"] == "error"


def test_successful_output_contains_required_fields():
    result = recommend_fertilizer(VALID_INPUT)
    assert "recommended_fertilizer" in result
    assert "reason" in result
    assert "method" in result
    assert "decision_source" in result
    assert "rule_prediction" in result
    assert "rule_strength" in result
    assert "ml_prediction" in result
    assert "confidence" in result


def test_final_recommendation_and_reason_do_not_contradict():
    result = recommend_fertilizer(
        {
            "N": 80,
            "P": 70,
            "K": 75,
            "ph": 6.8,
            "soil_moisture": 42,
            "temperature": 27,
            "humidity": 68,
        }
    )
    assert result["recommended_fertilizer"].lower() in result["reason"].lower()


def test_low_confidence_ml_does_not_override_rule_fallback():
    result = recommend_fertilizer(
        {
            "N": 75,
            "P": 70,
            "K": 72,
            "ph": 6.7,
            "soil_moisture": 40,
            "temperature": 26,
            "humidity": 65,
        }
    )
    if result["confidence"] is not None and result["confidence"] < 0.50:
        assert result["decision_source"] == "rule_fallback_due_to_low_ml_confidence"
        assert result["recommended_fertilizer"] == result["rule_prediction"]


def test_bad_input_does_not_crash():
    result = recommend_fertilizer(None)
    assert result["status"] == "error"


def test_invalid_numeric_value_returns_error():
    invalid_input = dict(VALID_INPUT)
    invalid_input["K"] = "bad"
    result = recommend_fertilizer(invalid_input)
    assert result["status"] == "error"


def test_strong_rule_overrides_ml():
    result = recommend_fertilizer(VALID_INPUT)
    assert result["rule_strength"] == "strong"
    assert result["recommended_fertilizer"] == result["rule_prediction"]
    assert result["decision_source"] == "rule_based"
