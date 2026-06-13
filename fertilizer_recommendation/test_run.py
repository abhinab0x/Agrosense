from pprint import pprint

from recommender.fertilizer_service import recommend_fertilizer


sample_input = {
    "N": 30,
    "P": 45,
    "K": 40,
    "ph": 6.5,
    "soil_moisture": 35,
    "temperature": 28,
    "humidity": 70,
}


if __name__ == "__main__":
    result = recommend_fertilizer(sample_input)
    pprint(result)
