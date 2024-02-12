'use client'

import * as d3 from 'd3';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Button from './Button';
import GlobalConfig from '../app.config.js'

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
        timeCompare(t, GlobalConfig.time_range[0]) > 0 ||
        timeCompare(t, GlobalConfig.time_range[1]) < 0
    ) throw new Error (
        `Time "${t.month} ${t.year}" not in range [`
        + `${GlobalConfig.time_range[0].month} ${GlobalConfig.time_range[0].year},`
        + `${GlobalConfig.time_range[1].month} ${GlobalConfig.time_range[1].year}].`
    );
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
        this.#temperature = GlobalConfig.start_temperature;
        this.#co2 = GlobalConfig.start_co2;
        this.#co2ChangePercent = 0;
    }

    updateCo2(co2 = null) {
      if (co2 == null) {
        const co2Old = this.#co2;
        co2Emission *= 1 + GlobalConfig.co2_change_percent;
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
          (month_now == month_past) ? 0 : GlobalConfig.temperature_monthly_change[
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
        this.rotationPeriod = GlobalConfig.start_rotation_period;
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
        t = timeDelta(t, GlobalConfig.plan.rotationPeriod);
      } while (repeat && timeCompare(t, GlobalConfig.time_range[1]) > 0);
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
        funds -= cost_planting;
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

    constructor(position, reproductionInterval = GlobalConfig.reproduction_interval_coniferous) {
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
                'temperature': GlobalConfig.temperature_stress.stress_function_sensitive.coniferous,
                'co2': GlobalConfig.co2_stress.stress_function_sensitive
            });
        } else {
            this.updateStressTimeEnv({
                'temperature': GlobalConfig.temperature_stress.stress_function.coniferous,
                'co2': GlobalConfig.co2_stress.stress_function
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
            // console.log(
            //     `\nTree ${this.getId()} at ${this.getPosition()} gave life to`,
            //     `a new coniferous tree at ${adjacentFreeSpace}!`
            // );
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

    constructor(position, reproductionInterval = GlobalConfig.reproduction_interval_deciduous) {
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
                'temperature': GlobalConfig.temperature_stress.stress_function_sensitive.deciduous,
                'co2': GlobalConfig.co2_stress.stress_function_sensitive
            });
        } else {
            this.updateStressTimeEnv({
                'temperature': GlobalConfig.temperature_stress.stress_function.deciduous,
                'co2': GlobalConfig.co2_stress.stress_function
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
            // console.log(
            //     `\nTree ${this.getId()} at ${this.getPosition()} gave life to a`,
            //     `new deciduous tree at ${adjacentFreeSpace}!`
            // );
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
    GlobalConfig.plan.executeTimeActions(time.month, time.year);
}

const getLandTreesToRender = () => {
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
                    'treeImg': GlobalConfig.TreeImgs[lifeStage]
                });
            } else {
                landGrid.push({
                    'position': [x, y],
                    'treeImg': GlobalConfig.TreeImgs[lifeStage][tree.getTreeType()]
                });
            }
            } else {
                landGrid.push({
                    'position': [x, y],
                    'treeImg': GlobalConfig.TreeImgs['none']
                });
            }
        }
    }
    return landGrid;
}

// Global world properties.
GlobalConfig.plan = new Plan();
let timeStep = 0;
let time = {year: GlobalConfig.time_range[0].year, month: GlobalConfig.time_range[0].month};
let funds = GlobalConfig.start_funds;
let land = new Land(GlobalConfig.land_dim, GlobalConfig.land_dim);
let environment = new Environment();
let co2Emission = GlobalConfig.start_co2_emission;
let trees = {};
let cost_planting = 100;
let cost_felling = 200;
let timberDemand = new TimberDemand(
    GlobalConfig.start_price_timber, GlobalConfig.start_timber_demand, 
    GlobalConfig.co2_change_percent, GlobalConfig.timber_use_percent['energy'], 
    GlobalConfig.timber_use_percent['lumber']
)
let playLoopInterval = -1;
let actionIdNext = 0;
let actionIdAvailable = [];
let treeIdNext = 0;
let treeIdAvailable = [];
let isInitialized = false;

const World = () => {
    const [landGrid, setLandGrid] = useState([]);
    const [stateTime, setStateTime] = useState(time);
    const [stateTimeStep, setStateTimeStep] = useState(`0 / ${GlobalConfig.time_steps}`);
    const [stateCo2, setStateCo2] = useState(environment.getCo2());
    const [stateTemperature, setStateTemperature] = useState(environment.getTemperature());
    const [stateFunds, setStateFunds] = useState(funds);
    const [stateTimberDemand, setStateTimberDemand] = useState(timberDemand.getDemand());
    const [stateBiodiversity, setStateBiodiversity] = useState(land.getBiodiversity());
    const [stateTreeCount, setStateTreeCount] = useState(Object.keys(trees).length);
    const [isPaused, setIsPaused] = useState(true);

    const play = () => {
        /** Start the simulation. */
        // const timeSteps = 100;
        const timeSteps = GlobalConfig.time_steps;

        // add planned actions
        // rotationPeriod = 10;
        // GlobalConfig.plan.addAction(1, 2, true, 'fell', 1, 'deciduous', 3, 'mature');
        // GlobalConfig.plan.addAction(1, 2, true, 'fell', 2, 'deciduous', 3, 'mature');
        // GlobalConfig.plan.addAction(1, 2, true, 'fell', 3, 'deciduous', 3, 'mature');
        // GlobalConfig.plan.addAction(1, 2, true, 'fell', 4, 'deciduous', 3, 'mature');

        // Take time steps.
        const loopFun = () => {
            if (timeStep >= timeSteps-1) stop();
            takeTimeStep(); // timeStep gets updated here.
            setLandGrid(getLandTreesToRender());
            setStateBiodiversity(Math.round(land.getBiodiversity(), 2));
            setStateCo2(Math.round(environment.getCo2(), 2));
            setStateTemperature(Math.round(environment.getTemperature(), 2));
            setStateTime(time);
            setStateTimeStep(`${timeStep+1}/${timeSteps}`);
            setStateTimberDemand(Math.round(timberDemand.getDemand(), 2));
            setStateFunds(Math.round(funds, 2));
            setStateTreeCount(Object.keys(trees).length);
            timeStep = timeStep + 1;
        }
        playLoopInterval = setInterval(loopFun, 1000/GlobalConfig.fps);
    }

    const playUntil = (month, year) => {
        resetWorld();
        time.month = 1;
        const timeSteps = (year * 12) + month;
        while (timeStep < timeSteps-1) {
            takeTimeStep(); // timeStep gets updated here.
            timeStep = timeStep + 1;
        }   
        stop();
        setLandGrid(getLandTreesToRender());
        setStateBiodiversity(Math.round(land.getBiodiversity(), 2));
        setStateCo2(Math.round(environment.getCo2(), 2));
        setStateTemperature(Math.round(environment.getTemperature(), 2));
        setStateTimeStep(`${timeStep+1}/${GlobalConfig.time_steps}`);
        setStateTimberDemand(Math.round(timberDemand.getDemand(), 2));
        setStateFunds(Math.round(funds, 2));
        setStateTreeCount(Object.keys(trees).length);
        setStateTime(time);
    }

    const stop = () => {
        /** Pause the simulation. */
        if (playLoopInterval) {
            clearInterval(playLoopInterval);
            playLoopInterval = -1;
        };
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
        
        // Plant starter trees.
        if (!isInitialized) {
            const toPlant = [
                ['deciduous', [3, 2]],
                ['coniferous', [2, 3]]
            ];
            toPlant.forEach(treeTypePos => land.plant(
                treeTypePos[0], treeTypePos[1][0], treeTypePos[1][1]
            ));
        }

        // Start world.
        let landGrid = getLandTreesToRender();
        setLandGrid(landGrid);
        isInitialized = true;
    }

    const resetWorld = () => {
        stop();
        timeStep = 0;
        time = {year: GlobalConfig.time_range[0].year, month: GlobalConfig.time_range[0].month};
        actionIdNext = 0;
        actionIdAvailable = [];
        treeIdNext = 0;
        treeIdAvailable = [];
        funds = GlobalConfig.start_funds;
        land = new Land(GlobalConfig.land_dim, GlobalConfig.land_dim);
        environment = new Environment();
        GlobalConfig.plan = new Plan();
        co2Emission = GlobalConfig.start_co2_emission;
        trees = {};
        cost_planting = GlobalConfig.start_cost_planting;
        cost_felling = GlobalConfig.start_cost_felling;
        timberDemand = new TimberDemand(
            GlobalConfig.start_price_timber, GlobalConfig.start_timber_demand, 
            GlobalConfig.co2_change_percent, GlobalConfig.timber_use_percent['energy'], 
            GlobalConfig.timber_use_percent['lumber']
        )

        setLandGrid([]);
        setStateTimeStep(`0 / ${GlobalConfig.time_steps}`);
        setStateCo2(environment.getCo2());
        setStateTemperature(environment.getTemperature());
        setStateFunds(funds);
        setStateTimberDemand(timberDemand.getDemand());
        setStateBiodiversity(land.getBiodiversity());
        setStateTreeCount(Object.keys(trees).length);
        setStateTime(time);
        setIsPaused(true);
        
        isInitialized = false;
        initializeWorld();
    }

    const refSvgLand = useRef();
    const refSvgTimeline = useRef();

    useEffect(() => {
        initializeWorld();
    }, []);

    useEffect(() => {
        const svg = d3.select(refSvgLand.current);
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
        for (let i=1; i<=GlobalConfig.land_dim; i++) domain.push(i);
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

    useEffect(() => {
        if (isPaused) stop();
        else play();
    }, [isPaused]);

    useEffect(() => {
        const svg = d3.select(refSvgTimeline.current);
        const widthSvg = Number(svg.style('width').replace('px', ''));
        const heightSvg = Number(svg.style('height').replace('px', ''));
        const margins = {left: 30, top: 35, right: 35, bottom: 20};
        const widthPlot = widthSvg - margins.left - margins.right;
        const heightPlot = heightSvg - margins.top - margins.bottom;
        const gPlot = svg.selectAll('.group-plot')
                        .data(['g'])
                        .join('g')
                        .attr('class', 'group-plot')
                        .attr('width', widthPlot)
                        .attr('height', heightPlot)
                        .attr('transform', `translate(${margins.left}, ${margins.top})`);
        
        // Month timeline.
        const gYAxisMonth = gPlot.selectAll('#y-axis-month')
                                .data(['g'])
                                .join('g')
                                .attr('class', 'group-y-axis')
                                .attr('id', 'y-axis-month');
        const scaleYMonth = d3.scaleBand()
                            .domain(d3.range(1, 13))
                            .range([0, heightPlot])
                            .paddingInner(1);
        gYAxisMonth.call(d3.axisLeft(scaleYMonth));
        gYAxisMonth.selectAll('path')
                .attr('opacity', 0);
        gYAxisMonth.selectAll('line')
                .attr('x2', 2)
                .attr('stroke-width', 2);
        gPlot.selectAll('#label-month')
                .data(['M'])
                .join('text')
                .attr('id', 'label-month')
                .text(d => d)
                .attr("x", 0)
                .attr("y", -1 * (margins.top/2.5))
                .attr("font-size", "10px")
                .attr('text-anchor', 'end')
                .style("font-weight", "bold");
        gYAxisMonth.selectAll('.marker')
                .data([stateTime])
                .join('circle')
                .attr('class', 'marker')
                .attr('cx', 0)
                .attr('r', 5)
                .attr('fill', '#8888ff')
                .transition()
                .duration(100)
                .attr('cy', d => scaleYMonth(d.month));

        // Year timeline.
        const gYAxisYear = gPlot.selectAll('#y-axis-year')
                .data(['g'])
                .join('g')
                .attr('class', 'group-y-axis')
                .attr('id', 'y-axis-year')
                .attr('transform', `translate(${widthPlot}, ${0})`);
        const scaleYYear = d3.scaleBand()
                            .domain(d3.range(GlobalConfig.time_range[0].year, GlobalConfig.time_range[1].year+1))
                            .range([0, heightPlot])
                            .paddingInner(1);
        gYAxisYear.call(d3.axisRight(scaleYYear));
        gYAxisYear.selectAll('path')
        .attr('opacity', 0);
        gYAxisYear.selectAll('line')
                .attr('x2', 2)
                .attr('stroke-width', 2);
        gPlot.selectAll('#label-year')
            .data(['Y'])
            .join('text')
            .attr('id', 'label-year')
            .text(d => d)
            .attr("x", widthPlot)
            .attr("y", -1 * (margins.top/2.5))
            .attr("font-size", "10px")
            .attr('text-anchor', 'middle')
            .style("font-weight", "bold");
        gYAxisYear.selectAll('.marker')
                .data([stateTime])
                .join('circle')
                .attr('class', 'marker')
                .attr('cx', 0)
                .attr('r', 5)
                .attr('fill', '#ff8888')
                .transition()
                .duration(500)
                .attr('cy', d => scaleYYear(d.year));
    }, [stateTime]);

    useEffect(() => {
        // Timeline selection action.
        const svg = d3.select(refSvgTimeline.current);
        const heightSvg = Number(svg.style('height').replace('px', ''));
        const margins = {top: 35, bottom: 20};
        const heightPlot = heightSvg - margins.top - margins.bottom;
        
        const scaleYMonth = d3.scaleBand()
                            .domain(d3.range(1, 13))
                            .range([0, heightPlot])
                            .paddingInner(1);
        const yAxisMonth = d3.select('#y-axis-month');
        const handleMonth = yAxisMonth.selectAll('.handle')
                                    .data([1])
                                    .join('circle')
                                    .attr('class', 'handle')
                                    .attr('cx', 0)
                                    .attr('cy', scaleYMonth(1))
                                    .attr('r', 0)
                                    .attr('fill', 'yellow')
                                    .attr('stroke', 'black')
                                    .attr('stroke-width', 1);
        yAxisMonth.selectAll('.tick')
                .on("mouseover", (e, d) => {
                    handleMonth.transition()
                            .duration(500)
                            .attr('cy', scaleYMonth(d))
                            .attr('r', 5);
                })
                .on("mouseout", () => {
                    handleMonth.transition()
                            .duration(500)
                            .attr('r', 0);
                })
                .on('click', (e, d) => {
                    yAxisMonth.select('.marker')
                            .transition()
                            .duration(500)
                            .attr('cy', scaleYMonth(d));
                    handleMonth.transition()
                            .duration(500)
                            .attr('r', 0);
                    playUntil(d, time.year);
                });
        
        const scaleYYear = d3.scaleBand()
            .domain(d3.range(GlobalConfig.time_range[0].year, GlobalConfig.time_range[1].year+1))
            .range([0, heightPlot])
            .paddingInner(1);
        
        const yAxisYear = d3.select('#y-axis-year');
        const handleYear = yAxisYear.selectAll('.handle')
                                    .data([1])
                                    .join('circle')
                                    .attr('class', 'handle')
                                    .attr('cx', 0)
                                    .attr('cy', scaleYYear(0))
                                    .attr('r', 0)
                                    .attr('fill', 'yellow')
                                    .attr('stroke', 'black')
                                    .attr('stroke-width', 1);
        yAxisYear.selectAll('.tick')
                .on("mouseover", (e, d) => {
                    handleYear.transition()
                            .duration(500)
                            .attr('cy', scaleYYear(d))
                            .attr('r', 5);
                })
                .on("mouseout", () => {
                    handleYear.transition()
                            .duration(500)
                            .attr('r', 0);
                })
                .on('click', (e, d) => {
                    yAxisYear.select('.marker')
                            .transition()
                            .duration(500)
                            .attr('cy', scaleYYear(d));
                    handleYear.transition()
                            .duration(500)
                            .attr('r', 0);
                    playUntil(time.month, d);
                });

    }, []);

    return (
        <div className='p-10'>
            <div className='grid justify-center'>
                <div className='flex'>
                    <svg className='
                        bg-slate-100 w-24 border-4
                        rounded-xl h-1/1 mr-5
                    ' ref={refSvgTimeline}></svg>
                    <svg className='
                        bg-slate-100 min-w-96 
                        rounded-xl min-h-96 rounded-xl 
                        border-4
                    ' ref={refSvgLand}></svg>
                </div>
                <div className='px-0 py-3 flex justify-center gap-x-5'>
                    {/* <div className='flex gap-x-2'> */}
                        <Button 
                            onClick={() => {setIsPaused(prevVal => !prevVal)}} 
                            colorBg={isPaused ? "#8888ff" : "#ff8888"}
                            colorFg="white"
                        >
                            {isPaused ? "PLAY" : "PAUSE"}
                        </Button>
                        <Button 
                            onClick={resetWorld} 
                            colorBg={"grey"}
                            colorFg="white"
                        > RESET </Button>
                        <Button 
                            colorBg={"green"}
                            colorFg="white"
                        ><Link href="/planner">PLAN</Link></Button>
                    {/* </div> */}
                    <div className='flex items-center'>
                        Time Step: &nbsp;<b>{stateTimeStep}</b>
                    </div>
                </div>
            </div>
            {/* <div className='w-full'>
                <span>Time Step = {stateTimeStep}    |    </span>
                <span>Time = Month {stateTime.month} , Year {stateTime.year}    |    </span>
                <span>CO2 = {stateCo2} Kg    |    </span>
                <span>Temperature = {stateTemperature} °C    |    </span>
                <span>Funds = {stateFunds} Bc    |    </span>
                <span>Timber Demand = {stateTimberDemand} Kg    |    </span>
                <span>Biodiversity Score = {stateBiodiversity}    |    </span>
                <span># Trees = {stateTreeCount}    |    </span>
            </div> */}
        </div>
    )
}

export default World