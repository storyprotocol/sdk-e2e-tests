# SDK-E2E-Tests

This project dedicates to perform e2e test for the story protocol typescript sdk.

## Prerequisites to run the e2e test

- install nvm if don't have it by running:

  `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`.

- run `nvm use` to switch node version to v20.0.0
- if you don't have v20.0.0 node installed, please install it by running: `nvm install v20.0.0`

- run `npm i` to install dependencies.
- once all dependencies are installed, you should config your `.env` file with a reference to the `.env.example` file

## How to run the test

- Run specific test:

```
mocha -r ts-node/register -r mocha-steps ./test/**/**/*.test.ts --timeout 240000
```

- Run smoke test in Sepolia:

```
test:sepolia:smoke
```

- Run smoke test in Story Network:

```
test:story:smoke
```

- Run e2e test in Sepolia:

```
npm run test:sepolia:e2e
```

- Run e2e test in Story Network:

```
npm run test:story:e2e
```

- Run all tests in Sepolia:
```
npm run test:sepolia
```

- Run all tests in Story:
```
npm run test:story
```

- Open report, test report is under ./mochawesome-report folder
```
npm run open:report
```
