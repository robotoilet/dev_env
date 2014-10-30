#!/bin/bash

vagrant up
vagrant ssh -c /vagrant/scripts/run_devenv.sh
