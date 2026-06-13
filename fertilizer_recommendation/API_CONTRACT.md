# Fertilizer Recommendation API Contract

## Endpoint

`POST /api/recommend/fertilizer/`

## Request JSON

```json
{
  "N": 30,
  "P": 45,
  "K": 40,
  "ph": 6.5,
  "soil_moisture": 35,
  "temperature": 28,
  "humidity": 70
}
```

## Success Response JSON

```json
{
  "status": "success",
  "recommended_fertilizer": "Urea",
  "reason": "Nitrogen level is low, so Urea is recommended.",
  "method": "hybrid",
  "decision_source": "rule_based",
  "rule_prediction": "Urea",
  "rule_strength": "strong",
  "ml_prediction": "Urea",
  "confidence": 0.284,
  "note": "Rule-based recommendation used because nutrient deficiency is clear."
}
```

## Error Response JSON

```json
{
  "status": "error",
  "message": "Missing required field: K"
}
```
