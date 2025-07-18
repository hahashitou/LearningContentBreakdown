import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { EditableTable } from "./EditableTable";

SDK.init();

SDK.ready().then(() => {
  const container = document.getElementById("root");
  if (container) {
    ReactDOM.render(<EditableTable />, container);
  }
});

