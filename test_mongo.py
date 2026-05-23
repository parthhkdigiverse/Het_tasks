from pymongo import MongoClient

try:
    client = MongoClient("mongodb://localhost:27017/test_db", serverSelectionTimeoutMS=2000)
    db = client.get_database()
    tasks = list(db.tasks.find({}, {'_id': False}))
    print("TASKS:")
    for t in tasks:
        print(t)
except Exception as e:
    print("Error:", e)
