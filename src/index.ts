import * as Ants from './ants';
import {AntColony, AntGame, Hive} from './game';
import {play, showMapOf} from './ui';


if(process.argv[2] === '--debug'){ 
  //the scenario to debug with
  var colony = new AntColony(16,1,8,0); //testing colony
  var hive = new Hive(3,1) //testing Hive
                .addWave(2,1)
                .addWave(3,1);
  var game = new AntGame(colony, hive);
  
  //run hard-coded commands
  game.deployAnt('Grower', '0,0'); //for example
  game.deployAnt('Thrower', '0,1');
  game.takeTurn(); //for example
  game.takeTurn();
  game.takeTurn();
  showMapOf(game); //show the board, for example (for debugging)

  //play(game); //launch the interactive version from here

}
else {
  //initialize the game to play (not interactively selected yet)
  var colony = new AntColony(2,3,8,3); //full colony
  var hive = new Hive(3,1) //testing Hive
                .addWave(2,1)
                .addWave(3,1);
  var game = new AntGame(colony, hive);

  //start playing the game
  play(game); 
}
