const makeNew2DArray = (nRows:number, nCols:number, fill:any=null) => {
    /** Create new array of given shape.
     *  @param nRows: No. of rows.
     *  @param nCols: No. of columns.
     *  @param fill: Value to fill array using. 
     *  @return arr: 2D array. */
    let arr = [];
    for(let i=0; i<nRows; i++) {
        let row = []
        for(let j=0; j<nCols; j++) {
            row.push(fill);
        }
        arr.push(row);
    }
    return arr;
}

export { makeNew2DArray }