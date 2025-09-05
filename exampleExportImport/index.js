
import {hello, world} from "./featureOne.js";
import * as words from "./featureOne.js"
import {default as printHelloWorld } from "./featureTwo.js"

console.log(words.Hello);
console.log(words["World"]);

console.log("Hello", "World");

printHelloWorld(words.hello, words["world"]):