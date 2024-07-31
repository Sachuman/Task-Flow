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
