from pprint import pprint

from recommender.fertilizer_service import recommend_fertilizer


DEMO_CASES = [
    (
        "Low Nitrogen Case",
        {
            "N": 25,
            "P": 50,
            "K": 52,
            "ph": 6.4,
            "soil_moisture": 34,
            "temperature": 28,
            "humidity": 72,
        },
    ),
    (
        "Low NPK Case",
        {
            "N": 20,
            "P": 25,
            "K": 22,
            "ph": 6.2,
            "soil_moisture": 32,
            "temperature": 27,
            "humidity": 70,
        },
    ),
    (
        "Normal Nutrient Case",
        {
            "N": 78,
            "P": 68,
            "K": 74,
            "ph": 6.8,
            "soil_moisture": 41,
            "temperature": 26,
            "humidity": 66,
        },
    ),
    (
        "Missing Field Case",
        {
            "N": 50,
            "P": 45,
            "ph": 6.7,
            "soil_moisture": 36,
            "temperature": 29,
            "humidity": 71,
        },
    ),
]


if __name__ == "__main__":
    for title, payload in DEMO_CASES:
        print(f"\n=== {title} ===")
        print("Input:")
        pprint(payload)
        print("Output:")
        pprint(recommend_fertilizer(payload))
