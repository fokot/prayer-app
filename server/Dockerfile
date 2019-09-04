FROM fpco/stack-build-small:lts-14 AS build-env
WORKDIR /app
ADD . /app
RUN cd /app && stack build --copy-bins server
FROM ubuntu:18.04
WORKDIR /app
COPY --from=build-env /root/.local/bin/server .
EXPOSE 3000
ENTRYPOINT ./server
