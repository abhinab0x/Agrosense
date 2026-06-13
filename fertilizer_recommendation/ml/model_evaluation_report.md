# Fertilizer Model Evaluation Report

## Dataset

- Dataset used: `data/Crop_data.csv`
- Target column: `fertilizer_type`
- Selected input columns: N, P, K, temperature, humidity, ph, rainfall, soil_moisture, organic_matter, crop_type, soil_type
- Fertilizer classes: Compost, NPK Fertilizer, Organic Manure, Urea

## Results

- Majority-class baseline accuracy: 0.2675
- Decision Tree accuracy: 0.2300
- Macro F1 score: 0.1783

## Fertilizer Label Distribution

```text
fertilizer_type
Compost           486
NPK Fertilizer    487
Organic Manure    532
Urea              494
```

## Why Accuracy Is Low

The current dataset does not appear to show a strongly separable pattern between the selected soil/environmental inputs and `fertilizer_type`. That means different fertilizer labels can appear for similar input conditions, which makes prediction harder for a simple Decision Tree.

## Design Decision

Because the model accuracy is limited, this project uses a hybrid approach:

- Rule-based logic is the reliable and explainable layer.
- The Decision Tree is the supporting data-driven layer.
- Low-confidence ML predictions should not override clear rule-based recommendations.

## Classification Report

```text
                precision    recall  f1-score   support

       Compost       0.19      0.06      0.09        97
NPK Fertilizer       0.19      0.04      0.07        97
Organic Manure       0.24      0.58      0.34       107
          Urea       0.22      0.20      0.21        99

      accuracy                           0.23       400
     macro avg       0.21      0.22      0.18       400
  weighted avg       0.21      0.23      0.18       400

```

## Confusion Matrix

| Actual \ Predicted | Compost | NPK Fertilizer | Organic Manure | Urea |
|---|---|---|---|---|
| Compost | 6 | 5 | 69 | 17 |
| NPK Fertilizer | 9 | 4 | 64 | 20 |
| Organic Manure | 9 | 4 | 62 | 32 |
| Urea | 8 | 8 | 63 | 20 |

## Improvement Plan

- Verify dataset source and data collection assumptions.
- Verify fertilizer labels for consistency and real-world meaning.
- Improve and clean fertilizer labels if similar categories overlap.
- Compare models beyond Decision Tree while keeping Decision Tree as the main proposal-aligned model.
- Tune Decision Tree depth and splitting parameters.
- Use the confusion matrix to inspect which fertilizer classes are most often mixed up.
- Validate fertilizer rules with agricultural domain knowledge.
