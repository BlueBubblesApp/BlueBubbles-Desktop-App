# [BlueBubbles Desktop App](https://bluebubbles.app)

##### Windows and Linux Client for the [BlueBubbles Server](https://github.com/BlueBubblesApp/BlueBubbles-Server).
##### Android Client can be found [here](https://github.com/BlueBubblesApp/BlueBubbles-Android-App).


## Install
### From our prebuilt binaries
Download the latest release from [our releases](https://github.com/BlueBubblesApp/BlueBubbles-Desktop-App/releases).

### From Arch User Repository (AUR)
1.) Install using yay or your choice of AUR helper:
```bash
yay -S bluebubbles
```

### From Source
1.) Clone the repository with Git:

```bash
git clone https://github.com/BlueBubblesApp/BlueBubbles-Desktop-App.git
```

2.) Install the dependencies:

```bash
cd BlueBubbles-Desktop-App
npm install
```

##### Optional: In-App GIF keyboard (pre-completed using our API key in our [releases](https://github.com/BlueBubblesApp/BlueBubbles-Desktop-App/releases))

1.) Create a developer account on [GIPHY](https://developers.giphy.com/docs/sdk/).

2.) Create a new SDK app and copy the API key

3.) Using a text editor open the `package.json` file

4.) Under the `scripts` section edit the `build-renderer` line to: 
`cross-env GIPHY_API_KEY=<Copy GIPHY API Key Here> NODE_ENV=production webpack --config webpack.renderer.prod.config.js`

5.) Continue to the compile binary step below


3.) Compile the binary

```bash
npm run dist
```

4.) Your compiled binaries will be located in the release folder

```bash
cd release
```


## Development environment
1.) Clone the repository with Git:

```bash
git clone https://github.com/BlueBubblesApp/BlueBubbles-Desktop-App.git
```

2.) Install the dependencies:

```bash
cd BlueBubbles-Desktop-App
npm install
```

##### Optional: In-App GIF keyboard (Dev only, will not work in build unless you follow the build instructions as well)
1.) Create a developer account on [GIPHY](https://developers.giphy.com/docs/sdk/).

2.) Create a new SDK app and copy the API key

3.) In the base project directory create a new file called `.env`

4.) Add this line to your `.env` file
`GIPHY_API_KEY=<Copy GIPHY API Key Here>`

5.) Continue


3.) Run the project in dev mode
```bash
npm run start-dev
```
