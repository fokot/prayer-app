#!/usr/bin/env bash

set -e
set -x

version=$(git show --no-patch --no-notes --pretty='%h %ci' HEAD)

echo "\"$version\"" > ./app/version.json

expo publish
