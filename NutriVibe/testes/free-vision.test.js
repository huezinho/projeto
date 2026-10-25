import test from 'node:test';import assert from 'node:assert/strict';import {selectFood}from '../javascript/aplicativo/vision-labels.js';
test('classificação local aceita apenas classe conhecida com margem suficiente',()=>{
 assert.deepEqual(selectFood([{className:'banana',probability:.9},{className:'orange',probability:.07}]),[{foodId:'0',confidence:.9}]);
 assert.deepEqual(selectFood([{className:'pizza',probability:.99}]),[]);
 assert.deepEqual(selectFood([{className:'banana',probability:.54}]),[]);
 assert.deepEqual(selectFood([{className:'banana',probability:.6},{className:'orange',probability:.5}]),[]);
 assert.deepEqual(selectFood([{className:'sea cucumber, holothurian',probability:.99}]),[]);
});
