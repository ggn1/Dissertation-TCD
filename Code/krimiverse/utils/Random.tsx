const getRandomInRange = (min:number=0, max:number=1, decimals:number=1) => {
    /** Returns a random number in given range.
     *  @param min: Inclusive minimum value of range.
     *  @param max: Inclusive maximum value of range.
     *  @param decimals: No. of decimals to round to.
     *  @return: A random integer from within given range. */
    const num = (Math.random() * (max - min)) + min;
    return parseFloat(num.toFixed(decimals));
}

const getRandomArray = (len:number, min:number=0.0, max:number=1.0, decimals:number=1) => {
    /** Returns an array of random numbers in given range, or between 0 and 1. */
    let arr:Array<number> = [];
    for (let i=0; i<len; i++) arr.push(getRandomInRange(min, max, decimals));
    return arr;
}

const getRandom1dIndices = (nItems:number, pc:number) => {
    /** Get random indices from world array. 
     *  @param nItems: No. of items in the 1D array.
     *  @param pc: Desired percent of positions in the 1D array for which indices are required
     *             (expressed using a value from the range [0.0, 1.0]).
     *  @return: List of n pairs corresponding to random position in the world array. */
    const n = pc*nItems; // No. of indices to retrieve.
    let indices = [];
    for (let i = 0; i < n; i++) indices.push(getRandomInRange(0, nItems, 0));
    return indices;
}

const getRandom2dIndices = (nRows:number, nCols:number, pc:number) => {
    /** Get random indices from world array. 
     *  @param nRows: No. of rows in the 2D array.
     *  @param nCols: No. of columns in the 2D array.
     *  @param pc: Desired percent of positions in the 2D array for which indices are required
     *             (expressed using a value from the range [0.0, 1.0]).
     *  @return: List of n pairs corresponding to random position in the world array. */
    const n = pc*nRows*nCols; // No. of indices to retrieve.
    let indices:Array<Array<number>> = [];
    let indicesStr:Array<string> = [];
    let idx = [0,0];
    for (let i = 0; i < n; i++) {
        idx = [getRandomInRange(0, nRows, 0), getRandomInRange(0, nCols, 0)];
        while (indicesStr.includes(String(idx))) idx = [
            Math.floor(getRandomInRange(0, nRows)), 
            Math.floor(getRandomInRange(0, nCols))
        ];
        indices.push(idx);
        indicesStr.push(String(idx));
    };
    return indices;
}

export { getRandomInRange, getRandomArray, getRandom1dIndices, getRandom2dIndices }