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
     *  @return: Array with rounded numbers. */
    return arr.map((n) => roundNumber(n, decimal));
}

export {roundNumber, roundArray}