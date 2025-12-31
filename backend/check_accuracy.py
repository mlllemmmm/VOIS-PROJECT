# check_accuracy.py

import pandas as pd
from joblib import load
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# ===================== Configuration =====================
CSV_PATH = "data/heart.csv"        # Change to your dataset
MODEL_PATH = "models/heart_model.pkl"  # Path to trained model
TARGET_COLUMN = "Heart_Disease"

# ===================== Load dataset =====================
df = pd.read_csv(CSV_PATH)

# ===================== Normalize categorical text =====================
text_columns = [
    "Sex", "Exercise", "Checkup", "General_Health",
    "Skin_Cancer", "Other_Cancer", "Depression",
    "Diabetes", "Arthritis", "Smoking_History",
    "Alcohol_Consumption", "Age_Category", TARGET_COLUMN
]

for col in text_columns:
    if col in df.columns and df[col].dtype == 'object':
        df[col] = df[col].str.strip().str.title()

# ===================== Mapping dictionaries =====================
gender_map = {"Male": 0, "Female": 1}
yes_no_map = {"No": 0, "Yes": 1}
smoking_map = {"Never": 0, "Former": 1, "Current": 2}
alcohol_map = {"Never": 0, "Occasionally": 1, "Frequently": 2}
health_map = {"Poor": 0, "Fair": 1, "Good": 2, "Very Good": 3, "Excellent": 4}
age_map = {
    "18-24": 0, "25-29": 1, "30-34": 2, "35-39": 3, "40-44": 4,
    "45-49": 5, "50-54": 6, "55-59": 7, "60-64": 8, "65-69": 9,
    "70-74": 10, "75-79": 11, "80+": 12
}

mapping_dict = {
    "Sex": gender_map,
    "Exercise": yes_no_map,
    "Checkup": yes_no_map,
    "General_Health": health_map,
    "Skin_Cancer": yes_no_map,
    "Other_Cancer": yes_no_map,
    "Depression": yes_no_map,
    "Diabetes": yes_no_map,
    "Arthritis": yes_no_map,
    "Smoking_History": smoking_map,
    "Alcohol_Consumption": alcohol_map,
    "Age_Category": age_map,
    TARGET_COLUMN: yes_no_map  # Encode target as 0/1
}

# ===================== Encode categorical columns =====================
for col, map_dict in mapping_dict.items():
    if col in df.columns:
        df[col] = df[col].map(map_dict)

# ===================== Split features and target =====================
X = df.drop(TARGET_COLUMN, axis=1)
y = df[TARGET_COLUMN]

# ===================== Handle missing values =====================
numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
X[numeric_cols] = X[numeric_cols].fillna(X[numeric_cols].mean())

categorical_cols = X.select_dtypes(include=['object', 'category']).columns
for col in categorical_cols:
    mode_val = X[col].mode()
    if not mode_val.empty:
        X[col] = X[col].fillna(mode_val[0])

X = X.fillna(0)

# ===================== Split train/test =====================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ===================== Load trained model =====================
model = load(MODEL_PATH)

# ===================== Make predictions =====================
y_pred = model.predict(X_test)

# ===================== Evaluate =====================
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

