#!/bin/bash

mode="$1"
browser="$2"
device="$3"
visualTesting="$4"
baseUrl="$5"

if [[ -z "$mode" || -z "$browser" || -z "$device" || -z "$visualTesting" ]]; then
  echo ""
  echo "Modes:          Open, Run"
  echo "Browsers:       Chrome, Edge, Electron, Firefox"
  echo "Devices:        all, desktop, mobile"
  echo "VisualTesting:  ci, local"
  echo "BaseUrl:        Optional"
  echo "                Empty (default value): http://localhost:300/"
  echo "Usage:          ./cypress.sh <mode> <browser> <device> <visualTesting> <baseUrl>"
  echo "Example:        ./cypress.sh open chrome desktop local"
  echo ""
  exit 1
fi

if [[ -z "$baseUrl" ]]; then
  baseUrl="http://localhost:3000"
fi

npx cypress "$mode" --e2e --browser "$browser" --env DEVICE="$device",pluginVisualRegressionImagesPath=cypress/visualTesting/"$visualTesting"/,BASEURL="$baseUrl"