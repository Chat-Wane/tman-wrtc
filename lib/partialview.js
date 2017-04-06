'use strict';

const EPV = require('./entries/epv.js');

const ExPeerNotFound = require('./exceptions/expeernotfound.js');

/**
 * Structure containing the neighborhood of a peer. Each neigbhor entry
 * comprises a list of ages and a descriptor. 
 * Map of {idPeer => {ages:[age_1, age_2.. age_k],descriptor: {x: exampleX} }} 
 * where age_1 <= age_2 <= .. <= age_k.
 */
class PartialView extends Map {
    constructor () {
        super();
    };
    
    /**
     * Get the oldest peer in the partial view.
     * @returns {string} The oldest peer in the structure.
     */
    getOldest () {
        if (this.size <= 0) { throw new ExPeerNotFound('getOldest'); };
        let oldestPeer = null;
        let oldestAge = 0;
        this.forEach( (epv, peerId) => {
            if (oldestAge <= epv.oldest()) {
                oldestPeer = peerId;
                oldestAge = epv.oldest();
            };
        });
        return oldestPeer;
    };


    /**
     * Increment the age of the whole partial view
     */
    increment () {
        this.forEach( (ages, peerId) => {
            this.set(peerId, ages.map( (age) => {return age+1;} ));
        });
    };

    /**
     * Add the peer to the partial view with an age of 0.
     * @param {string} peerId The identifier of the peer added to the partial
     * view.
     */
    addNeighbor (peerId) {
        (!this.has(peerId)) && this.set(peerId, new Array());        
        this.get(peerId).unshift(0); // add 0 in front of the array
    };

    /**
     * Remove the newest entry of the peer from the partial view.
     * @param {string} peerId The identifier of the peer to remove from the 
     * partial view. 
     */
    removeNeighbor (peerId) {
        if (!this.has(peerId)) { throw new ExPeerNotFound('removeNeighbor',
                                                               peerId); };
        this.get(peerId).shift();
        (this.get(peerId).length === 0) && this.delete(peerId);
    };

    /**
     * Remove all entries of the peer from the partial view.
     * @param {string} peerId The identifier of the peer to remove from the 
     * partial view.
     * @returns {number} The number of occurrences of peerId removed.
     */
    removeAllNeighbor (peerId) {
        if (!this.has(peerId)) { throw new ExPeerNotFound('removeNeighbor',
                                                               peerId); };
        const occ = this.get(peerId).length;
        this.delete(peerId);
        return occ;
    };
       

    /**
     * Get the least frequent peer. If multiple peers have the same number of
     * occurrences, it chooses one among them at random.
     * @returns {string} The identifier of a least frequent peer.
     */
    getLeastFrequent () {
        let leastFrequent = [];
        let frequency = Infinity;
        this.forEach( (ages, peerId) => {
            if (ages.length < frequency){
                leastFrequent = [];
                frequency = ages.length;
            };
            (ages.length === frequency) && leastFrequent.push(peerId);
        });
        return leastFrequent[Math.floor(Math.random() * leastFrequent.length)];
        
    };
    
}


module.exports = PartialView;
