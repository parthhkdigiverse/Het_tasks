import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/test_db")
client = MongoClient(MONGO_URL)
db = client.get_database()

result = db.users.update_one(
    {"email": "sarah@taskflow.app"},
    {"$set": {"password": "password123"}}
)

if result.modified_count > 0:
    print("Successfully set password for Sarah Chen.")
else:
    print("Could not update Sarah Chen's password (maybe she doesn't exist or already has this password).")
