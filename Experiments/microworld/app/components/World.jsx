import React from 'react'
var linearInterpolator = require('linear-interpolator');

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
  /** Shuffles an array using the Fisher-Yates Shuffle */
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

const timeDelta = (from, days, direction) => {
  /** Returns time that is numSteps no. of steps
   *  away from given startTime object in the given direction
   *  wherein size of each step is stepSize. */
  const newTimeDays = time2days({
      year: from.year, month: from.month, day: from.day
  }) + (direction * days);
  if (newTimeDays < 0 || newTimeDays > time2days({
      year: RANGE_YEARS[1], month:'dec', day:31
  })) {
      throw new Error(`Days ${days} out of range.`);
  }
  return days2time(newTimeDays);
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
              row.push(null);
          }
          this.#positions.push(row);
      }
  }
  
  // BEHAVIORS
  getLandSize() {
      /** Gets set no. of rows and columns. */
      return [this.#numRows, this.#numColumns];
  }

  #getQuadrantRange(q) {
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
      const rangeQuadrant = this.#getQuadrantRange(q);

      let counts = {
          deciduous: 0, coniferous: 0,
          seedling: 0, sapling: 0, mature: 0, old_growth: 0, senescent: 0, dead: 0
      }

      for (let x = rangeQuadrant[0][0]; x <= rangeQuadrant[0][1]; x++) {
          for (let y = rangeQuadrant[1][0]; y <= rangeQuadrant[1][1]; y++) {
              let tree = this.getLandContent(x, y);
              if (tree != null) {
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
        this.#biodiversity[0] = this.#computeQuadrantBiodiversity(i+1);
      }
  }

  plant(treeType, rowColumnIdx, treeAge=0) {
      /** Plants a tree of given type and age at given location. */
      // Check age class of the tree and throw error if the tree is 
      // older than the sapling stage.

      // Check if given position is valid.
      checkIndexOutOfRange(rowColumnIdx[0], 0, this.#numRows, rowColumnIdx[1], 0, this.#numColumns); 

      // Check if given position already has a tree. If 
      // so, then it is not possible to plant another one here.
      if (this.getLandContent(rowColumnIdx[0], rowColumnIdx[1]) != null) {
        throw new Error(`Cannot plant at ${JSON.stringify(rowColumnIdx)}. Already occupied.`);
      }

      // Create a new tree if a valid tree type was provided.
      let newTree;
      if (treeType == 'coniferous') {
          newTree = new Coniferous(rowColumnIdx, treeAge);
      } else if (treeType == 'deciduous') {
          newTree = new Deciduous(rowColumnIdx, treeAge);
      } else {
          throw new Error(`Invalid tree type ${treeType}.`);
      }

      // Check if the age of the tree is appropriate.
      if (!['seedling', 'sapling'].includes(newTree.getLifeStage())) {
          throw new Error(`Invalid tree age ${treeAge}. Only seedlings and saplings can be planted.`);
      }

      // Add the new tree to the land.
      this.#positions[rowColumnIdx[0]][rowColumnIdx[1]] = newTree;
      trees[newTree.getId()] = [rowColumnIdx[0], rowColumnIdx[1]];
  }

  clear(rowIdx, columnIdx, utility = null) {
      /** Clears any plants on a piece of land for a particular
       *  use which could be either "lumber" or "energy". */
      // Check age class of the tree and throw error if the tree is 
      // older than the sapling stage.
      if (utility != null && !TREE_UTILITY.includes(utility)) {
          throw new Error('Invalid tree utility.')
      }

      const tree = this.#positions[rowIdx][columnIdx];
      treeIdAvailable.push(tree.getId());
      this.#positions[rowIdx][columnIdx] = null;
      delete trees[tree.getId()];

      if (utility == 'energy') environment += tree.computeVolume() * 0.5;
      else environment.co2 += tree.computeVolume() * 0.5 * 0.1; // utility == 'lumber'
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
        if (
          !(x < 0 || x >= this.#numRows || y < 0 || y >= this.#numColumns)
          && (this.getLandContent(x, y) == null)
        ) {
          validAdjacentPositions.push([x, y]);
        }
      }
    }
    // Loop through valid adjacent positions and return a random one.
    if (validAdjacentPositions.length == 0) return -1;
    else return validAdjacentPositions[getRandomInt(0, validAdjacentPositions.length)];
  }
}

class Environment {
  // #water;

  constructor() {
      // this.#water = Array.from({ length: RANGE_YEARS[1] }, () => {
      //     let month_vals = {};
      //     for (let k in Object.keys(MONTH_DAYS)) {
      //         month_vals[k] = START_WATER;
      //     }
      //     return month_vals;
      // });
      this.temperature = START_TEMPERATURE;
      this.co2 = START_CO2;
  }

  // getWater = (t = null) => {
  //     /** Returns monthly water settings at current time if t is null 
  //      *  or at given time if t is not null. */
  //     if (t == null) t = time;
  //     return this.#water[t.year][t.month];
  // }

  // setWater = (settings) => {
  //     /** Sets water settings for any one/multiple 
  //      *  month(s) of each year. 
  //      *  settings = [{'year':x, 'month':y, 'val':z}, ...] */
  //     settings.forEach(s => {
  //         this.#water[s.year][s.month] = s.val;
  //     });
  // }
}

class Plan {
  #timeline
  // TO DO ...

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
      const idObj = getNewId(actionIdNext, actionIdAvailable);
      this.#id = idObj.id;
      actionIdNext = idObj.next;
      actionIdAvailable = idObj.available;
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

class Tree {
  #id;
  #ttlSenescent;
  #position;
  #maxGrowthRate = 1; // [0,1]
  #biodiversityReductionFactor = { unforested: 0, plantation: 0.01, forest: 0.1, ecosystem: 0.3 }
  
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

      // Set senescent time to live.
      this.#ttlSenescent = getRandomInt(5, 10);

      // Set reproduction related parameter.
      this.year_last_reproduced = 0;
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
      // this.stress += basic_needs_stress.water(environment.getWater());
      // this.stress += basic_needs_stress.temperature(environment.temperature);
      this.stress += basic_needs_stress.co2(environment.co2);
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

  absorbCo2() {
    const growthRate = this.#computeGrowthRate();
    const co2_current = environment.co2;
    const co2_removed = (
      (this.computeVolume() * WOOD_DENSITY.deciduous * 0.5) + (1 + (0.5 * growthRate))
    ) / 12 / 4; // weekly
    environment.co2 -= co2_removed;
  }

  reproduce(reproductionInterval) {
    // If there is a free space adjacent to the tree 
    // & the tree is mature & Stress <= 0.5 
    // then the tree reproduces resulting in a new seedling 
    // at the adjacent empty land spot. 
    // Trees may reproduce only once every x no. of years.
    const adjacentFreeSpace = land.getAdjacentFreeSpace(this.getPosition());
    if (
      this.stress <= 0.5 && 
      !(['seedling', 'sapling'].includes(this.getLifeStage())) &&
      (TIME[curTimeIdx].year - this.year_last_reproduce) >= reproductionInterval &&
      !(adjacentFreeSpace == -1)
    ) {
      land.plant('deciduous', adjacentFreeSpace[0], adjacentFreeSpace[1]);
      this.year_last_reproduce = TIME[curTimeIdx].year;
      console.log(`Tree ${this.getId()} at ${this.getPosition} created a child tree at ${adjacentFreeSpace}!`);
    }
  }

  decay() {
    /** Mechanism that models decaying of the tree over time. */
    const decayed_diameter = this.diameter * 0.01;
    const decayed_height = decayed_diameter * 5;
    const decayed_volume = this.computeVolume(decayed_diameter, decayed_height);
    this.height = Math.max(0, this.height - decayed_height);
    this.diameter = Math.max(0, this.diameter - decayed_volume);
    environment.co2 += decayed_volume * 0.7;
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
  
  constructor(position, age = 0, reproductionInterval = REPRODUCTION_INTERVAL_CONIFEROUS) {
    super(position);
    this.age = age;
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
      if (this.getLifeStage() == 'dead') this.decay();
      else this.#live();
  }

  getLifeStage() {
      /** Returns the life stage that this tress is in. */
      if (this.stress >= 1.0) return "dead";
      else if (this.age < 4) return "seedling";
      else if (this.age < 26) return "sapling";
      else if (this.age < 60) return "mature";
      else if (this.age < 90) return "old-growth";
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
    this.absorbCo2()

    // Reproduce if possible.
    this.reproduce(this.#reproductionInterval);
  }

  getTreeType() {
    /** Returns what kind of tree this is. */
    return 'coniferous';
  }
}

class Deciduous extends Tree {
  #reproductionInterval;
  #maxAge = 70 + this.getTtlSenescent();
  #maxDiameter = getRandomInt(8, 16);
  #maxHeight= 65;

  constructor(position, age = 0, reproductionInterval = REPRODUCTION_INTERVAL_DECIDUOUS) {
    super(position);
    this.age = age;
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
    if (this.getLifeStage() == 'dead') this.decay();
    else this.#live();
  }

  getLifeStage() {
      /** Returns the life stage that this tress is in. */
      if (this.stress >= 1.0) return "dead";
      else if (this.age < 3) return "seedling";
      else if (this.age < 21) return "sapling";
      else if (this.age < 47) return "mature";
      else if (this.age < 70) return "old-growth";
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
    this.absorbCo2()

    // Reproduce if possible.
    this.reproduce(this.#reproductionInterval);
  }

  getTreeType() {
    /** Returns what kind of tree this is. */
    return 'deciduous';
  }
}

class TimberDemand {
  // TO DO ...
  #basePrice; // per kg
  #timberUsage;

  constructor(basePrice, annualChangePercent, energyPercent, lumberPercent) {
      this.#basePrice = basePrice;
      this.annualChangePercent = annualChangePercent;
      this.setTimberUsage(energyPercent, lumberPercent);
      this.demand = START_TIMBER_DEMAND;
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

  fetchPrice(timberAmount, t = null) {
      /** Computes price for given given amount of timber upon
       *  considering base timber price, current/given time and 
       *  annual change percent. 
       *  This can be calculated using the formula for compound interest
       *  which is as follows.
       *  futureValue = presentValue * (1 + percentChange)^(+-timeUnit) */
      if (t == null) t = TIME[curTimeIdx];
      const basePriceDemandAdjusted = this.#basePrice + (this.#basePrice * (this.demand * 0.03))
      const pricePerUnit = basePriceDemandAdjusted * ((1 + this.annualChangePercent)^(
          this.annualChangePercent < 0 ? 
          (-1 * this.annualChangePercent) : 
          this.annualChangePercent
      ));
      return pricePerUnit * timberAmount;
  }
}

// Global functions.
const takeTimeStep = () => {
  /** Updates time by 1 week. */

  // Update the land's biodiversity.
  land.updateBiodiversity();

  // Turn the wheel of time.
  const month_old = TIME[curTimeIdx].month;
  curTimeIdx += 1;
  const month_new = TIME[curTimeIdx].month;

  // Update environment CO2 amount.
  co2Emission += (co2Emission * CHANGE_PERCENT_CO2);
  const co2Old = environment.co2;
  let co2New = co2Old + co2Emission;
  environment.co2 = co2New;
  
  // Update environment temperature.
  const co2ChangePercent =  ((co2New - co2Old) / co2Old);
  const tempChange = 3 * co2ChangePercent;
  const tempChangeMonthly = (month_new == month_old) ? 0 : CHANGE_MONTHLY_TEMPERATURE[`${month_old}-${month_new}`];
  environment.temperature += tempChangeMonthly + tempChange;

  // Loop through all trees and make them age.
  const treeOrder = shuffle(Object.keys(trees));
  treeOrder.forEach(treeId => {
    const treePosition = trees[treeId];
    const tree = land.getLandContent(treePosition[0], treePosition[1]);
    tree.growOlder();
  });
}

const play = () => {
  /** Start the simulation. */
  // const timeSteps = TIME.length-1;
  const timeSteps = 20;
  for(let i=0; i<timeSteps; i++) {
    takeTimeStep();
    printWorld();
  }
}

const stop = (t = null) => {
  /** Start the simulation. If not specific moment is given at 
   *  which to stop the simulation, then it is stopped at the 
   *  current moment. */
  if (t == null) t = TIME[curTimeIdx];
  console.log('stop() => TO DO ...');
}

const printWorld = () => {
  /** Console log the state of the world. 
   *  This function is meant to be used during development. */
  let landSize = land.getLandSize();
  const curTime = TIME[curTimeIdx];
  console.log(`\nTIME = year: ${curTime.year} / month: ${curTime.month} / day: ${curTime.day}`);
  console.log(`CO2 = ${environment.co2}`);
  console.log(`Biodiversity = ${land.getBiodiversity()}`);
  console.log(`Temperature = ${environment.temperature}`);
  console.log(`No. of trees = ${Object.keys(trees).length}`);
  let row;
  for (let x=0; x<landSize[0]; x++) {
    row = "|"
    for (let y=0; y<landSize[1]; y++) {
      const tree = land.getLandContent(x, y);
      if (tree == null) row = row.concat("_|");
      else row = row.concat(`${tree.getLifeStage().substring(0,3)}(${roundToNPlaces(tree.stress, 2)})|`);
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
  toPlant.forEach(treeTypePos => land.plant(treeTypePos[0], treeTypePos[1]));

  // Start world.
  play();
}

// Global constants. 
const RANGE_YEARS = [0, 100];
const RANGE_WATER = [0.0, 310.0];
const RANGE_TEMPERATURE = [-60.0, 100.0];
const START_FUNDS = 10000.0;
const START_WATER = 120.0;
const START_CO2 = 500.0;
const START_PRICE_TIMBER = 100.0;
const START_TEMPERATURE = -3.0;
const START_MONTH = 'mar'
const RENDER_DELAY = 1; // In seconds.
const START_TIMBER_DEMAND = 10;
const TREE_UTILITY = ["energy", "lumber"];
const LAND_DIM = 4; // No. of rows = no. of columns.
const MONTH_DAYS = {
    'jan': 31, 'feb': 28, 'mar': 31,
    'apr': 30, 'may': 31, 'jun': 30,
    'jul': 31, 'aug': 32, 'sep': 30,
    'oct': 31, 'nov': 30, 'dec': 31
}
const SEASON_MONTH = {
    'winter': ['dec', 'jan', 'feb'], 
    'spring': ['mar', 'apr', 'may'],
    'summer': ['jun', 'jul', 'aug'],
    'autumn': ['sep', 'oct', 'nov']
}
const MONTH_SEASON = {
  'dec': 'winter', 'jan': 'winter', 'feb': 'winter',
  'mar': 'spring', 'apr': 'spring', 'may': 'spring',
  'jun': 'summer', 'jul': 'summer', 'aug': 'summer',
  'sep': 'autumn', 'oct': 'autumn', 'nov': 'autumn',
}
const REPRODUCTION_INTERVAL_CONIFEROUS = 50;
const REPRODUCTION_INTERVAL_DECIDUOUS = 20;
const WATER_STRESS = {
  requirement: {
    coniferous: [
      [0.0, 1.0],
      [10.0, 1.0],
      [20.0, 1.0],
      [30.0, 0.98],
      [40.0, 0.92],
      [50.0, 0.8],
      [60.0, 0.6],
      [70.0, 0.3],
      [80.0, 0.1],
      [90.0, 0.05],
      [100.0, 0.02],
      [110.0, 0.0],
      [120.0, 0.0],
      [130.0, 0.0],
      [140.0, 0.0],
      [150.0, 0.0],
      [160.0, 0.01],
      [170.0, 0.03],
      [180.0, 0.06],
      [190.0, 0.09],
      [200.0, 0.12],
      [210.0, 0.15],
      [220.0, 0.2],
      [230.0, 0.25],
      [240.0, 0.35],
      [250.0, 0.65],
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
CO2_STRESS['stress_function'] = createInterpolationFunction(CO2_STRESS.requirement);
CO2_STRESS['stress_function_sensitive'] = createInterpolationFunction(CO2_STRESS.requirement_sensitive);
const TEMPERATURE_STRESS = {
  requirement:{
    coniferous: [
      [-60.0, 0.2],
      [-50.0, 0.15],
      [-40.0, 0.1],
      [-30.0, 0.06],
      [-20.0, 0.03],
      [-10.0, 0.01],
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
      [-60.0, 0.9],
      [-50.0, 0.8],
      [-40.0, 0.7],
      [-30.0, 0.4],
      [-20.0, 0.2],
      [-10.0, 0.1],
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
      [-60.0, 1.0],
      [-50.0, 1.0],
      [-40.0, 0.9],
      [-30.0, 0.6],
      [-20.0, 0.4],
      [-10.0, 0.25],
      [0.0, 0.1],
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
      [-60.0, 1.0],
      [-50.0, 1.0],
      [-40.0, 1.0],
      [-30.0, 0.9],
      [-20.0, 0.6],
      [-10.0, 0.4],
      [0.0, 0.1],
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
    ]
  }
}
TEMPERATURE_STRESS['stress_function'] = {
  coniferous: createInterpolationFunction(TEMPERATURE_STRESS.requirement.coniferous),
  deciduous: createInterpolationFunction(TEMPERATURE_STRESS.requirement.deciduous)
}
TEMPERATURE_STRESS['stress_function_sensitive'] = {
  coniferous: createInterpolationFunction(TEMPERATURE_STRESS.requirement_sensitive.coniferous),
  deciduous: createInterpolationFunction(TEMPERATURE_STRESS.requirement_sensitive.deciduous)
}
const WOOD_DENSITY = { // unit weight per unit volume
  coniferous: 3,
  deciduous: 4
}
const CHANGE_MONTHLY_TEMPERATURE = {
  'dec-jan': -5, 'jan-feb': 2, 'feb-mar': 6,
  'mar-apr': 7, 'apr-may': 8, 'may-jun': 5,
  'jun-jul': 3, 'jul-aug': 0, 'aug-sep': -5,
  'sep-oct': -7, 'oct-nov': -7, 'nov-dec': -7
}
const CHANGE_PERCENT_CO2 = 0.0019/52; // weekly
const START_CO2_EMISSION = 5; // weekly

const TIME = []; // World Timeline
let t = {year:0, month:'mar', day: 0};
while (t.year < RANGE_YEARS[1]) {
  TIME.push(t);
  t = timeDelta(t, 7, 1); // Increment by 7 days.
}

// Global world properties.
let curTimeIdx = 0;
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

initializeWorld();

const World = () => {
  return (
    <div>
      <h1>My Microworld</h1>
    </div>
  )
}

export default World