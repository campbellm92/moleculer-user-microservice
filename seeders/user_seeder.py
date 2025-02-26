import os
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from faker import Faker
from datetime import datetime

load_dotenv()
fake = Faker()

uri = os.getenv("MONGO_URI")

def main():
    
    try:
        client = MongoClient(uri)
        db = client['test']
        users = db['users']

        SEED_DATA = []
        for _ in range(10):
            SEED_DATA.append({
            'name': fake.name(),
            'email': fake.email(),
            'password': fake.password(),
            'createdAt': datetime.now()
        })
            
        seeded = users.insert_many(SEED_DATA)
        if (seeded):
            print("Data successfully seeded")

            client.admin.command('ping')
            print("Pinged your deployment. You successfully connected to MongoDB!")
        
    except Exception as e:
        print(e)


if __name__ == "__main__":
    main()