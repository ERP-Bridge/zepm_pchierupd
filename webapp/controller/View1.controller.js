sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator"
], (Controller, MessageBox, BusyIndicator) => {
	"use strict";
	var i18n;
	return Controller.extend("zepmpchierupd.controller.View1", {
		onInit() {
			i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		onDownloadTemplate: function () {
			//Dopwnload the template file from the OData service based on the selected country key
			//to get prefilled data until level 5 of the hierarchy. 
			var sCountryKey = this.byId("IDCountry").getSelectedKey();
			if(sCountryKey === ""){
				MessageBox.alert(i18n.getText("countrySelect"));
				return;
			}
			var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			var sUrl = sServiceUrl + "/DataUploadSet('" + sCountryKey + "')/$value"; //sServiceUrl + sEntityPath;
			// Trigger download
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

			//Get the button text to distinguish between simulate and submit actions
			this.buttonText = oEvent.getSource().getId().search("Submit") > 0 ? "X" : " ";
			var slugValue = this.buttonText + "|" + this.files.files[0].name;//this.files.files[0].size + "|" + xlsUploader.getProperty("value") + "|" + buttonText;

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
			var sMessage = this.buttonText === "X" ?  simSuccess : simSuccess;
			if(this.buttonText === "X") {
			xlsUploader.clear();
			}
			if (sStatus >= 200 && sStatus < 300 ) {				
					MessageBox.success(sMessage); 
                    //{ title: this.buttonText === "X" ?  "Upload Success" : "Simulation Success",
                    // details: xmlResponse || ("HTTP Status: " + (sStatus || "Unknown"))
                //});				
				
			} else {
				xlsUploader.clear();
				var message = xmlResponse.getElementsByTagName("message")[0].childNodes[0].nodeValue || i18n.getText("backendError");
				MessageBox.error(message);
			}
		}		

	});
});