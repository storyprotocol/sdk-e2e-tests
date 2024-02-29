import testFlow1 from './flows/flow1';
import testFlow2 from './flows/flow2';
import testFlow3 from './flows/flow3';
import testFlow4 from './flows/flow4';
import testFlow5 from './flows/flow5';
import testFlow6 from './flows/flow6';

type flowsTestMapType = {
  [key: string]: Function
}
const flowsTestMap: flowsTestMapType = {
  flow1: testFlow1,
  flow2: testFlow2,
  flow3: testFlow3,
  flow4: testFlow4,
  flow5: testFlow5,
  flow6: testFlow6,
}
process.env.TEST_FLOWS?.split(',').forEach(async (flow: keyof flowsTestMapType) => {
  if(flowsTestMap[flow]) {
    try {
      console.log(`testing ${flow}...`);
      await flowsTestMap[flow]();
      console.log(`${flow} succeeded`);
    } catch (err) {
      console.log(`${flow} failed with error: ${(err as Error).message}`);
      throw new Error(`${flow} failed with error: ${(err as Error).message}`);
    }
  }
})