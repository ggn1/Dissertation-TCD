// Global constants.
const FUNDS_START = 10000;
const RENDER_STEP_INTERVAL = 1; // In seconds.
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
    // TO DO ...
}

class Plan {
    // TO DO ...
}

// Global world properties.
let time = new Time(0, 0, 0); 
let funds = FUNDS_START;
let land = new Land(LAND_DIM, LAND_DIM);
let environment = new Environment();
let plan = new Plan();
let planDelaySec = 1;

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