// Global constants. 
const RANGE_YEARS = [0, 100];
const RANGE_WATER = [0.0, 310.0];
const RANGE_TEMPERATURE = [-60.0, 100.0];
const START_FUNDS = 10000.0;
const START_WATER = 120.0;
const START_CO2 = 1000.0;
const START_PRICE_TIMBER = 100.0;
const START_TEMPERATURE = 15.0;
const RENDER_DELAY = 1; // In seconds.
const TREE_UTILITY = ["energy", "lumber"];
const LAND_DIM = 20; // No. of rows = no. of columns.
const MONTH_DAYS = {
    'jan': 31, 'feb': 28, 'mar': 31,
    'apr': 30, 'may': 31, 'jun': 30,
    'jul': 31, 'aug': 32, 'sep': 30,
    'oct': 31, 'nov': 30, 'dec': 31
}
const SEASON_MONTHS = {
    'winter': ['dec', 'jan', 'feb'], 
    'spring': ['mar', 'apr', 'may'],
    'summer': ['jun', 'jul', 'aug'],
    'autumn': ['sep', 'oct', 'nov']
}
const REPRODUCTION_INTERVAL_CONIFEROUS = 50;
const REPRODUCTION_INTERVAL_DECIDUOUS = 20;

// Utility Functions
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
    if (available.length > 0) id = available.pop();
    else id =+ next;
    return id, next, available;
}

const getRandomInt = (min, max) => {
    /** Returns a random integer within given inclusive range. */
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Components.
class Time {
    #year;
    #month;
    #day;
    
    constructor(year, month, day) {
        this.#year = year;
        this.#month = month;
        this.#day = day;
    }

    getSeason(month=null) {
        /** Given a month returns the corresponding season. */
        if (month == null) month = this.#month;
        for (const [k, v] in Object.entries(SEASON_MONTHS)) {
            if (v.includes(month)) return k;
        }
        throw new Error(`Invalid month ${month}`);
    }

    timeDelta(numSteps, stepSize) {
        /** Returns time that is numSteps (may be positive or negative
         *  to indicate direction of change) no. of steps
         *  away from this time object wherein size of
         *  each step is stepSize. */
        console.log('timeDelta() => TO DO ...');
    }

    getYear() {
        /** Returns year. */
        return this.#year;
    }

    getMonth() {
        /** Returns month. */
        return this.#month;
    }

    getDay() {
        /** Returns day. */
        return this.#day;
    }
}

class Land {
    // SANITARY CHECKS
    #numRows;
    #numColumns;
    #positions = [];
    #quadrants = [[],[],[],[]];
    #biodiversity = [0,0,0,0];
    
    constructor(rows, columns) {
        if (!(rows > 1 && columns > 1)) {
            throw new Error(
                "Number of rows and columns "
                + "have to both be > 1.");
        }
        if (((rows * columns) % 4) != 0) {
            throw new Error(
                "Number of rows * columns must be "
                + "divisible by 4.");
        }
        
        this.#numRows = rows;
        this.#numColumns = columns;
        // Initialize positions with all 0s.
        // Each position can have either 0 or a tree ID.
        for (let x=0; x<this.#numRows; x++) { 
            let row = [];
            for (let y=0; y<this.#numColumns; y++) {
                row.push(0);
            }
            this.#positions.push(row);
        }
        // Initialize quadrant positions.
        for (let x=0; x<this.#numRows; x++) { 
            for (let y=0; y<this.#numColumns; y++) {
                const q = this.getQuadrant(x, y);
                this.#quadrants[q-1].push([x,y]);
            }
        }
    }
    
    // BEHAVIORS
    #updateQuadrantBiodiversity = () => {
        /** Calculates and updates land state with 
         *  latest biodiversity of each quadrant. */
        console.log('updateQuadrantBiodiversity() => TO DO ...');
    }

    getLandSize = () => {
        /** Gets set no. of rows and columns. */
        return [this.#numRows, this.#numColumns];
    }

    getQuadrant = (rowIdx, columnIdx) => {
        /** Returns quadrant number of given x, y position position on land
         *  where x is the row index and y is the column index. */
        checkIndexOutOfRange(rowIdx, 0, this.#numRows, columnIdx, 0, this.#numColumns);
        const numRowsHalf = Math.round(this.#numRows / 2);
        const numColumnsHalf = Math.round(this.#numColumns / 2);
        if (rowIdx < numRowsHalf && columnIdx < numColumnsHalf) return 1;
        else if (rowIdx < numRowsHalf && columnIdx > numColumnsHalf) return 2;
        else if (rowIdx > numRowsHalf && columnIdx > numColumnsHalf) return 3;
        else return 4; // (rowIdx > numRowsHalf && columnIdx < numColumnsHalf)
    }

    getLandUnit = (rowIdx, columnIdx) => {
        /** Returns land position content at given xy coordinates. */
        return this.#positions[rowIdx][columnIdx];
    }

    getBiodiversity = (q = [0, 0, 0, 0]) => {
        /** Returns sum of biodiversity in given quadrants
         *  expressed using a one hot encoded array which is
         *  [0, 0, 0, 0] by default to return aggregated
         *  biodiversity of all of the land. */
        // q.forEach(qNum => {
        //     quadrants[qNum-1].forEach(xy => {

        //     })
        // })
        console.log("getBiodiversity() => TO DO ...");
    }

    getBiodiversityCategory = (q = [0, 0, 0, 0]) => {
        /** Returns biodiversity class of given quadrants
         *  expressed using a one hot encoded array which is
         *  [0, 0, 0, 0] by default to return aggregated
         *  biodiversity of all of the land. Possible category
         *  values are: unforested, plantation, forest, ecosystem. */
        // q.forEach(qNum => {
        //     quadrants[qNum-1].forEach(xy => {

        //     })
        // })
        console.log("getBiodiversityCategory() => TO DO ...");
    }

    plant = (treeType, rowColumnIdx, treeAge = 0) => {
        /** Plants a tree of given type and age at given location. */
        // Check age class of the tree and throw error if the tree is 
        // older than the sapling stage.
        console.log("plant() => TO DO ...");
    }

    clear = (rowIdx, columnIdx, utility) => {
        /** Clears any plants on a piece of land for a particular
         *  use which could be either "lumber" or "energy". */
        // Check age class of the tree and throw error if the tree is 
        // older than the sapling stage.
        if (!TREE_UTILITY.includes(utility)) {
            throw new Error('Invalid tree utility.')
        }
        console.log("clear() => TO DO ...");
    }
}

class Environment {
    #water;
    #temperature;
    #co2;

    constructor() {
        this.#water = Array.from({ length: RANGE_YEARS[1] }, () => {
            let month_vals = {};
            for (let k in Object.keys(MONTH_DAYS)) {
                month_vals[k] = START_WATER;
            }
            return month_vals;
        });
        this.#temperature = Array.from({ length: RANGE_YEARS[1] }, () => {
            let month_vals = {};
            for (let k in Object.keys(MONTH_DAYS)) {
                month_vals[k] = START_TEMPERATURE;
            }
            return month_vals;
        });
        this.#co2 = START_CO2;
    }

    getWater = (t = null) => {
        /** Returns monthly water settings if t is null 
         *  or water setting at given time if it is not null. */
        if (t == null) return this.#water;
        else return this.#water[time.year][time.month];
    }

    getTemperature = (t = null) => {
        /** Returns monthly temperature settings if t is null 
         *  or temperature setting at given time if it is not null. */
        if (t == null) return this.#temperature;
        else return this.#temperature[time.year][time.month];
    }

    getCo2 = () => {
        /** Returns monthly CO2 settings if t is null 
         *  or CO2 setting at given time if it is not null. */
        return this.#co2;
    }

    setWater = (settings) => {
        /** Sets water settings for any one/multiple 
         *  month(s) of each year. 
         *  settings = [{'year':x, 'month':y, 'val':z}, ...] */
        settings.forEach(s => {
            this.#water[s.year][s.month] = s.val;
        });
    }

    setTemperature = (settings) => {
        /** Sets temperature settings for any one/multiple 
         *  month(s) of each year. 
         *  settings = [{'year':x, 'month':y, 'val':z}, ...] */
        settings.forEach(s => {
            this.#temperature[s.year][s.month] = s.val;
        });   
    }

    setCo2 = (settings) => {
        /** Sets current CO2 value. 
         *  settings = co2 val */
        this.#co2 = settings;
    }
}

class Plan {
    #timeline

    constructor() {
        // Initialize timeline to have an empty array for every
        // day in the set time period.
        this.#timeline = {};
        let tl = [];
        for(let y = RANGE_YEARS[0]; y <= RANGE_YEARS[1]; y++) {
            Object.keys(MONTH_DAYS).forEach(m => {
                const days = MONTH_DAYS[m];
                for(let d=1; d<=days; d++){
                    this.#timeline[[y, m, d]] = [];
                    tl.push([y, m, d]);
                }
            })
        }
    }

    getTimeline() {
        /** Returns current timeline. */
        return this.#timeline;
    }

    getAction(year, month, day, actionId=null) {
        /** Returns given action if exists. If no
         *  action ID is provided, then all actions
         *  are returned. */
        if (this.#timeline.hasOwnProperty([year, month, day])) {
            const actions = this.#timeline[[year, month, day]];
            if (actionId == null) return actions;
            actions.forEach(a => {
                if (a.getId() == actionId) return a
            });
        }
    }

    addAction(year, month, day, action, repeat) {
        /** Adds given action at given time in timeline.
         *  If repeat is set to true, then the same action 
         *  will be repeated annually for all years hence. */
        if (this.#timeline.hasOwnProperty([year, month, day])) {
            for (let y = year; y <= RANGE_YEARS[1]; y++) {
                this.#timeline[[y, month, day]].push(action);            
                if (repeat != true) break;
            }
        }
    }

    removeAction(year, month, day, actionId = null) {
        /** Removes action at given time. If no actionId is
         *  given, then all actions at given time point are removed. */
        if (this.#timeline.hasOwnProperty([year, month, day])) {
            const actions = this.#timeline[[year, month, day]];
            if (actionId == null) {
                this.#timeline[[year, month, day]] = [];
                actions.forEach(a => {
                    if (!actionIdAvailable.includes(a)) actionIdAvailable.push(a.getId());
                })
            } else {
                this.#timeline[[year, month, day]] = actions.filter(a => a.getId() !== actionId);
                if (!actionIdAvailable.includes(actionId)) actionIdAvailable.push(actionId);
            }
        }
    }
}

class Action {
    #id
    #target

    constructor(target) {
        // Set target only if it is a valid xy position on the land.
        const landRowCol = land.getLandSize();
        checkIndexOutOfRange(target[0], 0, landRowCol[0], target[1], 0, landRowCol[1]);
        this.#target = target;
        // Give the action a unique id.
        this.#id, actionIdNext, actionIdAvailable = getNewId(actionIdNext, actionIdAvailable);
    }

    getTarget() {
        /** Returns target land unit. */
        return this.#target;
    }

    getId() {
        /** Returns ID of this action. */
        return this.#id;
    }
}

class FellTree extends Action {
    #lifeStageFilters;
    #timberUsageFilter;

    constructor(target, lifeStageFilters, timberUsageFilter) {
        super(target)
        this.#lifeStageFilters = lifeStageFilters;
        // Only lumber and energy are valid timber uses.
        if (!['lumber', 'energy'].includes(timberUsageFilter)) {
            throw new Error(`Invalid timber usage filter ${use}.`)
        }
        this.#timberUsageFilter = timberUsageFilter;
    }

    getLifeStageFilters() {
        /** Returns set life stage filters. */
        return this.#lifeStageFilters;
    }

    getTimberUsageFilter() {
        /** Returns set timber usage filter. */
        return this.#timberUsageFilter;
    }
}

class PlantTree extends Action {
    #lifeStageFilters;

    constructor(target, lifeStageFilters) {
        super(target)
        lifeStageFilters.forEach(stage => { // Only seedlings and saplings can be planted.
            if (!['seedling', 'sapling'].includes(stage)) {
                throw new Error(`Invalid life stage filter ${stage}.`)
            }
        })
        this.#lifeStageFilters = lifeStageFilters;
    }

    getLifeStageFilters() {
        /** Returns set life stage filters. */
        return this.#lifeStageFilters;
    }
}

class TreeRequirement {
    #treeType;

    constructor(treeType) {
        if (!['coniferous', 'deciduous'].includes(treeType)) {
            throw new Error(`Invalid tree type ${treeType}.`);
        } else {
            this.#treeType = treeType;
        }
    }
}

class ReqCo2 extends TreeRequirement {
    computeStress(treeAge, treeVolume, reqAvailability) {
        console.log('computeStress() => TO DO ...');
    }
}

class ReqWater extends TreeRequirement {
    computeStress(treeAge, treeVolume, reqAvailability) {
        console.log('computeStress() => TO DO ...');
    }
}

class ReqTemperature extends TreeRequirement {
    computeStress(treeAge, treeVolume, reqAvailability) {
        console.log('computeStress() => TO DO ...');
    }
}

class Tree {
    #id;
    #ttlSenescent;
    #age = 0;
    #stress = 0.0;
    #position = 0;
    _requirements;
    _height = 0;
    _diameter = 0;
    _yearLastReproduced = 0;

    constructor(position) {
        // Set position.
        if (typeof position != typeof [] || position.length != 2) {
            throw new Error(`Invalid position = ${position}.`);
        }
        const landSize = land.getLandSize();
        checkIndexOutOfRange(position[0], 0, landSize[0], position[1], 0, landSize[1]);
        this.#position = position; // [x, y]

        // Set ID.
        this.#id, treeIdNext, treeIdAvailable = getNewId(treeIdNext, treeIdAvailable);

        // Set senescent time to live.
        this.#ttlSenescent = getRandomInt(5, 10);
    }

    #computeStress() {
        /** Computes stress that this tree is under. */
        console.log('computeStress() => TO DO ...');
    }

    getId() {
        /** Returns unique identifier of this tree. */
        return this.#id;
    }

    getAge() {
        /** Returns this tree's age. */
        return this.#age;
    }

    getStress() {
        /** Returns the % of stress that this tree is under. */
        return this.#stress;
    }

    setStress(stressPercent) {
        /** Set the % of stress that this tree is under. */
        this.#stress = stressPercent;
    }

    getPosition() {
        /** Returns current position of this tree. */
        return this.#position;
    }

    getTtlSenescent() {
        /** Returns how many years this tree will live for upon reaching the
         *  senescent life stage. */
        return this.#ttlSenescent;
    }

    age() {
        /** Tree ages by one time unit. */
        console.log('age() => TO DO ...');
    }

    getReproductionInterval() {
        /** Returns the set reproduction interval in years. */
        return this._reproductionInterval;
    }

    getRequirements() {
        /** Returns current requirements of this tree. */
        return this._requirements;
    }

    computeGrowthRate() {
        /** Computes and returns growth rate. */
        console.log('computeGrowthRate() => TO DO ...');
    }

    captureCarbon() {
        /** Removes CO2 from the atmosphere. */
        console.log('captureCarbon() => TO DO ...');
    }

    decay() {
        /** Mechanism that models decaying of the tree over time. */
        console.log('decay() => TO DO ...');
    }

    live() {
        /** Mechanism that models all changes to take place when
         *  the tree lives for another time unit's worth of time. */
        console.log('live() => TO DO ...');
    }
}

class Coniferous extends Tree {
    #reproductionInterval;
    
    constructor(position, reproductionInterval = REPRODUCTION_INTERVAL_CONIFEROUS) {
        super(position);
        this.#reproductionInterval = reproductionInterval;
        this._requirements = {
            'water': new ReqWater('coniferous'),
            'co2': new ReqCo2('coniferous'),
            'temperature': new ReqTemperature('coniferous')
        }
    }
    
    #reproduce() {
        /** A tree can reproduce if there is free space adjacent to the tree 
         *  and the tree is mature and Stress ≤ 0.5. A tree may reproduce only every 20 years. */
        console.log('reproduce() => TO DO ...');
    }

    getLifeStage() {
        /** Returns the life stage that this tress is in. */
        let age = this.getAge();
        if (stress >= 1.0) return "dead";
        else if (age < 4) return "seedling";
        else if (age < 26) return "sapling";
        else if (age < 60) return "mature";
        else if (age < 90) return "old-growth";
        else if (age < 100) return "senescent";
        else return "dead";
    }

    getReproductionInterval() {
        /** Returns this tree's reproduction interval. */
        return this.#reproductionInterval;
    }
}

class Deciduous extends Tree {
    #reproductionInterval;

    constructor(position, reproductionInterval = REPRODUCTION_INTERVAL_DECIDUOUS) {
        super(position);
        this.#reproductionInterval = reproductionInterval;
        this._requirements = {
            'water': new ReqWater('deciduous'),
            'co2': new ReqCo2('deciduous'),
            'temperature': new ReqTemperature('deciduous')
        }
    }

    #reproduce() {
        /** A tree can reproduce if there is free space adjacent to the tree 
         *  and the tree is mature and Stress ≤ 0.5. A tree may reproduce only every 20 years. */
        
    }

    getLifeStage() {
        /** Returns the life stage that this tress is in. */
        let age = this.getAge();
        if (stress >= 1.0) return "dead";
        else if (age < 3) return "seedling";
        else if (age < 21) return "sapling";
        else if (age < 47) return "mature";
        else if (age < 70) return "old-growth";
        else if (age < 80) return "senescent";
        else return "dead";
    }

    getReproductionInterval() {
        /** Returns this tree's reproduction interval. */
        return this.#reproductionInterval;
    }
}

class Timber {
    #basePrice; // per kg
    #demand;
    #annualChangePercent;
    #timberUsage;
    #Co2Emission;

    constructor(
        basePrice, annualChangePercent, energyPercent, 
        lumberPercent, energyEmissionPercent, lumberEmissionPercent
    ) {
        this.#basePrice = basePrice;
        this.setAnnualChangePercent(annualChangePercent);
        this.setTimberUsage(energyPercent, lumberPercent);
        this.#Co2Emission = {
            'energy': energyEmissionPercent,
            'lumber': lumberEmissionPercent
        }
    }

    getDemand() {
        /** Returns current demand. */
        return this.#demand;
    }

    setDemand(demand) {
        /** Sets current demand. */
        this.#demand = demand;
    }

    getAnnualChangePercent() {
        /** Returns current annual change percent. */
        return this.#annualChangePercent;
    }

    setAnnualChangePercent(changePercent) {
        /** Sets current annual change percent. */
        this.#annualChangePercent = changePercent;
    }

    getTimberUsage() {
        /** Returns how much percent of the demand comes from need for
         *  timber for each kind of usage (here, energy and lumber). */
        return this.#timberUsage;
    }

    setTimberUsage(energyPercent, lumberPercent) {
        /** Sets current annual change percent. */
        this.#timberUsage = {
            'energy': energyPercent,
            'lumber': lumberPercent
        };
    }

    getCo2Emission() {
        /** Returns how much percent of the timber's carbon is released into 
         *  the atmosphere as emissions for each type of usage. */
        return this.#Co2Emission;
    }

    fetchPrice(timberAmount, t = null) {
        /** Computes price for given given amount of timber upon
         *  considering base timber price, current/given time and 
         *  annual change percent. 
         *  This can be calculated using the formula for compound interest
         *  which is as follows.
         *  futureValue = presentValue * (1 + percentChange)^(+-timeUnit) */
        if (t == null) t = time;
        const basePriceDemandAdjusted = this.#basePrice + (this.#basePrice * (this.#demand * 0.03))
        const pricePerUnit = basePriceDemandAdjusted * ((1 + this.#annualChangePercent)^(
            this.#annualChangePercent < 0 ? 
            (-1 * this.#annualChangePercent) : 
            this.#annualChangePercent
        ));
        return pricePerUnit * timberAmount;
    }
}

// Global world properties.
let time = new Time(0, 0, 0); 
let actionIdNext = 0;
let actionIdAvailable = [];
let treeIdNext = 0;
let treeIdAvailable = [];
let funds = START_FUNDS;
let land = new Land(LAND_DIM, LAND_DIM);
let environment = new Environment();
let plan = new Plan();

const computeAtmosphericCo2 = () => {
    /** Computes current CO2 levels in the air. */
    console.log('computeAtmosphericCo2() => TO DO ...');
}

const takeTimeStep = () => {
    /** Updates time by 1 day. */
    console.log('takeTimeStep() => TO DO ...');
}

const play = () => {
    /** Start the simulation. */
    console.log('play() => TO DO ...');
}

const stop = (t = null) => {
    /** Start the simulation. If not specific moment is given at 
     *  which to stop the simulation, then it is stopped at the 
     *  current moment. */
    if (t == null) t = time;
    console.log('stop() => TO DO ...');
}