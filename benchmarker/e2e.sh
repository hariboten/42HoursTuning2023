#!/bin/bash

if [[ $HOSTNAME == env-* ]];
then
	BASE_URL="https://${HOSTNAME}.ftt2306.dabaas.net"
else
	BASE_URL="http://host.docker.internal"
fi

# e2eテスト開始
echo "e2eテストを開始します。"

DOCKER_BUILDKIT=1 docker build -f Dockerfile.e2e -t e2e . && \
if [ $GITHUB_ACTIONS ];
then
    docker run --rm --add-host=host.docker.internal:host-gateway \
     --user $UID \
     -e BASE_URL=${BASE_URL} e2e
else
    docker run -it --rm --add-host=host.docker.internal:host-gateway \
     --user $UID \
     -e BASE_URL=${BASE_URL} e2e
fi

if [ $? -ne 0 ]; then
    echo "e2eテストに失敗しました。"
    exit 1
else
    echo "e2eテストに成功しました。"
fi

