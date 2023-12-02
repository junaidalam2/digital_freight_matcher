#import math 
from geopy.distance import geodesic   #library that calculates distance between 2 points taking into account the earth's curvature

routes = {
    "test_route": #comment out after testing
        [ 
        {
        "latitude": 33.754413815792205,
        "longitude": -84.3875298776525 # <- Starting Point
        },
        {
        "latitude": 34.87433823445323,
        "longitude": -85.084123334995166
        },
        {
        "latitude": 34.87433823445323,
        "longitude": -85.084123334995166
        },
        {
        "latitude": 34.87433824316913,
        "longitude": -85.08447506395166
        },
        {
        "latitude": 33.754413815792205,
        "longitude": -84.3875298776525 # <- Last Point
        }
        ],
    "route_1": [
        {"latitude": 1, "longitude": 1}, 
        {"latitude": 2, "longitude": 2},
        {"latitude": 3, "longitude": 3},
        {"latitude": 4, "longitude": 4},
        {"latitude": 5, "longitude": 5},
        ],
    "route_2": [
        {"latitude": 1, "longitude": 1}, 
        {"latitude": 2, "longitude": 2},
        {"latitude": 3, "longitude": 3},
        {"latitude": 4, "longitude": 4},
        {"latitude": 5, "longitude": 5},
        ],
    "route_3": [
        {"latitude": 1, "longitude": 1}, 
        {"latitude": 2, "longitude": 2},
        {"latitude": 3, "longitude": 3},
        {"latitude": 4, "longitude": 4},
        {"latitude": 5, "longitude": 5},
        ],
    "route_4": [
        {"latitude": 1, "longitude": 1}, 
        {"latitude": 2, "longitude": 2},
        {"latitude": 3, "longitude": 3},
        {"latitude": 4, "longitude": 4},
        {"latitude": 5, "longitude": 5},
        ],
    "route_5": [
        {"latitude": 1, "longitude": 1}, 
        {"latitude": 2, "longitude": 2},
        {"latitude": 3, "longitude": 3},
        {"latitude": 4, "longitude": 4},
        {"latitude": 5, "longitude": 5},
        ],
}
'''def get_input(prompt): #get input from user if that's how pirckup and dropoff locations are provided
    try:
        latitude = float(input(f"Enter the latitude of the location:{prompt} "))
        longitude = float(input(f"Enter the longitude of the location:{prompt} "))
        point = {"latitude": latitude, "longitude": longitude}
        return point
    except: ValueError
        print("Please enter a valid longitude and latitude using numberical value")
        return get_input(prompt) #call function again if input is invalid'''
    
pick_up = {"latitude": 34.58304441, "longitude": -84.9160636} #get_input("pick_up_loc") 
drop_off = {"latitude": 34.77051796, "longitude": -84.98472815} #get_input("drop_off_loc")

def distance(point1, point2):
    if geodesic((point1["latitude"], point1["longitude"]), (point2["latitude"], point2["longitude"])).km < 1:
        return False
    else:
        return True
    
def is_on_route(pick_up, drop_off, routes): #ISSUE: currently it prints out only either pickup or dropoff, not both | temporary fix is to separate them into 2 functions
    for route_name, route_points in routes.items(): #iterating through key-value pairs to check if new point is within 1km of any of the routes
        for route_point in route_points:
            if distance(pick_up, route_point) == True: #for pick up
                result = route_name, route_point
                print("pickup closest point:", result)
                return result #route_name #return route point if it's within 1km so we know which route to put it on
            if distance(drop_off, route_point) == True: #for drop off
                result = route_name, route_point
                print("dropoff closest point:", result)
                return result #return route point if it's within 1km so we know which route to put it on
    return False
        
def main():
    is_on_route(pick_up, drop_off, routes)
    
if __name__ == "__main__":
    main()

#Check with Gabriel if the pickup and dropoff locations are a one-time thing or a regular stop - one-time thing
#Add them to the route dictionary and then delete after drop off, if it's a one-time delivery?
distance.py
5 KB