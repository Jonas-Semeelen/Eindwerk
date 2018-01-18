
 /******************************************************************************************** 
 	 THIS FILE HAS BEEN COMPILED FROM TYPESCRIPT SOURCES. 
 	 PLEASE DO NOT MODIFY THIS FILE DIRECTLY AS YOU WILL LOSE YOUR CHANGES WHEN RECOMPILING. 
 	 INSTEAD, EDIT THE TYPESCRIPT SOURCES UNDER THE WWW FOLDER, AND THEN RUN GULP. 
 	 FOR MORE INFORMATION, PLEASE SEE CONTRIBUTING.md. 
 *********************************************************************************************/ 


"use strict";
var storage = window.localStorage;
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LocalPackage = require("./localPackage");
var Package = require("./package");
var NativeAppInfo = require("./nativeAppInfo");
var CodePushUtil = require("./codePushUtil");
var Sdk = require("./sdk");
var RemotePackage = (function (_super) {
    __extends(RemotePackage, _super);
    function RemotePackage() {
        _super.apply(this, arguments);
    }
    RemotePackage.prototype.download = function (successCallback, errorCallback, downloadProgress) {
        var _this = this;
        try {
            CodePushUtil.logMessage("Downloading update");
            if (!this.downloadUrl) {
                CodePushUtil.logMessage("Geen downloadUrl");
                CodePushUtil.invokeErrorCallback(new Error("The remote package does not contain a download URL."), errorCallback);
            }
            else {
                CodePushUtil.logMessage("Wel een downloadUrl: " + this.downloadUrl);
                this.currentFileTransfer = new FileTransfer();
                CodePushUtil.logMessage("file transfer ok");
                var downloadSuccess = function (fileEntry) {
                    CodePushUtil.logMessage("in downloadsucces");

                    _this.currentFileTransfer = null;
                    fileEntry.file(function (file) {
                        NativeAppInfo.isFailedUpdate(_this.packageHash, function (installFailed) {
                            var localPackage = new LocalPackage();
                            localPackage.deploymentKey = _this.deploymentKey;
                            localPackage.description = _this.description;
                            localPackage.label = _this.label;
                            localPackage.appVersion = _this.appVersion;
                            localPackage.isMandatory = _this.isMandatory;
                            localPackage.packageHash = _this.packageHash;
                            localPackage.isFirstRun = false;
                            localPackage.failedInstall = installFailed;
                            localPackage.localPath = fileEntry.toInternalURL();
                            CodePushUtil.logMessage("Package download success: " + JSON.stringify(localPackage));
                            successCallback && successCallback(localPackage);
                            Sdk.reportStatusDownload(localPackage, localPackage.deploymentKey);
                        });
                    }, function (fileError) {
                        CodePushUtil.invokeErrorCallback(new Error("Could not access local package. Error code: " + fileError.code), errorCallback);
                    });
                };
                var downloadError = function (error) {
                    CodePushUtil.logMessage("In de error");
                    CodePushUtil.logMessage(error.body);
                    _this.currentFileTransfer = null;
                    CodePushUtil.invokeErrorCallback(new Error(error.body+" banaan"), errorCallback);
                };
                this.currentFileTransfer.onprogress = function (progressEvent) {
                    if (downloadProgress) {
                        var dp = { receivedBytes: progressEvent.loaded, totalBytes: progressEvent.total };
                        downloadProgress(dp);
                    }
                };
                var auth_options = {
                    "headers" : {
                        "Authorization" : "Bearer " + storage.getItem('access_token')
                    }
                };
                CodePushUtil.logMessage("vlak VOOR de download");
                this.currentFileTransfer.download(this.downloadUrl, cordova.file.dataDirectory + LocalPackage.DownloadDir + "/" + LocalPackage.PackageUpdateFileName, downloadSuccess, downloadError, false, auth_options);
                CodePushUtil.logMessage("vlak NA de download");
            }
        }
        catch (e) {
            CodePushUtil.invokeErrorCallback(new Error("An error occured while downloading the package. " + (e && e.message) ? e.message : ""), errorCallback);
        }
    };
    RemotePackage.prototype.abortDownload = function (abortSuccess, abortError) {
        try {
            if (this.currentFileTransfer) {
                this.currentFileTransfer.abort();
                abortSuccess && abortSuccess();
            }
        }
        catch (e) {
            abortError && abortError(e);
        }
    };
    return RemotePackage;
}(Package));
module.exports = RemotePackage;
