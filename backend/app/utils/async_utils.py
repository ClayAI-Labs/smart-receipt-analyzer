from concurrent.futures import ThreadPoolExecutor
import asyncio

executor = ThreadPoolExecutor()

async def run_blocking(func, *args, **kwargs):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, lambda: func(*args, **kwargs))