# Task Flow - Release 2.0
#### Summer 2024 CSE 115-A
Korben Tompkin, Sachin Jain, Minh Do, Shipra Ithal, Madison Li, Laszlo Koroleff

## Additional Source Code
[Main Go/Chi Backend Code](https://github.com/korbexmachina/task-flow-server)\
[Backup/Testing Backend Code](https://github.com/zekarias27/task-flow-server-nodejs)

## Documents (full folder: [here](https://drive.google.com/drive/folders/1d3n1gyTxRv1B58hBsfXfDBpAUdk2ZbhS?usp=drive_link))
[Scrum Documents](https://drive.google.com/drive/folders/1XPODf94ANTb_Kkju7yMyzJTQ_IyLymaq?usp=drive_link)\
[Release Documents](https://drive.google.com/drive/folders/121ddhoZ8c840qtcJSuagMtLhivDioJxU?usp=drive_link)
- [Test Plan and Report](https://docs.google.com/document/d/1EH2u7bVe3osdAPpUPf6Qm0uaAlt53J6_s3UEIfb8SW8/edit?usp=sharing)
- [Release Summary](https://docs.google.com/document/d/1a42OtNLddGnLeRB-J6sqF6bqf6Z_wbNHr-xVGPYBWvY/edit?usp=sharing)

## Scrum Board
[Hosted on Github Projects](https://github.com/users/korbexmachina/projects/3/views/1)

## Scrum Burndown Charts
Can be found [here](https://drive.google.com/drive/folders/1zKueH6XxkbuCHB_XQwJzLkud6YCO6AmV?usp=drive_link)

# Installation Instructions

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
