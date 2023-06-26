const roundNumber = (n:number, decimal:number) => {
    /** Rounds given number to given decimal places.
     *  @param n: Number t0 round.
     *  @param decimal: No. of decimal points to round to.
     *  @return: Rounded number.
     */
    return Number(n.toFixed(decimal));
}

const roundArray = (arr:Array<number>, decimal:number) => {
    /** Rounds numbers in given array number to given decimal places.
     *  @param arr: Number array to round.
     *  @param decimal: No. of decimal points to round to.
     *  @return: Array with rounded numbers.
     */
    return arr.map((n) => roundNumber(n, decimal));
}

const avg2dArray = (arr1:Array<Array<number>>, arr2:Array<Array<number>>) => {
    /** Computes element wise average of every value in two arrays arr1 and arr2
     *  with same shape. 
     *  @param arr1: Array 1.
     *  @param arr2: Array 2.
     *  @return arrAvg: Array = average of arr1 and arr2. */
    let arrAvg:Array<Array<number>> = [];
    let row:Array<number>;
    let avg:number;
    for (let i=0; i<arr1.length; i++) {
        row = [];
        for (let j=1; j<arr1.length; j++) {
            avg = (arr1[i][j]+arr2[i][j])/2;
            row.push(avg);
        }
        arrAvg.push(row);
    }
    return arrAvg;
}

export {roundNumber, roundArray, avg2dArray}