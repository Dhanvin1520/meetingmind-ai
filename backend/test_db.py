import asyncio
from database import connect_db, close_db, get_db

async def main():
    try:
        await connect_db()
        db = get_db()
        info = await db.command('ping')
        print('MongoDB Ping:', info)
        await close_db()
        print('Success! Connection is working.')
    except Exception as e:
        print('Failed:', str(e))
asyncio.run(main())