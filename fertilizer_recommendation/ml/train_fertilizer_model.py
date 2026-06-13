from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.tree import DecisionTreeClassifier


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "Crop_data.csv"
MODEL_PATH = PROJECT_ROOT / "ml" / "fertilizer_pipeline.pkl"
REPORT_PATH = PROJECT_ROOT / "ml" / "model_evaluation_report.md"

FEATURE_CANDIDATES = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "pH",
    "rainfall",
    "soil_moisture",
    "organic_matter",
    "crop_type",
    "soil_type",
]

TARGET_CANDIDATES = [
    "fertilizer_type",
    "fertilizer",
    "fertilizer recommendation",
    "recommended_fertilizer",
]


def normalize_name(name: str) -> str:
    return "".join(char.lower() for char in name if char.isalnum())


def find_matching_column(columns, candidates):
    normalized_map = {normalize_name(column): column for column in columns}

    for candidate in candidates:
        direct_match = normalized_map.get(normalize_name(candidate))
        if direct_match:
            return direct_match

    return None


def build_column_list(columns):
    selected_columns = []
    seen = set()

    for candidate in FEATURE_CANDIDATES:
        match = find_matching_column(columns, [candidate])
        if match and match not in seen:
            selected_columns.append(match)
            seen.add(match)

    return selected_columns


def load_training_data():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    dataframe = pd.read_csv(DATA_PATH)
    available_columns = list(dataframe.columns)
    target_column = find_matching_column(available_columns, TARGET_CANDIDATES)

    if not target_column:
        raise ValueError("Could not find a fertilizer target column in the dataset.")

    input_columns = build_column_list(available_columns)
    if not input_columns:
        raise ValueError("No usable input columns were found for fertilizer training.")

    cleaned_dataframe = dataframe.dropna(subset=[target_column]).copy()
    X = cleaned_dataframe[input_columns].copy()
    y = cleaned_dataframe[target_column].astype(str)

    return {
        "dataframe": cleaned_dataframe,
        "available_columns": available_columns,
        "target_column": target_column,
        "input_columns": input_columns,
        "X": X,
        "y": y,
    }


def build_preprocessor(X):
    numeric_columns = X.select_dtypes(include=["number"]).columns.tolist()
    categorical_columns = [column for column in X.columns if column not in numeric_columns]

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocess = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, numeric_columns),
            ("cat", categorical_pipeline, categorical_columns),
        ]
    )

    return preprocess, numeric_columns, categorical_columns


def build_decision_tree_pipeline(X):
    preprocess, numeric_columns, categorical_columns = build_preprocessor(X)
    pipeline = Pipeline(
        steps=[
            ("preprocess", preprocess),
            ("classifier", DecisionTreeClassifier(random_state=42, max_depth=6)),
        ]
    )
    return pipeline, numeric_columns, categorical_columns


def evaluate_predictions(y_true, y_pred, labels):
    majority_class = y_true.mode().iloc[0]
    baseline_predictions = [majority_class] * len(y_true)

    metrics = {
        "majority_class": majority_class,
        "baseline_accuracy": accuracy_score(y_true, baseline_predictions),
        "accuracy": accuracy_score(y_true, y_pred),
        "macro_f1": f1_score(y_true, y_pred, average="macro"),
        "classification_report": classification_report(
            y_true,
            y_pred,
            labels=labels,
            zero_division=0,
        ),
        "confusion_matrix": confusion_matrix(y_true, y_pred, labels=labels),
    }
    return metrics


def write_report(report_data):
    confusion_lines = []
    labels = report_data["fertilizer_classes"]
    matrix = report_data["metrics"]["confusion_matrix"]
    header = "| Actual \\ Predicted | " + " | ".join(labels) + " |"
    divider = "|---|" + "|".join(["---"] * len(labels)) + "|"
    confusion_lines.extend([header, divider])

    for label, row in zip(labels, matrix):
        confusion_lines.append("| " + label + " | " + " | ".join(str(value) for value in row) + " |")

    report_text = f"""# Fertilizer Model Evaluation Report

## Dataset

- Dataset used: `data/Crop_data.csv`
- Target column: `{report_data["target_column"]}`
- Selected input columns: {", ".join(report_data["input_columns"])}
- Fertilizer classes: {", ".join(report_data["fertilizer_classes"])}

## Results

- Majority-class baseline accuracy: {report_data["metrics"]["baseline_accuracy"]:.4f}
- Decision Tree accuracy: {report_data["metrics"]["accuracy"]:.4f}
- Macro F1 score: {report_data["metrics"]["macro_f1"]:.4f}

## Fertilizer Label Distribution

```text
{report_data["label_distribution"]}
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
{report_data["metrics"]["classification_report"]}
```

## Confusion Matrix

{chr(10).join(confusion_lines)}

## Improvement Plan

- Verify dataset source and data collection assumptions.
- Verify fertilizer labels for consistency and real-world meaning.
- Improve and clean fertilizer labels if similar categories overlap.
- Compare models beyond Decision Tree while keeping Decision Tree as the main proposal-aligned model.
- Tune Decision Tree depth and splitting parameters.
- Use the confusion matrix to inspect which fertilizer classes are most often mixed up.
- Validate fertilizer rules with agricultural domain knowledge.
"""

    REPORT_PATH.write_text(report_text)


def main():
    training_data = load_training_data()
    X = training_data["X"]
    y = training_data["y"]
    fertilizer_classes = sorted(y.unique().tolist())

    model, numeric_columns, categorical_columns = build_decision_tree_pipeline(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    metrics = evaluate_predictions(y_test, predictions, fertilizer_classes)
    label_distribution = y.value_counts().sort_index().to_string()

    print("Available columns:", training_data["available_columns"])
    print("Selected input columns:", training_data["input_columns"])
    print("Target column:", training_data["target_column"])
    print("Fertilizer classes:", fertilizer_classes)
    print("Fertilizer label distribution:")
    print(label_distribution)
    print(f"Majority-class baseline accuracy: {metrics['baseline_accuracy']:.4f}")
    print(f"Decision Tree accuracy: {metrics['accuracy']:.4f}")
    print(f"Macro F1 score: {metrics['macro_f1']:.4f}")
    print("Classification report:")
    print(metrics["classification_report"])
    print("Confusion matrix:")
    print(metrics["confusion_matrix"])
    print("Numeric columns:", numeric_columns)
    print("Categorical columns:", categorical_columns)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    write_report(
        {
            "target_column": training_data["target_column"],
            "input_columns": training_data["input_columns"],
            "fertilizer_classes": fertilizer_classes,
            "label_distribution": label_distribution,
            "metrics": metrics,
        }
    )

    print(f"Saved model to: {MODEL_PATH}")
    print(f"Saved evaluation report to: {REPORT_PATH}")


if __name__ == "__main__":
    main()
