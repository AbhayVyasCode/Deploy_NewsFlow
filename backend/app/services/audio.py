from gtts import gTTS
import os
import uuid
from io import BytesIO
import asyncio
from concurrent.futures import ThreadPoolExecutor

_executor = ThreadPoolExecutor(max_workers=3)

def _generate_audio(text: str, lang: str) -> BytesIO:
    tts = gTTS(text=text, lang=lang, slow=False)
    fp = BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp

async def text_to_speech(text: str, lang: str = 'en') -> BytesIO:
    """
    Converts text to speech and returns the audio as a BytesIO object asynchronously.
    """
    try:
        loop = asyncio.get_running_loop()
        fp = await loop.run_in_executor(_executor, _generate_audio, text, lang)
        return fp
    except Exception as e:
        print(f"Error generating speech: {e}")
        return None
