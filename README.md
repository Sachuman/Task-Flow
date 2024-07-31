# Task Flow 
#### CSE 115-A


# Installation Instructions ( React-Native )

## Prerequisites

- Have NodeJS
- Have Expo-React-Native installed
- EAS-CLI installed
- Have Android Studios

  
  
**Clone the repository from github, from the package.json file look at all the dependencies and make sure to download them all before running.**

##  Build the platform on Android and run locally

- On the Android file Make sure at the root dir you have a local.properties file, if not add it and paste the command line **{sdk.dir = /Users/USERNAME/Library/Android/sdk }** where USERNAME is your username in c drive.

- You will need to setup the Expo-custom-dev-client to run this project to build all react-native-modules. First download `npm install -g eas-cli` , for expo account services.  You will need a login, create account at expo webpage.

  **eas -login ( make sure you have an account on expo)**

- Run the command `eas build --platform android` to build the platform on your emulator(android studios) using the expo cloud server or `npx expo run:android` requires Android Studio and Java to be installed and configured on your computer that will allow you to compile locally.

- Lastly run npx expo start on expo-custom-dev and press a to launch the app.

- Happy Coding!


# Installation Instructions ( GO - chi)

Server and database initialization for Task Flow project. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## MakeFile

run all make commands with clean tests
```bash
make all build
```

build the application
```bash
make build
```

run the application
```bash
make run
```

Create DB container
```bash
make docker-run
```

Shutdown DB container
```bash
make docker-down
```

live reload the application
```bash
make watch
```

run the test suite
```bash
make test
```

clean up binary from the last build
```bash
make clean
```

