const values = new Map<string,{value:unknown;version:number}>();
export default {
 'storage.get':async({key}:{key:string})=>values.get(key)??{value:null,version:0},
 'storage.set':async({key,value,ifVersion}:{key:string;value:unknown;ifVersion?:number})=>{const old=values.get(key);if(ifVersion!==undefined&&ifVersion!==(old?.version??0))throw Object.assign(new Error('Conflict'),{code:'STORAGE_CONFLICT'});const version=(old?.version??0)+1;values.set(key,{value,version});return{ok:true,version};},
};
