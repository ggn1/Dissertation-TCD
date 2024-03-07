const linearInterpolator = require('linear-interpolator');

const checkIndexOutOfRange = (
    idxX, rangeMinX, rangeMaxX,
    idxY, rangeMinY, rangeMaxY
) => {
    /** Checks if given x and y indices are within given range
     *  and raises an error if they are not. */
    if (idxX < rangeMinX || idxX > rangeMaxX) {
        throw new Error(`X index out of range [${rangeMinX}, ${rangeMaxX}]`);
    }
    if (idxY < rangeMinY || idxY > rangeMaxY) {
        throw new Error(`Y index out of range [${rangeMinY}, ${rangeMaxY}]`);
    }
}

const getNewId = (next, available) => {
    /** Gets a new ID. */
    let id;
    if (available.length > 0) {
        id = available.pop();
    } else {
        id = next;
        next += 1;
    }
    return {id: id, next: next, available: available};
}

const getRandomInt = (min, max) => {
    /** Returns a random integer within given inclusive range. */
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const shuffle = (array) => {
    /** Shuffles an array using the Fisher-Yates Shuffle 
     *  and returns this array. */
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

const roundToNPlaces = (num, n) => {
    // Rounds the given number to n decimal places.
    return Math.round((num + Number.EPSILON) * (10^n)) / (10^n);
}

const createInterpolationFunction = (xyPoints) => {
    // Create the interpolation function.
    const interpolationFunction = linearInterpolator(xyPoints);

    // Define a new function that takes an x value 
    // and returns the interpolated y value.
    function interpolatedFunction(x) {
        return interpolationFunction(x);
    }

    return interpolatedFunction;
}

const timeDelta = (from, months) => {
    const fromMonth = (from.year * 12) + (from.month - 1);
    let toMonth = fromMonth + months;
    if (toMonth < 0) throw new Error('Time out of range.');
    const toYear = Math.floor(toMonth / 12);
    toMonth = (toMonth - (toYear * 12)) + 1;
    return {year: toYear, month: toMonth};
}

const timeCompare = (time1, time2) => {
    /** Compare the 2 given times and return 
     *  1 if time2 > time1, 
     *  0 if time2 = time1 and 
     *  -1 if time2 < time1. 
     *  Both times much be of the format {month:m, year:y}.
     */
    if (time2.year > time1.year) return 1;
    else if (time2.year < time1.year) return -1;
    else { // time2.year == time1.year
        if (time2.month > time1.month) return 1;
        else if (time2.month < time1.month) return -1;
        else return 0; // time2.month == time1.month
    }
}

const validateTimeInRange = (t) => {
    if (
        timeCompare(t, TIME_RANGE[0]) > 0 ||
        timeCompare(t, TIME_RANGE[1]) < 0
    ) throw new Error (
        `Time "${t.month} ${t.year}" not in range [`
        + `${TIME_RANGE[0].month} ${TIME_RANGE[0].year},`
        + `${TIME_RANGE[1].month} ${TIME_RANGE[1].year}].`
    );
}

const CO2_STRESS = {
    requirement:[
        [0.0, 1.0],
        [10.0, 1.0],
        [20.0, 1.0],
        [30.0, 0.99],
        [40.0, 0.978],
        [50.0, 0.96],
        [60.0, 0.94],
        [70.0, 0.92],
        [80.0, 0.89],
        [90.0, 0.85],
        [100.0, 0.8],
        [110.0, 0.75],
        [120.0, 0.7],
        [130.0, 0.64],
        [140.0, 0.54],
        [150.0, 0.42],
        [160.0, 0.3],
        [170.0, 0.2],
        [180.0, 0.1],
        [190.0, 0.05],
        [200.0, 0.01],
        [210.0, 0.0],
        [220.0, 0.0],
        [230.0, 0.0],
        [240.0, 0.0],
        [250.0, 0.0],
        [260.0, 0.0],
        [270.0, 0.0],
        [280.0, 0.0],
        [290.0, 0.0],
        [300.0, 0.0],
        [310.0, 0.0]
    ],
    requirement_sensitive:[
        [0.0, 1.0],
        [10.0, 1.0],
        [20.0, 1.0],
        [30.0, 1.0],
        [40.0, 1.0],
        [50.0, 1.0],
        [60.0, 0.99],
        [70.0, 0.978],
        [80.0, 0.96],
        [90.0, 0.94],
        [100.0, 0.92],
        [110.0, 0.89],
        [120.0, 0.85],
        [130.0, 0.8],
        [140.0, 0.75],
        [150.0, 0.7],
        [160.0, 0.64],
        [170.0, 0.54],
        [180.0, 0.42],
        [190.0, 0.3],
        [200.0, 0.2],
        [210.0, 0.1],
        [220.0, 0.05],
        [230.0, 0.01],
        [240.0, 0.0],
        [250.0, 0.0],
        [260.0, 0.0],
        [270.0, 0.0],
        [280.0, 0.0],
        [290.0, 0.0],
        [300.0, 0.0],
        [310.0, 0.0]
    ] 
}
CO2_STRESS['stress_function'] = createInterpolationFunction(CO2_STRESS.requirement);
CO2_STRESS['stress_function_sensitive'] = createInterpolationFunction(CO2_STRESS.requirement_sensitive);

const TEMPERATURE_STRESS = {
    requirement:{
        coniferous: [
            [-90.0, 1.0],
            [-80.0, 1.0],
            [-70.0, 0.5],
            [-60.0, 0.2],
            [-50.0, 0.15],
            [-40.0, 0.1],
            [-30.0, 0.06],
            [-20.0, 0.03],
            [-10.0, 0.0],
            [0.0, 0.0],
            [10.0, 0.0],
            [20.0, 0.0],
            [30.0, 0.01],
            [40.0, 0.05],
            [50.0, 0.2],
            [60.0, 0.4],
            [70.0, 0.8],
            [80.0, 1.0],
            [90.0, 1.0],
            [100.0, 1.0]
        ],
        deciduous: [
            [-90.0, 1.0],
            [-80.0, 1.0],
            [-70.0, 1.0],
            [-60.0, 1.0],
            [-50.0, 0.8],
            [-40.0, 0.7],
            [-30.0, 0.4],
            [-20.0, 0.2],
            [-10.0, 0.0],
            [0.0, 0.0],
            [10.0, 0.0],
            [20.0, 0.0],
            [30.0, 0.01],
            [40.0, 0.05],
            [50.0, 0.2],
            [60.0, 0.4],
            [70.0, 0.8],
            [80.0, 1.0],
            [90.0, 1.0],
            [100.0, 1.0]
        ]
    },
    requirement_sensitive: {
        coniferous: [
            [-90.0, 1.0],
            [-80.0, 1.0],
            [-70.0, 1.0],
            [-60.0, 1.0],
            [-50.0, 0.9],
            [-40.0, 0.6],
            [-30.0, 0.25],
            [-20.0, 0.1],
            [-10.0, 0.05],
            [0.0, 0.0],
            [10.0, 0.0],
            [20.0, 0.0],
            [30.0, 0.05],
            [40.0, 0.15],
            [50.0, 0.4],
            [60.0, 0.8],
            [70.0, 1.0],
            [80.0, 1.0],
            [90.0, 1.0],
            [100.0, 1.0]
        ],
        deciduous: [
            [-90.0, 1.0],
            [-80.0, 1.0],
            [-70.0, 1.0],
            [-60.0, 1.0],
            [-50.0, 1.0],
            [-40.0, 1.0],
            [-30.0, 0.9],
            [-20.0, 0.6],
            [-10.0, 0.0],
            [0.0, 0.0],
            [10.0, 0.0],
            [20.0, 0.01],
            [30.0, 0.1],
            [40.0, 0.3],
            [50.0, 0.4],
            [60.0, 0.8],
            [70.0, 1.0],
            [80.0, 1.0],
            [90.0, 1.0],
            [100.0, 1.0]
        ]
    }
}
TEMPERATURE_STRESS['stress_function'] = {
    coniferous: createInterpolationFunction(
        TEMPERATURE_STRESS.requirement.coniferous
    ),
    deciduous: createInterpolationFunction(
        TEMPERATURE_STRESS.requirement.deciduous
    )
}
TEMPERATURE_STRESS['stress_function_sensitive'] = {
    coniferous: createInterpolationFunction(
        TEMPERATURE_STRESS.requirement_sensitive.coniferous
    ),
    deciduous: createInterpolationFunction(
        TEMPERATURE_STRESS.requirement_sensitive.deciduous
    )
}

const TIME_RANGE = [{month:3, year:0}, {month:3, year:20}];

module.exports = {
    treeImgs: {
        seedling: {scale: 0.08, fill:'#8CD79F', d:'m162.2743,437.27095l-2.50097,-188.63198c26.37647,-34.68576 34.49183,-179.01323 111.29489,-141.75297c76.80307,37.26025 -56.75655,171.3249 -136.83437,146.74104c-80.07782,-24.58387 -134.62989,-177.08951 -129.10635,-187.23457c5.52355,-10.14506 69.87351,-1.80811 99.12336,58.20945c29.24985,60.01757 61.22376,121.41582 54.39886,124.59996'},
        sapling: {scale: 0.08, fill:'#A0D58A', d:'m143.59497,502.42732c9.92454,-24.14193 -22.17414,-147.43604 9.97679,-355.78825c32.15092,-208.35221 208.90818,-110.951 102.76621,-27.1678c-106.14197,83.7832 -218.58312,261.81413 -255.88496,133.13932c-37.30184,-128.67481 291.21799,79.96256 299.51983,-18.74967c8.30184,-98.71223 -93.21773,18.0862 -160.59189,-2.59414c-67.37416,-20.68033 -188.26779,-235.90001 -114.39021,-228.68581c73.87758,7.2142 110.77998,168.67195 117.98073,229.43053'},
        mature: {
            coniferous: {scale: 0.08, fill:'#619E73', d:'m148.49104,2.5l-145.99104,378.74059l293.59494,0.68714l-146.36226,-368.26646l0,484.82127'},
            deciduous: {scale: 0.08, fill:'#B8D078', d:'m155.45452,222.11132c-216.34574,74.99975 -179.89617,-200.33584 -34.90544,-217.72988c144.99073,-17.39407 162.04848,91.31884 166.31291,100.01588c4.26444,8.69704 42.64432,173.94065 -76.7598,208.72876c-119.40412,34.78815 -199.12919,-7.33401 -204.37282,-120.63504c-5.24363,-113.30103 171.20717,-150.71794 198.47201,-59.25669c27.26482,91.46125 -35.60817,132.05803 -36.74352,132.05803c-19.30098,18.5238 -16.81067,147.31317 -14.78185,233.38573'},
        },
        old_growth: {
            coniferous: {scale: 0.08, fill:'#559E84', d:'m142.08448,2.5l-138.9469,228.37034l292.93961,-3.79582l-153.83222,-224.37181l-139.74497,372.31427l293.85236,-2.20418l-152.98657,-268.20952l3,394.19389'},
            deciduous: {scale: 0.08, fill:'#B8D078', d:'m154.14571,501.78073l-3.07919,-337.32207c2.28468,-17.821 81.13642,-67.1167 122.02708,20.50616c40.89065,87.62283 -33.80155,156.4735 -55.6363,164.10563c-21.83479,7.63211 -110.5192,27.81815 -177.6967,-27.67631c-67.17752,-55.49447 -25.67527,-149.4774 -12.22605,-166.62524c13.44922,-17.14785 49.81923,-54.12944 119.91748,-54.12944c70.09828,0 92.33431,52.24684 92.71098,63.68229c0.37668,11.43546 15.54323,95.59455 -110.04952,98.5153c-125.59274,2.92076 -133.05859,-117.84784 -125.37762,-161.77671c7.68097,-43.92886 36.86415,-78.24429 81.75689,-89.26691c44.89274,-11.02262 93.82793,-13.2191 129.39571,-1.23963c46.97165,17.53627 66.6736,41.62498 76.0719,91.27792c9.3983,49.65294 -1.23446,74.64481 -16.96843,104.77215c-15.73397,30.12732 -19.06387,64.73514 -121.83811,57.75174'},
        },
        senescent: {
            coniferous: {scale: 0.08, fill:'#6F5C2A', d:'m142.08448,2.5l-138.9469,228.37034l292.93961,-3.79582l-153.83222,-224.37181l-139.74497,372.31427l293.85236,-2.20418l-152.98657,-268.20952l3,394.19389'},
            deciduous: {scale: 0.08, fill:'#C48157', d:'m154.14571,501.78073l-3.07919,-337.32207c2.28468,-17.821 81.13642,-67.1167 122.02708,20.50616c40.89065,87.62283 -33.80155,156.4735 -55.6363,164.10563c-21.83479,7.63211 -110.5192,27.81815 -177.6967,-27.67631c-67.17752,-55.49447 -25.67527,-149.4774 -12.22605,-166.62524c13.44922,-17.14785 49.81923,-54.12944 119.91748,-54.12944c70.09828,0 92.33431,52.24684 92.71098,63.68229c0.37668,11.43546 15.54323,95.59455 -110.04952,98.5153c-125.59274,2.92076 -133.05859,-117.84784 -125.37762,-161.77671c7.68097,-43.92886 36.86415,-78.24429 81.75689,-89.26691c44.89274,-11.02262 93.82793,-13.2191 129.39571,-1.23963c46.97165,17.53627 66.6736,41.62498 76.0719,91.27792c9.3983,49.65294 -1.23446,74.64481 -16.96843,104.77215c-15.73397,30.12732 -19.06387,64.73514 -121.83811,57.75174'},
        },
        dead: {scale: 0.08, fill:'#845335', d:'m190.88308,71.11615c-84.02814,-52.35866 -172.05762,0 -138.04623,36.10942c34.01139,36.10942 192.06432,32.49848 218.07303,-1.80547c26.00871,-34.30395 -32.01072,-88.46807 -110.03685,-101.10637c-78.02613,-12.6383 -158.05293,43.3313 -158.05293,88.46807c0,45.13677 -2.00067,308.73552 4.00134,343.03946c6.00201,34.30395 118.03953,68.60789 182.06097,57.77507c64.02144,-10.83283 88.02948,-34.30395 96.03216,-45.13677c8.00268,-10.83283 24.00804,-364.70511 -6.00201,-389.98171c-30.01005,-25.27659 -74.02479,-37.91489 -74.02479,-39.5398'},
        none: {scale:0.08, fill:'#894F3F', d: 'm7.44019,293.80132c-45.43813,-187.79474 236.27827,-293.42928 283.9883,-84.50763c47.71003,208.92165 -238.55018,272.30237 -283.9883,84.50763z'}
    },
    actionImgs: {
        'fell': "axe.png",
        'plant': "shovel.png"
    },
    fps: 10,
    start_funds: 10000.0,
    start_co2: 1000.0,
    start_price_timber: 100.0,
    start_temperature: -3,
    start_rotation_period: 50,
    start_timber_demand: 1000,
    start_co2_emission: 320,
    start_cost_planting: 200,
    start_cost_felling: 500,
    land_dim: 6,
    reproduction_interval_coniferous: 20,
    reproduction_interval_deciduous: 10,
    co2_stress: CO2_STRESS,
    co2_change_percent: 0.01/12, // monthly
    temperature_stress: TEMPERATURE_STRESS,
    temperature_monthly_change: {
        '12-1': -5, '1-2': 2, '2-3': 6,
        '3-4': 7, '4-5': 8, '5-6': 5,
        '6-7': 3, '7-8': 0, '8-9': -5,
        '9-10': -7, '10-11': -7, '11-12': -7
    },
    timber_use_percent: {'lumber': 0.4, 'energy': 0.6},
    time_range: TIME_RANGE,
    time_steps: (
        ((TIME_RANGE[1].year - TIME_RANGE[0].year) * 12)
        + (TIME_RANGE[1].month - TIME_RANGE[0].month)
    ),
    plan: null,
    checkIndexOutOfRange:checkIndexOutOfRange,
    getNewId:getNewId,
    getRandomInt:getRandomInt,
    shuffle:shuffle,
    roundToNPlaces:roundToNPlaces,
    timeDelta:timeDelta,
    timeCompare:timeCompare,
    validateTimeInRange:validateTimeInRange,
}