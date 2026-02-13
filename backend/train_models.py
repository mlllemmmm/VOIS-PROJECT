# train_models.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Create models directory if not exists
os.makedirs("models", exist_ok=True)

def train_model(csv_path, target_column, model_name):
    df = pd.read_csv(csv_path)

    # Encode categorical columns
    for col in df.columns:
        if df[col].dtype == "object":
            df[col] = LabelEncoder().fit_transform(df[col])

    X = df.drop(target_column, axis=1)
    y = df[target_column]

    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Logistic Regression model
    model = LogisticRegression(max_iter=1000, class_weight="balanced")
    model.fit(X_train, y_train)

    # Save model
    joblib.dump(model, f"models/{model_name}.pkl")
    print(f"{model_name} trained successfully!")

# ===================== Train models =====================
train_model("data/heart.csv", "Heart_Disease", "heart_model")
train_model("data/diabetes.csv", "diabetes", "diabetes_model")
train_model("data/lung.csv", "LUNG_CANCER", "lung_model")
