import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldPlayWedding,weddingBeat,WEDDING_DURATION} from '../dist/src/wedding.js';
test('wedding belongs only to a winning final Story match',()=>{
 for(const mode of ['story','arcade','quick','versus','online','training'])for(let stage=0;stage<8;stage++)for(const winner of [0,1,null])assert.equal(shouldPlayWedding(mode,stage,winner),mode==='story'&&stage===7&&winner===0);
});
test('twenty-second ending includes both distinct kisses before the final message',()=>{
 assert.equal(WEDDING_DURATION,20);
 assert.deepEqual([0,3,6,9,12,16,19.9].map(weddingBeat),['arrival','rings','forehead','lips','celebration','card','card']);
});
