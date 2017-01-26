import {AntGame, AntColony, Place, Hive} from './game';
import {Ant, EaterAnt, GuardAnt} from './ants';

import vorpal = require('vorpal'); // external lib for command-line interaction
import chalk = require('chalk');  // external lib for adding styling to plain string
import _ = require('lodash');

/**
 * The Vorpal library for command-line interaction
 */
const Vorpal = vorpal();

/**
 * print out the current game map
 * @param game   Current game that is playing
 */
export function showMapOf(game:AntGame){
  console.log(getMap(game));
}

/**
 * construct the current game map
 * @param game  Current game that is playing
 */
function getMap(game:AntGame) {
  let places:Place[][] = game.getPlaces();
  let tunnelLength = places[0].length;
  let beeIcon = chalk.bgYellow.black('B');
   
  let map = '';
  // add basic game info on the top of the map
  map += chalk.bold('The Colony is under attack!\n');
  map += `Turn: ${game.getTurn()}, Food: ${game.getFood()}, Boosts available: [${game.getBoostNames()}]\n`;
  map += '     '+_.range(0,tunnelLength).join('    ')+'      Hive'+'\n';

  // construct each tunnel on the map 
  for(let i=0; i<places.length; i++){
    map += '    '+Array(tunnelLength+1).join('=====');
    
    // when construct the first tunnul, also include info about the bee hive (bee counts) on the map
    if(i===0){
      map += '    ';
      let hiveBeeCount = game.getHiveBeesCount();
      if(hiveBeeCount > 0){
        map += beeIcon;
        map += (hiveBeeCount > 1 ? hiveBeeCount : ' ');
      }
    }
    map += '\n';

    // tunnel number 
    map += i+')  ';

    // for each tunnel, construct every single place (the sopt that holds an insect)
    for(let j=0; j<places[i].length; j++){ 
      let place:Place = places[i][j];

      map += iconFor(place.getAnt());
      map += ' '; 

      if(place.getBees().length > 0){
        map += beeIcon;
        map += (place.getBees().length > 1 ? place.getBees().length : ' ');
      } else {
        map += '  ';
      }
      map += ' '; 
    }
    map += '\n    ';
    for(let j=0; j<places[i].length; j++){
      let place = places[i][j];
      if(place.isWater()){
        map += chalk.bgCyan('~~~~')+' ';
      } else {
        map += '==== ';
      }
    }
    map += '\n';
  }
  map += '     '+_.range(0,tunnelLength).join('    ')+'\n';

  return map;
}

/**
 * draw icon for a specific type of ant
 * @param The ant
 * @returns the icon for that type of ant, if type doesn't match any, return "?"
 */
function iconFor(ant:Ant){
  if(ant === undefined){ return ' ' };
  let icon:string;
  switch(ant.name){
    case "Grower":
      icon = chalk.green('G'); break;
    case "Thrower":
      icon = chalk.red('T'); break;
    case "Eater":
      // mark the Eater ant if it's currently full
      if((<EaterAnt>ant).isFull())
        icon = chalk.yellow.bgMagenta('E');
      else
        icon = chalk.magenta('E');
      break;
    case "Scuba":
      icon = chalk.cyan('S'); break;
    case "Guard":
      let guarded:Ant = (<GuardAnt>ant).getGuarded();
      if(guarded){
        icon = chalk.underline(iconFor(guarded)); break;
      } else {
        icon = chalk.underline('x'); break;
      }
    default:
      icon = '?';
  }
  return icon;
}

/**
 * play the game: enable the command-line based user interaction with this game
 * @param game  Current game that is playing
 */
export function play(game:AntGame) {
  // the very first time print out the user interface of the game (the game board)
  Vorpal
    .delimiter(chalk.green('AvB $'))
    .log(getMap(game))
    .show();

  // if the user typed "show", print out the current game board
  Vorpal
    .command('show', 'Shows the current game board.')
    .action(function(args, callback){
      Vorpal.log(getMap(game));
      callback();
    });

  // allow the user to deploy an ant following the 'deploy <antType> <tunnel>' format
  Vorpal
    .command('deploy <antType> <tunnel>', 'Deploys an ant to tunnel (as "row,col" eg. "0,6").')
    .alias('add', 'd')  // potential alternative user inputs
    .autocomplete(['Grower','Thrower','Eater','Scuba','Guard']) // words for autocompletion
    .action(function(args, callback) {
      let error = game.deployAnt(args.antType, args.tunnel)
      if(error){
        Vorpal.log(`Invalid deployment: ${error}.`);
      }
      else {
        Vorpal.log(getMap(game));
      }
      callback();
    });

  // allow the user to remove an ant following the 'remove <tunnel>' format
  Vorpal
    .command('remove <tunnel>', 'Removes the ant from the tunnel (as "row,col" eg. "0,6").')
    .alias('rm') // potential alternative user inputs
    .action(function(args, callback){
      let error = game.removeAnt(args.tunnel);
      if(error){
        Vorpal.log(`Invalid removal: ${error}.`);
      }
      else {
        Vorpal.log(getMap(game));
      }
      callback();
    });

  // allow the user to apply a boost to an ant following the boost '<boost> <tunnel>'
  Vorpal
    .command('boost <boost> <tunnel>', 'Applies a boost to the ant in a tunnel (as "row,col" eg. "0,6")')
    .alias('b')
    .autocomplete({data:() => game.getBoostNames()})
    .action(function(args, callback){
      let error = game.boostAnt(args.boost, args.tunnel);
      if(error){
        Vorpal.log(`Invalid boost: ${error}`);
      }
      callback();
    })

  // allow the user to go to the next turn and print out the new game board
  Vorpal
    .command('turn', 'Ends the current turn. Ants and bees will act.')
    .alias('end turn', 'take turn','t')
    .action(function(args, callback){
      game.takeTurn();
      Vorpal.log(getMap(game));
      let won:boolean = game.gameIsWon();
      // end the game with win or lose message
      if(won === true){
        Vorpal.log(chalk.green('Yaaaay---\nAll bees are vanquished. You win!\n'));
      }
      else if(won === false){
        Vorpal.log(chalk.yellow('Bzzzzz---\nThe ant queen has perished! Please try again.\n'));
      }
      else {
        callback();
      }
    });
}
