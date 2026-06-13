from pathlib import Path

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier

from ml.train_fertilizer_model import build_preprocessor, load_training_data


PROJECT_ROOT = Path(__file__).resolve().parent.parent


def evaluate_model(name, classifier, X_train, X_test, y_train, y_test, labels):
    preprocessor, _, _ = build_preprocessor(X_train)
    model = Pipeline(
        steps=[
            ("preprocess", preprocessor),
            ("classifier", classifier),
        ]
    )
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    print(f"\n=== {name} ===")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(f"Macro F1: {f1_score(y_test, predictions, average='macro'):.4f}")
    print("Classification report:")
    print(classification_report(y_test, predictions, labels=labels, zero_division=0))


def main():
    training_data = load_training_data()
    X = training_data["X"]
    y = training_data["y"]
    labels = sorted(y.unique().tolist())

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    evaluate_model(
        "Decision Tree",
        DecisionTreeClassifier(random_state=42, max_depth=6),
        X_train,
        X_test,
        y_train,
        y_test,
        labels,
    )
    evaluate_model(
        "Random Forest",
        RandomForestClassifier(random_state=42, n_estimators=200, max_depth=8),
        X_train,
        X_test,
        y_train,
        y_test,
        labels,
    )
    evaluate_model(
        "Logistic Regression",
        LogisticRegression(max_iter=1000),
        X_train,
        X_test,
        y_train,
        y_test,
        labels,
    )


if __name__ == "__main__":
    main()
