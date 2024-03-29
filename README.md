# Fülhaus DesignClipper

>Empowering Designers With Fun and Dangerous Tools!

## Intended Use

This inernal tool is intended to give the Design Team at Fülhaus the ability to add the products directly to the database, making products immediately available for use in the Studio App, in the event that these items are currently unavailable in Fülhaus Studio App catologue.

This tool is not available inside the Chrome Extension Store, as it is not intended for a public audience, and must be uploaded via the provided instructions.  It is only intended to be usable in a Chrome Web Browser, and has no compatibility, currently or planned, for any other browser.

The extension, once installed, can be accessed via the extension menu, and can be toggled on or off by clicking on the extension icon from your toolbar.  You may find it easier to pin the extension to to the toolbar, so that the icon is always visible.

Please note, existing products CANNOT be edited via this app.  


## Relevant Tech

- [Typescript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/)
- [ReactJs](https://react.dev/)
- [vitejs](https://vitejs.dev/)
- [Tailwind](https://www.google.com/search?client=firefox-b-d&q=Tailwind)
- [Fulhaus UI Library](https://bit.dev/fulhaus)
- [Chrome](http://developer.chrome.com/extensions/)



## Available Scripts

To start this project:

1. Configure the component Library registry

    `npm config set '@fulhaus:registry' https://node.bit.cloud`

2. In the project directory, run:

    `npm install --legacy-peer-deps` 
    
 to install dependencies


---------- _Development_ ----------\
`npm run dev` - Starts server in development \
Runs the server in the development mode.\
Open [http://localhost:4001](http://localhost:4001) to see if the app is up and running. \
It will be helpful to frequently use the instructions below to load the extenstion, and verify functionality, as many functions cannot be tested  on local host \
---------- _Development_ ----------\

---------- _Production_ ----------\
`npm run build` - Builds the app for uploading into Chrome\
Builds the app in a suitable format to be uploaded in Chrome.\
---------- _Production_ ----------\



---

## How to load the Clipper Extension

### Extensions can be loaded in unpacked mode by following the following steps:

1. Run npm run build 
2. Visit chrome://extensions (by typing the address in the bar directly, or via omnibox or menu -> Tools -> Extensions).
3. Enable Developer mode by ticking the checkbox in the upper-right corner.
4. Click on the "Load unpacked extension..." button.
5. Select the directory containing your unpacked extension (the folder created during build, called dist) - this is the folder that must be provided to designers wishing to use the app, and must be redistrubuted to the Design Team after any app updates).

### How to Pin Extensions in Chrome

1. Open the Extensions by clicking the puzzle icon next to your profile avatar.
2. A dropdown menu will appear, showing you all of your enabled extensions. Each extension will have a pushpin icon to the right of it.
3. To pin an extension to Chrome, click the pushpin icon so that the icon turns blue. (To unpin an extension, click the pushpin icon so that the icon turns to a gray outline.)

---


#### If the app does not launch after clicking on the icon, please refresh your page and try again, to ensure scripts load correctly.
