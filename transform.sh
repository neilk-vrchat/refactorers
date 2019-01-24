#!/usr/bin/env bash

# Sample usage: ./transform.sh shorthandProperties.js ../web-api/api/api_v1/tools
# The above will run 'shorthandProperties.js' on every javascript file in the tools directory, replacing the
# existing file with the transformed file.

transformerScript=$1
sourcePath=$2

tempFile="$(mktemp)";

warn() { echo "$@" 1>&2; }

fileList="$sourcePath";
if [[ -d $sourcePath ]]; then
  fileList=$(ag -l --js '{' "$sourcePath");
fi

echo "$fileList" | while read filePath; do
    echo "doing $filePath...";
    if node "$transformerScript" < "$filePath" > "$tempFile"; then
        mv "$tempFile" "$filePath";
    else
        warn "Error: $? whilst transforming $filePath";
    fi
done