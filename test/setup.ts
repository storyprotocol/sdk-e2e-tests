import addContext = require("mochawesome/addContext");
import { captureConsoleLogs } from "../utils/utils";

let consoleLogs: string[] = [];

beforeEach(function () {
  consoleLogs = captureConsoleLogs(consoleLogs);
});

afterEach(function () {
  if (consoleLogs.length > 0) {
    addContext(this, {
      title: 'Test Result',
      value: consoleLogs[0],
    });
  }
});