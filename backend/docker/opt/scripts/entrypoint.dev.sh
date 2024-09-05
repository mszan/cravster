#!/bin/sh
BASENAME=`basename "$0"`
cd /opt/source
echo "Running ${BASENAME}..."
apt-get update
apt-get install -y postgresql-client
echo "Running 'npm install', be patient please..."
npm install --loglevel verbose
echo "Running 'watch'..."
npm run watch
echo "Running ${BASENAME} done."
