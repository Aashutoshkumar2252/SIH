# incident_anomaly_model.py
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
from datetime import datetime

class IncidentAnomalyDetector:
    def __init__(self, model_path="incident_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.scaler = None

    def train_live(self, user_data: pd.DataFrame):
        """
        Train anomaly detection model on live user-provided data.
        Expected columns: [latitude, longitude, temperature, traffic, spending, disaster_score]
        """
        feature_cols = ["latitude", "longitude", "temperature", "traffic", "spending", "disaster_score"]

        X = user_data[feature_cols].values
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = IsolationForest(
            n_estimators=200,
            contamination=0.1,  # % of points considered anomalies
            random_state=42
        )
        self.model.fit(X_scaled)

        joblib.dump((self.model, self.scaler, feature_cols), self.model_path)
        print(f"[+] Model trained on live data and saved → {self.model_path}")

    def predict(self, new_data: dict):
        """
        Predict anomaly/danger for new user input.
        new_data: dict with keys [latitude, longitude, temperature, traffic, spending, disaster_score]
        """
        if not self.model:
            self.model, self.scaler, feature_cols = joblib.load(self.model_path)
        else:
            feature_cols = ["latitude", "longitude", "temperature", "traffic", "spending", "disaster_score"]

        X_new = np.array([[new_data[f] for f in feature_cols]])
        X_new_scaled = self.scaler.transform(X_new)

        pred = self.model.predict(X_new_scaled)[0]  # -1 = anomaly, 1 = normal
        score = self.model.decision_function(X_new_scaled)[0]

        return {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "location": {"lat": new_data["latitude"], "lon": new_data["longitude"]},
            "prediction": "Danger/Anomaly" if pred == -1 else "Safe/Normal",
            "anomaly_score": round(score, 3)
        }


if __name__ == "__main__":
    # Example: live training with user-provided data
    user_live_data = pd.DataFrame([
        {"latitude": 26.1, "longitude": 91.7, "temperature": 32, "traffic": 50, "spending": 1200, "disaster_score": 0.2},
        {"latitude": 26.2, "longitude": 92.0, "temperature": 40, "traffic": 80, "spending": 5000, "disaster_score": 0.9}, # anomaly
        {"latitude": 25.9, "longitude": 91.5, "temperature": 28, "traffic": 30, "spending": 900, "disaster_score": 0.1},
    ])
    
    detector = IncidentAnomalyDetector()
    detector.train_live(user_live_data)

    # Predict new input
    new_point = {"latitude": 26.15, "longitude": 91.8, "temperature": 42, "traffic": 85, "spending": 6000, "disaster_score": 0.95}
    result = detector.predict(new_point)
    print(result)
