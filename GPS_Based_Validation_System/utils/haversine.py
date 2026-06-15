from math import radians, sin, cos, sqrt, atan2


def calculate_distance(lat1, long1, lat2, long2):
    R = 6371000  # Earth radius in meters

    lat1 = radians(lat1)
    long1 = radians(long1)
    lat2 = radians(lat2)
    long2 = radians(long2)

    diff_lat = lat2 - lat1
    diff_lon = long2 - long1

    a = sin(diff_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(diff_lon / 2) ** 2 #distance calculate

    c = 2 * atan2(sqrt(a), sqrt(1 - a)) #Angle calculate at center

    return R * c