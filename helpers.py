_COUNTRIES = {

}

def get_country_name(iso_code):
    return _COUNTRIES.get(iso_code.upper(), "Default")
    