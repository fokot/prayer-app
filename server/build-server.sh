#!/usr/bin/env bash

# it will build server for ubuntu 18.04

set -e
set -x

docker run --rm -v $(PWD):/app -w /app fpco/stack-build-small:lts-14 stack build server

