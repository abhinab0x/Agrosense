# AgroSense Fertilizer Recommendation Module

This module is the fertilizer recommendation part of the COMP207 AgroSense project. It focuses only on turning soil and environmental data into a fertilizer suggestion, and it is designed to stay simple, explainable, and ready for future backend API integration.

## What This Module Does

It accepts confirmed AgroSense soil and environment inputs and returns a fertilizer recommendation in a JSON-like dictionary. The module combines:

- rule-based logic for clear nutrient deficiency cases
- a Decision Tree model for supporting data-driven prediction
- a hybrid decision layer that decides which result is safe to return

This repository does not build the frontend, ESP32 firmware, full Django project, crop recommendation, or irrigation recommendation.

## Confirmed Input Fields

- `N`
- `P`
- `K`
- `ph`
- `soil_moisture`
- `temperature`
- `humidity`

Optional additional fields can also be used internally by the ML helper when available, such as `organic_matter`, `rainfall`, `crop_type`, and `soil_type`.

## Output Format

```python
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

Error example:

```python
{
    "status": "error",
    "message": "Missing required field: K"
}
```

## How Rule-Based Logic Works

The rule layer is intentionally simple and viva-friendly:

- If `N`, `P`, and `K` are all low, recommend `NPK Fertilizer`
- Else if `N` is low, recommend `Urea`
- Else if `organic_matter` is low, recommend `Compost`
- Else recommend `Organic Manure`

The rule layer also adds a simple pH warning when soil is acidic or alkaline.

## How The Decision Tree Model Works

The ML layer trains a Decision Tree classifier using `data/Crop_data.csv`. It uses available columns such as:

- `N`, `P`, `K`
- `temperature`, `humidity`, `ph`
- `rainfall`, `soil_moisture`, `organic_matter`
- `crop_type`, `soil_type`

Missing values are handled with imputers, categorical values are encoded safely, and the full preprocessing + model flow is stored in `ml/fertilizer_pipeline.pkl`.

## How Hybrid Decision Works

The service layer uses this logic:

- If rule strength is `strong`, use the rule result
- Else if ML prediction is successful and confidence is at least `0.50`, use the ML result
- Else fall back to the rule result

The current ML accuracy is low, so the system does not blindly trust ML. Rule-based logic is used as the reliable layer when nutrient deficiency is clear or when ML confidence is low.

## Why ML Accuracy Is Currently Low

The current Decision Tree accuracy is low because the dataset does not appear to have a strongly separable relationship between the selected soil/environment inputs and the `fertilizer_type` labels. Similar input conditions can map to different fertilizer labels, so the model should be treated as a supporting layer, not the only decision-maker.

## Setup

Create a virtual environment if needed:

```bash
python3 -m venv venv
```

Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

## Train

```bash
python ml/train_fertilizer_model.py
```

## Test Sample Run

```bash
python test_run.py
```

## Run Demo Cases

```bash
python demo_cases.py
```

## Run Tests

```bash
python -m pytest tests/test_fertilizer.py
```

## Main Integration Function

```python
from recommender.fertilizer_service import recommend_fertilizer

result = recommend_fertilizer(data)
```

## Future Django API Endpoint

```text
POST /api/recommend/fertilizer/
```
