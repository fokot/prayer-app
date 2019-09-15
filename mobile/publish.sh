#!/usr/bin/env bash

set -e
set -x

./generate-version.sh

expo publish
