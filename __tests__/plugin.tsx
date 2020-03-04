import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import {
  cleanup,
  fireEvent,
  render,
  waitForElement
} from "@testing-library/react";
import init from "../src/index";

const consoleError = console.error;
afterEach(() => {
  cleanup();
  console.error = consoleError;
});
