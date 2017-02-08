import { Insect, Bee, Ant, GrowerAnt, ThrowerAnt, EaterAnt, ScubaAnt, GuardAnt } from './ants';

/**
 * a general Place class that stores and manages information about a particular place on the game board
 */
class Place {
  protected ant: Ant;
  protected bees: Bee[] = [];

  /**
   * construct a place with the following parameter
   * @param name   The name of the place in string
   * @param water  A boolean determining if the current place has water
   */
  constructor(readonly name: string,
    protected readonly water = false,
    private exit?: Place,
    private entrance?: Place) { }

  getExit(): Place { return this.exit; }

  setEntrance(place: Place) { this.entrance = place; }

  isWater(): boolean { return this.water; }

  /**
   * @returns the ant that's currently at this place
   */
  getAnt(): Ant {
      if (this.ant !== undefined && this.ant.getGuard() != undefined)
        return this.ant.getGuard();
      else
        return this.ant;
  }

  getBees(): Bee[] { return this.bees; }

  /**
   * @param maxDistance  max distance (in number) 
   * @param minDistance  min distance (in number)
   * @returns  return the closest bee within the given rage 
   */
  getClosestBee(maxDistance: number, minDistance: number = 0): Bee {
    let p: Place = this;
    for (let dist = 0; p !== undefined && dist <= maxDistance; dist++) {
      if (dist >= minDistance && p.bees.length > 0) {
        return p.bees[0];
      }
      p = p.entrance; // trace back to the previous spot
    }
    return undefined;
  }

  /**
    * Add an ant into the current place 
    * @param ant  An ant object that will be added
    * @returns true if the ant has been successfully added, otherwise false
    */
  addAnt(ant: Ant): boolean {
    // if (ant instanceof GuardAnt) { // if the current ant is a Guard ant
      if (this.ant === undefined) { // if the place is currently empty
        this.ant = ant;
        this.ant.setPlace(this);
        return true;
      } else if (ant instanceof GuardAnt && !(this.ant instanceof GuardAnt) && this.ant.getGuard() === undefined) {
        ant.setGuarded(this.ant);
        this.ant.setGuard(ant);
        return true; 
      }
      return false;
  }

  /**
    * remove an ant from the current place 
    * @returns the ant that has been removed
    */
  removeAnt(): Ant {
    if (this.ant !== undefined) {
      let toBeRemoved;
      if (this.ant.getGuard() !== undefined) {
        toBeRemoved = this.ant.getGuard();
        this.ant.setGuard(undefined);
      } else {
        toBeRemoved = this.ant;
        this.ant = undefined;
      }
      return toBeRemoved;
    }
    return undefined;
  }

  /**
    * add a bee into the current place 
    * @param bee  A bee object that will be added
    */
  addBee(bee: Bee): void {
    this.bees.push(bee);
    bee.setPlace(this);
  }

  /**
    * remove a bee from the array of bees at the current place if any
    * @param bee  A bee object that will be removed
    */
  removeBee(bee: Bee): void {
    var index = this.bees.indexOf(bee);
    if (index >= 0) {
      this.bees.splice(index, 1);
      bee.setPlace(undefined);
    }
  }

  /**
    * remove all bees from the array of bees at the current place
    */
  removeAllBees(): void {
    this.bees.forEach((bee) => bee.setPlace(undefined));
    this.bees = [];
  }

  /**
    * let a bee exit the current place and move forward
    * @param bee  A bee object that will exit the current place
    */
  exitBee(bee: Bee): void {
    this.removeBee(bee);
    this.exit.addBee(bee);
  }

  /**
    * Remove any insect at this place
    */
  removeInsect(insect: Insect) {
    if (insect instanceof Ant) {
      this.removeAnt();
    }
    else if (insect instanceof Bee) {
      this.removeBee(insect);
    }
  }

  /**
    * if the current place has water, remove anything that's not a Scuba ant
    */
  act() {
    if (this.water) {
      if (!(this.ant instanceof ScubaAnt)) {
        this.removeAnt();
      }
    }
  }
}

/**
  * A bee hive (base) that stores and manages all info about the bee side of the game
  */
class Hive extends Place {
  private waves: { [index: number]: Bee[] } = {}

  /**
   * construct a new hive with the following parameters
   * @param beeArmor A number specifies each bee's armor
   * @param beeDamage  A number specifies the damage each bee will cause to others
   */
  constructor(private beeArmor: number, private beeDamage: number) {
    super('Hive');
  }

  /**
   * add a new wave of bees into the hive
   * @param attackTurn  Which wave is this attack
   * @param numBees  Number of bees in this wave of attack
   * @returns the new Hive after adding the new wave
   */
  addWave(attackTurn: number, numBees: number): Hive {
    let wave: Bee[] = [];
    for (let i = 0; i < numBees; i++) {
      let bee = new Bee(this.beeArmor, this.beeDamage, this);
      this.addBee(bee);
      wave.push(bee);
    }
    this.waves[attackTurn] = wave;
    return this;
  }

  /**
   * @param colony  The Ant Colony object
   * @param currentTurn  A number that specifies which turn of waves is gonna commit the invasion
   * @returns the wave of bees that's gonna invade
   */
  invade(colony: AntColony, currentTurn: number): Bee[] {
    if (this.waves[currentTurn] !== undefined) {
      this.waves[currentTurn].forEach((bee) => {
        this.removeBee(bee);
        let entrances: Place[] = colony.getEntrances();
        // bee randomly enters one of the tunnel
        let randEntrance: number = Math.floor(Math.random() * entrances.length);
        entrances[randEntrance].addBee(bee);
      });
      return this.waves[currentTurn];
    }
    else {
      return [];
    }
  }
}

/**
  * An ant colony (base) that stores and manages all info about the ant side of the game
  */
class AntColony {
  private food: number;
  private places: Place[][] = [];
  private beeEntrances: Place[] = [];
  private queenPlace: Place = new Place('Ant Queen');
  private boosts: { [index: string]: number } = { 'FlyingLeaf': 1, 'StickyLeaf': 1, 'IcyLeaf': 1, 'BugSpray': 0 }

  /**
   * constructs the colony with the following given parameters
   * @param startingFood  The number of food at start
   * @param numTunnels   Number of tunnels on the game board
   * @param tunnelLength  How long is each tunnel (how many spots)
   * @param moatFrequency  How frequent is an occurrence of a moat
   */
  constructor(startingFood: number, numTunnels: number, tunnelLength: number, moatFrequency = 0) {
    this.food = startingFood;

    let prev: Place;
    // for each tunnel, initialize all the spots
    for (let tunnel = 0; tunnel < numTunnels; tunnel++) {
      let curr: Place = this.queenPlace;
      this.places[tunnel] = [];
      // initialize each spot
      for (let step = 0; step < tunnelLength; step++) {
        let typeName = 'tunnel';
        if (moatFrequency !== 0 && (step + 1) % moatFrequency === 0) {
          typeName = 'water';
        }

        prev = curr; // stores the previous location
        // initialize the spot with coordinates
        let locationId: string = tunnel + ',' + step;
        curr = new Place(typeName + '[' + locationId + ']', typeName == 'water', prev);
        prev.setEntrance(curr);
        this.places[tunnel][step] = curr;
      }
      this.beeEntrances.push(curr);
    }
  }

  getFood(): number { return this.food; }

  increaseFood(amount: number): void { this.food += amount; }

  getPlaces(): Place[][] { return this.places; }

  getEntrances(): Place[] { return this.beeEntrances; }

  getQueenPlace(): Place { return this.queenPlace; }

  /**
   * bee successfully reaches to the queen
   */
  queenHasBees(): boolean { return this.queenPlace.getBees().length > 0; }

  getBoosts(): { [index: string]: number } { return this.boosts; }

  /**
    * add a new boost into the colony
    * @param boost a string representing what type of boost will be added
    * */
  addBoost(boost: string) {
    if (this.boosts[boost] === undefined) {
      this.boosts[boost] = 0;
    }
    this.boosts[boost] = this.boosts[boost] + 1;
    console.log('Found a ' + boost + '!');
  }

  /**
   * deloy a new ant at the given place
   * @param ant  The Ant object that will be deployed
   * @param place The place where the ant will be deployed 
   * @returns error message showing why you cannot deploy successfully
   */
  deployAnt(ant: Ant, place: Place): string {
    if (this.food >= ant.getFoodCost()) {
      let success = place.addAnt(ant);
      if (success) {
        this.food -= ant.getFoodCost();
        return undefined;
      }
      return 'tunnel already occupied';
    }
    return 'not enough food';
  }

  removeAnt(place: Place) {
    place.removeAnt();
  }

  /**
   * apply a specific boost to an ant
   * @param boost  A string representing what type of boost is gonna be applied
   * @param place The place where the boost will be applied
   * @returns error message showing why you cannot apply successfully
   */
  applyBoost(boost: string, place: Place): string {
    if (this.boosts[boost] === undefined || this.boosts[boost] < 1) {
      return 'no such boost';
    }
    let ant: Ant = place.getAnt();
    if (!ant) {
      return 'no Ant at location'
    }
    ant.setBoost(boost);
    return undefined;
  }

  /**
   * lifecyle call for each Ant object: act according to its specified behavior
   */
  antsAct() {
    this.getAllAnts().forEach((ant) => {
      ant.act(this);
    });
  }

  /**
   * lifecyle call for each Bee object: act according to its specified behavior
   */
  beesAct() {
    this.getAllBees().forEach((bee) => {
      bee.act();
    });
  }

  /**
   * lifecyle call for each Place object: act according to its specified behavior
   */
  placesAct() {
    for (let i = 0; i < this.places.length; i++) {
      for (let j = 0; j < this.places[i].length; j++) {
        this.places[i][j].act();
      }
    }
  }

  /**
   * @returns all the ants on the game board
   */
  getAllAnts(): Ant[] {
    let ants = [];
    for (let i = 0; i < this.places.length; i++) {
      for (let j = 0; j < this.places[i].length; j++) {
        if (this.places[i][j].getAnt() !== undefined) {
          ants.push(this.places[i][j].getAnt());
        }
      }
    }
    return ants;
  }

  /**
   * @returns all the bees on the game board
   */
  getAllBees(): Bee[] {
    var bees = [];
    for (var i = 0; i < this.places.length; i++) {
      for (var j = 0; j < this.places[i].length; j++) {
        bees = bees.concat(this.places[i][j].getBees());
      }
    }
    return bees;
  }
}

/**
 * The fundamental Ant Game class that manages the game playing at a very high level
 */
class AntGame {
  private turn: number = 0;

  /**
   * construct the game with:
   * @param colony  An Ant Colony object 
   * @param hive  An Bee Hive object
   */
  constructor(private colony: AntColony, private hive: Hive) { }

  /**
   * lifecyle call for each turn of the game: 
   * all the objects act once according to their specified behaviors
   */
  takeTurn() {
    console.log('');
    this.colony.antsAct();
    this.colony.beesAct();
    this.colony.placesAct();
    this.hive.invade(this.colony, this.turn);
    this.turn++;
    console.log('');
  }

  getTurn() { return this.turn; }

  /**
   * @returns True if the user wins the game, false otherwise, or nothing if no result yet
   */
  gameIsWon(): boolean | undefined {
    if (this.colony.queenHasBees()) {
      return false;
    }
    else if (this.colony.getAllBees().length + this.hive.getBees().length === 0) {
      return true;
    }
    return undefined;
  }

  /**
   * deploy an ant with the following parameters
   * @param antType  A string representing which type of Ant is gonna be deployed
   * @param placeCoordinates  A string representing the spot where the ant is gonna be deployed
   * @returns error message if any
   */
  deployAnt(antType: string, placeCoordinates: string): string {
    let ant;
    // determine and initialize a specifc type of Ant
    switch (antType.toLowerCase()) {
      case "grower":
        ant = new GrowerAnt(); break;
      case "thrower":
        ant = new ThrowerAnt(); break;
      case "eater":
        ant = new EaterAnt(); break;
      case "scuba":
        ant = new ScubaAnt(); break;
      case "guard":
        ant = new GuardAnt(); break;
      default:
        return 'unknown ant type';
    }

    try {
      let coords = placeCoordinates.split(',');
      let place: Place = this.colony.getPlaces()[coords[0]][coords[1]];
      return this.colony.deployAnt(ant, place);
    } catch (e) {
      return 'illegal location';
    }
  }

  /**
   * remove an ant from the game board with the following parameters
   * @param placeCoordinates  A string representing the spot where the ant is gonna be removed
   * @returns error message if any
   */
  removeAnt(placeCoordinates: string): string {
    try {
      let coords = placeCoordinates.split(',');
      let place: Place = this.colony.getPlaces()[coords[0]][coords[1]];
      place.removeAnt();
      return undefined;
    } catch (e) {
      return 'illegal location';
    }
  }

  /**
   * boost an ant with the following parameters
   * @param boostType  A string representing what type of boost that's gonna be applied
   * @param placeCoordinates  A string representing the spot where the boost is gonna be applied to
   * @returns error message if any
   */
  boostAnt(boostType: string, placeCoordinates: string): string {
    try {
      let coords = placeCoordinates.split(',');
      let place: Place = this.colony.getPlaces()[coords[0]][coords[1]];
      return this.colony.applyBoost(boostType, place);
    } catch (e) {
      return 'illegal location';
    }
  }

  getPlaces(): Place[][] { return this.colony.getPlaces(); }
  getFood(): number { return this.colony.getFood(); }
  getHiveBeesCount(): number { return this.hive.getBees().length; }
  getBoostNames(): string[] {
    let boosts = this.colony.getBoosts();
    return Object.keys(boosts).filter((boost: string) => {
      return boosts[boost] > 0;
    });
  }
}

export { AntGame, Place, Hive, AntColony }