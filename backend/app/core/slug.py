import re

CYRILLIC_TO_LATIN = {
    "а": "a", "б": "b", "в": "v", "г": "h", "ґ": "g", "д": "d", "е": "e", "є": "ie",
    "ж": "zh", "з": "z", "и": "y", "і": "i", "ї": "i", "й": "i", "к": "k", "л": "l",
    "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch", "ь": "",
    "ю": "iu", "я": "ia", "'": "",
}


def slugify(text: str) -> str:
    result = []
    for char in text.lower():
        result.append(CYRILLIC_TO_LATIN.get(char, char))
    text = "".join(result)
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return re.sub(r"-+", "-", text)


def make_unique_slug(base_slug: str, slug_exists) -> str:
    """slug_exists: callable(candidate) -> bool"""
    if not slug_exists(base_slug):
        return base_slug
    suffix = 2
    while slug_exists(f"{base_slug}-{suffix}"):
        suffix += 1
    return f"{base_slug}-{suffix}"
