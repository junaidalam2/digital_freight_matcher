


//Truck Info
costPerMile = 1.816923077

//Standard Package
stdPackageWeight = 66 // lbs
stdPackageVolume = 18 // cubic feet

//Pallet Info
palletWeight = 440 // lbs
palletVolume = 64 // cubic feet



//Cargo Info.
maxWeight = 9180 // lbs
truckVolume = 1700 // cubic feet
truckPalletsMax = truckVolume / palletVolume
palletCostPerMile = truckPalletsMax / costPerMile
stdPackagePerTruck = truckVolume / stdPackageVolume
stdPackagePerMile = stdPackagePerTruck / costPerMile



