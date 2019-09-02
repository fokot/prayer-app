FROM ubuntu:16.04
FROM fpco/stack-build-small:lts-14 AS build-env
WORKDIR /app
ADD . /app
RUN cd /app && stack build server
FROM ubuntu:16.04
WORKDIR /app
COPY --from=build-env /app/.stack-work/install/x86_64-linux/*/8.6.5/bin .
EXPOSE 3000
ENTRYPOINT ./server
