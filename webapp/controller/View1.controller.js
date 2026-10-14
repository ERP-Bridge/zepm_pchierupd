sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
], function (Controller, MessageBox, BusyIndicator) {
    "use strict";

    var i18n;

    return Controller.extend("zepmpchierupd.controller.View1", {

        onInit: function () {
            i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onDownloadTemplate: function () {
            // Download the template file from the OData service based on the selected country key
            var sCountryKey = this.byId("IDCountry").getSelectedKey();

            if (sCountryKey === "") {
                MessageBox.alert(i18n.getText("countrySelect"));
                return;
            }

            var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
            var sUrl = sServiceUrl + "/DataUploadSet('" + sCountryKey + "')/$value";

            window.open(sUrl, "_blank");
        },

        onFilechange: function (oEvent) {
            var files = oEvent.getParameters("files");
            this.files = files;
        },

        handleUploadPress: function (oEvent) {

            var xlsUploader = this.byId("fileUploader");

            if (!this.files || !this.files.files[0]) {
                MessageBox.error(i18n.getText("FileUploadError"));
                return;
            }

            // Submit = X, Simulate = blank
            this.buttonText = oEvent.getSource().getId().search("Submit") > 0 ? "X" : "";

            // Checkbox value
            var sStoreActualVersion =
                this.byId("idSaveActualVersion").getSelected() ? "X" : "";

            // X|filename|X = Save backup
            var slugValue =
                this.buttonText +
                "|" +
                this.files.files[0].name +
                "|" +
                sStoreActualVersion;

            var oHeaderToken = new sap.ui.unified.FileUploaderParameter({
                name: "x-csrf-token",
                value: oEvent.getSource().getModel().getSecurityToken()
            });

            var oHeaderSlug = new sap.ui.unified.FileUploaderParameter({
                name: "slug",
                value: slugValue
            });

            var oContentType = new sap.ui.unified.FileUploaderParameter({
                name: "Content-Type",
                value: this.files.files[0].type || "application/octet-stream"
            });

            xlsUploader.removeAllHeaderParameters();
            xlsUploader.addHeaderParameter(oHeaderToken);
            xlsUploader.addHeaderParameter(oHeaderSlug);
            xlsUploader.addHeaderParameter(oContentType);

            BusyIndicator.show();
            xlsUploader.upload();
        },

        handleUploadComplete: function (oEvent) {

            var xlsUploader = this.byId("fileUploader");
            var sStatus = oEvent.getParameter("status");
            var xmlResponse = $.parseXML(oEvent.getParameter("responseRaw"));

            BusyIndicator.hide();

            var updSuccess = i18n.getText("UploadSuccess");
            var simSuccess = i18n.getText("SimulationSuccess");

            var sMessage = this.buttonText === "X" ? updSuccess : simSuccess;

            if (this.buttonText === "X") {
                xlsUploader.clear();
            }

            if (sStatus >= 200 && sStatus < 300) {

                MessageBox.information(sMessage);

            } else {

                xlsUploader.clear();

                var message =
                    xmlResponse.getElementsByTagName("message")[0].childNodes[0].nodeValue ||
                    i18n.getText("backendError");

                MessageBox.error(message);
            }
        }

    });
});