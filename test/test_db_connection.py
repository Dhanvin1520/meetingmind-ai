import motor.motor_asyncio
import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

async def test():
    uri = os.getenv('MONGO_URI')
    print(f'Testing URI: {uri}')
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    try:
        await client.admin.command('ping')
        print('MongoDB Connected')
    except Exception as e:
        print(f'MongoDB Error: {e}')
if __name__ == '__main__':
    asyncio.run(test())