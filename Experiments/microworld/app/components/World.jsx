'use client'

import * as d3 from 'd3'
import React, { useState, useEffect, useRef } from 'react'
var linearInterpolator = require('linear-interpolator');

const World = () => {
  const [landGrid, setLandGrid] = useState([]);
  const [stateTime, setStateTime] = useState({month:1, year:0});
  const [stateTimeStep, setStateTimeStep] = useState(0);
  const [stateCo2, setStateCo2] = useState(0);
  const [stateTemperature, setStateTemperature] = useState(0);
  const [stateFunds, setStateFunds] = useState(0);
  const [stateTimberDemand, setStateTimberDemand] = useState(0);
  const [stateBiodiversity, setStateBiodiversity] = useState(0);
  const [stateTreeCount, setStateTreeCount] = useState(0);

  const refSvg = useRef();

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

  const days2time = (days) => {
    /** Convert given no. of days into time comprising year, month and day. */

    if (days < 0) {
      throw new Error("Invalid input. Please provide a non-negative number of days.");
    }

    const daysInYear = 365;
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let years = Math.floor(days / daysInYear);
    let remainingDays = days % daysInYear;

    let months = 0;
    for (let i = 0; i < 12; i++) {
      if (remainingDays >= daysInMonth[i]) {
        months++;
        remainingDays -= daysInMonth[i];
      } else {
        break;
      }
    }

    return {
      'year': years, 
      'month': Object.keys(MONTH_DAYS)[months], 
      'day': remainingDays
    };
  }

  const time2days = (time) => {
    /** Convert given time comprising year month and day into no. of days until then. */
    const months = Object.keys(MONTH_DAYS);
    let days = time.year * 365;
    for (let i=0; i<months.indexOf(time.month); i++) {
        days += MONTH_DAYS[months[i]];
    }
    days += time.day;
    return days;
  }

  const validateQuadrantEncoding = (enc) => {
    /** Check if given one hot encoding if land quadrants is
     *  in the right format. */
    let num_zeros = 0;
    let invalid_quadrant = (enc.length != 4);
    
    if (!invalid_quadrant) {
        for (let i = 0; i < enc.length; i++) {
            if (enc[i] < 0) {
                invalid_quadrant = true;
                break;
            } else if (enc[i] == 0) {
                num_zeros += 1;
            }
        }
        if (num_zeros == 4) {
            invalid_quadrant = true;
        }
    }
    
    if (invalid_quadrant) {
        throw new Error(`Invalid quadrant encoding ${enc}.`);
    }
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

  const timeDelta = (from, months) => {
    const fromMonth = (from.year * 12) + (from.month - 1);
    let toMonth = fromMonth + months;
    if (toMonth < 0) throw new Error('Time out of range.');
    const toYear = Math.floor(toMonth / 12);
    toMonth = (toMonth - (toYear * 12)) + 1;
    return {year: toYear, month: toMonth};
  }

  const timeCompare = (time1, time2) => {
    /** Compare the 2 given times and return 1 if 
     *  time2 > time1, 0 if time2 = time1 and -1 if
     *  time2 < time1. Both times much be of the format 
     *  {day:d, month:m, year:y}.
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
    )
  }

  const roundToNPlaces = (num, n) => {
    // Rounds the given number to n decimal places.
    return Math.round((num + Number.EPSILON) * (10^n)) / (10^n);
  }

  // Components.

  class Land {
    #numRows;
    #numColumns;
    #positions = [];
    #biodiversity = [0, 0, 0, 0];
    #quadrantRangeBiodiversity;
    
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
        this.#quadrantRangeBiodiversity = [0, 2 * (this.#numRows/2) * (this.#numColumns/2) * 3]

        // Initialize positions with all 0s.
        // Each position can have either 0 or a tree ID.
        for (let x=0; x<this.#numRows; x++) { 
            let row = [];
            for (let y=0; y<this.#numColumns; y++) {
                row.push(-1);
            }
            this.#positions.push(row);
        }
    }
    
    // BEHAVIORS
    getLandSize() {
        /** Gets set no. of rows and columns. */
        return [this.#numRows, this.#numColumns];
    }

    getQuadrantRange(q) {
        /** Given a quadrant number, returns range of position of that quadrant. */
        const numRowsHalf = Math.round(this.#numRows / 2);
        const numColumnsHalf = Math.round(this.#numColumns / 2);
        let rangeQuadrant = [[],[]];
        if (q == 1) {
            rangeQuadrant[0] = [0, numRowsHalf-1];
            rangeQuadrant[1] = [0, numColumnsHalf-1];
        } else if (q == 2) {
            rangeQuadrant[0] = [0, numRowsHalf-1];
            rangeQuadrant[1] = [numColumnsHalf, this.#numColumns-1];
        } else if (q == 3) {
            rangeQuadrant[0] = [numRowsHalf, this.#numRows-1];
            rangeQuadrant[1] = [numColumnsHalf, this.#numColumns-1];
        } else if (q == 4) {
            rangeQuadrant[0] = [numRowsHalf, this.#numRows-1];
            rangeQuadrant[1] = [0, numColumnsHalf-1];
        } else {
            throw new Error(`Invalid quadrant number ${q}.`);
        }
        return rangeQuadrant;
    }

    getQuadrant(rowIdx, columnIdx) {
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

    getLandContent(rowIdx, columnIdx) {
      /** Returns land position content at given xy coordinates. */
      checkIndexOutOfRange(rowIdx, 0, this.#numRows, columnIdx, 0, this.#numColumns);
      return this.#positions[rowIdx][columnIdx];
    }

    #countTrees(q) {
        /** Counts all trees in a given quadrant. */       
        const rangeQuadrant = this.getQuadrantRange(q);

        let counts = {
            deciduous: 0, coniferous: 0,
            seedling: 0, sapling: 0, mature: 0, old_growth: 0, senescent: 0, dead: 0
        }

        for (let x = rangeQuadrant[0][0]; x <= rangeQuadrant[0][1]; x++) {
            for (let y = rangeQuadrant[1][0]; y <= rangeQuadrant[1][1]; y++) {
                let tree = this.getLandContent(x, y);
                if (tree != -1) {
                    counts[tree.getTreeType()] += 1;
                    counts[tree.getLifeStage()] += 1;
                }
            }
        }

        return counts;
    }

    #computeQuadrantBiodiversity(q) {
        /** Computes and returns biodiversity of given quadrant. */
        let biodiversity = 0;

        const treeCounts = this.#countTrees(q);

        // Rule 1 = Mixed forests with more trees => more biodiversity.
        // MIN = 0
        // MAX = (num_rows/2) * (num_columns/2) * 3
        if (treeCounts.coniferous == treeCounts.deciduous) {
            biodiversity += 3*(treeCounts.coniferous + treeCounts.deciduous);
        } else {
            const more = Math.max(treeCounts.coniferous, treeCounts.deciduous);
            const less = Math.min(treeCounts.coniferous, treeCounts.deciduous);
            const diff = more - less;
            const sim = more - diff;
            biodiversity += 3 * (sim * 2);
            if (diff == 1) biodiversity += 1;
            else {
                if (diff/2 > 0) biodiversity += 2 * diff;
                else biodiversity += (2 * (diff - 1)) + 1;
            }
        }

        // Rule 2 = Mixed forests with more trees => more biodiversity.
        // MIN = 0
        // MAX = (num_rows/2) * (num_columns/2) * 3
        biodiversity += 0.5 * treeCounts.seedling;
        biodiversity += 0.8 * treeCounts.sapling;
        biodiversity += 2 * treeCounts.mature;
        biodiversity += 3 * treeCounts.old_growth;
        biodiversity += 1 * treeCounts.dead;

        return biodiversity;
    }

    getBiodiversity(q = [1, 1, 1, 1]) {
        /** Returns sum of biodiversity in given quadrants
         *  expressed using a one hot encoded array which is
         *  [1, 1, 1, 1] by default to return aggregated
         *  biodiversity of all of the land. */
        validateQuadrantEncoding(q);
        let biodiversity = 0;
        for (let i=0; i<q.length; i++) {
            if (q[i] > 0) biodiversity += this.#biodiversity[i];
        }
        return biodiversity;
    }

    getBiodiversityCategory(q = [1, 1, 1, 1]) {
        /** Returns biodiversity class of given quadrants
         *  expressed using a one hot encoded array which is
         *  [1, 1, 1, 1] by default to return aggregated
         *  biodiversity of all of the land. Possible category
         *  values are: unforested, plantation, forest, ecosystem. */
        validateQuadrantEncoding(q);
        let num_quadrants = 0;
        let biodiversity = 0;
        q.forEach(qNum => {
            if (qNum == 1) {
                num_quadrants += 1;
                biodiversity == this.getBiodiversity(q);
            }
        });
        const rangeBiodiversity = [
            this.#quadrantRangeBiodiversity[0]*num_quadrants, 
            this.#quadrantRangeBiodiversity[1]*num_quadrants
        ]
        const biodiversityRatio = (
            biodiversity /
            (rangeBiodiversity[1] - rangeBiodiversity[0])
        ); // [0, 1]

        if (biodiversityRatio < 0.25) return "unforested";
        else if (biodiversityRatio < 0.5) return "plantation";
        else if (biodiversityRatio < 0.75) return "forest";
        else return "ecosystem";
    }

    updateBiodiversity() {
        /** Calculates and updates land state with 
         *  latest biodiversity of each quadrant. */
        for (let i=0; i<4; i++) {
          this.#biodiversity[i] = this.#computeQuadrantBiodiversity(i+1);
        }
    }

    plant(treeType, rowIdx, columnIdx) {
        /** Plants a tree of given type and age at given location. */
        // Check age class of the tree and throw error if the tree is 
        // older than the sapling stage.

        // Check if given position is valid.
        checkIndexOutOfRange(rowIdx, 0, this.#numRows, columnIdx, 0, this.#numColumns); 

        // Check if given position already has a tree. If 
        // so, then it is not possible to plant another one here.
        if (this.getLandContent(rowIdx, columnIdx) != -1) {
          throw new Error(`Cannot plant at [${rowIdx}, ${columnIdx}])}. Already occupied.`);
        }

        // Create a new tree if a valid tree type was provided.
        let newTree;
        if (treeType == 'coniferous') {
            newTree = new Coniferous([rowIdx, columnIdx]);
        } else if (treeType == 'deciduous') {
            newTree = new Deciduous([rowIdx, columnIdx]);
        } else {
            throw new Error(`Invalid tree type ${treeType}.`);
        }

        // Check if the age of the tree is appropriate.
        if (!['seedling', 'sapling'].includes(newTree.getLifeStage())) {
            throw new Error(
              `Invalid tree age ${treeAge}. Only seedlings and saplings can be planted.`
            );
        }

        // Add the new tree to the land.
        this.#positions[rowIdx][columnIdx] = newTree;
        trees[newTree.getId()] = [rowIdx, columnIdx];
    }

    clear(rowIdx, columnIdx) {
        /** Clears any plants on a piece of land for a particular
         *  use which could be either "lumber" or "energy". */
        // Check age class of the tree and throw error if the tree is 
        // older than the sapling stage.
        const tree = this.#positions[rowIdx][columnIdx];
        treeIdAvailable.push(tree.getId());
        this.#positions[rowIdx][columnIdx] = -1;
        delete trees[tree.getId()];
        return tree;
    }

    getAdjacentFreeSpace(xy) {
      /** Returns the coordinates of a space adjacent to given one 
       *  if it is free and returns -1 if it no such space. */
      let validAdjacentPositions = [];
      let x;
      let y;
      for (let i = -1; i <= 1; i++) { // Loop through possible adjacent positions.
        for (let j = -1; j <= 1; j++) {
          x = xy[0]+i;
          y = xy[1]+j;
          if (x >= 0 && x < this.#numRows && y >= 0 && y < this.#numColumns) {
            if (this.getLandContent(x, y) == -1) {
              validAdjacentPositions.push([x, y]);
            }
          }
        }
      }
      // Loop through valid adjacent positions and return a random one.
      if (validAdjacentPositions.length == 0) return -1;
      return validAdjacentPositions[getRandomInt(0, validAdjacentPositions.length-1)];
    }

    getPositions() {
      return this.#positions;
    }
  }

  class Environment {
    #co2ChangePercent;
    #co2;
    #temperature;

    constructor() {
        this.#temperature = START_TEMPERATURE;
        this.#co2 = START_CO2;
        this.#co2ChangePercent = 0;
    }

    updateCo2(co2 = null) {
      if (co2 == null) {
        const co2Old = this.#co2;
        co2Emission *= 1 + CHANGE_PERCENT_CO2;
        this.#co2 += co2Emission;
        const co2New = this.#co2;
        this.#co2ChangePercent = ((co2New - co2Old) / co2Old);
      } else this.#co2 = co2;
    }

    updateTemperature(temperature=null) {
      // Always runs after update CO2.
      if (temperature == null) {
        const timePast = timeDelta(time, -1);
        const tempChange = 0.01 * this.#co2ChangePercent;
        const month_past = timePast.month;
        const month_now = time.month;
        const tempChangeMonthly = (
          (month_now == month_past) ? 0 : CHANGE_MONTHLY_TEMPERATURE[
            `${month_past}-${month_now}`
          ]
        );
        this.#temperature += tempChangeMonthly;
        this.#temperature += (this.#temperature * tempChange);
      } else {
        this.#temperature = temperature;
      }
    }

    getCo2() {
      return this.#co2;
    }

    getTemperature() {
      return this.#temperature;
    }
  }

  class Plan {
    #actions;

    constructor() {
        // Initialize timeline to have an empty array for every
        // day in the set time period.
        this.#actions = {};
    }

    getAllActions() {
        /** Returns current action queue. */
        return this.#actions;
    }

    getTimeActions(month, year) {
      /** Returns all actions for a given time
       *  if it exists and [] otherwise. */
      let actions = this.#actions[`${month}-${year}`];
      if (actions == undefined) actions = {};
      return actions;
    }

    addAction(
      month, year, repeat, actionName, quadrant,
      treeType, maxNumAffected = 1, treeLifeStage
    ) {
      if (actionName == 'fell' && !treeLifeStage) {
        throw new Error ('Fell action required tree life stage.');
      }
      validateTimeInRange({'month':month, 'year':year});

      // create action.
      let action;
      let t = {'month':month, 'year':year};;
      do {
        if (actionName == 'plant') {
          action = new Plant(quadrant, maxNumAffected, treeType);
        } else if (actionName == 'fell') {
          action = new Fell(quadrant, maxNumAffected, treeType, treeLifeStage);
        } else {
          throw new Error(`Invalid action name ${actionName}.`);
        }
        if (!this.#actions.hasOwnProperty(`${t.month}-${t.year}`)) {
          this.#actions[`${t.month}-${t.year}`] = {};
        }
        this.#actions[`${t.month}-${t.year}`][action.getId()] = action;
        t = timeDelta(t, rotationPeriod);
      } while (repeat && timeCompare(t, TIME_RANGE[1]) > 0);
    }

    executeTimeActions(month, year) {
      /** Execute all actions at a particular time. */
      if (this.#actions.hasOwnProperty(`${month}-${year}`)) {
        const actions = this.#actions[`${month}-${year}`];
        let idsToRemove = [];
        Object.keys(actions).forEach(actionId => {
          actions[actionId].execute();
          actionIdAvailable.push(actionId);
          idsToRemove.push(actionId);
        });
        idsToRemove.forEach(actionId => delete actions[actionId]);
        if (Object.keys(actions).length == 0) {
          delete this.#actions[`${month}-${year}`];
        }
      }
    }
  }

  class Action {
    #id
    #quadrantRange

    constructor(quadrant, maxNumAffected) {
        // Sanity checks.
        if (quadrant < 1 || quadrant > 4) {
          throw new Error(`Invalid quadrant number ${quadrant}.`);
        }
        
        // Initialize properties.
        const idObj = getNewId(actionIdNext, actionIdAvailable);  // Give the action a unique id.
        this.#id = idObj.id;
        actionIdNext = idObj.next;
        actionIdAvailable = idObj.available;
        this.quadrant = quadrant;
        this.maxNumAffected = maxNumAffected;
        this.#quadrantRange = land.getQuadrantRange(quadrant);
    }

    getId() {
        /** Returns ID of this action. */
        return this.#id;
    }

    getQuadrantRange() {
      return this.#quadrantRange;
    }
  }

  class Fell extends Action {

    constructor(quadrant, maxNumAffected, treeType, treeLifeStage) {
      // Check if age filters are valid.
      if (!['coniferous', 'deciduous'].includes(treeType)) {
        throw new Error(`Invalid tree type ${treeType}.`);
      }
      if (![
        'seedling', 'sapling', 'mature', 
        'old_growth', 'senescent'
      ].includes(treeLifeStage)) {
        throw new Error(`Invalid tree life stage filter ${treeLifeStage}.`);
      }
      super(quadrant, maxNumAffected);
      this.treeType = treeType;
      this.treeLifeStage = treeLifeStage;
    }

    execute() {
      const quadrantRange = this.getQuadrantRange();
      let numAffected = 0;
      let tree;
      for (let x = quadrantRange[0][0]; x <= quadrantRange[0][1]; x++) {
        for (let y = quadrantRange[1][0]; y <= quadrantRange[1][1]; y++) {
          if (numAffected >= this.maxNumAffected) break;
          tree = land.getLandContent(x, y);
          if (tree != -1) {
            if (tree.getLifeStage() == this.treeLifeStage) {
              tree = land.clear(x, y);
              funds -= cost_felling;
              timberDemand.meetDemand(tree.computeVolume() * tree.getWoodDensity());
              numAffected += 1;
            }
          };
        }
        if (numAffected >= this.maxNumAffected) break;
      }
      console.log(
        `\nExecuted action ${this.getId()}. Fell ${numAffected}`,
        `${this.treeLifeStage} ${this.treeType} trees in`,
        `quadrant ${this.quadrant}.`
      )
    }
  }

  class Plant extends Action {

    constructor(quadrant, maxNumAffected, treeType) {
      // Check if age filters are valid.
      if (!['coniferous', 'deciduous'].includes(treeType)) {
        throw new Error(`Invalid tree type ${treeType}.`);
      }
      super(quadrant, maxNumAffected);
      this.treeType = treeType;
    }

    execute() {
      // Find free spaces in the specified quadrant to plant a tree to.
      const quadrantRange = this.getQuadrantRange();
      let freeSpaces = [];
      for (let x = quadrantRange[0][0]; x <= quadrantRange[0][1]; x++) {
        for (let y = quadrantRange[1][0]; y <= quadrantRange[1][1]; y++) {
            let tree = land.getLandContent(x, y);
            if (tree == -1) freeSpaces.push([x, y]);
        }
      }
      freeSpaces = shuffle(freeSpaces);
      freeSpaces = freeSpaces.slice(0, this.maxNumAffected);
      freeSpaces.forEach(xy => {
        land.plant(this.treeType, xy[0], xy[1]);
        funds -= cost_planing;
      });
      console.log(
        `\nExecuted action ${this.getId()}. Planted ${freeSpaces.length}`,
        `${this.treeType} seedling(s) in quadrant ${this.quadrant}.`
      );
    }
  }

  class Tree {
    #id;
    #ttlSenescent;
    #position;
    #maxGrowthRate = 1; // [0,1]
    #biodiversityReductionFactor = { 
      unforested: 0, plantation: 0.01, 
      forest: 0.1, ecosystem: 0.3 
    }
    
    constructor(position) {
        // Set stress.
        this.stress = 0.0; // [0, 1]

        // Set position.
        if (typeof position != typeof [] || position.length != 2) {
            throw new Error(`Invalid position = ${position}.`);
        }
        const landSize = land.getLandSize();
        checkIndexOutOfRange(position[0], 0, landSize[0], position[1], 0, landSize[1]);
        this.#position = position; // [x, y]

        // Set ID.
        const idObj = getNewId(treeIdNext, treeIdAvailable);
        this.#id = idObj.id;
        treeIdNext = idObj.next;
        treeIdAvailable = idObj.available;

        // Set age.
        this.age = 0;

        // Set senescent time to live.
        this.#ttlSenescent = getRandomInt(5, 10);

        // Set reproduction related parameter.
        this.last_reproduced = 0;
    }

    getMaxGrowthRate() {
        /** Returns maximum growth rate. */
        return this.#maxGrowthRate;
    }

    getId() {
        /** Returns unique identifier of this tree. */
        return this.#id;
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

    #computeBiodiversityReduction() {
        /** Returns the reduction in stress to the plant due to biodiversity. */
        let quadrantEnc = [0, 0, 0, 0];
        quadrantEnc[land.getQuadrant(this.#position[0], this.#position[1])-1] = 1;
        return this.#biodiversityReductionFactor[land.getBiodiversityCategory(quadrantEnc)];
    }

    computeVolume(diameter = null, height = null) {
        /** Returns volume of the tree computed as the volume of a cylinder. */
        if (diameter == null) diameter = this.diameter;
        if (height == null) height = this.height;
        return 3.14 * ((this.diameter/2)^2) * this.height;
    }

    updateStressTimeEnv(basic_needs_stress) {
        /** Updates stress value based on latest conditions for one more unit of time. */

        // Upon reaching the senescence stage, stress increases by 0.01 every year.
        // This models how health declines slowly when a tree is old and close to death.
        if (this.getLifeStage() == 'senescent') {
            this.stress += 0.01;
        }

        // Basic needs availability related stress.
        let stress_env = basic_needs_stress.co2(environment.getCo2());
        stress_env += basic_needs_stress.temperature(environment.getTemperature());
        if (stress_env == 0 && this.stress > 0){
          this.stress = Math.max(0, this.stress - ((1 - this.stress) * 0.1))
        } else {
          this.stress += stress_env
        }
    }

    #computeGrowthRate() {
        /** Calculates and returns growth rate as per current conditions 
         *  using the following formula.
         *  GR = (1 - max(0, stress - quadrant_biodiversity_reduction)) * GR_max */
        return (1 - Math.max(0, this.stress - this.#computeBiodiversityReduction(
          land.getQuadrant(this.#position[0], this.#position[1])
        ))) * this.#maxGrowthRate;
    }

    grow(maxDiameter, maxHeight) {
      const growthRate = this.#computeGrowthRate();
      if (this.diameter < maxDiameter) {
        this.diameter = Math.min(maxDiameter, this.diameter + (1 * growthRate * this.diameter));
      }
      if (this.height < maxHeight) {
        this.height = Math.min(maxHeight, this.height + (10 * growthRate * this.diameter));
      }
    }

    absorbCo2(woodDensity) {
      const growthRate = this.#computeGrowthRate();
      const mass = this.computeVolume() * woodDensity
      let co2_removed = (
        (mass * 0.2) // CO2 to maintain existing mass.
        + (0.5 * growthRate * mass) // CO2 to make new mass.
      ) / 12 / 30; // monthly
      environment.updateCo2(environment.getCo2() - co2_removed);
    }

    decay(woodDensity) {
      /** Mechanism that models decaying of the tree over time. */
      const decayed_diameter = this.diameter * 0.01;
      const decayed_height = decayed_diameter * 5;
      const decayed_volume = this.computeVolume(decayed_diameter, decayed_height)/200;
      this.height = Math.max(0, this.height - decayed_height);
      this.diameter = Math.max(0, this.diameter - decayed_volume);
      const decayed_mass = decayed_volume * woodDensity;
      environment.updateCo2(environment.getCo2() - (decayed_mass * 0.1));
      if (this.height == 0 || this.diameter == 0) {
        const position_self = this.getPosition();
        land.clear(position_self[0], position_self[1]);
      }
    }
  }

  class Coniferous extends Tree {
    #reproductionInterval;
    #maxAge = 90 + this.getTtlSenescent();
    #maxDiameter = getRandomInt(12, 24);
    #maxHeight= 82;
    #woodDensity = 2;
    
    constructor(position, reproductionInterval = REPRODUCTION_INTERVAL_CONIFEROUS) {
      super(position);
      const lifeStage = this.getLifeStage();
      if(lifeStage == 'sapling') {
        this.diameter = 1;
        this.height = 10*this.diameter;
      } else if (lifeStage == 'seedling') {
        this.diameter = 0.1;
        this.height = 10*this.diameter;
      } else {
        throw new Error(`Cannot create trees in the life stage ${lifeStage}.`);
      }
      this.#reproductionInterval = reproductionInterval;
    }

    growOlder() {
        /** Tree ages by one time unit. */
        // Still alive?
        this.age += 1;
        if (this.getLifeStage() == 'dead') this.decay(this.#woodDensity);
        else this.#live();
    }

    getLifeStage() {
        /** Returns the life stage that this tress is in. */
        if (this.stress >= 1) return "dead";
        else if (this.age < 4) return "seedling";
        else if (this.age < 26) return "sapling";
        else if (this.age < 60) return "mature";
        else if (this.age < 90) return "old_growth";
        else if (this.age < this.#maxAge) return "senescent";
        else return "dead";
    }

    #live() {
      /** Mechanism that models all changes to take place when
       *  the tree lives for another time unit's worth of time. */
      
      // Compute environmental stress.
      if (['seedling', 'sapling'].includes(this.getLifeStage())) {
        this.updateStressTimeEnv({
          'water': WATER_STRESS.stress_function_sensitive.coniferous,
          'temperature': TEMPERATURE_STRESS.stress_function_sensitive.coniferous,
          'co2': CO2_STRESS.stress_function_sensitive
        });
      } else {
        this.updateStressTimeEnv({
          'water': WATER_STRESS.stress_function.coniferous,
          'temperature': TEMPERATURE_STRESS.stress_function.coniferous,
          'co2': CO2_STRESS.stress_function
        });
      }

      // Grow.
      this.grow(this.#maxDiameter, this.#maxHeight);
      
      // Absorb CO2.
      this.absorbCo2(this.#woodDensity);

      // Reproduce if possible.
      this.last_reproduced += 1;
      this.reproduce(this.#reproductionInterval);
    }

    reproduce() {
      // If there is a free space adjacent to the tree 
      // & the tree is mature & Stress <= 0.5 
      // then the tree reproduces resulting in a new seedling 
      // at the adjacent empty land spot. 
      // Trees may reproduce only once every x no. of years.
      const adjacentFreeSpace = land.getAdjacentFreeSpace(this.getPosition());
      if (
        this.stress <= 0.5 && 
        !(['seedling', 'sapling'].includes(this.getLifeStage())) &&
        (this.last_reproduced >= this.#reproductionInterval) &&
        !(adjacentFreeSpace == -1)
      ) {
        land.plant('coniferous', adjacentFreeSpace[0], adjacentFreeSpace[1]);
        this.last_reproduced = 0;
        console.log(
          `\nTree ${this.getId()} at ${this.getPosition()} gave life to`,
          `a new coniferous tree at ${adjacentFreeSpace}!`
        );
      }
    }

    getTreeType() {
      /** Returns what kind of tree this is. */
      return 'coniferous';
    }

    getWoodDensity() {
      return this.#woodDensity;
    }
  }

  class Deciduous extends Tree {
    #reproductionInterval;
    #maxAge = 70 + this.getTtlSenescent();
    #maxDiameter = getRandomInt(8, 16);
    #maxHeight= 65;
    #woodDensity = 3;

    constructor(position, reproductionInterval = REPRODUCTION_INTERVAL_DECIDUOUS) {
      super(position);
      const lifeStage = this.getLifeStage();
      if(lifeStage == 'sapling') {
        this.diameter = 1;
        this.height = 5*this.diameter;
      } else if (lifeStage == 'seedling') {
        this.diameter = 0.1;
        this.height = 5*this.diameter;
      } else {
        throw new Error(`Cannot create trees in the life stage ${lifeStage}.`);
      }
      this.#reproductionInterval = reproductionInterval;
    }

    growOlder() {
      /** Tree ages by one time unit. */
      // Still alive?
      this.age += 1;
      if (this.getLifeStage() == 'dead') this.decay(this.#woodDensity);
      else this.#live();
    }

    getLifeStage() {
        /** Returns the life stage that this tress is in. */
        if (this.stress >= 1) return "dead";
        else if (this.age < 3) return "seedling";
        else if (this.age < 21) return "sapling";
        else if (this.age < 47) return "mature";
        else if (this.age < 70) return "old_growth";
        else if (this.age < this.#maxAge) return "senescent";
        else return "dead";
    }

    #live() {
      /** Mechanism that models all changes to take place when
       *  the tree lives for another time unit's worth of time. */
      
      // Compute environmental stress.
      if (['seedling', 'sapling'].includes(this.getLifeStage())) {
        this.updateStressTimeEnv({
          'water': WATER_STRESS.stress_function_sensitive.deciduous,
          'temperature': TEMPERATURE_STRESS.stress_function_sensitive.deciduous,
          'co2': CO2_STRESS.stress_function_sensitive
        });
      } else {
        this.updateStressTimeEnv({
          'water': WATER_STRESS.stress_function.deciduous,
          'temperature': TEMPERATURE_STRESS.stress_function.deciduous,
          'co2': CO2_STRESS.stress_function
        });
      }

      // Grow.
      this.grow(this.#maxDiameter, this.#maxHeight);
      
      // Absorb CO2.
      this.absorbCo2(this.#woodDensity);

      // Reproduce if possible.
      this.last_reproduced += 1
      this.reproduce(this.#reproductionInterval);
    }

    getTreeType() {
      /** Returns what kind of tree this is. */
      return 'deciduous';
    }

    reproduce() {
      // If there is a free space adjacent to the tree 
      // & the tree is mature & Stress <= 0.5 
      // then the tree reproduces resulting in a new seedling 
      // at the adjacent empty land spot. 
      // Trees may reproduce only once every x no. of years.
      const adjacentFreeSpace = land.getAdjacentFreeSpace(this.getPosition());
      if (
        this.stress <= 0.5 && 
        !(['seedling', 'sapling'].includes(this.getLifeStage())) &&
        (this.last_reproduced >= this.#reproductionInterval) &&
        !(adjacentFreeSpace == -1)
      ) {
        land.plant('deciduous', adjacentFreeSpace[0], adjacentFreeSpace[1]);
        this.last_reproduced = 0;
        console.log(
          `\nTree ${this.getId()} at ${this.getPosition()} gave life to a`,
          `new deciduous tree at ${adjacentFreeSpace}!`
        );
      }
    }

    getWoodDensity() {
      return this.#woodDensity;
    }
  }

  class TimberDemand {
    #basePrice; // per kg
    #currentPrice; // per kg
    #demand;
    #baseDemand;

    constructor(basePrice, baseDemand, changePercent, energyPercent, lumberPercent) {
      if (energyPercent + lumberPercent != 1) {
        throw new Error('Lumber and energy timber usage percentages must add up to 1.')
      }
      this.#basePrice = basePrice;
      this.#currentPrice = basePrice;
      this.changePercent = changePercent;
      this.timberUsage = {'lumber': lumberPercent, 'energy': energyPercent};
      this.#demand = baseDemand;
      this.#baseDemand = baseDemand;
    }

    #useTimber(timberWeightEnergy, timberWeightLumber) {
      /** Adds differing amounts of CO2 into the environment 
       *  based on what received wood was used for. */
      environment.updateCo2(
        environment.getCo2() 
        + (1.0 * timberWeightEnergy) 
        + (0.3 * timberWeightLumber)
      )
    }

    #computePrice(demandChangePercent) {
        /** Computes price for given amount of timber upon
         *  considering base timber price, current/given time and 
         *  annual change percent. This can be calculated using the 
         *  formula for compound interest which is as follows.
         *  futureValue = presentValue * (1 + percentChange)^(+-timeUnit) */
        const basePriceDemandAdjusted = this.#basePrice + (this.#basePrice * (this.#demand * 0.03))
        const pricePerUnit = basePriceDemandAdjusted * ((1 + demandChangePercent)^(
          demandChangePercent < 0 ? (-1 * demandChangePercent) : demandChangePercent
        ));
        return pricePerUnit;
    }

    updateDemand(demand=null) {
      /** Updates the demand based on change percent. */
      const demandOld = this.#demand;
      let demandNew = demand;
      if (demandNew == null) {
        demandNew = (
          demandOld + this.#baseDemand 
          + (this.#baseDemand * time.year * this.changePercent)
        );
      }
      const demandChangePercent = (demandNew - demandOld) / demandOld;
      this.#demand = demandNew;
      this.#currentPrice = this.#computePrice(demandChangePercent);
    }

    getDemand() {
      /** Returns current demand. */
      return this.#demand;
    }

    getBasePrice() {
      /** Returns base price per kg of timber. */
      return this.#basePrice;
    }

    getCurrentPrice() {
      /** Returns current price per kg of timber. */
      return this.#currentPrice;
    }

    meetDemand(suppliedWeight) {
      this.#useTimber(
        (suppliedWeight*this.timberUsage['energy']*1),
        (suppliedWeight*this.timberUsage['lumber']*0.3)
      )
      this.#demand -= suppliedWeight;
      funds += this.getCurrentPrice() * suppliedWeight * 0.01;
    }
  }

  const takeTimeStep = () => {
    /** Updates time by 1 week. */

    // Turn the wheel of time.
    time = timeDelta(time, 1);

    // Update the land's biodiversity.
    land.updateBiodiversity();

    // Update environment CO2 amount.
    environment.updateCo2()
    
    // Update environment temperature.
    environment.updateTemperature();

    // Loop through all trees and make them age.
    const treeOrder = shuffle(Object.keys(trees));
    treeOrder.forEach(treeId => {
      const treePosition = trees[treeId];
      const tree = land.getLandContent(treePosition[0], treePosition[1]);
      tree.growOlder();
    });

    // Update timber demand.
    timberDemand.updateDemand();

    // Execute all planned actions.
    plan.executeTimeActions(time.month, time.year);
  }

  const play = () => {
    /** Start the simulation. */
    const timeSteps = (
      ((TIME_RANGE[1].year - TIME_RANGE[0].year) * 12)
      + (TIME_RANGE[1].month - TIME_RANGE[0].month)
    );
    // const timeSteps = 100;

    // add planned actions
    rotationPeriod = 10;
    plan.addAction(1, 2, true, 'fell', 1, 'deciduous', 3, 'mature');
    // plan.addAction(1, 2, true, 'fell', 2, 'deciduous', 3, 'mature');
    // plan.addAction(1, 2, true, 'fell', 3, 'deciduous', 3, 'mature');
    // plan.addAction(1, 2, true, 'fell', 4, 'deciduous', 3, 'mature');

    // Take time steps.
    let i=1;
    const loopFun = () => {
      if (i >= timeSteps) {
        clearInterval(interval);
        console.log('\n###################### END ######################');
      }
      takeTimeStep();
      // printWorld(i+1);

      let landGrid = [];
      let tree;
      let lifeStage;
      for (let x = 0; x < land.getLandSize()[0]; x++) {
        for (let y = 0; y < land.getLandSize()[1]; y++) {
          tree = land.getLandContent(x, y);
          if (tree !== -1) {
            lifeStage = tree.getLifeStage();
            if (['seedling', 'sapling', 'dead'].includes(lifeStage)) {
                landGrid.push({
                    'position': [x, y],
                    'treeImg': TREE_IMGS[lifeStage]
                });
            } else {
                landGrid.push({
                    'position': [x, y],
                    'treeImg': TREE_IMGS[lifeStage][tree.getTreeType()]
                });
            }
          } else {
            landGrid.push({
                'position': [x, y],
                'treeImg': TREE_IMGS['none']
            });
          }
        }
      }
      setLandGrid(landGrid);
      setStateBiodiversity(Math.round(land.getBiodiversity(), 2));
      setStateCo2(Math.round(environment.getCo2(), 2));
      setStateTemperature(Math.round(environment.getTemperature(), 2));
      setStateTime(time);
      setStateTimeStep(`${i+1}/${timeSteps}`);
      setStateTimberDemand(Math.round(timberDemand.getDemand(), 2));
      setStateFunds(Math.round(funds, 2));
      setStateTreeCount(Object.keys(trees).length);
      
      i = i + 1;
    }
    const interval = setInterval(loopFun, 1000/FPS);
  }

  const stop = (t = null) => {
    /** Start the simulation. If not specific moment is given at 
     *  which to stop the simulation, then it is stopped at the 
     *  current moment. */
    if (t == null) t = time;
    console.log('stop() => TO DO ...');
  }

  const printWorld = (timeStep = null) => {
    /** Console log the state of the world. 
     *  This function is meant to be used during development. */
    let landSize = land.getLandSize();
    const curTime = time;
    console.log(`\nTIME = month: ${curTime.month} / year: ${curTime.year}`);
    if (timeStep != null) console.log(`Time Step = ${timeStep}`);
    console.log(`CO2 = ${environment.getCo2()} kg`);
    console.log(`Biodiversity = ${land.getBiodiversity()}`);
    console.log(`Temperature = ${environment.getTemperature()} °C`);
    console.log(`Timber Demand = ${timberDemand.getDemand()} kg`);
    console.log(`Funds = ${funds} Barcon`);
    console.log(`No. of trees = ${Object.keys(trees).length}`);
    let row;
    for (let x=0; x<landSize[0]; x++) {
      row = "|"
      for (let y=0; y<landSize[1]; y++) {
        const tree = land.getLandContent(x, y);
        if (tree == -1) row = row.concat("_|");
        else row = row.concat(`${
          tree.getLifeStage().substring(0,3)
        }(${roundToNPlaces(tree.stress, 2)})|`);
      }
      console.log(row);
    }
  }

  const initializeWorld = () => {
    /** Define trees in  a new world here.
     *  This function is meant to be used during development. */
    
    // Plant trees.
    const toPlant = [
      ['deciduous', [3, 2]],
      ['coniferous', [2, 3]]
    ];
    toPlant.forEach(treeTypePos => land.plant(
      treeTypePos[0], treeTypePos[1][0], treeTypePos[1][1]
    ));

    // Start world.
    console.log('\n##################### START #####################');
    play();
  }

  // Global constants. 
  const FPS = 10;
  const START_FUNDS = 10000.0;
  const START_WATER = 120.0;
  const START_CO2 = 1000.0;
  const START_PRICE_TIMBER = 100.0;
  const START_TEMPERATURE = -3.0;
  const START_ROTATION_PERIOD = 100; // time steps
  const START_TIMBER_DEMAND = 10;
  const LAND_DIM = 6; // No. of rows = no. of columns.
  const MONTH_DAYS = {
      'jan': 31, 'feb': 28, 'mar': 31,
      'apr': 30, 'may': 31, 'jun': 30,
      'jul': 31, 'aug': 32, 'sep': 30,
      'oct': 31, 'nov': 30, 'dec': 31
  }
  const SEASON_MONTH = {
      'winter': [12, 1, 2], 
      'spring': [3, 4, 5],
      'summer': [6, 7, 8],
      'autumn': [9, 10, 11]
  }
  const MONTH_SEASON = {
    12: 'winter', 1: 'winter', 2: 'winter',
    3: 'spring', 4: 'spring', 5: 'spring',
    6: 'summer', 7: 'summer', 8: 'summer',
    9: 'autumn', 10: 'autumn', 11: 'autumn',
  }
  const REPRODUCTION_INTERVAL_CONIFEROUS = 20;
  const REPRODUCTION_INTERVAL_DECIDUOUS = 10;
  const WATER_STRESS = {
    requirement: {
      coniferous: [[-90.0, 1.0],
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
        [0.0, 1.0],
        [10.0, 1.0],
        [20.0, 1.0],
        [30.0, 1.0],
        [40.0, 1.0],
        [50.0, 0.98],
        [60.0, 0.92],
        [70.0, 0.8],
        [80.0, 0.7],
        [90.0, 0.5],
        [100.0, 0.3],
        [110.0, 0.1],
        [120.0, 0.05],
        [130.0, 0.03],
        [140.0, 0.01],
        [150.0, 0.0],
        [160.0, 0.0],
        [170.0, 0.0],
        [180.0, 0.0],
        [190.0, 0.01],
        [200.0, 0.03],
        [210.0, 0.06],
        [220.0, 0.1],
        [230.0, 0.15],
        [240.0, 0.2],
        [250.0, 0.25],
        [260.0, 0.35],
        [270.0, 0.65],
        [280.0, 0.95],
        [290.0, 0.98],
        [300.0, 1.0],
        [310.0, 1.0]
      ]
    },
    requirement_sensitive: {
      coniferous: [
        [0.0, 1.0],
        [10.0, 1.0],
        [20.0, 1.0],
        [30.0, 1.0],
        [40.0, 1.0],
        [50.0, 0.98],
        [60.0, 0.96],
        [70.0, 0.9],
        [80.0, 0.8],
        [90.0, 0.6],
        [100.0, 0.4],
        [110.0, 0.2],
        [120.0, 0.09],
        [130.0, 0.04],
        [140.0, 0.01],
        [150.0, 0.0],
        [160.0, 0.0],
        [170.0, 0.0],
        [180.0, 0.01],
        [190.0, 0.05],
        [200.0, 0.1],
        [210.0, 0.2],
        [220.0, 0.3],
        [230.0, 0.4],
        [240.0, 0.6],
        [250.0, 0.8],
        [260.0, 0.95],
        [270.0, 0.98],
        [280.0, 1.0],
        [290.0, 1.0],
        [300.0, 1.0],
        [310.0, 1.0]
      ], 
      deciduous: [
        [0.0, 1.0],
        [10.0, 1.0],
        [20.0, 1.0],
        [30.0, 1.0],
        [40.0, 1.0],
        [50.0, 1.0],
        [60.0, 1.0],
        [70.0, 1.0],
        [80.0, 0.98],
        [90.0, 0.96],
        [100.0, 0.9],
        [110.0, 0.8],
        [120.0, 0.6],
        [130.0, 0.4],
        [140.0, 0.2],
        [150.0, 0.09],
        [160.0, 0.04],
        [170.0, 0.01],
        [180.0, 0.0],
        [190.0, 0.0],
        [200.0, 0.0],
        [210.0, 0.01],
        [220.0, 0.05],
        [230.0, 0.1],
        [240.0, 0.2],
        [250.0, 0.3],
        [260.0, 0.4],
        [270.0, 0.6],
        [280.0, 0.8],
        [290.0, 0.95],
        [300.0, 0.98],
        [310.0, 1.0]
      ]
    }
  }
  WATER_STRESS['stress_function'] = {
    coniferous: createInterpolationFunction(WATER_STRESS.requirement.coniferous),
    deciduous: createInterpolationFunction(WATER_STRESS.requirement.deciduous)
  }
  WATER_STRESS['stress_function_sensitive'] = {
    coniferous: createInterpolationFunction(WATER_STRESS.requirement_sensitive.coniferous),
    deciduous: createInterpolationFunction(WATER_STRESS.requirement_sensitive.deciduous)
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
  CO2_STRESS['stress_function'] = createInterpolationFunction(
    CO2_STRESS.requirement
  );
  CO2_STRESS['stress_function_sensitive'] = createInterpolationFunction(
    CO2_STRESS.requirement_sensitive
  );
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
  const CHANGE_MONTHLY_TEMPERATURE = {
    '12-1': -5, '1-2': 2, '2-3': 6,
    '3-4': 7, '4-5': 8, '5-6': 5,
    '6-7': 3, '7-8': 0, '8-9': -5,
    '9-10': -7, '10-11': -7, '11-12': -7
  }
  const CHANGE_PERCENT_CO2 = 0.0019/52; // weekly
  const START_CO2_EMISSION = 320;
  const TIMBER_USAGE_PERCENT = {'lumber': 0.4, 'energy': 0.6}
  const TIME_RANGE = [{month:3, year:0}, {month:3, year:100}];
  const TREE_IMGS = {
    seedling: {scale: 0.08, fill:'#8CD79F', d:'56 34.49183,-235.41161 111.29489,-186.41246c76.80307,48.99915 -56.75655,225.30106 -136.83437,192.97202c-80.07782,-32.32905 -134.62989,-232.88183 -129.10635,-246.2231c5.52355,-13.34127 69.87351,-2.37776 99.12336,76.54843c29.24985,78.92619 61.22376,159.66806 54.39886,163.85536'},
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
  }

  // Global world properties.
  let time = TIME_RANGE[0];
  let actionIdNext = 0;
  let actionIdAvailable = [];
  let treeIdNext = 0;
  let treeIdAvailable = [];
  let funds = START_FUNDS;
  let land = new Land(LAND_DIM, LAND_DIM);
  let environment = new Environment();
  let plan = new Plan();
  let co2Emission = START_CO2_EMISSION;
  let trees = {};
  let cost_planing = 100;
  let cost_felling = 200;
  let rotationPeriod = START_ROTATION_PERIOD;
  let timberDemand = new TimberDemand(
    START_PRICE_TIMBER, START_TIMBER_DEMAND, 
    CHANGE_PERCENT_CO2, TIMBER_USAGE_PERCENT['energy'], 
    TIMBER_USAGE_PERCENT['lumber']
  )

  useEffect(() => {
    initializeWorld();
  }, []);

  useEffect(() => {
    const svg = d3.select(refSvg.current);
    const widthSvg = Number(svg.style('width').replace('px', ''));
    const heightSvg = Number(svg.style('height').replace('px', ''));
    const margins = {left: 30, top: 20, right: 0, bottom: 0};
    const widthPlot = widthSvg - margins.left - margins.right;
    const heightPlot = heightSvg - margins.top - margins.bottom;
    const gPlot = svg.selectAll('.group-plot')
                    .data(['g'])
                    .join('g')
                    .attr('class', 'group-plot')
                    .attr('width', widthPlot)
                    .attr('height', heightPlot)
                    .attr('transform', `translate(${margins.left}, ${margins.top})`);
    const gXAxis = gPlot.selectAll('.group-x-axis')
                        .data(['g'])
                        .join('g')
                        .attr('opacity', 0)
                        .attr('class', 'group-x-axis')
                        .attr('transform', `translate(${0}, ${heightPlot})`);
    const gYAxis = gPlot.selectAll('.group-y-axis')
                        .data(['g'])
                        .attr('opacity', 0)
                        .join('g')
                        .attr('class', 'group-y-axis');
    const domain = [];
    for (let i=1; i<=LAND_DIM; i++) domain.push(i);
    const scaleX = d3.scaleBand()
                    .domain(domain)
                    .range([0, widthPlot]);
    const scaleY = d3.scaleBand()
                    .domain(domain)
                    .range([heightPlot, 0])
    gXAxis.call(d3.axisBottom(scaleX));
    gYAxis.call(d3.axisLeft(scaleY));
    // Add trees.
    const gTrees = gPlot.selectAll('.group-trees')
                        .data(['g'])
                        .join('g')
                        .attr('class', 'group-trees');
    gTrees.selectAll('.tree')
        .data(landGrid)
        .join('path')
        .attr('class', 'tree')
        .attr('fill', d => d.treeImg.fill)
        .attr('stroke', '#000')
        .attr('stroke-width', 8)
        .attr('transform', d => {
            return `translate(${scaleX(d.position[0]+1)},${scaleY(d.position[1]+1)}) scale(${d.treeImg.scale})`
        })
        .transition()
        .duration(50)
        .attr('d', d => d.treeImg.d);
        
  }, [landGrid]);

  return (
    <div className='w-full grid p-10'>
      <div className={`mx-auto min-w-96 max-w-full min-h-96 border-yellow-600 border-4 justify-items-stretch`}>
        <svg className='bg-slate-200 w-full h-full' ref={refSvg}></svg>
      </div>
      <div className='w-full'>
        <span>Time Step = {stateTimeStep}    |    </span>
        <span>Time = Month {stateTime.month} , Year {stateTime.year}    |    </span>
        <span>CO2 = {stateCo2} Kg    |    </span>
        <span>Temperature = {stateTemperature} °C    |    </span>
        <span>Funds = {stateFunds} Bc    |    </span>
        <span>Timber Demand = {stateTimberDemand} Kg    |    </span>
        <span>Biodiversity Score = {stateBiodiversity}    |    </span>
        <span># Trees = {stateTreeCount}    |    </span>
      </div>
    </div>
  )
}

export default World