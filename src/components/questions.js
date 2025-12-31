// src/components/questions.js

const questions = [
  // =====================
  // BASIC INFO (COMMON)
  // =====================
  {
    id: "gender",
    label: "Gender",
    type: "select",
    options: ["Male", "Female"]
  },
  {
    id: "age",
    label: "Age",
    type: "number"
  },
  {
    id: "Age_Category",
    label: "Age Group",
    type: "select",
    options: [
      "18-24",
      "25-29",
      "30-34",
      "35-39",
      "40-44",
      "45-49",
      "50-54",
      "55-59",
      "60-64",
      "65+"
    ]
  },

  // =====================
  // BODY MEASUREMENTS
  // =====================
  {
    id: "height_cm",
    label: "Height (cm)",
    type: "number"
  },
  {
    id: "weight_kg",
    label: "Weight (kg)",
    type: "number"
  },
  {
    id: "bmi",
    label: "BMI (if known, else leave blank)",
    type: "number",
    optional: true
  },

  // =====================
  // LIFESTYLE
  // =====================
  {
    id: "Exercise",
    label: "Do you exercise regularly?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "Checkup",
    label: "Have you had a routine medical checkup recently?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "Fruit_Consumption",
    label: "Fruit consumption per day (servings)",
    type: "number"
  },
  {
    id: "Green_Vegetables_Consumption",
    label: "Green vegetables per day (servings)",
    type: "number"
  },
  {
    id: "FriedPotato_Consumption",
    label: "Fried / junk food consumption per week",
    type: "number"
  },
  {
    id: "Alcohol_Consumption",
    label: "Alcohol consumption",
    type: "select",
    options: ["Never", "Occasionally", "Frequently"]
  },

  // =====================
  // SMOKING
  // =====================
  {
    id: "Smoking_History",
    label: "Smoking history",
    type: "select",
    options: ["Never", "Former", "Current"]
  },

  // =====================
  // HEART / GENERAL HEALTH
  // =====================
  {
    id: "General_Health",
    label: "How would you rate your general health?",
    type: "select",
    options: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
  },
  {
    id: "Skin_Cancer",
    label: "Have you ever been diagnosed with skin cancer?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "Other_Cancer",
    label: "Have you ever been diagnosed with any other cancer?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "Depression",
    label: "Have you been diagnosed with depression?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "Diabetes",
    label: "Have you been diagnosed with diabetes?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "Arthritis",
    label: "Have you been diagnosed with arthritis?",
    type: "select",
    options: ["Yes", "No"]
  },

  // =====================
  // DIABETES (MODEL-SPECIFIC)
  // =====================
  {
    id: "hba1c_level",
    label: "HbA1c level (if known)",
    type: "number",
    optional: true
  },
  {
    id: "blood_glucose_level",
    label: "Blood glucose level (if known)",
    type: "number",
    optional: true
  },

  // =====================
  // LUNG CANCER
  // =====================
  {
    id: "yellow_fingers",
    label: "Do you have yellow fingers?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "anxiety",
    label: "Do you experience anxiety frequently?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "chronic_disease",
    label: "Do you have any chronic disease?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "fatigue",
    label: "Do you experience frequent fatigue?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "wheezing",
    label: "Do you experience wheezing?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "shortness_of_breath",
    label: "Do you have shortness of breath?",
    type: "select",
    options: ["Yes", "No"]
  },
  {
    id: "chest_pain",
    label: "Do you experience chest pain?",
    type: "select",
    options: ["Yes", "No"]
  }
];

export default questions;
