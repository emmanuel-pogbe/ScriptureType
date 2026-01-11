def country_code_to_flag(code: str) -> str:
    if not code or len(code) != 2:
        return "🏳️"  # fallback
    return ''.join(chr(127397 + ord(char)) for char in code.upper())
print(country_code_to_flag("BB"))