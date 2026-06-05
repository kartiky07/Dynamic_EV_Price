import os
import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ev_dashboard.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ChargingSession(Base):
    __tablename__ = "charging_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    hour = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    day_of_week = Column(Integer, nullable=False)
    is_weekend = Column(Integer, nullable=False)
    peak_hour = Column(Integer, nullable=False)
    night_charging = Column(Integer, nullable=False)
    session_duration = Column(Float, nullable=False)
    charging_duration = Column(Float, nullable=False)
    idle_time = Column(Float, nullable=False)
    idle_ratio = Column(Float, nullable=False)
    predicted_kwh = Column(Float, nullable=False)
    base_tariff = Column(Float, nullable=False)
    dynamic_tariff = Column(Float, nullable=False)
    congestion_level = Column(String, nullable=False) # 'Low', 'Medium', 'High'
    utilization_score = Column(Float, nullable=False) # percentage (0-100)
    revenue_gain_percent = Column(Float, nullable=False) # e.g. 15.4%
    pricing_strategy = Column(String, nullable=False) # 'Surge', 'Normal', 'Discount'
    timestamp = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
    seed_historical_data()

def seed_historical_data():
    db = SessionLocal()
    try:
        # Check if database has already been seeded
        if db.query(ChargingSession).count() > 0:
            return
        
        print("Seeding database with historical EV sessions...")
        now = datetime.now()
        
        sessions_to_add = []
        sum_fixed_revenue = 0.0
        sum_dynamic_revenue = 0.0
        
        # We generate 150 historical sessions spread across the past 7 days
        for i in range(150):
            # Backdate sessions randomly over the last 7 days
            days_ago = random.randint(0, 6)
            session_hour = random.randint(0, 23)
            session_time = now - timedelta(days=days_ago)
            session_time = session_time.replace(hour=session_hour, minute=random.randint(0, 59))
            
            month = session_time.month
            day_of_week = session_time.weekday()
            is_weekend = 1 if day_of_week >= 5 else 0
            
            # Determine peak hour
            peak_hour = 1 if (8 <= session_hour <= 11) or (17 <= session_hour <= 20) else 0
            night_charging = 1 if (session_hour >= 22) or (session_hour <= 5) else 0
            
            # Realistic duration values
            session_duration = round(random.uniform(1.5, 10.0), 2)
            charging_duration = round(random.uniform(0.5, min(session_duration, 4.5)), 2)
            idle_time = round(session_duration - charging_duration, 2)
            idle_ratio = round(idle_time / session_duration, 4)
            
            # Synthetic kWh prediction based on charger speeds (averaging ~20 kWh)
            charger_speed = random.choice([7.2, 22.0, 50.0])
            base_predicted = charging_duration * charger_speed * random.uniform(0.85, 0.95)
            predicted_kwh = round(np_clip(base_predicted, 3.0, 85.0), 2)
            
            # Dynamic pricing calculations
            base_tariff = 15.0
            
            # Determine congestion level based on hour and is_weekend
            if peak_hour:
                congestion_roll = random.uniform(0.7, 1.0)
            elif is_weekend:
                congestion_roll = random.uniform(0.4, 0.8)
            else:
                congestion_roll = random.uniform(0.1, 0.5)
                
            if congestion_roll >= 0.75:
                congestion_level = "High"
                utilization_score = random.uniform(80.0, 98.0)
                # Surge Pricing Rules
                surge_mult = 1.3 + (0.2 * (predicted_kwh / 50.0))
                dynamic_tariff = round(base_tariff * surge_mult, 2)
                pricing_strategy = "Surge"
            elif congestion_roll >= 0.4:
                congestion_level = "Medium"
                utilization_score = random.uniform(45.0, 79.0)
                # Moderate pricing rule
                dynamic_tariff = round(base_tariff * random.uniform(1.05, 1.18), 2)
                pricing_strategy = "Normal"
            else:
                congestion_level = "Low"
                utilization_score = random.uniform(15.0, 44.0)
                # Discount Pricing Rules
                dynamic_tariff = round(base_tariff * random.uniform(0.8, 0.95), 2)
                pricing_strategy = "Discount"
                
            sum_fixed_revenue += predicted_kwh * base_tariff
            sum_dynamic_revenue += predicted_kwh * dynamic_tariff
            
            session_record = ChargingSession(
                hour=session_hour,
                month=month,
                day_of_week=day_of_week,
                is_weekend=is_weekend,
                peak_hour=peak_hour,
                night_charging=night_charging,
                session_duration=session_duration,
                charging_duration=charging_duration,
                idle_time=idle_time,
                idle_ratio=idle_ratio,
                predicted_kwh=predicted_kwh,
                base_tariff=base_tariff,
                dynamic_tariff=dynamic_tariff,
                congestion_level=congestion_level,
                utilization_score=round(utilization_score, 2),
                revenue_gain_percent=0.0, # Will be set below
                pricing_strategy=pricing_strategy,
                timestamp=session_time
            )
            sessions_to_add.append(session_record)
            
        # Dynamically scale dynamic tariffs to achieve exactly 2.16% aggregate revenue gain
        target_dynamic_revenue = sum_fixed_revenue * 1.0216
        ratio = target_dynamic_revenue / sum_dynamic_revenue
        
        for s in sessions_to_add:
            s.dynamic_tariff = round(s.dynamic_tariff * ratio, 2)
            fixed_rev = s.predicted_kwh * s.base_tariff
            dyn_rev = s.predicted_kwh * s.dynamic_tariff
            s.revenue_gain_percent = round(((dyn_rev - fixed_rev) / max(1.0, fixed_rev)) * 100.0, 2)
            db.add(s)
            
        db.commit()
        print("Database seeded with 150 historical sessions tuned to exactly 2.16% revenue gain.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

def np_clip(val, min_val, max_val):
    return max(min_val, min(val, max_val))
