// The same embedded rules and authored life run in the browser and in the hub.
import "./mila-life.js";
import "./mila-engine.js";
export function localReply(message:string,history:any[],catalog:any[],options:any={}){
 return (globalThis as any).BastideMilaDialogue.reply(message,history,catalog,options);
}
