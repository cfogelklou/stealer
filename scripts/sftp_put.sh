#!/bin/bash
sftp -o IdentityFile="./id_rsa_sftp" -o "StrictHostKeyChecking=no" -b ./scripts/batchfile_sftp.txt applicaudia.se@ssh.applicaudia.se
