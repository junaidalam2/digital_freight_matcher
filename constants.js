

const costPerMile = 1.816923077

    //Standard Package
const stdPackageWeight = 66 // lbs
const stdPackageVolume = 18 // cubic feet

    //Pallet Info
const palletWeight = 440 // lbs
const palletVolume = 64 // cubic feet

const maxWeight = 9180 // lbs
const truckVolume = 1700 // cubic feet

const truckPalletsMax = truckVolume / palletVolume
const palletCostPerMile = truckPalletsMax / costPerMile
const stdPackagePerTruck = truckVolume / stdPackageVolume
const stdPackagePerMile = stdPackagePerTruck / costPerMile

const truckMinPerDay = 10 * 60;
const truckPickDropTimeMin = 15;


module.exports = {

    costPerMile: costPerMile,
    stdPackageWeight: stdPackageWeight,
    stdPackageVolume: stdPackageVolume,
    palletWeight: palletWeight,
    palletVolume: palletVolume,
    maxWeight: maxWeight,
    truckVolume: truckVolume,
    truckPalletsMax: truckPalletsMax,
    palletCostPerMile: palletCostPerMile,
    stdPackagePerTruck: stdPackagePerTruck,
    stdPackagePerMile: stdPackagePerMile,
    truckMinPerDay: truckMinPerDay,
    truckPickDropTimeMin: truckPickDropTimeMin,
}
