#!/bin/sh
BASENAME=`basename "$0"`
cd /opt/source
echo "Running ${BASENAME}..."

npm install --loglevel verbose
npm run watch

echo "Running ${BASENAME} done."
