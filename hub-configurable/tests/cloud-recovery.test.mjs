import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const text=readFileSync(new URL('../assets/api.js',import.meta.url),'utf8');
const start=text.indexOf('export function recoveryCode('),end=text.indexOf('export function parseLink(');
assert.ok(start>=0&&end>start,'Recovery helpers must exist');
const helpers=text.slice(start,end).replaceAll('export ','');
const make=new Function('btoa','atob',helpers+';return {recoveryCode,parseRecoveryCode}');
// Native Buffer is for tests only, never used by browser implementation.
const funcs=make(s=>Buffer.from(s,'binary').toString('base64'),s=>Buffer.from(s,'base64').toString('binary'));
test('recovers the same workspace without an URL',()=>{
 const id='8cf50783-5d82-4d27-8894-aa508316a321';
 const token='d9'.repeat(32);
 const code=funcs.recoveryCode({id,token,role:'mj'});
 assert.ok(code.startsWith('G2-'));
 assert.equal(code.length,67);
 assert.deepEqual(funcs.parseRecoveryCode(code),{id,token});
});
test('denies a player recovery code and invalid input',()=>{
 assert.throws(()=>funcs.recoveryCode({id:'8cf50783-5d82-4d27-8894-aa508316a321',token:'d9'.repeat(32),role:'pj'}));
 assert.throws(()=>funcs.parseRecoveryCode('test'));
});
