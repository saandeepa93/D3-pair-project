#!/bin/bash
USERNAME=saandeep
HOSTS="10.247.52.237"
SCRIPT="cd ./dataviz; ls;"
ssh -o StrictHostKeyChecking=no -l ${USERNAME} ${HOSTS} "${SCRIPT}"