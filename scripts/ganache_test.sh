#!/usr/bin/env bash

function cleanup {
    kill -9 $ganache_pid
}

trap cleanup EXIT

ganache_pid=`npm run ganache`
echo "Started ganache, pid ${ganache_pid}"

truffle test --network ganache
