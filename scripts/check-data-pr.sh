#!/usr/bin/env bash
set -euo pipefail

head_ref="${1:?usage: check-data-pr.sh <head-ref> <base-ref>}"
base_ref="${2:?usage: check-data-pr.sh <head-ref> <base-ref>}"

case "$head_ref" in
  agent-trains) expected="public/data/trains.json" ;;
  agent-lunch) expected="public/data/lunch.json" ;;
  *)
    echo "unknown data branch $head_ref: only agent-trains and agent-lunch may publish data"
    exit 1
    ;;
esac

changed="$(git diff --name-only --no-renames "$base_ref...HEAD")"
if [ "$changed" != "$expected" ]; then
  listed="${changed//$'\n'/, }"
  echo "$head_ref may change only $expected, it changes: ${listed:-nothing}"
  exit 1
fi

mode="$(git ls-tree HEAD -- "$expected" | cut -d ' ' -f 1)"
if [ "$mode" != "100644" ]; then
  echo "$expected must be a regular file (mode 100644), its mode is ${mode:-missing}"
  exit 1
fi

echo "ok $expected"
