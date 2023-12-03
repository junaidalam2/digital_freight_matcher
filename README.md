# Welcome to Data Freight Matching
******************************************

## Task

Build Data Freight Matching service that allows offering cargo space in the current fixed routes to clients seeking transportation along those paths. The service will process orders in a specific format used in the existing control system and match them to preexisting routes based on defined criteria:

    - Pick up and drop off locations within a maximum distance of 1 km from any point inside existing routes.
    - Cargo must fill the truck's compartment, considering the original cargo and any additional items.
    - Each pick up and drop off requires 15 minutes, plus deviation from the route up to 1 km.
    - Costs per mile provided through an updated spreadsheet.
    - Unfilled cargo can be combined with other clients' cargo to create new profitable routes.
    - Routes must return to the point of origin and must not exceed 10 hours/day.
    - Consideration of cargo types that cannot be transported together.
    - Adherence to union regulations requiring a 30-minute break for truck drivers after 4 hours of work.
    
## Description
The problem was addressed by creating a Digital Freight Matching (DFM) system with the following functionality:

    - Matching orders based on proximity, cargo volume, time constraints, and cost per mile.
    - Consolidating residual cargo into new routes to maintain profitability.
    - Consideration of union regulations, cargo types, time limitations, and specific route parameters.

The solution utilized SQLite for efficient database management and Node.js and JavaScript for developing the system's core functionalities.

## Installation
//CHECK THIS PART

- Clone the repository from [GitHub Repo Link].
- Navigate to the project directory.
- Install necessary dependencies using Node.js package manager.

## Usage
To use it pass the order info to the program using the following format:

"CBM (vol.), weight (pounds), type","{pick up latitude:, pick up longitude:}", "{drop off latitude:, drop off longitude:}"

"[1, 75, medicine]","{lat: 33.7410939584213,lng: -84.39448926258176}","{lat: 33.82780631623736,lng: -84.35306760483363}"

The system then will check if the orders can be completed within the established parameters and, if successful, add them to the routes or reject if not. You can obtain a summary of the completed orders for the day. //CHECK LAST SENTANCE

```
./my_dfm argument1 argument2 //TO BE COMPLETED
```

### The Core Team
Project completed by Anthea Ip, Junaid Alam and Nikita Gaidamachenko.

<span><i>Made at <a href='https://qwasar.io'>Qwasar SV -- Software Engineering School</a></i></span>
<span><img alt='Qwasar SV -- Software Engineering School's Logo' src='https://storage.googleapis.com/qwasar-public/qwasar-logo_50x50.png' width='20px'></span>