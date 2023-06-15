#!/bin/bash

# ==================================
# アプリのコンテナ再起動スクリプト。
# ==================================

# アプリのコンテナ再起動
echo "アプリのコンテナの再起動を開始します。"

docker compose down
if [[ $HOSTNAME == env-* ]];
then
	COMPOSE_DOCKER_CLI_BUILD=1 docker compose up --build -d
else
	COMPOSE_DOCKER_CLI_BUILD=1 docker compose -f compose-local.yaml up --build -d
fi

if [ $? -ne 0 ]; then
    echo "コンテナの再起動に失敗しました。"
    exit 1
else
    echo "コンテナの再起動に成功しました。"
fi
