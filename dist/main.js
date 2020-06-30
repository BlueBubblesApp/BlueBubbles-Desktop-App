/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/main/main.ts":
/*!**************************!*\
  !*** ./src/main/main.ts ***!
  \**************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var reflect_metadata__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! reflect-metadata */ "reflect-metadata");
/* harmony import */ var reflect_metadata__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(reflect_metadata__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! url */ "url");
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _server_index__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @server/index */ "./src/main/server/index.ts");





let win;
const BlueBubbles = new _server_index__WEBPACK_IMPORTED_MODULE_4__["BackendServer"](win);
BlueBubbles.start();

const createWindow = async () => {
  win = new electron__WEBPACK_IMPORTED_MODULE_1__["BrowserWindow"]({
    width: 1200,
    height: 750,
    minWidth: 550,
    minHeight: 300,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (true) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1"; // eslint-disable-line require-atomic-updates

    win.loadURL(`http://localhost:2004`);
  } else {}

  if (true) {
    // Open DevTools, see https://github.com/electron/electron/issues/12438 for why we wait for dom-ready
    win.webContents.once("dom-ready", () => {
      win.webContents.openDevTools();
    });
  }

  win.on("closed", () => {
    win = null;
  });
  win.on("maximize", () => {
    if (win && win.webContents) win.webContents.send("maximized");
  });
  win.on("unmaximize", () => {
    if (win && win.webContents) win.webContents.send("unmaximized");
  });
};

electron__WEBPACK_IMPORTED_MODULE_1__["ipcMain"].handle("minimize-event", () => {
  if (win && win.webContents) win.minimize();
});
electron__WEBPACK_IMPORTED_MODULE_1__["ipcMain"].handle("maximize-event", () => {
  if (win && win.webContents) win.maximize();
});
electron__WEBPACK_IMPORTED_MODULE_1__["ipcMain"].handle("unmaximize-event", () => {
  if (win && win.webContents) win.unmaximize();
});
electron__WEBPACK_IMPORTED_MODULE_1__["ipcMain"].handle("close-event", () => {
  electron__WEBPACK_IMPORTED_MODULE_1__["app"].quit();
  electron__WEBPACK_IMPORTED_MODULE_1__["app"].exit(0);
});
electron__WEBPACK_IMPORTED_MODULE_1__["app"].on("browser-window-focus", () => {
  if (win && win.webContents) win.webContents.send("focused");
});
electron__WEBPACK_IMPORTED_MODULE_1__["app"].on("browser-window-blur", () => {
  if (win && win.webContents) win.webContents.send("blurred");
});
electron__WEBPACK_IMPORTED_MODULE_1__["app"].on("ready", createWindow);
electron__WEBPACK_IMPORTED_MODULE_1__["app"].on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron__WEBPACK_IMPORTED_MODULE_1__["app"].quit();
  }
});
electron__WEBPACK_IMPORTED_MODULE_1__["app"].on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

/***/ }),

/***/ "./src/main/server/constants.ts":
/*!**************************************!*\
  !*** ./src/main/server/constants.ts ***!
  \**************************************/
/*! exports provided: DEFAULT_GENERAL_ITEMS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEFAULT_GENERAL_ITEMS", function() { return DEFAULT_GENERAL_ITEMS; });
const DEFAULT_GENERAL_ITEMS = {
  ngockServer: () => "",
  guid: () => "",
  lastFetch: () => 0
};

/***/ }),

/***/ "./src/main/server/databases/chat/entity/Attachment.ts":
/*!*************************************************************!*\
  !*** ./src/main/server/databases/chat/entity/Attachment.ts ***!
  \*************************************************************/
/*! exports provided: Attachment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Attachment", function() { return Attachment; });
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! typeorm */ "typeorm");
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(typeorm__WEBPACK_IMPORTED_MODULE_0__);
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }


let Attachment = (_dec = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Entity"])(), _dec2 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["PrimaryGeneratedColumn"])(), _dec3 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("text"), _dec4 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("text"), _dec5 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("text"), _dec6 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec7 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec8 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec9 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec10 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec11 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec12 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec13 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec14 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec(_class = (_class2 = (_temp = class Attachment {
  constructor() {
    _initializerDefineProperty(this, "ROWID", _descriptor, this);

    _initializerDefineProperty(this, "guid", _descriptor2, this);

    _initializerDefineProperty(this, "uti", _descriptor3, this);

    _initializerDefineProperty(this, "mimeType", _descriptor4, this);

    _initializerDefineProperty(this, "transferState", _descriptor5, this);

    _initializerDefineProperty(this, "isOutgoing", _descriptor6, this);

    _initializerDefineProperty(this, "transferName", _descriptor7, this);

    _initializerDefineProperty(this, "totalBytes", _descriptor8, this);

    _initializerDefineProperty(this, "isSticker", _descriptor9, this);

    _initializerDefineProperty(this, "hideAttachment", _descriptor10, this);

    _initializerDefineProperty(this, "blurhash", _descriptor11, this);

    _initializerDefineProperty(this, "height", _descriptor12, this);

    _initializerDefineProperty(this, "width", _descriptor13, this);
  }

}, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ROWID", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "guid", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "uti", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "mimeType", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "transferState", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "isOutgoing", [_dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "transferName", [_dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "totalBytes", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "isSticker", [_dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "hideAttachment", [_dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "blurhash", [_dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "height", [_dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class);

/***/ }),

/***/ "./src/main/server/databases/chat/entity/AttachmentMessageJoin.ts":
/*!************************************************************************!*\
  !*** ./src/main/server/databases/chat/entity/AttachmentMessageJoin.ts ***!
  \************************************************************************/
/*! exports provided: AttachmentMessageJoin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AttachmentMessageJoin", function() { return AttachmentMessageJoin; });
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! typeorm */ "typeorm");
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(typeorm__WEBPACK_IMPORTED_MODULE_0__);
var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }


let AttachmentMessageJoin = (_dec = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Entity"])(), _dec2 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["PrimaryGeneratedColumn"])(), _dec3 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec4 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec(_class = (_class2 = (_temp = class AttachmentMessageJoin {
  constructor() {
    _initializerDefineProperty(this, "ROWID", _descriptor, this);

    _initializerDefineProperty(this, "attachmentId", _descriptor2, this);

    _initializerDefineProperty(this, "messageId", _descriptor3, this);
  }

}, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ROWID", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "attachmentId", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "messageId", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class);

/***/ }),

/***/ "./src/main/server/databases/chat/entity/Chat.ts":
/*!*******************************************************!*\
  !*** ./src/main/server/databases/chat/entity/Chat.ts ***!
  \*******************************************************/
/*! exports provided: Chat */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Chat", function() { return Chat; });
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! typeorm */ "typeorm");
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(typeorm__WEBPACK_IMPORTED_MODULE_0__);
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }


let Chat = (_dec = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Entity"])(), _dec2 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Unique"])(["guid"]), _dec3 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["PrimaryGeneratedColumn"])(), _dec4 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("text"), _dec5 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec6 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("text"), _dec7 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec8 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "text",
  nullable: true
}), _dec(_class = _dec2(_class = (_class2 = (_temp = class Chat {
  constructor() {
    _initializerDefineProperty(this, "ROWID", _descriptor, this);

    _initializerDefineProperty(this, "guid", _descriptor2, this);

    _initializerDefineProperty(this, "style", _descriptor3, this);

    _initializerDefineProperty(this, "chatIdentifier", _descriptor4, this);

    _initializerDefineProperty(this, "isArchived", _descriptor5, this);

    _initializerDefineProperty(this, "displayName", _descriptor6, this);
  }

}, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ROWID", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "guid", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "style", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "chatIdentifier", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "isArchived", [_dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "displayName", [_dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class) || _class);

/***/ }),

/***/ "./src/main/server/databases/chat/entity/ChatHandleJoin.ts":
/*!*****************************************************************!*\
  !*** ./src/main/server/databases/chat/entity/ChatHandleJoin.ts ***!
  \*****************************************************************/
/*! exports provided: ChatHandleJoin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChatHandleJoin", function() { return ChatHandleJoin; });
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! typeorm */ "typeorm");
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(typeorm__WEBPACK_IMPORTED_MODULE_0__);
var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }


let ChatHandleJoin = (_dec = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Entity"])(), _dec2 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["PrimaryGeneratedColumn"])(), _dec3 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec4 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec(_class = (_class2 = (_temp = class ChatHandleJoin {
  constructor() {
    _initializerDefineProperty(this, "ROWID", _descriptor, this);

    _initializerDefineProperty(this, "chatId", _descriptor2, this);

    _initializerDefineProperty(this, "handleId", _descriptor3, this);
  }

}, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ROWID", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "chatId", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "handleId", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class);

/***/ }),

/***/ "./src/main/server/databases/chat/entity/ChatMessageJoin.ts":
/*!******************************************************************!*\
  !*** ./src/main/server/databases/chat/entity/ChatMessageJoin.ts ***!
  \******************************************************************/
/*! exports provided: ChatMessageJoin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChatMessageJoin", function() { return ChatMessageJoin; });
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! typeorm */ "typeorm");
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(typeorm__WEBPACK_IMPORTED_MODULE_0__);
var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }


let ChatMessageJoin = (_dec = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Entity"])(), _dec2 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["PrimaryGeneratedColumn"])(), _dec3 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec4 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec(_class = (_class2 = (_temp = class ChatMessageJoin {
  constructor() {
    _initializerDefineProperty(this, "ROWID", _descriptor, this);

    _initializerDefineProperty(this, "chatId", _descriptor2, this);

    _initializerDefineProperty(this, "messageId", _descriptor3, this);
  }

}, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ROWID", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "chatId", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "messageId", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class);

/***/ }),

/***/ "./src/main/server/databases/chat/entity/Handle.ts":
/*!*********************************************************!*\
  !*** ./src/main/server/databases/chat/entity/Handle.ts ***!
  \*********************************************************/
/*! exports provided: Handle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Handle", function() { return Handle; });
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! typeorm */ "typeorm");
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(typeorm__WEBPACK_IMPORTED_MODULE_0__);
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }


let Handle = (_dec = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Entity"])(), _dec2 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Unique"])(["address"]), _dec3 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["PrimaryGeneratedColumn"])(), _dec4 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("text"), _dec5 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "text",
  nullable: true
}), _dec6 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "text",
  nullable: true
}), _dec(_class = _dec2(_class = (_class2 = (_temp = class Handle {
  constructor() {
    _initializerDefineProperty(this, "ROWID", _descriptor, this);

    _initializerDefineProperty(this, "address", _descriptor2, this);

    _initializerDefineProperty(this, "country", _descriptor3, this);

    _initializerDefineProperty(this, "uncanonicalizedId", _descriptor4, this);
  }

}, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ROWID", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "address", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "country", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "uncanonicalizedId", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class) || _class);

/***/ }),

/***/ "./src/main/server/databases/chat/entity/Message.ts":
/*!**********************************************************!*\
  !*** ./src/main/server/databases/chat/entity/Message.ts ***!
  \**********************************************************/
/*! exports provided: Message */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Message", function() { return Message; });
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! typeorm */ "typeorm");
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(typeorm__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _server_databases_chat_entity___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @server/databases/chat/entity/ */ "./src/main/server/databases/chat/entity/index.ts");
/* harmony import */ var _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @server/databases/transformers */ "./src/main/server/databases/transformers/index.ts");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }




let Message = (_dec = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Entity"])(), _dec2 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["PrimaryGeneratedColumn"])(), _dec3 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec4 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("text"), _dec5 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("text"), _dec6 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "text",
  nullable: true
}), _dec7 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "text",
  nullable: true
}), _dec8 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec9 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  nullable: false
}), _dec10 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  nullable: false,
  default: 0
}), _dec11 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  nullable: false,
  default: 0
}), _dec12 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  transformer: _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__["BooleanTransformer"]
}), _dec13 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  transformer: _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__["BooleanTransformer"]
}), _dec14 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  transformer: _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__["BooleanTransformer"]
}), _dec15 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  transformer: _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__["BooleanTransformer"]
}), _dec16 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  transformer: _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__["BooleanTransformer"]
}), _dec17 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  transformer: _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__["BooleanTransformer"]
}), _dec18 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  transformer: _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__["BooleanTransformer"]
}), _dec19 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "text",
  nullable: true
}), _dec20 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  transformer: _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__["BooleanTransformer"],
  default: false
}), _dec21 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec22 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec23 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "text",
  nullable: true
}), _dec24 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("integer"), _dec25 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  transformer: _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__["BooleanTransformer"],
  default: false
}), _dec26 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "text",
  nullable: true
}), _dec27 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "text",
  nullable: false,
  default: 0
}), _dec28 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "text",
  nullable: true
}), _dec29 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  nullable: false,
  default: 0
}), _dec30 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])({
  type: "integer",
  transformer: _server_databases_transformers__WEBPACK_IMPORTED_MODULE_2__["BooleanTransformer"],
  default: false
}), _dec31 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["OneToOne"])(type => _server_databases_chat_entity___WEBPACK_IMPORTED_MODULE_1__["Handle"]), _dec32 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["JoinColumn"])(), _dec(_class = (_class2 = (_temp = class Message {
  constructor() {
    _initializerDefineProperty(this, "ROWID", _descriptor, this);

    _initializerDefineProperty(this, "handleId", _descriptor2, this);

    _initializerDefineProperty(this, "guid", _descriptor3, this);

    _initializerDefineProperty(this, "text", _descriptor4, this);

    _initializerDefineProperty(this, "subject", _descriptor5, this);

    _initializerDefineProperty(this, "country", _descriptor6, this);

    _initializerDefineProperty(this, "error", _descriptor7, this);

    _initializerDefineProperty(this, "dateCreated", _descriptor8, this);

    _initializerDefineProperty(this, "dateRead", _descriptor9, this);

    _initializerDefineProperty(this, "dateDelivered", _descriptor10, this);

    _initializerDefineProperty(this, "isFromMe", _descriptor11, this);

    _initializerDefineProperty(this, "isDelayed", _descriptor12, this);

    _initializerDefineProperty(this, "isAutoReply", _descriptor13, this);

    _initializerDefineProperty(this, "isSystemMessage", _descriptor14, this);

    _initializerDefineProperty(this, "isServiceMessage", _descriptor15, this);

    _initializerDefineProperty(this, "isForward", _descriptor16, this);

    _initializerDefineProperty(this, "isArchived", _descriptor17, this);

    _initializerDefineProperty(this, "cacheRoomnames", _descriptor18, this);

    _initializerDefineProperty(this, "isAudioMessage", _descriptor19, this);

    _initializerDefineProperty(this, "datePlayed", _descriptor20, this);

    _initializerDefineProperty(this, "itemType", _descriptor21, this);

    _initializerDefineProperty(this, "groupTitle", _descriptor22, this);

    _initializerDefineProperty(this, "groupActionType", _descriptor23, this);

    _initializerDefineProperty(this, "isExpired", _descriptor24, this);

    _initializerDefineProperty(this, "associatedMessageGuid", _descriptor25, this);

    _initializerDefineProperty(this, "associatedMessageType", _descriptor26, this);

    _initializerDefineProperty(this, "expressiveSendStyleId", _descriptor27, this);

    _initializerDefineProperty(this, "timeExpressiveSendStyleId", _descriptor28, this);

    _initializerDefineProperty(this, "hasAttachments", _descriptor29, this);

    _initializerDefineProperty(this, "handle", _descriptor30, this);
  }

}, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ROWID", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "handleId", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "guid", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "text", [_dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "subject", [_dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "country", [_dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "error", [_dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "dateCreated", [_dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "dateRead", [_dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "dateDelivered", [_dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "isFromMe", [_dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "isDelayed", [_dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "isAutoReply", [_dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "isSystemMessage", [_dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "isServiceMessage", [_dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "isForward", [_dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "isArchived", [_dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "cacheRoomnames", [_dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "isAudioMessage", [_dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "datePlayed", [_dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "itemType", [_dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "groupTitle", [_dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "groupActionType", [_dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "isExpired", [_dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "associatedMessageGuid", [_dec26], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "associatedMessageType", [_dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "expressiveSendStyleId", [_dec28], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "timeExpressiveSendStyleId", [_dec29], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "hasAttachments", [_dec30], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "handle", [_dec31, _dec32], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class);

/***/ }),

/***/ "./src/main/server/databases/chat/entity/index.ts":
/*!********************************************************!*\
  !*** ./src/main/server/databases/chat/entity/index.ts ***!
  \********************************************************/
/*! exports provided: Attachment, AttachmentMessageJoin, Chat, Handle, ChatHandleJoin, Message, ChatMessageJoin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Attachment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Attachment */ "./src/main/server/databases/chat/entity/Attachment.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Attachment", function() { return _Attachment__WEBPACK_IMPORTED_MODULE_0__["Attachment"]; });

/* harmony import */ var _AttachmentMessageJoin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AttachmentMessageJoin */ "./src/main/server/databases/chat/entity/AttachmentMessageJoin.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AttachmentMessageJoin", function() { return _AttachmentMessageJoin__WEBPACK_IMPORTED_MODULE_1__["AttachmentMessageJoin"]; });

/* harmony import */ var _Chat__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Chat */ "./src/main/server/databases/chat/entity/Chat.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Chat", function() { return _Chat__WEBPACK_IMPORTED_MODULE_2__["Chat"]; });

/* harmony import */ var _Handle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Handle */ "./src/main/server/databases/chat/entity/Handle.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Handle", function() { return _Handle__WEBPACK_IMPORTED_MODULE_3__["Handle"]; });

/* harmony import */ var _ChatHandleJoin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ChatHandleJoin */ "./src/main/server/databases/chat/entity/ChatHandleJoin.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ChatHandleJoin", function() { return _ChatHandleJoin__WEBPACK_IMPORTED_MODULE_4__["ChatHandleJoin"]; });

/* harmony import */ var _Message__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Message */ "./src/main/server/databases/chat/entity/Message.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Message", function() { return _Message__WEBPACK_IMPORTED_MODULE_5__["Message"]; });

/* harmony import */ var _ChatMessageJoin__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ChatMessageJoin */ "./src/main/server/databases/chat/entity/ChatMessageJoin.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ChatMessageJoin", function() { return _ChatMessageJoin__WEBPACK_IMPORTED_MODULE_6__["ChatMessageJoin"]; });










/***/ }),

/***/ "./src/main/server/databases/chat/index.ts":
/*!*************************************************!*\
  !*** ./src/main/server/databases/chat/index.ts ***!
  \*************************************************/
/*! exports provided: ChatRepository */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChatRepository", function() { return ChatRepository; });
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! typeorm */ "typeorm");
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(typeorm__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./entity */ "./src/main/server/databases/chat/entity/index.ts");



class ChatRepository {
  constructor() {
    this.db = null;
    this.db = null;
  }

  async initialize() {
    if (this.db) {
      if (!this.db.isConnected) await this.db.connect();
      return this.db;
    }

    let dbPath = `${electron__WEBPACK_IMPORTED_MODULE_0__["app"].getPath("userData")}/chat.db`;

    if (true) {
      dbPath = `${electron__WEBPACK_IMPORTED_MODULE_0__["app"].getPath("userData")}/BlueBubbles-Desktop-App/chat.db`;
    }

    this.db = await Object(typeorm__WEBPACK_IMPORTED_MODULE_1__["createConnection"])({
      name: "chat",
      type: "sqlite",
      database: dbPath,
      entities: [_entity__WEBPACK_IMPORTED_MODULE_2__["Attachment"], _entity__WEBPACK_IMPORTED_MODULE_2__["AttachmentMessageJoin"], _entity__WEBPACK_IMPORTED_MODULE_2__["Chat"], _entity__WEBPACK_IMPORTED_MODULE_2__["Handle"], _entity__WEBPACK_IMPORTED_MODULE_2__["ChatHandleJoin"], _entity__WEBPACK_IMPORTED_MODULE_2__["Message"], _entity__WEBPACK_IMPORTED_MODULE_2__["ChatMessageJoin"]],
      synchronize: true,
      logging: false
    });
    return this.db;
  }

  static createChatFromResponse(res) {
    const chat = new _entity__WEBPACK_IMPORTED_MODULE_2__["Chat"]();
    chat.guid = res.guid;
    chat.chatIdentifier = res.chatIdentifier;
    chat.displayName = res.displayName;
    chat.isArchived = res.isArchived ? 1 : 0;
    chat.style = res.style;
    return chat;
  }

  static createHandleFromResponse(res) {
    const handle = new _entity__WEBPACK_IMPORTED_MODULE_2__["Handle"]();
    handle.address = res.address;
    handle.country = res.country;
    handle.uncanonicalizedId = res.uncanonicalizedId;
    return handle;
  }

  static createMessageFromResponse(res) {
    var _res$dateCreated, _res$dateRead, _res$dateDelivered, _res$datePlayed, _res$associatedMessag, _res$timeExpressiveSe;

    const message = new _entity__WEBPACK_IMPORTED_MODULE_2__["Message"]();
    message.handleId = res.handleId;
    message.guid = res.guid;
    message.text = res.text;
    message.subject = res.subject;
    message.country = res.country;
    message.error = res.error;
    message.dateCreated = (_res$dateCreated = res.dateCreated) !== null && _res$dateCreated !== void 0 ? _res$dateCreated : 0;
    message.dateRead = (_res$dateRead = res.dateRead) !== null && _res$dateRead !== void 0 ? _res$dateRead : 0;
    message.associatedMessageGuid = res.associatedMessageGuid;
    message.dateDelivered = (_res$dateDelivered = res.dateDelivered) !== null && _res$dateDelivered !== void 0 ? _res$dateDelivered : 0;
    message.isFromMe = res.isFromMe;
    message.isDelayed = res.isDelayed;
    message.isAutoReply = res.isAutoReply;
    message.isSystemMessage = res.isSystemMessage;
    message.isServiceMessage = res.isServiceMessage;
    message.isForward = res.isForward;
    message.isArchived = res.isArchived;
    message.cacheRoomnames = res.cacheRoomnames;
    message.isAudioMessage = res.isAudioMessage;
    message.datePlayed = (_res$datePlayed = res.datePlayed) !== null && _res$datePlayed !== void 0 ? _res$datePlayed : 0;
    message.itemType = res.itemType;
    message.groupTitle = res.groupTitle;
    message.groupActionType = res.groupActionType;
    message.isExpired = res.isExpired;
    message.associatedMessageGuid = res.associatedMessageGuid;
    message.associatedMessageType = (_res$associatedMessag = res.associatedMessageType) !== null && _res$associatedMessag !== void 0 ? _res$associatedMessag : 0;
    message.expressiveSendStyleId = res.expressiveSendStyleId;
    message.timeExpressiveSendStyleId = (_res$timeExpressiveSe = res.timeExpressiveSendStyleId) !== null && _res$timeExpressiveSe !== void 0 ? _res$timeExpressiveSe : 0;
    message.hasAttachments = Object.keys(res).includes("attachments") && res.attachments.length > 0;
    return message;
  }

  async saveChat(chat) {
    const repo = this.db.getRepository(_entity__WEBPACK_IMPORTED_MODULE_2__["Chat"]);
    const existing = chat.ROWID ? chat : await repo.findOne({
      guid: chat.guid
    });

    if (existing) {
      if (existing.displayName !== chat.displayName) {
        // Right now, I don't think anything but the displayName will change
        await repo.update(existing, {
          displayName: chat.displayName
        });
      }

      return existing;
    } // If it doesn't exist, create it


    return repo.save(chat);
  }

  async saveHandle(chat, handle) {
    // Always save the chat first
    const savedChat = await this.saveChat(chat); // Save the handle

    const repo = this.db.getRepository(_entity__WEBPACK_IMPORTED_MODULE_2__["Handle"]);
    const existing = handle.ROWID ? handle : await repo.findOne({
      address: handle.address
    });
    if (existing) return existing; // We don't ever really need to update a handle
    // so only save it when it doesn't exist

    const joinRepo = this.db.getRepository(_entity__WEBPACK_IMPORTED_MODULE_2__["ChatHandleJoin"]);
    const saved = await repo.save(handle); // Create the join table data

    console.log(saved.ROWID);
    console.log(savedChat.ROWID);
    const chj = new _entity__WEBPACK_IMPORTED_MODULE_2__["ChatHandleJoin"]();
    chj.chatId = savedChat.ROWID;
    chj.handleId = saved.ROWID;
    await joinRepo.save(chj); // Return the results

    return saved;
  }

  async saveMessage(chat, message) {
    // Always save the chat first
    const savedChat = await this.saveChat(chat); // Save the handle

    const repo = this.db.getRepository(_entity__WEBPACK_IMPORTED_MODULE_2__["Message"]);
    const existing = message.ROWID ? message : await repo.findOne({
      guid: message.guid
    }); // If it exists, check if anything has really changed before updating

    if (existing) {
      if (existing.dateDelivered !== message.dateDelivered || existing.dateRead !== message.dateRead || existing.error !== message.error || existing.isArchived !== message.isArchived || existing.datePlayed !== message.datePlayed) {
        await repo.update(existing, {
          dateDelivered: message.datePlayed,
          dateRead: message.dateRead,
          error: message.error,
          isArchived: message.isArchived,
          datePlayed: message.datePlayed
        });
      }

      return existing;
    } // We don't ever really need to update a handle
    // so only save it when it doesn't exist


    const joinRepo = this.db.getRepository(_entity__WEBPACK_IMPORTED_MODULE_2__["ChatMessageJoin"]);
    const saved = await repo.save(message); // Create the join table data

    const cmj = new _entity__WEBPACK_IMPORTED_MODULE_2__["ChatMessageJoin"]();
    cmj.chatId = savedChat.ROWID;
    cmj.messageId = saved.ROWID;
    await joinRepo.save(cmj);
    return saved;
  }

}

/***/ }),

/***/ "./src/main/server/databases/config/entity/Config.ts":
/*!***********************************************************!*\
  !*** ./src/main/server/databases/config/entity/Config.ts ***!
  \***********************************************************/
/*! exports provided: Config */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Config", function() { return Config; });
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! typeorm */ "typeorm");
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(typeorm__WEBPACK_IMPORTED_MODULE_0__);
var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _temp;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }


let Config = (_dec = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Entity"])(), _dec2 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["PrimaryColumn"])("text", {
  name: "name"
}), _dec3 = Object(typeorm__WEBPACK_IMPORTED_MODULE_0__["Column"])("text", {
  name: "value",
  nullable: true
}), _dec(_class = (_class2 = (_temp = class Config {
  constructor() {
    _initializerDefineProperty(this, "name", _descriptor, this);

    _initializerDefineProperty(this, "value", _descriptor2, this);
  }

}, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "value", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class);

/***/ }),

/***/ "./src/main/server/databases/config/entity/index.ts":
/*!**********************************************************!*\
  !*** ./src/main/server/databases/config/entity/index.ts ***!
  \**********************************************************/
/*! exports provided: Config */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Config */ "./src/main/server/databases/config/entity/Config.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Config", function() { return _Config__WEBPACK_IMPORTED_MODULE_0__["Config"]; });




/***/ }),

/***/ "./src/main/server/databases/config/index.ts":
/*!***************************************************!*\
  !*** ./src/main/server/databases/config/index.ts ***!
  \***************************************************/
/*! exports provided: ConfigRepository */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfigRepository", function() { return ConfigRepository; });
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! typeorm */ "typeorm");
/* harmony import */ var typeorm__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(typeorm__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./entity */ "./src/main/server/databases/config/entity/index.ts");



class ConfigRepository {
  constructor() {
    this.db = null;
    this.config = void 0;
    this.db = null;
    this.config = {};
  }

  async initialize() {
    if (this.db) {
      if (!this.db.isConnected) await this.db.connect();
      return this.db;
    }

    let dbPath = `${electron__WEBPACK_IMPORTED_MODULE_0__["app"].getPath("userData")}/config.db`;

    if (true) {
      dbPath = `${electron__WEBPACK_IMPORTED_MODULE_0__["app"].getPath("userData")}/BlueBubbles-Desktop-App/config.db`;
    }

    this.db = await Object(typeorm__WEBPACK_IMPORTED_MODULE_1__["createConnection"])({
      name: "config",
      type: "sqlite",
      database: dbPath,
      entities: [_entity__WEBPACK_IMPORTED_MODULE_2__["Config"]],
      synchronize: true,
      logging: false
    }); // Load default config items

    await this.loadConfig();
    return this.db;
  }

  async loadConfig() {
    const repo = this.db.getRepository(_entity__WEBPACK_IMPORTED_MODULE_2__["Config"]);
    const items = await repo.find();

    for (const i of items) this.config[i.name] = ConfigRepository.convertFromDbValue(i.value);
  }
  /**
   * Checks if the config has an item
   *
   * @param name The name of the item to check for
   */


  hasConfigItem(name) {
    return Object.keys(this.config).includes(name);
  }
  /**
   * Retrieves a config item from the cache
   *
   * @param name The name of the config item
   */


  getConfigItem(name) {
    if (!Object.keys(this.config).includes(name)) return null;
    return ConfigRepository.convertFromDbValue(this.config[name]);
  }
  /**
   * Sets a config item in the database
   *
   * @param name The name of the config item
   * @param value The value for the config item
   */


  async setConfigItem(name, value) {
    const saniVal = ConfigRepository.convertToDbValue(value);
    const repo = this.db.getRepository(_entity__WEBPACK_IMPORTED_MODULE_2__["Config"]);
    const item = await repo.findOne({
      name
    });

    if (item) {
      item.value = saniVal;
      await repo.save(item);
    } else {
      await repo.create({
        name,
        value: saniVal
      });
    }

    this.config[name] = saniVal;
  }
  /**
   * Converts a generic string value from the database
   * to its' corresponding correct typed value
   *
   * @param input The value straight from the database
   */


  static convertFromDbValue(input) {
    if (input === "1" || input === "0") return Boolean(Number(input));
    if (!Number.isNaN(input)) return Number(input);
    return input;
  }
  /**
   * Converts a typed database value input to a string.
   *
   * @param input The typed database value
   */


  static convertToDbValue(input) {
    if (typeof input === "boolean") return input ? "1" : "0";
    if (input instanceof Date) return String(input.getTime());
    return String(input);
  }

}

/***/ }),

/***/ "./src/main/server/databases/transformers/BooleanTransformer.ts":
/*!**********************************************************************!*\
  !*** ./src/main/server/databases/transformers/BooleanTransformer.ts ***!
  \**********************************************************************/
/*! exports provided: BooleanTransformer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BooleanTransformer", function() { return BooleanTransformer; });
const BooleanTransformer = {
  from: dbValue => Boolean(dbValue),
  to: entityValue => Number(entityValue)
};

/***/ }),

/***/ "./src/main/server/databases/transformers/index.ts":
/*!*********************************************************!*\
  !*** ./src/main/server/databases/transformers/index.ts ***!
  \*********************************************************/
/*! exports provided: BooleanTransformer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _BooleanTransformer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BooleanTransformer */ "./src/main/server/databases/transformers/BooleanTransformer.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BooleanTransformer", function() { return _BooleanTransformer__WEBPACK_IMPORTED_MODULE_0__["BooleanTransformer"]; });




/***/ }),

/***/ "./src/main/server/fileSystem/index.ts":
/*!*********************************************!*\
  !*** ./src/main/server/fileSystem/index.ts ***!
  \*********************************************/
/*! exports provided: FileSystem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FileSystem", function() { return FileSystem; });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);

class FileSystem {
  constructor() {
    this.attachmentsDir = `Attachments`;
  }

  async setup() {
    this.setupDirectories();
  } // Creates required directories


  setupDirectories() {
    if (!fs__WEBPACK_IMPORTED_MODULE_0__["existsSync"](this.attachmentsDir)) fs__WEBPACK_IMPORTED_MODULE_0__["mkdirSync"](this.attachmentsDir);
  }

}

/***/ }),

/***/ "./src/main/server/index.ts":
/*!**********************************!*\
  !*** ./src/main/server/index.ts ***!
  \**********************************/
/*! exports provided: BackendServer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BackendServer", function() { return BackendServer; });
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _server_databases_config_entity_Config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @server/databases/config/entity/Config */ "./src/main/server/databases/config/entity/Config.ts");
/* harmony import */ var _server_fileSystem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @server/fileSystem */ "./src/main/server/fileSystem/index.ts");
/* harmony import */ var _server_constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @server/constants */ "./src/main/server/constants.ts");
/* harmony import */ var _server_databases_config__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @server/databases/config */ "./src/main/server/databases/config/index.ts");
/* harmony import */ var _server_databases_chat__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @server/databases/chat */ "./src/main/server/databases/chat/index.ts");
/* harmony import */ var _server_services__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @server/services */ "./src/main/server/services/index.ts");

// Config and FileSystem Imports


 // Database Imports


 // Service Imports


class BackendServer {
  constructor(window) {
    this.window = void 0;
    this.db = void 0;
    this.chatRepo = void 0;
    this.configRepo = void 0;
    this.socketService = void 0;
    this.fs = void 0;
    this.hasSetup = void 0;
    this.hasStarted = void 0;
    this.window = window; // Databases

    this.chatRepo = null;
    this.configRepo = null; // Other helpers

    this.fs = null; // Services

    this.socketService = null;
    this.hasSetup = false;
    this.hasStarted = false;
  }
  /**
   * Starts the back-end "server"
   */


  async start() {
    console.log("Starting BlueBubbles Backend...");
    await this.setup();
    await this.startServices();
    console.log("Starting Configuration IPC Listeners...");
    this.startConfigIpcListeners(); // Fetch the chats upon start

    console.log("Syncing initial chats...");
    await this.fetchChats();
  }
  /**
   * Sets up the server by initializing a "filesystem" and other
   * tasks such as setting up the databases and internal services
   */


  async setup() {
    console.log("Performing Setup...");
    await this.initializeDatabases();
    await this.setupDefaults();

    try {
      console.log("Initializing filesystem...");
      this.fs = new _server_fileSystem__WEBPACK_IMPORTED_MODULE_2__["FileSystem"]();
      this.fs.setup();
    } catch (ex) {
      console.log(`!Failed to setup filesystem! ${ex.message}`);
    }

    try {
      console.log("Launching Services..");
      await this.setupServices();
    } catch (ex) {
      console.log("Failed to launch server services.", "error");
    }
  }

  async initializeDatabases() {
    try {
      console.log("Connecting to messaging database...");
      this.chatRepo = new _server_databases_chat__WEBPACK_IMPORTED_MODULE_5__["ChatRepository"]();
      await this.chatRepo.initialize();
    } catch (ex) {
      console.log(`Failed to connect to messaging database! ${ex.message}`);
    }

    try {
      console.log("Connecting to settings database...");
      this.configRepo = new _server_databases_config__WEBPACK_IMPORTED_MODULE_4__["ConfigRepository"]();
      await this.configRepo.initialize();
    } catch (ex) {
      console.log(`Failed to connect to settings database! ${ex.message}`);
    }
  }
  /**
   * Sets up default database values for configuration items
   */


  async setupDefaults() {
    try {
      const repo = this.configRepo.db.getRepository(_server_databases_config_entity_Config__WEBPACK_IMPORTED_MODULE_1__["Config"]);

      for (const key of Object.keys(_server_constants__WEBPACK_IMPORTED_MODULE_3__["DEFAULT_GENERAL_ITEMS"])) {
        const item = await repo.findOne({
          name: key
        });
        if (!item) await this.configRepo.setConfigItem(key, _server_constants__WEBPACK_IMPORTED_MODULE_3__["DEFAULT_GENERAL_ITEMS"][key]());
      }
    } catch (ex) {
      console.log(`Failed to setup default configurations! ${ex.message}`);
    }
  }
  /**
   * Sets up any internal services that need to be instantiated and configured
   */


  async setupServices() {
    if (this.hasSetup) return;

    try {
      console.log("Initializing up sockets...");
      this.socketService = new _server_services__WEBPACK_IMPORTED_MODULE_6__["SocketService"](this.db, this.chatRepo, this.configRepo, this.fs, "http://127.0.0.1:1234", // this.config.server_address,
      "162514cc-d030-4eca-aa4b-119015703645" // this.config.passphrase
      );
    } catch (ex) {
      console.log(`Failed to setup socket service! ${ex.message}`);
    }

    this.hasSetup = true;
  }

  async startServices() {
    if (this.hasStarted === false) {
      console.log("Starting socket service...");
      await this.socketService.start(); // this.log("Starting chat listener...");
      // this.startChatListener();
      // this.startIpcListener();
    }

    this.hasStarted = true;
  }
  /**
   * Fetches chats from the server based on the last time we fetched data.
   * This is what the server itself calls when it is refreshed or reloaded.
   * The front-end _should not_ call this function.
   */


  async fetchChats() {
    const now = new Date();
    const lastFetch = this.configRepo.getConfigItem("lastFetch");
    const chats = await this.socketService.getChats({});
    console.log(`Got ${chats.length} chats from the server. Fetching messages since ${new Date(lastFetch)}`); // Iterate over each chat and fetch their messages

    for (const chat of chats) {
      // First, emit the chat to the front-end
      this.emitToUI("chat", chat); // Second, save the chat to the database

      const chatObj = _server_databases_chat__WEBPACK_IMPORTED_MODULE_5__["ChatRepository"].createChatFromResponse(chat);
      const savedChat = await this.chatRepo.saveChat(chatObj); // Third, save the participants for the chat

      for (const participant of (_chat$participants = chat.participants) !== null && _chat$participants !== void 0 ? _chat$participants : []) {
        var _chat$participants;

        const handle = _server_databases_chat__WEBPACK_IMPORTED_MODULE_5__["ChatRepository"].createHandleFromResponse(participant);
        await this.chatRepo.saveHandle(savedChat, handle);
      } // Build message request params


      const payload = {
        withChats: false
      };

      if (lastFetch) {
        payload.after = lastFetch; // Since we are fetching after a date, we want to get as much as we can

        payload.limit = 1000;
      } // Third, let's fetch the messages from the DB


      const messages = await this.socketService.getChatMessages(chat.guid, payload);
      console.log(`Got ${messages.length} messages for chat, [${chat.displayName || chat.chatIdentifier}] the server.`); // Fourth, let's save the messages to the DB

      for (const message of messages) {
        const msg = _server_databases_chat__WEBPACK_IMPORTED_MODULE_5__["ChatRepository"].createMessageFromResponse(message);
        await this.chatRepo.saveMessage(savedChat, msg);
      } // Lastly, save the attachments (if any)
      // TODO

    } // Save the last fetch date


    const later = new Date();
    console.log(`Finished fetching messages from socket server in [${later.getTime() - now.getTime()} ms].`);
    this.configRepo.setConfigItem("lastFetch", now);
  }

  startIpcListener() {
    electron__WEBPACK_IMPORTED_MODULE_0__["ipcMain"].handle("getChatPrevs", async (event, args) => {
      if (!this.chatRepo.db) return 0; // TODO: Fill this out

      const count = 0; // await this.chatRepo.getChatPrevs();

      return count;
    });
  }

  startConfigIpcListeners() {
    electron__WEBPACK_IMPORTED_MODULE_0__["ipcMain"].handle("set-config", async (event, args) => {
      for (const item of Object.keys(args)) {
        const hasConfig = this.configRepo.hasConfigItem(item);

        if (hasConfig && this.configRepo.getConfigItem(item) !== args[item]) {
          await this.configRepo.setConfigItem(item, args[item]);
        }
      }

      this.emitToUI("config-update", this.configRepo.config);
      return this.configRepo.config;
    });
  }

  emitToUI(event, data) {
    if (this.window) this.window.webContents.send(event, data);
  }

}

/***/ }),

/***/ "./src/main/server/services/index.ts":
/*!*******************************************!*\
  !*** ./src/main/server/services/index.ts ***!
  \*******************************************/
/*! exports provided: SocketService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _socket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./socket */ "./src/main/server/services/socket/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SocketService", function() { return _socket__WEBPACK_IMPORTED_MODULE_0__["SocketService"]; });




/***/ }),

/***/ "./src/main/server/services/socket/index.ts":
/*!**************************************************!*\
  !*** ./src/main/server/services/socket/index.ts ***!
  \**************************************************/
/*! exports provided: SocketService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SocketService", function() { return SocketService; });
/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! socket.io-client */ "socket.io-client");
/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(socket_io_client__WEBPACK_IMPORTED_MODULE_0__);
 // Internal Libraries

class SocketService {
  /**
   * Starts up the initial Socket.IO connection and initializes other
   * required classes and variables
   *
   * @param chatRepo The iMessage database repository
   * @param configRepo The app's settings repository
   * @param fs The filesystem class handler
   * @param serverAddress The server we are connecting to
   * @param passphrase The passphrase to connect to the server
   */
  constructor(db, chatRepo, configRepo, fs, serverAddress, passphrase) {
    this.db = void 0;
    this.socketServer = void 0;
    this.chatRepo = void 0;
    this.configRepo = void 0;
    this.fs = void 0;
    this.serverAddress = void 0;
    this.passphrase = void 0;
    this.db = db;
    this.socketServer = null;
    this.chatRepo = chatRepo;
    this.configRepo = configRepo;
    this.fs = fs;
    this.serverAddress = serverAddress;
    this.passphrase = passphrase;
  }
  /**
   * Sets up the socket listeners
   */


  async start() {
    return new Promise((resolve, reject) => {
      this.socketServer = socket_io_client__WEBPACK_IMPORTED_MODULE_0__(this.serverAddress, {
        query: {
          guid: this.passphrase
        }
      });
      this.socketServer.on("connect", () => {
        console.log("Connected to server via socket.");
        resolve(true);
      });
      this.socketServer.on("disconnect", () => {
        console.log("Disconnected from socket server.");
        reject(new Error("Disconnected from socket."));
      });
    });
  }

  async getChats({
    withParticipants = true
  }) {
    return new Promise((resolve, reject) => {
      this.socketServer.emit("get-chats", {
        withParticipants
      }, res => {
        if ([200, 201].includes(res.status)) {
          resolve(res.data);
        } else {
          reject(res.message);
        }
      });
    });
  }

  async getChatMessages(identifier, {
    offset = 0,
    limit = 25,
    after = null,
    before = null,
    withChats = false,
    sort = "DESC"
  }) {
    return new Promise((resolve, reject) => {
      this.socketServer.emit("get-chat-messages", {
        identifier,
        offset,
        limit,
        after,
        before,
        withChats,
        sort
      }, res => {
        if ([200, 201].includes(res.status)) {
          resolve(res.data);
        } else {
          reject(res.message);
        }
      });
    });
  }

} // import {createConnection, getManager} from "typeorm";
// import {Handle} from "../entities/messaging/Handle";
// import {chatPrevGetAllAction} from "../actions/ChatPrevGetAllAction";
// //Connect to server with socket
// export async function ConnectToServer(url, aGuid){
// }
// createConnection({
//     type: "sqlite",
//     database: "src/main/server/db/messaging.db",
//     entities: [
//         Handle
//     ],
//     synchronize: true,
//     logging: false
// }).then(async connection => {
//     const io = require('socket.io-client')
//     const socket = io("",{
//     query: {
//         guid: ""
//     }
//     })
//     // On Socket Connect
//     socket.on('connect', () => {
//     console.log(socket.connected)
//     const firstAppStartUp = true;
//     if (firstAppStartUp){
//         //Get all chats from server and save locally
//         // initFromServer();
//         GetAllChatsFromServer();
//         console.log("here");
//     } else{
//     }
//     });
//     // let handle = new Handle();
//     // handle.address = "";
//     //Get All Chats
//     function GetAllChatsFromServer() {
//         socket.emit('get-chats',true,(data) => {
//         console.log(data.data[0].participants[0].address);
//         await GetHandle();
//         chatPrevGetAllAction();
//         //Get Handle
//         asyncfunction GetHandle() {
//             let handleRepository = connection.getRepository(Handle);
//             let i;
//             for(i=0; i < Object.keys(data.data).length; i++){
//                 let handle = new Handle();
//                 if(data.data[i].participants[0].address != null) {
//                     handle.address = data.data[i].participants[0].address;
//                 };
//                 if(data.data[i].participants[0].country != null) {
//                     handle.country = data.data[i].participants[0].country;
//                 };
//                 if(data.data[i].participants[0].uncanonicalizedId != null) {
//                     handle.uncanonicalizedId = data.data[i].participants[0].uncanonicalizedId;
//                 } else{
//                     handle.uncanonicalizedId = "X:XX PM";
//                 };
//                 // console.log(handle.address);
//                 try {
//                     // return connection.manager
//                     //             .save(handle)
//                     //             .then(handle => {
//                     //                 console.log("handle has been saved. handle address is", handle.address);
//                     //             });
//                     handleRepository.save(handle);
//                     console.log("Handle saved");
//                 } catch (err){
//                     console.log(err);
//                 }
//             }
//         }
//             return data
//         })
//     }
// }).catch(error => console.log("TypeORM connection error: ", error));
// // const initFromServer = {
// // }
// //Get A Single Chat by guid
// function GetSingleChat(guid){
//     socket.emit("get-chat",{chatGuid: guid}, (data) =>{
//         console.log(data.data)
//         return data.data
//     })
// }
// //Get All Messages In A Chat
// function GetChatMessages(guid){
//     socket.emit("get-chat-messages",{identifier: guid}, (data) =>{
//         console.log(data.data)
//         return data.data
//     })
// }
// //Get Most Recent Message For A Given guid
// function GetMostRecentMessage(guid){
//     socket.emit("get-last-chat-message",{identifier: guid}, (data) =>{
//         console.log(data)
//         return data
//     })
// }
// //Get Attachment By guid
// function GetAttachmentByGUID(guid){
//     socket.emit("get-attatchment",{identifier: guid}, (data) =>{
//         console.log(data)
//         return data
//     })
// }
// //Get Attachment Chunk By guid
// function GetAttachmentChunkByGUID(guid){
//     socket.emit("get-attatchment-chunk",{identifier: guid}, (data) =>{
//         console.log(data)
//         return data
//     })
// }
// //Get Participants In A Chat
// function GetChatParticipants(guid){
//     socket.emit("get-participants",{identifier: guid}, (data) =>{
//         console.log(data)
//         return data
//     })
// }
// //Send A Message
// function SendMessage(chatGuid, myMessage) {
//     socket.emit("send-message",{guid: chatGuid, message: myMessage}, (data) =>{
//         console.log(data)
//         return data
//     })
// }
// //Send A Message With Chunked Attachments
// function SendMessageWithAttachment(guid, myMessage,myAttachmentData){
//     socket.emit("send-message-chunk",{guid: guid, message: myMessage, attachmentData: myAttachmentData}, (data) =>{
//         console.log(data)
//         return data
//     })
// }
// //Start A Chat
// function NewChat(guid, chatParticipants){
//     socket.emit("start-chat",{identifier: guid, participants: chatParticipants}, (data) =>{
//         console.log(data)
//         return data
//     })
// }
// //Rename A Group Chat
// function RenameGroupChat(guid, newGroupName) {
//     socket.emit("rename-group",{identifier: guid, newName: newGroupName}, (data) =>{
//         console.log(data)
//         return data
//     })
// }
// //Add A Participant To Chat
// function AddParticipantToChat(guid, participantAddress){
//     socket.emit("add-participant",{identifier: guid, address: participantAddress}, (data) =>{
//         console.log(data)
//         return data
//     })
// }
// //Remove A Participant To Chat
// function RemoveParticipantToChat(guid, participantAddress){
//     socket.emit("remove-participant",{identifier: guid, address: participantAddress}, (data) =>{
//         console.log(data)
//         return data
//     })
// }
// //Send Reaction (NOT IMPLEMENTED IN SERVER)
// function SendReaction(guid) {
//     socket.emit("send-reaction",{identifier: guid}, (data) =>{
//         console.log(data)
//     })
// }

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "reflect-metadata":
/*!***********************************!*\
  !*** external "reflect-metadata" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("reflect-metadata");

/***/ }),

/***/ "socket.io-client":
/*!***********************************!*\
  !*** external "socket.io-client" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("socket.io-client");

/***/ }),

/***/ "typeorm":
/*!**************************!*\
  !*** external "typeorm" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("typeorm");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ })

/******/ });
//# sourceMappingURL=main.js.map