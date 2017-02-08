"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ants_1 = require("./ants");
var Place = (function () {
    function Place(name, water, exit, entrance) {
        if (water === void 0) { water = false; }
        this.name = name;
        this.water = water;
        this.exit = exit;
        this.entrance = entrance;
        this.bees = [];
    }
    Place.prototype.getExit = function () { return this.exit; };
    Place.prototype.setEntrance = function (place) { this.entrance = place; };
    Place.prototype.isWater = function () { return this.water; };
    Place.prototype.getAnt = function () {
        if (this.ant !== undefined && this.ant.getGuard() != undefined)
            return this.ant.getGuard();
        else
            return this.ant;
    };
    Place.prototype.getBees = function () { return this.bees; };
    Place.prototype.getClosestBee = function (maxDistance, minDistance) {
        if (minDistance === void 0) { minDistance = 0; }
        var p = this;
        for (var dist = 0; p !== undefined && dist <= maxDistance; dist++) {
            if (dist >= minDistance && p.bees.length > 0) {
                return p.bees[0];
            }
            p = p.entrance;
        }
        return undefined;
    };
    Place.prototype.addAnt = function (ant) {
        if (this.ant === undefined) {
            this.ant = ant;
            this.ant.setPlace(this);
            return true;
        }
        else if (ant instanceof ants_1.GuardAnt && !(this.ant instanceof ants_1.GuardAnt) && this.ant.getGuard() === undefined) {
            ant.setGuarded(this.ant);
            this.ant.setGuard(ant);
            return true;
        }
        return false;
    };
    Place.prototype.removeAnt = function () {
        if (this.ant !== undefined) {
            var toBeRemoved = void 0;
            if (this.ant.getGuard() !== undefined) {
                toBeRemoved = this.ant.getGuard();
                this.ant.setGuard(undefined);
            }
            else {
                toBeRemoved = this.ant;
                this.ant = undefined;
            }
            return toBeRemoved;
        }
        return undefined;
    };
    Place.prototype.addBee = function (bee) {
        this.bees.push(bee);
        bee.setPlace(this);
    };
    Place.prototype.removeBee = function (bee) {
        var index = this.bees.indexOf(bee);
        if (index >= 0) {
            this.bees.splice(index, 1);
            bee.setPlace(undefined);
        }
    };
    Place.prototype.removeAllBees = function () {
        this.bees.forEach(function (bee) { return bee.setPlace(undefined); });
        this.bees = [];
    };
    Place.prototype.exitBee = function (bee) {
        this.removeBee(bee);
        this.exit.addBee(bee);
    };
    Place.prototype.removeInsect = function (insect) {
        if (insect instanceof ants_1.Ant) {
            this.removeAnt();
        }
        else if (insect instanceof ants_1.Bee) {
            this.removeBee(insect);
        }
    };
    Place.prototype.act = function () {
        if (this.water) {
            if (!(this.ant instanceof ants_1.ScubaAnt)) {
                this.removeAnt();
            }
        }
    };
    return Place;
}());
exports.Place = Place;
var Hive = (function (_super) {
    __extends(Hive, _super);
    function Hive(beeArmor, beeDamage) {
        var _this = _super.call(this, 'Hive') || this;
        _this.beeArmor = beeArmor;
        _this.beeDamage = beeDamage;
        _this.waves = {};
        return _this;
    }
    Hive.prototype.addWave = function (attackTurn, numBees) {
        var wave = [];
        for (var i = 0; i < numBees; i++) {
            var bee = new ants_1.Bee(this.beeArmor, this.beeDamage, this);
            this.addBee(bee);
            wave.push(bee);
        }
        this.waves[attackTurn] = wave;
        return this;
    };
    Hive.prototype.invade = function (colony, currentTurn) {
        var _this = this;
        if (this.waves[currentTurn] !== undefined) {
            this.waves[currentTurn].forEach(function (bee) {
                _this.removeBee(bee);
                var entrances = colony.getEntrances();
                var randEntrance = Math.floor(Math.random() * entrances.length);
                entrances[randEntrance].addBee(bee);
            });
            return this.waves[currentTurn];
        }
        else {
            return [];
        }
    };
    return Hive;
}(Place));
exports.Hive = Hive;
var AntColony = (function () {
    function AntColony(startingFood, numTunnels, tunnelLength, moatFrequency) {
        if (moatFrequency === void 0) { moatFrequency = 0; }
        this.places = [];
        this.beeEntrances = [];
        this.queenPlace = new Place('Ant Queen');
        this.boosts = { 'FlyingLeaf': 1, 'StickyLeaf': 1, 'IcyLeaf': 1, 'BugSpray': 0 };
        this.food = startingFood;
        var prev;
        for (var tunnel = 0; tunnel < numTunnels; tunnel++) {
            var curr = this.queenPlace;
            this.places[tunnel] = [];
            for (var step = 0; step < tunnelLength; step++) {
                var typeName = 'tunnel';
                if (moatFrequency !== 0 && (step + 1) % moatFrequency === 0) {
                    typeName = 'water';
                }
                prev = curr;
                var locationId = tunnel + ',' + step;
                curr = new Place(typeName + '[' + locationId + ']', typeName == 'water', prev);
                prev.setEntrance(curr);
                this.places[tunnel][step] = curr;
            }
            this.beeEntrances.push(curr);
        }
    }
    AntColony.prototype.getFood = function () { return this.food; };
    AntColony.prototype.increaseFood = function (amount) { this.food += amount; };
    AntColony.prototype.getPlaces = function () { return this.places; };
    AntColony.prototype.getEntrances = function () { return this.beeEntrances; };
    AntColony.prototype.getQueenPlace = function () { return this.queenPlace; };
    AntColony.prototype.queenHasBees = function () { return this.queenPlace.getBees().length > 0; };
    AntColony.prototype.getBoosts = function () { return this.boosts; };
    AntColony.prototype.addBoost = function (boost) {
        if (this.boosts[boost] === undefined) {
            this.boosts[boost] = 0;
        }
        this.boosts[boost] = this.boosts[boost] + 1;
        console.log('Found a ' + boost + '!');
    };
    AntColony.prototype.deployAnt = function (ant, place) {
        if (this.food >= ant.getFoodCost()) {
            var success = place.addAnt(ant);
            if (success) {
                this.food -= ant.getFoodCost();
                return undefined;
            }
            return 'tunnel already occupied';
        }
        return 'not enough food';
    };
    AntColony.prototype.removeAnt = function (place) {
        place.removeAnt();
    };
    AntColony.prototype.applyBoost = function (boost, place) {
        if (this.boosts[boost] === undefined || this.boosts[boost] < 1) {
            return 'no such boost';
        }
        var ant = place.getAnt();
        if (!ant) {
            return 'no Ant at location';
        }
        ant.setBoost(boost);
        return undefined;
    };
    AntColony.prototype.antsAct = function () {
        var _this = this;
        this.getAllAnts().forEach(function (ant) {
            ant.act(_this);
        });
    };
    AntColony.prototype.beesAct = function () {
        this.getAllBees().forEach(function (bee) {
            bee.act();
        });
    };
    AntColony.prototype.placesAct = function () {
        for (var i = 0; i < this.places.length; i++) {
            for (var j = 0; j < this.places[i].length; j++) {
                this.places[i][j].act();
            }
        }
    };
    AntColony.prototype.getAllAnts = function () {
        var ants = [];
        for (var i = 0; i < this.places.length; i++) {
            for (var j = 0; j < this.places[i].length; j++) {
                if (this.places[i][j].getAnt() !== undefined) {
                    ants.push(this.places[i][j].getAnt());
                }
            }
        }
        return ants;
    };
    AntColony.prototype.getAllBees = function () {
        var bees = [];
        for (var i = 0; i < this.places.length; i++) {
            for (var j = 0; j < this.places[i].length; j++) {
                bees = bees.concat(this.places[i][j].getBees());
            }
        }
        return bees;
    };
    return AntColony;
}());
exports.AntColony = AntColony;
var AntGame = (function () {
    function AntGame(colony, hive) {
        this.colony = colony;
        this.hive = hive;
        this.turn = 0;
    }
    AntGame.prototype.takeTurn = function () {
        console.log('');
        this.colony.antsAct();
        this.colony.beesAct();
        this.colony.placesAct();
        this.hive.invade(this.colony, this.turn);
        this.turn++;
        console.log('');
    };
    AntGame.prototype.getTurn = function () { return this.turn; };
    AntGame.prototype.gameIsWon = function () {
        if (this.colony.queenHasBees()) {
            return false;
        }
        else if (this.colony.getAllBees().length + this.hive.getBees().length === 0) {
            return true;
        }
        return undefined;
    };
    AntGame.prototype.deployAnt = function (antType, placeCoordinates) {
        var ant;
        switch (antType.toLowerCase()) {
            case "grower":
                ant = new ants_1.GrowerAnt();
                break;
            case "thrower":
                ant = new ants_1.ThrowerAnt();
                break;
            case "eater":
                ant = new ants_1.EaterAnt();
                break;
            case "scuba":
                ant = new ants_1.ScubaAnt();
                break;
            case "guard":
                ant = new ants_1.GuardAnt();
                break;
            default:
                return 'unknown ant type';
        }
        try {
            var coords = placeCoordinates.split(',');
            var place = this.colony.getPlaces()[coords[0]][coords[1]];
            return this.colony.deployAnt(ant, place);
        }
        catch (e) {
            return 'illegal location';
        }
    };
    AntGame.prototype.removeAnt = function (placeCoordinates) {
        try {
            var coords = placeCoordinates.split(',');
            var place = this.colony.getPlaces()[coords[0]][coords[1]];
            place.removeAnt();
            return undefined;
        }
        catch (e) {
            return 'illegal location';
        }
    };
    AntGame.prototype.boostAnt = function (boostType, placeCoordinates) {
        try {
            var coords = placeCoordinates.split(',');
            var place = this.colony.getPlaces()[coords[0]][coords[1]];
            return this.colony.applyBoost(boostType, place);
        }
        catch (e) {
            return 'illegal location';
        }
    };
    AntGame.prototype.getPlaces = function () { return this.colony.getPlaces(); };
    AntGame.prototype.getFood = function () { return this.colony.getFood(); };
    AntGame.prototype.getHiveBeesCount = function () { return this.hive.getBees().length; };
    AntGame.prototype.getBoostNames = function () {
        var boosts = this.colony.getBoosts();
        return Object.keys(boosts).filter(function (boost) {
            return boosts[boost] > 0;
        });
    };
    return AntGame;
}());
exports.AntGame = AntGame;
//# sourceMappingURL=game.js.map