#!/usr/bin/env bash

# Sample usage: ./transform.sh shorthandProperties.js ../web-api/api/api_v1/tools
# The above will run 'shorthandProperties.js' on every javascript file in the tools directory, replacing the
# existing file with the transformed file.

transformerScript=$1
sourcePath=$2

tempFile="$(mktemp)";

find "$sourcePath" -name '*.js' -print | while read filePath; do
    node "$transformerScript" < "$filePath" > "$tempFile";
    mv "$tempFile" "$filePath";
done
