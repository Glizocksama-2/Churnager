import urllib.parse

def generate_deep_link(phone: str, message: str) -> str:
    clean_phone = "".join(filter(str.isdigit, phone))
    encoded_message = urllib.parse.quote(message)
    return f"https://wa.me/{clean_phone}?text={encoded_message}"
