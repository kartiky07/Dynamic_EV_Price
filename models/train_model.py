import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split

try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except (ImportError, OSError) as e:
    print(f"Warning: LightGBM import failed: {e}. Will fall back to scikit-learn RandomForestRegressor.")
    HAS_LIGHTGBM = False

def generate_synthetic_data(num_samples=5000):
    np.random.seed(42)
    
    # 1. Base features
    hours = np.random.randint(0, 24, size=num_samples)
    months = np.random.randint(1, 13, size=num_samples)
    days_of_week = np.random.randint(0, 7, size=num_samples)
    is_weekend = (days_of_week >= 5).astype(int)
    
    # Peak hours: 8-11 AM (8,9,10) and 5-9 PM (17,18,19,20)
    peak_hours = np.zeros(num_samples, dtype=int)
    peak_hours[(hours >= 8) & (hours <= 11)] = 1
    peak_hours[(hours >= 17) & (hours <= 20)] = 1
    
    # Night charging: 10 PM to 6 AM (22, 23, 0, 1, 2, 3, 4, 5)
    night_charging = np.zeros(num_samples, dtype=int)
    night_charging[(hours >= 22) | (hours <= 5)] = 1
    
    # Session duration: 1.0 to 12.0 hours
    session_durations = np.random.uniform(1.0, 12.0, size=num_samples)
    
    # Charging duration is a fraction of session duration (representing active charging time)
    # Most charging takes between 1.0 to 5.0 hours depending on charger level
    charging_durations = np.zeros(num_samples)
    for i in range(num_samples):
        # charging duration must be less than session duration
        max_charge = min(session_durations[i], np.random.choice([2.5, 4.0, 6.0]))
        charging_durations[i] = np.random.uniform(0.5, max_charge)
    
    # Idle time: time plugged in but not charging
    idle_times = session_durations - charging_durations
    idle_ratios = idle_times / session_durations
    
    # Target variable: kWhDelivered
    # Charging rate depends on charger type. Assume a mix of chargers:
    # 7.2 kW (slow AC), 22 kW (fast AC), 50 kW (rapid DC)
    # We map this behavior using charger classes
    charger_types = np.random.choice([7.2, 22.0, 50.0], p=[0.5, 0.3, 0.2], size=num_samples)
    
    # kWh delivered is charging duration * charger type power with some efficiency loss and random variance
    base_kwh = charging_durations * charger_types * np.random.uniform(0.85, 0.98, size=num_samples)
    
    # High demand modifiers (e.g. peak hours, winter months)
    demand_modifier = 1.0
    # Peak hours have higher battery discharge/needs or higher charger speeds used
    base_kwh[(peak_hours == 1)] *= np.random.uniform(1.1, 1.3, size=len(base_kwh[(peak_hours == 1)]))
    # Weekend charging is often slightly higher duration / bulk charging
    base_kwh[(is_weekend == 1)] *= np.random.uniform(1.05, 1.15, size=len(base_kwh[(is_weekend == 1)]))
    # Add random noise
    kwh_delivered = base_kwh + np.random.normal(0, 1.5, size=num_samples)
    kwh_delivered = np.clip(kwh_delivered, 2.0, 100.0) # clip to realistic battery capacities (2 kWh to 100 kWh)

    # Put it all into a DataFrame
    df = pd.DataFrame({
        'Hour': hours,
        'Month': months,
        'DayOfWeek': days_of_week,
        'IsWeekend': is_weekend,
        'PeakHour': peak_hours,
        'NightCharging': night_charging,
        'SessionDuration': session_durations,
        'ChargingDuration': charging_durations,
        'IdleTime': idle_times,
        'IdleRatio': idle_ratios,
        'kWhDelivered': kwh_delivered
    })
    
    return df

def train_and_save():
    print("Generating synthetic EV charging data...")
    df = generate_synthetic_data(8000)
    
    # Feature columns (ensure exact ordering)
    features = [
        'Hour', 'Month', 'DayOfWeek', 'IsWeekend', 'PeakHour', 
        'NightCharging', 'SessionDuration', 'ChargingDuration', 
        'IdleTime', 'IdleRatio'
    ]
    
    X = df[features]
    y = df['kWhDelivered']
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = None
    is_lgb_success = False
    
    if HAS_LIGHTGBM:
        try:
            print("Training LightGBM model...")
            # Initialize and train LightGBM regressor
            model = lgb.LGBMRegressor(
                n_estimators=100,
                learning_rate=0.05,
                num_leaves=31,
                random_state=42,
                verbosity=-1
            )
            model.fit(X_train, y_train)
            is_lgb_success = True
            print("LightGBM model trained successfully.")
        except Exception as e:
            print(f"Error training LightGBM model: {e}. Falling back to RandomForestRegressor.")
            is_lgb_success = False
            
    if not is_lgb_success:
        print("Training Scikit-Learn RandomForestRegressor as fallback...")
        from sklearn.ensemble import RandomForestRegressor
        model = RandomForestRegressor(
            n_estimators=80,
            max_depth=12,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        print("RandomForestRegressor model trained successfully.")
    
    # Evaluate performance
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    print(f"Train R^2 score: {train_score:.4f}")
    print(f"Test R^2 score: {test_score:.4f}")
    
    # Create the model save path
    os.makedirs('models', exist_ok=True)
    model_path = 'models/lightgbm_ev_model.pkl'
    
    # Save the model object and the feature list as a dictionary
    save_data = {
        'model': model,
        'features': features,
        'type': 'lightgbm' if is_lgb_success else 'random_forest'
    }
    
    joblib.dump(save_data, model_path)
    print(f"Model saved to {model_path}")
    
    # Verify we can load and predict
    loaded = joblib.load(model_path)
    test_pred = loaded['model'].predict(X_test.iloc[:5])
    print("Verification predictions (first 5 samples):")
    print("Actual:", y_test.iloc[:5].values)
    print("Predicted:", test_pred)

if __name__ == '__main__':
    train_and_save()
